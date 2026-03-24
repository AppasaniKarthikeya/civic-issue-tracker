// Application constants

import { IssueCategory, IssuePriority, IssueStatus } from '@/types';

export const ISSUE_CATEGORIES: { value: IssueCategory; label: string; icon: string }[] = [
  { value: 'pothole', label: 'Pothole', icon: '🕳️' },
  { value: 'garbage', label: 'Garbage Collection', icon: '🗑️' },
  { value: 'water_supply', label: 'Water Supply', icon: '💧' },
  { value: 'electrical', label: 'Electrical Outages', icon: '⚡' },
  { value: 'streetlight', label: 'Streetlight Failure', icon: '💡' },
  { value: 'drainage', label: 'Drainage Problem', icon: '🌊' },
  { value: 'encroachment', label: 'Encroachment', icon: '🚧' },
  { value: 'public_transport', label: 'Inadequate Public Transport', icon: '🚌' },
  { value: 'other', label: 'Others', icon: '📋' },
];

export const ISSUE_PRIORITIES: { value: IssuePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-600 text-white' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-600 text-white' },
  { value: 'high', label: 'High', color: 'bg-orange-600 text-white' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-600 text-white' },
];

export const ISSUE_STATUSES: { value: IssueStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-purple-500 text-white' },
  { value: 'verified', label: 'Verified', color: 'bg-blue-500 text-white' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-500 text-white' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-500 text-white' },
  { value: 'invalid', label: 'Invalid', color: 'bg-red-500 text-white' },
];

export const DEFAULT_CENTER = {
  lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '12.9716'),
  lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || '77.5946'),
};

export const APP_NAME = 'CivicTrack';
export const APP_DESCRIPTION = 'Civic Issue Reporting and Monitoring System';
