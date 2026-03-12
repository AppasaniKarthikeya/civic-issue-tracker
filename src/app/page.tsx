'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { ISSUE_CATEGORIES } from '@/lib/constants';
import {
  ArrowRight,
  Shield,
  MapPin,
  Camera,
  Bell,
  BarChart3,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const { user, profile } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white" style={{ minHeight: '480px' }}>
        {/* Scrolling background images */}
        <div className="absolute inset-0 z-0">
          <div className="hero-scroll-track h-full">
            {/* Original set */}
            <Image src="/hero/electrical.png" alt="" aria-hidden="true" width={800} height={600} priority className="object-cover h-full w-auto max-w-none" />
            <Image src="/hero/pothole.png" alt="" aria-hidden="true" width={800} height={600} priority className="object-cover h-full w-auto max-w-none" />
            <Image src="/hero/flooding.png" alt="" aria-hidden="true" width={800} height={600} priority className="object-cover h-full w-auto max-w-none" />
            {/* Duplicate set for seamless loop */}
            <Image src="/hero/electrical.png" alt="" aria-hidden="true" width={800} height={600} className="object-cover h-full w-auto max-w-none" />
            <Image src="/hero/pothole.png" alt="" aria-hidden="true" width={800} height={600} className="object-cover h-full w-auto max-w-none" />
            <Image src="/hero/flooding.png" alt="" aria-hidden="true" width={800} height={600} className="object-cover h-full w-auto max-w-none" />
          </div>
        </div>
        {/* Semi-transparent overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-700/60 via-blue-800/55 to-indigo-900/60" />
        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/30 backdrop-blur-sm rounded-full text-sm mb-6">
              <Shield size={14} />
              Civic Issue Reporting Platform
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Report Civic Issues.
              <br />
              <span className="text-blue-200">Track Resolution.</span>
            </h1>
            <p className="mt-6 text-lg text-blue-100 max-w-2xl">
              CivicTrack empowers citizens to report urban problems — potholes, garbage,
              streetlight failures and more. Government authorities monitor and resolve
              issues efficiently.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              {user ? (
                <Link
                  href={profile?.role === 'admin' ? '/admin/dashboard' : '/report'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {profile?.role === 'admin' ? 'Go to Dashboard' : 'Report an Issue'}
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Get Started
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Issue Categories */}
      <section className="py-16 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What can you report?</h2>
            <p className="mt-3 text-gray-600 max-w-xl mx-auto">
              Our platform handles all types of civic issues in urban areas
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ISSUE_CATEGORIES.map((cat) => (
              <div
                key={cat.value}
                className="flex flex-col items-center gap-3 p-6 bg-gray-50 dark:bg-zinc-900 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="text-4xl">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How it works</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Simple 3-step process to report and track issues</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Camera className="text-blue-600" size={32} />,
                title: 'Report',
                description:
                  'Take a photo, pin the location on the map, and describe the issue.',
              },
              {
                icon: <MapPin className="text-blue-600" size={32} />,
                title: 'Track',
                description:
                  'Follow real-time status updates as authorities work on your report.',
              },
              {
                icon: <Bell className="text-blue-600" size={32} />,
                title: 'Resolve',
                description:
                  'Get notified when your issue is verified and resolved by authorities.',
              },
            ].map((step, i) => (
              <div key={i} className="text-center p-8 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-colors duration-300 hover:shadow-md">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                  {step.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white dark:bg-black transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Features</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Camera size={20} />, title: 'Photo Evidence', desc: 'Upload images to document issues clearly' },
              { icon: <MapPin size={20} />, title: 'GPS Location', desc: 'Precise location tracking via GPS or map selection' },
              { icon: <BarChart3 size={20} />, title: 'Analytics', desc: 'Dashboard with data-driven insights for authorities' },
              { icon: <Bell size={20} />, title: 'Status Updates', desc: 'Real-time tracking and notification of issue progress' },
              { icon: <Shield size={20} />, title: 'Secure Auth', desc: 'Firebase Authentication for secure access' },
              { icon: <Users size={20} />, title: 'Dual Portal', desc: 'Separate interfaces for citizens and government admin' },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors duration-300 group">
                <div className="w-10 h-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors duration-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
