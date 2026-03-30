// src/components/social/VideoCallButton.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  openVideoCall,
  joinVideoCall,
  leaveVideoCall,
  getVideoCallStatus,
  subscribeToVideoCall,
  VideoCallStatus as VideoCallStatusType,
  VideoCallParticipant,
} from '../../services/social/videoCall';
import { COLORS } from './UIComponents';

interface VideoCallButtonProps {
  roomId: string;
  roomName: string;
  userId: string;
  displayName: string;
  email?: string;
  avatarUrl?: string | null;
  isPro?: boolean;
  maxParticipants?: number;
  size?: 'small' | 'medium' | 'large';
  showParticipantCount?: boolean;
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onError?: (error: string) => void;
}

export const VideoCallButton: React.FC<VideoCallButtonProps> = ({
  roomId,
  roomName,
  userId,
  displayName,
  email,
  avatarUrl,
  isPro = false,
  maxParticipants = 5,
  size = 'medium',
  showParticipantCount = true,
  onCallStart,
  onCallEnd,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<VideoCallStatusType | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      const { data } = await getVideoCallStatus(roomId);
      if (data) {
        setCallStatus(data);
        const userInCall = data.participants.some(p => p.user_id === userId);
        setIsInCall(userInCall);
      }

      unsubscribe = subscribeToVideoCall(roomId, (status) => {
        setCallStatus(status);
        const userInCall = status.participants.some(p => p.user_id === userId);
        setIsInCall(userInCall);
      });
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [roomId, userId]);

  const sizes = {
    small: { button: 40, icon: 18, fontSize: 12, badge: 16 },
    medium: { button: 50, icon: 24, fontSize: 14, badge: 20 },
    large: { button: 60, icon: 28, fontSize: 16, badge: 24 },
  };

  const currentSize = sizes[size];

  const canJoinCall = () => {
    if (!isPro) {
      return { allowed: false, reason: 'Videochamada exclusiva para usuarios PRO' };
    }
    if (callStatus && callStatus.participantCount >= maxParticipants && !isInCall) {
      return { allowed: false, reason: 'Sala cheia (max. ' + maxParticipants + ' participantes)' };
    }
    return { allowed: true, reason: '' };
  };

  const handleJoinCall = async () => {
    const { allowed, reason } = canJoinCall();

    if (!allowed) {
      Alert.alert('Nao disponivel', reason);
      onError?.(reason);
      return;
    }

    setIsLoading(true);

    try {
      const joinResult = await joinVideoCall(roomId, userId, displayName, avatarUrl);

      if (!joinResult.success) {
        throw new Error(joinResult.error);
      }

      const callResult = await openVideoCall(
        roomId,
        displayName,
        email,
        avatarUrl || undefined,
        {
          subject: roomName,
          audioMuted: false,
          videoMuted: false,
          preferApp: true,
        }
      );

      if (!callResult.success) {
        await leaveVideoCall(roomId, userId);
        throw new Error(callResult.error);
      }

      setIsInCall(true);
      onCallStart?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao iniciar chamada';
      Alert.alert('Erro', errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveCall = async () => {
    Alert.alert(
      'Sair da Chamada',
      'Deseja encerrar sua participacao na videochamada?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await leaveVideoCall(roomId, userId);
              setIsInCall(false);
              onCallEnd?.();
            } catch (error) {
              console.error('Erro ao sair da chamada:', error);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getButtonColor = () => {
    if (!isPro) return COLORS.textMuted;
    if (isInCall) return COLORS.videoCallActive || '#27ae60';
    if (callStatus?.isActive) return COLORS.warning;
    return COLORS.videoCall || '#9b59b6';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            width: currentSize.button,
            height: currentSize.button,
            backgroundColor: getButtonColor(),
          },
        ]}
        onPress={isInCall ? handleLeaveCall : handleJoinCall}
        onLongPress={() => callStatus?.isActive && setShowParticipants(true)}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.text} size="small" />
        ) : (
          <Ionicons
            name={isInCall ? 'videocam' : 'videocam-outline'}
            size={currentSize.icon}
            color={COLORS.text}
          />
        )}
      </TouchableOpacity>

      {showParticipantCount && callStatus && callStatus.participantCount > 0 && (
        <TouchableOpacity
          style={[
            styles.badge,
            {
              minWidth: currentSize.badge,
              height: currentSize.badge,
              backgroundColor: COLORS.videoCallActive || '#27ae60',
            },
          ]}
          onPress={() => setShowParticipants(true)}
        >
          <Text style={[styles.badgeText, { fontSize: currentSize.fontSize - 2 }]}>
            {callStatus.participantCount}
          </Text>
        </TouchableOpacity>
      )}

      {!isPro && (
        <View style={styles.proIndicator}>
          <Text style={styles.proText}>PRO</Text>
        </View>
      )}

      <Modal
        visible={showParticipants}
        transparent
        animationType="fade"
        onRequestClose={() => setShowParticipants(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowParticipants(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Na Videochamada ({callStatus?.participantCount || 0})</Text>
              <TouchableOpacity onPress={() => setShowParticipants(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={callStatus?.participants || []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.participantItem}>
                  {item.avatar_url ? (
                    <Image source={{ uri: item.avatar_url }} style={styles.participantAvatar} />
                  ) : (
                    <View style={[styles.participantAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>{item.display_name?.charAt(0).toUpperCase() || '?'}</Text>
                    </View>
                  )}
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{item.display_name}</Text>
                    <Text style={styles.participantTime}>
                      Entrou as {new Date(item.joined_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  {item.user_id === userId && (
                    <View style={styles.youBadge}><Text style={styles.youBadgeText}>Voce</Text></View>
                  )}
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>Nenhum participante na chamada</Text>}
            />

            {!isInCall && isPro && callStatus && callStatus.participantCount < maxParticipants && (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => { setShowParticipants(false); handleJoinCall(); }}
              >
                <Ionicons name="videocam" size={20} color={COLORS.text} />
                <Text style={styles.joinButtonText}>Entrar na Chamada</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export const VideoCallStatus: React.FC<{ roomId: string; style?: object }> = ({ roomId, style }) => {
  const [callStatus, setCallStatus] = useState<VideoCallStatusType | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await getVideoCallStatus(roomId);
      if (data) setCallStatus(data);
    };
    init();
    const unsubscribe = subscribeToVideoCall(roomId, setCallStatus);
    return unsubscribe;
  }, [roomId]);

  if (!callStatus?.isActive) return null;

  return (
    <View style={[styles.statusContainer, style]}>
      <View style={styles.statusDot} />
      <Text style={styles.statusText}>{callStatus.participantCount} em chamada</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'relative' },
  button: { borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  badge: { position: 'absolute', top: -5, right: -5, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 2, borderColor: '#5BA3E0' },
  badgeText: { color: '#FFF', fontWeight: 'bold' },
  proIndicator: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#FFD700', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  proText: { fontSize: 8, fontWeight: 'bold', color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#5BA3E0', borderRadius: 16, padding: 16, width: '100%', maxWidth: 400, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  participantItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  participantAvatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { backgroundColor: '#4A90D9', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  participantInfo: { flex: 1, marginLeft: 12 },
  participantName: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  participantTime: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  youBadge: { backgroundColor: '#4A90D9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  youBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  emptyText: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingVertical: 20 },
  joinButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#27ae60', paddingVertical: 14, borderRadius: 12, marginTop: 16, gap: 8 },
  joinButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(39, 174, 96, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27ae60', marginRight: 6 },
  statusText: { color: '#27ae60', fontSize: 12, fontWeight: '600' },
});

export default VideoCallButton;
