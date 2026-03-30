import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../lib/supabase';

const GROQ_API_KEY = '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';

const PALAVRAS_PROIBIDAS = [
  'porra', 'caralho', 'foda', 'merda', 'puta', 'viado', 'bicha',
  'buceta', 'piroca', 'cu ', 'cuzao', 'arrombado', 'filha da puta',
  'desgraca', 'maldito', 'suicidio', 'me matar', 'vou morrer',
  'quero morrer', 'drogas', 'cocaina', 'maconha', 'crack',
  'nazista', 'hitler', 'terrorismo', 'bomba', 'matar',
];

function quickTextCheck(text: string): { safe: boolean; reason?: string } {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const palavra of PALAVRAS_PROIBIDAS) {
    if (lower.includes(palavra)) {
      return { safe: false, reason: 'Conteudo inapropriado detectado' };
    }
  }
  if (/(.)\1{5,}/.test(text)) {
    return { safe: false, reason: 'Texto com repeticao excessiva' };
  }
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urls = lower.match(urlRegex);
  if (urls && urls.length > 3) {
    return { safe: false, reason: 'Muitos links (possivel spam)' };
  }
  return { safe: true };
}

export function moderateText(text: string): { safe: boolean; reason?: string } {
  return quickTextCheck(text);
}

export async function moderateTextWithAI(text: string): Promise<{ safe: boolean; reason?: string }> {
  const quickCheck = quickTextCheck(text);
  if (!quickCheck.safe) return quickCheck;
  if (text.length < 20) return { safe: true };

  try {
    const systemPrompt = 'Voce e um moderador de conteudo para um app cristao chamado Gospia. Analise o texto e responda APENAS com JSON: {"safe": true} ou {"safe": false, "reason": "motivo curto"}. Rejeite conteudo com: palavroes, ofensas, odio, violencia, conteudo sexual, spam, promocao de drogas, suicidio, automutilacao, discriminacao. Aceite: discussoes religiosas respeitosas, pedidos de oracao, testemunhos, duvidas sobre fe.';
    const userPrompt = 'Analise: "' + text + '"';

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GROQ_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    try {
      const result = JSON.parse(content);
      return { safe: result.safe !== false, reason: result.reason };
    } catch { return { safe: true }; }
  } catch (error) {
    console.error('AI moderation error:', error);
    return { safe: true };
  }
}

export async function uploadImage(uri: string, bucket: string = 'social-images'): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Nao autenticado' };

    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
    const fileName = user.id + '/' + Date.now() + '.' + ext;

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const { error } = await supabase.storage.from(bucket).upload(fileName, bytes, { contentType: mimeType, upsert: false });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error('Upload error:', error);
    return { success: false, error: error.message || 'Erro no upload' };
  }
}

export async function moderateImageWithAI(base64Image: string): Promise<{ safe: boolean; reason?: string }> {
  try {
    const textPrompt = 'Voce e um moderador de imagens para um app cristao. Analise se a imagem e apropriada. REJEITE imagens com: nudez, violencia, sangue, armas, drogas, simbolos de odio, conteudo sexual, gore. ACEITE: pessoas vestidas, paisagens, comida, animais, objetos, arte apropriada, fotos de familia. Responda APENAS com JSON: {"safe": true} ou {"safe": false, "reason": "motivo curto"}';
    const imageUrl = 'data:image/jpeg;base64,' + base64Image;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + GROQ_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: textPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    try {
      const result = JSON.parse(content);
      return { safe: result.safe !== false, reason: result.reason };
    } catch { return { safe: true }; }
  } catch (error) {
    console.error('Image AI moderation error:', error);
    return { safe: true };
  }
}

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }
  return null;
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;
  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  if (!result.canceled && result.assets[0]) {
    return result.assets[0].uri;
  }
  return null;
}

export async function uploadWithModeration(uri: string, bucket: string = 'social-images'): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const modResult = await moderateImageWithAI(base64);
    if (!modResult.safe) {
      return { success: false, error: modResult.reason || 'Imagem inapropriada detectada' };
    }
    return await uploadImage(uri, bucket);
  } catch (error: any) {
    console.error('Upload with moderation error:', error);
    return { success: false, error: error.message || 'Erro no upload' };
  }
}

export async function uploadProfilePhoto(uri: string): Promise<{ success: boolean; url?: string; error?: string }> {
  return await uploadWithModeration(uri, 'avatars');
}

export async function uploadForumImage(uri: string): Promise<{ success: boolean; url?: string; error?: string }> {
  return await uploadWithModeration(uri, 'forum-images');
}
