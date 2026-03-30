import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';

const VOICE_ID = 'JXi4NKtAyD89KaHCKIGW';
const API_KEY = 'sk_20da726a9b1fc53800fcc32cf39773cd36db81c37dc805e0';
const API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE_ID;

let currentSound: Audio.Sound | null = null;

export const ElevenLabsService = {
  async speak(text: string): Promise<Audio.Sound | null> {
    try {
      await this.stop();

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs error:', response.status, errorText);
        return null;
      }

      const audioBlob = await response.blob();
      const base64Audio = await blobToBase64(audioBlob);

      const fileUri = FileSystem.cacheDirectory + 'pastor_audio_' + Date.now() + '.mp3';
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      currentSound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
          currentSound = null;
        }
      });

      return sound;
    } catch (error) {
      console.error('[ElevenLabs] Erro:', error);
      return null;
    }
  },

  async stop(): Promise<void> {
    if (currentSound) {
      try {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      } catch (e) {}
      currentSound = null;
    }
  },

  isPlaying(): boolean {
    return currentSound !== null;
  },
};

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default ElevenLabsService;
