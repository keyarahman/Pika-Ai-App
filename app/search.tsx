import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { VIRAL_ITEMS, type CollectionItem } from './(tabs)/index';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return VIRAL_ITEMS;
    }
    const query = searchQuery.toLowerCase().trim();
    return VIRAL_ITEMS.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.prompt?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handlePressItem = useCallback(
    (item: CollectionItem) => {
      router.push({
        pathname: '/item/[id]',
        params: {
          id: item.id,
          title: item.title,
          image: item.image,
          prompt: item.prompt ?? item.title,
          templateId: item.templateId ? String(item.templateId) : undefined,
        },
      });
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: CollectionItem }) => (
      <Pressable style={styles.card} onPress={() => handlePressItem(item)}>
        <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" />
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          {item.badge && (
            <View
              style={[
                styles.badge,
                item.badge === 'Hot' ? styles.badgeHot : styles.badgeNew,
              ]}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </Pressable>
    ),
    [handlePressItem]
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#8C8FA6" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search viral items..."
              placeholderTextColor="#8C8FA6"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#8C8FA6" />
              </Pressable>
            )}
          </View>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>

        {filteredItems.length > 0 ? (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#8C8FA6" />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try searching with different keywords
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0D16',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  closeButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    width: '48%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
    marginBottom: 12,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 7, 16, 0.35)',
  },
  cardContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeHot: {
    backgroundColor: '#FF6F7F',
  },
  badgeNew: {
    backgroundColor: '#5B5BFF',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#8C8FA6',
    fontSize: 14,
    textAlign: 'center',
  },
});

