import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchWinterVibeTemplates, WinterTemplate } from '@/utils/winter-vibe';
import {
  AI_DANCING_ITEMS,
  // AI_ROMANCE_ITEMS, // Commented out for App Store review - intimate content removed
  AI_STYLE_ITEMS,
  CollectionItem,
  VIRAL_ITEMS,
} from './(tabs)/index';

const NUM_COLUMNS = 2;
const HORIZONTAL_PADDING = 20;
const ITEM_SPACING = 16;
const CARD_WIDTH =
  (Dimensions.get('window').width -
    HORIZONTAL_PADDING * 2 -
    ITEM_SPACING * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export default function AllItemsScreen() {
  const router = useRouter();
  const { title, items: itemsParam, collectionKey } = useLocalSearchParams<{
    title?: string;
    items?: string;
    collectionKey?: string;
  }>();
  const headerTitle =
    typeof title === 'string' && title.trim().length > 0 ? title : 'All Items';
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [winterItems, setWinterItems] = useState<CollectionItem[]>([]);
  const [winterPage, setWinterPage] = useState(1);
  const [isWinterLoading, setIsWinterLoading] = useState(false);
  const [isWinterRefreshing, setIsWinterRefreshing] = useState(false);
  const [winterHasMore, setWinterHasMore] = useState(true);

  const normalizedCollectionKey =
    Array.isArray(collectionKey) ? collectionKey[0] : collectionKey;
  const isWinterVibe = normalizedCollectionKey === 'winter-vibe';

  // Parse items from params or fallback to default collections
  const collectionData = useMemo(() => {
    // If items are passed as params, parse and use them
    if (itemsParam && typeof itemsParam === 'string') {
      try {
        const parsedItems = JSON.parse(itemsParam) as CollectionItem[];
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          return parsedItems;
        }
      } catch (error) {
        console.warn('Failed to parse items from params:', error);
      }
    }

    // Fallback: Determine collection based on title if items not provided
    if (title && typeof title === 'string') {
      const normalizedTitle = title.toLowerCase().trim();
      const collectionMap: { [key: string]: CollectionItem[] } = {
        viral: VIRAL_ITEMS,
        // 'ai romance': AI_ROMANCE_ITEMS, // Commented out for App Store review
        'ai style': AI_STYLE_ITEMS,
        'ai dancing': AI_DANCING_ITEMS,
      };

      for (const [key, items] of Object.entries(collectionMap)) {
        if (normalizedTitle === key || normalizedTitle.includes(key)) {
          return items;
        }
      }
    }

    // Default to Viral if no match found
    return VIRAL_ITEMS;
  }, [title, itemsParam]);

  const mapWinterTemplateToCollectionItem = useCallback((template: WinterTemplate): CollectionItem => {
    const image =
      template.web_thumbnail_gif_url ||
      template.web_thumbnail_url ||
      template.app_thumbnail_gif_url ||
      template.app_thumbnail_url ||
      '';

    const videUrl =
      template.web_thumbnail_video_url ||
      template.app_thumbnail_video_url ||
      '';

    return {
      id: String(template.template_id),
      title: template.display_name || `Template ${template.template_id}`,
      prompt: template.display_prompt || template.display_name || `Template ${template.template_id}`,
      templateId: template.template_id,
      image,
      videUrl,
    };
  }, []);

  const loadWinterPage = useCallback(
    async (page: number, isRefresh: boolean = false) => {
      if (isWinterLoading) return;
      try {
        setIsWinterLoading(true);
        const pageSize = 20;
        const { templates, hasMore } = await fetchWinterVibeTemplates(page, pageSize);
        const mapped = templates.map(mapWinterTemplateToCollectionItem);
        setWinterItems((prev) => (isRefresh || page === 1 ? mapped : [...prev, ...mapped]));
        setWinterHasMore(hasMore);
        setWinterPage(page);
      } catch (error) {
        console.error('Failed to load Winter Vibe templates', error);
      } finally {
        setIsWinterLoading(false);
        if (isRefresh) {
          setIsWinterRefreshing(false);
        }
      }
    },
    [isWinterLoading, mapWinterTemplateToCollectionItem]
  );

  useEffect(() => {
    if (isWinterVibe) {
      setWinterItems([]);
      setWinterPage(1);
      setWinterHasMore(true);
      void loadWinterPage(1, true);
    }
  }, [isWinterVibe, loadWinterPage]);

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

  const handleImageLoadStart = useCallback((itemId: string) => {
    setLoadingImages((prev) => new Set(prev).add(itemId));
  }, []);

  const handleImageLoadEnd = useCallback((itemId: string) => {
    setLoadingImages((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  }, []);

  const dataToRender = isWinterVibe ? winterItems : collectionData;

  const renderItem = useCallback(({ item }: { item: CollectionItem }) => {
    const isLoading = loadingImages.has(item.id);
    return (
      <Pressable style={styles.card} onPress={() => handlePressItem(item)}>
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
          onLoadStart={() => handleImageLoadStart(item.id)}
          onLoadEnd={() => handleImageLoadEnd(item.id)}
          onError={() => handleImageLoadEnd(item.id)}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={200}
          placeholderContentFit="cover"
        />
        {isLoading && (
          <View style={styles.imageLoadingOverlay}>
            <ActivityIndicator size="small" color="#9BA0BC" />
          </View>
        )}
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
  }, [loadingImages, handlePressItem, handleImageLoadStart, handleImageLoadEnd]);

  const keyExtractor = useCallback((item: CollectionItem) => item.id, []);

  const handleLoadMore = useCallback(() => {
    if (!isWinterVibe || isWinterLoading || !winterHasMore) return;
    void loadWinterPage(winterPage + 1);
  }, [isWinterVibe, isWinterLoading, winterHasMore, winterPage, loadWinterPage]);

  const handleRefresh = useCallback(() => {
    if (!isWinterVibe) return;
    setIsWinterRefreshing(true);
    void loadWinterPage(1, true);
  }, [isWinterVibe, loadWinterPage]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" translucent />
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        data={dataToRender}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.6}
        refreshing={isWinterVibe ? isWinterRefreshing : false}
        onRefresh={isWinterVibe ? handleRefresh : undefined}
        ListEmptyComponent={
          isWinterVibe && isWinterLoading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#9BA0BC" />
            </View>
          ) : null
        }
        ListFooterComponent={
          isWinterVibe && isWinterLoading && winterItems.length > 0 ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#9BA0BC" />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0D16',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerPlaceholder: {
    height: 40,
    width: 40,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingBottom: 40,
  },
  columnWrapper: {
    gap: ITEM_SPACING,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
    marginBottom: ITEM_SPACING,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH * 1.25,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 7, 16, 0.25)',
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  badgeHot: {
    backgroundColor: '#FF4F6D',
  },
  badgeNew: {
    backgroundColor: '#6F39FF',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 'auto',
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 13, 22, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});

