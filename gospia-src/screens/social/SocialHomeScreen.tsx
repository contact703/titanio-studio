import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { COLORS, Avatar, Card, Badge, ProBadge, Loading } from '../../components/social/UIComponents';
import { getMyProfile, getFriendsCount, getPendingRequestsReceived, Profile } from '../../services/social/friends';
import { getUnreadCount } from '../../services/social/notifications';
import { getConversations } from '../../services/social/messages';
import { getTrendingPosts, ForumPost } from '../../services/social/forum';
import { getFeed, FeedPost } from '../../services/social/feed';
import { supabase } from '../../lib/supabase';

export default function SocialHomeScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friendsCount, setFriendsCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [trendingPosts, setTrendingPosts] = useState<ForumPost[]>([]);
  const [recentFeed, setRecentFeed] = useState<FeedPost[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
      const [prof, count, pending, notifCount, convs, trending, feedPosts] = await Promise.all([
        getMyProfile(), getFriendsCount(), getPendingRequestsReceived(), getUnreadCount(),
        getConversations(), getTrendingPosts(3), getFeed(6, 0)
      ]);
      setProfile(prof);
      setFriendsCount(count);
      setPendingRequests(pending.length);
      setUnreadNotifications(notifCount);
      setUnreadMessages(convs.reduce((acc, c) => acc + c.unread_count, 0));
      setTrendingPosts(trending);
      setRecentFeed(feedPosts);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const QuickAction = ({ icon, label, onPress, badge, isPro }: any) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickIconWrap}>
        <Ionicons name={icon} size={26} color={COLORS.text} />
        {badge > 0 && <View style={styles.quickBadge}><Text style={styles.quickBadgeText}>{badge > 9 ? '9+' : badge}</Text></View>}
        {isPro && <View style={styles.proBadgeSmall}><Ionicons name="star" size={8} color="#FFF" /></View>}
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const handleOpenMyProfile = () => { if (currentUserId) navigation.navigate('UserProfile', { userId: currentUserId }); };
  const handleOpenForumPost = (postId: string) => navigation.navigate('ForumPost', { postId });

  if (loading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><Loading fullScreen /></LinearGradient>;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidade</Text>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={26} color={COLORS.text} />
          {unreadNotifications > 0 && <Badge count={unreadNotifications} size="small" style={styles.notifBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.text} />}>

        <Card style={styles.profileCard}>
          <TouchableOpacity style={styles.profileRow} onPress={handleOpenMyProfile}>
            <Avatar uri={profile?.avatar_url} name={profile?.full_name} size={56} isPro={profile?.is_pro} />
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{profile?.full_name || 'Usuario'}</Text>
                {profile?.is_pro && <ProBadge />}
              </View>
              {profile?.daily_status ? (
                <Text style={styles.profileStatus} numberOfLines={1}>"{profile.daily_status}"</Text>
              ) : (
                <Text style={styles.profileStatusEmpty}>Toque para ver seu perfil</Text>
              )}
              <Text style={styles.friendsCount}>{friendsCount} amigos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </Card>

        {pendingRequests > 0 && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate('FriendRequests')}>
            <View style={styles.alertIcon}><Ionicons name="person-add" size={18} color="#FFF" /></View>
            <Text style={styles.alertText}>{pendingRequests} pedido{pendingRequests > 1 ? 's' : ''} de amizade</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.text} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Acesso Rapido</Text>
        <View style={styles.quickGrid}>
          <QuickAction icon="images" label="Feed" onPress={() => navigation.navigate('Feed')} />
          <QuickAction icon="people" label="Amigos" badge={pendingRequests} onPress={() => navigation.navigate('Friends')} />
          <QuickAction icon="chatbubbles" label="Mensagens" badge={unreadMessages} isPro={!profile?.is_pro} onPress={() => navigation.navigate('Messages')} />
          <QuickAction icon="newspaper" label="Forum" onPress={() => navigation.navigate('ForumHome')} />
          <QuickAction icon="search" label="Buscar" onPress={() => navigation.navigate('SearchUsers')} />
          <QuickAction icon="notifications" label="Alertas" badge={unreadNotifications} onPress={() => navigation.navigate('Notifications')} />
        </View>

        {recentFeed.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Feed de Fotos</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Feed')}><Text style={styles.seeAll}>Ver tudo</Text></TouchableOpacity>
            </View>
            <View style={styles.feedGrid}>
              {recentFeed.slice(0, 3).map(post => (
                <TouchableOpacity key={post.id} style={styles.feedGridItem} onPress={() => navigation.navigate('PostDetail', { postId: post.id })}>
                  <Image source={{ uri: post.image_url }} style={styles.feedGridImage} />
                  <View style={styles.feedGridOverlay}>
                    <Ionicons name="heart" size={12} color="white" />
                    <Text style={styles.feedGridLikes}>{post.like_count}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.createPostBtn} onPress={() => navigation.navigate('CreateFeedPost')}>
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.createPostBtnText}>Publicar Foto</Text>
            </TouchableOpacity>
          </>
        )}

        {recentFeed.length === 0 && (
          <Card style={styles.emptyFeedCard}>
            <Ionicons name="images-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyFeedTitle}>Feed de Fotos</Text>
            <Text style={styles.emptyFeedText}>Compartilhe momentos com a comunidade!</Text>
            <TouchableOpacity style={styles.emptyFeedBtn} onPress={() => navigation.navigate('CreateFeedPost')}>
              <Ionicons name="add" size={18} color="white" />
              <Text style={styles.emptyFeedBtnText}>Criar Publicacao</Text>
            </TouchableOpacity>
          </Card>
        )}

        {trendingPosts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Em Alta no Forum</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ForumHome')}><Text style={styles.seeAll}>Ver tudo</Text></TouchableOpacity>
            </View>
            {trendingPosts.map(post => (
              <TouchableOpacity key={post.id} style={styles.trendingCard} onPress={() => handleOpenForumPost(post.id)} activeOpacity={0.7}>
                <View style={styles.trendingHeader}>
                  <Avatar uri={post.author?.avatar_url} name={post.author?.full_name} size={32} />
                  <Text style={styles.trendingAuthor}>{post.author?.full_name}</Text>
                </View>
                <Text style={styles.trendingTitle} numberOfLines={2}>{post.title}</Text>
                <View style={styles.trendingStats}>
                  <Ionicons name="heart" size={14} color="#e74c3c" />
                  <Text style={styles.trendingStat}>{post.like_count}</Text>
                  <Ionicons name="chatbubble" size={14} color={COLORS.textMuted} style={{marginLeft: 12}} />
                  <Text style={styles.trendingStat}>{post.comment_count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {!profile?.is_pro && (
          <TouchableOpacity style={styles.proBanner} onPress={() => navigation.navigate('Upgrade')}>
            <View style={styles.proBannerIcon}><Ionicons name="star" size={24} color={COLORS.pro} /></View>
            <View style={styles.proBannerInfo}>
              <Text style={styles.proBannerTitle}>Seja PRO</Text>
              <Text style={styles.proBannerDesc}>Mensagens, forum e mais!</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
          </TouchableOpacity>
        )}

        <View style={{height: 100}} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  notifBtn: { position: 'relative', padding: 4 },
  notifBadge: { position: 'absolute', top: -2, right: -2 },
  content: { paddingHorizontal: 16 },
  profileCard: { marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { flex: 1, marginLeft: 14 },
  profileNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  profileStatus: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },
  profileStatusEmpty: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  friendsCount: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  alertBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(231,76,60,0.15)', borderRadius: 12, padding: 12, marginBottom: 16 },
  alertIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e74c3c', justifyContent: 'center', alignItems: 'center' },
  alertText: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text, marginLeft: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 12 },
  seeAll: { fontSize: 14, fontWeight: '600', color: COLORS.pro },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  quickAction: { width: '31%', alignItems: 'center', marginBottom: 16 },
  quickIconWrap: { width: 54, height: 54, borderRadius: 16, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  quickBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#e74c3c', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  quickBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  proBadgeSmall: { position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.pro, justifyContent: 'center', alignItems: 'center' },
  quickLabel: { fontSize: 12, color: COLORS.text, textAlign: 'center', fontWeight: '500' },
  feedGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  feedGridItem: { width: '32%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  feedGridImage: { width: '100%', height: '100%', backgroundColor: COLORS.border },
  feedGridOverlay: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, gap: 4 },
  feedGridLikes: { fontSize: 11, color: 'white', fontWeight: '600' },
  createPostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.pro, borderRadius: 12, paddingVertical: 14, gap: 8, marginBottom: 16 },
  createPostBtnText: { color: 'white', fontSize: 15, fontWeight: '700' },
  emptyFeedCard: { alignItems: 'center', paddingVertical: 24, marginBottom: 16 },
  emptyFeedTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  emptyFeedText: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  emptyFeedBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.pro, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: 16 },
  emptyFeedBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  trendingCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12 },
  trendingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  trendingAuthor: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginLeft: 10 },
  trendingTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 8, lineHeight: 20 },
  trendingStats: { flexDirection: 'row', alignItems: 'center' },
  trendingStat: { fontSize: 13, color: COLORS.textMuted, marginLeft: 4 },
  proBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.15)', borderRadius: 16, padding: 16, marginTop: 8 },
  proBannerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,215,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  proBannerInfo: { flex: 1, marginLeft: 12 },
  proBannerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.pro },
  proBannerDesc: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
