import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FramesSection } from '@/components/frames-section';
import { ImageToVideoSection } from '@/components/image-to-video-section';
import { TextToVideoSection } from '@/components/text-to-video-section';
import { useSubscription } from '@/hooks/use-subscription';
import { useGeneratedVideos } from '@/store/generated-videos';
import { pickImageFromLibrary, takePhotoWithCamera } from '@/utils/image-picker';
import { uploadImage } from '@/utils/image-upload';
import { generateVideoFromImage, pollVideoResult, VideoResult } from '@/utils/video-generation';

const MODE_OPTIONS = [
  { id: 'image-to-video', label: 'Image to Video' },
  { id: 'text-to-video', label: 'Text to Video' },
  { id: 'frames', label: 'Frames' },
] as const;

type ModeOptionId = (typeof MODE_OPTIONS)[number]['id'];
type AspectRatioId = '21:9' | '9:16' | '16:9' | '4:3' | '1:1';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addVideo } = useGeneratedVideos();
  const { isSubscribed, isLoading: isSubscriptionLoading } = useSubscription();
  const [activeMode, setActiveMode] = useState<ModeOptionId>('image-to-video');
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [startFrame, setStartFrame] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [endFrame, setEndFrame] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageToVideoPrompt, setImageToVideoPrompt] = useState('');
  const [textToVideoPrompt, setTextToVideoPrompt] = useState('');
  const [framesPrompt, setFramesPrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioId>('9:16');

  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const pollingStopRef = useRef<(() => void) | null>(null);

  const handlePickImage = useCallback(async () => {
    return await pickImageFromLibrary();
  }, []);

  const handleTakePhoto = useCallback(async () => {
    return await takePhotoWithCamera();
  }, []);

  const handleRemoveImage = useCallback(() => {
    setSelectedAsset(null);
  }, []);

  const handleGenerateImageToVideo = useCallback(async () => {
    // Validation
    if (!selectedAsset) {
      Alert.alert('Image required', 'Please upload an image first.');
      return;
    }
    if (!imageToVideoPrompt.trim()) {
      Alert.alert('Prompt required', 'Please enter a prompt to generate the video.');
      return;
    }

    try {
      setIsGenerating(true);
      setUploadStatus('uploading');

      // Upload image
      console.log('Uploading image...');
      const uploadResult = await uploadImage(selectedAsset);
      console.log('Image uploaded successfully:', uploadResult);

      setUploadStatus('success');

      // Generate video
      console.log('Generating video...');
      const videoResult = await generateVideoFromImage({
        img_id: uploadResult.img_id,
        prompt: imageToVideoPrompt.trim(),
        quality: '1080p',
      });

      console.log('Video generation started:', videoResult);

      // Start polling for video result
      pollingStopRef.current = pollVideoResult(
        videoResult.video_id,
        (result: VideoResult) => {
          console.log('Video status update:', result);
        },
        async (result: VideoResult) => {
          console.log('Video ready:', result);
          setIsGenerating(false);

          // Add video to store
          const videoUrl = result.url || result.video_url;
          if (videoUrl && result.id) {
            await addVideo({
              id: result.id,
              url: videoUrl,
              prompt: imageToVideoPrompt.trim(),
              create_time: result.create_time,
              modify_time: result.modify_time,
              outputHeight: result.outputHeight,
              outputWidth: result.outputWidth,
              size: result.size,
              thumbnail: result.cover_url || uploadResult.img_url,
              status: 'processing',
            });
          }

          // Show success modal
          setShowSuccessModal(true);
        }
      );
    } catch (error) {
      console.error('Generate video error:', error);
      setIsGenerating(false);
      setUploadStatus('error');
      const message = error instanceof Error ? error.message : 'Failed to generate video';
      Alert.alert('Generation failed', message);
    }
  }, [selectedAsset, imageToVideoPrompt, addVideo, router]);

  const handleGenerateTextToVideo = useCallback(async () => {
    // Validation
    if (!textToVideoPrompt.trim()) {
      Alert.alert('Prompt required', 'Please enter a prompt to generate the video.');
      return;
    }

    Alert.alert('Coming soon', 'Text to Video generation is coming soon!');
  }, [textToVideoPrompt]);

  const handleGenerateFrames = useCallback(async () => {
    // Validation
    if (!startFrame || !endFrame) {
      Alert.alert('Frames required', 'Please upload both start and end frames.');
      return;
    }
    if (!framesPrompt.trim()) {
      Alert.alert('Prompt required', 'Please enter a prompt to generate the video.');
      return;
    }

    Alert.alert('Coming soon', 'Frames to Video generation is coming soon!');
  }, [startFrame, endFrame, framesPrompt]);

  const handleGenerateVideo = useCallback(() => {
    if (!isSubscriptionLoading && !isSubscribed) {
      router.push('/pro-modal');
      return;
    }
    
    switch (activeMode) {
      case 'image-to-video':
        handleGenerateImageToVideo();
        break;
      case 'text-to-video':
        handleGenerateTextToVideo();
        break;
      case 'frames':
        handleGenerateFrames();
        break;
    }
  }, [activeMode, handleGenerateImageToVideo, handleGenerateTextToVideo, handleGenerateFrames, isSubscribed, isSubscriptionLoading, router]);

  // Handle success modal OK button
  const handleSuccessModalOK = useCallback(() => {
    setShowSuccessModal(false);
    // Clear prompt and image
    setImageToVideoPrompt('');
    setSelectedAsset(null);
    // Navigate to My Creations tab
    router.push('/(tabs)/my-creations');
  }, [router]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingStopRef.current) {
        pollingStopRef.current();
        pollingStopRef.current = null;
      }
    };
  }, []);

  const renderContent = () => {
    switch (activeMode) {
      case 'image-to-video':
        return (
          <ImageToVideoSection
            selectedAsset={selectedAsset}
            prompt={imageToVideoPrompt}
            onAssetChange={setSelectedAsset}
            onPromptChange={setImageToVideoPrompt}
            onPickImage={handlePickImage}
            onTakePhoto={handleTakePhoto}
            onRemoveImage={handleRemoveImage}
          />
        );
      case 'text-to-video':
        return (
          <TextToVideoSection
            prompt={textToVideoPrompt}
            selectedAspectRatio={selectedAspectRatio}
            onPromptChange={setTextToVideoPrompt}
            onAspectRatioChange={setSelectedAspectRatio}
            disabled={true}
          />
        );
      case 'frames':
        return (
          <FramesSection
            startFrame={startFrame}
            endFrame={endFrame}
            prompt={framesPrompt}
            onStartFrameChange={setStartFrame}
            onEndFrameChange={setEndFrame}
            onPromptChange={setFramesPrompt}
            onPickImage={handlePickImage}
          // disabled={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Explore</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>



        {renderContent()}


        <Pressable
          style={[
            styles.generateButton,
            (isGenerating || activeMode === 'text-to-video' || activeMode === 'frames') &&
            styles.generateButtonDisabled,
          ]}
          onPress={handleGenerateVideo}
          disabled={isGenerating || activeMode === 'text-to-video' || activeMode === 'frames'}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}>
          <LinearGradient
            colors={
              activeMode === 'text-to-video' || activeMode === 'frames'
                ? ['#3A3A3A', '#2A2A2A']
                : ['#EA6198', '#7135FF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          {isGenerating ? (
            <View style={styles.generateButtonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.generateText}>
                Generating...
                {/* {uploadStatus === 'uploading' ? 'Uploading...' : 'Generating...'} */}
              </Text>
            </View>
          ) : activeMode === 'text-to-video' || activeMode === 'frames' ? (
            <Text style={styles.generateText}>Coming Soon</Text>
          ) : (
            <Text style={styles.generateText}>Generate Video</Text>
          )}
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalOK}>
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={['#EA6198', '#7135FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.successIconGradient}>
                <Ionicons name="checkmark" size={48} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.successTitle}>Hurrah! 🎉</Text>
            <Text style={styles.successMessage}>
              Video has been generated! Just wait a few moments for it to be ready.
            </Text>
            <Pressable
              style={styles.successButton}
              onPress={handleSuccessModalOK}
              android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}>
              <LinearGradient
                colors={['#EA6198', '#7135FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={styles.successButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0D16',

  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
  },
  header: {
    marginLeft: 18,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  modeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#1A1824',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    borderColor: 'transparent',
  },
  modeLabel: {
    color: '#9BA0BC',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modeLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#181523',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252233',
  },
  modelIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelIconGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  modelIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modelInfo: {
    flex: 1,
  },
  modelLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  modelSubtext: {
    color: '#6B6D85',
    fontSize: 11,
    fontWeight: '500',
  },
  generateButton: {
    borderRadius: 20,
    overflow: 'hidden',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7135FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: '#1A1824',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#252233',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    color: '#9BA0BC',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  successButton: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 40,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
