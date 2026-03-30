import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Device.isDevice) { console.log('Push notifications requerem dispositivo fisico'); return null; }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') { console.log('Permissao para notificacoes negada'); return null; }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Gospia',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3E9BCB',
      });
    }
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: 'a9ffc1de-c522-4b03-9c12-f911b700b126' })).data;
    console.log('Push token:', token);
    await savePushToken(token);
    return token;
  } catch (error) { console.error('Erro ao registrar push:', error); return null; }
}

export async function savePushToken(token: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('push_tokens').upsert({ user_id: user.id, token, platform: Platform.OS, updated_at: new Date().toISOString() }, { onConflict: 'user_id,token' });
  } catch (error) { console.error('Erro ao salvar token:', error); }
}

export async function removePushToken(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('push_tokens').delete().eq('user_id', user.id);
  } catch (error) { console.error('Erro ao remover token:', error); }
}

export async function createLikeNotification(postOwnerId: string, likerName: string, postId: string, source: 'feed' | 'forum' = 'feed'): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === postOwnerId) return;
    await supabase.from('social_notifications').insert({
      user_id: postOwnerId,
      type: 'post_like',
      title: 'Nova curtida',
      body: likerName + ' curtiu sua publicacao',
      data: { postId, likerId: user.id, source },
      is_read: false,
    });
    await sendPushToUser(postOwnerId, 'Nova curtida', likerName + ' curtiu sua publicacao', { type: 'post_like', postId, source });
  } catch (error) { console.error('Erro createLikeNotification:', error); }
}

export async function createCommentNotification(postOwnerId: string, commenterName: string, postId: string, commentPreview: string, source: 'feed' | 'forum' = 'feed'): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === postOwnerId) return;
    const preview = commentPreview.length > 50 ? commentPreview.substring(0, 50) + '...' : commentPreview;
    await supabase.from('social_notifications').insert({
      user_id: postOwnerId,
      type: 'post_comment',
      title: 'Novo comentario',
      body: commenterName + ': ' + preview,
      data: { postId, commenterId: user.id, source },
      is_read: false,
    });
    await sendPushToUser(postOwnerId, 'Novo comentario', commenterName + ': ' + preview, { type: 'post_comment', postId, source });
  } catch (error) { console.error('Erro createCommentNotification:', error); }
}

export async function createFollowNotification(followedUserId: string, followerName: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id === followedUserId) return;
    await supabase.from('social_notifications').insert({
      user_id: followedUserId,
      type: 'follow',
      title: 'Novo seguidor',
      body: followerName + ' comecou a seguir voce',
      data: { followerId: user.id },
      is_read: false,
    });
    await sendPushToUser(followedUserId, 'Novo seguidor', followerName + ' comecou a seguir voce', { type: 'follow', followerId: user.id });
  } catch (error) { console.error('Erro createFollowNotification:', error); }
}

async function sendPushToUser(userId: string, title: string, body: string, data: any): Promise<void> {
  try {
    const { data: tokens } = await supabase.from('push_tokens').select('token').eq('user_id', userId);
    if (!tokens || tokens.length === 0) return;
    const messages = tokens.map(t => ({ to: t.token, sound: 'default', title, body, data }));
    await fetch('https://exp.host/--/api/v2/push/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messages) });
  } catch (error) { console.error('Erro sendPushToUser:', error); }
}

export async function getNotifications(limit: number = 20): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data, error } = await supabase.from('social_notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(limit);
    if (error) { console.error(error); return []; }
    return data || [];
  } catch (error) { console.error('Erro getNotifications:', error); return []; }
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase.from('social_notifications').update({ is_read: true }).eq('id', notificationId);
}

export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('social_notifications').update({ is_read: true }).eq('user_id', user.id);
}

export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase.from('social_notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false);
  return count || 0;
}

export function addNotificationListener(callback: (notification: any) => void) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(callback: (response: any) => void) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
