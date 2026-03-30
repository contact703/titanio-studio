import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, Card, EmptyState, Loading } from '../../components/social/UIComponents';
import { getPublicRooms, getMyRooms, createRoom, joinRoom, PrayerRoom } from '../../services/social/prayerRooms';
import { getMyProfile, Profile } from '../../services/social/friends';

export default function PrayerRoomsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'public' | 'my'>('public');
  const [publicRooms, setPublicRooms] = useState<PrayerRoom[]>([]);
  const [myRooms, setMyRooms] = useState<PrayerRoom[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [pub, my, p] = await Promise.all([getPublicRooms(), getMyRooms(), getMyProfile()]);
      setPublicRooms(pub);
      setMyRooms(my);
      setProfile(p);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!newRoom.name.trim()) {
      Alert.alert('Erro', 'Nome e obrigatorio');
      return;
    }
    setCreating(true);
    const result = await createRoom(newRoom.name, newRoom.description);
    setCreating(false);
    if (result.success && result.room) {
      setShowCreate(false);
      setNewRoom({ name: '', description: '' });
      navigation.navigate('PrayerRoom', { roomId: result.room.id, roomName: result.room.name });
    } else {
      Alert.alert('Erro', result.error || 'Nao foi possivel criar');
    }
  };

  const handleJoin = async (room: PrayerRoom) => {
    const result = await joinRoom(room.id);
    if (result.success) {
      navigation.navigate('PrayerRoom', { roomId: room.id, roomName: room.name });
    } else {
      Alert.alert('Erro', result.error || 'Nao foi possivel entrar');
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <Loading />
      </LinearGradient>
    );
  }

  if (!profile?.is_pro) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Salas de Oracao</Text>
          <View style={{width: 44}} />
        </View>
        <EmptyState 
          icon="lock-closed" 
          message="Salas de oracao sao exclusivas para assinantes PRO!" 
          action={{ label: 'Seja PRO', onPress: () => navigation.navigate('Upgrade') }}
        />
      </LinearGradient>
    );
  }

  const data = tab === 'public' ? publicRooms : myRooms;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Salas de Oracao</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add-circle-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'public' && styles.tabActive]} onPress={() => setTab('public')}>
          <Text style={[styles.tabText, tab === 'public' && styles.tabTextActive]}>Publicas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'my' && styles.tabActive]} onPress={() => setTab('my')}>
          <Text style={[styles.tabText, tab === 'my' && styles.tabTextActive]}>Minhas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomCard} onPress={() => handleJoin(item)} activeOpacity={0.7}>
            <View style={styles.roomHeader}>
              <View style={styles.roomIcon}>
                <Ionicons name="hand-left" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>{item.name}</Text>
                <Text style={styles.roomMeta}>{item.member_count || 0}/{item.max_members} pessoas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </View>
            {item.description && <Text style={styles.roomDesc} numberOfLines={2}>{item.description}</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState 
            icon="hand-left-outline" 
            message={tab === 'public' ? 'Nenhuma sala publica disponivel' : 'Voce nao esta em nenhuma sala'} 
          />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.text} />
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={showCreate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Criar Sala de Oracao</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="Nome da sala" 
              placeholderTextColor="#999" 
              value={newRoom.name} 
              onChangeText={v => setNewRoom(r => ({...r, name: v}))} 
            />
            <TextInput 
              style={[styles.modalInput, {height: 80, textAlignVertical: 'top'}]} 
              placeholder="Descricao (opcional)" 
              placeholderTextColor="#999" 
              value={newRoom.description} 
              onChangeText={v => setNewRoom(r => ({...r, description: v}))} 
              multiline 
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowCreate(false)}>
                <Text style={{color: '#666'}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreate} onPress={handleCreate} disabled={creating}>
                <Text style={{color: '#FFF', fontWeight: '600'}}>{creating ? 'Criando...' : 'Criar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  tabs: { 
    flexDirection: 'row', 
    marginHorizontal: 16, 
    marginBottom: 16, 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    padding: 4 
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primaryDark },
  tabText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFF' },
  listContent: { flexGrow: 1, paddingHorizontal: 16, paddingBottom: 100 },
  roomCard: { 
    backgroundColor: COLORS.card, 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roomHeader: { flexDirection: 'row', alignItems: 'center' },
  roomIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: 'rgba(74, 144, 217, 0.3)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  roomInfo: { flex: 1, marginLeft: 12 },
  roomName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  roomMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  roomDesc: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 16 },
  modalInput: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 12 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 20 },
  modalCreate: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: COLORS.primaryDark, borderRadius: 8 },
});
