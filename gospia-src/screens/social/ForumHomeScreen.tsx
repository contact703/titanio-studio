import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, Avatar, EmptyState, Loading, ProBadge } from '../../components/social/UIComponents';
import { getPosts, togglePostLike, ForumPost } from '../../services/social/forum';
import { getMyProfile } from '../../services/social/friends';

export default function ForumHomeScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isPro, setIsPro] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [allPosts, profile] = await Promise.all([getPosts(), getMyProfile()]);
      setPosts(allPosts);
      setIsPro(profile?.is_pro || false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLike = async (postId: string, e: any) => {
    e.stopPropagation();
    const liked = await togglePostLike(postId);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, user_liked: liked, like_count: Math.max(0, p.like_count + (liked ? 1 : -1)) } : p));
  };

  const handleOpenPost = (postId: string) => {
    console.log('Abrindo post:', postId);
    navigation.navigate('ForumPost', { postId });
  };

  const handleOpenProfile = (userId: string, e: any) => {
    e.stopPropagation();
    navigation.navigate('UserProfile', { userId });
  };

  const formatTime = (d: string) => {
    const date = new Date(d), now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Agora';
    if (diff < 60) return diff + 'min';
    if (diff < 1440) return Math.floor(diff/60) + 'h';
    if (diff < 10080) return Math.floor(diff/1440) + 'd';
    return date.toLocaleDateString('pt-BR');
  };

  const renderPost = ({ item }: { item: ForumPost }) => (
    <TouchableOpacity style={styles.postCard} activeOpacity={0.8} onPress={() => handleOpenPost(item.id)}>
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.authorRow} onPress={(e) => handleOpenProfile(item.author_id, e)}>
          <Avatar uri={item.author?.avatar_url} name={item.author?.full_name} size={40} isPro={item.author?.is_pro} />
          <View style={styles.authorInfo}>
            <View style={styles.authorName}>
              <Text style={styles.authorText}>{item.author?.full_name || 'Usuario'}</Text>
              {item.author?.is_pro && <ProBadge size="small" />}
            </View>
            <Text style={styles.postTime}>{formatTime(item.created_at)}</Text>
          </View>
        </TouchableOpacity>
        {item.is_pinned && <View style={styles.pinnedBadge}><Ionicons name="pin" size={12} color="#FFF" /></View>}
      </View>

      <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>

      {item.image_url && <Image source={{ uri: item.image_url }} style={styles.postImage} resizeMode="cover" />}

      <View style={styles.postStats}>
        <TouchableOpacity style={styles.statBtn} onPress={(e) => handleLike(item.id, e)}>
          <Ionicons name={item.user_liked ? 'heart' : 'heart-outline'} size={20} color={item.user_liked ? '#e74c3c' : COLORS.textSecondary} />
          <Text style={styles.statText}>{item.like_count}</Text>
        </TouchableOpacity>
        <View style={styles.statBtn}>
          <Ionicons name="chatbubble-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.comment_count}</Text>
        </View>
        <View style={styles.statBtn}>
          <Ionicons name="eye-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.view_count}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><Loading fullScreen /></LinearGradient>;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Forum</Text>
        <View style={{width:24}} />
      </View>

      {!isPro && (
        <TouchableOpacity style={styles.proInfo} onPress={() => navigation.navigate('Upgrade')}>
          <Ionicons name="star" size={16} color={COLORS.pro} />
          <Text style={styles.proInfoText}>Seja PRO para criar posts e comentar</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      )}

      <FlatList
        data={posts}
        keyExtractor={(i) => i.id}
        renderItem={renderPost}
        contentContainerStyle={styles.postsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.text} />}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="Nenhum post" message="Seja o primeiro a compartilhar!" />}
      />

      {isPro && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreatePost')}>
          <Ionicons name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  proInfo: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, padding: 12, backgroundColor: COLORS.card, borderRadius: 12 },
  proInfoText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, marginLeft: 8 },
  postsList: { paddingHorizontal: 16, paddingBottom: 100 },
  postCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 16 },
  postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  authorInfo: { marginLeft: 10, flex: 1 },
  authorName: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorText: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  postTime: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  pinnedBadge: { backgroundColor: COLORS.primary, padding: 4, borderRadius: 8 },
  postTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  postContent: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  postImage: { width: '100%', height: 160, borderRadius: 12, marginTop: 12 },
  postStats: { flexDirection: 'row', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  statBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  statText: { fontSize: 13, color: COLORS.textSecondary, marginLeft: 5 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
});
