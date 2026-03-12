'use client';

import React from 'react';
import { IssueFilters, IssueCategory, IssuePriority, IssueStatus } from '@/types';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '@/lib/constants';
import Select from '@/components/ui/Select';
import { Search, X } from 'lucide-react';

interface IssueFiltersBarProps {
  filters: IssueFilters;
  onFilterChange: (filters: IssueFilters) => void;
}

export default function IssueFiltersBar({ filters, onFilterChange }: IssueFiltersBarProps) {
  const hasFilters = filters.category || filters.priority || filters.status || filters.searchQuery;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search issues..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <Select
          options={ISSUE_CATEGORIES.map((c) => ({ value: c.value, label: `${c.icon} ${c.label}` }))}
          placeholder="All Categories"
          value={filters.category || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, category: (e.target.value || undefined) as IssueCategory | undefined })
          }
          className="min-w-[160px]"
        />

        {/* Priority Filter */}
        <Select
          options={ISSUE_PRIORITIES.map((p) => ({ value: p.value, label: p.label }))}
          placeholder="All Priorities"
          value={filters.priority || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, priority: (e.target.value || undefined) as IssuePriority | undefined })
          }
          className="min-w-[140px]"
        />

        {/* Status Filter */}
        <Select
          options={ISSUE_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
          placeholder="All Statuses"
          value={filters.status || ''}
          onChange={(e) =>
            onFilterChange({ ...filters, status: (e.target.value || undefined) as IssueStatus | undefined })
          }
          className="min-w-[140px]"
        />

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={() => onFilterChange({})}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
