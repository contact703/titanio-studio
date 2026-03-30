// src/screens/social/NotificationsScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, EmptyState, Loading } from '../../components/social/UIComponents';
import { getNotifications, markAsRead, markAllAsRead, SocialNotification, getNotificationIcon, getNotificationColor, getNotificationRoute } from '../../services/social/notifications';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);

  const loadData = useCallback(async () => {
    try {
      const data = await getNotifications(50);
      setNotifications(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePress = async (notif: SocialNotification) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    const route = getNotificationRoute(notif);
    if (route) navigation.navigate(route.screen, route.params);
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const formatTime = (d: string) => {
    const date = new Date(d), now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Agora';
    if (diff < 60) return `${diff}min`;
    if (diff < 1440) return `${Math.floor(diff/60)}h`;
    return `${Math.floor(diff/1440)}d`;
  };

  if (loading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><Loading fullScreen /></LinearGradient>;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll}><Text style={styles.markAllBtn}>Ler tudo</Text></TouchableOpacity>
        ) : <View style={{width:50}} />}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.notifItem, !item.is_read && styles.notifUnread]} onPress={() => handlePress(item)}>
            <View style={[styles.notifIcon, { backgroundColor: `${getNotificationColor(item.type)}30` }]}>
              <Ionicons name={getNotificationIcon(item.type) as any} size={20} color={getNotificationColor(item.type)} />
            </View>
            <View style={styles.notifContent}>
              <Text style={[styles.notifTitle, !item.is_read && { fontWeight: '700' }]}>{item.title}</Text>
              {item.body && <Text style={styles.notifBody} numberOfLines={2}>{item.body}</Text>}
              <Text style={styles.notifTime}>{formatTime(item.created_at)}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState icon="notifications-outline" title="Nenhuma notificação" message="Quando algo acontecer, você verá aqui!" />}
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
  markAllBtn: { fontSize: 14, fontWeight: '500', color: COLORS.pro },
  listContent: { flexGrow: 1, paddingBottom: 100 },
  notifItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, marginHorizontal: 16, marginBottom: 8, backgroundColor: COLORS.card, borderRadius: 12 },
  notifUnread: { backgroundColor: 'rgba(255,255,255,0.2)' },
  notifIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1, marginLeft: 12 },
  notifTitle: { fontSize: 15, fontWeight: '500', color: COLORS.text },
  notifBody: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  notifTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
});
