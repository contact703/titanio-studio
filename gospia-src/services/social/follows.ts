import { supabase } from '../../lib/supabase';
import { createFollowNotification } from '../pushNotifications';

export interface FollowUser {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  is_pro?: boolean;
  followers_count?: number;
  following_count?: number;
}

// Seguir usuario COM NOTIFICACAO
export async function followUser(userId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === userId) return false;

    const { error } = await supabase
      .from('user_follows')
      .insert({ follower_id: user.id, following_id: userId });

    if (error) {
      if (error.code === '23505') return true; // Ja segue
      console.error('Erro followUser:', error);
      return false;
    }

    // Atualizar contadores
    await supabase.rpc('increment_followers', { user_id: userId });
    await supabase.rpc('increment_following', { user_id: user.id });

    // ENVIAR NOTIFICACAO DE NOVO SEGUIDOR
    const { data: followerProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (followerProfile) {
      createFollowNotification(userId, followerProfile.full_name);
    }

    return true;
  } catch (e) {
    console.error('Erro followUser:', e);
    return false;
  }
}

// Deixar de seguir
export async function unfollowUser(userId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) {
      console.error('Erro unfollowUser:', error);
      return false;
    }

    // Atualizar contadores
    await supabase.rpc('decrement_followers', { user_id: userId });
    await supabase.rpc('decrement_following', { user_id: user.id });

    return true;
  } catch (e) {
    console.error('Erro unfollowUser:', e);
    return false;
  }
}

// Verificar se segue
export async function isFollowing(userId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    return !!data;
  } catch (e) {
    return false;
  }
}

// Toggle seguir/deixar de seguir
export async function toggleFollow(userId: string): Promise<boolean> {
  const following = await isFollowing(userId);
  if (following) {
    await unfollowUser(userId);
    return false;
  } else {
    await followUser(userId);
    return true;
  }
}

// Buscar seguidores de um usuario
export async function getFollowers(userId: string): Promise<FollowUser[]> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('follower_id')
      .eq('following_id', userId);

    if (error || !data) return [];

    const followers: FollowUser[] = [];
    for (const follow of data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_pro, followers_count, following_count')
        .eq('id', follow.follower_id)
        .single();
      if (profile) followers.push(profile);
    }

    return followers;
  } catch (e) {
    console.error('Erro getFollowers:', e);
    return [];
  }
}

// Buscar quem o usuario segue
export async function getFollowing(userId: string): Promise<FollowUser[]> {
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error || !data) return [];

    const following: FollowUser[] = [];
    for (const follow of data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, is_pro, followers_count, following_count')
        .eq('id', follow.following_id)
        .single();
      if (profile) following.push(profile);
    }

    return following;
  } catch (e) {
    console.error('Erro getFollowing:', e);
    return [];
  }
}

// Contar seguidores
export async function getFollowersCount(userId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    return count || 0;
  } catch (e) {
    return 0;
  }
}

// Contar seguindo
export async function getFollowingCount(userId: string): Promise<number> {
  try {
    const { count } = await supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    return count || 0;
  } catch (e) {
    return 0;
  }
}

// Sugestoes de quem seguir (baseado em amigos em comum, mesma igreja, etc)
export async function getSuggestedUsers(limit: number = 10): Promise<FollowUser[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Buscar perfil do usuario atual
    const { data: myProfile } = await supabase
      .from('profiles')
      .select('church, city, state')
      .eq('id', user.id)
      .single();

    // Buscar quem ja segue
    const followingIds = await getFollowing(user.id);
    const followingSet = new Set(followingIds.map(f => f.id));
    followingSet.add(user.id); // Nao sugerir a si mesmo

    // Buscar usuarios com criterios
    let query = supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, is_pro, followers_count, following_count, church, city')
      .neq('id', user.id)
      .limit(50);

    const { data: candidates } = await query;

    if (!candidates) return [];

    // Pontuar candidatos
    const scored = candidates
      .filter(c => !followingSet.has(c.id))
      .map(c => {
        let score = 0;
        
        // Mesma igreja = +30
        if (myProfile?.church && c.church && 
            myProfile.church.toLowerCase() === c.church.toLowerCase()) {
          score += 30;
        }
        
        // Mesma cidade = +20
        if (myProfile?.city && c.city && 
            myProfile.city.toLowerCase() === c.city.toLowerCase()) {
          score += 20;
        }
        
        // PRO = +10
        if (c.is_pro) score += 10;
        
        // Popularidade (seguidores)
        score += Math.min((c.followers_count || 0) / 10, 20);

        return { ...c, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  } catch (e) {
    console.error('Erro getSuggestedUsers:', e);
    return [];
  }
}

export default {
  followUser,
  unfollowUser,
  isFollowing,
  toggleFollow,
  getFollowers,
  getFollowing,
  getFollowersCount,
  getFollowingCount,
  getSuggestedUsers,
};
