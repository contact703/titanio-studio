import { supabase } from '../../lib/supabase';
import { moderateTextWithAI, moderateImageBase64 } from '../moderation';
import { createLikeNotification, createCommentNotification } from '../pushNotifications';
import * as FileSystem from 'expo-file-system';

export interface FeedPost {
  id: string;
  author_id: string;
  caption?: string;
  image_url: string;
  location?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
    is_pro?: boolean;
    church?: string;
    city?: string;
    state?: string;
    personality_type?: string;
  };
  user_liked?: boolean;
  relevance_score?: number;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    is_pro?: boolean;
  };
}

// Buscar perfil do usuario atual para comparacao
async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, church, city, state, personality_type')
    .eq('id', user.id)
    .single();

  return data;
}

// Buscar quem o usuario segue
async function getFollowingIds(): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', user.id);

  return new Set(data?.map(f => f.following_id) || []);
}

// Calcular score de relevancia
function calculateRelevanceScore(
  post: FeedPost,
  currentUser: any,
  followingIds: Set<string>
): number {
  let score = 0;

  // Base: likes (max 30 pontos)
  score += Math.min(post.like_count * 2, 30);

  // Recencia (max 20 pontos)
  const hoursAgo = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  if (hoursAgo < 1) score += 20;
  else if (hoursAgo < 6) score += 15;
  else if (hoursAgo < 24) score += 10;
  else if (hoursAgo < 72) score += 5;

  // Segue o autor (25 pontos)
  if (followingIds.has(post.author_id)) {
    score += 25;
  }

  if (currentUser && post.author) {
    // Mesma igreja (15 pontos)
    if (currentUser.church && post.author.church && 
        currentUser.church.toLowerCase() === post.author.church.toLowerCase()) {
      score += 15;
    }

    // Mesma cidade (10 pontos)
    if (currentUser.city && post.author.city && 
        currentUser.city.toLowerCase() === post.author.city.toLowerCase()) {
      score += 10;
    }

    // Mesmo estado (5 pontos)
    if (currentUser.state && post.author.state && 
        currentUser.state.toLowerCase() === post.author.state.toLowerCase()) {
      score += 5;
    }

    // Personalidade compativel (10 pontos)
    if (currentUser.personality_type && post.author.personality_type) {
      const compatibleTypes: Record<string, string[]> = {
        'analitico': ['analitico', 'organizador'],
        'expressivo': ['expressivo', 'amigavel'],
        'amigavel': ['amigavel', 'expressivo'],
        'organizador': ['organizador', 'analitico'],
        'introvertido': ['introvertido', 'reflexivo'],
        'extrovertido': ['extrovertido', 'comunicativo'],
        'reflexivo': ['reflexivo', 'introvertido'],
        'comunicativo': ['comunicativo', 'extrovertido'],
      };
      
      const userType = currentUser.personality_type.toLowerCase();
      const authorType = post.author.personality_type.toLowerCase();
      
      if (compatibleTypes[userType]?.includes(authorType) || userType === authorType) {
        score += 10;
      }
    }
  }

  // Autor PRO ganha bonus (5 pontos)
  if (post.author?.is_pro) {
    score += 5;
  }

  return score;
}

// Buscar feed com algoritmo de relevancia avancado
export async function getFeed(limit: number = 20, offset: number = 0): Promise<FeedPost[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const [currentUser, followingIds] = await Promise.all([
      getCurrentUserProfile(),
      getFollowingIds(),
    ]);

    const fetchLimit = Math.max(limit * 3, 60);

    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(0, fetchLimit - 1);

    if (error) {
      console.error('Erro getFeed:', error);
      return [];
    }

    let posts = data || [];

    for (const post of posts) {
      const { data: author } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_pro, church, city, state, personality_type')
        .eq('id', post.author_id)
        .single();
      post.author = author || undefined;
    }

    posts = posts.map(post => ({ ...post, author: post.author, relevance_score: calculateRelevanceScore(post, currentUser, followingIds) }));

    posts.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    posts = posts.slice(offset, offset + limit);

    if (user && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: likes } = await supabase
        .from('feed_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedIds = new Set(likes?.map(l => l.post_id) || []);
      return posts.map(p => ({ ...p, author: p.author, user_liked: likedIds.has(p.id) }));
    }

    return posts;
  } catch (e) {
    console.error('Erro getFeed:', e);
    return [];
  }
}

// Buscar feed de quem o usuario segue
export async function getFollowingFeed(limit: number = 20, offset: number = 0): Promise<FeedPost[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const followingIds = await getFollowingIds();
    if (followingIds.size === 0) return [];

    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('is_hidden', false)
      .in('author_id', Array.from(followingIds))
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Erro getFollowingFeed:', error);
      return [];
    }

    const posts = data || [];

    for (const post of posts) {
      const { data: author } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_pro')
        .eq('id', post.author_id)
        .single();
      post.author = author || undefined;
    }

    if (posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: likes } = await supabase
        .from('feed_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedIds = new Set(likes?.map(l => l.post_id) || []);
      return posts.map(p => ({ ...p, author: p.author, user_liked: likedIds.has(p.id) }));
    }

    return posts;
  } catch (e) {
    console.error('Erro getFollowingFeed:', e);
    return [];
  }
}

