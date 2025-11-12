import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CollectionItem, VIRAL_ITEMS } from './(tabs)/index';

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
  const { title } = useLocalSearchParams<{ title?: string }>();
  const headerTitle =
    typeof title === 'string' && title.trim().length > 0 ? title : 'All Items';

  const renderItem = ({ item }: { item: CollectionItem }) => (
    <View style={styles.card}>
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
    </View>
  );

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
        data={VIRAL_ITEMS}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
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
});

