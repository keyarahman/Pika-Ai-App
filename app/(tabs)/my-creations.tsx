import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Creation = {
  id: string;
  title: string;
  thumbnail: string;
  createdAt: string;
};

const creations: Creation[] = [
  {
    id: 'midnight-witch',
    title: 'Midnight Witch',
    createdAt: 'Oct 26, 2025',
    thumbnail:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'celestial-dream',
    title: 'Celestial Dream',
    createdAt: 'Oct 18, 2025',
    thumbnail:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'neon-rider',
    title: 'Neon Rider',
    createdAt: 'Oct 14, 2025',
    thumbnail:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
  },
];

export default function MyCreationsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Creations</Text>
            <Text style={styles.subtitle}>Keep track of everything you generate.</Text>
          </View>

          <Pressable style={styles.uploadButton}>
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
            <Text style={styles.uploadText}>Import</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <View style={styles.grid}>
            {creations.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                <View style={styles.cardOverlay} />
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMeta}>{item.createdAt}</Text>
                  </View>
                  <Pressable style={styles.actionButton}>
                    <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.emptySection}>
          <Ionicons name="images-outline" size={48} color="#444156" />
          <Text style={styles.emptyTitle}>Need more inspiration?</Text>
          <Text style={styles.emptySubtitle}>
            Browse new templates in Explore and save your favorites here.
          </Text>
          <Pressable style={styles.exploreButton}>
            <Text style={styles.exploreButtonText}>Go to Explore</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F0D16',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: '#A8A9C3',
    fontSize: 15,
    marginTop: 6,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6F39FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    gap: 8,
  },
  uploadText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  grid: {
    gap: 18,
  },
  card: {
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 7, 16, 0.35)',
  },
  cardFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardMeta: {
    color: '#C4C6D8',
    fontSize: 13,
    marginTop: 4,
  },
  actionButton: {
    height: 38,
    width: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySection: {
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: '#171426',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#A8A9C3',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: '#6F39FF',
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

