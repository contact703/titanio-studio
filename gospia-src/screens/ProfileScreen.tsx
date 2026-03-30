import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  RefreshControl,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { getUserProfile, UserProfile } from '../services/credits';
import {
  getNotificationSettings,
  saveNotificationSettings,
  sendTestNotification,
  requestNotificationPermissions,
} from '../services/notifications';

interface ProfileScreenProps {
  navigation?: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [notifHour, setNotifHour] = useState(7);
  const [notifMinute, setNotifMinute] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadProfile();
    loadNotificationSettings();
    const unsubscribe = navigation?.addListener('focus', loadProfile);
    return () => unsubscribe?.();
  }, [navigation]);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    console.log('Perfil carregado:', userProfile);
    setProfile(userProfile);
  };

  const loadNotificationSettings = async () => {
    const settings = await getNotificationSettings();
    setNotifEnabled(settings.enabled);
    setNotifHour(settings.hour);
    setNotifMinute(settings.minute);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    await loadNotificationSettings();
    setRefreshing(false);
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert('Permissao Necessaria', 'Ative as notificacoes nas configuracoes do celular.');
        return;
      }
    }

    setNotifEnabled(value);
    await saveNotificationSettings({ enabled: value, hour: notifHour, minute: notifMinute });

    if (value) {
      Alert.alert('Notificacoes Ativadas', 'Voce recebera o versiculo do dia as ' + notifHour + ':' + notifMinute.toString().padStart(2, '0'));
    }
  };

  const handleTimeSelect = async (hour: number, minute: number) => {
    setNotifHour(hour);
    setNotifMinute(minute);
    setShowTimePicker(false);

    if (notifEnabled) {
      await saveNotificationSettings({ enabled: true, hour, minute });
      Alert.alert('Horario Atualizado', 'Versiculo diario as ' + hour + ':' + minute.toString().padStart(2, '0'));
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
    Alert.alert('Notificacao Enviada', 'Verifique suas notificacoes!');
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          await AsyncStorage.clear();
        },
      },
    ]);
  };

  const isPro = profile?.is_pro || false;
  const credits = profile?.credits || 0;
  const displayName = profile?.full_name || profile?.username || profile?.email?.split('@')[0] || 'Usuario';
  const avatarLetter = displayName[0]?.toUpperCase() || 'U';

  const timeOptions = [
    { hour: 6, minute: 0, label: '06:00' },
    { hour: 7, minute: 0, label: '07:00' },
    { hour: 8, minute: 0, label: '08:00' },
    { hour: 9, minute: 0, label: '09:00' },
    { hour: 12, minute: 0, label: '12:00' },
    { hour: 18, minute: 0, label: '18:00' },
    { hour: 20, minute: 0, label: '20:00' },
    { hour: 21, minute: 0, label: '21:00' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3E9BCB" translucent />

      <LinearGradient
        colors={['#3E9BCB', '#2a7ba8']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{profile?.email || ''}</Text>

          <View style={[styles.planBadge, isPro && styles.planBadgePro]}>
            <Ionicons name={isPro ? 'star' : 'person'} size={14} color={isPro ? '#1a1a1a' : 'white'} />
            <Text style={[styles.planText, isPro && styles.planTextPro]}>
              {isPro ? 'PRO' : 'GRATUITO'}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3E9BCB']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Creditos - SEMPRE mostra numero real */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={22} color="#3E9BCB" />
            <Text style={styles.cardTitle}>Seus Creditos</Text>
          </View>
          <View style={styles.creditsRow}>
            <Text style={styles.creditsNumber}>{credits}</Text>
            <Text style={styles.creditsLabel}>
              {isPro ? 'creditos (PRO)' : 'restantes'}
            </Text>
          </View>
          {!isPro && (
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => navigation?.navigate('Upgrade')}
              activeOpacity={0.8}
            >
              <Ionicons name="star" size={18} color="white" />
              <Text style={styles.upgradeBtnText}>Assinar Pro</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notificacoes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="notifications-outline" size={22} color="#3E9BCB" />
            <Text style={styles.cardTitle}>Versiculo Diario</Text>
          </View>

          <View style={styles.notifRow}>
            <View style={styles.notifInfo}>
              <Text style={styles.notifTitle}>Receber notificacao</Text>
              <Text style={styles.notifDesc}>Versiculo novo todo dia</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#ddd', true: '#3E9BCB' }}
              thumbColor="white"
            />
          </View>

          {notifEnabled && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.notifRow}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <View style={styles.notifInfo}>
                  <Text style={styles.notifTitle}>Horario</Text>
                  <Text style={styles.notifDesc}>Escolha quando receber</Text>
                </View>
                <View style={styles.timeBox}>
                  <Text style={styles.timeText}>
                    {notifHour.toString().padStart(2, '0')}:{notifMinute.toString().padStart(2, '0')}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.testBtn}
                onPress={handleTestNotification}
                activeOpacity={0.7}
              >
                <Ionicons name="paper-plane-outline" size={16} color="#3E9BCB" />
                <Text style={styles.testBtnText}>Testar Notificacao</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Opcoes */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation?.navigate('Upgrade')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="card-outline" size={20} color="#3E9BCB" />
              </View>
              <Text style={styles.menuItemText}>Gerenciar Assinatura</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>Sair da Conta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {/* Versao */}
        <View style={styles.versionContainer}>
          <Ionicons name="heart" size={14} color="#ccc" />
          <Text style={styles.version}>Gospia v1.1.0</Text>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Escolha o Horario</Text>
            <View style={styles.timeGrid}>
              {timeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.label}
                  style={[
                    styles.timeOption,
                    notifHour === opt.hour && notifMinute === opt.minute && styles.timeOptionActive
                  ]}
                  onPress={() => handleTimeSelect(opt.hour, opt.minute)}
                >
                  <Text style={[
                    styles.timeOptionText,
                    notifHour === opt.hour && notifMinute === opt.minute && styles.timeOptionTextActive
                  ]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { paddingBottom: 28 },
  headerContent: { alignItems: 'center' },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: 'white' },
  userName: { fontSize: 24, fontWeight: '700', color: 'white' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 14,
  },
  planBadgePro: { backgroundColor: '#FFD700' },
  planText: { color: 'white', fontWeight: '700', fontSize: 13 },
  planTextPro: { color: '#1a1a1a' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#666' },
  creditsRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 },
  creditsNumber: { fontSize: 52, fontWeight: '800', color: '#3E9BCB' },
  creditsLabel: { fontSize: 18, color: '#666', marginLeft: 10 },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3E9BCB',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    shadowColor: '#3E9BCB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  notifDesc: { fontSize: 13, color: '#999', marginTop: 2 },
  timeBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 18, fontWeight: '700', color: '#3E9BCB' },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  testBtnText: { fontSize: 14, fontWeight: '600', color: '#3E9BCB' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: { fontSize: 16, color: '#1a1a1a', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 8 },
  logoutText: { color: '#e74c3c' },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 24,
  },
  version: { color: '#999', fontSize: 13 },
  modalOverlay: {
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
    maxWidth: 340,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', textAlign: 'center', marginBottom: 20 },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  timeOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    minWidth: 80,
    alignItems: 'center',
  },
  timeOptionActive: { backgroundColor: '#3E9BCB' },
  timeOptionText: { fontSize: 16, fontWeight: '600', color: '#666' },
  timeOptionTextActive: { color: 'white' },
});
