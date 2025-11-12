import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FeaturedItem = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
};

export type CollectionItem = {
  id: string;
  title: string;
  badge?: 'New' | 'Hot';
  image: string;
  prompt?: string;
};

const windowWidth = Dimensions.get('window').width;
const CARD_WIDTH = windowWidth * 0.82;
const CARD_SPACING = 16;

export const PRO_PLANS = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: '$9.99/week',
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: '$14.99/month',
    helper: 'Best Value',
  },
  {
    id: 'yearly',
    label: 'Yearly',
    price: '$29.99/year',
    helper: 'Just $0.57 per week',
    badge: 'Best Seller',
  },
] as const;

export const VIRAL_ITEMS: CollectionItem[] = [
  {
    id: 'figurine-me-up',
    title: 'Figurine Me Up!',
    prompt: 'Figurine Me Up!',
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fapp_3dtoy_250911.gif?x-oss-process=style/cover-webp',
  },
  {
    id: '3d-figurine-factory',
    title: '3D Figurine Factory',
    prompt: '3D Figurine Factory',
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2F3dtoy_250909.gif?x-oss-process=style/cover-webp',
  },
  {
    id: 'kiss-kiss-1',
    title: 'Kiss Kiss',
    prompt: 'Kiss Kiss',
    badge: 'Hot',
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kisskiss_0610.gif?x-oss-process=style/cover-webp',
  },
  {
    id: 'kiss-me-to-heaven',
    title: 'Kiss Me to Heaven',
    prompt: 'Kiss Me to Heaven',
    badge: 'New',
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_wetkiss_250910.gif?x-oss-process=style/cover-webp',
  },
  {
    id: 'kiss-kiss-2',
    title: 'Kiss Kiss',
    prompt: 'Kiss Kiss',
    image:
      'https://media.pixverse.ai/asset%2Ftemplate%2Fweb_kisskiss_0610.gif?x-oss-process=style/cover-webp',
  },
];

const HALLOWEEN_ITEMS: CollectionItem[] = [
  {
    id: 'sweet-horror',
    title: 'Sweet Horror',
    badge: 'Hot',
    prompt: 'Sweet Horror',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=70',
  },
  {
    id: 'grim-scythe',
    title: 'Grim Scythe',
    prompt: 'Grim Scythe',
    image:
      'https://images.unsplash.com/photo-1508184964240-ee54a02bb736?auto=format&fit=crop&w=700&q=70',
  },
  {
    id: 'starlit-fae',
    title: 'Starlit Fae',
    prompt: 'Starlit Fae',
    image:
      'https://images.unsplash.com/photo-1545243424-0ce743321e11?auto=format&fit=crop&w=700&q=70',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const featuredItems = useMemo<FeaturedItem[]>(
    () => [
      {
        id: 'shimmy',
        title: 'Shimmy',
        subtitle: 'Dance with the Silly Bird Shimmy!',
        cta: 'Try Now',
        image:
          'https://images.unsplash.com/photo-1555685812-4b74353a2971?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'ghostface',
        title: 'Ghostface',
        subtitle: 'Scream, record, repeat with Ghostface AI!',
        cta: 'Try Pack',
        image:
          'https://images.unsplash.com/photo-1508184964240-ee54a02bb736?auto=format&fit=crop&w=1200&q=80',
      },
    ],
    []
  );

  const viralItems = useMemo(() => VIRAL_ITEMS, []);
  const halloweenItems = useMemo(() => HALLOWEEN_ITEMS, []);

  const handlePressCollectionItem = useCallback(
    (item: CollectionItem) => {
      router.push({
        pathname: '/item/[id]',
        params: {
          id: item.id,
          title: item.title,
          image: item.image,
          prompt: item.prompt ?? item.title,
        },
      });
    },
    [router]
  );

  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="search" size={24} color="#fff" />
          </Pressable>

          <View style={styles.topActions}>
            <Pressable
              style={styles.proBadge}
              onPress={() => router.push('/pro-modal')}>
              <Ionicons name="sparkles" size={16} color="#fff" />
              <Text style={styles.proText}>PRO</Text>
            </Pressable>

            <Pressable style={styles.iconButton}>
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.featureCarousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
              setActiveFeature(index);
            }}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            snapToAlignment="start">
            {featuredItems.map((item) => (
              <View key={item.id} style={[styles.featureCard, { width: CARD_WIDTH }]}>
                <Image source={{ uri: item.image }} style={styles.featureImage} />
                <View style={styles.featureOverlay} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                  <Pressable style={styles.primaryButton}>
                    <LinearGradient
                      colors={["#EA6198", "#7135FF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFillObject}
                      pointerEvents="none"
                    />
                    <Text style={styles.primaryButtonText}>{item.cta}</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.pagination}>
            {featuredItems.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.paginationDot,
                  activeFeature === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        <CollectionSection
          title="Viral"
          items={viralItems}
          onSeeAll={(sectionTitle) =>
            router.push({ pathname: '/all-items', params: { title: sectionTitle } })
          }
          onPressItem={handlePressCollectionItem}
        />
        <CollectionSection
          title="Halloween"
          items={halloweenItems}
          onPressItem={handlePressCollectionItem}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

type CollectionSectionProps = {
  title: string;
  items: CollectionItem[];
  onSeeAll?: (title: string) => void;
  onPressItem?: (item: CollectionItem) => void;
};

function CollectionSection({ title, items, onSeeAll, onPressItem }: CollectionSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <Pressable hitSlop={8} onPress={() => onSeeAll(title)}>
            <Text style={styles.sectionLink}>See All</Text>
          </Pressable>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.sectionRow}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.collectionCard}
              onPress={() => onPressItem?.(item)}>
              <Image source={{ uri: item.image }} style={styles.collectionImage} />
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
                <Text style={styles.collectionTitle}>{item.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0D16',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6F39FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 6,
  },
  proText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  featureCarousel: {
    marginTop: 20,
  },
  featureCard: {
    height: 220,
    borderRadius: 28,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
  },
  featureImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 10, 20, 0.45)',
  },
  featureContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  featureTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  featureSubtitle: {
    color: '#E4E5F1',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 6,
  },
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  pagination: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  paginationDot: {
    height: 6,
    width: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  paginationDotActive: {
    width: 18,
    backgroundColor: '#6F39FF',
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  sectionLink: {
    color: '#A8A9C3',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  collectionCard: {
    width: 160,
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 7, 16, 0.35)',
  },
  cardContent: {
    flex: 1,
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
  badgeNew: {
    backgroundColor: '#6F39FF',
  },
  badgeHot: {
    backgroundColor: '#FF4F6D',
  },
  collectionTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 'auto',
  },
  bottomSpacer: {
    height: 40,
  },
});
