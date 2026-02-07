import React, { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUpload: (file: File) => Promise<void>;
  isUploading?: boolean;
}

/**
 * AvatarUpload Component
 * Handles avatar file upload with drag-and-drop, preview, and validation
 */
export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onUpload,
  isUploading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_SIZE = 2 * 1024 * 1024; // 2MB

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Неподдерживаемый формат. Используйте JPG, PNG или WebP.';
    }

    if (file.size > MAX_SIZE) {
      return 'Файл слишком большой. Максимум 2MB.';
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      await onUpload(file);
      // Clear preview after successful upload - the new avatar will come from currentAvatarUrl
      setPreview(null);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
      setPreview(null);
      // Clear file input on error too
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = preview || currentAvatarUrl;

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
            {displayUrl ? (
              <img
                key={displayUrl} // Force re-render when URL changes
                src={displayUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <User size={48} className="text-gray-600" />
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff0055]"></div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging ? 'border-[#ff0055] bg-[#ff0055]/5' : 'border-gray-700 hover:border-gray-600'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />

        <Upload className="mx-auto mb-3 text-gray-400" size={32} />
        
        <p className="text-sm text-gray-300 mb-1">
          Перетащите изображение или нажмите для выбора
        </p>
        <p className="text-xs text-gray-500">
          JPG, PNG или WebP (макс. 2MB)
        </p>

        {preview && !isUploading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleClearPreview();
            }}
            className="mt-3"
          >
            <X size={16} className="mr-1" />
            Отменить
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
          <p className="text-sm text-blue-400">Загрузка...</p>
        </div>
      )}
    </div>
  );
};