// Buscar posts de um usuario
export async function getUserPosts(userId: string): Promise<FeedPost[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('author_id', userId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro getUserPosts:', error);
      return [];
    }

    const posts = data || [];

    const { data: author } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, is_pro')
      .eq('id', userId)
      .single();

    for (const post of posts) {
      post.author = author || undefined;
    }

    if (user && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: likes } = await supabase
        .from('feed_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      const likedIds = new Set(likes?.map(l => l.post_id) || []);
      return posts.map(p => ({ ...p, author: p.author, user_liked: likedIds.has(p.id) }));
    }

    return posts;
  } catch (e) {
    console.error('Erro getUserPosts:', e);
    return [];
  }
}

// Buscar post especifico
export async function getPost(postId: string): Promise<FeedPost | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('feed_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Erro getPost:', error);
      return null;
    }

    const { data: author } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, is_pro')
      .eq('id', data.author_id)
      .single();
    data.author = author || undefined;

    if (user) {
      const { data: like } = await supabase
        .from('feed_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      return { ...data, user_liked: !!like };
    }

    return data;
  } catch (e) {
    console.error('Erro getPost:', e);
    return null;
  }
}

// Criar post
export async function createPost(
  imageUri: string,
  caption?: string,
  location?: string
): Promise<{ success: boolean; post?: FeedPost; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Nao autenticado' };

    if (caption) {
      const textMod = await moderateTextWithAI(caption);
      if (!textMod.safe) {
        return { success: false, error: textMod.reason || 'Texto inapropriado' };
      }
    }

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const imageMod = await moderateImageBase64(base64);
    if (!imageMod.safe) {
      return { success: false, error: imageMod.reason || 'Imagem inapropriada' };
    }

    const fileName = user.id + '/' + Date.now() + '.jpg';
    const { error: uploadError } = await supabase.storage
      .from('feed-images')
      .upload(fileName, decode(base64), {
        contentType: 'image/jpeg',
      });

    if (uploadError) {
      console.error('Erro upload:', uploadError);
      return { success: false, error: 'Erro ao enviar imagem' };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('feed-images')
      .getPublicUrl(fileName);

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        author_id: user.id,
        caption,
        image_url: publicUrl,
        location,
        like_count: 0,
        comment_count: 0,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro createPost:', error);
      return { success: false, error: error.message };
    }

    return { success: true, post: data };
  } catch (e: any) {
    console.error('Erro createPost:', e);
    return { success: false, error: e.message || 'Erro ao criar post' };
  }
}

// Deletar post
export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('feed_posts')
      .delete()
      .eq('id', postId);

    return !error;
  } catch (e) {
    console.error('Erro deletePost:', e);
    return false;
  }
}

// Toggle like COM NOTIFICACAO
export async function toggleLike(postId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: existing } = await supabase
      .from('feed_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase.from('feed_likes').delete().eq('id', existing.id);
      await supabase.rpc('decrement_feed_likes', { post_id: postId });
      return false;
    } else {
      await supabase.from('feed_likes').insert({ post_id: postId, user_id: user.id });
      await supabase.rpc('increment_feed_likes', { post_id: postId });

      // ENVIAR NOTIFICACAO DE LIKE
      const { data: post } = await supabase
        .from('feed_posts')
        .select('author_id')
        .eq('id', postId)
        .single();

      const { data: likerProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (post && likerProfile && post.author_id !== user.id) {
        createLikeNotification(post.author_id, likerProfile.full_name, postId);
      }

      return true;
    }
  } catch (e) {
    console.error('Erro toggleLike:', e);
    return false;
  }
}

// Buscar comentarios
export async function getComments(postId: string): Promise<FeedComment[]> {
  try {
    const { data, error } = await supabase
      .from('feed_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_hidden', false)
      .order('created_at');

    if (error) {
      console.error('Erro getComments:', error);
      return [];
    }

    const comments = data || [];

    for (const comment of comments) {
      const { data: author } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, is_pro')
        .eq('id', comment.author_id)
        .single();
      comment.author = author || undefined;
    }

    return comments;
  } catch (e) {
    console.error('Erro getComments:', e);
    return [];
  }
}

// Criar comentario COM NOTIFICACAO
export async function createComment(
  postId: string,
  content: string
): Promise<{ success: boolean; comment?: FeedComment; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Nao autenticado' };

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, full_name')
      .eq('id', user.id)
      .single();

    if (!profile?.is_pro) {
      return { success: false, error: 'Apenas usuarios PRO podem comentar' };
    }

    const textMod = await moderateTextWithAI(content);
    if (!textMod.safe) {
      return { success: false, error: textMod.reason || 'Comentario inapropriado' };
    }

    const { data, error } = await supabase
      .from('feed_comments')
      .insert({
        post_id: postId,
        author_id: user.id,
        content,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Erro createComment:', error);
      return { success: false, error: error.message };
    }

    await supabase.rpc('increment_feed_comments', { post_id: postId });

    // ENVIAR NOTIFICACAO DE COMENTARIO
    const { data: post } = await supabase
      .from('feed_posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (post && post.author_id !== user.id) {
      createCommentNotification(post.author_id, profile.full_name, postId, content);
    }

    return { success: true, comment: data };
  } catch (e: any) {
    console.error('Erro createComment:', e);
    return { success: false, error: e.message || 'Erro ao comentar' };
  }
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export default {
  getFeed,
  getFollowingFeed,
  getUserPosts,
  getPost,
  createPost,
  deletePost,
  toggleLike,
  getComments,
  createComment,
};
