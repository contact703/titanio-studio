import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, Avatar, Badge, EmptyState, Loading } from '../../components/social/UIComponents';
import { getConversations, subscribeToAllMessages, Conversation } from '../../services/social/messages';
import { getMyProfile, Profile } from '../../services/social/friends';

export default function MessagesListScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [convs, prof] = await Promise.all([getConversations(), getMyProfile()]);
      setConversations(convs);
      setProfile(prof);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    loadData();
    const unsub = subscribeToAllMessages(() => loadData());
    return () => unsub();
  }, [loadData]);

  const formatTime = (d: string | undefined) => {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Agora';
    if (diff < 60) return diff + 'min';
    if (diff < 1440) return Math.floor(diff / 60) + 'h';
    return Math.floor(diff / 1440) + 'd';
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={[styles.convItem, item.unread_count > 0 && styles.convUnread]}
      onPress={() => navigation.navigate('ChatDirect', { friendId: item.friend_id, friendName: item.friend?.full_name })}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrap}>
        <Avatar uri={item.friend?.avatar_url} name={item.friend?.full_name} size={56} />
        {item.unread_count > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.unread_count > 9 ? '9+' : item.unread_count}</Text>
          </View>
        )}
      </View>
      <View style={styles.convInfo}>
        <View style={styles.convHeader}>
          <Text style={[styles.convName, item.unread_count > 0 && styles.convNameBold]}>{item.friend?.full_name || 'Usuario'}</Text>
          {item.last_message_at && <Text style={styles.convTime}>{formatTime(item.last_message_at)}</Text>}
        </View>
        <Text style={[styles.convPreview, item.unread_count > 0 && styles.convPreviewBold]} numberOfLines={1}>
          {item.last_message || 'Nenhuma mensagem'}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerTitle}>Mensagens</Text>
          <View style={{ width: 44 }} />
        </View>
        <EmptyState 
          icon="lock-closed" 
          message="Mensagens diretas sao exclusivas para assinantes PRO!" 
          action={{ label: 'Seja PRO', onPress: () => navigation.navigate('Upgrade') }}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mensagens</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('Friends')}>
          <Ionicons name="create-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(i) => i.friend_id}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState 
            icon="chatbubbles-outline" 
            message="Nenhuma conversa ainda. Adicione amigos para comecar!" 
            action={{ label: 'Ver amigos', onPress: () => navigation.navigate('Friends') }}
          />
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={COLORS.text} />}
        contentContainerStyle={styles.list}
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
  list: { flexGrow: 1, paddingBottom: 100 },
  convItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 14, 
    marginHorizontal: 16, 
    marginBottom: 8, 
    backgroundColor: COLORS.card, 
    borderRadius: 16 
  },
  convUnread: { backgroundColor: 'rgba(255,255,255,0.25)' },
  avatarWrap: { position: 'relative' },
  badge: { 
    position: 'absolute', 
    top: -4, 
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  convInfo: { flex: 1, marginLeft: 14 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  convNameBold: { fontWeight: '700' },
  convTime: { fontSize: 12, color: COLORS.textMuted },
  convPreview: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  convPreviewBold: { color: COLORS.text, fontWeight: '500' },
});
