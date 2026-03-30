// src/services/chat.ts
import { supabase } from '../lib/supabase';

const API_URL = 'https://www.gospia.app';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContext {
  gender?: 'male' | 'female' | 'other' | null;
  personalityProfile?: PersonalityProfile | null;
}

export interface PersonalityProfile {
  mbti: string | null;
  axis_scores: { EI: number; SN: number; TF: number; JP: number };
  axis_probs: { E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number };
  confidence: number;
  questions_asked: string[];
  last_question_id: string | null;
  status: 'new' | 'collecting' | 'detected' | 'confirmed';
  detected_at: string | null;
  updated_at: string;
}

export async function sendMessage(
  messages: Message[],
  userContext?: UserContext
): Promise<{ response: string; updatedProfile?: PersonalityProfile }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return { response: 'Voce precisa estar logado para conversar com o Pastor.' };
    }

    const validMessages = messages.filter(m => m.role === 'user' || m.role === 'assistant');

    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ messages: validMessages }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { response: 'Sua sessao expirou. Por favor, faca login novamente.' };
      }
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return {
      response: data.content || 'O Pastor esta em silencio. Tente novamente.',
      updatedProfile: userContext?.personalityProfile
    };
  } catch (error) {
    console.error('Erro no chat:', error);
    return { response: 'O Pastor esta ocupado no momento. Por favor, tente novamente.' };
  }
}

export async function getUserContext(): Promise<UserContext> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    const { data: profile } = await supabase.from('profiles').select('gender, personality_profile').eq('id', user.id).single();
    return { gender: profile?.gender || 'male', personalityProfile: profile?.personality_profile || null };
  } catch (error) {
    return {};
  }
}

export async function updatePersonalityProfile(profile: PersonalityProfile): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('profiles').update({ personality_profile: profile }).eq('id', user.id);
    if (error) throw error;
    return true;
  } catch (error) {
    return false;
  }
}

export async function deductCredits(): Promise<boolean> {
  return true;
}
