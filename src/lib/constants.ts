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
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' },
];

export const ISSUE_STATUSES: { value: IssueStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'verified', label: 'Verified', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
];

export const DEFAULT_CENTER = {
  lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '12.9716'),
  lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG || '77.5946'),
};

export const APP_NAME = 'CivicTrack';
export const APP_DESCRIPTION = 'Civic Issue Reporting and Monitoring System';
