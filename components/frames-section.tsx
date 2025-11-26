import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type FramesSectionProps = {
  startFrame: ImagePicker.ImagePickerAsset | null;
  endFrame: ImagePicker.ImagePickerAsset | null;
  prompt: string;
  onStartFrameChange: (asset: ImagePicker.ImagePickerAsset | null) => void;
  onEndFrameChange: (asset: ImagePicker.ImagePickerAsset | null) => void;
  onPromptChange: (prompt: string) => void;
  onPickImage: () => Promise<ImagePicker.ImagePickerAsset | null>;
  disabled?: boolean;
};

export function FramesSection({
  startFrame,
  endFrame,
  prompt,
  onStartFrameChange,
  onEndFrameChange,
  onPromptChange,
  onPickImage,
  disabled = false,
}: FramesSectionProps) {
  const handleUploadStartFrame = useCallback(async () => {
    const asset = await onPickImage();
    if (asset) {
      onStartFrameChange(asset);
    }
  }, [onPickImage, onStartFrameChange]);

  const handleUploadEndFrame = useCallback(async () => {
    const asset = await onPickImage();
    if (asset) {
      onEndFrameChange(asset);
    }
  }, [onPickImage, onEndFrameChange]);

  return (
    <>
      <View style={styles.framesContainer}>
        <Pressable
          style={[styles.frameBox, disabled && styles.frameBoxDisabled]}
          onPress={handleUploadStartFrame}
          disabled={disabled}>
          {startFrame ? (
            <>
              <Image source={{ uri: startFrame.uri }} style={styles.framePreview} contentFit="cover" />
              <View style={styles.frameOverlay}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.frameOverlayText}>Start Frame</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.frameIconContainer}>
                <Ionicons name="cloud-upload-outline" size={26} color={disabled ? '#6B6D85' : '#7135FF'} />
              </View>
              <Text style={styles.frameLabel}>Start Frame</Text>
            </>
          )}
        </Pressable>
        <Pressable
          style={[styles.frameBox, disabled && styles.frameBoxDisabled]}
          onPress={handleUploadEndFrame}
          disabled={disabled}>
          {endFrame ? (
            <>
              <Image source={{ uri: endFrame.uri }} style={styles.framePreview} contentFit="cover" />
              <View style={styles.frameOverlay}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.frameOverlayText}>End Frame</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.frameIconContainer}>
                <Ionicons name="cloud-upload-outline" size={26} color={disabled ? '#6B6D85' : '#7135FF'} />
              </View>
              <Text style={styles.frameLabel}>End Frame</Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.promptContainer}>
        <TextInput
          style={[styles.promptInput, disabled && styles.promptInputDisabled]}
          placeholder="Describe the scene you want to see and choose the camera movements from the options below."
          placeholderTextColor="#6B6D85"
          value={prompt}
          onChangeText={onPromptChange}
          multiline
          textAlignVertical="top"
          editable={!disabled}
        />
        <Pressable
          style={[styles.promptAction, disabled && styles.promptActionDisabled]}
          disabled={disabled}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
          <Ionicons name="videocam-outline" size={18} color={disabled ? '#6B6D85' : '#FFFFFF'} />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  framesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  frameBox: {
    flex: 1,
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#7135FF',
    backgroundColor: '#1A1824',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  frameIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(113, 53, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  framePreview: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  frameOverlayText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  promptContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  promptInput: {
    width: '100%',
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: '#181523',
    padding: 14,
    paddingRight: 50,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#252233',
  },
  promptAction: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252233',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameBoxDisabled: {
    opacity: 0.5,
  },
  promptInputDisabled: {
    opacity: 0.5,
  },
  promptActionDisabled: {
    opacity: 0.5,
  },
});

