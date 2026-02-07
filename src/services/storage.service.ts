import { supabase } from './supabase';
import { checkRateLimit } from './rateLimit.service';

class StorageService {
  private readonly BUCKET_NAME = 'avatars';
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  /**
   * Upload or update a user's avatar
   * @param userId - User ID
   * @param file - Image file to upload
   * @returns Public URL of the uploaded avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    // Check rate limit for profile updates
    await checkRateLimit(userId, 'profile_update');

    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error('Файл слишком большой. Максимум 2MB.');
    }

    // Validate file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Неподдерживаемый формат. Используйте JPG, PNG или WebP.');
    }

    // Delete old avatar files first (all possible extensions)
    await this.deleteOldAvatars(userId);

    // Generate filename using user_id and file extension
    const extension = this.getFileExtension(file.type);
    const filename = `${userId}.${extension}`;

    // Upload to Supabase Storage (upsert: true will overwrite existing file)
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filename, file, {
        cacheControl: '0', // Disable caching to show new avatar immediately
        upsert: true, // Overwrite existing file with same name
      });

    if (error) throw error;

    // Get public URL with cache-busting timestamp
    const { data: urlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filename);

    // Add timestamp to bust cache
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Update profile with avatar_url
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  }

  /**
   * Get file extension from MIME type
   * @param mimeType - MIME type of the file
   * @returns File extension
   */
  private getFileExtension(mimeType: string): string {
    const typeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    return typeMap[mimeType] || 'jpg';
  }

  /**
   * Delete old avatar files for a user (all possible extensions)
   * @param userId - User ID
   */
  private async deleteOldAvatars(userId: string): Promise<void> {
    const extensions = ['jpg', 'png', 'webp', 'jpeg'];
    const filesToDelete: string[] = [];

    // Check which files exist
    for (const ext of extensions) {
      const filename = `${userId}.${ext}`;
      const { data } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list('', {
          search: filename,
        });

      if (data && data.length > 0) {
        filesToDelete.push(filename);
      }
    }

    // Delete all found files
    if (filesToDelete.length > 0) {
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(filesToDelete);
    }
  }

  /**
   * Delete a user's avatar
   * @param userId - User ID
   */
  async deleteAvatar(userId: string): Promise<void> {
    // Get current avatar URL to extract filename
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', userId)
      .single();

    if (!profile?.avatar_url) {
      return; // No avatar to delete
    }

    // Extract filename from URL
    const urlParts = profile.avatar_url.split('/');
    const filename = urlParts[urlParts.length - 1];

    // Delete from storage
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filename]);

    if (error) throw error;

    // Update profile to remove avatar_url
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId);

    if (updateError) throw updateError;
  }
}

export const storageService = new StorageService();
