import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { COLORS, Loading } from '../../components/social/UIComponents';
import { getCategories, createPost, ForumCategory } from '../../services/social/forum';
import { pickImage, uploadForumImage, moderateText, moderateTextWithAI } from '../../services/social/media';

export default function CreatePostScreen() {
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const load = async () => {
      const cats = await getCategories();
      console.log('Categorias carregadas:', cats.length);
      setCategories(cats);
      setLoading(false);
    };
    load();
  }, []);

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (uri) {
      setUploadingImage(true);
      setImageUri(uri);
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handlePost = async () => {
    const hasTitle = title.trim().length > 0;
    const hasContent = content.trim().length > 0;
    const hasImage = imageUri !== null;

    if (!hasTitle && !hasContent && !hasImage) {
      return Alert.alert('Erro', 'Escreva algo ou adicione uma imagem para publicar');
    }

    if (categories.length === 0) {
      return Alert.alert('Erro', 'Nenhuma categoria disponivel. Tente novamente.');
    }

    if (hasTitle) {
      const titleMod = moderateText(title);
      if (!titleMod.safe) return Alert.alert('Conteudo inadequado', titleMod.reason || 'Titulo inapropriado');
    }

    if (hasContent) {
      const contentMod = await moderateTextWithAI(content);
      if (!contentMod.safe) return Alert.alert('Conteudo inadequado', contentMod.reason || 'Conteudo inapropriado');
    }

    setPosting(true);

    try {
      let imageUrl: string | undefined;

      if (imageUri) {
        const uploadResult = await uploadForumImage(imageUri);
        if (!uploadResult.success) {
          Alert.alert('Erro na imagem', uploadResult.error || 'Imagem nao permitida');
          setPosting(false);
          return;
        }
        imageUrl = uploadResult.url;
      }

      const finalTitle = title.trim() || 'Post sem titulo';
      const finalContent = content.trim() || '';

      // Usar primeira categoria (Comunidade ou qualquer outra)
      const defaultCategory = categories.find(c => c.name === 'Comunidade') || categories[0];
      
      console.log('Criando post com categoria:', defaultCategory.id, defaultCategory.name);

      const result = await createPost(defaultCategory.id, finalTitle, finalContent, imageUrl);
      if (result) {
        Alert.alert('Publicado!', 'Seu post foi criado com sucesso');
        navigation.goBack();
      } else {
        Alert.alert('Erro', 'Nao foi possivel criar o post. Verifique se voce e PRO.');
      }
    } catch (e: any) {
      console.error('Erro ao criar post:', e);
      Alert.alert('Erro', e.message || 'Erro ao criar post');
    }
    setPosting(false);
  };

  if (loading) {
    return (
      <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
        <Loading />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Novo Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={posting} style={styles.publishBtn}>
          <Text style={[styles.postBtnText, posting && { opacity: 0.5 }]}>
            {posting ? 'Publicando...' : 'Publicar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Titulo (opcional)</Text>
        <TextInput
          style={styles.inputTitle}
          placeholder="Titulo do seu post..."
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <Text style={styles.label}>Conteudo (opcional)</Text>
        <TextInput
          style={styles.inputContent}
          placeholder="Compartilhe seus pensamentos, testemunhos ou pedidos de oracao..."
          placeholderTextColor={COLORS.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />
        <Text style={styles.charCount}>{content.length}/2000</Text>

        <Text style={styles.label}>Imagem (opcional)</Text>
        {imageUri ? (
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImg} />
            <TouchableOpacity style={styles.removeImgBtn} onPress={handleRemoveImage}>
              <Ionicons name="close-circle" size={32} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addImageBtn} onPress={handlePickImage} disabled={uploadingImage}>
            {uploadingImage ? (
              <Loading />
            ) : (
              <>
                <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.addImageText}>Adicionar imagem</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.pro} />
          <Text style={styles.infoText}>Preencha pelo menos um campo (titulo, conteudo ou imagem) para publicar.</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 60, 
    paddingBottom: 16 
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: 'rgba(255,255,255,0.15)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  publishBtn: { padding: 8 },
  postBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.pro },
  content: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 16 },
  inputTitle: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16, 
    color: COLORS.text, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  inputContent: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15, 
    color: COLORS.text, 
    minHeight: 150, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  charCount: { fontSize: 12, color: COLORS.textMuted, textAlign: 'right', marginTop: 4 },
  addImageBtn: { 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    padding: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    borderStyle: 'dashed' 
  },
  addImageText: { fontSize: 14, color: COLORS.textMuted, marginTop: 8 },
  imagePreview: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  previewImg: { width: '100%', height: 200, borderRadius: 12 },
  removeImgBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'white', borderRadius: 16 },
  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.card, 
    borderRadius: 12, 
    padding: 12, 
    marginTop: 24 
  },
  infoText: { flex: 1, fontSize: 12, color: COLORS.textSecondary, marginLeft: 10 },
});
