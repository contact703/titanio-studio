import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { COLORS, Avatar, Loading } from '../../components/social/UIComponents';
import { getMessages, sendMessage, subscribeToMessages, DirectMessage } from '../../services/social/messages';
import { getProfile, Profile } from '../../services/social/friends';
import { moderateText, pickImage, uploadWithModeration } from '../../services/social/media';
import { supabase } from '../../lib/supabase';
import { SpeechService } from '../../services/speech';

export default function ChatDirectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { friendId, friendName } = route.params;
  const listRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [friend, setFriend] = useState<Profile | null>(null);
  const [text, setText] = useState('');
  const [myId, setMyId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setMyId(user?.id || null);
    const [msgs, fr] = await Promise.all([getMessages(friendId), getProfile(friendId)]);
    setMessages(msgs);
    setFriend(fr);
    setLoading(false);
  }, [friendId]);

  useEffect(() => {
    loadData();
    const unsub = subscribeToMessages(friendId, (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return () => {
      unsub();
      SpeechService.cancelRecording();
    };
  }, [friendId, loadData]);

  const handleMicPress = async () => {
    if (isRecording) {
      setIsRecording(false);
      const transcription = await SpeechService.stopRecording();
      if (transcription) {
        setText(prev => prev + (prev ? ' ' : '') + transcription);
      } else {
        Alert.alert('Erro', 'Nao foi possivel transcrever o audio');
      }
    } else {
      const started = await SpeechService.startRecording();
      if (started) {
        setIsRecording(true);
      } else {
        Alert.alert('Erro', 'Nao foi possivel iniciar a gravacao. Verifique as permissoes.');
      }
    }
  };

  const handleSend = async (type: 'text' | 'image' | 'prayer' = 'text', content?: string) => {
    const msgContent = content || text.trim();
    if (!msgContent && type === 'text') return;

    if (type === 'text' || type === 'prayer') {
      const modResult = moderateText(msgContent);
      if (!modResult.safe) {
        Alert.alert('Mensagem nao permitida', modResult.reason || 'Conteudo inapropriado');
        return;
      }
    }

    setText('');
    setSending(true);
    const res = await sendMessage(friendId, msgContent, type);
    if (res.success && res.message) {
      setMessages(prev => [...prev, res.message!]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
    setSending(false);
  };

  const handleSendImage = async () => {
    const uri = await pickImage();
    if (!uri) return;

    setSending(true);
    const uploadResult = await uploadWithModeration(uri, 'chat-images');
    if (!uploadResult.success) {
      Alert.alert('Imagem nao permitida', uploadResult.error || 'Tente outra imagem');
      setSending(false);
      return;
    }

    await handleSend('image', uploadResult.url);
    setSending(false);
  };

  const handleSendPrayer = () => {
    handleSend('prayer', 'Ore por mim');
  };

  const formatTime = (d: string) => {
    const date = new Date(d);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return hours + ':' + mins;
  };

  const renderMessage = ({ item }: { item: DirectMessage }) => {
    const isMe = item.sender_id === myId;
    const isPrayer = item.message_type === 'prayer';
    const isImage = item.message_type === 'image';

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowOther]}>
        {!isMe && <Avatar uri={friend?.avatar_url} name={friend?.full_name} size={32} />}
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther, isPrayer && styles.bubblePrayer]}>
          {isPrayer && (
            <View style={styles.prayerHeader}>
              <Ionicons name="hand-left" size={14} color="#9b59b6" />
              <Text style={styles.prayerLabel}>Pedido de Oracao</Text>
            </View>
          )}
          {isImage ? (
            <Image source={{ uri: item.content }} style={styles.msgImage} resizeMode="cover" />
          ) : (
            <Text style={[styles.msgText, isMe && { color: '#FFF' }]}>{item.content}</Text>
          )}
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
        <TouchableOpacity style={styles.headerProfile} onPress={() => navigation.navigate('UserProfile', { userId: friendId })}>
          <Avatar uri={friend?.avatar_url} name={friend?.full_name || friendName} size={40} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{friend?.full_name || friendName || 'Usuario'}</Text>
            {friend?.daily_status && <Text style={styles.headerStatus} numberOfLines={1}>{friend.daily_status}</Text>}
          </View>
        </TouchableOpacity>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSendImage} disabled={sending || isRecording}>
            <Ionicons name="image" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSendPrayer} disabled={sending || isRecording}>
            <Ionicons name="hand-left" size={22} color="#9b59b6" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.micBtn, isRecording && styles.micBtnRecording]} 
            onPress={handleMicPress} 
            disabled={sending}
          >
            <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color={isRecording ? '#FFF' : COLORS.textSecondary} />
          </TouchableOpacity>
          <View style={styles.inputWrap}>
            <TextInput 
              style={styles.input} 
              placeholder={isRecording ? 'Gravando...' : 'Mensagem...'} 
              placeholderTextColor={COLORS.textMuted} 
              value={text} 
              onChangeText={setText} 
              multiline 
              maxLength={1000}
              editable={!sending && !isRecording}
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
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerName: { fontSize: 17, fontWeight: '600', color: COLORS.text },
  headerStatus: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  msgList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgRowOther: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 20, marginLeft: 8 },
  bubbleMe: { backgroundColor: COLORS.primaryDark, borderBottomRightRadius: 4, marginLeft: 0 },
  bubbleOther: { backgroundColor: COLORS.card, borderBottomLeftRadius: 4 },
  bubblePrayer: { backgroundColor: 'rgba(155,89,182,0.2)', borderWidth: 1, borderColor: '#9b59b6' },
  prayerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  prayerLabel: { fontSize: 12, fontWeight: '600', color: '#9b59b6', marginLeft: 6 },
  msgText: { fontSize: 15, color: COLORS.text, lineHeight: 20 },
  msgImage: { width: 200, height: 150, borderRadius: 12 },
  msgTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    paddingBottom: Platform.OS === 'ios' ? 32 : 12, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border 
  },
  actionBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.card, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 6 
  },
  micBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.card, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 6 
  },
  micBtnRecording: {
    backgroundColor: '#e74c3c',
  },
  inputWrap: { 
    flex: 1, 
    backgroundColor: COLORS.card, 
    borderRadius: 22, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    maxHeight: 120 
  },
  input: { fontSize: 16, color: COLORS.text, maxHeight: 100 },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.primaryDark, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 6 
  },
});
