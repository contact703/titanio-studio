import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Telas existentes
import SocialHomeScreen from './SocialHomeScreen';
import FriendsScreen from './FriendsScreen';
import FriendRequestsScreen from './FriendRequestsScreen';
import SearchUsersScreen from './SearchUsersScreen';
import UserProfileScreen from './UserProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import ForumHomeScreen from './ForumHomeScreen';
import ForumPostScreen from './ForumPostScreen';
import CreatePostScreen from './CreatePostScreen';
import MessagesListScreen from './MessagesListScreen';
import ChatDirectScreen from './ChatDirectScreen';
import PrayerRoomsScreen from './PrayerRoomsScreen';
import PrayerRoomScreen from './PrayerRoomScreen';
import NotificationsScreen from './NotificationsScreen';

// Novas telas do Feed (Instagram)
import FeedScreen from './FeedScreen';
import CreateFeedPostScreen from './CreateFeedPostScreen';
import PostDetailScreen from './PostDetailScreen';

export type SocialStackParamList = {
  SocialHome: undefined;
  Friends: undefined;
  FriendRequests: undefined;
  SearchUsers: undefined;
  UserProfile: { userId: string };
  EditProfile: undefined;
  ForumHome: undefined;
  ForumPost: { postId: string };
  CreatePost: { categoryId?: string };
  Messages: undefined;
  ChatDirect: { friendId: string; friendName?: string };
  PrayerRooms: undefined;
  PrayerRoom: { roomId: string; roomName?: string };
  Notifications: undefined;
  // Novas rotas do Feed
  Feed: undefined;
  CreateFeedPost: undefined;
  PostDetail: { postId: string };
};

const Stack = createNativeStackNavigator<SocialStackParamList>();

export default function SocialNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="SocialHome" component={SocialHomeScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
      <Stack.Screen name="SearchUsers" component={SearchUsersScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ForumHome" component={ForumHomeScreen} />
      <Stack.Screen name="ForumPost" component={ForumPostScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
      <Stack.Screen name="Messages" component={MessagesListScreen} />
      <Stack.Screen name="ChatDirect" component={ChatDirectScreen} />
      <Stack.Screen name="PrayerRooms" component={PrayerRoomsScreen} />
      <Stack.Screen name="PrayerRoom" component={PrayerRoomScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      {/* Novas telas do Feed */}
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="CreateFeedPost" component={CreateFeedPostScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
}
