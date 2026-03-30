import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  credits: number;
  is_pro: boolean;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, credits, is_pro, full_name, username, avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.log('Erro ao buscar perfil:', error);
      return {
        id: user.id,
        credits: 0,
        is_pro: false,
        full_name: null,
        username: null,
        email: user.email || null,
        avatar_url: null,
      };
    }

    return {
      id: data.id,
      credits: data.credits || 0,
      is_pro: data.is_pro || false,
      full_name: data.full_name || null,
      username: data.username || null,
      email: user.email || null,
      avatar_url: data.avatar_url || null,
    };
  } catch (error) {
    console.log('Erro getUserProfile:', error);
    return null;
  }
}

export async function canSendMessage(): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const profile = await getUserProfile();

    if (!profile) {
      return { allowed: true };
    }

    if (profile.is_pro) {
      return { allowed: true };
    }

    if (profile.credits > 0) {
      return { allowed: true };
    }

    return { allowed: false, reason: 'no_credits' };
  } catch (error) {
    console.log('Erro canSendMessage:', error);
    return { allowed: true };
  }
}

export async function deductCredits(amount: number = 1): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.rpc('deduct_credits', {
      user_id: user.id,
      amount: amount
    });

    if (error) {
      console.log('Erro ao deduzir creditos:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.log('Erro deductCredits:', error);
    return false;
  }
}
