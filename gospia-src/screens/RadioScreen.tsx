// src/screens/RadioScreen.tsx — Rádio Gospia Player
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import radioService from '../services/radio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH * 0.65;

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RadioScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [, forceUpdate] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const unsub = radioService.subscribe(() => forceUpdate(v => v + 1));

    // Start playing on mount if not already
    if (!radioService.isPlaying && !radioService.currentSong) {
      radioService.play();
    }

    return unsub;
  }, []);

  // Spin animation for the vinyl disc
  useEffect(() => {
    if (radioService.isPlaying) {
      spinAnim.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        })
      );
      spinAnim.current.start();
    } else {
      spinAnim.current?.stop();
    }
  }, [radioService.isPlaying]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const song = radioService.currentSong;
  const isJingle = radioService.isJingle;
  const progress = radioService.durationMs > 0
    ? radioService.positionMs / radioService.durationMs
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-down" size={28} color="#FFD700" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerLabel}>RÁDIO GOSPIA</Text>
          <Text style={styles.headerSub}>Música Gospel 24h</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Artwork / Vinyl */}
      <View style={styles.artworkContainer}>
        <Animated.View style={[styles.vinyl, { transform: [{ rotate: spin }] }]}>
          <View style={styles.vinylOuter}>
            <View style={styles.vinylInner}>
              <Ionicons name="musical-notes" size={40} color="#FFD700" />
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Song Info */}
      <View style={styles.songInfo}>
        {isJingle ? (
          <View style={styles.jingleBadge}>
            <Ionicons name="radio" size={16} color="#1a1a2e" />
            <Text style={styles.jingleText}>VINHETA</Text>
          </View>
        ) : null}
        <Text style={styles.songTitle} numberOfLines={2}>
          {song?.title || 'Carregando...'}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song?.artist || 'Rádio Gospia'}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(radioService.positionMs)}</Text>
          <Text style={styles.timeText}>{formatTime(radioService.durationMs)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => radioService.skip()}
          disabled={isJingle}
          style={[styles.controlBtn, isJingle && styles.controlDisabled]}
        >
          <Ionicons
            name="play-skip-back"
            size={28}
            color={isJingle ? '#555' : '#FFD700'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => radioService.togglePlayPause()}
          style={styles.playBtn}
        >
          <Ionicons
            name={radioService.isPlaying ? 'pause' : 'play'}
            size={36}
            color="#1a1a2e"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => radioService.skip()}
          disabled={isJingle}
          style={[styles.controlBtn, isJingle && styles.controlDisabled]}
        >
          <Ionicons
            name="play-skip-forward"
            size={28}
            color={isJingle ? '#555' : '#FFD700'}
          />
        </TouchableOpacity>
      </View>

      {isJingle && (
        <Text style={styles.jingleHint}>
          Não é possível pular a vinheta
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 2,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  artworkContainer: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinyl: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: ARTWORK_SIZE / 2,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  vinylOuter: {
    width: ARTWORK_SIZE * 0.85,
    height: ARTWORK_SIZE * 0.85,
    borderRadius: (ARTWORK_SIZE * 0.85) / 2,
    backgroundColor: '#0f3460',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  vinylInner: {
    width: ARTWORK_SIZE * 0.35,
    height: ARTWORK_SIZE * 0.35,
    borderRadius: (ARTWORK_SIZE * 0.35) / 2,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  songInfo: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  jingleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    gap: 4,
  },
  jingleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: 1,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 6,
  },
  songArtist: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: {
    opacity: 0.4,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  jingleHint: {
    marginTop: 16,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontStyle: 'italic',
  },
});
