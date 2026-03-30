import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Handler para erros de token - limpa sessão inválida automaticamente
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token atualizado com sucesso');
  }
  if (event === 'SIGNED_OUT') {
    console.log('Sessão encerrada');
  }
});

// Função para verificar e limpar sessão inválida
export async function checkAndRefreshSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message.includes('Invalid Refresh Token')) {
      console.log('Token inválido detectado, limpando sessão...');
      await AsyncStorage.multiRemove([
        'supabase.auth.token',
        '@gospia_user_profile',
        '@gospia_notifications_enabled',
      ]);
      await supabase.auth.signOut();
      return null;
    }
    return data.session;
  } catch (e) {
    console.log('Erro ao verificar sessão:', e);
    return null;
  }
}
