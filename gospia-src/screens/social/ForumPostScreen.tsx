import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image, Alert, RefreshControl, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { COLORS, Avatar, Card, Loading, ProBadge } from '../../components/social/UIComponents';
import { deletePost, deleteComment } from '../../services/social/forum';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  author?: { id: string; full_name: string; avatar_url: string | null; is_pro: boolean; };
}

interface Post {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  author_id: string;
  category_id: string;
  author?: { id: string; full_name: string; avatar_url: string | null; is_pro: boolean; };
  category?: { name: string; color: string; icon: string; };
}

export default function ForumPostScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { postId } = route.params || {};
  const scrollViewRef = useRef<ScrollView>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    if (postId) { loadCurrentUser(); loadPost(); loadComments(); }
    else { setLoading(false); }
  }, [postId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setCurrentUser(profile);
    }
  };

  const loadPost = async () => {
    if (!postId) { setLoading(false); return; }
    try {
      const { data: postData, error } = await supabase.from('forum_posts').select('*').eq('id', postId).single();
      if (error) throw error;
      if (postData.author_id) {
        const { data: authorData } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', postData.author_id).single();
        postData.author = authorData || undefined;
      }
      if (postData.category_id) {
        const { data: categoryData } = await supabase.from('forum_categories').select('name, color, icon').eq('id', postData.category_id).single();
        postData.category = categoryData || undefined;
      }
      setPost(postData);
      setLikesCount(postData.like_count || 0);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: likeData } = await supabase.from('forum_likes').select('id').eq('post_id', postId).eq('user_id', user.id).single();
        setLiked(!!likeData);
      }
    } catch (error) {
      console.error('Erro ao carregar post:', error);
      Alert.alert('Erro', 'Nao foi possivel carregar o post');
    } finally { setLoading(false); }
  };

  const loadComments = async () => {
    if (!postId) return;
    try {
      const { data, error } = await supabase.from('forum_comments').select('*').eq('post_id', postId).eq('is_hidden', false).order('created_at', { ascending: true });
      if (error) throw error;
      const comms = data || [];
      for (const c of comms) {
        if (c.author_id) {
          const { data: a } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', c.author_id).single();
          c.author = a || undefined;
        }
      }
      setComments(comms);
    } catch (error) { console.error('Erro:', error); }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadPost(), loadComments()]);
    setRefreshing(false);
  }, [postId]);

  const handleLike = async () => {
    if (!currentUser || !postId) return;
    try {
      if (liked) {
        await supabase.from('forum_likes').delete().eq('post_id', postId).eq('user_id', currentUser.id);
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase.from('forum_likes').insert({ post_id: postId, user_id: currentUser.id });
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) { console.error('Erro:', error); }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !currentUser || !postId) return;
    if (!currentUser.is_pro) { Alert.alert('Recurso PRO', 'Comentar e exclusivo para assinantes PRO.'); return; }
    setSending(true);
    try {
      const { error } = await supabase.from('forum_comments').insert({ post_id: postId, author_id: currentUser.id, content: newComment.trim(), is_hidden: false });
      if (error) throw error;
      setNewComment('');
      Keyboard.dismiss();
      loadComments();
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert('Erro', 'Nao foi possivel comentar');
    } finally { setSending(false); }
  };

  const handleDeletePost = () => {
    Alert.alert('Excluir Post', 'Tem certeza que deseja excluir este post?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const success = await deletePost(postId);
        if (success) {
          Alert.alert('Sucesso', 'Post excluido!');
          navigation.goBack();
        } else {
          Alert.alert('Erro', 'Nao foi possivel excluir o post');
        }
      }}
    ]);
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Excluir Comentario', 'Tem certeza que deseja excluir este comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const success = await deleteComment(commentId, postId);
        if (success) {
          setComments(prev => prev.filter(c => c.id !== commentId));
        } else {
          Alert.alert('Erro', 'Nao foi possivel excluir o comentario');
        }
      }}
    ]);
  };

  const handleOpenProfile = (uid: string) => {
    if (uid) navigation.navigate('UserProfile', { userId: uid });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (hours < 1) return 'Agora';
    if (hours < 24) return hours + 'h';
    if (days < 7) return days + 'd';
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 44 }} />
        </View>
        <Loading fullScreen />
      </LinearGradient>
    );
  }

  if (!post) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.errorText}>Post nao encontrado</Text>
        </View>
      </LinearGradient>
    );
  }

  const isPostAuthor = currentUser?.id === post.author_id;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        {isPostAuthor ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePost}><Ionicons name="trash-outline" size={22} color="#e74c3c" /></TouchableOpacity>
        ) : <View style={{ width: 44 }} />}
      </View>

      <ScrollView ref={scrollViewRef} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: keyboardVisible ? 320 : 120 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.text} />} keyboardShouldPersistTaps="handled">
        <Card style={styles.postCard}>
          <TouchableOpacity style={styles.authorRow} onPress={() => handleOpenProfile(post.author_id)} activeOpacity={0.7}>
            <Avatar uri={post.author?.avatar_url} name={post.author?.full_name} size={48} />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{post.author?.full_name || 'Usuario'}</Text>
                {post.author?.is_pro && <ProBadge />}
              </View>
              <Text style={styles.tapHint}>Toque para ver perfil</Text>
            </View>
            {post.category && (
              <View style={[styles.categoryBadge, { backgroundColor: post.category.color || COLORS.primary }]}>
                <Text style={styles.categoryText}>{post.category.name}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>
          {post.image_url && <Image source={{ uri: post.image_url }} style={styles.postImage} resizeMode="cover" />}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statButton} onPress={handleLike}>
              <Ionicons name={liked ? "heart" : "heart-outline"} size={24} color={liked ? '#e74c3c' : COLORS.text} />
              <Text style={styles.statText}>{likesCount}</Text>
            </TouchableOpacity>
            <View style={styles.statButton}>
              <Ionicons name="chatbubble-outline" size={22} color={COLORS.text} />
              <Text style={styles.statText}>{comments.length}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(post.created_at)}</Text>
          </View>
        </Card>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comentarios ({comments.length})</Text>
          {comments.length === 0 ? (
            <Text style={styles.noComments}>Nenhum comentario ainda</Text>
          ) : (
            comments.map((comment) => (
              <Card key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeaderRow}>
                  <TouchableOpacity style={styles.commentHeader} onPress={() => handleOpenProfile(comment.author_id)} activeOpacity={0.7}>
                    <Avatar uri={comment.author?.avatar_url} name={comment.author?.full_name} size={36} />
                    <View style={styles.commentAuthorInfo}>
                      <View style={styles.nameRow}>
                        <Text style={styles.commentAuthorName}>{comment.author?.full_name || 'Usuario'}</Text>
                        {comment.author?.is_pro && <ProBadge />}
                      </View>
                      <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                    </View>
                  </TouchableOpacity>
                  {currentUser?.id === comment.author_id && (
                    <TouchableOpacity onPress={() => handleDeleteComment(comment.id)} style={styles.deleteCommentBtn}>
                      <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <View style={[styles.inputContainer, keyboardVisible && styles.inputContainerKeyboard]}>
        <TextInput style={styles.input} placeholder={currentUser?.is_pro ? "Comentar..." : "Apenas PRO"} placeholderTextColor={COLORS.textMuted} value={newComment} onChangeText={setNewComment} multiline editable={currentUser?.is_pro} />
        <TouchableOpacity style={[styles.sendButton, (!newComment.trim() || sending || !currentUser?.is_pro) && styles.sendButtonDisabled]} onPress={handleComment} disabled={!newComment.trim() || sending || !currentUser?.is_pro}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(231,76,60,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 16 },
  postCard: { margin: 16, padding: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  tapHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryText: { fontSize: 11, color: 'white', fontWeight: '600' },
  postTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  postContent: { fontSize: 16, color: COLORS.textSecondary, lineHeight: 24 },
  postImage: { width: '100%', height: 200, borderRadius: 12, marginTop: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  statButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  statText: { fontSize: 14, color: COLORS.text, marginLeft: 6 },
  dateText: { fontSize: 12, color: COLORS.textMuted, marginLeft: 'auto' },
  commentsSection: { paddingHorizontal: 16 },
  commentsTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  noComments: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginTop: 20 },
  commentCard: { padding: 12, marginBottom: 8 },
  commentHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  commentAuthorInfo: { marginLeft: 10, flex: 1 },
  commentAuthorName: { fontSize: 14, fontWeight: 'bold', color: COLORS.text },
  commentDate: { fontSize: 12, color: COLORS.textMuted },
  commentContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, marginTop: 8 },
  deleteCommentBtn: { padding: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 32, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border },
  inputContainerKeyboard: { paddingBottom: 12 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.text, maxHeight: 100, marginRight: 8 },
  sendButton: { backgroundColor: COLORS.pro, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
});
