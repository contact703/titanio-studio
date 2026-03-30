import { supabase } from '../../lib/supabase';

export interface SocialNotification {
  id: string;
  user_id: string;
  type: 'friend_request' | 'friend_accepted' | 'new_message' | 'post_like' | 'post_comment' | 'room_invite' | 'mention';
  title: string;
  body: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  sender?: { id: string; full_name: string; avatar_url?: string };
}

export async function getNotifications(limit: number = 50): Promise<SocialNotification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from('social_notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(limit);
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count, error } = await supabase.from('social_notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
  if (error) { console.error(error); return 0; }
  return count || 0;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase.from('social_notifications').update({ is_read: true }).eq('id', notificationId);
}

export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('social_notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
}

export async function deleteNotification(notificationId: string): Promise<void> {
  await supabase.from('social_notifications').delete().eq('id', notificationId);
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case 'friend_request': return 'person-add';
    case 'friend_accepted': return 'people';
    case 'new_message': return 'chatbubble';
    case 'post_like': return 'heart';
    case 'post_comment': return 'chatbubble-ellipses';
    case 'room_invite': return 'enter';
    case 'mention': return 'at';
    default: return 'notifications';
  }
}

export function getNotificationColor(type: string): string {
  switch (type) {
    case 'friend_request': return '#3498db';
    case 'friend_accepted': return '#2ecc71';
    case 'new_message': return '#9b59b6';
    case 'post_like': return '#e74c3c';
    case 'post_comment': return '#f39c12';
    case 'room_invite': return '#1abc9c';
    case 'mention': return '#e91e63';
    default: return '#95a5a6';
  }
}

export function getNotificationRoute(notif: SocialNotification): { screen: string; params?: any } | null {
  switch (notif.type) {
    case 'friend_request':
      return { screen: 'FriendRequests' };
    case 'friend_accepted':
      return { screen: 'UserProfile', params: { userId: notif.data?.userId || notif.data?.friendId } };
    case 'new_message':
      return { screen: 'ChatDirect', params: { friendId: notif.data?.senderId, friendName: notif.data?.senderName } };
    case 'post_like':
    case 'post_comment':
      if (notif.data?.postId) {
        if (notif.data?.source === 'forum') {
          return { screen: 'ForumPost', params: { postId: notif.data.postId } };
        } else {
          return { screen: 'PostDetail', params: { postId: notif.data.postId } };
        }
      }
      return null;
    case 'room_invite':
      return { screen: 'PrayerRooms' };
    case 'mention':
      return { screen: 'ForumPost', params: { postId: notif.data?.postId } };
    default:
      return null;
  }
}
