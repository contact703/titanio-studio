import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { reportContent } from '../../services/moderation';

interface ReportButtonProps {
  contentType: 'post' | 'comment' | 'user' | 'message';
  contentId: string;
  size?: number;
  color?: string;
}

const REPORT_REASONS = [
  { id: 'nudity', label: 'Nudez ou conteudo sexual', icon: 'eye-off' },
  { id: 'violence', label: 'Violencia ou ameacas', icon: 'warning' },
  { id: 'hate', label: 'Discurso de odio', icon: 'flame' },
  { id: 'spam', label: 'Spam ou golpe', icon: 'mail-unread' },
  { id: 'other', label: 'Outro motivo', icon: 'flag' },
] as const;

export default function ReportButton({ contentType, contentId, size = 20, color = '#999' }: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const handleReport = async () => {
    if (!selectedReason) {
      Alert.alert('Erro', 'Selecione um motivo');
      return;
    }

    setLoading(true);

    const result = await reportContent(
      contentType,
      contentId,
      selectedReason as 'nudity' | 'violence' | 'spam' | 'hate' | 'other'
    );

    setLoading(false);

    if (result.success) {
      setShowModal(false);
      setSelectedReason(null);
      Alert.alert('Obrigado!', 'Sua denuncia foi enviada e sera analisada.');
    } else {
      Alert.alert('Erro', result.error || 'Nao foi possivel enviar a denuncia');
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowModal(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="flag-outline" size={size} color={color} />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Denunciar Conteudo</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Por que voce esta denunciando este conteudo?
            </Text>

            <View style={styles.reasonsList}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason.id && styles.reasonItemSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <Ionicons
                    name={reason.icon as any}
                    size={22}
                    color={selectedReason === reason.id ? '#3E9BCB' : '#666'}
                  />
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason.id && styles.reasonTextSelected,
                    ]}
                  >
                    {reason.label}
                  </Text>
                  {selectedReason === reason.id && (
                    <Ionicons name="checkmark-circle" size={22} color="#3E9BCB" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, !selectedReason && styles.submitBtnDisabled]}
              onPress={handleReport}
              disabled={!selectedReason || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitBtnText}>Enviar Denuncia</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
              Denuncias falsas podem resultar em restricoes na sua conta.
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  reasonsList: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
    gap: 12,
  },
  reasonItemSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#3E9BCB',
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  reasonTextSelected: {
    color: '#3E9BCB',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#e74c3c',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});
