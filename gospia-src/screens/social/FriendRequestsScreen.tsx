// src/screens/social/FriendRequestsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, Avatar, Button, EmptyState, Loading, ProBadge } from '../../components/social/UIComponents';
import { getPendingRequestsReceived, getPendingRequestsSent, acceptFriendRequest, rejectFriendRequest, cancelFriendRequest, FriendRequest } from '../../services/social/friends';

export default function FriendRequestsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [received, setReceived] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [r, s] = await Promise.all([getPendingRequestsReceived(), getPendingRequestsSent()]);
      setReceived(r);
      setSent(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAccept = async (id: string) => {
    setProcessing(id);
    const ok = await acceptFriendRequest(id);
    if (ok) setReceived(prev => prev.filter(r => r.id !== id));
    else Alert.alert('Erro', 'Não foi possível aceitar');
    setProcessing(null);
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    const ok = await rejectFriendRequest(id);
    if (ok) setReceived(prev => prev.filter(r => r.id !== id));
    setProcessing(null);
  };

  const handleCancel = async (id: string) => {
    Alert.alert('Cancelar?', 'Deseja cancelar este pedido?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: async () => {
        setProcessing(id);
        const ok = await cancelFriendRequest(id);
        if (ok) setSent(prev => prev.filter(r => r.id !== id));
        setProcessing(null);
      }}
    ]);
  };

  const formatDate = (d: string) => {
    const date = new Date(d), now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><Loading fullScreen /></LinearGradient>;

  const data = tab === 'received' ? received : sent;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Pedidos de Amizade</Text>
        <View style={{width:24}} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, tab === 'received' && styles.tabActive]} onPress={() => setTab('received')}>
          <Text style={[styles.tabText, tab === 'received' && styles.tabTextActive]}>Recebidos ({received.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'sent' && styles.tabActive]} onPress={() => setTab('sent')}>
          <Text style={[styles.tabText, tab === 'sent' && styles.tabTextActive]}>Enviados ({sent.length})</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={i => i.id}
        renderItem={({ item }) => {
          const user = tab === 'received' ? item.sender : item.receiver;
          const isProcessing = processing === item.id;
          return (
            <View style={styles.requestItem}>
              <TouchableOpacity style={styles.requestUser} onPress={() => user?.id && navigation.navigate('UserProfile', { userId: user.id })}>
                <Avatar uri={user?.avatar_url} name={user?.full_name} size={50} isPro={user?.is_pro} />
                <View style={styles.requestInfo}>
                  <View style={styles.nameRow}><Text style={styles.requestName}>{user?.full_name || 'Usuário'}</Text>{user?.is_pro && <ProBadge size="small" />}</View>
                  <Text style={styles.requestDate}>{formatDate(item.created_at)}</Text>
                </View>
              </TouchableOpacity>
              {tab === 'received' ? (
                <View style={styles.requestActions}>
                  <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)} disabled={isProcessing}>
                    <Ionicons name="checkmark" size={20} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)} disabled={isProcessing}>
                    <Ionicons name="close" size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)} disabled={isProcessing}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={<EmptyState icon={tab === 'received' ? 'person-add-outline' : 'paper-plane-outline'} title={tab === 'received' ? 'Nenhum pedido' : 'Nenhum enviado'} message={tab === 'received' ? 'Quando receberem pedidos aparecerão aqui' : 'Busque pessoas para adicionar'} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.text} />}
        contentContainerStyle={styles.listContent}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 16, backgroundColor: COLORS.card, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primaryDark },
  tabText: { fontSize: 14, fontWeight: '500', color: COLORS.textSecondary },
  tabTextActive: { color: '#FFF' },
  listContent: { flexGrow: 1, paddingBottom: 100 },
  requestItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.card, borderRadius: 16 },
  requestUser: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  requestInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  requestName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  requestDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  requestActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.success, justifyContent: 'center', alignItems: 'center' },
  rejectBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.error, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.border },
  cancelText: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
});
