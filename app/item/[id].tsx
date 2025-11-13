import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
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

import { API_BASE_URL, API_KEY } from '@/constants/api';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

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
  }>();
  const [isModalVisible, setModalVisible] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadedMessage, setUploadedMessage] = useState<string | null>(null);
  const [uploadedAssetInfo, setUploadedAssetInfo] = useState<{ imgId: number; imgUrl?: string } | null>(
    null
  );

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

  const uploadAsset = useCallback(
    async (asset: ImagePicker.ImagePickerAsset) => {
      if (!API_KEY) {
        Alert.alert('Missing API key', 'Add your Pixverse API key to continue.');
        return;
      }

      try {
        setUploadStatus('uploading');
        setUploadedMessage(null);

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
          throw new Error(errorText || 'Upload failed');
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
        setUploadedAssetInfo(imgId ? { imgId, imgUrl } : null);

        const message = imgId
          ? `Image uploaded! img_id: ${imgId}`
          : 'Image uploaded successfully!';
        setUploadedMessage(message);
      } catch (error) {
        console.error('Upload error', error);
        setUploadStatus('error');
        const message = error instanceof Error ? error.message : 'Upload failed';
        setUploadedMessage(message);
        Alert.alert('Upload failed', message);
      } finally {
        setModalVisible(false);
      }
    },
    [guessMimeType]
  );

  const handlePickFromLibrary = useCallback(async () => {
    const permitted = await ensureLibraryPermission();
    if (!permitted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      await uploadAsset(result.assets[0]);
    }
  }, [ensureCameraPermission, uploadAsset]);

  const { title, image, prompt } = useMemo(() => {
    return {
      title: typeof params.title === 'string' ? params.title : 'Collection',
      image: typeof params.image === 'string' ? params.image : undefined,
      prompt: typeof params.prompt === 'string' ? params.prompt : undefined,
    };
  }, [params.image, params.prompt, params.title]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" translucent />
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>
        {/* <Pressable style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
        </Pressable> */}
      </View>

      <View style={styles.mediaContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.media} contentFit="cover" />
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
        {uploadedMessage && (
          <Text
            style={[styles.uploadFeedback, uploadStatus === 'error' ? styles.uploadFeedbackError : null]}
            numberOfLines={2}>
            {uploadedMessage}
          </Text>
        )}
        {uploadedAssetInfo && (
          <View style={styles.uploadMeta}>
            <Text style={styles.uploadMetaLabel}>Saved img_id</Text>
            <Text style={styles.uploadMetaValue}>{uploadedAssetInfo.imgId}</Text>
            {uploadedAssetInfo.imgUrl && (
              <Text style={styles.uploadMetaUrl} numberOfLines={1}>
                {uploadedAssetInfo.imgUrl}
              </Text>
            )}
          </View>
        )}
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
              Choose a source to upload an image and start creating.
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

      {uploadStatus === 'uploading' && (
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
  },
  media: {
    width: '100%',
    height: windowHeight * 0.55,
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

