import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, Avatar, EmptyState, Loading, ProBadge } from '../../components/social/UIComponents';
import { searchUsers, getSuggestedFriends, sendFriendRequest, getRelationshipStatus, Profile, RelationshipStatus } from '../../services/social/friends';

interface UserWithStatus extends Profile {
  relationshipStatus?: RelationshipStatus;
}

export default function SearchUsersScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [suggested, setSuggested] = useState<UserWithStatus[]>([]);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => { loadSuggested(); }, []);

  const loadSuggested = async () => {
    try {
      const data = await getSuggestedFriends();
      const withStatus: UserWithStatus[] = [];
      for (const u of data) {
        const status = await getRelationshipStatus(u.id);
        withStatus.push({ ...u, relationshipStatus: status });
      }
      setSuggested(withStatus);
    } catch (e) { console.error(e); }
    finally { setInitialLoading(false); }
  };

  const handleSearch = async () => {
    if (query.length < 2) { setUsers([]); return; }
    Keyboard.dismiss();
    setSearchLoading(true);
    try {
      const data = await searchUsers(query);
      const withStatus: UserWithStatus[] = [];
      for (const u of data) {
        const status = await getRelationshipStatus(u.id);
        withStatus.push({ ...u, relationshipStatus: status });
      }
      setUsers(withStatus);
    } catch (e) { console.error(e); }
    finally { setSearchLoading(false); }
  };

  const handleAddFriend = async (userId: string) => {
    setSendingTo(userId);
    const result = await sendFriendRequest(userId);
    if (result.success) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, relationshipStatus: 'request_sent' } : u));
      setSuggested(prev => prev.map(u => u.id === userId ? { ...u, relationshipStatus: 'request_sent' } : u));
      Alert.alert('Enviado!', 'Pedido enviado');
    } else {
      Alert.alert('Erro', result.error || 'Erro');
    }
    setSendingTo(null);
  };

  const getBadge = (status?: RelationshipStatus) => {
    if (status === 'friends') return <View style={[styles.badge, {backgroundColor: COLORS.success}]}><Text style={styles.badgeText}>Amigos</Text></View>;
    if (status === 'request_sent') return <View style={[styles.badge, {backgroundColor: COLORS.warning}]}><Text style={styles.badgeText}>Pendente</Text></View>;
    if (status === 'request_received') return <View style={[styles.badge, {backgroundColor: COLORS.primary}]}><Text style={styles.badgeText}>Responder</Text></View>;
    return null;
  };

  const list = query.length >= 2 && users.length > 0 ? users : suggested;

  if (initialLoading) return <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}><Loading fullScreen /></LinearGradient>;

  return (
    <LinearGradient colors={[COLORS.gradientStart, COLORS.gradientEnd]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Buscar Pessoas</Text>
        <View style={{width:24}} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Digite o nome..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setQuery(''); setUsers([]); }}>
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity style={[styles.searchBtn, query.length < 2 && styles.searchBtnDisabled]} onPress={handleSearch} disabled={query.length < 2 || searchLoading}>
        <Text style={styles.searchBtnText}>{searchLoading ? 'Buscando...' : 'Buscar'}</Text>
      </TouchableOpacity>

      {query.length < 2 && <Text style={styles.sectionTitle}>Sugestoes para voce</Text>}
      {query.length >= 2 && users.length === 0 && !searchLoading && <Text style={styles.sectionTitle}>Nenhum resultado</Text>}
      {query.length >= 2 && users.length > 0 && <Text style={styles.sectionTitle}>Resultados ({users.length})</Text>}

      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:100}} keyboardShouldPersistTaps="handled">
        {list.map(item => (
          <TouchableOpacity key={item.id} style={styles.userRow} onPress={() => navigation.navigate('UserProfile', { userId: item.id })}>
            <Avatar uri={item.avatar_url} name={item.full_name} size={50} isPro={item.is_pro} />
            <View style={styles.userInfo}>
              <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                <Text style={styles.userName}>{item.full_name || 'Usuario'}</Text>
                {item.is_pro && <ProBadge size="small" />}
              </View>
              {item.city && <Text style={styles.userCity}>{item.city}</Text>}
            </View>
            {item.relationshipStatus === 'none' ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddFriend(item.id)} disabled={sendingTo === item.id}>
                {sendingTo === item.id ? <Loading /> : <Ionicons name="person-add" size={20} color="#FFF" />}
              </TouchableOpacity>
            ) : getBadge(item.relationshipStatus)}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, height: 48, gap: 8 },
  searchInput: { flex: 1, fontSize: 16, color: COLORS.text, height: 48 },
  searchBtn: { backgroundColor: COLORS.pro, marginHorizontal: 16, marginTop: 10, marginBottom: 16, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, paddingHorizontal: 16, marginBottom: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, marginHorizontal: 16, marginBottom: 8, padding: 12, borderRadius: 16 },
  userInfo: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  userCity: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryDark, justifyContent: 'center', alignItems: 'center' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#FFF' },
});
