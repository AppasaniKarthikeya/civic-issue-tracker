'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createIssue } from '@/services/issueService';
import { uploadImage } from '@/services/storageService';
import { uploadVoiceRecording } from '@/services/storageService';
import { IssueCategory, IssuePriority } from '@/types';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES } from '@/lib/constants';
import ImageUpload from '@/components/features/ImageUpload';
import VoiceRecorder from '@/components/features/VoiceRecorder';
import LocationPicker from '@/components/features/LocationPicker';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReportIssuePage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [priority, setPriority] = useState<IssuePriority>('medium');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address?: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) {
      toast.error('Please log in to submit a report');
      router.push('/login');
      return;
    }

    if (!imageFile) {
      toast.error('Please upload an image of the issue');
      return;
    }

    if (!location) {
      toast.error('Please select a location on the map');
      return;
    }

    setSubmitting(true);
    try {
      // Upload image
      toast.loading('Uploading image...', { id: 'submit' });
      const imageUrl = await uploadImage(imageFile, user.uid);

      // Upload voice recording if present
      let voiceUrl: string | undefined;
      if (voiceBlob) {
        toast.loading('Uploading voice note...', { id: 'submit' });
        voiceUrl = await uploadVoiceRecording(voiceBlob, user.uid);
      }

      // Create issue
      toast.loading('Submitting report...', { id: 'submit' });
      const issueData: Record<string, unknown> = {
        userId: user.uid,
        userName: profile.displayName,
        userEmail: profile.email,
        imageUrl,
        description,
        category,
        priority,
        locationLat: location.lat,
        locationLng: location.lng,
        locationAddress: location.address,
      };
      if (voiceUrl) {
        issueData.voiceUrl = voiceUrl;
      }
      await createIssue(issueData as Parameters<typeof createIssue>[0]);

      toast.success('Issue reported successfully!', { id: 'submit' });
      router.push('/my-reports');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.', { id: 'submit' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report a Civic Issue</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Fill in the details below to report an issue in your area
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6 shadow-sm">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Issue Photo <span className="text-red-500">*</span>
            </label>
            <ImageUpload
              onImageSelect={setImageFile}
              onRemove={() => setImageFile(null)}
            />
          </div>

          {/* Location Picker */}
          <LocationPicker
            onLocationSelect={(lat, lng, address) =>
              setLocation({ lat, lng, address })
            }
          />

          {/* Category & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Issue Category"
              options={ISSUE_CATEGORIES.map((c) => ({
                value: c.value,
                label: `${c.icon} ${c.label}`,
              }))}
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
            />
            <Select
              label="Priority Level"
              options={ISSUE_PRIORITIES.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              value={priority}
              onChange={(e) => setPriority(e.target.value as IssuePriority)}
            />
          </div>

          {/* Description */}
          <Textarea
            label="Description (optional)"
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          {/* Voice Recording */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Voice Note (optional)
            </label>
            <VoiceRecorder
              onRecordingComplete={setVoiceBlob}
              onRemove={() => setVoiceBlob(null)}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={submitting} size="lg">
            <Send size={18} />
            Submit Report
          </Button>
        </div>
      </form>
    </div>
  );
}
