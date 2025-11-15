import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRO_PLANS } from './(tabs)/index';

export default function ProModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] =
    useState<(typeof PRO_PLANS)[number]['id']>('yearly');
  const plans = useMemo(() => PRO_PLANS, []);
  const heroUri =
    'https://images.unsplash.com/photo-1508184964240-ee54a02bb736?auto=format&fit=crop&w=1200&q=80';

  const handleClose = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />
      <Image source={{ uri: heroUri }} style={styles.heroImage} />
      <LinearGradient
        colors={['rgba(8,7,12,0)', 'rgba(8,7,12,0.92)']}
        style={styles.heroGradient}
      />

      <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={20} color="#0F0D16" />
          </Pressable>

          <Pressable hitSlop={10}>
            <Text style={styles.restoreText}>Restore</Text>
          </Pressable>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.blurCard}>
            <Image
              source={{ uri: heroUri }}
              style={styles.blurCardBackground}
              blurRadius={40}
            />
            <View style={styles.blurCardOverlay} />
            <ScrollView
              contentContainerStyle={styles.cardContent}
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
                  const helperText = 'helper' in plan ? plan.helper : undefined;
                  const badgeLabel = 'badge' in plan ? plan.badge : undefined;
                  const badge =
                    badgeLabel &&
                    (isSelected ? (
                      <LinearGradient
                        colors={['#EA6198', '#5B5BFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{badgeLabel}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.planBadgeMuted}>
                        <Text style={styles.planBadgeText}>{badgeLabel}</Text>
                      </View>
                    ));

                  const inner = (
                    <View
                      style={[
                        styles.planCardInner,
                        isSelected ? styles.planCardInnerSelected : styles.planCardInnerDefault,
                      ]}>
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
                          {helperText && plan.id !== 'yearly' && (
                            <Text style={styles.planHelper}>{helperText}</Text>
                          )}
                        </View>
                        <Text style={styles.planPrice}>{plan.price}</Text>
                      </View>
                      {plan.id === 'yearly' && (
                        <View style={styles.yearlyRow}>
                          {helperText && (
                            <Text style={styles.planHelper}>{helperText}</Text>
                          )}
                          {badge}
                        </View>
                      )}
                    </View>
                  );

                  return (
                    <Pressable
                      key={plan.id}
                      style={styles.planCardPressable}
                      onPress={() => setSelectedPlan(plan.id)}>
                      {isSelected ? (
                        <LinearGradient
                          colors={['#EA6198', '#5B5BFF']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.planCardGradient}>
                          {inner}
                        </LinearGradient>
                      ) : (
                        inner
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
          </View>
        </View>
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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,marginTop:10
  },
  blurCard: {
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 6, 15, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  blurCardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  blurCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11, 9, 18, 0.7)',
  },
  cardContent: {
    paddingHorizontal: 28,
    paddingVertical: 34,
    gap: 26,
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
    gap: 18,
  },
  planCardPressable: {
    borderRadius: 32,
  },
  planCardGradient: {
    borderRadius: 32,
    padding: 2,
  },
  planCardInner: {
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 22,
    gap: 14,
  },
  planCardInnerDefault: {
    backgroundColor: 'rgba(15, 12, 24, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planCardInnerSelected: {
    backgroundColor: 'rgba(6, 4, 12, 0.92)',
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
    borderColor: 'rgba(255,255,255,0.18)',
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
  planBadgeMuted: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
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

