import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, Platform, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { supabase } from './src/lib/supabase';
import { 
  registerForPushNotifications, 
  removePushToken,
  addNotificationResponseListener 
} from './src/services/pushNotifications';

LogBox.ignoreLogs([
  'Unable to activate keep awake',
  'Possible unhandled promise rejection',
]);

// Telas
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UpgradeScreen from './src/screens/UpgradeScreen';
import RadioScreen from './src/screens/RadioScreen';

// Social
import SocialNavigator from './src/screens/social/SocialNavigator';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Referencia global para navegacao
let navigationRef: any = null;

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3E9BCB',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 88 : 65,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Conversar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SocialTab"
        component={SocialNavigator}
        options={{
          tabBarLabel: 'Comunidade',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkInitialState();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const wasAuthenticated = isAuthenticated;
      const nowAuthenticated = !!session?.user;
      
      setIsAuthenticated(nowAuthenticated);

      // Registrar push quando logar
      if (nowAuthenticated && !wasAuthenticated) {
        setTimeout(() => {
          registerForPushNotifications();
        }, 1000);
      }

      // Remover token quando deslogar
      if (!nowAuthenticated && wasAuthenticated) {
        removePushToken();
      }
    });

    // Listener para quando usuario toca na notificacao
    const notificationListener = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      
      if (navigationRef && data) {
        // Navegar baseado no tipo de notificacao
        if (data.type === 'like' || data.type === 'comment') {
          navigationRef.navigate('SocialTab', {
            screen: 'PostDetail',
            params: { postId: data.postId },
          });
        } else if (data.type === 'follow') {
          navigationRef.navigate('SocialTab', {
            screen: 'UserProfile',
            params: { userId: data.followerId },
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
      notificationListener.remove();
    };
  }, [isAuthenticated]);

  const checkInitialState = async () => {
    try {
      const hasOnboarded = await AsyncStorage.getItem('@gospia_onboarded');
      setShowOnboarding(!hasOnboarded);

      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);

      // Registrar push se ja estiver logado
      if (session?.user) {
        registerForPushNotifications();
      }
    } catch (error) {
      console.error('Erro ao verificar estado inicial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = useCallback(async () => {
    await AsyncStorage.setItem('@gospia_onboarded', 'true');
    setShowOnboarding(false);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3E9BCB" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer ref={(ref) => { navigationRef = ref; }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
                options={{ animation: 'slide_from_right' }}
              />
            </>
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="Radio"
                component={RadioScreen}
                options={{
                  animation: 'slide_from_bottom',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="Upgrade"
                component={UpgradeScreen}
                options={{
                  animation: 'slide_from_bottom',
                  presentation: 'modal',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
