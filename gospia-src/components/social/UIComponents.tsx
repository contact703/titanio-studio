import React from 'react';
import { View, Text, Image, TouchableOpacity, TextInput, ActivityIndicator, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const COLORS = {
  gradientStart: '#5BA3E0',
  gradientEnd: '#4A90D9',
  primary: '#4A90D9',
  primaryDark: '#3D7A99',
  card: 'rgba(255, 255, 255, 0.15)',
  border: 'rgba(255, 255, 255, 0.1)',
  pro: '#FFD700',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.85)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  success: '#2ecc71',
  error: '#e74c3c',
  warning: '#f39c12',
  videoCall: '#9b59b6',
  videoCallActive: '#27ae60',
};

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: COLORS.card }} />;
  }
  const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: COLORS.text, fontSize: size * 0.4, fontWeight: 'bold' }}>{initials}</Text>
    </View>
  );
}

interface BadgeProps {
  count: number;
  size?: number;
}

export function Badge({ count, size = 18 }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, borderRadius: size / 2, minWidth: size, height: size, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
      <Text style={{ color: '#FFF', fontSize: size * 0.65, fontWeight: 'bold' }}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

export function ProBadge() {
  return (
    <View style={{ backgroundColor: COLORS.pro, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 }}>
      <Text style={{ color: '#000', fontSize: 10, fontWeight: 'bold' }}>PRO</Text>
    </View>
  );
}

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View style={[{ backgroundColor: COLORS.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border }, style]}>
      {children}
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export function Button({ title, onPress, variant = 'primary', disabled, loading, icon }: ButtonProps) {
  const bgColor = variant === 'primary' ? COLORS.primary : variant === 'danger' ? COLORS.error : 'transparent';
  const borderColor = variant === 'secondary' ? COLORS.primary : 'transparent';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{ backgroundColor: bgColor, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: variant === 'secondary' ? 1 : 0, borderColor, opacity: disabled ? 0.5 : 1 }}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.text} size="small" />
      ) : (
        <>
          {icon && <Ionicons name={icon as any} size={20} color={COLORS.text} style={{ marginRight: 8 }} />}
          <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '600' }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

interface InputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  multiline?: boolean;
  icon?: string;
}

export function Input({ placeholder, value, onChangeText, secureTextEntry, multiline, icon }: InputProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12 }}>
      {icon && <Ionicons name={icon as any} size={20} color={COLORS.textMuted} style={{ marginRight: 8 }} />}
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={{ flex: 1, color: COLORS.text, fontSize: 16, paddingVertical: 14, minHeight: multiline ? 100 : undefined, textAlignVertical: multiline ? 'top' : 'center' }}
      />
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={COLORS.text} />
    </View>
  );
}

interface EmptyStateProps {
  icon: string;
  message: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Ionicons name={icon as any} size={64} color={COLORS.textMuted} />
      <Text style={{ color: COLORS.textMuted, fontSize: 16, textAlign: 'center', marginTop: 16 }}>{message}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress} style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.primaryDark, borderRadius: 10 }}>
          <Text style={{ color: '#FFF', fontWeight: '600' }}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onPress: () => void };
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={action.onPress}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.pro }}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
