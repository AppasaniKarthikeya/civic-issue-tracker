// Storage service - handles image and voice file uploads to Firebase Storage
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload an image file to Firebase Storage
 * @returns Download URL of the uploaded image
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `issues/images/${userId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return getDownloadURL(snapshot.ref);
}

/**
 * Upload a voice recording to Firebase Storage
 * @returns Download URL of the uploaded recording
 */
export async function uploadVoiceRecording(
  blob: Blob,
  userId: string
): Promise<string> {
  const fileName = `${uuidv4()}.webm`;
  const storageRef = ref(storage, `issues/voice/${userId}/${fileName}`);

  const snapshot = await uploadBytes(storageRef, blob, {
    contentType: 'audio/webm',
  });

  return getDownloadURL(snapshot.ref);
}

/**
 * Upload image with progress tracking
 */
export function uploadImageWithProgress(
  file: File,
  userId: string,
  onProgress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `issues/images/${userId}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Upload a profile photo
 */
export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `profiles/images/${userId}/${fileName}`);
  const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}
