import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    useIcon: true,
    iconName: 'sparkles',
    title: 'Bem-vindo ao Gospia',
    subtitle: 'Seu conselheiro espiritual',
    description: 'Converse sobre fé, vida e espiritualidade a qualquer momento.',
  },
  {
    iconName: 'chatbubbles',
    title: 'Converse Livremente',
    subtitle: 'Sem julgamentos',
    description: 'Tire dúvidas sobre a Bíblia, peça conselhos ou desabafe.',
  },
  {
    iconName: 'heart',
    title: 'Orações',
    subtitle: 'Para seu momento',
    description: 'Receba orações especiais baseadas nas suas necessidades.',
  },
  {
    iconName: 'book',
    title: 'Sabedoria Bíblica',
    subtitle: 'Versículos e reflexões',
    description: 'Versículos relevantes e reflexões para seu dia a dia.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <LinearGradient
      colors={['#3E9BCB', '#2a7ba8', '#1a5a7a']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3E9BCB" translucent />
      
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* Skip Button */}
        <TouchableOpacity 
          style={styles.skipBtn} 
          onPress={onComplete}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Pular</Text>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Slide Content */}
        <View style={styles.slideContent}>
          <View style={styles.iconBox}>
            {slide.useIcon ? (
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            ) : (
              <Ionicons name={slide.iconName as any} size={56} color="white" />
            )}
          </View>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          {/* Dots */}
          <View style={styles.dots}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot, 
                  i === currentSlide && styles.dotActive,
                  i < currentSlide && styles.dotCompleted
                ]}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonsRow}>
            {!isFirstSlide && (
              <TouchableOpacity 
                style={styles.prevBtn} 
                onPress={handlePrev}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={22} color="#3E9BCB" />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.nextBtn, isFirstSlide && styles.nextBtnFull]} 
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextBtnText}>
                {isLastSlide ? 'Começar' : 'Próximo'}
              </Text>
              <Ionicons name={isLastSlide ? "checkmark" : "arrow-forward"} size={20} color="#3E9BCB" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  skipBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end', 
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
  },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, fontWeight: '500' },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconBox: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
  },
  footer: { paddingHorizontal: 24 },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 6,
  },
  dotActive: { 
    backgroundColor: 'white', 
    width: 28,
  },
  dotCompleted: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prevBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnFull: {
    flex: 1,
  },
  nextBtnText: { 
    color: '#3E9BCB', 
    fontSize: 18, 
    fontWeight: '700',
  },
});
