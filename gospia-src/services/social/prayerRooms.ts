import { supabase } from '../../lib/supabase';

export interface PrayerRoom {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_private: boolean;
  max_members: number;
  is_active: boolean;
  created_at: string;
  owner?: { id: string; full_name: string; avatar_url?: string };
  member_count?: number;
}

export interface PrayerRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
  user?: { id: string; full_name: string; avatar_url?: string; is_pro?: boolean };
}

export interface PrayerRoomMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'prayer_request' | 'system';
  created_at: string;
  sender?: { id: string; full_name: string; avatar_url?: string };
}

export async function getPublicRooms(): Promise<PrayerRoom[]> {
  try {
    const { data, error } = await supabase
      .from('prayer_rooms')
      .select('*')
      .eq('is_private', false)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) { console.error('Erro getPublicRooms:', error); return []; }

    const rooms = data || [];

    for (const room of rooms) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', room.owner_id)
        .single();
      room.owner = owner || undefined;

      const { count } = await supabase
        .from('prayer_room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);
      room.member_count = count || 0;
    }

    return rooms;
  } catch (e) {
    console.error('Erro getPublicRooms:', e);
    return [];
  }
}

export async function getMyRooms(): Promise<PrayerRoom[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: memberships, error } = await supabase
      .from('prayer_room_members')
      .select('room_id')
      .eq('user_id', user.id);

    if (error || !memberships?.length) return [];

    const roomIds = memberships.map(m => m.room_id);
    const { data: rooms } = await supabase
      .from('prayer_rooms')
      .select('*')
      .in('id', roomIds)
      .eq('is_active', true);

    const result = rooms || [];

    for (const room of result) {
      const { data: owner } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', room.owner_id)
        .single();
      room.owner = owner || undefined;

      const { count } = await supabase
        .from('prayer_room_members')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);
      room.member_count = count || 0;
    }

    return result;
  } catch (e) {
    console.error('Erro getMyRooms:', e);
    return [];
  }
}

export async function getRoom(roomId: string): Promise<PrayerRoom | null> {
  try {
    const { data, error } = await supabase
      .from('prayer_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) { console.error('Erro getRoom:', error); return null; }

    const { data: owner } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', data.owner_id)
      .single();
    data.owner = owner || undefined;

    return data;
  } catch (e) {
    console.error('Erro getRoom:', e);
    return null;
  }
}

export async function createRoom(name: string, description?: string, isPrivate: boolean = false): Promise<{ success: boolean; room?: PrayerRoom; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Nao autenticado' };

    const { data, error } = await supabase
      .from('prayer_rooms')
      .insert({ 
        name, 
        description, 
        owner_id: user.id, 
        is_private: isPrivate, 
        max_members: 5,
        is_active: true
      })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    await supabase.from('prayer_room_members').insert({ room_id: data.id, user_id: user.id, role: 'owner' });

    const { data: owner } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single();
    data.owner = owner || undefined;

    return { success: true, room: data };
  } catch (e: any) {
    console.error('Erro createRoom:', e);
    return { success: false, error: e.message || 'Erro ao criar sala' };
  }
}

export async function joinRoom(roomId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Nao autenticado' };

    const { data: existing } = await supabase
      .from('prayer_room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', user.id)
      .single();

    if (existing) return { success: true };

    const { data: room } = await supabase.from('prayer_rooms').select('max_members').eq('id', roomId).single();
    const { count } = await supabase.from('prayer_room_members').select('*', { count: 'exact', head: true }).eq('room_id', roomId);

    if (room && count && count >= room.max_members) {
      return { success: false, error: 'Sala cheia' };
    }

    const { error } = await supabase.from('prayer_room_members').insert({ room_id: roomId, user_id: user.id, role: 'member' });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    console.error('Erro joinRoom:', e);
    return { success: false, error: e.message || 'Erro ao entrar' };
  }
}

export async function leaveRoom(roomId: string): Promise<{ success: boolean }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    await supabase.from('prayer_room_members').delete().eq('room_id', roomId).eq('user_id', user.id);
    return { success: true };
  } catch (e) {
    console.error('Erro leaveRoom:', e);
    return { success: false };
  }
}

export async function getRoomMembers(roomId: string): Promise<PrayerRoomMember[]> {
  try {
    const { data, error } = await supabase
      .from('prayer_room_members')
      .select('*')
      .eq('room_id', roomId)
      .order('joined_at');

    if (error) { console.error('Erro getRoomMembers:', error); return []; }

    const members = data || [];

    for (const member of members) {
      const { data: user } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, is_pro')
        .eq('id', member.user_id)
        .single();
      member.user = user || undefined;
    }

    return members;
  } catch (e) {
    console.error('Erro getRoomMembers:', e);
    return [];
  }
}

export async function getRoomMessages(roomId: string, limit: number = 100): Promise<PrayerRoomMessage[]> {
  try {
    const { data, error } = await supabase
      .from('prayer_room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) { console.error('Erro getRoomMessages:', error); return []; }

    const messages = data || [];

    for (const msg of messages) {
      const { data: sender } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', msg.sender_id)
        .single();
      msg.sender = sender || undefined;
    }

    return messages;
  } catch (e) {
    console.error('Erro getRoomMessages:', e);
    return [];
  }
}

export async function sendRoomMessage(
  roomId: string,
  content: string,
  type: 'text' | 'prayer_request' = 'text'
): Promise<{ success: boolean; message?: PrayerRoomMessage; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Nao autenticado' };

    const { data, error } = await supabase
      .from('prayer_room_messages')
      .insert({ room_id: roomId, sender_id: user.id, content, message_type: type })
      .select('*')
      .single();

    if (error) return { success: false, error: error.message };

    const { data: sender } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', user.id)
      .single();
    data.sender = sender || undefined;

    return { success: true, message: data };
  } catch (e: any) {
    console.error('Erro sendRoomMessage:', e);
    return { success: false, error: e.message || 'Erro ao enviar' };
  }
}

export function subscribeToRoom(roomId: string, callback: (message: PrayerRoomMessage) => void): () => void {
  const channel = supabase
    .channel('prayer_room_' + roomId)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'prayer_room_messages', filter: 'room_id=eq.' + roomId },
      async (payload) => {
        const msg = payload.new as PrayerRoomMessage;
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .eq('id', msg.sender_id)
          .single();
        callback({ ...msg, sender: sender || undefined });
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function inviteToRoom(roomId: string, friendId: string): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase.from('prayer_room_members').insert({ room_id: roomId, user_id: friendId, role: 'member' });
    if (error) { console.error(error); return { success: false }; }
    return { success: true };
  } catch (e) {
    console.error('Erro inviteToRoom:', e);
    return { success: false };
  }
}
