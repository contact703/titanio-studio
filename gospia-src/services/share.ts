import { supabase } from '../lib/supabase';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const BACKEND_URL = 'https://www.gospia.app';

// Criar link compartilhavel para mensagem do chat
export async function createShareLink(messageContent: string): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(BACKEND_URL + '/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? 'Bearer ' + session.access_token : '',
      },
      body: JSON.stringify({ content: messageContent, type: 'message' }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.url || null;
  } catch (error) {
    console.error('Erro ao criar link:', error);
    return null;
  }
}

// Compartilhar post do feed
export async function shareFeedPost(
  postId: string,
  imageUrl: string,
  caption?: string,
  authorName?: string
): Promise<boolean> {
  try {
    const shareUrl = BACKEND_URL + '/post/' + postId;
    const shareMessage = authorName 
      ? 'Veja o post de ' + authorName + ' no Gospia!\n\n' + (caption ? '"' + caption + '"\n\n' : '') + shareUrl
      : 'Veja este post no Gospia!\n\n' + (caption ? '"' + caption + '"\n\n' : '') + shareUrl;

    // Verificar se pode compartilhar
    const canShare = await Sharing.isAvailableAsync();
    
    if (canShare) {
      // Baixar imagem para compartilhar
      const fileUri = FileSystem.cacheDirectory + 'share_' + postId + '.jpg';
      
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
      
      if (downloadResult.status === 200) {
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Compartilhar Post',
          UTI: 'public.jpeg',
        });
        return true;
      }
    }
    
    // Fallback: compartilhar apenas texto
    await Sharing.shareAsync(shareUrl, {
      dialogTitle: 'Compartilhar Post',
    });
    return true;
  } catch (error) {
    console.error('Erro ao compartilhar:', error);
    return false;
  }
}

// Compartilhar texto simples
export async function shareText(text: string, title?: string): Promise<boolean> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) return false;

    // Criar arquivo temporario com o texto
    const fileUri = FileSystem.cacheDirectory + 'share_text.txt';
    await FileSystem.writeAsStringAsync(fileUri, text);

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: title || 'Compartilhar',
    });

    return true;
  } catch (error) {
    console.error('Erro ao compartilhar texto:', error);
    return false;
  }
}

// Compartilhar perfil de usuario
export async function shareUserProfile(
  userId: string,
  userName: string
): Promise<boolean> {
  try {
    const shareUrl = BACKEND_URL + '/user/' + userId;
    const shareMessage = 'Conhea ' + userName + ' no Gospia!\n\n' + shareUrl;

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) return false;

    const fileUri = FileSystem.cacheDirectory + 'share_profile.txt';
    await FileSystem.writeAsStringAsync(fileUri, shareMessage);

    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: 'Compartilhar Perfil',
    });

    return true;
  } catch (error) {
    console.error('Erro ao compartilhar perfil:', error);
    return false;
  }
}

export default {
  createShareLink,
  shareFeedPost,
  shareText,
  shareUserProfile,
};
