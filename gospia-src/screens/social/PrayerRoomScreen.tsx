import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, Avatar, Loading } from '../../components/social/UIComponents';
import { getRoom, getRoomMessages, sendRoomMessage, getRoomMembers, leaveRoom, subscribeToRoom, PrayerRoom, PrayerRoomMessage, PrayerRoomMember } from '../../services/social/prayerRooms';
import { moderateText } from '../../services/social/media';
import { supabase } from '../../lib/supabase';
import { VideoCallButton } from '../../components/social/VideoCallButton';

export default function PrayerRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { roomId, roomName } = route.params;
  const listRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<PrayerRoom | null>(null);
  const [messages, setMessages] = useState<PrayerRoomMessage[]>([]);
  const [members, setMembers] = useState<PrayerRoomMember[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMyId(user?.id || null);

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setUserProfile(profile);
    }

    const [r, msgs, mems] = await Promise.all([getRoom(roomId), getRoomMessages(roomId), getRoomMembers(roomId)]);
    setRoom(r);
    setMessages(msgs);
    setMembers(mems);
    setLoading(false);
  }, [roomId]);

  useEffect(() => {
    loadData();
    const unsub = subscribeToRoom(roomId, (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => unsub();
  }, [roomId, loadData]);

  const handleSend = async (type: 'text' | 'prayer_request' = 'text') => {
    const content = type === 'prayer_request' ? (text.trim() || 'Ore por mim') : text.trim();
    if (!content && type === 'text') return;

    const modResult = moderateText(content);
    if (!modResult.safe) {
      Alert.alert('Mensagem nao permitida', modResult.reason || 'Conteudo inapropriado');
      return;
    }

    setText('');
    setSending(true);
    const result = await sendRoomMessage(roomId, content, type);
    if (result.success && result.message) {
      setMessages(prev => [...prev, result.message!]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
    setSending(false);
  };

  const handleLeave = () => {
    Alert.alert('Sair da sala?', 'Voce pode entrar novamente depois.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => {
        await leaveRoom(roomId);
        navigation.goBack();
      }}
    ]);
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + mins;
  };

  const renderMessage = ({ item }: { item: PrayerRoomMessage }) => {
    const isMe = item.sender_id === myId;
    const isSystem = item.message_type === 'system';
    const isPrayer = item.message_type === 'prayer_request';

    if (isSystem) {
      return (
        <View style={styles.systemMsg}>
          <Text style={styles.systemMsgText}>{item.content}</Text>
        </View>
      );
    }

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
        {!isMe && <Avatar uri={item.sender?.avatar_url} name={item.sender?.full_name} size={32} />}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther, isPrayer && styles.bubblePrayer]}>
          {!isMe && <Text style={styles.senderName}>{item.sender?.full_name || 'Usuario'}</Text>}
          {isPrayer && (
            <View style={styles.prayerHeader}>
              <Ionicons name="hand-left" size={14} color="#9b59b6" />
              <Text style={styles.prayerLabel}>Pedido de Oracao</Text>
            </View>
          )}
          <Text style={[styles.msgText, isMe && { color: '#FFF' }]}>{item.content}</Text>
          <Text style={[styles.msgTime, isMe && { color: 'rgba(255,255,255,0.7)' }]}>{formatTime(item.created_at)}</Text>
        </View>
      </View>
    );
  };

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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{room?.name || roomName}</Text>
          <Text style={styles.headerSub}>{members.length}/{room?.max_members || 5} participantes</Text>
        </View>

        <VideoCallButton
          roomId={roomId}
          roomName={room?.name || roomName}
          userId={myId || ''}
          displayName={userProfile?.full_name || userProfile?.username || 'Usuario'}
          email={userProfile?.email}
          avatarUrl={userProfile?.avatar_url}
          isPro={userProfile?.is_pro || false}
          maxParticipants={room?.max_members || 5}
          size="small"
          showParticipantCount={true}
        />

        <TouchableOpacity style={styles.exitBtn} onPress={handleLeave}>
          <Ionicons name="exit-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.membersBar}>
        {members.slice(0, 5).map(m => (
          <View key={m.user_id} style={styles.memberAvatar}>
            <Avatar uri={m.user?.avatar_url} name={m.user?.full_name} size={36} />
          </View>
        ))}
        {members.length === 0 && <Text style={styles.noMembers}>Aguardando participantes...</Text>}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="hand-left" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyChatText}>Comece a oracao!</Text>
              <Text style={styles.emptyChatSub}>Envie uma mensagem ou pedido de oracao</Text>
            </View>
          }
        />

        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.prayerBtn} onPress={() => handleSend('prayer_request')} disabled={sending}>
            <Ionicons name="hand-left" size={22} color="#9b59b6" />
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput 
              style={styles.input} 
              placeholder="Mensagem ou pedido..." 
              placeholderTextColor={COLORS.textMuted} 
              value={text} 
              onChangeText={setText} 
              multiline 
              maxLength={500} 
            />
          </View>
          <TouchableOpacity 
            style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.5 }]} 
            onPress={() => handleSend('text')} 
            disabled={!text.trim() || sending}
          >
            <Ionicons name="send" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 60, 
    paddingBottom: 12 
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted },
  exitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  membersBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingBottom: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  memberAvatar: { marginRight: 8 },
  noMembers: { fontSize: 14, color: COLORS.textMuted, fontStyle: 'italic' },
  msgList: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyChatText: { fontSize: 18, fontWeight: '600', color: COLORS.text, marginTop: 16 },
  emptyChatSub: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginLeft: 8 },
  bubbleMe: { backgroundColor: COLORS.primaryDark, borderBottomRightRadius: 4, marginLeft: 0 },
  bubbleOther: { backgroundColor: COLORS.card, borderBottomLeftRadius: 4 },
  bubblePrayer: { backgroundColor: 'rgba(155,89,182,0.2)', borderWidth: 1, borderColor: '#9b59b6' },
  senderName: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 4 },
  prayerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  prayerLabel: { fontSize: 12, fontWeight: '600', color: '#9b59b6', marginLeft: 6 },
  msgText: { fontSize: 15, color: COLORS.text, lineHeight: 20 },
  msgTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  systemMsg: { alignItems: 'center', marginVertical: 8 },
  systemMsgText: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    paddingBottom: Platform.OS === 'ios' ? 32 : 12, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border 
  },
  prayerBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.card, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 8 
  },
  inputWrap: { 
    flex: 1, 
    backgroundColor: COLORS.card, 
    borderRadius: 22, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    maxHeight: 100 
  },
  input: { fontSize: 16, color: COLORS.text, maxHeight: 80 },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.primaryDark, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 8 
  },
});
