'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getUserIssues } from '@/services/issueService';
import { Issue } from '@/types';
import IssueCard from '@/components/features/IssueCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { PlusCircle, List, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CitizenDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadIssues();
    }
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadIssues = async () => {
    if (!user) return;
    try {
      const data = await getUserIssues(user.uid);
      setIssues(data);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  const recentIssues = issues.slice(0, 6);
  const pendingCount = issues.filter((i) => i.status === 'pending').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.welcome')}, {profile?.displayName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('dashboard.overview')}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.totalReports')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{issues.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.pending')}</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-500 mt-1">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <List size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.resolved')}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-500 mt-1">{resolvedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <List size={24} className="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-8">
        <Link href="/report">
          <Button>
            <PlusCircle size={18} />
            {t('nav.report')}
          </Button>
        </Link>
        <Link href="/my-reports">
          <Button variant="outline">
            <List size={18} />
            {t('nav.myReports')}
          </Button>
        </Link>
      </div>

      {/* Recent Issues */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('dashboard.recentReports')}</h2>
        {recentIssues.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm border-dashed">
            <FileText size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('dashboard.noReports')}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.startReporting')}</p>
            <Link href="/report" className="mt-4 inline-block">
              <Button>
                <PlusCircle size={18} />
                {t('nav.report')}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
