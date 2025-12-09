import Purchases, { CustomerInfo, PurchasesOffering, PurchasesOfferings, PurchasesPackage } from 'react-native-purchases';

const REVENUECAT_API_KEY = 'appl_WQHSodgscQgyhdcDdEMdCvmXQpZ';

let isInitialized = false;

/**
 * Initialize RevenueCat SDK
 */
export async function initializeRevenueCat(userId?: string): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    
    if (userId) {
      await Purchases.logIn(userId);
    }
    
    isInitialized = true;
    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    throw error;
  }
}

/**
 * Get available offerings from RevenueCat
 */
export async function getOfferings(): Promise<PurchasesOfferings | null> {
  try {
    if (!isInitialized) {
      await initializeRevenueCat();
    }
    
    const offerings = await Purchases.getOfferings();
    console.log('Fetched offerings:', offerings);
    return offerings;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
}

/**
 * Get the current offering (usually the default one)
 */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    // console.log('Getting current offering...');
    const offerings = await getOfferings();
    // console.log('Current offering:', offerings?.current);
    if (!offerings) {
      return null;
    }
    
    return offerings.current ?? null;
  } catch (error) {
    console.error('Error getting current offering:', error);
    return null;
  }
}

/**
 * Purchase a package
 */
export async function purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
  try {
    if (!isInitialized) {
      await initializeRevenueCat();
    }
    
    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    console.error('Error purchasing package:', error);
    
    // Handle user cancellation - RevenueCat throws errors with userCancelled property
    if (error?.userCancelled === true) {
      const cancelError = new Error('Purchase was cancelled');
      (cancelError as any).userCancelled = true;
      throw cancelError;
    }
    
    throw error;
  }
}

/**
 * Restore purchases
 */
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    if (!isInitialized) {
      await initializeRevenueCat();
    }
    
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}

/**
 * Get customer info
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    if (!isInitialized) {
      await initializeRevenueCat();
    }
    
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    throw error;
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  try {
    const customerInfo = await getCustomerInfo();
    return customerInfo.entitlements.active['pro'] !== undefined;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

