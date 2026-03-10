'use client';

import React from 'react';
import { ISSUE_STATUSES, ISSUE_PRIORITIES } from '@/lib/constants';
import { IssueStatus, IssuePriority } from '@/types';

export function StatusBadge({ status }: { status: IssueStatus }) {
  const config = ISSUE_STATUSES.find((s) => s.value === status);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
      {config?.label || status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const config = ISSUE_PRIORITIES.find((p) => p.value === priority);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config?.color || 'bg-gray-100 text-gray-800'}`}>
      {config?.label || priority}
    </span>
  );
}
