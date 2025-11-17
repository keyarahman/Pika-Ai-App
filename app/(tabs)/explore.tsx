import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FramesSection } from '@/components/frames-section';
import { ImageToVideoSection } from '@/components/image-to-video-section';
import { TextToVideoSection } from '@/components/text-to-video-section';

const MODE_OPTIONS = [
  { id: 'image-to-video', label: 'Image to Video' },
  { id: 'text-to-video', label: 'Text to Video' },
  { id: 'frames', label: 'Frames' },
] as const;

type ModeOptionId = (typeof MODE_OPTIONS)[number]['id'];
type AspectRatioId = '21:9' | '9:16' | '16:9' | '4:3' | '1:1';

export default function ExploreScreen() {
  const [activeMode, setActiveMode] = useState<ModeOptionId>('image-to-video');
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [startFrame, setStartFrame] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [endFrame, setEndFrame] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [imageToVideoPrompt, setImageToVideoPrompt] = useState('');
  const [textToVideoPrompt, setTextToVideoPrompt] = useState('');
  const [framesPrompt, setFramesPrompt] = useState('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioId>('9:16');

  const ensureLibraryPermission = useCallback(async () => {
    const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      if (canAskAgain) {
        Alert.alert('Permission needed', 'Please allow photo library access to pick an image.');
      }
      return false;
    }
    return true;
  }, []);

  const ensureCameraPermission = useCallback(async () => {
    const { granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      if (canAskAgain) {
        Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
      }
      return false;
    }
    return true;
  }, []);

  const handlePickImage = useCallback(async () => {
    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) return null;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (!pickerResult.canceled && pickerResult.assets[0]) {
      return pickerResult.assets[0];
    }
    return null;
  }, [ensureLibraryPermission]);

  const handleTakePhoto = useCallback(async () => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) return null;

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: false,
    });

    if (!cameraResult.canceled && cameraResult.assets[0]) {
      return cameraResult.assets[0];
    }
    return null;
  }, [ensureCameraPermission]);

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
          />
        );
      case 'text-to-video':
        return (
          <TextToVideoSection
            prompt={textToVideoPrompt}
            selectedAspectRatio={selectedAspectRatio}
            onPromptChange={setTextToVideoPrompt}
            onAspectRatioChange={setSelectedAspectRatio}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
        </View>

        <View style={styles.modeRow}>
          {MODE_OPTIONS.map((option) => {
            const isActive = option.id === activeMode;
            return (
              <Pressable
                key={option.id}
                onPress={() => setActiveMode(option.id)}
                style={[styles.modeButton, isActive && styles.modeButtonActive]}
                android_ripple={{ color: 'rgba(113, 53, 255, 0.2)' }}>
                {isActive ? (
                  <LinearGradient
                    colors={['#EA6198', '#7135FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                ) : null}
                <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {renderContent()}


        <Pressable
          style={styles.generateButton}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}>
          <LinearGradient
            colors={['#EA6198', '#7135FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Text style={styles.generateText}>Generate Video</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
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
    paddingTop: 12,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 18,
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
  generateText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  bottomSpacer: {
    height: 20,
  },
});
