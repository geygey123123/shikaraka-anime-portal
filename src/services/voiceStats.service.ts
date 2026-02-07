import { supabase } from './supabase';
import { retryWithBackoff } from '../utils/errorHandling';

export interface VoiceSelection {
  user_id: string | null;
  anime_id: number;
  voice_name: string;
}

export interface VoiceStats {
  voice_name: string;
  count: number;
  percentage: number;
}

export interface VoiceStatsRecord {
  id: string;
  user_id: string | null;
  anime_id: number;
  voice_name: string;
  updated_at: string;
}

class VoiceStatsService {
  /**
   * Record or update a user's voice selection for an anime
   * Uses UPSERT to maintain uniqueness on (user_id, anime_id)
   */
  async recordVoiceSelection(selection: VoiceSelection): Promise<void> {
    const { user_id, anime_id, voice_name } = selection;

    // Check if user is authenticated (don't retry this check)
    if (!user_id) {
      throw new Error('Войдите в систему, чтобы сохранить выбор озвучки.');
    }

    return retryWithBackoff(async () => {
      // Upsert the voice selection
      const { error } = await supabase
        .from('voice_stats')
        .upsert(
          {
            user_id,
            anime_id,
            voice_name,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,anime_id',
          }
        );

      if (error) {
        throw new Error(`Не удалось сохранить выбор озвучки: ${error.message}`);
      }
    });
  }

  /**
   * Get aggregated voice statistics for an anime
   * Returns stats sorted by popularity (descending count)
   */
  async getVoiceStats(animeId: number): Promise<VoiceStats[]> {
    return retryWithBackoff(async () => {
      // Get all voice selections for this anime
      const { data, error } = await supabase
        .from('voice_stats')
        .select('voice_name')
        .eq('anime_id', animeId);

      if (error) {
        throw new Error(`Не удалось загрузить статистику озвучек: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Aggregate counts by voice_name
      const voiceCounts = data.reduce((acc, record) => {
        const voiceName = record.voice_name;
        acc[voiceName] = (acc[voiceName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate total selections
      const totalSelections = data.length;

      // Convert to VoiceStats array with percentages
      const stats: VoiceStats[] = Object.entries(voiceCounts).map(
        ([voice_name, count]) => ({
          voice_name,
          count,
          percentage: (count / totalSelections) * 100,
        })
      );

      // Sort by count descending (most popular first)
      stats.sort((a, b) => b.count - a.count);

      return stats;
    });
  }

  /**
   * Get a user's voice selection for a specific anime
   */
  async getUserVoiceSelection(
    userId: string,
    animeId: number
  ): Promise<string | null> {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from('voice_stats')
        .select('voice_name')
        .eq('user_id', userId)
        .eq('anime_id', animeId)
        .single();

      if (error) {
        // If no record found, return null (not an error)
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new Error(`Не удалось загрузить выбор озвучки: ${error.message}`);
      }

      return data?.voice_name || null;
    });
  }
}

export const voiceStatsService = new VoiceStatsService();
