import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { COLORS } from '../../components/social/UIComponents';
import { createPost } from '../../services/social/feed';

export default function CreateFeedPostScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao Necessaria', 'Precisamos de acesso a sua galeria para postar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissao Necessaria', 'Precisamos de acesso a camera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!imageUri) {
      Alert.alert('Erro', 'Selecione uma imagem para publicar');
      return;
    }

    setPosting(true);

    const result = await createPost(imageUri, caption.trim() || undefined, location.trim() || undefined);

    setPosting(false);

    if (result.success) {
      Alert.alert('Publicado!', 'Sua foto foi compartilhada com sucesso!');
      navigation.goBack();
    } else {
      Alert.alert('Erro', result.error || 'Nao foi possivel publicar. Tente novamente.');
    }
  };

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={28} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nova Publicacao</Text>
          <TouchableOpacity 
            style={[styles.postBtn, (!imageUri || posting) && styles.postBtnDisabled]}
            onPress={handlePost}
            disabled={!imageUri || posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.postBtnText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Picker */}
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageBtn}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close-circle" size={32} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePicker}>
              <TouchableOpacity style={styles.pickerOption} onPress={pickImage}>
                <View style={styles.pickerIconContainer}>
                  <Ionicons name="images" size={32} color={COLORS.pro} />
                </View>
                <Text style={styles.pickerText}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerOption} onPress={takePhoto}>
                <View style={styles.pickerIconContainer}>
                  <Ionicons name="camera" size={32} color={COLORS.pro} />
                </View>
                <Text style={styles.pickerText}>Camera</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Caption */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Legenda</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Escreva uma legenda..."
              placeholderTextColor={COLORS.textMuted}
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{caption.length}/500</Text>
          </View>

          {/* Location */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Localizacao (opcional)</Text>
            <View style={styles.locationInputContainer}>
              <Ionicons name="location-outline" size={20} color={COLORS.textMuted} />
              <TextInput
                style={styles.locationInput}
                placeholder="Adicionar local"
                placeholderTextColor={COLORS.textMuted}
                value={location}
                onChangeText={setLocation}
                maxLength={100}
              />
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Ionicons name="information-circle" size={20} color={COLORS.pro} />
            <Text style={styles.tipsText}>
              Suas fotos passam por moderacao automatica. Conteudo inapropriado sera bloqueado.
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  postBtn: {
    backgroundColor: COLORS.pro,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postBtnDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  postBtnText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imagePicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 40,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 20,
  },
  pickerOption: {
    alignItems: 'center',
    gap: 8,
  },
  pickerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,215,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: COLORS.border,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    fontSize: 15,
    color: COLORS.text,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  tipsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
