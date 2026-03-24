'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToIssues } from '@/services/issueService';
import { Issue, IssueFilters } from '@/types';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, DEFAULT_CENTER } from '@/lib/constants';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import IssueFiltersBar from '@/components/features/IssueFiltersBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import Image from 'next/image';
import { Crosshair } from 'lucide-react';

export default function AdminMapPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filters, setFilters] = useState<IssueFilters>({});
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);

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

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapRef.current && !mapInstanceRef.current) {
        const map = L.map(mapRef.current).setView(
          [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
          12
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        mapInstanceRef.current = map;
      }
    };

    if (!loading) {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  // Update markers when filtered issues change
  useEffect(() => {
    const updateMarkers = async () => {
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Add new markers for filtered issues
      filteredIssues.forEach((issue) => {
        const priorityColors: Record<string, string> = {
          low: '#22c55e',
          medium: '#eab308',
          high: '#f97316',
          emergency: '#ef4444',
        };

        const color = priorityColors[issue.priority] || '#6b7280';
        const cat = ISSUE_CATEGORIES.find((c) => c.value === issue.category);

        const icon = L.divIcon({
          html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${cat?.icon || '📍'}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([issue.locationLat, issue.locationLng], { icon }).addTo(map);

        marker.on('click', () => {
          setSelectedIssue(issue);
        });

        markersRef.current.push(marker);
      });

      // Fit bounds if there are markers
      if (filteredIssues.length > 0) {
        const bounds = L.latLngBounds(
          filteredIssues.map((i) => [i.locationLat, i.locationLng])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    updateMarkers();
  }, [filteredIssues]);

  // Self-location handler
  const handleMyLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const L = (await import('leaflet')).default;
        const map = mapInstanceRef.current;

        if (map) {
          map.setView([latitude, longitude], 15);

          // Remove previous user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Add a distinct blue pulsing marker for user location
          const userIcon = L.divIcon({
            html: `<div style="width: 20px; height: 20px; border-radius: 50%; background-color: #3b82f6; border: 3px solid white; box-shadow: 0 0 0 4px rgba(59,130,246,0.3), 0 2px 6px rgba(0,0,0,0.3);"></div>`,
            className: '',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('You are here')
            .openPopup();
        }

        setLocatingUser(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please check your browser permissions.');
        setLocatingUser(false);
      },
      { enableHighAccuracy: true }
    );
  };

  if (authLoading || loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Map Visualization</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all reported issues on the map. Color indicates priority level.
        </p>
      </div>

      <div className="mb-4">
        <IssueFiltersBar filters={filters} onFilterChange={setFilters} />
      </div>

      {/* Priority Legend + My Location */}
      <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Priority:</span>
        {ISSUE_PRIORITIES.map((p) => (
          <div key={p.value} className="flex items-center gap-1.5">
            <div
              className={`w-3 h-3 rounded-full`}
              style={{
                backgroundColor:
                  p.value === 'low'
                    ? '#22c55e'
                    : p.value === 'medium'
                    ? '#eab308'
                    : p.value === 'high'
                    ? '#f97316'
                    : '#ef4444',
              }}
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{p.label}</span>
          </div>
        ))}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
          {filteredIssues.length} issue{filteredIssues.length !== 1 ? 's' : ''} shown
        </span>
        <button
          onClick={handleMyLocation}
          disabled={locatingUser}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors disabled:opacity-50"
        >
          <Crosshair size={14} className={locatingUser ? 'animate-spin' : ''} />
          {locatingUser ? 'Locating...' : 'My Location'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2">
          <div
            ref={mapRef}
            className="w-full h-[600px] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-0"
          />
        </div>

        {/* Selected Issue Detail Panel */}
        <div>
          {selectedIssue ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 shadow-sm sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {ISSUE_CATEGORIES.find((c) => c.value === selectedIssue.category)?.icon}{' '}
                {ISSUE_CATEGORIES.find((c) => c.value === selectedIssue.category)?.label}
              </h3>

              {selectedIssue.imageUrl && (
                <div className="relative w-full h-40">
                  <Image
                    src={selectedIssue.imageUrl}
                    alt="Issue"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <StatusBadge status={selectedIssue.status} />
                <PriorityBadge priority={selectedIssue.priority} />
              </div>

              {selectedIssue.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedIssue.description}</p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">Reporter:</strong> {selectedIssue.userName}
                </p>
                <p>
                  <strong className="text-gray-700 dark:text-gray-300">Location:</strong>{' '}
                  {selectedIssue.locationAddress ||
                    `${selectedIssue.locationLat.toFixed(4)}, ${selectedIssue.locationLng.toFixed(4)}`}
                </p>
              </div>

              <Link
                href={`/issues/${selectedIssue.id}`}
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                View Details
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Click a marker on the map to view issue details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
