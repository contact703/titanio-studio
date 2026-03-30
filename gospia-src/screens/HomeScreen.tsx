import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile } from '../services/credits';
import { initializeNotifications } from '../services/notifications';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_HEIGHT < 700;

// Versículos do dia
const VERSOS = [
  { texto: "A nossa cidade está nos céus.", ref: "Filipenses 3:20" },
  { texto: "O Senhor é o meu pastor, nada me faltará.", ref: "Salmos 23:1" },
  { texto: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  { texto: "Porque Deus amou o mundo de tal maneira...", ref: "João 3:16" },
  { texto: "Confia no Senhor de todo o teu coração.", ref: "Provérbios 3:5" },
  { texto: "O Senhor é a minha luz e a minha salvação.", ref: "Salmos 27:1" },
  { texto: "Em tudo dai graças.", ref: "1 Tessalonicenses 5:18" },
];

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [credits, setCredits] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [versiculo, setVersiculo] = useState(VERSOS[0]);

  useEffect(() => {
    loadProfile();
    initializeNotifications();
    const hoje = new Date().getDate();
    setVersiculo(VERSOS[hoje % VERSOS.length]);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', loadProfile);
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    const profile = await getUserProfile();
    if (profile) {
      setCredits(profile.credits);
      setIsPro(profile.is_pro);
    }
  };

  const navigateToChat = (prompt?: string) => {
    navigation?.navigate('Chat', prompt ? { initialPrompt: prompt } : undefined);
  };

  const quickActions = [
    { title: 'Oração do Dia', icon: 'hand-left', prompt: 'Faça uma oração especial para mim hoje, pedindo a Deus por bênçãos, proteção e guia.' },
    { title: 'Versículo', icon: 'book', prompt: 'Me dê um versículo bíblico com uma reflexão profunda para meditar hoje.' },
    { title: 'Desabafar', icon: 'heart', prompt: 'Preciso desabafar sobre algo que está no meu coração...' },
    { title: 'Dúvida Bíblica', icon: 'help-circle', prompt: 'Tenho uma dúvida sobre a Bíblia e gostaria de sua orientação.' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#3B9AC4" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.headerTitle}>Gospia</Text>
        </View>
        <TouchableOpacity 
          style={styles.creditsButton} 
          onPress={() => navigation?.navigate('Upgrade')}
          activeOpacity={0.8}
        >
          {isPro ? (
            <View style={styles.proBadge}>
              <Ionicons name="star" size={14} color="#1a1a1a" />
              <Text style={styles.proText}>PRO</Text>
            </View>
          ) : (
            <View style={styles.creditsBadge}>
              <Text style={styles.creditsNumber}>{credits}</Text>
              <Text style={styles.creditsLabel}>créditos</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Versículo do Dia */}
        <View style={styles.versiculoCard}>
          <View style={styles.versiculoHeader}>
            <Text style={styles.versiculoLabel}>VERSÍCULO DO DIA</Text>
            <Ionicons name="sunny" size={24} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={styles.versiculoTexto}>"{versiculo.texto}"</Text>
          <Text style={styles.versiculoRef}>— {versiculo.ref}</Text>
        </View>

        {/* Como posso ajudar */}
        <Text style={styles.sectionTitle}>Como posso ajudar?</Text>

        {/* Quick Actions Grid */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigateToChat(action.prompt)}
              activeOpacity={0.8}
            >
              <Ionicons name={action.icon as any} size={28} color="white" style={styles.actionIcon} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rádio Gospia */}
        <TouchableOpacity
          style={styles.radioButton}
          onPress={() => navigation?.navigate('Radio')}
          activeOpacity={0.8}
        >
          <View style={styles.radioButtonContent}>
            <Ionicons name="radio" size={24} color="#FFD700" />
            <View style={styles.radioTextContainer}>
              <Text style={styles.radioButtonTitle}>📻 Rádio Gospia</Text>
              <Text style={styles.radioButtonSubtitle}>Música gospel 24h</Text>
            </View>
            <Ionicons name="play-circle" size={28} color="rgba(255,255,255,0.8)" />
          </View>
        </TouchableOpacity>

        {/* Iniciar Conversa */}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigateToChat()}
          activeOpacity={0.8}
        >
          <Text style={styles.mainButtonText}>Iniciar Conversa</Text>
        </TouchableOpacity>

        {/* Seja Pro */}
        {!isPro && (
          <TouchableOpacity
            style={styles.proButton}
            onPress={() => navigation?.navigate('Upgrade')}
            activeOpacity={0.8}
          >
            <View style={styles.proButtonContent}>
              <View>
                <Text style={styles.proButtonTitle}>Seja Pro!</Text>
                <Text style={styles.proButtonSubtitle}>Mensagens ilimitadas</Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B9AC4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: isSmallDevice ? 12 : 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: isSmallDevice ? 36 : 44,
    height: isSmallDevice ? 36 : 44,
    borderRadius: isSmallDevice ? 18 : 22,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: isSmallDevice ? 24 : 28,
    fontWeight: '700',
    color: 'white',
  },
  creditsButton: {},
  creditsBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  creditsNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  creditsLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 1,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  proText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  versiculoCard: {
    backgroundColor: '#5AADCF',
    borderRadius: 16,
    padding: isSmallDevice ? 16 : 20,
    marginBottom: isSmallDevice ? 20 : 28,
  },
  versiculoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  versiculoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  versiculoIcon: {
    fontSize: 24,
  },
  versiculoTexto: {
    fontSize: isSmallDevice ? 17 : 19,
    fontStyle: 'italic',
    color: 'white',
    lineHeight: isSmallDevice ? 24 : 28,
    marginBottom: 8,
  },
  versiculoRef: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  sectionTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  actionCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#5AADCF',
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 24 : 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  radioButton: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 16 : 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  radioButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radioTextContainer: {
    flex: 1,
  },
  radioButtonTitle: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: 'white',
  },
  radioButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  mainButton: {
    backgroundColor: '#1B6B8C',
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 18 : 22,
    alignItems: 'center',
    marginBottom: 12,
  },
  mainButtonText: {
    fontSize: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    color: 'white',
  },
  proButton: {
    backgroundColor: '#1B6B8C',
    borderRadius: 16,
    paddingVertical: isSmallDevice ? 16 : 20,
    paddingHorizontal: 20,
  },
  proButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  proButtonTitle: {
    fontSize: isSmallDevice ? 17 : 19,
    fontWeight: '700',
    color: 'white',
  },
  proButtonSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});

