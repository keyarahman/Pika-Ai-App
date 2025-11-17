import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGeneratedVideos } from '@/store/generated-videos';

const EMPTY_BUCKET_IMAGE =
  'https://cdn.pixabay.com/photo/2012/04/24/13/18/treasure-40020_640.png';

function formatTimestamp(timestamp?: string) {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Just now';
  return date.toLocaleString();
}

const checkVideoUrlReady = async (url: string): Promise<boolean> => {
  if (!url || url.trim().length === 0) {
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { 
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      return true;
    }
  } catch (error) {
    // URL not ready yet
  }

  return false;
};

export default function MyCreationsScreen() {
  const { videos, removeVideo, updateVideoStatus } = useGeneratedVideos();
  const hasCreations = videos.length > 0;
  const router = useRouter();
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videosRef = useRef(videos);

  const handleOpenMenu = (videoId: number) => {
    setSelectedVideoId(videoId);
    setIsDeleteModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDeleteModalVisible(false);
    setSelectedVideoId(null);
  };

  const handleDelete = () => {
    if (selectedVideoId === null) return;

    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: handleCloseModal,
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeVideo(selectedVideoId);
            handleCloseModal();
          },
        },
      ]
    );
  };

  // Keep videos ref up to date
  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  // Poll for processing videos every 2 seconds
  useEffect(() => {
    const processingVideos = videos.filter((v) => v.status === 'processing' && v.url);
    
    if (processingVideos.length === 0) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Start polling if not already started
    if (!pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(async () => {
        // Get fresh videos from ref inside the interval
        const currentProcessingVideos = videosRef.current.filter((v) => v.status === 'processing' && v.url);
        
        for (const video of currentProcessingVideos) {
          if (video.url) {
            const isReady = await checkVideoUrlReady(video.url);
            if (isReady) {
              console.log(`Video ${video.id} is ready!`);
              updateVideoStatus(video.id, 'ready', video.url);
            }
          }
        }
      }, 2000); // Check every 2 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [videos, updateVideoStatus]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Collections</Text>
            <Text style={styles.subtitle}>Keep track of everything you generate.</Text>
          </View>
        </View>

        {hasCreations ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <View style={styles.grid}>
              {videos.map((video) => {
                const thumbnail = video.thumbnail ?? video.url ?? EMPTY_BUCKET_IMAGE;
                const formattedDate = formatTimestamp(video.create_time ?? video.modify_time);
                const isProcessing = video.status === 'processing';
                const isReady = video.status === 'ready' || (!video.status && video.url);
                const canOpen = isReady && Boolean(video.url);

                return (
                  <View key={video.id} style={styles.card}>
                    <Image source={{ uri: thumbnail }} style={styles.thumbnail} contentFit="cover" />
                    <View style={styles.cardOverlay} />
                    {isProcessing && (
                      <View style={styles.processingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <Text style={styles.processingText}>Processing...</Text>
                      </View>
                    )}
                    <Pressable
                      style={styles.menuButton}
                      onPress={() => handleOpenMenu(video.id)}>
                      <Ionicons name="ellipsis-vertical" size={18} color="#fff" />
                    </Pressable>
                    <View style={styles.cardFooter}>
                      <View style={styles.cardMetaBlock}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {video.prompt ?? 'Generated Video'}
                        </Text>
                        <Text style={styles.cardMeta}>{formattedDate}</Text>
                      </View>
                      <Pressable
                        style={[styles.actionButton, !canOpen && styles.actionButtonDisabled]}
                        disabled={!canOpen}
                        onPress={() => {
                          router.push({
                            pathname: '/view-video/[id]',
                            params: {
                              id: String(video.id),
                              prompt: video.prompt ?? '',
                            },
                          });
                        }}>
                        <Ionicons name={canOpen ? 'play' : 'time'} size={18} color="#fff" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.emptySection}>
            <Image source={{ uri: EMPTY_BUCKET_IMAGE }} style={styles.emptyImage} />
            <Text style={styles.emptyTitle}>No videos yet</Text>
            <Text style={styles.emptySubtitle}>
              Generate your first AI video and it will appear here as soon as it’s ready.
            </Text>
            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/explore')}>
              <LinearGradient
                colors={['#EA6198', '#5B5BFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.exploreGradient}
              />
              <Text style={styles.exploreButtonText}>Go to Explore</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isDeleteModalVisible}
        onRequestClose={handleCloseModal}>
        <Pressable style={styles.modalOverlay} onPress={handleCloseModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Video Options</Text>
              <Pressable onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#FF6F7F" />
              <Text style={styles.deleteButtonText}>Delete Video</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    height: 200,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1E1B2D',
    marginBottom: 12,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 7, 16, 0.35)',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 5,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  menuButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  cardMetaBlock: {
    flex: 1,
    marginRight: 12,
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
  actionButtonDisabled: {
    opacity: 0.4,
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
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 6,
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
    overflow: 'hidden',
  },
  exploreGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(18, 15, 25, 0.98)',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 111, 127, 0.1)',
  },
  deleteButtonText: {
    color: '#FF6F7F',
    fontSize: 16,
    fontWeight: '600',
  },
});

