// src/services/notifications.ts
// Sistema de notificações push com versículos diários

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getDailyVerse } from '../data/verses';

// Chaves de storage
const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: '@gospia_notifications_enabled',
  NOTIFICATION_TIME: '@gospia_notification_time',
  LAST_NOTIFICATION_DATE: '@gospia_last_notification_date',
};

// Configurar como notificações são exibidas quando app está em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Interface de configuração
export interface NotificationSettings {
  enabled: boolean;
  hour: number;
  minute: number;
}

// Solicitar permissões
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Notificações só funcionam em dispositivos físicos');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permissão de notificação não concedida');
    return false;
  }

  // Configurar canal de notificação no Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-verse', {
      name: 'Versículo Diário',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3E9BCB',
      sound: 'default', // Usar som padrão do sistema
    });
  }

  return true;
}

// Obter configurações salvas
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
    const time = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_TIME);

    const parsedTime = time ? JSON.parse(time) : { hour: 7, minute: 0 };

    return {
      enabled: enabled === 'true',
      hour: parsedTime.hour,
      minute: parsedTime.minute,
    };
  } catch (error) {
    console.error('Erro ao obter configurações:', error);
    return { enabled: false, hour: 7, minute: 0 };
  }
}

// Salvar configurações
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATIONS_ENABLED, 
      settings.enabled.toString()
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_TIME, 
      JSON.stringify({ hour: settings.hour, minute: settings.minute })
    );

    // Reagendar notificações
    if (settings.enabled) {
      await scheduleDailyNotification(settings.hour, settings.minute);
    } else {
      await cancelAllNotifications();
    }
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
}

// Agendar notificação diária
export async function scheduleDailyNotification(hour: number, minute: number): Promise<string | null> {
  try {
    // Cancelar notificações anteriores
    await cancelAllNotifications();

    // Obter versículo do dia
    const verse = getDailyVerse();

    // Agendar notificação diária
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Versículo do Dia',
        body: `"${verse.verse}" — ${verse.reference}`,
        data: { 
          type: 'daily_verse',
          verse: verse.verse,
          reference: verse.reference,
          theme: verse.theme,
        },
        sound: 'default',
      },
      trigger: {
        hour: hour,
        minute: minute,
        repeats: true,
      },
    });

    console.log(`Notificação agendada para ${hour}:${minute.toString().padStart(2, '0')}`);
    return identifier;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    return null;
  }
}

// Cancelar todas as notificações
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações canceladas');
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
}

// Enviar notificação imediata (para teste)
export async function sendTestNotification(): Promise<void> {
  try {
    const verse = getDailyVerse();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📖 Versículo do Dia (Teste)',
        body: `"${verse.verse}" — ${verse.reference}`,
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: null, // Imediato
    });

    console.log('Notificação de teste enviada');
  } catch (error) {
    console.error('Erro ao enviar notificação de teste:', error);
  }
}

// Listener para notificações recebidas
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

// Listener para quando usuário clica na notificação
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// Inicializar sistema de notificações
export async function initializeNotifications(): Promise<void> {
  const hasPermission = await requestNotificationPermissions();
  
  if (!hasPermission) {
    console.log('Sem permissão para notificações');
    return;
  }

  const settings = await getNotificationSettings();
  
  if (settings.enabled) {
    await scheduleDailyNotification(settings.hour, settings.minute);
  }
}

// Obter todas as notificações agendadas
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
