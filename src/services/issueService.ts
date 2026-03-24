// Issue service - CRUD operations for civic issues
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Issue, IssueStatus, IssueFilters, DashboardStats } from '@/types';

const ISSUES_COLLECTION = 'issues';

/**
 * Create a new issue report
 */
export async function createIssue(
  issueData: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'status'>
): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, ISSUES_COLLECTION), {
    ...issueData,
    status: 'pending' as IssueStatus,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

/**
 * Get a single issue by ID
 */
export async function getIssue(issueId: string): Promise<Issue | null> {
  const docRef = doc(db, ISSUES_COLLECTION, issueId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Issue;
  }
  return null;
}

/**
 * Get all issues (optionally filtered)
 */
export async function getIssues(filters?: IssueFilters): Promise<Issue[]> {
  // To bypass any Firebase index requirements, we fetch all issues and filter/sort them on the client
  const q = query(collection(db, ISSUES_COLLECTION));
  const snapshot = await getDocs(q);
  
  let issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Issue));

  if (filters?.category) {
    issues = issues.filter(i => i.category === filters.category);
  }
  if (filters?.status) {
    issues = issues.filter(i => i.status === filters.status);
  }
  if (filters?.priority) {
    issues = issues.filter(i => i.priority === filters.priority);
  }

  // Sort descending by creation date
  return issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Get issues reported by a specific user
 */
export async function getUserIssues(userId: string): Promise<Issue[]> {
  const q = query(
    collection(db, ISSUES_COLLECTION),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Issue));
  
  // Sort descending by creation date
  return issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Update issue status
 */
export async function updateIssueStatus(
  issueId: string,
  status: IssueStatus
): Promise<void> {
  const docRef = doc(db, ISSUES_COLLECTION, issueId);
  await updateDoc(docRef, {
    status,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Subscribe to real-time updates for all issues
 */
export function subscribeToIssues(
  callback: (issues: Issue[]) => void
): Unsubscribe {
  const q = query(collection(db, ISSUES_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Issue));
    // Sort descending by creation date
    issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(issues);
  });
}

/**
 * Subscribe to a single issue for real-time tracking
 */
export function subscribeToIssue(
  issueId: string,
  callback: (issue: Issue | null) => void
): Unsubscribe {
  const docRef = doc(db, ISSUES_COLLECTION, issueId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as Issue);
    } else {
      callback(null);
    }
  });
}

/**
 * Calculate dashboard analytics from issues
 */
export function calculateStats(issues: Issue[]): DashboardStats {
  const stats: DashboardStats = {
    total: issues.length,
    pending: 0,
    verified: 0,
    inProgress: 0,
    resolved: 0,
    invalid: 0,
    emergency: 0,
    categoryBreakdown: {
      pothole: 0,
      garbage: 0,
      water_supply: 0,
      streetlight: 0,
      electrical: 0,
      drainage: 0,
      encroachment: 0,
      public_transport: 0,
      other: 0,
    },
  };

  issues.forEach((issue) => {
    // Status counts
    switch (issue.status) {
      case 'pending': stats.pending++; break;
      case 'verified': stats.verified++; break;
      case 'in_progress': stats.inProgress++; break;
      case 'resolved': stats.resolved++; break;
      case 'invalid': stats.invalid++; break;
    }
    // Emergency count
    if (issue.priority === 'emergency') stats.emergency++;
    // Category breakdown
    if (issue.category in stats.categoryBreakdown) {
      stats.categoryBreakdown[issue.category]++;
    }
  });

  return stats;
}
