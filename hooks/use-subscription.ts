import { getCustomerInfo, initializeRevenueCat } from '@/utils/revenuecat';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CustomerInfo } from 'react-native-purchases';

// Entitlement identifier - check for both 'Appleov Pro' and 'pro'
const ENTITLEMENT_IDS = ['Appleov Pro', 'pro'];

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentPlanIdentifier, setCurrentPlanIdentifier] = useState<string | null>(null);

  // Helper to check subscription from customer info (avoid duplicate calls)
  const checkSubscriptionFromInfo = useCallback((info: CustomerInfo) => {
    // Check for active entitlement - try 'Appleov Pro' first, then 'pro'
    let activeEntitlement = null;
    for (const id of ENTITLEMENT_IDS) {
      if (info.entitlements.active[id]) {
        activeEntitlement = info.entitlements.active[id];
        break;
      }
    }
    
    // Fallback: check activeSubscriptions array
    const hasActive = activeEntitlement?.isActive || 
      (info.activeSubscriptions && info.activeSubscriptions.length > 0);
    
    setIsSubscribed(hasActive);
    setCustomerInfo(info);
    
    if (activeEntitlement) {
      const productIdentifier = activeEntitlement.productIdentifier;
      setCurrentPlanIdentifier(productIdentifier);
    } else if (info.activeSubscriptions && info.activeSubscriptions.length > 0) {
      setCurrentPlanIdentifier(info.activeSubscriptions[0]);
    } else {
      setCurrentPlanIdentifier(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const checkSubscription = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        await initializeRevenueCat();
        // Only call getCustomerInfo once - avoid duplicate calls
        const info = await getCustomerInfo();
        
        if (isMounted) {
          checkSubscriptionFromInfo(info);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        if (isMounted) {
          setIsSubscribed(false);
          setCurrentPlanIdentifier(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkSubscription();

    // Refresh subscription status periodically (every 30 seconds) - only when component is mounted
    intervalId = setInterval(() => {
      if (isMounted) {
        checkSubscription();
      }
    }, 30000);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [checkSubscriptionFromInfo]);

  const lastRefreshRef = useRef<number>(0);
  const REFRESH_THROTTLE_MS = 2000; // Don't refresh more than once every 2 seconds

  const refreshSubscription = useCallback(async () => {
    const now = Date.now();
    // Throttle: don't refresh if called too recently
    if (now - lastRefreshRef.current < REFRESH_THROTTLE_MS) {
      return;
    }
    lastRefreshRef.current = now;

    try {
      setIsLoading(true);
      await initializeRevenueCat();
      // Only call getCustomerInfo once - avoid duplicate calls
      const info = await getCustomerInfo();
      
      checkSubscriptionFromInfo(info);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setIsSubscribed(false);
      setCurrentPlanIdentifier(null);
    } finally {
      setIsLoading(false);
    }
  }, [checkSubscriptionFromInfo]);

  return {
    isSubscribed,
    isLoading,
    customerInfo,
    currentPlanIdentifier,
    refreshSubscription,
  };
}

