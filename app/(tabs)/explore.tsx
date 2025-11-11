import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MODE_OPTIONS = [
  { id: 'image-to-video', label: 'Image to Video' },
  { id: 'text-to-video', label: 'Text to Video' },
  { id: 'frames', label: 'Frames' },
] as const;

type ModeOptionId = (typeof MODE_OPTIONS)[number]['id'];

export default function ExploreScreen() {
  const [activeMode, setActiveMode] = useState<ModeOptionId>('image-to-video');

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
                    colors={["#7135FF", "#A642FF"]}
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

        <Pressable style={styles.uploadCard}>
          <Ionicons name="cloud-upload-outline" size={32} color="#7C5DFF" />
          <Text style={styles.uploadText}>Tap here to upload your image</Text>
          <View style={styles.dashedBorder} />
        </Pressable>

        <View style={styles.promptCard}>
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
        </Pressable>

        <Pressable style={styles.generateButton}>
          <LinearGradient
            colors={["#7135FF", "#5B5BFF"]}
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
    borderRadius: 26,
    backgroundColor: '#14111F',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    position: 'relative',
    overflow: 'hidden',
    gap: 12,
  },
  dashedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#7135FF',
    borderStyle: 'dashed',
  },
  uploadText: {
    color: '#C9CAD8',
    fontSize: 15,
    fontWeight: '600',
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
