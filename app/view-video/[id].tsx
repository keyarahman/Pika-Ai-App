import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoView, useVideoPlayer, type VideoSource } from 'expo-video';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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
  const { videos } = useGeneratedVideos();

  const videoId = useMemo(() => {
    if (typeof params.id === 'string') {
      const parsed = Number(params.id);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return undefined;
  }, [params.id]);

  // Make storedVideo reactive to store changes
  const storedVideo = useMemo(() => {
    if (videoId === undefined) return undefined;
    return videos.find((video) => video.id === videoId);
  }, [videoId, videos]);

  // Prioritize stored video URL, but fallback to params.url if available
  const videoUrl = useMemo(() => {
    const storedUrl = storedVideo?.url;
    const paramUrl = typeof params.url === 'string' && params.url.trim().length > 0 ? params.url.trim() : undefined;
    return storedUrl || paramUrl;
  }, [storedVideo?.url, params.url]);

  const prompt = storedVideo?.prompt || (typeof params.prompt === 'string' && params.prompt.trim().length > 0 ? params.prompt.trim() : undefined);

  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [isDownloading, setDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const initialSource = useMemo<VideoSource>(() => ({ uri: videoUrl ?? 'data:,' }), [videoUrl]);
  const player = useVideoPlayer(initialSource, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = false; // Enable sound
    try {
      playerInstance.play();
    } catch {
      // ignore autoplay issues
    }
  });

  // Update video source when videoUrl changes
  useEffect(() => {
    if (videoUrl) {
      setVideoProgress(0);
      progressAnim.setValue(0);
      player.replaceAsync({ uri: videoUrl }).catch((error) => {
        console.warn('Failed to load video', error);
      });
    }
  }, [videoUrl, player, progressAnim]);

  // Track video progress
  useEffect(() => {
    if (!videoUrl) return;

    const updateProgress = () => {
      const currentTime = player.currentTime;
      const duration = player.duration;

      if (duration > 0) {
        setVideoDuration(duration);
        const progress = Math.min(Math.max(currentTime / duration, 0), 1);
        setVideoProgress(progress);
        // Animate progress bar smoothly
        Animated.timing(progressAnim, {
          toValue: progress,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }
    };

    const interval = setInterval(updateProgress, 100); // Update every 100ms

    return () => {
      clearInterval(interval);
    };
  }, [videoUrl, player, progressAnim]);

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Video unavailable</Text>
          <Text style={styles.errorSubtitle}>
            We couldn&apos;t load this video. Please try generating again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={handleClose}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => setOptionsVisible(true)}>
          <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.mediaContainer}>
        <VideoView
          player={player}
          style={styles.media}
          contentFit="cover"
          nativeControls={false}
        />
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.promptHeader}>
          <Text style={styles.promptTitle}>{prompt ?? 'Generated video'}</Text>
        </View>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressIndicator,
              {
                width: videoDuration > 0
                  ? progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                  : '25%',
              },
            ]}
          />
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isOptionsVisible}
        onRequestClose={() => setOptionsVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOptionsVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
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
    backgroundColor: '#08070B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 12,
  },
  iconButton: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  bottomSheet: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 24,
    backgroundColor: 'rgba(10, 8, 16, 0.9)',
  },
  promptHeader: {
    marginBottom: 16,
  },
  promptTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  progressIndicator: {
    height: '100%',
    width: '25%',
    borderRadius: 2,
    backgroundColor: '#F3E8D5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 4, 10, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
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
