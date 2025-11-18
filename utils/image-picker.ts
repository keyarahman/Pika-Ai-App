import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Request library permission and return true if granted
 */
export const requestLibraryPermission = async (): Promise<boolean> => {
  const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!granted) {
    if (canAskAgain) {
      Alert.alert('Permission needed', 'Please allow photo library access to pick an image.');
    }
    return false;
  }
  return true;
};

/**
 * Request camera permission and return true if granted
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  const { granted, canAskAgain } = await ImagePicker.requestCameraPermissionsAsync();
  if (!granted) {
    if (canAskAgain) {
      Alert.alert('Permission needed', 'Please allow camera access to take a photo.');
    }
    return false;
  }
  return true;
};

/**
 * Pick an image from the device library
 * @returns ImagePicker asset or null if canceled/no permission
 */
export const pickImageFromLibrary = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const hasPermission = await requestLibraryPermission();
  if (!hasPermission) return null;

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
  });

  if (!pickerResult.canceled && pickerResult.assets[0]) {
    return pickerResult.assets[0];
  }
  return null;
};

/**
 * Take a photo using the device camera
 * @returns ImagePicker asset or null if canceled/no permission
 */
export const takePhotoWithCamera = async (): Promise<ImagePicker.ImagePickerAsset | null> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) return null;

  const cameraResult = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
    allowsEditing: false,
  });

  if (!cameraResult.canceled && cameraResult.assets[0]) {
    return cameraResult.assets[0];
  }
  return null;
};

