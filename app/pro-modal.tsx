import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRO_PLANS } from './(tabs)/index';

export default function ProModalScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] =
    useState<(typeof PRO_PLANS)[number]['id']>('yearly');
  const plans = useMemo(() => PRO_PLANS, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1508184964240-ee54a02bb736?auto=format&fit=crop&w=1200&q=80',
        }}
        style={styles.heroImage}
      />
      <LinearGradient
        colors={['rgba(8,7,12,0)', 'rgba(8,7,12,0.92)']}
        style={styles.heroGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color="#0F0D16" />
          </Pressable>

          <Pressable hitSlop={10}>
            <Text style={styles.restoreText}>Restore</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.sheet}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Get Pika Labs Pro</Text>

          <View style={styles.benefits}>
            {['Access All AI Effects', 'Unlimited AI Videos', 'Unlimited AI Images', 'Remove Ads'].map(
              (benefit) => (
                <View style={styles.benefitRow} key={benefit}>
                  <Ionicons name="checkmark-circle" size={20} color="#EA6198" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              )
            )}
          </View>

          <View style={styles.planStack}>
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <Pressable
                  key={plan.id}
                  style={[styles.planCard, isSelected && styles.planCardSelected]}
                  onPress={() => setSelectedPlan(plan.id)}>
                  <View style={styles.planRow}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.planCopy}>
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      {plan.helper && plan.id !== 'yearly' && (
                        <Text style={styles.planHelper}>{plan.helper}</Text>
                      )}
                    </View>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                  </View>
                  {plan.id === 'yearly' && (
                    <View style={styles.yearlyRow}>
                      <Text style={styles.planHelper}>{plan.helper}</Text>
                      {plan.badge && (
                        <LinearGradient
                          colors={['#EA6198', '#5B5BFF']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.planBadge}>
                          <Text style={styles.planBadgeText}>{plan.badge}</Text>
                        </LinearGradient>
                      )}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.primaryButton}>
            <LinearGradient
              colors={['#EA6198', '#5B5BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>

          <View style={styles.legalRow}>
            <Pressable>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </Pressable>
            <Pressable>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Pressable>
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
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: '#C8D2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreText: {
    color: '#EA6198',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sheet: {
    marginTop: 'auto',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 26,
    backgroundColor: 'rgba(10, 9, 16, 0.94)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  benefits: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    color: '#F1EEFF',
    fontSize: 16,
    fontWeight: '500',
  },
  planStack: {
    gap: 14,
  },
  planCard: {
    borderRadius: 28,
    backgroundColor: '#16132A',
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planCardSelected: {
    borderColor: '#EA6198',
    shadowColor: '#EA6198',
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#5B5BFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#EA6198',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#EA6198',
  },
  planCopy: {
    flex: 1,
    gap: 4,
  },
  planLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  planHelper: {
    color: '#B7B5D2',
    fontSize: 13,
    fontWeight: '600',
  },
  planPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  yearlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryButton: {
    height: 54,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legalLink: {
    color: '#EA6198',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

