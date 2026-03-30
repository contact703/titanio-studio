// src/services/social/videoCall.ts
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../../lib/supabase';

// Configuração do Jitsi
const JITSI_SERVER = 'https://meet.jit.si';
const APP_PREFIX = 'Gospia'; // Prefixo para identificar salas do app

// Interface para participante na chamada
export interface VideoCallParticipant {
  id: string;
  user_id: string;
  room_id: string;
  joined_at: string;
  left_at: string | null;
  display_name: string;
  avatar_url: string | null;
}

// Interface para status da chamada
export interface VideoCallStatus {
  isActive: boolean;
  participantCount: number;
  participants: VideoCallParticipant[];
}

/**
 * Gera o nome da sala Jitsi baseado no ID da sala de oração
 * Formato: GospiaRoom{roomId} para evitar conflitos com outras salas públicas
 */
export const generateJitsiRoomName = (roomId: string): string => {
  // Remove caracteres especiais e cria um nome único
  const sanitizedId = roomId.replace(/[^a-zA-Z0-9]/g, '');
  return `${APP_PREFIX}Room${sanitizedId}`;
};

/**
 * Gera a URL completa do Jitsi com configurações
 */
export const generateJitsiUrl = (
  roomId: string,
  displayName: string,
  email?: string,
  avatarUrl?: string,
  options?: {
    audioMuted?: boolean;
    videoMuted?: boolean;
    subject?: string;
  }
): string => {
  const roomName = generateJitsiRoomName(roomId);
  
  // Configurações via URL hash
  const configParams: string[] = [];
  
  // Configurações de UI
  configParams.push('config.prejoinPageEnabled=false'); // Pular tela de pré-entrada
  configParams.push('config.disableDeepLinking=false'); // Permitir deep link para app
  configParams.push('config.hideConferenceTimer=true');
  configParams.push('config.hideConferenceSubject=false');
  configParams.push('config.disableInviteFunctions=true'); // Desabilitar convites externos
  
  // Configurações de áudio/vídeo
  if (options?.audioMuted) {
    configParams.push('config.startWithAudioMuted=true');
  }
  if (options?.videoMuted) {
    configParams.push('config.startWithVideoMuted=true');
  }
  
  // Configurações de interface
  configParams.push('interfaceConfig.SHOW_JITSI_WATERMARK=false');
  configParams.push('interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false');
  configParams.push('interfaceConfig.DEFAULT_BACKGROUND=#5BA3E0'); // Cor do Gospia
  configParams.push('interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS=false');
  configParams.push('interfaceConfig.MOBILE_APP_PROMO=false'); // Não mostrar promo do app
  
  // Informações do usuário
  if (displayName) {
    configParams.push(`userInfo.displayName=${encodeURIComponent(displayName)}`);
  }
  if (email) {
    configParams.push(`userInfo.email=${encodeURIComponent(email)}`);
  }
  if (avatarUrl) {
    configParams.push(`userInfo.avatarURL=${encodeURIComponent(avatarUrl)}`);
  }
  
  // Assunto da sala
  if (options?.subject) {
    configParams.push(`config.subject=${encodeURIComponent(options.subject)}`);
  }
  
  const configString = configParams.length > 0 ? `#${configParams.join('&')}` : '';
  
  return `${JITSI_SERVER}/${roomName}${configString}`;
};

/**
 * Abre a videochamada Jitsi
 * Tenta abrir no app Jitsi se instalado, senão abre no navegador
 */
export const openVideoCall = async (
  roomId: string,
  displayName: string,
  email?: string,
  avatarUrl?: string,
  options?: {
    audioMuted?: boolean;
    videoMuted?: boolean;
    subject?: string;
    preferApp?: boolean; // Tentar abrir no app Jitsi primeiro
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const webUrl = generateJitsiUrl(roomId, displayName, email, avatarUrl, options);
    const roomName = generateJitsiRoomName(roomId);
    
    // URL do app Jitsi Meet
    const appUrl = `org.jitsi.meet://${roomName}`;
    
    if (options?.preferApp) {
      // Tentar abrir no app Jitsi primeiro
      const canOpen = await Linking.canOpenURL(appUrl);
      if (canOpen) {
        await Linking.openURL(appUrl);
        return { success: true };
      }
    }
    
    // Abrir no navegador in-app (melhor experiência)
    const result = await WebBrowser.openBrowserAsync(webUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: '#5BA3E0',
      toolbarColor: '#5BA3E0',
      dismissButtonStyle: 'close',
      showTitle: true,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao abrir videochamada:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

/**
 * Registra entrada do usuário na videochamada
 */
export const joinVideoCall = async (
  roomId: string,
  userId: string,
  displayName: string,
  avatarUrl?: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verificar se já está na chamada
    const { data: existing } = await supabase
      .from('video_call_participants')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .is('left_at', null)
      .single();
    
    if (existing) {
      // Já está na chamada
      return { success: true };
    }
    
    // Registrar entrada
    const { error } = await supabase
      .from('video_call_participants')
      .insert({
        room_id: roomId,
        user_id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
        joined_at: new Date().toISOString(),
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar entrada na videochamada:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao entrar na chamada',
    };
  }
};

/**
 * Registra saída do usuário da videochamada
 */
export const leaveVideoCall = async (
  roomId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('video_call_participants')
      .update({ left_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .is('left_at', null);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao registrar saída da videochamada:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao sair da chamada',
    };
  }
};

/**
 * Obtém status atual da videochamada
 */
export const getVideoCallStatus = async (
  roomId: string
): Promise<{ data: VideoCallStatus | null; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('video_call_participants')
      .select(`
        id,
        user_id,
        room_id,
        joined_at,
        left_at,
        display_name,
        avatar_url
      `)
      .eq('room_id', roomId)
      .is('left_at', null)
      .order('joined_at', { ascending: true });
    
    if (error) throw error;
    
    return {
      data: {
        isActive: (data?.length || 0) > 0,
        participantCount: data?.length || 0,
        participants: data || [],
      },
    };
  } catch (error) {
    console.error('Erro ao obter status da videochamada:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Erro ao obter status',
    };
  }
};

/**
 * Inscreve para atualizações em tempo real dos participantes
 */
export const subscribeToVideoCall = (
  roomId: string,
  onUpdate: (status: VideoCallStatus) => void
) => {
  const channel = supabase
    .channel(`video_call:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'video_call_participants',
        filter: `room_id=eq.${roomId}`,
      },
      async () => {
        // Buscar status atualizado
        const { data } = await getVideoCallStatus(roomId);
        if (data) {
          onUpdate(data);
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Limpa participantes antigos (saíram há mais de 1 hora ou entraram há mais de 4 horas)
 * Pode ser chamada periodicamente para manter a tabela limpa
 */
export const cleanupOldParticipants = async (): Promise<void> => {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    
    // Marcar como saídos os que entraram há mais de 4 horas (timeout)
    await supabase
      .from('video_call_participants')
      .update({ left_at: new Date().toISOString() })
      .is('left_at', null)
      .lt('joined_at', fourHoursAgo);
    
    // Deletar registros antigos
    await supabase
      .from('video_call_participants')
      .delete()
      .lt('left_at', oneHourAgo);
  } catch (error) {
    console.error('Erro na limpeza de participantes:', error);
  }
};

export default {
  generateJitsiRoomName,
  generateJitsiUrl,
  openVideoCall,
  joinVideoCall,
  leaveVideoCall,
  getVideoCallStatus,
  subscribeToVideoCall,
  cleanupOldParticipants,
};
