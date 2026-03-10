'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Issue } from '@/types';
import { ISSUE_CATEGORIES } from '@/lib/constants';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { MapPin, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
  showUser?: boolean;
}

export default function IssueCard({ issue, showUser = false }: IssueCardProps) {
  const router = useRouter();
  const category = ISSUE_CATEGORIES.find((c) => c.value === issue.category);

  return (
    <Card
      hover
      onClick={() => router.push(`/issues/${issue.id}`)}
      className={`overflow-hidden ${issue.priority === 'emergency' ? 'ring-2 ring-red-300' : ''}`}
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100">
        {issue.imageUrl ? (
          <img
            src={issue.imageUrl}
            alt={issue.description || 'Issue image'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}

        {/* Emergency indicator */}
        {issue.priority === 'emergency' && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
            <AlertTriangle size={12} />
            EMERGENCY
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={issue.status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{category?.icon}</span>
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {category?.label || issue.category}
          </h3>
        </div>

        {issue.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <PriorityBadge priority={issue.priority} />

          <div className="flex items-center gap-3 text-xs text-gray-500">
            {issue.locationAddress && (
              <span className="flex items-center gap-1 max-w-[120px] truncate">
                <MapPin size={12} />
                {issue.locationAddress}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {showUser && (
          <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
            Reported by {issue.userName}
          </p>
        )}
      </div>
    </Card>
  );
}
