import React, { useState } from 'react';
import { AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  shikimoriId: number;
  animeName: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ shikimoriId, animeName }) => {
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Kodik player URL format with shikimori ID
  const playerUrl = `//kodik.info/find-player?shikimoriID=${shikimoriId}`;
  
  // Shikimori anime page URL as fallback
  const shikimoriUrl = `https://shikimori.one/animes/${shikimoriId}`;

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

export default VideoPlayer;
