// Authentication service - handles user registration, login, and profile management
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfile, UserRole } from '@/types';

/**
 * Register a new user with email and password
 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'citizen'
): Promise<UserProfile> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Firebase Auth display name
  await updateProfile(user, { displayName });

  // Create user profile in Firestore
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName,
    role,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'users', user.uid), profile);
  return profile;
}

/**
 * Login with email and password
 */
export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Logout current user
 */
export async function logoutUser() {
  return signOut(auth);
}

/**
 * Get user profile from Firestore
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'phone' | 'photoUrl' | 'language'>>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
