import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Share } from 'react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRO_PLANS } from './(tabs)/index';

export default function SettingsModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleUpgrade = () => {
    router.replace('/pro-modal');
  };

  const handlePrivacyPolicy = async () => {
    await Linking.openURL('https://www.appleov.com/privacy-policy');
  };

  const handleTerms = async () => {
    await Linking.openURL('https://www.appleov.com/terms-and-conditions');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          'Create stunning AI videos with Pika Labs. Download now: https://pika.art/app',
      });
    } catch (error) {
      // no-op
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <LinearGradient
        colors={['rgba(10,9,18,0.3)', 'rgba(10,9,18,0.92)']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#0F0D16" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.sheet}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Account</Text>

            <Pressable style={styles.row} onPress={handleUpgrade}>
              <View style={styles.rowIcon}>
                <LinearGradient
                  colors={['#EA6198', '#5B5BFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons name="sparkles" size={18} color="#fff" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Upgrade to Pro</Text>
                <Text style={styles.rowSubtitle}>
                  {PRO_PLANS[PRO_PLANS.length - 1].price} • {PRO_PLANS[PRO_PLANS.length - 1].helper}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#77759A" />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>General</Text>

            <Pressable style={styles.row} onPress={handleShare}>
              <View style={styles.rowIconMuted}>
                <Ionicons name="share-social-outline" size={18} color="#AEA9DA" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Share App</Text>
                <Text style={styles.rowSubtitle}>Invite friends to Pika Labs</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#77759A" />
            </Pressable>

            <Pressable style={styles.row} onPress={handlePrivacyPolicy}>
              <View style={styles.rowIconMuted}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#AEA9DA" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#77759A" />
            </Pressable>

            <Pressable style={styles.row} onPress={handleTerms}>
              <View style={styles.rowIconMuted}>
                <Ionicons name="document-text-outline" size={18} color="#AEA9DA" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#77759A" />
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Support</Text>

            <Pressable
              style={styles.row}
              onPress={() => {
                // Open mail app directly - will work on real devices with mail configured
                Linking.openURL('mailto:support@appleov.com?subject=Support Request').catch(() => {
                  // Silently handle error - mail app might not be available on simulator
                });
              }}>
              <View style={styles.rowIconMuted}>
                <Ionicons name="chatbox-ellipses-outline" size={18} color="#AEA9DA" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Contact Support</Text>
                <Text style={styles.rowSubtitle}>support@appleov.com</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#77759A" />
            </Pressable>
          </View>

          {/* App Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>
              Version {Constants.expoConfig?.version || '1.0.0'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08070B',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#C8D2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  section: {
    gap: 14,
  },
  sectionLabel: {
    color: '#B7B5D2',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 15, 28, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rowIcon: {
    height: 42,
    width: 42,
    borderRadius: 21,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconMuted: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(174, 169, 218, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: '#ABA6CB',
    fontSize: 13,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  versionText: {
    color: '#77759A',
    fontSize: 12,
    fontWeight: '500',
  },
});

