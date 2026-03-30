import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const GROQ_API_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

let recording: Audio.Recording | null = null;

export const SpeechService = {
  async startRecording(): Promise<boolean> {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        console.log('Permissao de microfone negada');
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording = newRecording;
      return true;
    } catch (error) {
      console.error('Erro ao iniciar gravacao:', error);
      return false;
    }
  },

  async stopRecording(): Promise<string | null> {
    try {
      if (!recording) return null;

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      recording = null;

      if (!uri) return null;

      const transcription = await this.transcribe(uri);
      
      await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {});

      return transcription;
    } catch (error) {
      console.error('Erro ao parar gravacao:', error);
      recording = null;
      return null;
    }
  },

  async transcribe(audioUri: string): Promise<string | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) return null;

      const base64Audio = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const formData = new FormData();
      formData.append('file', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'audio.m4a',
      } as any);
      formData.append('model', 'whisper-large-v3');
      formData.append('language', 'pt');

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + GROQ_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro Groq Whisper:', response.status, errorText);
        return null;
      }

      const data = await response.json();
      return data.text || null;
    } catch (error) {
      console.error('Erro na transcricao:', error);
      return null;
    }
  },

  isRecording(): boolean {
    return recording !== null;
  },

  async cancelRecording(): Promise<void> {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {}
      recording = null;
    }
  },
};

export default SpeechService;
