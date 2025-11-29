import { getCustomerInfo, hasActiveSubscription, initializeRevenueCat } from '@/utils/revenuecat';
import { useEffect, useState } from 'react';
import { CustomerInfo } from 'react-native-purchases';

export function useSubscription() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentPlanIdentifier, setCurrentPlanIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        setIsLoading(true);
        await initializeRevenueCat();
        const hasActive = await hasActiveSubscription();
        const info = await getCustomerInfo();
        
        setIsSubscribed(hasActive);
        setCustomerInfo(info);
        
        // Get current plan identifier from active entitlement
        if (info.entitlements.active['pro']) {
          const activeEntitlement = info.entitlements.active['pro'];
          // Try to get the product identifier from the entitlement
          const productIdentifier = activeEntitlement.productIdentifier;
          setCurrentPlanIdentifier(productIdentifier);
        } else {
          setCurrentPlanIdentifier(null);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
        setCurrentPlanIdentifier(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();

    // Refresh subscription status periodically (every 30 seconds)
    const interval = setInterval(checkSubscription, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshSubscription = async () => {
    try {
      setIsLoading(true);
      await initializeRevenueCat();
      const hasActive = await hasActiveSubscription();
      const info = await getCustomerInfo();
      
      setIsSubscribed(hasActive);
      setCustomerInfo(info);
      
      if (info.entitlements.active['pro']) {
        const activeEntitlement = info.entitlements.active['pro'];
        const productIdentifier = activeEntitlement.productIdentifier;
        setCurrentPlanIdentifier(productIdentifier);
      } else {
        setCurrentPlanIdentifier(null);
      }
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      setIsSubscribed(false);
      setCurrentPlanIdentifier(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSubscribed,
    isLoading,
    customerInfo,
    currentPlanIdentifier,
    refreshSubscription,
  };
}

