import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, ActionSheetIOS } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, Avatar, Input, Button, Loading, ProBadge } from '../../components/social/UIComponents';
import { getMyProfile, updateProfile, Profile } from '../../services/social/friends';
import { pickImage, takePhoto, uploadProfilePhoto } from '../../services/social/media';

export default function EditProfileScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    full_name: '', 
    username: '', 
    bio: '', 
    daily_status: '', 
    city: '', 
    state: '', 
    church_name: '' 
  });

  useEffect(() => {
    const load = async () => {
      const p = await getMyProfile();
      setProfile(p);
      if (p) setForm({ 
        full_name: p.full_name || '', 
        username: p.username || '', 
        bio: p.bio || '', 
        daily_status: p.daily_status || '', 
        city: p.city || '', 
        state: p.state || '', 
        church_name: p.church_name || '' 
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleChangePhoto = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Tirar Foto', 'Escolher da Galeria'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) await handleTakePhoto();
          else if (buttonIndex === 2) await handlePickImage();
        }
      );
    } else {
      Alert.alert('Alterar Foto', 'Como deseja adicionar sua foto?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Tirar Foto', onPress: handleTakePhoto },
        { text: 'Galeria', onPress: handlePickImage },
      ]);
    }
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) setNewAvatarUri(uri);
  };

  const handleTakePhoto = async () => {
    const uri = await takePhoto();
    if (uri) setNewAvatarUri(uri);
  };

  const handleSave = async () => {
    if (!form.full_name.trim()) return Alert.alert('Erro', 'Nome e obrigatorio');
    setSaving(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload nova foto se tiver
      if (newAvatarUri) {
        setUploadingPhoto(true);
        const uploadResult = await uploadProfilePhoto(newAvatarUri);
        setUploadingPhoto(false);
        
        if (!uploadResult.success) {
          Alert.alert('Erro na foto', uploadResult.error || 'Foto nao permitida. Tente outra imagem.');
          setSaving(false);
          return;
        }
        avatarUrl = uploadResult.url;
      }

      const result = await updateProfile({ 
        ...form, 
        avatar_url: avatarUrl,
        daily_status_updated_at: new Date().toISOString() 
      });

      if (result.success) { 
        Alert.alert('Salvo!', 'Perfil atualizado com sucesso'); 
        navigation.goBack(); 
      } else {
        Alert.alert('Erro', result.error || 'Nao foi possivel salvar');
      }
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Erro ao salvar');
    }
    setSaving(false);
  };

  if (loading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><Loading fullScreen /></LinearGradient>;

  const displayAvatar = newAvatarUri || profile?.avatar_url;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveBtn, saving && {opacity: 0.5}]}>{saving ? '...' : 'Salvar'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleChangePhoto} disabled={uploadingPhoto}>
              {uploadingPhoto ? (
                <View style={styles.avatarLoading}>
                  <Loading />
                </View>
              ) : displayAvatar ? (
                <Image source={{ uri: displayAvatar }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color={COLORS.textMuted} />
                </View>
              )}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChangePhoto} disabled={uploadingPhoto}>
              <Text style={styles.changePhotoText}>Alterar foto</Text>
            </TouchableOpacity>
            {profile?.is_pro && <ProBadge style={{marginTop:8}} />}
          </View>

          <Text style={styles.label}>Status do dia</Text>
          <Input placeholder="Como voce esta hoje?" value={form.daily_status} onChangeText={v => setForm(f => ({...f, daily_status: v}))} maxLength={100} />
          <Text style={styles.hint}>{form.daily_status.length}/100</Text>

          <Text style={styles.label}>Nome completo *</Text>
          <Input placeholder="Seu nome" value={form.full_name} onChangeText={v => setForm(f => ({...f, full_name: v}))} />

          <Text style={styles.label}>Nome de usuario</Text>
          <Input placeholder="@seunome" value={form.username} onChangeText={v => setForm(f => ({...f, username: v.toLowerCase().replace(/[^a-z0-9_]/g, '')}))} autoCapitalize="none" />

          <Text style={styles.label}>Bio</Text>
          <Input placeholder="Conte um pouco sobre voce e sua fe..." value={form.bio} onChangeText={v => setForm(f => ({...f, bio: v}))} multiline numberOfLines={3} maxLength={200} />
          <Text style={styles.hint}>{form.bio.length}/200</Text>

          <Text style={styles.label}>Cidade</Text>
          <Input placeholder="Sua cidade" value={form.city} onChangeText={v => setForm(f => ({...f, city: v}))} />

          <Text style={styles.label}>Estado (UF)</Text>
          <Input placeholder="Ex: SP" value={form.state} onChangeText={v => setForm(f => ({...f, state: v.toUpperCase().slice(0,2)}))} maxLength={2} />

          <Text style={styles.label}>Igreja</Text>
          <Input placeholder="Nome da sua igreja" value={form.church_name} onChangeText={v => setForm(f => ({...f, church_name: v}))} />

          <View style={styles.infoBox}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>Sua foto de perfil e moderada automaticamente para manter a comunidade segura.</Text>
          </View>

          <Button title={saving ? 'Salvando...' : 'Salvar alteracoes'} onPress={handleSave} loading={saving} fullWidth style={{marginTop:24}} />
          <View style={{height:100}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  saveBtn: { fontSize: 16, fontWeight: '600', color: COLORS.pro },
  content: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarImg: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarLoading: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  changePhotoText: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 12 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  hint: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, padding: 12, marginTop: 24 },
  infoText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, marginLeft: 10 },
});
