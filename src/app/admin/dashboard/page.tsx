'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToIssues, calculateStats } from '@/services/issueService';
import { Issue, DashboardStats } from '@/types';
import { ISSUE_CATEGORIES } from '@/lib/constants';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  TrendingUp,
  MapPin,
  BarChart3,
  Settings,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (user && profile?.role === 'admin') {
      const unsub = subscribeToIssues((data) => {
        setIssues(data);
        setStats(calculateStats(data));
        setLoading(false);
      });
      return () => unsub();
    }
  }, [user, profile, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading || loading) return <LoadingSpinner />;

  if (!stats) return null;

  const emergencyIssues = issues.filter((i) => i.priority === 'emergency' && i.status !== 'resolved');
  const recentIssues = issues.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of civic issues and system analytics</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/issues"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={16} />
            All Issues
          </Link>
          <Link
            href="/admin/map"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <MapPin size={16} />
            Map View
          </Link>
        </div>
      </div>

      {/* Emergency Alert */}
      {emergencyIssues.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={20} />
            <span className="font-semibold">
              {emergencyIssues.length} Emergency Issue{emergencyIssues.length !== 1 ? 's' : ''} Require Attention
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {emergencyIssues.slice(0, 3).map((issue) => (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="block text-sm text-red-600 hover:underline"
              >
                • {ISSUE_CATEGORIES.find((c) => c.value === issue.category)?.label} -{' '}
                {issue.locationAddress || 'Unknown location'}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard title="Total" value={stats.total} icon={<FileText />} color="blue" />
        <StatCard title="Pending" value={stats.pending} icon={<Clock />} color="gray" />
        <StatCard title="Verified" value={stats.verified} icon={<Eye />} color="blue" />
        <StatCard title="In Progress" value={stats.inProgress} icon={<Settings />} color="purple" />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle />} color="green" />
        <StatCard title="Emergency" value={stats.emergency} icon={<AlertTriangle />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 size={18} />
              Issues by Category
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {ISSUE_CATEGORIES.map((cat) => {
                const count = stats.categoryBreakdown[cat.value] || 0;
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={cat.value} className="flex items-center gap-3">
                    <span className="text-xl w-8">{cat.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">{cat.label}</span>
                        <span className="text-gray-500">{count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* Recent Issues */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} />
              Recent Issues
            </h2>
            <Link href="/admin/issues" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {recentIssues.map((issue) => {
                const cat = ISSUE_CATEGORIES.find((c) => c.value === issue.category);
                return (
                  <Link
                    key={issue.id}
                    href={`/issues/${issue.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{cat?.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cat?.label} - {issue.userName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {issue.locationAddress || `${issue.locationLat.toFixed(3)}, ${issue.locationLng.toFixed(3)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {issue.priority === 'emergency' && (
                        <AlertTriangle size={14} className="text-red-500" />
                      )}
                      <span
                        className={`w-2 h-2 rounded-full ${
                          issue.status === 'resolved'
                            ? 'bg-green-500'
                            : issue.status === 'in_progress'
                            ? 'bg-purple-500'
                            : issue.status === 'verified'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                      />
                    </div>
                  </Link>
                );
              })}
              {recentIssues.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No issues reported yet</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    gray: 'bg-gray-50 text-gray-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className={`w-10 h-10 ${colors[color]} rounded-lg flex items-center justify-center mb-3`}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{title}</p>
    </div>
  );
}
