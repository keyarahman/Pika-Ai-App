import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Get first 3 viral items for carousel
  const carouselItems = useMemo(() => VIRAL_ITEMS.slice(0, 3), []);

  // Initialize RevenueCat and fetch offerings
  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        setIsLoading(true);
        await initializeRevenueCat();
        const offering = await getCurrentOffering();
        if (offering && offering.availablePackages.length > 0) {
          const availablePackages = offering.availablePackages;
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
            pkg.identifier.includes('weekly') || 
            pkg.identifier.includes('week')
          );
          
          setSelectedPlan(yearlyPackage?.identifier || weeklyPackage?.identifier || availablePackages[0].identifier);
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
  }, []);

  const handleClose = () => {
    // Check if we can go back, if not navigate to tabs (handles first-time app launch)
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleCarouselScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCarouselIndex(index);
  }, []);

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
      const customerInfo = await purchasePackage(selectedPackage);
      
      // Check if purchase was successful
      if (customerInfo.entitlements.active['pro']) {
        Alert.alert('Success', 'Subscription activated successfully!', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
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
      
      if (customerInfo.entitlements.active['pro']) {
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

  // Format price for display
  const formatPrice = (packageItem: PurchasesPackage): string => {
    const product = packageItem.product;
    const price = product.priceString;
    
    // RevenueCat's priceString already includes currency formatting
    // We can add period suffix if needed, but priceString is usually sufficient
    // For better UX, we'll try to detect period from identifier
    const identifier = packageItem.identifier.toLowerCase();
    
    if (identifier === '$rc_annual' || identifier === 'negarsapp.pikaapp.yearly' || identifier.includes('yearly') || identifier.includes('annual')) {
      // Check if price already includes period info
      if (!price.toLowerCase().includes('year') && !price.toLowerCase().includes('yr')) {
        return `${price}/yr`;
      }
    } else if (identifier === '$rc_weekly' || identifier === 'negarsapp.pikaapp.pro.weekly' || identifier.includes('weekly') || identifier.includes('week')) {
      if (!price.toLowerCase().includes('week') && !price.toLowerCase().includes('wk')) {
        return `${price}/wk`;
      }
    } else if (identifier.includes('monthly') || identifier.includes('month')) {
      if (!price.toLowerCase().includes('month') && !price.toLowerCase().includes('mo')) {
        return `${price}/mo`;
      }
    }
    
    return price;
  };

  // Get plan label from package identifier
  const getPlanLabel = (packageItem: PurchasesPackage): string => {
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
  };

  // Get helper text for plan
  const getPlanHelper = (packageItem: PurchasesPackage): string | undefined => {
    const identifier = packageItem.identifier.toLowerCase();
    
    // Show helper text for yearly plan
    if (identifier === '$rc_annual' || identifier === 'negarsapp.pikaapp.yearly' || identifier.includes('yearly') || identifier.includes('annual')) {
      const price = packageItem.product.priceString;
      // Only add /yr if not already in price string
      if (!price.toLowerCase().includes('year') && !price.toLowerCase().includes('yr')) {
        return `Just ${price}/yr`;
      }
      return `Just ${price}`;
    }
    
    return undefined;
  };

  // Check if plan has badge
  const hasBadge = (packageItem: PurchasesPackage): boolean => {
    const identifier = packageItem.identifier.toLowerCase();
    // Yearly plan gets "BEST VALUE" badge
    return identifier === '$rc_annual' || identifier === 'negarsapp.pikaapp.yearly' || identifier.includes('yearly') || identifier.includes('annual');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent animated={false} />

      {/* Layer 1: Background - Two Flex Parts (Top/Bottom) */}
      <View style={styles.backgroundLayer}>
        {/* Top Part: GIF Image with Blur */}
        <View style={styles.topBackground}>
          {carouselItems.length > 0 && (
            <>
              <Image
                source={{ uri: carouselItems[0].image }}
                style={styles.backgroundImage}
                contentFit="cover"
              />
             
            </>
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

        {/* Benefits List - Top */}
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

        {/* Plans and Buttons - Bottom */}
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#EA6198" />
              <Text style={styles.loadingText}>Loading subscription plans...</Text>
            </View>
          ) : packages.length > 0 ? (
            <>
              {/* Plan Cards */}
              <View style={styles.plansContainer}>
                {packages.map((packageItem) => {
                  const isSelected = selectedPlan === packageItem.identifier;
                  const helperText = getPlanHelper(packageItem);
                  const badgeLabel = hasBadge(packageItem) ? "BEST VALUE" : undefined;

                  return (
                    <View key={packageItem.identifier} style={styles.planWrapper}>
                      {badgeLabel && isSelected && (
                        <View style={styles.bestValueBadge}>
                          <Text style={styles.bestValueText}>{badgeLabel}</Text>
                        </View>
                      )}
                      <Pressable
                        style={[
                          styles.planCard,
                          isSelected && styles.planCardSelected,
                        ]}
                        onPress={() => setSelectedPlan(packageItem.identifier)}
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
                                  <Text style={styles.planLabel}>{getPlanLabel(packageItem)}</Text>
                                  {helperText && (
                                    <Text style={styles.planHelper}>
                                      {helperText}
                                    </Text>
                                  )}
                                </View>
                              </View>
                              <Text style={styles.planPrice}>{formatPrice(packageItem)}</Text>
                            </View>
                          </LinearGradient>
                        ) : (
                          <View style={styles.planCardContent}>
                            <View style={styles.planLeft}>
                              <View style={styles.radioButton}>
                                {isSelected && <View style={styles.radioInner} />}
                              </View>
                              <View style={styles.planTextContainer}>
                                <Text style={styles.planLabel}>{getPlanLabel(packageItem)}</Text>
                                {helperText && (
                                  <Text style={styles.planHelper}>
                                    {helperText}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <Text style={styles.planPrice}>{formatPrice(packageItem)}</Text>
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
              <Pressable
                style={[styles.continueButton, (isPurchasing || !selectedPlan) && styles.continueButtonDisabled]}
                onPress={handlePurchase}
                disabled={isPurchasing || !selectedPlan}
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
                <Pressable>
                  <Text style={styles.footerLink}>PRIVACY POLICY</Text>
                </Pressable>
                <Text style={styles.footerSeparator}>•</Text>
                <Pressable>
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
  },
  bottomBackground: {
    flex: 1,
    backgroundColor: "#000",
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
  benefitsContainer: {
    paddingHorizontal: 20,
    paddingTop: 150,
    paddingBottom: 20,
    gap: 12,
    zIndex: 12,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    left: 12,
    zIndex: 1,
  },
  bestValueText: {
    backgroundColor: "#2196F3",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planCard: {
    borderRadius: 50,
    overflow: "hidden",
  },
  planCardGradient: {
    borderRadius: 50,
    padding: 2,
  },
  planCardSelected: {
    backgroundColor: "rgba(234, 97, 152, 0.95)",
    borderColor: "#EA6198",
    borderWidth: 2,
  },
  planCardContent: {
    backgroundColor: "rgba(60, 60, 60, 0.95)",
    borderRadius: 14,
    padding: 16,
    minHeight: 80,
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
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "500",
  },
  planPrice: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
  },
  billingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    textAlign: "center",
    marginVertical: 5,
  },
  continueButton: {
    height: 60,
    borderRadius: 50,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    marginTop:25
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
