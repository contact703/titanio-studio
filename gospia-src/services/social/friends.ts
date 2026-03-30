import { supabase } from '../../lib/supabase';

export interface Profile {
  id: string;
  full_name: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  daily_status?: string;
  daily_status_updated_at?: string;
  city?: string;
  state?: string;
  church_name?: string;
  is_pro: boolean;
  is_verified?: boolean;
  created_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend?: Profile;
}

export type RelationshipStatus = 'self' | 'friends' | 'request_sent' | 'request_received' | 'none';

export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function updateProfile(updates: Partial<Profile>): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Nao autenticado' };
  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getFriendsCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase.from('friends').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
  if (error) { console.error(error); return 0; }
  return count || 0;
}

export async function getFriends(): Promise<Friend[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from('friends').select('*, friend:profiles!friend_id(*)').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function checkFriendship(otherUserId: string): Promise<'friends' | 'pending_sent' | 'pending_received' | 'none'> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'none';
  const { data: friend } = await supabase.from('friends').select('id').eq('user_id', user.id).eq('friend_id', otherUserId).single();
  if (friend) return 'friends';
  const { data: sent } = await supabase.from('friend_requests').select('id').eq('sender_id', user.id).eq('receiver_id', otherUserId).eq('status', 'pending').single();
  if (sent) return 'pending_sent';
  const { data: received } = await supabase.from('friend_requests').select('id').eq('sender_id', otherUserId).eq('receiver_id', user.id).eq('status', 'pending').single();
  if (received) return 'pending_received';
  return 'none';
}

export async function getRelationshipStatus(otherUserId: string): Promise<RelationshipStatus> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'none';
  if (user.id === otherUserId) return 'self';
  const { data: friend } = await supabase.from('friends').select('id').eq('user_id', user.id).eq('friend_id', otherUserId).single();
  if (friend) return 'friends';
  const { data: sent } = await supabase.from('friend_requests').select('id').eq('sender_id', user.id).eq('receiver_id', otherUserId).eq('status', 'pending').single();
  if (sent) return 'request_sent';
  const { data: received } = await supabase.from('friend_requests').select('id').eq('sender_id', otherUserId).eq('receiver_id', user.id).eq('status', 'pending').single();
  if (received) return 'request_received';
  return 'none';
}

export async function sendFriendRequest(receiverId: string): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Nao autenticado' };
  const { error } = await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: receiverId, status: 'pending' });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function acceptFriendRequest(requestId: string): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Nao autenticado' };
  const { data: request } = await supabase.from('friend_requests').select('*').eq('id', requestId).single();
  if (!request) return { success: false, error: 'Pedido nao encontrado' };
  await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
  await supabase.from('friends').insert([
    { user_id: request.sender_id, friend_id: request.receiver_id },
    { user_id: request.receiver_id, friend_id: request.sender_id }
  ]);
  return { success: true };
}

export async function rejectFriendRequest(requestId: string): Promise<{ success: boolean }> {
  await supabase.from('friend_requests').update({ status: 'rejected' }).eq('id', requestId);
  return { success: true };
}

export async function cancelFriendRequest(requestId: string): Promise<{ success: boolean }> {
  await supabase.from('friend_requests').delete().eq('id', requestId);
  return { success: true };
}

export async function removeFriend(friendId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  await supabase.from('friends').delete().eq('user_id', user.id).eq('friend_id', friendId);
  await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', user.id);
  return true;
}

export async function getPendingRequestsReceived(): Promise<FriendRequest[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from('friend_requests').select('*, sender:profiles!sender_id(*)').eq('receiver_id', user.id).eq('status', 'pending').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getPendingRequestsSent(): Promise<FriendRequest[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from('friend_requests').select('*, receiver:profiles!receiver_id(*)').eq('sender_id', user.id).eq('status', 'pending').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function searchUsers(query: string): Promise<Profile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const searchTerm = '%' + query + '%';
  const filterStr = 'full_name.ilike.' + searchTerm + ',username.ilike.' + searchTerm;
  const { data, error } = await supabase.from('profiles').select('*').neq('id', user.id).or(filterStr).limit(20);
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getSuggestedFriends(): Promise<Profile[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const myProfile = await getMyProfile();
  if (!myProfile) return [];
  const { data: friends } = await supabase.from('friends').select('friend_id').eq('user_id', user.id);
  const friendIds = friends?.map(f => f.friend_id) || [];
  friendIds.push(user.id);
  const { data, error } = await supabase.from('profiles').select('*').not('id', 'in', '(' + friendIds.join(',') + ')').limit(10);
  if (error) { console.error(error); return []; }
  return data || [];
}
