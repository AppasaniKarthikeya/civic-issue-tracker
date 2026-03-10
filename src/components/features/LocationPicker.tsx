'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Crosshair } from 'lucide-react';
import Button from '@/components/ui/Button';
import { DEFAULT_CENTER } from '@/lib/constants';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
  readOnly?: boolean;
}

/**
 * Location picker using Leaflet maps (OpenStreetMap).
 * Dynamically imports Leaflet to avoid SSR issues.
 */
export default function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  readOnly = false,
}: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icon
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapRef.current && !mapInstanceRef.current) {
        const center = selectedLocation || DEFAULT_CENTER;
        const map = L.map(mapRef.current).setView(
          [center.lat, center.lng],
          13
        );

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        mapInstanceRef.current = map;

        if (selectedLocation) {
          markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(map);
          reverseGeocode(selectedLocation.lat, selectedLocation.lng);
        }

        if (!readOnly) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          map.on('click', (e: any) => {
            const { lat, lng } = e.latlng;

            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng]).addTo(map);
            }

            setSelectedLocation({ lat, lng });
            reverseGeocode(lat, lng);
            onLocationSelect(lat, lng);
          });
        }
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addr);
      onLocationSelect(lat, lng, addr);
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const L = (await import('leaflet')).default;

          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([latitude, longitude], 15);

            if (markerRef.current) {
              markerRef.current.setLatLng([latitude, longitude]);
            } else {
              markerRef.current = L.marker([latitude, longitude]).addTo(
                mapInstanceRef.current
              );
            }
          }

          setSelectedLocation({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get current location. Please select manually on the map.');
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Location <span className="text-red-500">*</span>
        </label>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            loading={loading}
          >
            <Crosshair size={14} />
            Use Current Location
          </Button>
        )}
      </div>

      <div
        ref={mapRef}
        className="w-full h-64 rounded-lg border border-gray-300 overflow-hidden z-0"
      />

      {selectedLocation && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
          <MapPin size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600">
            <p className="font-medium text-gray-900">
              {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
            {address && <p className="mt-0.5">{address}</p>}
          </div>
        </div>
      )}

      {!selectedLocation && !readOnly && (
        <p className="text-xs text-gray-500">
          Click on the map to select a location, or use your current location.
        </p>
      )}
    </div>
  );
}
