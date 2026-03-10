'use client';

import React from 'react';
import { APP_NAME } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">CT</span>
            </div>
            <span className="text-sm font-medium text-white">{APP_NAME}</span>
          </div>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} {APP_NAME}. Civic Issue Reporting and Monitoring System.
          </p>
        </div>
      </div>
    </footer>
  );
}
