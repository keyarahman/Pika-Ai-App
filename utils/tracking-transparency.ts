import * as TrackingTransparency from 'expo-tracking-transparency';
import { Platform } from 'react-native';

/**
 * Request App Tracking Transparency permission (iOS only)
 * @returns Promise with tracking permission status
 */
export async function requestTrackingPermission(): Promise<{
  status: TrackingTransparency.PermissionStatus;
  granted: boolean;
}> {
  if (Platform.OS !== 'ios') {
    // Tracking transparency is iOS only
    return {
      status: 'unavailable' as TrackingTransparency.PermissionStatus,
      granted: false,
    };
  }

  try {
    const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
    return {
      status,
      granted: status === 'granted',
    };
  } catch (error) {
    console.error('Error requesting tracking permission:', error);
    return {
      status: 'denied' as TrackingTransparency.PermissionStatus,
      granted: false,
    };
  }
}

/**
 * Get current tracking permission status without requesting
 * @returns Promise with current tracking permission status
 */
export async function getTrackingPermissionStatus(): Promise<{
  status: TrackingTransparency.PermissionStatus;
  granted: boolean;
}> {
  if (Platform.OS !== 'ios') {
    return {
      status: 'unavailable' as TrackingTransparency.PermissionStatus,
      granted: false,
    };
  }

  try {
    const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
    return {
      status,
      granted: status === 'granted',
    };
  } catch (error) {
    console.error('Error getting tracking permission status:', error);
    return {
      status: 'denied' as TrackingTransparency.PermissionStatus,
      granted: false,
    };
  }
}

