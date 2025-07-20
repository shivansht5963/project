import { ApiResponse } from '@/types/scanner';

export async function extractTextFromImage(imageUri: string): Promise<ApiResponse> {
  try {
    const formData = new FormData();
    // For React Native, imageUri is usually a file URI (e.g., file:///...), so we need to use fetch only if it starts with 'http'.
    let fileToSend: any = null;
    if (imageUri.startsWith('file://')) {
      // Use React Native's File API for local files
      fileToSend = {
        uri: imageUri,
        name: 'image.jpg',
        type: 'image/jpeg',
      };
    } else {
      // For remote images, fetch and convert to blob
      const response = await fetch(imageUri);
      const blob = await response.blob();
      fileToSend = new File([blob], 'image.jpg', { type: 'image/jpeg' });
    }
    formData.append('image', fileToSend);

    // Use your local IP and port, and ensure your backend is accessible from your device/emulator
    const apiUrl = 'http://192.168.1.5:3000/api/extract-text';
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      headers: {
        // Do not set Content-Type, let fetch set it automatically for FormData
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return data;
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function uploadImageWithProgress(
  imageUri: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress?.(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    const formData = new FormData();
    formData.append('image', imageUri);

    xhr.open('POST', '/api/upload-image');
    xhr.send(formData);
  });
}