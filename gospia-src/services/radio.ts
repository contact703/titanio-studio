// src/services/radio.ts — Serviço de Rádio Gospia
import { Audio } from 'expo-av';
import { supabase } from '../lib/supabase';

export interface Song {
  id: string;
  title: string;
  artist: string;
  url: string;
  category: 'music' | 'jingle';
  cover_url?: string;
  play_count?: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

class RadioService {
  private songs: Song[] = [];
  private jingles: Song[] = [];
  private queue: Song[] = [];
  private currentIndex = 0;
  private songsUntilJingle = 0;
  private sound: Audio.Sound | null = null;
  private _isPlaying = false;
  private _currentSong: Song | null = null;
  private _positionMs = 0;
  private _durationMs = 0;
  private listeners: Set<() => void> = new Set();

  get isPlaying() { return this._isPlaying; }
  get currentSong() { return this._currentSong; }
  get positionMs() { return this._positionMs; }
  get durationMs() { return this._durationMs; }
  get isJingle() { return this._currentSong?.category === 'jingle'; }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private notify() { this.listeners.forEach(fn => fn()); }

  async loadSongs() {
    try {
      const { data: allSongs, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !allSongs) {
        console.error('[Radio] Erro ao carregar músicas:', error);
        return;
      }

      this.songs = allSongs.filter((s: Song) => s.category === 'music');
      this.jingles = allSongs.filter((s: Song) => s.category === 'jingle');
      this.buildQueue();
    } catch (e) {
      console.error('[Radio] Erro:', e);
    }
  }

  private buildQueue() {
    this.queue = shuffle(this.songs);
    this.currentIndex = 0;
    this.songsUntilJingle = 5;
  }

  private getNext(): Song | null {
    if (this.queue.length === 0) return null;

    this.songsUntilJingle--;

    if (this.songsUntilJingle <= 0 && this.jingles.length > 0) {
      this.songsUntilJingle = 5;
      return this.jingles[Math.floor(Math.random() * this.jingles.length)];
    }

    if (this.currentIndex >= this.queue.length) {
      this.queue = shuffle(this.songs);
      this.currentIndex = 0;
    }

    return this.queue[this.currentIndex++];
  }

  async play() {
    if (this.songs.length === 0) await this.loadSongs();
    if (this.songs.length === 0) return;

    const song = this.getNext();
    if (!song) return;

    await this.stopCurrent();

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: song.url },
        { shouldPlay: true },
        this.onPlaybackUpdate
      );

      this.sound = sound;
      this._currentSong = song;
      this._isPlaying = true;
      this.notify();

      supabase.rpc('increment_play_count', { song_id: song.id }).catch(() => {});
    } catch (e) {
      console.error('[Radio] Erro ao tocar:', e);
      this._isPlaying = false;
      this.notify();
    }
  }

  private onPlaybackUpdate = (status: any) => {
    if (!status.isLoaded) return;

    this._positionMs = status.positionMillis || 0;
    this._durationMs = status.durationMillis || 0;

    if (status.didJustFinish) {
      this.play();
    }

    this.notify();
  };

  async pause() {
    if (this.sound) {
      await this.sound.pauseAsync();
      this._isPlaying = false;
      this.notify();
    }
  }

  async resume() {
    if (this.sound) {
      await this.sound.playAsync();
      this._isPlaying = true;
      this.notify();
    }
  }

  async togglePlayPause() {
    if (this._isPlaying) {
      await this.pause();
    } else if (this.sound) {
      await this.resume();
    } else {
      await this.play();
    }
  }

  async skip() {
    if (this.isJingle) return;
    await this.play();
  }

  async seek(positionMs: number) {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMs);
    }
  }

  async stopCurrent() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch (e) {}
      this.sound = null;
    }
    this._positionMs = 0;
    this._durationMs = 0;
  }

  async destroy() {
    await this.stopCurrent();
    this._isPlaying = false;
    this._currentSong = null;
    this.listeners.clear();
  }
}

export const radioService = new RadioService();
export default radioService;
