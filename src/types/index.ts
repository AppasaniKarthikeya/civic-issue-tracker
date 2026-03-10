// Core type definitions for the Civic Issue Reporting System

export type IssueCategory =
  | 'pothole'
  | 'garbage'
  | 'water_supply'
  | 'streetlight'
  | 'electrical'
  | 'drainage'
  | 'encroachment'
  | 'public_transport'
  | 'other';

export type IssuePriority = 'low' | 'medium' | 'high' | 'emergency';

export type IssueStatus = 'pending' | 'verified' | 'in_progress' | 'resolved';

export type UserRole = 'citizen' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  photoUrl?: string;
  language?: string;
}

export interface Issue {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  imageUrl: string;
  voiceUrl?: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  locationLat: number;
  locationLng: number;
  locationAddress?: string;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  createdAt: string;
}

export interface StatusUpdate {
  id: string;
  issueId: string;
  previousStatus: IssueStatus;
  newStatus: IssueStatus;
  updatedBy: string;
  updatedByName: string;
  note: string;
  createdAt: string;
}

export interface IssueFilters {
  category?: IssueCategory;
  priority?: IssuePriority;
  status?: IssueStatus;
  searchQuery?: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  verified: number;
  inProgress: number;
  resolved: number;
  emergency: number;
  categoryBreakdown: Record<IssueCategory, number>;
}
