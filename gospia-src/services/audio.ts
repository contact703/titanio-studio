import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const ELEVEN_API_KEY = 'sk_20da726a9b1fc53800fcc32cf39773cd36db81c37dc805e0';
const GROQ_API_KEY = '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';
const VOICE_ID = 'JXi4NKtAyD89KaHCKIGW';

const cleanTextForAudio = (text: string): string => {
  return text
    .replace(/[*_#`~\[\]()]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function textToSpeech(text: string): Promise<Audio.Sound | null> {
  try {
    if (!ELEVEN_API_KEY) {
      console.error('Missing ELEVEN_API_KEY');
      return null;
    }

    const safeText = cleanTextForAudio(text).slice(0, 4000);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?optimize_streaming_latency=2&output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_API_KEY,
        },
        body: JSON.stringify({
          text: safeText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.40,
            similarity_boost: 0.70,
            style: 0.12,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', errorText);
      return null;
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = arrayBufferToBase64(audioBuffer);
    
    const fileUri = FileSystem.cacheDirectory + 'pastor_audio.mp3';
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: false }
    );

    return sound;
  } catch (error) {
    console.error('TTS Error:', error);
    return null;
  }
}

export async function playSound(sound: Audio.Sound): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    await sound.playAsync();
  } catch (error) {
    console.error('Play sound error:', error);
  }
}

export async function stopSound(sound: Audio.Sound): Promise<void> {
  try {
    await sound.stopAsync();
    await sound.unloadAsync();
  } catch (error) {
    console.error('Stop sound error:', error);
  }
}

let currentRecording: Audio.Recording | null = null;

export async function startRecording(): Promise<Audio.Recording | null> {
  try {
    if (currentRecording) {
      try {
        await currentRecording.stopAndUnloadAsync();
      } catch (e) {}
      currentRecording = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });

    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== 'granted') {
      console.error('Audio permission not granted');
      return null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    currentRecording = recording;
    return recording;
  } catch (error) {
    console.error('Start recording error:', error);
    currentRecording = null;
    return null;
  }
}

export async function stopRecording(recording: Audio.Recording): Promise<string | null> {
  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    currentRecording = null;
    return recording.getURI();
  } catch (error) {
    console.error('Stop recording error:', error);
    return null;
  }
}

export async function speechToText(audioUri: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);
    formData.append('model', 'whisper-large-v3');
    formData.append('language', 'pt');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API Error:', errorText);
      return null;
    }

    const data = await response.json();
    return data.text || null;
  } catch (error) {
    console.error('STT Error:', error);
    return null;
  }
}

