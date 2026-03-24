// Comment and status update services
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Comment, StatusUpdate, IssueStatus, UserRole } from '@/types';

const COMMENTS_COLLECTION = 'comments';
const STATUS_UPDATES_COLLECTION = 'status_updates';

/** Sort helper – ascending by createdAt */
function sortByCreatedAt<T extends { createdAt: string }>(items: T[]): T[] {
  return items.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

/**
 * Add a comment to an issue
 */
export async function addComment(
  issueId: string,
  userId: string,
  userName: string,
  userRole: UserRole,
  text: string
): Promise<string> {
  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
    issueId,
    userId,
    userName,
    userRole,
    text,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Get comments for an issue (sorted client-side to avoid Firebase composite index)
 */
export async function getComments(issueId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('issueId', '==', issueId)
  );
  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Comment));
  return sortByCreatedAt(comments);
}

/**
 * Subscribe to comments for real-time updates (sorted client-side)
 */
export function subscribeToComments(
  issueId: string,
  callback: (comments: Comment[]) => void
): Unsubscribe {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('issueId', '==', issueId)
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
    callback(sortByCreatedAt(comments));
  });
}

/**
 * Add a status update record
 */
export async function addStatusUpdate(
  issueId: string,
  previousStatus: IssueStatus,
  newStatus: IssueStatus,
  updatedBy: string,
  updatedByName: string,
  note: string
): Promise<string> {
  const docRef = await addDoc(collection(db, STATUS_UPDATES_COLLECTION), {
    issueId,
    previousStatus,
    newStatus,
    updatedBy,
    updatedByName,
    note,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

/**
 * Get status update history for an issue (sorted client-side)
 */
export async function getStatusUpdates(issueId: string): Promise<StatusUpdate[]> {
  const q = query(
    collection(db, STATUS_UPDATES_COLLECTION),
    where('issueId', '==', issueId)
  );
  const snapshot = await getDocs(q);
  const updates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as StatusUpdate));
  return sortByCreatedAt(updates);
}

/**
 * Subscribe to status updates for real-time tracking (sorted client-side)
 */
export function subscribeToStatusUpdates(
  issueId: string,
  callback: (updates: StatusUpdate[]) => void
): Unsubscribe {
  const q = query(
    collection(db, STATUS_UPDATES_COLLECTION),
    where('issueId', '==', issueId)
  );
  return onSnapshot(q, (snapshot) => {
    const updates = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as StatusUpdate));
    callback(sortByCreatedAt(updates));
  });
}
