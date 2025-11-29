import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert, Animated, Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { useSubscription } from "@/hooks/use-subscription";
import {
  getCurrentOffering,
  initializeRevenueCat,
  purchasePackage,
  restorePurchases,
} from "@/utils/revenuecat";
import { VIRAL_ITEMS } from "./(tabs)/index";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BENEFITS = [
  {
    icon: "happy-outline",
    iconColor: "#FFD700",
    text: "Access All All Efects",
  },
  {
    icon: "image-outline",
    iconColor: "#4CAF50",
    text: "Unlimited AI Visual Creations",
  },
  {
    icon: "videocam-outline",
    iconColor: "#FF5722",
    text: "Generate Viral Videos with AI",
  },
  // { icon: 'flame-outline', iconColor: '#FF1744', text: '1000+ Exclusive Content' },
  {
    icon: "close-circle-outline",
    iconColor: "#F44336",
    text: "No Ads & Watermarks",
  },
];

export default function ProModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const carouselScrollRef = useRef<ScrollView>(null);
  const videoRefs = useRef<{ [key: string]: Video | null }>({});
  const { isSubscribed, currentPlanIdentifier, refreshSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const shineAnim = useRef(new Animated.Value(0)).current;
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFetchedOfferingsRef = useRef(false);
  const hasRefreshedOnFocusRef = useRef(false);

  // Get more viral items for carousel (6 items for better variety)
  const carouselItems = useMemo(() => VIRAL_ITEMS.slice(0, 6), []);

  // Animate shine effect
  useEffect(() => {
    const shineAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    shineAnimation.start();
    return () => shineAnimation.stop();
  }, [shineAnim]);

  // Auto-scroll carousel
  useEffect(() => {
    if (carouselItems.length === 0) return;

    const scrollToNext = () => {
      setCarouselIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % carouselItems.length;
        carouselScrollRef.current?.scrollTo({
          x: nextIndex * SCREEN_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    };

    // Auto-scroll every 3 seconds
    autoScrollTimerRef.current = setInterval(scrollToNext, 3000);

    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [carouselItems.length]);

  // Handle manual scroll
  const handleCarouselScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCarouselIndex(index);
  }, []);

  // Fetch offerings only once on mount
  useEffect(() => {
    if (hasFetchedOfferingsRef.current) return;

    const fetchOfferings = async () => {
      try {
        setIsLoading(true);
        await initializeRevenueCat();
        const offering = await getCurrentOffering();
        if (offering && offering.availablePackages.length > 0) {
          const availablePackages = offering.availablePackages;

          // Debug: Log all packages to see what we're getting
          console.log('Available packages:', availablePackages.map(pkg => ({
            identifier: pkg.identifier,
            productId: pkg.product.identifier,
            price: pkg.product.priceString,
            priceValue: pkg.product.price,
            currency: pkg.product.currencyCode,
          })));

          setPackages(availablePackages);

          // Set default selected plan to yearly if available, otherwise weekly
          const yearlyPackage = availablePackages.find(pkg =>
            pkg.identifier === '$rc_annual' ||
            pkg.identifier === 'negarsapp.pikaapp.yearly' ||
            pkg.identifier.includes('yearly') ||
            pkg.identifier.includes('annual')
          );
          const weeklyPackage = availablePackages.find(pkg =>
            pkg.identifier === '$rc_weekly' ||
            pkg.identifier === 'negarsapp.pikaapp.pro.weekly' ||
            pkg.product.identifier === 'negarsapp.pikaapp.pro.weekly' ||
            pkg.identifier.includes('weekly') ||
            pkg.identifier.includes('week')
          );

          // Debug: Log which weekly package was found
          if (weeklyPackage) {
            console.log('Weekly package found:', {
              identifier: weeklyPackage.identifier,
              productId: weeklyPackage.product.identifier,
              price: weeklyPackage.product.priceString,
              priceValue: weeklyPackage.product.price,
            });
          } else {
            console.warn('Weekly package not found! Available identifiers:', availablePackages.map(p => p.identifier));
          }

          // If user is subscribed, select their current plan, otherwise default to yearly
          if (isSubscribed && currentPlanIdentifier) {
            // Try to match current plan identifier with available packages
            const currentPackage = availablePackages.find(pkg =>
              pkg.identifier === currentPlanIdentifier ||
              pkg.product.identifier === currentPlanIdentifier
            );
            setSelectedPlan(currentPackage?.identifier || yearlyPackage?.identifier || weeklyPackage?.identifier || availablePackages[0].identifier);
          } else {
            setSelectedPlan(yearlyPackage?.identifier || weeklyPackage?.identifier || availablePackages[0].identifier);
          }

          hasFetchedOfferingsRef.current = true;
        } else {
          // Fallback to hardcoded plans if no offerings available
          console.warn('No RevenueCat offerings available, using fallback plans');
        }
      } catch (error) {
        console.error('Error fetching offerings:', error);
        Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfferings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update selected plan when subscription state changes (without refetching offerings)
  useEffect(() => {
    if (!hasFetchedOfferingsRef.current || packages.length === 0) return;

    // Update selected plan based on current subscription
    if (isSubscribed && currentPlanIdentifier) {
      const currentPackage = packages.find(pkg =>
        pkg.identifier === currentPlanIdentifier ||
        pkg.product.identifier === currentPlanIdentifier
      );
      if (currentPackage) {
        setSelectedPlan(currentPackage.identifier);
      }
    }
  }, [isSubscribed, currentPlanIdentifier, packages]);

  // Refresh subscription when modal becomes visible/focused (only once per focus)
  useFocusEffect(
    useCallback(() => {
      // Only refresh once when modal is focused to prevent loops
      if (!hasRefreshedOnFocusRef.current) {
        hasRefreshedOnFocusRef.current = true;
        refreshSubscription();
      }

      // Reset flag when modal loses focus
      return () => {
        hasRefreshedOnFocusRef.current = false;
      };
    }, [refreshSubscription])
  );

  const handleClose = () => {
    // Check if we can go back, if not navigate to tabs (handles first-time app launch)
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    const selectedPackage = packages.find(pkg => pkg.identifier === selectedPlan);
    if (!selectedPackage) {
      Alert.alert('Error', 'Selected plan not found');
      return;
    }

    try {
      setIsPurchasing(true);
      console.log('Purchasing package:', {
        identifier: selectedPackage.identifier,
        productId: selectedPackage.product.identifier,
        price: selectedPackage.product.priceString,
      });

      const customerInfo = await purchasePackage(selectedPackage);

      // Check for active entitlement - try 'Appleov Pro' first, then fallback to 'pro' or activeSubscriptions
      const activeEntitlement = customerInfo.entitlements.active['Appleov Pro'] || customerInfo.entitlements.active['pro'];
      const hasActiveSubscription = activeEntitlement?.isActive ||
        (customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0);

      console.log('Purchase completed, customer info:', {
        hasPro: hasActiveSubscription,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        activeSubscriptions: customerInfo.activeSubscriptions,
      });

      // Check if purchase was successful
      if (hasActiveSubscription) {
        // Refresh subscription status immediately
        await refreshSubscription();

        // Show success alert
        Alert.alert(
          'Success! 🎉',
          'Your subscription has been activated successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Close modal after successful purchase
                router.back();
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert('Success', 'Purchase completed successfully!');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);

      // Don't show alert for user cancellation
      if (error?.userCancelled === true || error?.message?.includes('cancelled')) {
        return;
      }

      const errorMessage = error?.message || 'Failed to complete purchase. Please try again.';
      Alert.alert('Purchase Failed', errorMessage);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setIsRestoring(true);
      const customerInfo = await restorePurchases();

      // Check for active entitlement - try 'Appleov Pro' first, then fallback to 'pro' or activeSubscriptions
      const activeEntitlement = customerInfo.entitlements.active['Appleov Pro'] || customerInfo.entitlements.active['pro'];
      const hasActiveSubscription = activeEntitlement?.isActive ||
        (customerInfo.activeSubscriptions && customerInfo.activeSubscriptions.length > 0);

      if (hasActiveSubscription) {
        // Refresh subscription status
        await refreshSubscription();
        Alert.alert('Success', 'Purchases restored successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert('No Purchases', 'No active subscriptions found to restore.');
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Format price for display - shows the ACTUAL BILLED AMOUNT (most prominent)
  const formatPrice = useCallback((packageItem: PurchasesPackage): string => {
    const product = packageItem.product;
    const price = product.priceString; // This comes directly from App Store, should be correct
    const identifier = packageItem.identifier.toLowerCase();
    const productId = product.identifier.toLowerCase();

    // For yearly plans, show the ACTUAL YEARLY PRICE (billed amount)
    if (identifier === '$rc_annual' || identifier === 'negarsapp.pikaapp.yearly' ||
      identifier.includes('yearly') || identifier.includes('annual') ||
      productId.includes('yearly') || productId.includes('annual')) {
      // Return the actual billed amount (yearly price)
      // priceString should already have currency symbol, just add /yr if not present
      if (!price.toLowerCase().includes('year') && !price.toLowerCase().includes('yr')) {
        return `${price}/yr`;
      }
      return price;
    } else if (identifier === '$rc_weekly' || identifier === 'negarsapp.pikaapp.pro.weekly' ||
      identifier.includes('weekly') || identifier.includes('week') ||
      productId.includes('weekly') || productId.includes('week')) {
      // For weekly plans, use the priceString directly (it should already be formatted correctly)
      // Don't add /wk if it's already in the price string
      if (!price.toLowerCase().includes('week') && !price.toLowerCase().includes('wk')) {
        return `${price}/wk`;
      }
      return price;
    } else if (identifier.includes('monthly') || identifier.includes('month') ||
      productId.includes('monthly') || productId.includes('month')) {
      if (!price.toLowerCase().includes('month') && !price.toLowerCase().includes('mo')) {
        return `${price}/mo`;
      }
    }

    return price;
  }, []);

  // Get weekly calculated price as helper text (subordinate, smaller)
  const getWeeklyCalculatedPrice = useCallback((packageItem: PurchasesPackage): string | null => {
    const identifier = packageItem.identifier.toLowerCase();

    // Only show weekly calculated price for yearly plans
    if (identifier === '$rc_annual' || identifier === 'negarsapp.pikaapp.yearly' || identifier.includes('yearly') || identifier.includes('annual')) {
      try {
        const product = packageItem.product;
        const numericPrice = product.price;
        const currencyCode = product.currencyCode || 'USD';
        const currencySymbol = getCurrencySymbol(currencyCode);

        // Calculate weekly price (annual / 52 weeks)
        const weeklyPrice = numericPrice / 52;
        const formattedWeeklyPrice = weeklyPrice.toFixed(2);

        return `${currencySymbol}${formattedWeeklyPrice}/wk`;
      } catch (error) {
        return null;
      }
    }

    return null;
  }, []);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      CHF: 'CHF',
      CNY: '¥',
      INR: '₹',
    };
    return symbols[currencyCode] || '$';
  };

  // Get plan label from package identifier
  const getPlanLabel = useCallback((packageItem: PurchasesPackage): string => {
    const identifier = packageItem.identifier.toLowerCase();

    // Handle specific identifiers
    if (identifier === '$rc_annual' || identifier === 'negarsapp.pikaapp.yearly' || identifier.includes('yearly') || identifier.includes('annual')) {
      return 'Yearly';
    } else if (identifier === '$rc_weekly' || identifier === 'negarsapp.pikaapp.pro.weekly' || identifier.includes('weekly') || identifier.includes('week')) {
      return 'Weekly';
    } else if (identifier.includes('monthly') || identifier.includes('month')) {
      return 'Monthly';
    }

    // Default: use package type
    return packageItem.packageType.charAt(0).toUpperCase() + packageItem.packageType.slice(1);
  }, []);

  // Check if plan has badge
  const hasBadge = useCallback((packageItem: PurchasesPackage): boolean => {
    const identifier = packageItem.identifier.toLowerCase();
    // Yearly plan gets "BEST VALUE" badge
    return identifier === '$rc_annual' || identifier === 'negarsapp.pikaapp.yearly' || identifier.includes('yearly') || identifier.includes('annual');
  }, []);

  // Memoize formatted prices and other computed values for each package
  const packageData = useMemo(() => {
    return packages.map((packageItem) => ({
      packageItem,
      formattedPrice: formatPrice(packageItem),
      weeklyCalculatedPrice: getWeeklyCalculatedPrice(packageItem),
      planLabel: getPlanLabel(packageItem),
      badgeLabel: hasBadge(packageItem) ? "BEST VALUE" : undefined,
    }));
  }, [packages, formatPrice, getWeeklyCalculatedPrice, getPlanLabel, hasBadge]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent animated={false} />

      {/* Layer 1: Background - Two Flex Parts (Top/Bottom) */}
      <View style={styles.backgroundLayer}>
        {/* Top Part: Auto-scrolling GIF Carousel */}
        <View style={styles.topBackground}>
          {carouselItems.length > 0 && (
            <ScrollView
              ref={carouselScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleCarouselScroll}
              style={styles.carouselScrollView}
              contentContainerStyle={styles.carouselContent}>
              {carouselItems.map((item, index) => (
                <View key={item.id} style={[styles.carouselItem, { width: SCREEN_WIDTH }]}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.backgroundImage}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={200}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Bottom Part: Black Background */}
        <View style={styles.bottomBackground} />
      </View>

      {/* Layer 2: Black-to-transparent Gradient Overlay (Bottom to Top) */}
      <LinearGradient
        colors={["transparent", "rgba(4, 4, 4, 0.98)", "transparent"]}
        locations={[0, 0.5, 1]}
        style={styles.gradientOverlay}
      />

      {/* Layer 3: Content Layer */}
      <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Plans and Buttons - Bottom */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.proTitle}>Get Pika Lab Pro</Text>

          {/* Benefits List - Above Plans */}
          <View style={styles.benefitsContainer}>
            {BENEFITS.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.benefitIconContainer}>
                  <LinearGradient
                    colors={["#EA6198", "#7135FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.benefitIconGradient}
                  >
                    <Ionicons name="checkmark" size={15} color="#FFFFFF" />
                  </LinearGradient>
                </View>
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EA6198" />
              <Text style={styles.loadingText}>Loading subscription plans...</Text>
            </View>
          ) : packages.length > 0 ? (
            <>
              {/* Plan Cards */}
              <View style={styles.plansContainer}>
                {packageData.map(({ packageItem, formattedPrice, weeklyCalculatedPrice, planLabel, badgeLabel }) => {
                  const isSelected = selectedPlan === packageItem.identifier;

                  // Check if this is the current plan by matching both identifier and product identifier
                  const isCurrentPlan = isSubscribed && currentPlanIdentifier && (
                    packageItem.identifier === currentPlanIdentifier ||
                    packageItem.product.identifier === currentPlanIdentifier
                  );

                  // If user has a current plan, disable selection of that plan
                  const isDisabled = isCurrentPlan;

                  return (
                    <View key={packageItem.identifier} style={styles.planWrapper}>
                      {badgeLabel && (
                        <View style={styles.bestValueBadge}>
                          <LinearGradient
                            colors={["#4A90E2", "#357ABD", "#2196F3"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.bestValueGradient}
                          >
                            <Animated.View
                              style={[
                                styles.bestValueShine,
                                {
                                  transform: [
                                    {
                                      translateX: shineAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-50, 100],
                                      }),
                                    },
                                  ],
                                },
                              ]}
                            />
                            <Text style={styles.bestValueText}>{badgeLabel}</Text>
                          </LinearGradient>
                        </View>
                      )}
                      <Pressable
                        style={[
                          styles.planCard,
                          isSelected && styles.planCardSelected,
                        ]}
                        onPress={() => {
                          if (!isDisabled) {
                            setSelectedPlan(packageItem.identifier);
                          }
                        }}
                        disabled={!!isDisabled}
                      >
                        {isSelected ? (
                          <LinearGradient
                            colors={["#EA6198", "#7135FF"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.planCardGradient}
                          >
                            <View style={styles.planCardContent}>
                              <View style={styles.planLeft}>
                                <View style={styles.radioButtonSelected}>
                                  <View style={styles.radioInner} />
                                </View>
                                <View style={styles.planTextContainer}>
                                  <Text style={styles.planLabel}>{planLabel}</Text>
                                  {weeklyCalculatedPrice && (
                                    <Text style={styles.planHelper}>
                                      {weeklyCalculatedPrice}
                                    </Text>
                                  )}
                                </View>
                              </View>
                              <View style={styles.planRight}>
                                {isCurrentPlan && (
                                  <Text style={styles.currentPlanBadge}>Current</Text>
                                )}
                                <View style={styles.priceContainer}>
                                  <Text style={styles.planPrice}>{formattedPrice}</Text>
                                </View>
                              </View>
                              {isCurrentPlan && (
                                <View style={styles.currentPlanOverlay}>
                                  <Text style={styles.currentPlanText}>Active Plan</Text>
                                </View>
                              )}
                            </View>
                          </LinearGradient>
                        ) : (
                          <View style={styles.planCardContent}>
                            <View style={styles.planLeft}>
                              <View style={styles.radioButton}>
                                {isSelected && <View style={styles.radioInner} />}
                              </View>
                              <View style={styles.planTextContainer}>
                                <Text style={styles.planLabel}>{planLabel}</Text>
                                {weeklyCalculatedPrice && (
                                  <Text style={styles.planHelper}>
                                    {weeklyCalculatedPrice}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <View style={styles.planRight}>
                              {isCurrentPlan && (
                                <Text style={styles.currentPlanBadge}>Current</Text>
                              )}
                              <View style={styles.priceContainer}>
                                <Text style={styles.planPrice}>{formattedPrice}</Text>
                              </View>
                            </View>
                            {isCurrentPlan && (
                              <View style={styles.currentPlanOverlay}>
                                <Text style={styles.currentPlanText}>Active Plan</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No subscription plans available</Text>
              <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
            </View>
          )}

          {/* Billing Info */}
          {/* <Text style={styles.billingText}>Billed annually. Cancel anytime.</Text> */}

          {/* Continue Button */}
          {!isLoading && packages.length > 0 && (
            <>
              {(() => {
                const selectedPackage = packages.find(pkg => pkg.identifier === selectedPlan);
                const isSelectedPlanCurrent = isSubscribed && currentPlanIdentifier && selectedPackage && (
                  selectedPackage.identifier === currentPlanIdentifier ||
                  selectedPackage.product.identifier === currentPlanIdentifier
                );

                if (isSubscribed && isSelectedPlanCurrent) {
                  return (
                    <View style={styles.currentPlanMessage}>
                      <Text style={styles.currentPlanMessageText}>You are currently subscribed to this plan</Text>
                    </View>
                  );
                }

                return (
                  <Pressable
                    style={[styles.continueButton, (isPurchasing || !selectedPlan || isSelectedPlanCurrent) && styles.continueButtonDisabled]}
                    onPress={handlePurchase}
                    disabled={!!(isPurchasing || !selectedPlan || isSelectedPlanCurrent)}
                  >
                    <LinearGradient
                      colors={["#EA6198", "#7135FF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.continueButtonGradient}
                    />
                    {isPurchasing ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.continueButtonText}>Subscribe</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={20}
                          color="#FFFFFF"
                          style={styles.continueArrow}
                        />
                      </>
                    )}
                  </Pressable>
                );
              })()}

              {/* Footer Links */}
              <View style={styles.footerLinks}>
                <Pressable onPress={handleRestorePurchases} disabled={isRestoring}>
                  {isRestoring ? (
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                  ) : (
                    <Text style={styles.footerLink}>RESTORE PURCHASES</Text>
                  )}
                </Pressable>
                <Text style={styles.footerSeparator}>•</Text>
                <Pressable onPress={() => Linking.openURL('https://www.appleov.com/privacy-policy')}>
                  <Text style={styles.footerLink}>PRIVACY POLICY</Text>
                </Pressable>
                <Text style={styles.footerSeparator}>•</Text>
                <Pressable onPress={() => Linking.openURL('https://www.appleov.com/terms-and-conditions')}>
                  <Text style={styles.footerLink}>TERMS OF USE</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  // Layer 1: Background - Two Flex Parts (Top/Bottom)
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "column",
    zIndex: 1,
  },
  topBackground: {
    flex: 1,
    overflow: "hidden",
  },
  bottomBackground: {
    flex: 1,
    backgroundColor: "#000",
  },
  carouselScrollView: {
    flex: 1,
  },
  carouselContent: {
    flexDirection: "row",
  },
  carouselItem: {
    height: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  backgroundBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  // Layer 2: Black-to-transparent Gradient Overlay (Bottom to Top)
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  safeArea: {
    flex: 1,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 11,
  },
  closeButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Layer 3: Content Layer
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 50,
    zIndex: 12,
    justifyContent: "flex-end",
  },
  proTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  benefitsContainer: {
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
    zIndex: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  benefitIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  benefitIconGradient: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  benefitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  plansContainer: {
    flexDirection: "column",
    gap: 12,
    // marginBottom: 12,
  },
  planWrapper: {
    position: "relative",
    width: "100%",
  },
  bestValueBadge: {
    position: "absolute",
    top: -10,
    right: 12,
    zIndex: 1,
    shadowColor: "#2196F3",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  bestValueGradient: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: "hidden",
    position: "relative",
  },
  bestValueShine: {
    position: "absolute",
    top: 0,
    width: 40,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    transform: [{ skewX: "-20deg" }],
  },
  bestValueText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 1,
  },
  planCard: {
    borderRadius: 50,
    overflow: "hidden",
    position: "relative",
  },
  planCardGradient: {
    borderRadius: 50,
    padding: 1,
  },
  planCardSelected: {
    backgroundColor: "rgba(234, 97, 152, 0.95)",
    borderColor: "#EA6198",
    borderWidth: 1,
  },
  planCardContent: {
    backgroundColor: "rgba(60, 60, 60, 0.95)",
    borderRadius: 20,
    padding: 14,
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  planLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioButtonSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  planTextContainer: {
    flex: 1,
  },
  planLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  planHelper: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    fontWeight: "400",
    marginTop: 2,
  },
  planRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  planPrice: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
  },
  currentPlanBadge: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentPlanMessage: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  currentPlanMessageText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  currentPlanOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(76, 175, 80, 0.9)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  currentPlanText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  billingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    textAlign: "center",
    marginVertical: 5,
  },
  continueButton: {
    height: 55,
    borderRadius: 50,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop: 25
  },
  continueButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
  },
  continueArrow: {
    marginLeft: 4,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "nowrap",
  },
  footerLink: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footerSeparator: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  errorSubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
});
