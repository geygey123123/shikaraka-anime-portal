import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isLoading) {
      return;
    }
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Call the page change handler
    onPageChange(page);
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-center gap-4 mt-8 mb-8">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={isFirstPage || isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg 
                   hover:bg-gray-700 transition-colors duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800
                   focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:ring-offset-2 focus:ring-offset-[#0a0a0c]
                   min-h-[44px]"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-5 h-5" />
        <span className="hidden sm:inline">Предыдущая</span>
      </button>

      {/* Page Info */}
      <div className="flex items-center gap-2 text-gray-400">
        <span className="text-sm sm:text-base">
          Страница <span className="text-white font-semibold">{currentPage}</span> из{' '}
          <span className="text-white font-semibold">{totalPages}</span>
        </span>
      </div>

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={isLastPage || isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg 
                   hover:bg-gray-700 transition-colors duration-200 
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800
                   focus:outline-none focus:ring-2 focus:ring-[#ff0055] focus:ring-offset-2 focus:ring-offset-[#0a0a0c]
                   min-h-[44px]"
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Следующая</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};
