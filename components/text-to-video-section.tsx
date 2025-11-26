import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const ASPECT_RATIOS = [
  { id: '21:9', label: '21:9' },
  { id: '9:16', label: '9:16' },
  { id: '16:9', label: '16:9' },
  { id: '4:3', label: '4:3' },
  { id: '1:1', label: '1:1' },
] as const;

type AspectRatioId = (typeof ASPECT_RATIOS)[number]['id'];

type TextToVideoSectionProps = {
  prompt: string;
  selectedAspectRatio: AspectRatioId;
  onPromptChange: (prompt: string) => void;
  onAspectRatioChange: (ratio: AspectRatioId) => void;
  disabled?: boolean;
};

export function TextToVideoSection({
  prompt,
  selectedAspectRatio,
  onPromptChange,
  onAspectRatioChange,
  disabled = false,
}: TextToVideoSectionProps) {
  const handleSurpriseMe = useCallback(() => {
    const prompts = [
      'A serene sunset over a calm ocean with gentle waves',
      'A futuristic cityscape at night with neon lights',
      'A magical forest with glowing fireflies dancing',
      'A cozy coffee shop on a rainy day with warm lighting',
      'A space station orbiting Earth with stars in the background',
      'A vintage car driving through a desert at golden hour',
      'A peaceful mountain lake reflecting the sky',
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    onPromptChange(randomPrompt);
  }, [onPromptChange]);

  return (
    <>
      <View style={styles.promptContainer}>
        <TextInput
          style={[styles.promptInput, disabled && styles.promptInputDisabled]}
          placeholder="Describe the scene you want to see."
          placeholderTextColor="#6B6D85"
          value={prompt}
          onChangeText={onPromptChange}
          multiline
          textAlignVertical="top"
          editable={!disabled}
        />
        <Pressable
          style={[styles.surpriseButton, disabled && styles.surpriseButtonDisabled]}
          onPress={handleSurpriseMe}
          disabled={disabled}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
          <Ionicons name="sparkles" size={14} color={disabled ? '#6B6D85' : '#FFFFFF'} />
          <Text style={[styles.surpriseText, disabled && styles.surpriseTextDisabled]}>Surprise Me</Text>
        </Pressable>
      </View>

      <View style={styles.aspectRatioSection}>
        <Text style={styles.sectionTitle}>Aspect Ratio</Text>
        <View style={styles.aspectRatioRow}>
          {ASPECT_RATIOS.map((ratio) => {
            const isSelected = ratio.id === selectedAspectRatio;
            return (
              <Pressable
                key={ratio.id}
                onPress={() => onAspectRatioChange(ratio.id)}
                disabled={disabled}
                style={[
                  styles.aspectRatioButton,
                  isSelected && styles.aspectRatioButtonActive,
                  disabled && styles.aspectRatioButtonDisabled,
                ]}
                android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}>
                <Text
                  style={[
                    styles.aspectRatioLabel,
                    isSelected && styles.aspectRatioLabelActive,
                    disabled && styles.aspectRatioLabelDisabled,
                  ]}>
                  {ratio.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  promptContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  promptInput: {
    width: '100%',
    minHeight: 150,
    borderRadius: 16,
    backgroundColor: '#181523',
    padding: 14,
    paddingRight: 100,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: '#252233',
  },
  surpriseButton: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#252233',
  },
  surpriseText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  aspectRatioSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  aspectRatioRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  aspectRatioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#181523',
    borderWidth: 1.5,
    borderColor: '#252233',
    minWidth: 56,
    alignItems: 'center',
  },
  aspectRatioButtonActive: {
    borderColor: '#FFFFFF',
    backgroundColor: '#252233',
  },
  aspectRatioLabel: {
    color: '#6B6D85',
    fontSize: 12,
    fontWeight: '600',
  },
  aspectRatioLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  promptInputDisabled: {
    opacity: 0.5,
  },
  surpriseButtonDisabled: {
    opacity: 0.5,
  },
  surpriseTextDisabled: {
    color: '#6B6D85',
  },
  aspectRatioButtonDisabled: {
    opacity: 0.5,
  },
  aspectRatioLabelDisabled: {
    color: '#6B6D85',
  },
});

