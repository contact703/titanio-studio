import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { getUserProfile, UserProfile } from '../services/credits';
import { startStripeCheckout, generatePixPayment, PixPaymentResponse } from '../services/payment';

interface UpgradeScreenProps {
  navigation: any;
}

const features = [
  { icon: 'infinite', title: '500 Créditos Mensais', desc: 'Renova todo mês automaticamente' },
  { icon: 'chatbubbles', title: 'Conversas Mais Longas', desc: 'Fale à vontade com o Pastor' },
  { icon: 'shield-checkmark', title: 'Sem Preocupação', desc: 'Use o app tranquilo' },
];

export default function UpgradeScreen({ navigation }: UpgradeScreenProps) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'options' | 'pix'>('options');
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null);
  const [processingStripe, setProcessingStripe] = useState(false);
  const [processingPix, setProcessingPix] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
    setLoading(false);
  };

  const handleStripePayment = async () => {
    if (!profile?.id || !profile?.email) {
      Alert.alert('Erro', 'Faça login para continuar');
      return;
    }

    setProcessingStripe(true);
    try {
      const success = await startStripeCheckout(profile.id, profile.email);
      if (!success) {
        Alert.alert('Erro', 'Não foi possível iniciar o pagamento');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao processar pagamento');
    } finally {
      setProcessingStripe(false);
    }
  };

  const handlePixPayment = async () => {
    if (!profile?.id || !profile?.email) {
      Alert.alert('Erro', 'Faça login para continuar');
      return;
    }

    setProcessingPix(true);
    try {
      const data = await generatePixPayment(profile.id, profile.email, 19.90);
      if (data) {
        setPixData(data);
        setView('pix');
      } else {
        Alert.alert('Erro', 'Não foi possível gerar o PIX');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao gerar PIX');
    } finally {
      setProcessingPix(false);
    }
  };

  const handleCopyPix = async () => {
    if (pixData?.qr_code) {
      await Clipboard.setStringAsync(pixData.qr_code);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E9BCB" />
      </View>
    );
  }

  const isPro = profile?.is_pro;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3E9BCB" translucent />

      <LinearGradient 
        colors={['#3E9BCB', '#2a7ba8']} 
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={26} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.headerIconBox}>
            <Ionicons name="star" size={36} color="#FFD700" />
          </View>
          <Text style={styles.headerTitle}>Gospia Pro</Text>
          <Text style={styles.headerSubtitle}>
            {isPro ? 'Você já é Pro!' : 'Desbloqueie todo o potencial'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status */}
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Seu plano:</Text>
            <View style={[styles.badge, isPro && styles.proBadge]}>
              <Ionicons name={isPro ? "star" : "person"} size={12} color={isPro ? "#1a1a1a" : "#666"} />
              <Text style={[styles.badgeText, isPro && styles.proBadgeText]}>
                {isPro ? 'PRO' : 'GRÁTIS'}
              </Text>
            </View>
          </View>
          {!isPro && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Créditos:</Text>
              <Text style={styles.creditsText}>{profile?.credits || 0}</Text>
            </View>
          )}
        </View>

        {/* Benefícios */}
        <Text style={styles.sectionTitle}>Benefícios do Pro</Text>
        {features.map((f, i) => (
          <View key={i} style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Ionicons name={f.icon as any} size={22} color="#3E9BCB" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        ))}

        {/* Pagamento */}
        {!isPro && view === 'options' && (
          <>
            <View style={styles.priceCard}>
              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>MAIS POPULAR</Text>
              </View>
              <Text style={styles.priceLabel}>Plano Mensal</Text>
              <View style={styles.priceRow}>
                <Text style={styles.currency}>R$</Text>
                <Text style={styles.price}>19</Text>
                <Text style={styles.period}>,90/mês</Text>
              </View>
              <Text style={styles.priceNote}>Cancele quando quiser</Text>
            </View>

            <TouchableOpacity
              style={styles.stripeBtn}
              onPress={handleStripePayment}
              disabled={processingStripe}
              activeOpacity={0.8}
            >
              {processingStripe ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={22} color="white" />
                  <Text style={styles.stripeBtnText}>Cartão de Crédito</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pixBtn}
              onPress={handlePixPayment}
              disabled={processingPix}
              activeOpacity={0.8}
            >
              {processingPix ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="qr-code-outline" size={22} color="white" />
                  <Text style={styles.pixBtnText}>PIX (R$ 19,90)</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* Tela PIX */}
        {!isPro && view === 'pix' && pixData && (
          <View style={styles.pixContainer}>
            {pixData.qr_code_base64 && (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: `data:image/png;base64,${pixData.qr_code_base64}` }}
                  style={styles.qrImage}
                />
              </View>
            )}

            <View style={styles.waitingBadge}>
              <View style={styles.waitingDot} />
              <Text style={styles.waitingText}>Aguardando pagamento...</Text>
            </View>

            <TouchableOpacity 
              style={styles.copyBtn} 
              onPress={handleCopyPix}
              activeOpacity={0.8}
            >
              <Ionicons name="copy-outline" size={20} color="white" />
              <Text style={styles.copyBtnText}>Copiar código PIX</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setView('options')}
              style={styles.backLinkBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={18} color="#666" />
              <Text style={styles.backLink}>Voltar para opções</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Já é Pro */}
        {isPro && (
          <View style={styles.proActiveCard}>
            <Ionicons name="checkmark-circle" size={48} color="#3E9BCB" />
            <Text style={styles.proActiveTitle}>Você é Pro!</Text>
            <Text style={styles.proActiveText}>
              Você tem acesso a todos os recursos!
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#999" />
            <Text style={styles.footerText}>Pagamento seguro via Stripe e Mercado Pago</Text>
          </View>
          <View style={styles.footerRow}>
            <Ionicons name="mail-outline" size={16} color="#999" />
            <Text style={styles.footerText}>Dúvidas? contato@gospia.app</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa' },
  header: { paddingBottom: 28 },
  headerTop: { paddingHorizontal: 16 },
  backBtn: { 
    width: 44, 
    height: 44, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerContent: { alignItems: 'center', paddingTop: 4 },
  headerIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: 'white' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: { fontSize: 16, color: '#666' },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0f0f0', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 14,
  },
  proBadge: { backgroundColor: '#FFD700' },
  badgeText: { fontSize: 14, fontWeight: '700', color: '#666' },
  proBadgeText: { color: '#1a1a1a' },
  creditsText: { fontSize: 22, fontWeight: '700', color: '#3E9BCB' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  featureDesc: { fontSize: 13, color: '#666', marginTop: 3 },
  priceCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3E9BCB',
    shadowColor: '#3E9BCB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  priceBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#3E9BCB',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceBadgeText: { color: 'white', fontSize: 11, fontWeight: '800' },
  priceLabel: { fontSize: 14, color: '#666', marginTop: 8, marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end' },
  currency: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 10 },
  price: { fontSize: 64, fontWeight: '800', color: '#1a1a1a' },
  period: { fontSize: 18, color: '#666', marginBottom: 14 },
  priceNote: { fontSize: 13, color: '#999', marginTop: 8 },
  stripeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#6772e5',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#6772e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stripeBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
  pixBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#32BCAD',
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    shadowColor: '#32BCAD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pixBtnText: { color: 'white', fontSize: 18, fontWeight: '700' },
  pixContainer: { alignItems: 'center', marginTop: 24 },
  qrContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  qrImage: { width: 200, height: 200 },
  waitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  waitingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#32BCAD',
    marginRight: 10,
  },
  waitingText: { color: '#32BCAD', fontWeight: '600', fontSize: 14 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3E9BCB',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  copyBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  backLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
  },
  backLink: { color: '#666', fontSize: 15 },
  proActiveCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginTop: 24,
  },
  proActiveTitle: { fontSize: 24, fontWeight: '700', color: '#3E9BCB', marginTop: 12 },
  proActiveText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 8 },
  footer: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 13, color: '#999' },
});
