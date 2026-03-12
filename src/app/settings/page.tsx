'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { updateUserProfile } from '@/services/authService';
import { uploadProfilePhoto } from '@/services/storageService';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Camera, Save, Loader2, User, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

const INDIAN_LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi (हिन्दी)' },
  { value: 'bengali', label: 'Bengali (বাংলা)' },
  { value: 'telugu', label: 'Telugu (తెలుగు)' },
  { value: 'marathi', label: 'Marathi (मराठी)' },
  { value: 'tamil', label: 'Tamil (தமிழ்)' },
  { value: 'urdu', label: 'Urdu (اردو)' },
  { value: 'gujarati', label: 'Gujarati (ગુજરાતી)' },
  { value: 'kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'odia', label: 'Odia (ଓଡ଼ିଆ)' },
  { value: 'malayalam', label: 'Malayalam (മലയാളം)' },
];

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('english');
  const [photoUrl, setPhotoUrl] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setPhone(profile.phone || '');
      setLanguage(profile.language || 'english');
      setPhotoUrl(profile.photoUrl || '');
    }
  }, [profile]);

  if (!user || !profile) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const url = await uploadProfilePhoto(file, user.uid);
      setPhotoUrl(url);
      
      // Save it right away
      await updateUserProfile(user.uid, { photoUrl: url });
      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    try {
      setIsSaving(true);
      await updateUserProfile(user.uid, {
        displayName,
        phone,
        language,
      });
      toast.success('Profile updated successfully');
      
      // Note: We don't implement full i18n translation here, just store the preference
      if (language !== profile.language) {
        toast.success(`Language preference set to ${INDIAN_LANGUAGES.find(l => l.value === language)?.label}`, {
          icon: '🌐',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information</p>
          </CardHeader>
          <CardBody>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Photo Upload area */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {isUploadingPhoto ? (
                    <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-md">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                    </div>
                  ) : photoUrl ? (
                    <div className="relative w-32 h-32 border-4 border-white dark:border-gray-700 shadow-md rounded-full overflow-hidden">
                      <Image 
                        src={photoUrl} 
                        alt="Profile" 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-md">
                      <User size={48} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors disabled:opacity-50"
                  >
                    <Camera size={18} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  JPG, GIF or PNG. Max 5MB.
                </p>
              </div>

              {/* Form fields */}
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input value={user.email || ''} disabled className="bg-gray-50 dark:bg-gray-900" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email address cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name
                  </label>
                  <Input 
                    value={displayName} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                    placeholder="E.g., Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number (Optional)
                  </label>
                  <Input 
                    value={phone} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Preferences Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Preferences</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your app experience</p>
          </CardHeader>
          <CardBody className="space-y-6">
            
            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Language
              </label>
              <Select
                options={INDIAN_LANGUAGES}
                value={language}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                className="max-w-xs"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                This sets your preferred communication language. Note: translation of all UI text requires future updates.
              </p>
            </div>

            <hr className="border-gray-100 dark:border-gray-700" />

            {/* Theme Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Appearance
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={20} className="text-amber-500" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Switch to Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={20} className="text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">Switch to Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </CardBody>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-4 mt-6">
          <Button 
            onClick={handleSaveProfile} 
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
