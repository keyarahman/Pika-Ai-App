import { API_BASE_URL, API_KEY } from '@/constants/api';
import * as ImagePicker from 'expo-image-picker';

export type ImageUploadResult = {
  img_id: number;
  img_url: string;
};

export type ProcessedImage = {
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  format: string;
};

const generateTraceId = () => {
  const nativeCrypto = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;
  if (nativeCrypto && typeof nativeCrypto.randomUUID === 'function') {
    return nativeCrypto.randomUUID();
  }
  return `trace-${Math.random().toString(36).slice(2)}-${Date.now()}`;
};

const guessMimeType = (asset: ImagePicker.ImagePickerAsset): string => {
  if (asset.mimeType) return asset.mimeType;
  if (asset.uri.endsWith('.png')) return 'image/png';
  if (asset.uri.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
};

/**
 * Process image for upload (resize, compress, format)
 * Handles image manipulation if expo-image-manipulator is available
 */
export const processImageForUpload = async (
  asset: ImagePicker.ImagePickerAsset
): Promise<ProcessedImage> => {
  try {
    // Try to import ImageManipulator dynamically
    let ImageManipulator: any;
    try {
      ImageManipulator = require('expo-image-manipulator');
    } catch (e) {
      console.warn('ImageManipulator not available, using original image');
      return {
        uri: asset.uri,
        width: asset.width || 0,
        height: asset.height || 0,
        mimeType: guessMimeType(asset),
        format: asset.uri.endsWith('.png') ? 'png' : asset.uri.endsWith('.webp') ? 'webp' : 'jpg',
      };
    }

    const MAX_DIMENSION = 4000;
    const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

    let width = asset.width || 0;
    let height = asset.height || 0;
    let processedUri = asset.uri;
    let processedFormat = ImageManipulator.SaveFormat?.JPEG || 'jpeg';
    let mimeType = guessMimeType(asset);

    // Determine format from mime type
    if (mimeType === 'image/png') {
      processedFormat = ImageManipulator.SaveFormat?.PNG || 'png';
    } else if (mimeType === 'image/webp') {
      processedFormat = ImageManipulator.SaveFormat?.WEBP || 'webp';
    } else {
      processedFormat = ImageManipulator.SaveFormat?.JPEG || 'jpeg';
      mimeType = 'image/jpeg';
    }

    // Check if image needs resizing (exceeds 4000x4000)
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      console.log(`Image dimensions (${width}x${height}) exceed ${MAX_DIMENSION}, resizing...`);

      // Calculate new dimensions maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;

      if (width > height) {
        if (width > MAX_DIMENSION) {
          newWidth = MAX_DIMENSION;
          newHeight = Math.round((height * MAX_DIMENSION) / width);
        }
      } else {
        if (height > MAX_DIMENSION) {
          newHeight = MAX_DIMENSION;
          newWidth = Math.round((width * MAX_DIMENSION) / height);
        }
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: newWidth, height: newHeight } }],
        {
          compress: 0.9,
          format: processedFormat,
        }
      );

      processedUri = manipulatedImage.uri;
      width = manipulatedImage.width;
      height = manipulatedImage.height;
      console.log(`Image resized to ${width}x${height}`);
    } else {
      // Even if dimensions are OK, compress to reduce file size
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [],
        {
          compress: 0.85,
          format: processedFormat,
        }
      );

      processedUri = manipulatedImage.uri;
    }

    // Get file info to check size
    const fileInfo = await fetch(processedUri).then(res => res.blob());
    const fileSize = fileInfo.size;

    // If still too large, compress more aggressively
    let currentFileSize = fileSize;
    if (currentFileSize > MAX_FILE_SIZE) {
      console.log(`File size (${(currentFileSize / 1024 / 1024).toFixed(2)}MB) exceeds 20MB, compressing more...`);
      let compressQuality = 0.7;

      while (currentFileSize > MAX_FILE_SIZE && compressQuality > 0.3) {
        const compressedImage = await ImageManipulator.manipulateAsync(
          processedUri,
          [],
          {
            compress: compressQuality,
            format: processedFormat,
          }
        );

        const newFileInfo = await fetch(compressedImage.uri).then(res => res.blob());
        const newFileSize = newFileInfo.size;
        if (newFileSize < currentFileSize) {
          processedUri = compressedImage.uri;
          currentFileSize = newFileSize;
          compressQuality -= 0.1;
        } else {
          break;
        }
      }
      console.log(`Final file size: ${(currentFileSize / 1024 / 1024).toFixed(2)}MB`);
    }

    return {
      uri: processedUri,
      width,
      height,
      mimeType,
      format: processedFormat === (ImageManipulator.SaveFormat?.PNG || 'png') ? 'png' :
              processedFormat === (ImageManipulator.SaveFormat?.WEBP || 'webp') ? 'webp' : 'jpg',
    };
  } catch (error) {
    console.error('Image processing error:', error);
    // Fallback to original asset if processing fails
    return {
      uri: asset.uri,
      width: asset.width || 0,
      height: asset.height || 0,
      mimeType: guessMimeType(asset),
      format: asset.uri.endsWith('.png') ? 'png' :
              asset.uri.endsWith('.webp') ? 'webp' : 'jpg',
    };
  }
};

