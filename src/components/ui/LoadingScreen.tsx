import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#ff0055] mx-auto mb-4"></div>
        <p className="text-gray-400">Загрузка...</p>
      </div>
    </div>
  );
};
