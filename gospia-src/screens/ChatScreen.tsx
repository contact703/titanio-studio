import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Share,
  ActivityIndicator,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ElevenLabsService } from '../services/elevenlabs';
import { sendMessage, getUserContext, Message } from '../services/chat';
import { getUserProfile } from '../services/credits';
import { SpeechService } from '../services/speech';
import { createShareLink } from '../services/share';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type ChatMode = 'text' | 'voice';

// Voice mode states
type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Eu sou o Pastor Elder. Como posso ajudá-lo hoje? Estou aqui para ouvir, aconselhar e orar com você.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [credits, setCredits] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Voice mode state
  const [chatMode, setChatMode] = useState<ChatMode>('text');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceContinuous, setVoiceContinuous] = useState(true);
  const voicePulse = useRef(new Animated.Value(1)).current;
  const voiceWaveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();

    // Handle initial prompt from HomeScreen quick actions
    if (route.params?.initialPrompt) {
      handleSendWithText(route.params.initialPrompt);
    }

    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {}
    );
    return () => {
      showListener.remove();
      hideListener.remove();
      SpeechService.cancelRecording();
      ElevenLabsService.stop();
    };
  }, []);

  // Pulse animation for voice mode
  useEffect(() => {
    if (voiceState === 'listening') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(voicePulse, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(voicePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else if (voiceState === 'speaking') {
      const wave = Animated.loop(
        Animated.sequence([
          Animated.timing(voiceWaveAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(voiceWaveAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      );
      wave.start();
      return () => wave.stop();
    } else {
      voicePulse.setValue(1);
      voiceWaveAnim.setValue(0);
    }
  }, [voiceState]);

  const loadUserData = async () => {
    try {
      const profile = await getUserProfile();
      if (profile) {
        setCredits(profile.credits);
        setIsPro(profile.is_pro);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

  const handleMicPress = async () => {
    if (isRecording) {
      setIsRecording(false);
      const transcription = await SpeechService.stopRecording();
      if (transcription) {
        setInputText(prev => prev + (prev ? ' ' : '') + transcription);
      } else {
        Alert.alert('Erro', 'Não foi possível transcrever o áudio');
      }
    } else {
      const started = await SpeechService.startRecording();
      if (started) {
        setIsRecording(true);
      } else {
        Alert.alert('Erro', 'Não foi possível iniciar a gravação. Verifique as permissões.');
      }
    }
  };

  const handleSendWithText = async (text: string) => {
    if (!text.trim() || loading) return;

    if (!isPro && credits <= 0) {
      Alert.alert(
        'Sem créditos',
        'Você não tem créditos suficientes. Assine o PRO para mensagens ilimitadas!',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ser PRO', onPress: () => navigation.navigate('Upgrade') }
        ]
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const chatMessages: Message[] = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      chatMessages.push({ role: 'user', content: text.trim() });

      const userContext = await getUserContext();
      const result = await sendMessage(chatMessages, userContext);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!isPro) {
        setCredits(prev => Math.max(0, prev - 1));
      }

      return assistantMessage;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
      return null;
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handleSend = async () => {
    await handleSendWithText(inputText);
  };

  const handlePlayAudio = async (message: ChatMessage) => {
    try {
      if (playingId === message.id) {
        await ElevenLabsService.stop();
        setPlayingId(null);
      } else {
        setPlayingId(message.id);
        const sound = await ElevenLabsService.speak(message.content);
        if (sound) {
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setPlayingId(null);
            }
          });
        } else {
          setPlayingId(null);
          Alert.alert('Erro', 'Não foi possível reproduzir o áudio.');
        }
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setPlayingId(null);
    }
  };

  const handleShare = async (message: ChatMessage) => {
    try {
      setSharing(true);
      const shareLink = await createShareLink(message.content);

      if (shareLink) {
        await Share.share({ message: shareLink });
      } else {
        const fallbackText = '"' + message.content + '"\n\n- Pastor Elder (Gospia)\n\nBaixe o app: https://play.google.com/store/apps/details?id=app.gospia.mobile';
        await Share.share({ message: fallbackText });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    } finally {
      setSharing(false);
    }
  };

  const handleShareConversation = async () => {
    try {
      const lastAssistant = messages.filter(m => m.role === 'assistant').pop();
      if (lastAssistant) {
        await handleShare(lastAssistant);
      }
    } catch (error) {
      console.error('Erro ao compartilhar conversa:', error);
    }
  };

  // ========== VOICE MODE FUNCTIONS ==========

  const startVoiceConversation = async () => {
    if (voiceState !== 'idle') return;
    setChatMode('voice');
    startListening();
  };

  const stopVoiceConversation = () => {
    setVoiceState('idle');
    setChatMode('text');
    SpeechService.cancelRecording();
    ElevenLabsService.stop();
  };

  const startListening = async () => {
    setVoiceState('listening');

    const started = await SpeechService.startRecording();
    if (!started) {
      Alert.alert('Erro', 'Não foi possível acessar o microfone.');
      setVoiceState('idle');
      setChatMode('text');
      return;
    }
  };

  const handleVoiceTap = async () => {
    if (voiceState === 'listening') {
      // User tapped to stop listening — process the message
      setVoiceState('processing');

      const transcription = await SpeechService.stopRecording();

      if (!transcription || !transcription.trim()) {
        // Nothing heard, go back to listening
        if (voiceContinuous) {
          startListening();
        } else {
          setVoiceState('idle');
        }
        return;
      }

      // Send the message
      const response = await handleSendWithText(transcription);

      if (response) {
        // Speak the response
        setVoiceState('speaking');
        try {
          const sound = await ElevenLabsService.speak(response.content);
          if (sound) {
            await new Promise<void>((resolve) => {
              sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                  resolve();
                }
              });
            });
          }
        } catch (e) {
          console.error('[Voice] Erro TTS:', e);
        }

        // Continue listening if continuous mode
        if (voiceContinuous && chatMode === 'voice') {
          startListening();
        } else {
          setVoiceState('idle');
        }
      } else {
        setVoiceState('idle');
      }
    } else if (voiceState === 'speaking') {
      // Interrupt — stop speaking and start listening
      await ElevenLabsService.stop();
      startListening();
    } else if (voiceState === 'idle') {
      startListening();
    }
  };

  // ========== RENDER ==========

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isAssistant = item.role === 'assistant';

    return (
      <View style={[styles.messageContainer, isAssistant ? styles.assistantContainer : styles.userContainer]}>
        {isAssistant && (
          <View style={styles.avatarContainer}>
            <Image source={require('../../assets/icon.png')} style={styles.avatar} />
          </View>
        )}

        <View style={[styles.messageBubble, isAssistant ? styles.assistantBubble : styles.userBubble]}>
          <Text style={[styles.messageText, isAssistant ? styles.assistantText : styles.userText]}>
            {item.content}
          </Text>

          {isAssistant && chatMode === 'text' && (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={() => handlePlayAudio(item)} disabled={sharing}>
                <Ionicons name={playingId === item.id ? 'stop-circle' : 'volume-high'} size={18} color="#3E9BCB" />
                <Text style={styles.actionText}>{playingId === item.id ? 'Parar' : 'Ouvir'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton} onPress={() => handleShare(item)} disabled={sharing}>
                <Ionicons name="share-social" size={18} color="#3E9BCB" />
                <Text style={styles.actionText}>{sharing ? 'Aguarde...' : 'Compartilhar'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {!isAssistant && <View style={styles.avatarSpace} />}
      </View>
    );
  };

  // Voice mode status label
  const getVoiceStatusLabel = () => {
    switch (voiceState) {
      case 'listening': return 'Ouvindo você...';
      case 'processing': return 'Pensando...';
      case 'speaking': return 'Pastor Elder falando...';
      default: return 'Toque para falar';
    }
  };

  const getVoiceStatusColor = () => {
    switch (voiceState) {
      case 'listening': return '#4CAF50';
      case 'processing': return '#FF9800';
      case 'speaking': return '#3E9BCB';
      default: return '#999';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          stopVoiceConversation();
          navigation.goBack();
        }} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pastor Elder</Text>
          <Text style={styles.headerSubtitle}>{isPro ? 'PRO - Ilimitado' : credits + ' créditos'}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Mode toggle */}
          <TouchableOpacity
            onPress={() => {
              if (chatMode === 'voice') {
                stopVoiceConversation();
              } else {
                startVoiceConversation();
              }
            }}
            style={[styles.modeToggle, chatMode === 'voice' && styles.modeToggleActive]}
          >
            <Ionicons
              name={chatMode === 'voice' ? 'chatbubble-ellipses' : 'mic'}
              size={20}
              color={chatMode === 'voice' ? '#fff' : '#3E9BCB'}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShareConversation} style={styles.headerButton} disabled={sharing}>
            <Ionicons name="share-outline" size={22} color="#3E9BCB" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {loading && chatMode === 'text' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3E9BCB" />
            <Text style={styles.loadingText}>Pastor Elder está digitando...</Text>
          </View>
        )}

        {/* TEXT MODE INPUT */}
        {chatMode === 'text' && (
          <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity
              style={[styles.micButton, isRecording && styles.micButtonRecording]}
              onPress={handleMicPress}
              disabled={loading}
            >
              <Ionicons name={isRecording ? 'stop' : 'mic'} size={22} color={isRecording ? '#fff' : '#3E9BCB'} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={isRecording ? 'Gravando...' : 'Digite sua mensagem...'}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
              editable={!loading && !isRecording}
            />

            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* VOICE MODE UI */}
        {chatMode === 'voice' && (
          <View style={[styles.voiceContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            {/* Status */}
            <Text style={[styles.voiceStatus, { color: getVoiceStatusColor() }]}>
              {getVoiceStatusLabel()}
            </Text>

            {/* Wave bars when speaking */}
            {voiceState === 'speaking' && (
              <View style={styles.waveBars}>
                {[0, 1, 2, 3, 4].map(i => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: voiceWaveAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [8, 20 + (i % 3) * 8],
                        }),
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Processing indicator */}
            {voiceState === 'processing' && (
              <ActivityIndicator size="large" color="#FF9800" style={{ marginBottom: 16 }} />
            )}

            {/* Big voice button */}
            <Animated.View style={{ transform: [{ scale: voicePulse }] }}>
              <TouchableOpacity
                style={[
                  styles.voiceMainBtn,
                  voiceState === 'listening' && styles.voiceBtnListening,
                  voiceState === 'speaking' && styles.voiceBtnSpeaking,
                  voiceState === 'processing' && styles.voiceBtnProcessing,
                ]}
                onPress={handleVoiceTap}
                disabled={voiceState === 'processing'}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    voiceState === 'listening' ? 'stop' :
                    voiceState === 'speaking' ? 'hand-left' :
                    'mic'
                  }
                  size={40}
                  color="#fff"
                />
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.voiceHint}>
              {voiceState === 'listening'
                ? 'Toque para enviar'
                : voiceState === 'speaking'
                ? 'Toque para interromper'
                : 'Toque no microfone para começar'}
            </Text>

            {/* Continuous toggle */}
            <TouchableOpacity
              style={styles.continuousToggle}
              onPress={() => setVoiceContinuous(v => !v)}
            >
              <View style={[styles.toggleDot, voiceContinuous && styles.toggleDotActive]} />
              <Text style={styles.continuousText}>
                Conversa contínua {voiceContinuous ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  keyboardAvoid: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  headerSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeToggleActive: {
    backgroundColor: '#3E9BCB',
  },
  messagesList: { paddingHorizontal: 16, paddingVertical: 16, flexGrow: 1 },
  messageContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  assistantContainer: { justifyContent: 'flex-start' },
  userContainer: { justifyContent: 'flex-end' },
  avatarContainer: { marginRight: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F4FC' },
  avatarSpace: { width: 44 },
  messageBubble: { maxWidth: width * 0.75, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  assistantBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: { backgroundColor: '#3E9BCB', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  assistantText: { color: '#333' },
  userText: { color: '#fff' },
  actionsRow: { flexDirection: 'row', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 12, color: '#3E9BCB', fontWeight: '500' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 8 },
  loadingText: { fontSize: 13, color: '#666' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButtonRecording: {
    backgroundColor: '#e74c3c',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3E9BCB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#B0D4E8' },

  // ========== VOICE MODE STYLES ==========
  voiceContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  voiceStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
    height: 36,
  },
  waveBar: {
    width: 4,
    backgroundColor: '#3E9BCB',
    borderRadius: 2,
  },
  voiceMainBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#3E9BCB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3E9BCB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  voiceBtnListening: {
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
  },
  voiceBtnSpeaking: {
    backgroundColor: '#3E9BCB',
    shadowColor: '#3E9BCB',
  },
  voiceBtnProcessing: {
    backgroundColor: '#FF9800',
    shadowColor: '#FF9800',
    opacity: 0.7,
  },
  voiceHint: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
  },
  continuousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  toggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
  },
  toggleDotActive: {
    backgroundColor: '#4CAF50',
  },
  continuousText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
});
