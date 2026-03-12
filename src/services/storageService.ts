// Storage service - handles image and voice file uploads to Vercel Blob API route
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload an image file to Vercel Blob
 * @returns Download URL of the uploaded image
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `issues/images/${userId}/${uuidv4()}.${fileExtension}`;
  
  const response = await fetch(`/api/upload?filename=${fileName}`, {
    method: 'POST',
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  const newBlob = await response.json();
  return newBlob.url;
}

/**
 * Upload a voice recording to Vercel Blob
 * @returns Download URL of the uploaded recording
 */
export async function uploadVoiceRecording(
  blob: Blob,
  userId: string
): Promise<string> {
  const fileName = `issues/voice/${userId}/${uuidv4()}.webm`;
  
  const response = await fetch(`/api/upload?filename=${fileName}`, {
    method: 'POST',
    body: blob,
  });

  if (!response.ok) {
    throw new Error('Failed to upload voice recording');
  }

  const newBlob = await response.json();
  return newBlob.url;
}

/**
 * Upload image with progress tracking
 */
export function uploadImageWithProgress(
  file: File,
  userId: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      // Simulate progress since fetch stream upload isn't natively supported 
      // with precise progress events yet without XHR.
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress <= 90) onProgress(progress);
      }, 100);

      const url = await uploadImage(file, userId);

      clearInterval(interval);
      onProgress(100);
      resolve(url);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Upload a profile photo
 */
export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `profiles/images/${userId}_${Date.now()}.${fileExtension}`;
  
  const response = await fetch(`/api/upload?filename=${fileName}`, {
    method: 'POST',
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload profile photo');
  }

  const newBlob = await response.json();
  return newBlob.url;
}
