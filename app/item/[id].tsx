import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL, API_KEY, VIDEO_POLL_INTERVAL } from '@/constants/api';
import { useGeneratedVideos } from '@/store/generated-videos';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

type VideoResult = {
  id?: number;
  url?: string;
  video_url?: string;
  cover_url?: string;
  status?: number | string;
  create_time?: string;
  modify_time?: string;
  prompt?: string;
  negative_prompt?: string;
  outputHeight?: number;
  outputWidth?: number;
  size?: number;
};

const { height: windowHeight } = Dimensions.get('window');

const generateTraceId = () => {
  const nativeCrypto = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;
  if (nativeCrypto && typeof nativeCrypto.randomUUID === 'function') {
    return nativeCrypto.randomUUID();
  }
  return `trace-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

export default function CollectionItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    image?: string;
    prompt?: string;
    templateId?: string;
  }>();
  const { addVideo: addGeneratedVideo } = useGeneratedVideos();
  const { title, image, prompt, templateId } = useMemo(() => {
    const resolvedTitle = typeof params.title === 'string' ? params.title : 'Collection';
    const resolvedPrompt = typeof params.prompt === 'string' ? params.prompt : resolvedTitle;
    const resolvedImage = typeof params.image === 'string' ? params.image : undefined;
    const resolvedTemplateId = params.templateId ? Number(params.templateId) : undefined;

    return {
      title: resolvedTitle,
      image: resolvedImage,
      prompt: resolvedPrompt,
      templateId: Number.isFinite(resolvedTemplateId) ? resolvedTemplateId : undefined,
    };
  }, [params.image, params.prompt, params.templateId, params.title]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadedMessage, setUploadedMessage] = useState<string | null>(null);
  const [uploadedAssetInfo, setUploadedAssetInfo] = useState<{ imgId: number; imgUrl?: string } | null>(
    null
  );
  const [videoStatus, setVideoStatus] = useState<UploadStatus>('idle');
  const [videoMessage, setVideoMessage] = useState<string | null>(null);
  const [videoTaskInfo, setVideoTaskInfo] = useState<{ taskId?: string; videoUrl?: string } | null>(
    null
  );
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastUploadedAssetRef = useRef<{ imgId: number; imgUrl?: string } | null>(null);
  const hasNavigatedRef = useRef(false);

  const ensureLibraryPermission = useCallback(async () => {
    const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      if (canAskAgain) {
        Alert.alert('Permission required', 'Please enable photo library access to continue.');
      }
      return false;
    }
    return true;
  }, []);

  const ensureCameraPermission = useCallback(async () => {
    const { granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      if (canAskAgain) {
        Alert.alert('Permission required', 'Please enable camera access to continue.');
      }
      return false;
    }
    return true;
  }, []);

  const guessMimeType = useCallback((asset: ImagePicker.ImagePickerAsset) => {
    if (asset.mimeType) return asset.mimeType;
    if (asset.uri.endsWith('.png')) return 'image/png';
    if (asset.uri.endsWith('.webp')) return 'image/webp';
    return 'image/jpeg';
  }, []);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const navigateToVideoViewer = useCallback(
    async (videoId: number, fallbackUrl?: string, promptText?: string) => {
      if (hasNavigatedRef.current) return;
      hasNavigatedRef.current = true;
      clearPolling();
      setIsGeneratingVideo(false);
      setVideoStatus('success');
      
      // Small delay to ensure store is updated before navigation
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      router.push({
        pathname: '/view-video/[id]',
        params: {
          id: String(videoId),
          url: fallbackUrl ?? '',
          prompt: promptText ?? '',
        },
      });
    },
    [router, clearPolling]
  );

  const startPollingVideoResult = useCallback(
    (videoId: number) => {
      clearPolling();
      setIsGeneratingVideo(true);
      hasNavigatedRef.current = false;
      pollingRef.current = setInterval(async () => {
        if (hasNavigatedRef.current) {
          clearPolling();
          return;
        }
        try {
          const response = await fetch(`${API_BASE_URL}/openapi/v2/video/result/${videoId}`, {
            headers: {
              'API-KEY': API_KEY,
              Accept: 'application/json',
            },
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Failed to fetch video status');
          }

          const json = await response.json().catch(() => null);
          const errCode = json?.ErrCode ?? null;
          if (errCode !== 0) {
            const errMsg = json?.ErrMsg ?? 'Video status retrieval failed';
            throw new Error(errMsg);
          }

          const resp: VideoResult = json?.Resp ?? {};
          const status = resp?.status;

          setVideoResult(resp);

          if (resp?.id && resp?.url) {
            if (hasNavigatedRef.current) {
              clearPolling();
              return;
            }
            const finalVideoId = typeof resp.id === 'number' ? resp.id : videoId;
            const videoSourceUrl = resp.url ?? resp.video_url;
            const thumbnail = resp.cover_url ?? lastUploadedAssetRef.current?.imgUrl ?? videoSourceUrl;
            addGeneratedVideo({
              id: finalVideoId,
              url: videoSourceUrl,
              prompt,
              create_time: resp.create_time,
              modify_time: resp.modify_time,
              outputHeight: resp.outputHeight,
              outputWidth: resp.outputWidth,
              size: resp.size,
              templateId,
              thumbnail,
            });
            navigateToVideoViewer(finalVideoId, videoSourceUrl, prompt);
            

          } else if (status === 3 || status === 'failed' || status === 4) {
            clearPolling();
            setIsGeneratingVideo(false);
            const message = json?.ErrMsg || 'Video generation failed.';
            setVideoStatus('error');
            setVideoMessage(message);
            Alert.alert('Video generation failed', message);
          }
        } catch (error) {
          clearPolling();
          setIsGeneratingVideo(false);
          console.error('Video polling error', error);
          setVideoStatus('error');
          const message = error instanceof Error ? error.message : 'Video polling failed';
          setVideoMessage(message);
          Alert.alert('Video generation failed', message);
        }
      }, VIDEO_POLL_INTERVAL);
    },
    [addGeneratedVideo, clearPolling, navigateToVideoViewer, prompt, templateId]
  );

  const triggerVideoGeneration = useCallback(
    async (imgId: number) => {
      if (!API_KEY) {
        Alert.alert('Missing API key', 'Add your Pixverse API key to continue.');
        return;
      }
      if (!templateId) {
        setVideoStatus('error');
        const message = 'Template unavailable for this item.';
        setVideoMessage(message);
        Alert.alert('Video generation failed', message);
        return;
      }

      try {
        setVideoStatus('uploading');
        setVideoMessage(null);
        setVideoTaskInfo(null);

        const traceId = generateTraceId();
        const payload = {
          duration: 5,
          img_id: imgId,
          model: 'v4.5',
          motion_mode: 'normal',
          negative_prompt: '',
          prompt,
          quality: '540p',
          template_id: templateId,
          seed: 0,
        };

        const response = await fetch(`${API_BASE_URL}/openapi/v2/video/img/generate`, {
          method: 'POST',
          headers: {
            'API-KEY': API_KEY,
            'Ai-trace-id': traceId,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Video generation failed';
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson?.ErrMsg) {
              errorMessage = errorJson.ErrMsg;
            } else if (errorJson?.message) {
              errorMessage = errorJson.message;
            }
          } catch {
            // If not JSON, use the text as is or a default message
            if (errorText && errorText.length < 200) {
              errorMessage = errorText;
            }
          }
          throw new Error(errorMessage);
        }

        const json = await response.json().catch(() => null);
        const errCode = json?.ErrCode ?? null;
        if (errCode !== 0) {
          const errMsg = json?.ErrMsg ?? 'Video generation failed';
          throw new Error(errMsg);
        }

        const resp = json?.Resp ?? {};
        const taskId = typeof resp?.task_id === 'string' ? resp.task_id : undefined;
        const videoUrl = typeof resp?.video_url === 'string' ? resp.video_url : undefined;
        const videoId =
          typeof resp?.id === 'number' ? resp.id : typeof resp?.task_id === 'number' ? resp.task_id : undefined;

        // setVideoStatus('success');
        setVideoMessage('Video generation requested successfully!');
        setVideoTaskInfo({ taskId, videoUrl });
        if (typeof videoId === 'number') {
          startPollingVideoResult(videoId);
        } else if (typeof resp?.video_id === 'number') {
          startPollingVideoResult(resp.video_id);
        }
      } catch (error) {
        console.error('Video generation error', error);
        setIsGeneratingVideo(false);
        setVideoStatus('error');
        let message = 'Video generation failed';

        if (error instanceof Error) {
          message = error.message;
          // Parse common error messages to make them more user-friendly
          if (message.length > 100) {
            // If error message is too long, use a shorter version
            message = 'Video generation failed. Please try again.';
          }
        }

        setVideoMessage(message);
        Alert.alert('Video generation failed', message);
      }
    },
    [prompt, startPollingVideoResult, templateId]
  );

  const uploadAsset = useCallback(

    async (asset: ImagePicker.ImagePickerAsset) => {

      if (!API_KEY) {
        Alert.alert('Missing API key', 'Add your Pixverse API key to continue.');
        return;
      }
      setModalVisible(false);
      setImageLoading(false);
      try {
        setUploadStatus('uploading');
        setUploadedMessage(null);
        setUploadedAssetInfo(null);
        setVideoStatus('idle');
        setVideoMessage(null);
        setVideoTaskInfo(null);

        const formData = new FormData();
        formData.append('image', {
          uri: asset.uri,
          name: asset.fileName ?? `upload-${Date.now()}.jpg`,
          type: guessMimeType(asset),
        } as any);

        const traceId = generateTraceId();

        const response = await fetch(`${API_BASE_URL}/openapi/v2/image/upload`, {
          method: 'POST',
          headers: {
            'API-KEY': API_KEY,
            'Ai-trace-id': traceId,
            Accept: 'application/json',
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = 'Upload failed';
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson?.ErrMsg) {
              errorMessage = errorJson.ErrMsg;
            } else if (errorJson?.message) {
              errorMessage = errorJson.message;
            }
          } catch {
            // If not JSON, use the text as is or a default message
            if (errorText && errorText.length < 200) {
              errorMessage = errorText;
            }
          }
          throw new Error(errorMessage);
        }

        const payload = await response.json().catch(() => null);
        const errCode = payload?.ErrCode ?? null;
        if (errCode !== 0) {
          const errMsg = payload?.ErrMsg ?? 'Upload failed';
          throw new Error(errMsg);
        }

        const respData = payload?.Resp ?? {};
        const imgId = typeof respData?.img_id === 'number' ? respData.img_id : null;
        const imgUrl = typeof respData?.img_url === 'string' ? respData.img_url : undefined;

        setUploadStatus('success');
        const assetInfo = imgId ? { imgId, imgUrl } : null;
        lastUploadedAssetRef.current = assetInfo;
        setUploadedAssetInfo(assetInfo);

        if (imgId) {
          await triggerVideoGeneration(imgId);
        }
      } catch (error) {
        setVideoStatus('error');
        console.error('Upload error', error);
        setIsGeneratingVideo(false);
        setUploadStatus('error');
        let message = 'Upload failed';

        if (error instanceof Error) {
          message = error.message;
          // Parse common error messages to make them more user-friendly
          if (message.includes('incorrect image width or height')) {
            message = 'Image dimensions are incorrect. Please use a clear, front-facing image with standard dimensions.';
          } else if (message.includes('image') && message.includes('size')) {
            message = 'Image size is too large or too small. Please try a different image.';
          } else if (message.includes('format') || message.includes('type')) {
            message = 'Unsupported image format. Please use JPG or PNG.';
          } else if (message.length > 100) {
            // If error message is too long, use a shorter version
            message = 'Upload failed. Please check your image and try again.';
          }
        }

        setUploadedMessage(message);
        Alert.alert('Upload failed', message);
      } finally {
        setModalVisible(false);
      }
    },
    [guessMimeType, triggerVideoGeneration]
  );

  const handlePickFromLibrary = useCallback(async () => {
    const permitted = await ensureLibraryPermission();
    if (!permitted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 1,
    });

    if (!result.canceled) {
      await uploadAsset(result.assets[0]);
    }
  }, [ensureLibraryPermission, uploadAsset]);

  const handleCapturePhoto = useCallback(async () => {

    const permitted = await ensureCameraPermission();
    if (!permitted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 1,
    });

    if (!result.canceled) {
      await uploadAsset(result.assets[0]);
    }
  }, [ensureCameraPermission, uploadAsset]);

  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [clearPolling]);

  useEffect(() => {
    if (image) {
      setImageLoading(true);
    }
  }, [image]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" translucent />
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>

      </View>

      <View style={styles.mediaContainer}>
        {image ? (
          <>
            <Image
              source={{ uri: image }}
              style={styles.media}
              contentFit="cover"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.media, styles.mediaPlaceholder]}>
            <Text style={styles.mediaPlaceholderText}>No preview available</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.promptHeader}>
          <Text style={styles.promptTitle}>{prompt ?? title}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressIndicator} />
        </View>
        <Pressable style={styles.primaryButton} onPress={() => setModalVisible(true)}>
          <LinearGradient
            colors={["#EA6198", "#5B5BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButtonGradient}
          />
          <View style={styles.primaryButtonContent}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              {uploadStatus === 'uploading' ? 'Uploading…' : 'Try Now'}
            </Text>
          </View>
        </Pressable>

      </View>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable
            style={styles.modalSheet}
            onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Animate an Image</Text>
            <Text style={styles.modalSubtitle}>
              Upload a clear, front-facing image to get started.
            </Text>
            <View style={styles.modalOptions}>
              <Pressable style={styles.modalOption} onPress={handleCapturePhoto}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.modalOptionText}>Use Camera</Text>
              </Pressable>
              <Pressable style={styles.modalOption} onPress={handlePickFromLibrary}>
                <Ionicons name="image" size={20} color="#FFFFFF" />
                <Text style={styles.modalOptionText}>Upload from library</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {(uploadStatus === 'uploading' || videoStatus === 'uploading') && (
        <View style={styles.uploadOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#FFFFFF" />
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
    height: windowHeight * 0.55,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 7, 12, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholder: {
    backgroundColor: '#1E1B2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholderText: {
    color: '#8C8FA6',
    fontSize: 16,
    fontWeight: '600',
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
  primaryButton: {
    marginTop: 22,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadFeedback: {
    marginTop: 12,
    color: '#7BD88F',
    fontSize: 13,
    fontWeight: '600',
  },
  uploadFeedbackError: {
    color: '#FF6F7F',
  },
  uploadMeta: {
    marginTop: 10,
    backgroundColor: '#181325',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  uploadMetaLabel: {
    color: '#9BA0BC',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  uploadMetaValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadMetaUrl: {
    color: '#6F7CB3',
    fontSize: 12,
  },
  uploadMetaSuccess: {
    borderColor: 'rgba(99, 203, 147, 0.3)',
    borderWidth: 1,
  },
  uploadMetaError: {
    borderColor: 'rgba(255, 111, 127, 0.4)',
    borderWidth: 1,
  },
  uploadMetaValueError: {
    color: '#FF6F7F',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 4, 8, 0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    marginHorizontal: 12,
    marginBottom: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(18, 15, 25, 0.96)',
    paddingVertical: 26,
    paddingHorizontal: 20,
    gap: 22,
  },
  modalHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#9BA0BC',
    fontSize: 13,
    lineHeight: 18,
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    height: 56,
    borderRadius: 24,
    backgroundColor: '#201C31',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 7, 12, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

