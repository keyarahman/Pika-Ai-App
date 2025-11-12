import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: windowHeight } = Dimensions.get('window');

export default function CollectionItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    image?: string;
    prompt?: string;
  }>();
  const [isModalVisible, setModalVisible] = useState(false);

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
        <Pressable style={styles.iconButton}>
          <Ionicons name="ellipsis-vertical" size={22} color="#FFFFFF" />
        </Pressable>
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
            <Text style={styles.primaryButtonText}>Try Now</Text>
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
            <Text style={styles.modalTitle}>Pick Me</Text>
            <View style={styles.modalOptions}>
              <Pressable style={styles.modalOption}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.modalOptionText}>Use Camera</Text>
              </Pressable>
              <Pressable style={styles.modalOption}>
                <Ionicons name="image" size={20} color="#FFFFFF" />
                <Text style={styles.modalOptionText}>Upload from album</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
});

