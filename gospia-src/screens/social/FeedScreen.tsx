import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../components/social/UIComponents';
import { getFeed, toggleLike, FeedPost } from '../../services/social/feed';
import { supabase } from '../../lib/supabase';
import ReportButton from '../../components/social/ReportButton';

const { width } = Dimensions.get('window');

export default function FeedScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => { loadFeed(); }, []);

  const loadAuthors = async (postsData: FeedPost[]) => {
    const postsWithAuthors = await Promise.all(
      postsData.map(async (post) => {
        if (post.author && post.author.full_name) return post;
        const { data: author } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, is_pro')
          .eq('id', post.author_id)
          .single();
        return { ...post, author: author || undefined };
      })
    );
    return postsWithAuthors;
  };

  const loadFeed = async () => {
    setLoading(true);
    const data = await getFeed(20, 0);
    const postsWithAuthors = await loadAuthors(data);
    setPosts(postsWithAuthors);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await getFeed(20, 0);
    const postsWithAuthors = await loadAuthors(data);
    setPosts(postsWithAuthors);
    setRefreshing(false);
  };

  const loadMore = async () => {
    if (loadingMore || posts.length < 20) return;
    setLoadingMore(true);
    const data = await getFeed(20, posts.length);
    const postsWithAuthors = await loadAuthors(data);
    setPosts([...posts, ...postsWithAuthors]);
    setLoadingMore(false);
  };

  const handleLike = async (postId: string) => {
    const newLiked = await toggleLike(postId);
    setPosts(posts.map(p => p.id === postId ? { ...p, user_liked: newLiked, like_count: newLiked ? p.like_count + 1 : Math.max(0, p.like_count - 1) } : p));
  };

  const handleOpenPost = (post: FeedPost) => navigation.navigate('PostDetail', { postId: post.id });
  const handleOpenProfile = (post: FeedPost) => {
    const userId = post.author_id || post.author?.id;
    if (userId) navigation.navigate('UserProfile', { userId });
  };

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

  const renderPost = ({ item }: { item: FeedPost }) => (
    <View style={styles.postContainer}>
      <TouchableOpacity style={styles.postHeader} onPress={() => handleOpenProfile(item)}>
        <View style={styles.authorAvatar}>
          {item.author?.avatar_url ? (
            <Image source={{ uri: item.author.avatar_url }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{item.author?.full_name?.[0]?.toUpperCase() || '?'}</Text>
          )}
        </View>
        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={styles.authorName}>{item.author?.full_name || 'Carregando...'}</Text>
            {item.author?.is_pro && <View style={styles.proBadge}><Ionicons name="star" size={10} color="#FFD700" /></View>}
          </View>
          {item.location && <Text style={styles.locationText}>{item.location}</Text>}
        </View>
        <ReportButton contentType="post" contentId={item.id} />
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.95} onPress={() => handleOpenPost(item)} onLongPress={() => handleLike(item.id)}>
        <Image source={{ uri: item.image_url }} style={styles.postImage} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.likeRow} onPress={() => handleLike(item.id)}>
        <Ionicons name={item.user_liked ? 'heart' : 'heart-outline'} size={26} color={item.user_liked ? '#e74c3c' : COLORS.text} />
        <Text style={styles.likesText}>{item.like_count} curtidas</Text>
      </TouchableOpacity>

      {item.caption && (
        <TouchableOpacity onPress={() => handleOpenPost(item)}>
          <Text style={styles.captionText} numberOfLines={2}>
            <Text style={styles.captionAuthor}>{item.author?.full_name || ''} </Text>{item.caption}
          </Text>
        </TouchableOpacity>
      )}

      {item.comment_count > 0 && (
        <TouchableOpacity onPress={() => handleOpenPost(item)}>
          <Text style={styles.commentsLink}>Ver {item.comment_count} comentarios</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.timeText}>{formatTime(item.created_at)}</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color={COLORS.text} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Gospia</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('CreateFeedPost')}>
          <Ionicons name="add-circle" size={32} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.text} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footerLoader} color={COLORS.text} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="images-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>Nenhuma publicacao ainda</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('CreateFeedPost')}>
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.emptyBtnText}>Criar Post</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, fontStyle: 'italic' },
  addBtn: { padding: 4 },
  postContainer: { backgroundColor: COLORS.card, marginBottom: 12, paddingBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  authorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 36, height: 36 },
  avatarText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  authorInfo: { flex: 1, marginLeft: 10 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  proBadge: { backgroundColor: 'rgba(255,215,0,0.2)', borderRadius: 8, padding: 2 },
  locationText: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  postImage: { width: width, height: width, backgroundColor: COLORS.border },
  likeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 10, gap: 8 },
  likesText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  captionText: { fontSize: 14, color: COLORS.text, lineHeight: 20, paddingHorizontal: 12, marginTop: 6 },
  captionAuthor: { fontWeight: '600' },
  commentsLink: { fontSize: 14, color: COLORS.textMuted, paddingHorizontal: 12, marginTop: 6 },
  timeText: { fontSize: 11, color: COLORS.textMuted, paddingHorizontal: 12, marginTop: 6 },
  footerLoader: { paddingVertical: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.pro, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 24 },
  emptyBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
