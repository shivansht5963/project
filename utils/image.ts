import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { ImagePickerResult } from '@/types/scanner';

export const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
export const COMPRESSION_QUALITY = 0.8;

export async function requestImagePickerPermissions(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }
  return true;
}

export async function requestCameraPermissions(): Promise<boolean> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }
  return true;
}

export async function pickImageFromGallery(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestImagePickerPermissions();
    if (!hasPermission) {
      throw new Error('Gallery permission not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: COMPRESSION_QUALITY,
      base64: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width || 0,
        height: asset.height || 0,
        type: asset.type || 'image',
      };
    }
    return null;
  } catch (error) {
    console.error('Error picking image from gallery:', error);
    throw error;
  }
}

export async function captureImageFromCamera(): Promise<ImagePickerResult | null> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      throw new Error('Camera permission not granted');
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: COMPRESSION_QUALITY,
      base64: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width || 0,
        height: asset.height || 0,
        type: asset.type || 'image',
      };
    }
    return null;
  } catch (error) {
    console.error('Error capturing image from camera:', error);
    throw error;
  }
}

export function validateImageSize(imageUri: string, maxSize: number = MAX_IMAGE_SIZE): boolean {
  // This is a simplified validation - in a real app, you'd check actual file size
  return true;
}

export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}