/**
 * Upload image to Pixverse API
 * @param asset - ImagePicker asset to upload
 * @param processedImage - Optional pre-processed image (if you want to process separately)
 * @returns ImageUploadResult with img_id and img_url
 * @throws Error if upload fails
 */
export const uploadImage = async (
  asset: ImagePicker.ImagePickerAsset,
  processedImage?: ProcessedImage
): Promise<ImageUploadResult> => {
  if (!API_KEY) {
    throw new Error('Missing API key. Please configure your API key.');
  }

  // Process image if not provided
  const image = processedImage || (await processImageForUpload(asset));

  const formData = new FormData();
  const fileName = asset.fileName
    ? asset.fileName.replace(/\.[^/.]+$/, `.${image.format}`)
    : `upload-${Date.now()}.${image.format}`;

  formData.append('image', {
    uri: image.uri,
    name: fileName,
    type: image.mimeType,
  } as any);

  const traceId = generateTraceId();

  const response = await fetch(`${API_BASE_URL}/openapi/v2/image/upload`, {
    method: 'POST',
    headers: {
      'API-KEY': API_KEY,
      'Ai-trace-id': traceId,
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Upload failed';
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson?.ErrMsg) {
        errorMessage = errorJson.ErrMsg;
      } else if (errorJson?.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      if (errorText && errorText.length < 200) {
        errorMessage = errorText;
      }
    }
    throw new Error(errorMessage);
  }

  const payload = await response.json().catch(() => null);
  
  if (!payload) {
    throw new Error('Invalid response from server');
  }

  const errCode = payload?.ErrCode ?? null;
  const errMsg = payload?.ErrMsg ?? 'Upload failed';
  const respData = payload?.Resp ?? {};
  const imgId = typeof respData?.img_id === 'number' ? respData.img_id : null;
  const imgUrl = typeof respData?.img_url === 'string' ? respData.img_url : undefined;

  // Handle special case: ErrCode !== 0 but ErrMsg === "Success" and img_id exists
  if (errCode !== 0) {
    if (errMsg === 'Success' && imgId) {
      // Success message with img_id - proceed
      console.log('Upload response has non-zero ErrCode but Success message and img_id, proceeding...');
    } else {
      // Real error - throw it
      throw new Error(errMsg);
    }
  }

  if (!imgId) {
    throw new Error('Image ID not received from server');
  }

  if (!imgUrl) {
    throw new Error('Image URL not received from server');
  }

  return {
    img_id: imgId,
    img_url: imgUrl,
  };
};
