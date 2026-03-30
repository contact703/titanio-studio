import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, ActivityIndicator, Dimensions, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../components/social/UIComponents';
import { getUserPosts, FeedPost } from '../../services/social/feed';
import { supabase } from '../../lib/supabase';
import { getRelationshipStatus, sendFriendRequest, removeFriend, RelationshipStatus } from '../../services/social/friends';
import ReportButton from '../../components/social/ReportButton';

const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 4) / 3;

export default function UserProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const userId = route.params?.userId;

  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('none');
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserIsPro, setCurrentUserIsPro] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [friendsCount, setFriendsCount] = useState(0);

  useEffect(() => { if (userId) loadData(); else setLoading(false); }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsOwnProfile(user?.id === userId);
      if (user) {
        const { data: currentProfile } = await supabase.from('profiles').select('is_pro').eq('id', user.id).single();
        setCurrentUserIsPro(currentProfile?.is_pro || false);
      }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(profileData);
      const postsData = await getUserPosts(userId);
      
      // Buscar count de amigos do usuario
      const { count: fCount } = await supabase.from('friends').select('*', { count: 'exact', head: true }).eq('user_id', userId);
      setFriendsCount(fCount || 0);
      setPosts(postsData);
      if (user && user.id !== userId) {
        const status = await getRelationshipStatus(userId);
        setRelationshipStatus(status);
      }
    } catch (error) { console.error('Erro:', error); }
    setLoading(false);
  };

  const handleAddFriend = async () => {
    setActionLoading(true);
    const result = await sendFriendRequest(userId);
    if (result.success) {
      setRelationshipStatus('request_sent');
      Alert.alert('Enviado!', 'Pedido de amizade enviado');
    } else {
      Alert.alert('Erro', result.error || 'Nao foi possivel enviar');
    }
    setActionLoading(false);
  };

  const handleRemoveFriend = async () => {
    setShowFriendModal(false);
    setActionLoading(true);
    const success = await removeFriend(userId);
    if (success) {
      setRelationshipStatus('none');
      Alert.alert('Pronto', 'Amizade desfeita');
    } else {
      Alert.alert('Erro', 'Nao foi possivel desfazer a amizade');
    }
    setActionLoading(false);
  };

  const handleFriendButtonPress = () => {
    if (relationshipStatus === 'friends') {
      setShowFriendModal(true);
    }
  };

  const handleMessage = () => {
    if (!currentUserIsPro) {
      Alert.alert('Recurso PRO', 'Enviar mensagens e exclusivo para assinantes PRO.');
      return;
    }
    navigation.navigate('ChatDirect', { friendId: userId, friendName: profile?.full_name });
  };

  const renderGridItem = ({ item }: { item: FeedPost }) => (
    <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate('PostDetail', { postId: item.id })}>
      <Image source={{ uri: item.image_url }} style={styles.gridImage} />
      {item.like_count > 0 && <View style={styles.gridOverlay}><Ionicons name="heart" size={14} color="white" /><Text style={styles.gridOverlayText}>{item.like_count}</Text></View>}
    </TouchableOpacity>
  );

  const renderActionButton = () => {
    if (isOwnProfile) {
      return <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}><Ionicons name="pencil" size={16} color={COLORS.text} /><Text style={styles.editBtnText}>Editar Perfil</Text></TouchableOpacity>;
    }
    return (
      <View style={styles.actionButtons}>
        {relationshipStatus === 'none' && (
          <TouchableOpacity style={styles.addFriendBtn} onPress={handleAddFriend} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator size="small" color="white" /> : <><Ionicons name="person-add" size={18} color="white" /><Text style={styles.addFriendBtnText}>Adicionar</Text></>}
          </TouchableOpacity>
        )}
        {relationshipStatus === 'request_sent' && (
          <View style={styles.pendingBtn}>
            <Ionicons name="time" size={18} color={COLORS.textMuted} />
            <Text style={styles.pendingBtnText}>Pendente</Text>
          </View>
        )}
        {relationshipStatus === 'friends' && (
          <TouchableOpacity style={styles.friendsBtn} onPress={handleFriendButtonPress} disabled={actionLoading}>
            {actionLoading ? <ActivityIndicator size="small" color="white" /> : <><Ionicons name="checkmark-circle" size={18} color="white" /><Text style={styles.friendsBtnText}>Amigos</Text></>}
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.messageBtn, !currentUserIsPro && styles.messageBtnDisabled]} onPress={handleMessage}>
          <Ionicons name="chatbubble" size={18} color={currentUserIsPro ? "white" : COLORS.textMuted} />
          <Text style={[styles.messageBtnText, !currentUserIsPro && styles.messageBtnTextDisabled]}>{currentUserIsPro ? 'Mensagem' : 'PRO'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.profileSection}>
      <View style={styles.profileTop}>
        <View style={styles.avatarContainer}>
          {profile?.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{profile?.full_name?.[0]?.toUpperCase() || '?'}</Text></View>}
          {profile?.is_pro && <View style={styles.proIndicator}><Ionicons name="star" size={12} color="#1a1a1a" /></View>}
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}><Text style={styles.statNumber}>{posts.length}</Text><Text style={styles.statLabel}>posts</Text></View>
          <View style={styles.statItem}><Text style={styles.statNumber}>{friendsCount}</Text><Text style={styles.statLabel}>amigos</Text></View>
        </View>
      </View>
      <View style={styles.profileInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.profileName}>{profile?.full_name || 'Usuario'}</Text>
          {profile?.is_pro && <View style={styles.proBadge}><Text style={styles.proBadgeText}>PRO</Text></View>}
        </View>
        {profile?.bio && <Text style={styles.profileBio}>{profile.bio}</Text>}
        {profile?.city && <Text style={styles.profileLocation}><Ionicons name="location-outline" size={14} color={COLORS.textMuted} /> {profile.city}{profile?.state ? ', ' + profile.state : ''}</Text>}
      </View>
      {renderActionButton()}
    </View>
  );

  if (loading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><View style={[styles.loadingContainer, { paddingTop: insets.top }]}><ActivityIndicator size="large" color={COLORS.text} /></View></LinearGradient>;

  if (!profile) return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={{ width: 44 }} />
      </View>
      <View style={styles.errorContainer}><Ionicons name="person-outline" size={64} color={COLORS.textMuted} /><Text style={styles.errorText}>Usuario nao encontrado</Text></View>
    </LinearGradient>
  );

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{profile.full_name}</Text>
        {!isOwnProfile ? <ReportButton contentType="user" contentId={userId} size={22} color={COLORS.text} /> : <View style={{ width: 44 }} />}
      </View>
      <FlatList data={posts} keyExtractor={(item) => item.id} renderItem={renderGridItem} numColumns={3} ListHeaderComponent={renderHeader} ListEmptyComponent={<View style={styles.emptyContainer}><Ionicons name="camera-outline" size={48} color={COLORS.textMuted} /><Text style={styles.emptyText}>Nenhuma publicacao ainda</Text></View>} contentContainerStyle={{ paddingBottom: 100 }} />

      <Modal visible={showFriendModal} transparent animationType="fade" onRequestClose={() => setShowFriendModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFriendModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalAvatar}>
                {profile?.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={styles.modalAvatarImg} /> : <Text style={styles.modalAvatarText}>{profile?.full_name?.[0]?.toUpperCase() || '?'}</Text>}
              </View>
              <Text style={styles.modalName}>{profile?.full_name}</Text>
            </View>
            <TouchableOpacity style={styles.modalRemoveBtn} onPress={handleRemoveFriend}>
              <Ionicons name="person-remove" size={20} color="#e74c3c" />
              <Text style={styles.modalRemoveText}>Desfazer amizade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowFriendModal(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginHorizontal: 10 },
  profileSection: { backgroundColor: COLORS.card, paddingBottom: 16, marginBottom: 2 },
  profileTop: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 86, height: 86, borderRadius: 43 },
  avatarPlaceholder: { width: 86, height: 86, borderRadius: 43, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: '700', color: COLORS.text },
  proIndicator: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#FFD700', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  statsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  profileInfo: { paddingHorizontal: 16 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  proBadge: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  proBadgeText: { fontSize: 10, fontWeight: '700', color: '#1a1a1a' },
  profileBio: { fontSize: 14, color: COLORS.text, marginTop: 8 },
  profileLocation: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  actionButtons: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 10 },
  addFriendBtn: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  addFriendBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  pendingBtn: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  pendingBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  friendsBtn: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.success, borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  friendsBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  messageBtn: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.pro, borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', gap: 6 },
  messageBtnDisabled: { backgroundColor: COLORS.border },
  messageBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  messageBtnTextDisabled: { color: COLORS.textMuted },
  editBtn: { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 8, paddingVertical: 10, marginHorizontal: 16, marginTop: 12, alignItems: 'center', justifyContent: 'center', gap: 6 },
  editBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  gridItem: { width: GRID_SIZE, height: GRID_SIZE, margin: 0.5, position: 'relative' },
  gridImage: { width: '100%', height: '100%', backgroundColor: COLORS.border },
  gridOverlay: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  gridOverlayText: { fontSize: 12, color: 'white', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: COLORS.card, borderRadius: 20, padding: 24, width: '80%', alignItems: 'center' },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.border, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 12 },
  modalAvatarImg: { width: 64, height: 64 },
  modalAvatarText: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  modalName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalRemoveBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(231,76,60,0.15)', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', justifyContent: 'center', marginBottom: 12 },
  modalRemoveText: { fontSize: 16, fontWeight: '600', color: '#e74c3c' },
  modalCancelBtn: { paddingVertical: 14, paddingHorizontal: 24, width: '100%', alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: COLORS.textMuted },
});


