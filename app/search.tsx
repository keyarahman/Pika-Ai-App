import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CollectionItem,
  getAllCollectionsItems
} from './(tabs)/index';

const NUM_COLUMNS = 2;
const HORIZONTAL_PADDING = 20;
const ITEM_SPACING = 16;
const CARD_WIDTH =
  (Dimensions.get('window').width -
    HORIZONTAL_PADDING * 2 -
    ITEM_SPACING * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  // Use merged all collections list for search
  const allItems = useMemo(() => getAllCollectionsItems(), []);

  // Filter items based on search query - show viral list by default
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allItems;
    }

    const query = searchQuery.toLowerCase().trim();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.prompt?.toLowerCase().includes(query)
    );
  }, [searchQuery, allItems]);

  const handlePressItem = useCallback(
    (item: CollectionItem) => {
      router.push({
        pathname: '/item/[id]',
        params: {
          id: item.id,
          title: item.title,
          image: item.image,
          prompt: item.prompt ?? item.title,
          templateId: item.templateId?.toString(),
          videUrl: item.videUrl,
        },
      });
    },
    [router]
  );

  const renderItem = ({ item }: { item: CollectionItem }) => (
    <Pressable style={styles.card} onPress={() => handlePressItem(item)}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
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
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" translucent />
      <View style={styles.stickyHeader}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </Pressable>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#77759A" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates..."
            placeholderTextColor="#77759A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#77759A" />
            </Pressable>
          )}
        </View>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#77759A" />
          <Text style={styles.emptyStateText}>No results found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try a different search term
          </Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          data={filteredItems}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#08070B',
  },
  stickyHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#0F0D16',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 15, 28, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 16,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    aspectRatio: 0.75,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: ITEM_SPACING,
    backgroundColor: 'rgba(17, 15, 28, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeHot: {
    backgroundColor: '#FF1744',
  },
  badgeNew: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#77759A',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

