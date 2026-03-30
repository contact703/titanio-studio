import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, Avatar, Input, EmptyState, Loading, ProBadge } from '../../components/social/UIComponents';
import { getFriends, getPendingRequestsReceived, removeFriend, Friend } from '../../services/social/friends';

export default function FriendsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [friendsData, pendingData] = await Promise.all([
        getFriends(),
        getPendingRequestsReceived(),
      ]);
      setFriends(friendsData);
      setFilteredFriends(friendsData);
      setPendingCount(pendingData.length);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setFilteredFriends(friends.filter(f =>
        f.friend?.full_name?.toLowerCase().includes(q) || f.friend?.username?.toLowerCase().includes(q)
      ));
    } else {
      setFilteredFriends(friends);
    }
  }, [searchQuery, friends]);

  const onRefresh = useCallback(() => { setRefreshing(true); loadData(); }, [loadData]);

  const handleRemoveFriend = (friend: Friend) => {
    const friendName = friend.friend?.full_name || 'este usuario';
    Alert.alert('Remover amigo', 'Deseja remover ' + friendName + '?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: async () => {
        const success = await removeFriend(friend.friend_id);
        if (success) {
          setFriends(prev => prev.filter(f => f.friend_id !== friend.friend_id));
        } else {
          Alert.alert('Erro', 'Nao foi possivel remover o amigo');
        }
      }},
    ]);
  };

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => navigation.navigate('UserProfile', { userId: item.friend_id })}
      activeOpacity={0.7}
    >
      <Avatar uri={item.friend?.avatar_url} name={item.friend?.full_name} size={56} />
      <View style={styles.friendInfo}>
        <View style={styles.friendNameRow}>
          <Text style={styles.friendName} numberOfLines={1}>{item.friend?.full_name || 'Usuario'}</Text>
          {item.friend?.is_pro && <ProBadge />}
        </View>
        {item.friend?.daily_status && <Text style={styles.friendStatus} numberOfLines={1}>"{item.friend.daily_status}"</Text>}
        {item.friend?.city && (
          <View style={styles.friendLocation}>
            <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.friendLocationText}>{item.friend.city}</Text>
          </View>
        )}
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity style={styles.friendActionBtn} onPress={() => navigation.navigate('ChatDirect', { friendId: item.friend_id, friendName: item.friend?.full_name })}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.friendActionBtn} onPress={() => handleRemoveFriend(item)}>
          <Ionicons name="person-remove-outline" size={20} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Input placeholder="Buscar amigos..." value={searchQuery} onChangeText={setSearchQuery} icon="search" />
      {pendingCount > 0 && (
        <TouchableOpacity style={styles.pendingAlert} onPress={() => navigation.navigate('FriendRequests')}>
          <View style={styles.pendingIcon}>
            <Ionicons name="person-add" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.pendingText}>{pendingCount} {pendingCount === 1 ? 'pedido pendente' : 'pedidos pendentes'}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      )}
      <Text style={styles.friendsCount}>{filteredFriends.length} {filteredFriends.length === 1 ? 'amigo' : 'amigos'}</Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <Loading />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Amigos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('SearchUsers')}>
          <Ionicons name="person-add-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriendItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            message={searchQuery ? 'Nenhum resultado encontrado' : 'Voce ainda nao tem amigos. Encontre e adicione!'}
            action={!searchQuery ? { label: 'Buscar pessoas', onPress: () => navigation.navigate('SearchUsers') } : undefined}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.text} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 60, 
    paddingBottom: 16 
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  listContent: { flexGrow: 1, paddingBottom: 100 },
  listHeader: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  pendingAlert: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    padding: 14, 
    borderRadius: 12 
  },
  pendingIcon: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    backgroundColor: 'rgba(74, 144, 217, 0.2)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  pendingText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#333' },
  friendsCount: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  friendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    marginHorizontal: 16, 
    marginBottom: 8, 
    backgroundColor: COLORS.card, 
    borderRadius: 16 
  },
  friendInfo: { flex: 1, marginLeft: 14 },
  friendNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  friendName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  friendStatus: { fontSize: 13, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 2 },
  friendLocation: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  friendLocationText: { fontSize: 12, color: COLORS.textMuted, marginLeft: 4 },
  friendActions: { flexDirection: 'row', gap: 8 },
  friendActionBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.border, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
