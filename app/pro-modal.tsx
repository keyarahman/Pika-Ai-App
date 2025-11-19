import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { PRO_PLANS, VIRAL_ITEMS } from "./(tabs)/index";

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
  const [selectedPlan, setSelectedPlan] =
    useState<(typeof PRO_PLANS)[number]["id"]>("yearly");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const plans = useMemo(() => PRO_PLANS, []);

  // Get first 3 viral items for carousel
  const carouselItems = useMemo(() => VIRAL_ITEMS.slice(0, 3), []);

  const handleClose = () => {
    router.replace("/(tabs)");
  };

  const handleCarouselScroll = useCallback((event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCarouselIndex(index);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent />

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
              {/* Strong Gaussian Blur on Background */}
              <BlurView
                intensity={100}
                tint="dark"
                style={styles.backgroundBlur}
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
          {/* Plan Cards */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              const helperText = "helper" in plan ? plan.helper : undefined;
              const badgeLabel = "badge" in plan ? plan.badge : undefined;

              return (
                <View key={plan.id} style={styles.planWrapper}>
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
                    onPress={() => setSelectedPlan(plan.id)}
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
                              <Text style={styles.planLabel}>{plan.label}</Text>
                              {helperText && (
                                <Text style={styles.planHelper}>
                                  {helperText}
                                </Text>
                              )}
                            </View>
                          </View>
                          <Text style={styles.planPrice}>{plan.price}</Text>
                        </View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.planCardContent}>
                        <View style={styles.planLeft}>
                          <View style={styles.radioButton}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <View style={styles.planTextContainer}>
                            <Text style={styles.planLabel}>{plan.label}</Text>
                            {helperText && (
                              <Text style={styles.planHelper}>
                                {helperText}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text style={styles.planPrice}>{plan.price}</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>

          {/* Billing Info */}
          {/* <Text style={styles.billingText}>Billed annually. Cancel anytime.</Text> */}

          {/* Continue Button */}
          <Pressable style={styles.continueButton}>
            <LinearGradient
              colors={["#EA6198", "#7135FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButtonGradient}
            />
            <Text style={styles.continueButtonText}>Subscribe</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
              style={styles.continueArrow}
            />
          </Pressable>

          {/* Footer Links */}
          <View style={styles.footerLinks}>
            <Pressable>
              <Text style={styles.footerLink}>RESTORE PURCHASES</Text>
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
    borderRadius: 16,
    overflow: "hidden",
  },
  planCardGradient: {
    borderRadius: 16,
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
    height: 52,
    borderRadius: 26,
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
});
