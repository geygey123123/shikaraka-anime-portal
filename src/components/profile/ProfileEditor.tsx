import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { AvatarUpload } from './AvatarUpload';
import { useUpdateProfile, useUploadAvatar } from '../../hooks/useAdmin';
import { parseRateLimitError, logSuspiciousActivity } from '../../utils/rateLimit';
import { useAuth } from '../../hooks/useAuth';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface ProfileEditorProps {
  profile: Profile;
  onCancel?: () => void;
}

/**
 * ProfileEditor Component
 * Form for editing user profile including username, bio, and avatar
 */
export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onCancel }) => {
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [errors, setErrors] = useState<{ username?: string; bio?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateUsername = (value: string): string | undefined => {
    if (value.length === 0) {
      return undefined; // Username is optional
    }

    if (value.length < 3) {
      return 'Имя пользователя должно содержать минимум 3 символа';
    }

    if (value.length > 20) {
      return 'Имя пользователя должно содержать максимум 20 символов';
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Имя пользователя может содержать только буквы, цифры и подчеркивание';
    }

    return undefined;
  };

  const validateBio = (value: string): string | undefined => {
    if (value.length > 500) {
      return 'Биография должна содержать максимум 500 символов';
    }

    return undefined;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    const error = validateUsername(value);
    setErrors((prev) => ({ ...prev, username: error }));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBio(value);
    
    const error = validateBio(value);
    setErrors((prev) => ({ ...prev, bio: error }));
  };

  const handleSave = async () => {
    // Validate all fields
    const usernameError = validateUsername(username);
    const bioError = validateBio(bio);

    if (usernameError || bioError) {
      setErrors({ username: usernameError, bio: bioError });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        username: username || undefined,
        bio: bio || undefined,
      });

      setSuccessMessage('Профиль успешно обновлен');
      setErrors({});
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Parse and handle rate limiting errors
      const parsed = parseRateLimitError(error.message || '');
      
      if (parsed.isRateLimit) {
        // Log suspicious activity
        logSuspiciousActivity(user?.id || null, 'profile_update', {
          remainingMinutes: parsed.remainingMinutes,
        });
        
        setErrors({ username: parsed.message });
      } else {
        setErrors({ username: 'Ошибка при сохранении профиля' });
      }
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      await uploadAvatar.mutateAsync(file);
      setSuccessMessage('Аватар успешно загружен');
    } catch (error) {
      throw error; // Let AvatarUpload component handle the error display
    }
  };

  const hasChanges = 
    username !== (profile.username || '') || 
    bio !== (profile.bio || '');

  const hasErrors = Object.values(errors).some((error) => error !== undefined);

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Аватар
        </label>
        <AvatarUpload
          currentAvatarUrl={profile.avatar_url}
          onUpload={handleAvatarUpload}
          isUploading={uploadAvatar.isPending}
        />
      </div>

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
          Имя пользователя
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Введите имя пользователя"
          className={`
            w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500
            focus:outline-none focus:ring-2 transition-colors
            ${errors.username 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-700 focus:border-[#ff0055] focus:ring-[#ff0055]'
            }
          `}
        />
        {errors.username && (
          <p className="mt-1 text-sm text-red-400">{errors.username}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          3-20 символов, только буквы, цифры и подчеркивание
        </p>
      </div>

      {/* Bio Field */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">
          О себе
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={handleBioChange}
          placeholder="Расскажите о себе..."
          rows={4}
          className={`
            w-full px-4 py-2 bg-gray-900 border rounded-lg text-white placeholder-gray-500
            focus:outline-none focus:ring-2 transition-colors resize-none
            ${errors.bio 
              ? 'border-red-500 focus:ring-red-500' 
              : 'border-gray-700 focus:border-[#ff0055] focus:ring-[#ff0055]'
            }
          `}
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-400">{errors.bio}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {bio.length}/500 символов
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
          <p className="text-sm text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!hasChanges || hasErrors || updateProfile.isPending}
          className="flex-1"
        >
          {updateProfile.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Сохранение...
            </>
          ) : (
            <>
              <Save size={16} className="mr-2" />
              Сохранить
            </>
          )}
        </Button>

        {onCancel && (
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={updateProfile.isPending}
          >
            <X size={16} className="mr-2" />
            Отменить
          </Button>
        )}
      </div>
    </div>
  );
};
