import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../components/social/UIComponents';
import { getPost, getComments, toggleLike, createComment, deletePost, FeedPost, FeedComment } from '../../services/social/feed';
import { supabase } from '../../lib/supabase';
import ReportButton from '../../components/social/ReportButton';

const { width } = Dimensions.get('window');

export default function PostDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { postId } = route.params;

  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => { loadData(); loadCurrentUser(); }, [postId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const loadData = async () => {
    setLoading(true);
    const [postData, commentsData] = await Promise.all([getPost(postId), getComments(postId)]);
    setPost(postData);
    setComments(commentsData);
    setLoading(false);
  };

  const handleLike = async () => {
    if (!post) return;
    const newLiked = await toggleLike(post.id);
    setPost({ ...post, user_liked: newLiked, like_count: newLiked ? post.like_count + 1 : Math.max(0, post.like_count - 1) });
  };

  const handleComment = async () => {
    if (!commentText.trim() || !post) return;
    setPosting(true);
    const result = await createComment(post.id, commentText.trim());
    setPosting(false);
    if (result.success && result.comment) {
      setComments([...comments, result.comment]);
      setPost({ ...post, comment_count: post.comment_count + 1 });
      setCommentText('');
    } else {
      Alert.alert('Erro', result.error || 'Nao foi possivel comentar');
    }
  };

  const handleDeletePost = () => {
    Alert.alert('Excluir Publicacao', 'Tem certeza que deseja excluir esta publicacao?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const success = await deletePost(postId);
        if (success) {
          Alert.alert('Sucesso', 'Publicacao excluida!');
          navigation.goBack();
        } else {
          Alert.alert('Erro', 'Nao foi possivel excluir a publicacao');
        }
      }}
    ]);
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Excluir Comentario', 'Tem certeza que deseja excluir este comentario?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        const { error } = await supabase.from('feed_comments').delete().eq('id', commentId).eq('author_id', currentUserId);
        if (!error) {
          setComments(prev => prev.filter(c => c.id !== commentId));
          if (post) setPost({ ...post, comment_count: Math.max(0, post.comment_count - 1) });
        } else {
          Alert.alert('Erro', 'Nao foi possivel excluir o comentario');
        }
      }}
    ]);
  };

  const handleOpenProfile = (userId: string) => navigation.navigate('UserProfile', { userId });

  const formatTime = (dateString: string) => {
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

  const renderComment = ({ item }: { item: FeedComment }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity onPress={() => handleOpenProfile(item.author_id)}>
        <View style={styles.commentAvatar}>
          {item.author?.avatar_url ? <Image source={{ uri: item.author.avatar_url }} style={styles.commentAvatarImg} /> : <Text style={styles.commentAvatarText}>{item.author?.full_name?.[0]?.toUpperCase() || '?'}</Text>}
        </View>
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <Text style={styles.commentText}><Text style={styles.commentAuthor}>{item.author?.full_name} </Text>{item.content}</Text>
        <Text style={styles.commentTime}>{formatTime(item.created_at)}</Text>
      </View>
      {currentUserId === item.author_id ? (
        <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.deleteCommentBtn}>
          <Ionicons name="trash-outline" size={16} color="#e74c3c" />
        </TouchableOpacity>
      ) : (
        <ReportButton contentType="comment" contentId={item.id} size={16} />
      )}
    </View>
  );

  const isPostAuthor = currentUserId && post && currentUserId === post.author_id;

  const renderHeader = () => {
    if (!post) return null;
    return (
      <View>
        <TouchableOpacity style={styles.postHeader} onPress={() => handleOpenProfile(post.author_id)}>
          <View style={styles.authorAvatar}>
            {post.author?.avatar_url ? <Image source={{ uri: post.author.avatar_url }} style={styles.avatarImg} /> : <Text style={styles.avatarText}>{post.author?.full_name?.[0]?.toUpperCase() || '?'}</Text>}
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{post.author?.full_name || 'Usuario'}</Text>
              {post.author?.is_pro && <View style={styles.proBadge}><Ionicons name="star" size={10} color="#FFD700" /></View>}
            </View>
            {post.location && <Text style={styles.locationText}>{post.location}</Text>}
          </View>
          <ReportButton contentType="post" contentId={post.id} />
        </TouchableOpacity>
        <Image source={{ uri: post.image_url }} style={styles.postImage} />
        <TouchableOpacity style={styles.likeRow} onPress={handleLike}>
          <Ionicons name={post.user_liked ? 'heart' : 'heart-outline'} size={26} color={post.user_liked ? '#e74c3c' : COLORS.text} />
          <Text style={styles.likesText}>{post.like_count} curtidas</Text>
        </TouchableOpacity>
        {post.caption && <Text style={styles.captionText}><Text style={styles.captionAuthor}>{post.author?.full_name} </Text>{post.caption}</Text>}
        <Text style={styles.timeText}>{formatTime(post.created_at)}</Text>
        <View style={styles.commentsDivider}><Text style={styles.commentsTitle}>Comentarios ({post.comment_count})</Text></View>
      </View>
    );
  };

  if (loading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><View style={[styles.loadingContainer, { paddingTop: insets.top }]}><ActivityIndicator size="large" color={COLORS.text} /></View></LinearGradient>;

  if (!post) return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Publicacao</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.errorContainer}><Ionicons name="alert-circle-outline" size={64} color={COLORS.textMuted} /><Text style={styles.errorText}>Publicacao nao encontrada</Text></View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Publicacao</Text>
        {isPostAuthor ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeletePost}><Ionicons name="trash-outline" size={22} color="#e74c3c" /></TouchableOpacity>
        ) : <View style={{ width: 44 }} />}
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView} keyboardVerticalOffset={0}>
        <FlatList data={comments} keyExtractor={(item) => item.id} renderItem={renderComment} ListHeaderComponent={renderHeader} ListEmptyComponent={<View style={styles.noComments}><Text style={styles.noCommentsText}>Nenhum comentario ainda</Text></View>} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false} />
        <View style={[styles.commentInputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <TextInput style={styles.commentInput} placeholder="Comentar... (apenas PRO)" placeholderTextColor={COLORS.textMuted} value={commentText} onChangeText={setCommentText} maxLength={300} multiline />
          <TouchableOpacity style={[styles.sendBtn, (!commentText.trim() || posting) && styles.sendBtnDisabled]} onPress={handleComment} disabled={!commentText.trim() || posting}>
            {posting ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="send" size={20} color="white" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(231,76,60,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.card },
  authorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 36, height: 36 },
  avatarText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  authorInfo: { flex: 1, marginLeft: 10 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  proBadge: { backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: 8, padding: 2 },
  locationText: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  postImage: { width: width, height: width, backgroundColor: COLORS.border },
  likeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: COLORS.card, gap: 8 },
  likesText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  captionText: { fontSize: 14, color: COLORS.text, lineHeight: 20, paddingHorizontal: 12, paddingBottom: 6, backgroundColor: COLORS.card },
  captionAuthor: { fontWeight: '600' },
  timeText: { fontSize: 11, color: COLORS.textMuted, paddingHorizontal: 12, paddingBottom: 12, backgroundColor: COLORS.card },
  commentsDivider: { paddingHorizontal: 12, paddingVertical: 14, borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 12 },
  commentsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  commentItem: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, alignItems: 'flex-start' },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  commentAvatarImg: { width: 32, height: 32 },
  commentAvatarText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  commentContent: { flex: 1, marginLeft: 10 },
  commentText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  commentAuthor: { fontWeight: '600' },
  commentTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  deleteCommentBtn: { padding: 8 },
  noComments: { alignItems: 'center', paddingVertical: 30 },
  noCommentsText: { fontSize: 15, color: COLORS.textMuted },
  commentInputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 10 },
  commentInput: { flex: 1, backgroundColor: COLORS.border, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: COLORS.text, maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.pro, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: COLORS.textMuted },
});
