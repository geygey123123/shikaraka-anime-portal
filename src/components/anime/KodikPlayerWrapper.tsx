import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { voiceStatsService } from '../../services/voiceStats.service';
import { useAuth } from '../../hooks/useAuth';
import { useToastContext } from '../../contexts/ToastContext';
import { handleAPIError } from '../../utils/errorHandling';

// Kodik postMessage event types
export interface KodikMessageEvent {
  type: 'translation_change';
  translation: string;
  quality?: string;
  episode?: number;
}

// Origin validation for Kodik domains
const KODIK_ALLOWED_ORIGINS = [
  'https://kodik.biz',
  'https://kodik.info',
  'https://anime.v0e.me',
];

interface KodikPlayerWrapperProps {
  animeId: number;
  shikimoriId: number;
  animeName: string;
  onVoiceChange?: (voiceName: string) => void;
}

export const KodikPlayerWrapper: React.FC<KodikPlayerWrapperProps> = ({
  animeId,
  shikimoriId,
  animeName,
  onVoiceChange,
}) => {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToastContext();

  // Kodik player URL format with shikimori ID
  const playerUrl = `//kodik.info/find-player?shikimoriID=${shikimoriId}`;
  
  // Shikimori anime page URL as fallback
  const shikimoriUrl = `https://shikimori.one/animes/${shikimoriId}`;

  useEffect(() => {
    // PostMessage listener for Kodik iframe communication
    const handlePostMessage = async (event: MessageEvent) => {
      console.log('Received postMessage:', {
        origin: event.origin,
        data: event.data,
        type: typeof event.data,
      });

      // Security: Validate origin
      const isValidOrigin = KODIK_ALLOWED_ORIGINS.some(origin => 
        event.origin === origin || event.origin.startsWith(origin) || event.origin.includes('kodik')
      );

      if (!isValidOrigin) {
        console.warn('Rejected postMessage from unauthorized origin:', event.origin);
        return;
      }

      // Validate message format
      if (!event.data || typeof event.data !== 'object') {
        console.warn('Invalid postMessage format:', event.data);
        return;
      }

      const data = event.data as Partial<KodikMessageEvent>;

      console.log('Processing Kodik event:', data);

      // Handle translation_change event
      if (data.type === 'translation_change' && data.translation) {
        const voiceName = data.translation;
        
        console.log('Voice selection detected:', voiceName);

        // Call optional callback
        if (onVoiceChange) {
          onVoiceChange(voiceName);
        }

        // Record voice selection if user is authenticated
        if (user?.id) {
          try {
            await voiceStatsService.recordVoiceSelection({
              user_id: user.id,
              anime_id: animeId,
              voice_name: voiceName,
            });

            // Invalidate cache to show updated stats immediately
            queryClient.invalidateQueries({ queryKey: ['voiceStats', animeId] });
            
            console.log('Voice selection recorded successfully');
            toast.success('Выбор озвучки сохранён');
          } catch (error) {
            console.error('Failed to record voice selection:', error);
            const errorInfo = handleAPIError(error);
            toast.error(errorInfo.message);
          }
        } else {
          console.log('User not authenticated - voice selection not recorded');
        }
      }
    };

    // Always listen to messages, not just when iframe is loaded
    window.addEventListener('message', handlePostMessage);

    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, [animeId, user, onVoiceChange, queryClient, toast]);

  const handleRetry = () => {
    setError(false);
    setRetryCount(prev => prev + 1);
  };

  const handleIframeError = () => {
    setError(true);
  };

  if (error) {
    return (
      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center p-8">
          <AlertCircle className="w-16 h-16 text-gray-500 mb-4" />
          <p className="text-gray-300 text-center mb-2 font-medium">
            Видео временно недоступно
          </p>
          <p className="text-gray-500 text-sm text-center mb-6 max-w-md">
            Контент может быть заблокирован правообладателями или плеер временно недоступен
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff0055] text-white rounded-lg hover:bg-[#cc0044] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Попробовать другой плеер
            </button>
            
            <a
              href={shikimoriUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть на Shikimori
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
      <iframe
        ref={iframeRef}
        key={retryCount} // Force remount on retry
        src={playerUrl}
        className="absolute top-0 left-0 w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        onError={handleIframeError}
        title={`Видеоплеер для ${animeName}`}
      />
    </div>
  );
};
