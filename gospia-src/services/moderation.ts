import { supabase } from '../lib/supabase';

const OPENAI_API_KEY = 'sk-proj-sua-chave-aqui'; // Vamos usar via backend
const BACKEND_URL = 'https://www.gospia.app';

export interface ModerationResult {
  safe: boolean;
  flagged: boolean;
  categories: {
    sexual: boolean;
    violence: boolean;
    hate: boolean;
    harassment: boolean;
    selfHarm: boolean;
    illicit: boolean;
  };
  scores: {
    sexual: number;
    violence: number;
    hate: number;
    harassment: number;
    selfHarm: number;
    illicit: number;
  };
  reason?: string;
}

// Moderar texto localmente (palavras proibidas)
const BANNED_WORDS = [
  'porra', 'caralho', 'foda', 'puta', 'viado', 'buceta', 'piroca',
  'merda', 'cuzao', 'arrombado', 'filhodaputa', 'desgraca',
  'porn', 'xxx', 'sexo explicito', 'nude', 'nudes',
];

export function moderateTextLocal(text: string): { safe: boolean; reason?: string } {
  const lowerText = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const word of BANNED_WORDS) {
    const normalizedWord = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lowerText.includes(normalizedWord)) {
      return { safe: false, reason: 'Conteudo inapropriado detectado' };
    }
  }
  
  return { safe: true };
}

// Moderar texto com IA (OpenAI - via backend)
export async function moderateTextWithAI(text: string): Promise<ModerationResult> {
  try {
    // Primeiro verifica localmente
    const localCheck = moderateTextLocal(text);
    if (!localCheck.safe) {
      return {
        safe: false,
        flagged: true,
        categories: { sexual: false, violence: false, hate: false, harassment: true, selfHarm: false, illicit: false },
        scores: { sexual: 0, violence: 0, hate: 0, harassment: 1, selfHarm: 0, illicit: 0 },
        reason: localCheck.reason,
      };
    }

    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(BACKEND_URL + '/api/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? 'Bearer ' + session.access_token : '',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.log('Moderacao API indisponivel, permitindo');
      return createSafeResult();
    }

    const data = await response.json();
    return parseModerationResponse(data);
  } catch (error) {
    console.error('Erro na moderacao:', error);
    return createSafeResult();
  }
}

// Moderar imagem com IA (OpenAI - via backend)
export async function moderateImage(imageUrl: string): Promise<ModerationResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(BACKEND_URL + '/api/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? 'Bearer ' + session.access_token : '',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
      console.log('Moderacao de imagem indisponivel, permitindo');
      return createSafeResult();
    }

    const data = await response.json();
    return parseModerationResponse(data);
  } catch (error) {
    console.error('Erro na moderacao de imagem:', error);
    return createSafeResult();
  }
}

// Moderar imagem em base64
export async function moderateImageBase64(base64Data: string): Promise<ModerationResult> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(BACKEND_URL + '/api/moderate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? 'Bearer ' + session.access_token : '',
      },
      body: JSON.stringify({ imageBase64: base64Data }),
    });

    if (!response.ok) {
      console.log('Moderacao de imagem indisponivel, permitindo');
      return createSafeResult();
    }

    const data = await response.json();
    return parseModerationResponse(data);
  } catch (error) {
    console.error('Erro na moderacao de imagem:', error);
    return createSafeResult();
  }
}

// Denunciar conteudo
export async function reportContent(
  contentType: 'post' | 'comment' | 'user' | 'message',
  contentId: string,
  reason: 'nudity' | 'violence' | 'spam' | 'hate' | 'other',
  description?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Nao autenticado' };

    // Verificar se ja denunciou
    const { data: existing } = await supabase
      .from('content_reports')
      .select('id')
      .eq('reporter_id', user.id)
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single();

    if (existing) {
      return { success: false, error: 'Voce ja denunciou este conteudo' };
    }

    const { error } = await supabase
      .from('content_reports')
      .insert({
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason,
        description,
        status: 'pending',
      });

    if (error) {
      console.error('Erro ao denunciar:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro reportContent:', error);
    return { success: false, error: error.message || 'Erro ao denunciar' };
  }
}

// Helpers
function createSafeResult(): ModerationResult {
  return {
    safe: true,
    flagged: false,
    categories: { sexual: false, violence: false, hate: false, harassment: false, selfHarm: false, illicit: false },
    scores: { sexual: 0, violence: 0, hate: 0, harassment: 0, selfHarm: 0, illicit: 0 },
  };
}

function parseModerationResponse(data: any): ModerationResult {
  if (!data || !data.results || !data.results[0]) {
    return createSafeResult();
  }

  const result = data.results[0];
  const categories = result.categories || {};
  const scores = result.category_scores || {};

  const isFlagged = result.flagged || false;

  // Determinar razao
  let reason: string | undefined;
  if (categories.sexual || categories['sexual/minors']) {
    reason = 'Conteudo sexual detectado';
  } else if (categories.violence || categories['violence/graphic']) {
    reason = 'Conteudo violento detectado';
  } else if (categories.hate || categories['hate/threatening']) {
    reason = 'Discurso de odio detectado';
  } else if (categories.harassment || categories['harassment/threatening']) {
    reason = 'Assedio detectado';
  } else if (categories['self-harm'] || categories['self-harm/intent']) {
    reason = 'Conteudo de autolesao detectado';
  } else if (categories.illicit || categories['illicit/violent']) {
    reason = 'Conteudo ilicito detectado';
  }

  return {
    safe: !isFlagged,
    flagged: isFlagged,
    categories: {
      sexual: categories.sexual || categories['sexual/minors'] || false,
      violence: categories.violence || categories['violence/graphic'] || false,
      hate: categories.hate || categories['hate/threatening'] || false,
      harassment: categories.harassment || categories['harassment/threatening'] || false,
      selfHarm: categories['self-harm'] || categories['self-harm/intent'] || false,
      illicit: categories.illicit || categories['illicit/violent'] || false,
    },
    scores: {
      sexual: scores.sexual || 0,
      violence: scores.violence || 0,
      hate: scores.hate || 0,
      harassment: scores.harassment || 0,
      selfHarm: scores['self-harm'] || 0,
      illicit: scores.illicit || 0,
    },
    reason,
  };
}

export default {
  moderateTextLocal,
  moderateTextWithAI,
  moderateImage,
  moderateImageBase64,
  reportContent,
};
