import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer, type VideoSource } from 'expo-video';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useGeneratedVideos } from '@/store/generated-videos';

export default function ViewVideoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; url?: string; prompt?: string }>();
  const { getVideoById } = useGeneratedVideos();

  const videoId = useMemo(() => {
    if (typeof params.id === 'string') {
      const parsed = Number(params.id);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }, [params.id]);

  const storedVideo = videoId !== undefined ? getVideoById(videoId) : undefined;
  const videoUrl = storedVideo?.url || (typeof params.url === 'string' && params.url.length > 0 ? params.url : undefined);
  const prompt = storedVideo?.prompt || (typeof params.prompt === 'string' ? params.prompt : undefined);

  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [isDownloading, setDownloading] = useState(false);

  const initialSource = useMemo<VideoSource>(() => ({ uri: videoUrl ?? 'data:,' }), [videoUrl]);
  const player = useVideoPlayer(initialSource, (playerInstance) => {
    playerInstance.loop = true;
    try {
      playerInstance.play();
    } catch {
      // ignore autoplay issues
    }
  });

  useEffect(() => {
    if (!videoUrl) return;
    let isMounted = true;
    const load = async () => {
      try {
        await player.replaceAsync({ uri: videoUrl });
        if (isMounted) {
          player.play();
        }
      } catch (error) {
        console.warn('Failed to start video playback', error);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [player, videoUrl]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleShare = useCallback(async () => {
    if (!videoUrl) return;
    try {
      await Share.share({ message: videoUrl, url: videoUrl });
    } catch (error) {
      Alert.alert('Share failed', error instanceof Error ? error.message : 'Unable to share this video.');
    }
  }, [videoUrl]);

  const handleDownload = useCallback(async () => {
    if (!videoUrl) return;

    try {
      setDownloading(true);
      const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? 'file:///';
      const sanitizedBase = baseDir.endsWith('/') ? baseDir : `${baseDir}/`;
      const fileUri = `${sanitizedBase}pixverse-${Date.now()}.mp4`;
      const result = await FileSystem.downloadAsync(videoUrl, fileUri);
      setDownloading(false);
      Alert.alert('Download complete', `Saved to: ${result.uri}`);
    } catch (error) {
      setDownloading(false);
      Alert.alert('Download failed', error instanceof Error ? error.message : 'Unable to download this video.');
    }
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.safeAreaDark]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Video unavailable</Text>
          <Text style={styles.errorSubtitle}>
            We couldn&apos;t load this video. Please try generating again.
          </Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, styles.safeAreaDark]}>
      <View style={styles.container}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="contain"
          nativeControls
        />

        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setOptionsVisible(true)}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View style={styles.promptWrapper}>
          <Text style={styles.promptLabel}>Prompt</Text>
          <Text style={styles.promptText} numberOfLines={2}>
            {prompt ?? 'Generated video'}
          </Text>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isOptionsVisible}
        onRequestClose={() => setOptionsVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOptionsVisible(false)}>
          <Pressable style={styles.bottomSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Video actions</Text>
            <Pressable style={styles.sheetAction} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#FFFFFF" />
              <Text style={styles.sheetActionText}>Share</Text>
            </Pressable>
            <Pressable style={styles.sheetAction} onPress={handleDownload} disabled={isDownloading}>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <Text style={styles.sheetActionText}>{isDownloading ? 'Downloading…' : 'Download'}</Text>
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
  },
  safeAreaDark: {
    backgroundColor: '#09070F',
  },
  container: {
    flex: 1,
    backgroundColor: '#09070F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 8, 16, 0.75)',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  promptLabel: {
    color: '#B4B5C9',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  promptText: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 4, 10, 0.7)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 26,
    backgroundColor: 'rgba(18, 15, 25, 0.98)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  sheetActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#08060D',
    gap: 12,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  errorSubtitle: {
    color: '#B4B5C9',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 16,
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
