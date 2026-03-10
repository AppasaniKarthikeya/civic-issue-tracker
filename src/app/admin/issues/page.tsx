'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToIssues } from '@/services/issueService';
import { Issue, IssueFilters } from '@/types';
import IssueCard from '@/components/features/IssueCard';
import IssueFiltersBar from '@/components/features/IssueFiltersBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { FileText } from 'lucide-react';

export default function AdminIssuesPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState<IssueFilters>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && profile?.role === 'admin') {
      const unsub = subscribeToIssues((data) => {
        setIssues(data);
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user, profile, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side filtering
  const filteredIssues = issues.filter((issue) => {
    if (filters.category && issue.category !== filters.category) return false;
    if (filters.priority && issue.priority !== filters.priority) return false;
    if (filters.status && issue.status !== filters.status) return false;
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      return (
        issue.description?.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q) ||
        issue.userName?.toLowerCase().includes(q) ||
        issue.locationAddress?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Reported Issues</h1>
        <p className="text-gray-600 mt-1">
          Showing {filteredIssues.length} of {issues.length} issue{issues.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-6">
        <IssueFiltersBar filters={filters} onFilterChange={setFilters} />
      </div>

      {filteredIssues.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No issues found</h3>
          <p className="text-gray-500 mt-1">
            {issues.length > 0
              ? 'Try adjusting your filters'
              : 'No civic issues have been reported yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} showUser />
          ))}
        </div>
      )}
    </div>
  );
}
