import { supabase } from '../../lib/supabase';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'prayer';
  is_read: boolean;
  created_at: string;
  sender?: { id: string; full_name: string; avatar_url?: string };
}

export interface Conversation {
  friend_id: string;
  friend: { id: string; full_name: string; avatar_url?: string; is_pro?: boolean; daily_status?: string };
  last_message?: string;
  last_message_type?: string;
  last_message_at?: string;
  unread_count: number;
}

export async function getConversations(): Promise<Conversation[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: friends, error } = await supabase
    .from('friends')
    .select('friend_id, friend:profiles!friend_id(id, full_name, avatar_url, is_pro, daily_status)')
    .eq('user_id', user.id);

  if (error || !friends) { console.error(error); return []; }

  const conversations: Conversation[] = [];

  for (const f of friends) {
    const friendId = f.friend_id;
    const visUserId = user.id;
    const filterStr = 'and(sender_id.eq.' + visUserId + ',receiver_id.eq.' + friendId + '),and(sender_id.eq.' + friendId + ',receiver_id.eq.' + visUserId + ')';

    const { data: lastMsg } = await supabase
      .from('direct_messages')
      .select('content, message_type, created_at')
      .or(filterStr)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const { count } = await supabase
      .from('direct_messages')
      .select('*', { count: 'exact', head: true })
      .eq('sender_id', friendId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    conversations.push({
      friend_id: friendId,
      friend: f.friend as any,
      last_message: lastMsg?.content,
      last_message_type: lastMsg?.message_type,
      last_message_at: lastMsg?.created_at,
      unread_count: count || 0
    });
  }

  conversations.sort((a, b) => {
    if (!a.last_message_at) return 1;
    if (!b.last_message_at) return -1;
    return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
  });

  return conversations;
}

export async function getMessages(friendId: string, limit: number = 50): Promise<DirectMessage[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const visUserId = user.id;
  const filterStr = 'and(sender_id.eq.' + visUserId + ',receiver_id.eq.' + friendId + '),and(sender_id.eq.' + friendId + ',receiver_id.eq.' + visUserId + ')';

  const { data, error } = await supabase
    .from('direct_messages')
    .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
    .or(filterStr)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) { console.error(error); return []; }

  await supabase
    .from('direct_messages')
    .update({ is_read: true })
    .eq('sender_id', friendId)
    .eq('receiver_id', user.id)
    .eq('is_read', false);

  return data || [];
}

export async function sendMessage(
  receiverId: string,
  content: string,
  type: 'text' | 'image' | 'audio' | 'prayer' = 'text'
): Promise<{ success: boolean; message?: DirectMessage; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Nao autenticado' };

  const { data, error } = await supabase
    .from('direct_messages')
    .insert({ sender_id: user.id, receiver_id: receiverId, content, message_type: type })
    .select('*, sender:profiles!sender_id(id, full_name, avatar_url)')
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, message: data };
}

export function subscribeToMessages(friendId: string, callback: (message: DirectMessage) => void): () => void {
  const setupSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return () => {};

    const filterStr = 'sender_id=eq.' + friendId;
    const channel = supabase
      .channel('direct_messages_' + friendId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: filterStr },
        async (payload) => {
          const msg = payload.new as DirectMessage;
          if (msg.receiver_id === user.id) {
            const { data: sender } = await supabase.from('profiles').select('id, full_name, avatar_url').eq('id', msg.sender_id).single();
            callback({ ...msg, sender: sender || undefined });
            await supabase.from('direct_messages').update({ is_read: true }).eq('id', msg.id);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  let unsubscribe = () => {};
  setupSubscription().then(unsub => { unsubscribe = unsub; });
  return () => unsubscribe();
}

export function subscribeToAllMessages(callback: (message: DirectMessage) => void): () => void {
  const setupSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return () => {};

    const filterStr = 'receiver_id=eq.' + user.id;
    const channel = supabase
      .channel('all_direct_messages_' + user.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'direct_messages', filter: filterStr },
        (payload) => { callback(payload.new as DirectMessage); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  };

  let unsubscribe = () => {};
  setupSubscription().then(unsub => { unsubscribe = unsub; });
  return () => unsubscribe();
}
