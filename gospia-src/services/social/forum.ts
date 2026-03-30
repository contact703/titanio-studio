import { supabase } from '../../lib/supabase';
import { createLikeNotification, createCommentNotification } from '../pushNotifications';

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
}

export interface ForumPost {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  content: string;
  image_url?: string;
  is_pinned: boolean;
  is_hidden: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  author?: { id: string; full_name: string; avatar_url?: string; is_pro?: boolean };
  category?: ForumCategory;
  user_liked?: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  author?: { id: string; full_name: string; avatar_url?: string; is_pro?: boolean };
}

export async function getCategories(): Promise<ForumCategory[]> {
  try {
    const { data, error } = await supabase.from('forum_categories').select('*').order('sort_order');
    if (error) { console.error('Erro getCategories:', error); return []; }
    return data || [];
  } catch (e) { console.error('Erro getCategories:', e); return []; }
}

export async function getPosts(categoryId?: string): Promise<ForumPost[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    let query = supabase.from('forum_posts').select('*').eq('is_hidden', false).order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    if (error) { console.error('Erro getPosts:', error); return []; }
    const posts = data || [];
    for (const post of posts) {
      const { data: author } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', post.author_id).single();
      post.author = author || undefined;
      const { data: category } = await supabase.from('forum_categories').select('*').eq('id', post.category_id).single();
      post.category = category || undefined;
      if (user) {
        const { data: liked } = await supabase.from('forum_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).single();
        post.user_liked = !!liked;
      }
    }
    return posts;
  } catch (e) { console.error('Erro getPosts:', e); return []; }
}

export async function getPost(postId: string): Promise<ForumPost | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('forum_posts').select('*').eq('id', postId).single();
    if (error || !data) { console.error('Erro getPost:', error); return null; }
    const { data: author } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', data.author_id).single();
    data.author = author || undefined;
    const { data: category } = await supabase.from('forum_categories').select('*').eq('id', data.category_id).single();
    data.category = category || undefined;
    if (user) {
      const { data: liked } = await supabase.from('forum_likes').select('id').eq('post_id', postId).eq('user_id', user.id).single();
      data.user_liked = !!liked;
    }
    await supabase.from('forum_posts').update({ view_count: (data.view_count || 0) + 1 }).eq('id', postId);
    return data;
  } catch (e) { console.error('Erro getPost:', e); return null; }
}

export async function getTrendingPosts(limit: number = 5): Promise<ForumPost[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('forum_posts').select('*').eq('is_hidden', false).order('like_count', { ascending: false }).order('comment_count', { ascending: false }).limit(limit);
    if (error) { console.error('Erro getTrendingPosts:', error); return []; }
    const posts = data || [];
    for (const post of posts) {
      const { data: author } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', post.author_id).single();
      post.author = author || undefined;
      if (user) {
        const { data: liked } = await supabase.from('forum_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).single();
        post.user_liked = !!liked;
      }
    }
    return posts;
  } catch (e) { console.error('Erro getTrendingPosts:', e); return []; }
}

export async function createPost(categoryId: string, title: string, content: string, imageUrl?: string): Promise<ForumPost | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase.from('forum_posts').insert({
      category_id: categoryId, author_id: user.id, title, content, image_url: imageUrl,
      is_pinned: false, is_hidden: false, view_count: 0, like_count: 0, comment_count: 0
    }).select('*').single();
    if (error) { console.error('Erro createPost:', error); return null; }
    const { data: author } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', user.id).single();
    data.author = author || undefined;
    return data;
  } catch (e) { console.error('Erro createPost:', e); return null; }
}

export async function getComments(postId: string): Promise<ForumComment[]> {
  try {
    const { data, error } = await supabase.from('forum_comments').select('*').eq('post_id', postId).eq('is_hidden', false).order('created_at');
    if (error) { console.error('Erro getComments:', error); return []; }
    const comments = data || [];
    for (const comment of comments) {
      const { data: author } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', comment.author_id).single();
      comment.author = author || undefined;
    }
    return comments;
  } catch (e) { console.error('Erro getComments:', e); return []; }
}

// Criar comentario COM NOTIFICACAO
export async function createComment(postId: string, content: string): Promise<ForumComment | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

    const { data, error } = await supabase.from('forum_comments').insert({ post_id: postId, author_id: user.id, content, is_hidden: false }).select('*').single();
    if (error) { console.error('Erro createComment:', error); return null; }

    // Incrementar contador
    await supabase.rpc('increment_forum_comments', { post_id: postId }).catch(() => {
      supabase.from('forum_posts').update({ comment_count: supabase.rpc('increment', { x: 1 }) }).eq('id', postId);
    });

    // ENVIAR NOTIFICACAO
    const { data: post } = await supabase.from('forum_posts').select('author_id, title').eq('id', postId).single();
    if (post && post.author_id !== user.id) {
      createCommentNotification(post.author_id, profile?.full_name || 'Alguem', postId, content, 'forum');
    }

    const { data: author } = await supabase.from('profiles').select('id, full_name, avatar_url, is_pro').eq('id', user.id).single();
    data.author = author || undefined;
    return data;
  } catch (e) { console.error('Erro createComment:', e); return null; }
}

// Toggle like COM NOTIFICACAO
export async function togglePostLike(postId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();

    const { data: existing } = await supabase.from('forum_likes').select('id').eq('post_id', postId).eq('user_id', user.id).single();

    if (existing) {
      await supabase.from('forum_likes').delete().eq('id', existing.id);
      await supabase.rpc('decrement_forum_likes', { post_id: postId }).catch(() => {});
      return false;
    } else {
      await supabase.from('forum_likes').insert({ post_id: postId, user_id: user.id });
      await supabase.rpc('increment_forum_likes', { post_id: postId }).catch(() => {});

      // ENVIAR NOTIFICACAO DE LIKE
      const { data: post } = await supabase.from('forum_posts').select('author_id, title').eq('id', postId).single();
      if (post && post.author_id !== user.id) {
        createLikeNotification(post.author_id, profile?.full_name || 'Alguem', postId, 'forum');
      }

      return true;
    }
  } catch (e) { console.error('Erro togglePostLike:', e); return false; }
}

export async function deletePost(postId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('forum_posts').delete().eq('id', postId).eq('author_id', user.id);
    if (error) { console.error('Erro deletePost:', error); return false; }
    return true;
  } catch (e) { console.error('Erro deletePost:', e); return false; }
}

export async function deleteComment(commentId: string, postId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('forum_comments').delete().eq('id', commentId).eq('author_id', user.id);
    if (error) { console.error('Erro deleteComment:', error); return false; }
    return true;
  } catch (e) { console.error('Erro deleteComment:', e); return false; }
}

export default { getCategories, getPosts, getPost, getTrendingPosts, createPost, getComments, createComment, togglePostLike, deletePost, deleteComment };
