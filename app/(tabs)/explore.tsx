import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MODE_OPTIONS = [
  { id: 'image-to-video', label: 'Image to Video' },
  { id: 'text-to-video', label: 'Text to Video' },
  { id: 'frames', label: 'Frames' },
] as const;

type ModeOptionId = (typeof MODE_OPTIONS)[number]['id'];

export default function ExploreScreen() {
  const [activeMode, setActiveMode] = useState<ModeOptionId>('image-to-video');
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

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
        Alert.alert('Permission needed', 'Please allow camera access to capture a photo.');
      }
      return false;
    }
    return true;
  }, []);

  const handleUploadImage = useCallback(async () => {
    const hasPermission = await ensureLibraryPermission();
    if (!hasPermission) return;

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!pickerResult.canceled) {
      setSelectedAsset(pickerResult.assets[0]);
    }
  }, [ensureLibraryPermission]);

  const handleTakePhoto = useCallback(async () => {
    const hasPermission = await ensureCameraPermission();
    if (!hasPermission) return;

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!cameraResult.canceled) {
      setSelectedAsset(cameraResult.assets[0]);
    }
  }, [ensureCameraPermission]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.time}>11:35</Text>
          <View style={styles.statusIndicators}>
            <Ionicons name="cellular-outline" size={16} color="#E6E7F0" />
            <Ionicons name="wifi-outline" size={16} color="#E6E7F0" />
            <View style={styles.battery}>
              <Text style={styles.batteryValue}>28</Text>
            </View>
          </View>
        </View>

        <View style={styles.titleGroup}>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>
            Transform your ideas into cinematic AI videos in seconds.
          </Text>
        </View>

        <View style={styles.modeRow}>
          {MODE_OPTIONS.map((option) => {
            const isActive = option.id === activeMode;

            if (isActive) {
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setActiveMode(option.id)}
                  style={styles.modeButtonActive}>
                  <LinearGradient
                    colors={["#EA6198", "#7135FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                    pointerEvents="none"
                  />
                  <Text style={styles.modeLabelActive}>{option.label}</Text>
                </Pressable>
              );
            }

            return (
              <Pressable
                key={option.id}
                onPress={() => setActiveMode(option.id)}
                style={styles.modeButton}>
                <Text style={styles.modeLabel}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.uploadCard} onPress={handleUploadImage}>
          <View style={styles.uploadIconShell}>
            <Ionicons name="images-outline" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.uploadTitle}>Upload your image</Text>
          {selectedAsset && (
            <Text style={styles.uploadBadge} numberOfLines={1}>
              {selectedAsset.fileName ?? selectedAsset.uri}
            </Text>
          )}
          <View style={styles.uploadSeparator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>
          <Pressable
            style={styles.cameraButton}
            onPress={(event) => {
              event.stopPropagation();
              handleTakePhoto();
            }}>
            <Ionicons name="camera-outline" size={18} color="#FFFFFF" />
            <Text style={styles.cameraButtonText}>Take a photo</Text>
          </Pressable>
        </Pressable>

        {/* <View style={styles.promptCard}>
          <Text style={styles.promptTitle}>Describe the scene you want to see</Text>
          <Text style={styles.promptCopy}>
            Choose the camera movements from the options below to make your video feel alive.
          </Text>
          <View style={styles.promptAction}>
            <Ionicons name="videocam-outline" size={16} color="#E6E7F0" />
          </View>
        </View>

        <Pressable style={styles.modelCard}>
        <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=60',
            }}
            contentFit="cover"
            style={styles.modelAvatar}
          />
          <Text style={styles.modelLabel}>Pika-2.3 (10s-HD)</Text>
          <Ionicons name="chevron-forward" size={18} color="#F0F1F8" />
        </Pressable> */}

        <Pressable style={styles.generateButton}>
          <LinearGradient
            colors={["#EA6198", "#5B5BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
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
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  time: {
    color: '#E6E7F0',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  battery: {
    height: 18,
    width: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#FFE27A',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1B2D',
  },
  batteryValue: {
    color: '#FFE27A',
    fontSize: 11,
    fontWeight: '700',
  },
  titleGroup: {
    marginTop: 32,
    gap: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  subtitle: {
    color: '#A7A9C4',
    fontSize: 15,
    lineHeight: 22,
  },
  modeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 28,
  },
  modeButtonActive: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
  },
  modeLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  modeButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#1D1B27',
  },
  modeLabel: {
    color: '#C9CAD8',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadCard: {
    marginTop: 28,
    borderRadius: 28,
    backgroundColor: '#1B1824',
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    gap: 20,
  },
  uploadIconShell: {
    height: 86,
    width: 86,
    borderRadius: 26,
    backgroundColor: '#262332',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  uploadBadge: {
    maxWidth: '100%',
    color: '#9BA0BC',
    fontSize: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#252332',
  },
  uploadSeparator: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2F2C3B',
  },
  separatorText: {
    color: '#5E5A72',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#262332',
  },
  cameraButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promptCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 22,
    backgroundColor: '#181523',
    gap: 10,
    position: 'relative',
  },
  promptTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  promptCopy: {
    color: '#A7A9C4',
    fontSize: 14,
    lineHeight: 20,
  },
  promptAction: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#252233',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelCard: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: '#181523',
  },
  modelAvatar: {
    height: 44,
    width: 44,
    borderRadius: 14,
  },
  modelLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  generateButton: {
    marginTop: 32,
    borderRadius: 28,
    overflow: 'hidden',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },
});
