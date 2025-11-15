import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer, type VideoSource } from 'expo-video';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

const DOWNLOADS_KEY = 'downloaded-video-local-uris';

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
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(!!videoUrl);

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
    if (!videoUrl) {
      setIsVideoLoading(false);
      return;
    }
    setIsVideoLoading(true);
    let isMounted = true;
    let checkReadyInterval: ReturnType<typeof setInterval> | null = null;
    let fallbackTimeout: ReturnType<typeof setTimeout> | null = null;
    const load = async () => {
      try {
        await player.replaceAsync({ uri: videoUrl });
        if (isMounted) {
          player.play();
          // Wait for video to be ready - check duration or wait a bit for buffering
          checkReadyInterval = setInterval(() => {
            if (!isMounted) {
              if (checkReadyInterval) clearInterval(checkReadyInterval);
              return;
            }
            // Video is ready when duration is available and > 0
            if (player.duration > 0) {
              if (checkReadyInterval) clearInterval(checkReadyInterval);
              if (fallbackTimeout) clearTimeout(fallbackTimeout);
              setIsVideoLoading(false);
            }
          }, 100);
          // Fallback timeout in case duration never becomes available
          fallbackTimeout = setTimeout(() => {
            if (checkReadyInterval) clearInterval(checkReadyInterval);
            if (isMounted) {
              setIsVideoLoading(false);
            }
          }, 5000);
        }
      } catch (error) {
        console.warn('Failed to start video playback', error);
        if (isMounted) {
          setIsVideoLoading(false);
        }
      }
    };
    load();
    return () => {
      isMounted = false;
      if (checkReadyInterval) clearInterval(checkReadyInterval);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
    };
  }, [player, videoUrl]);

  useEffect(() => {
    if (videoId === undefined) return;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(DOWNLOADS_KEY);
        if (!raw) return;
        const parsed: Record<string | number, string> = JSON.parse(raw);
        const storedUri = parsed?.[videoId];
        if (storedUri) {
          setIsDownloaded(true);
          setLocalUri(storedUri);
        }
      } catch (error) {
        console.warn('Failed to load downloaded video mapping', error);
      }
    };
    load();
  }, [videoId]);

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

    setOptionsVisible(false);
    setDownloading(true);

    try {
      const fileName = `pixverse-video-${videoId ?? 'untitled'}-${Date.now()}.mp4`;
      const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory ?? 'file:///';
      const sanitizedDir = dir.endsWith('/') ? dir : `${dir}/`;
      const fileUri = `${sanitizedDir}${fileName}`;
      console.log('fileUri', fileUri);
      const downloadRes = await FileSystem.downloadAsync(videoUrl, fileUri);
      console.log('downloadRes', downloadRes);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log('media library permission', status);
      if (status !== 'granted') {
        setDownloading(false);
        Alert.alert('Permission Required', 'Media library permission is required to save videos.');
        return;
      }
      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
      console.log('asset', asset);
      try {
        const raw = await AsyncStorage.getItem(DOWNLOADS_KEY);
        const parsed: Record<string | number, string> = raw ? JSON.parse(raw) : {};
        parsed[videoId ?? Date.now()] = asset.uri;
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(parsed));
        setIsDownloaded(true);
        setLocalUri(asset.uri);
      } catch (mapError) {
        console.warn('Failed to persist download mapping', mapError);
      }

      setDownloading(false);
      Alert.alert('Download Successful', 'Video saved to your photo album!');
    } catch (error) {
      setDownloading(false);
      const message = error instanceof Error ? error.message : 'Unable to download this video.';
      Alert.alert('Download Failed', message);
    }
  }, [videoId, videoUrl]);

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
      {isVideoLoading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        </View>
      )}
      {isDownloading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Downloading video...</Text>
          </View>
        </View>
      )}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9, 7, 15, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
});
