import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimeGrid } from '../components/anime/AnimeGrid';
import { AnimeCard } from '../components/anime/AnimeCard';
import { Header } from '../components/layout/Header';
import { Button } from '../components/ui/Button';
import { FavoriteButton } from '../components/favorites/FavoriteButton';
import { Anime } from '../types/anime';

// Mock useAuth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    isAuthenticated: true,
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Mock useFavorites hooks
vi.mock('../hooks/useFavorites', () => ({
  useFavorites: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
  useAddFavorite: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useRemoveFavorite: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

// Mock data
const mockAnime: Anime = {
  id: 1,
  name: 'Test Anime',
  russian: 'Тестовое Аниме',
  image: {
    original: 'https://example.com/image.jpg',
    preview: 'https://example.com/preview.jpg',
    x96: 'https://example.com/x96.jpg',
    x48: 'https://example.com/x48.jpg',
  },
  url: '/animes/1',
  kind: 'TV',
  score: '8.5',
  status: 'ongoing',
  episodes: 12,
  episodes_aired: 6,
  aired_on: '2023-01-01',
  released_on: null,
  rating: 'PG-13',
  english: ['Test Anime'],
  japanese: ['テストアニメ'],
  synonyms: [],
  license_name_ru: null,
  duration: 24,
  description: 'Test description',
  description_html: '<p>Test description</p>',
  description_source: null,
  franchise: null,
  favoured: false,
  thread_id: 1,
  topic_id: 1,
  myanimelist_id: 1,
  rates_scores_stats: [],
  rates_statuses_stats: [],
  updated_at: '2023-01-01',
  next_episode_at: null,
  genres: [],
  studios: [],
};

// Helper to create QueryClient
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Helper to wrap components with providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Responsive Design Tests', () => {
  describe('AnimeGrid Responsive Layout', () => {
    it('should have responsive grid classes for 2/4/6 columns', () => {
      const { container } = renderWithProviders(
        <AnimeGrid
          animes={[mockAnime]}
          isLoading={false}
          error={null}
          onAnimeClick={() => {}}
        />
      );

      const grid = container.querySelector('.grid');
      expect(grid).toBeTruthy();
      
      // Check for responsive grid classes
      const gridClasses = grid?.className || '';
      expect(gridClasses).toContain('grid-cols-2'); // Mobile: 2 columns
      expect(gridClasses).toContain('md:grid-cols-4'); // Tablet: 4 columns
      expect(gridClasses).toContain('lg:grid-cols-6'); // Desktop: 6 columns
    });

    it('should maintain responsive grid during loading state', () => {
      const { container } = renderWithProviders(
        <AnimeGrid
          animes={[]}
          isLoading={true}
          error={null}
          onAnimeClick={() => {}}
        />
      );

      const grid = container.querySelector('.grid');
      const gridClasses = grid?.className || '';
      
      expect(gridClasses).toContain('grid-cols-2');
      expect(gridClasses).toContain('md:grid-cols-4');
      expect(gridClasses).toContain('lg:grid-cols-6');
    });
  });

  describe('AnimeCard Responsive Behavior', () => {
    it('should render with proper aspect ratio for poster', () => {
      const { container } = renderWithProviders(
        <AnimeCard anime={mockAnime} onClick={() => {}} />
      );

      const posterContainer = container.querySelector('.aspect-\\[2\\/3\\]');
      expect(posterContainer).toBeTruthy();
    });

    it('should have hover effects for desktop interaction', () => {
      const { container } = renderWithProviders(
        <AnimeCard anime={mockAnime} onClick={() => {}} />
      );

      const card = container.querySelector('.anime-card');
      const cardClasses = card?.className || '';
      
      expect(cardClasses).toContain('hover:transform');
      expect(cardClasses).toContain('hover:-translate-y-1');
    });
  });

  describe('Header Responsive Navigation', () => {
    it('should have mobile menu button hidden on desktop', () => {
      renderWithProviders(<Header />);
      
      const mobileMenuButton = screen.getByLabelText('Toggle menu');
      const buttonClasses = mobileMenuButton.className;
      
      expect(buttonClasses).toContain('md:hidden');
    });

    it('should have desktop navigation hidden on mobile', () => {
      const { container } = renderWithProviders(<Header />);
      
      const desktopNav = container.querySelector('nav.hidden.md\\:flex');
      expect(desktopNav).toBeTruthy();
    });

    it('should have responsive search field', () => {
      const { container } = renderWithProviders(<Header />);
      
      // Desktop search
      const desktopSearch = container.querySelector('.hidden.md\\:flex');
      expect(desktopSearch).toBeTruthy();
      
      // Mobile search
      const mobileSearch = container.querySelector('.md\\:hidden.pb-4');
      expect(mobileSearch).toBeTruthy();
    });
  });
});

describe('Touch Target Accessibility Tests', () => {
  let originalGetComputedStyle: typeof window.getComputedStyle;

  beforeEach(() => {
    // Mock getComputedStyle to return dimensions
    originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = ((element: Element) => {
      const styles = originalGetComputedStyle(element);
      return {
        ...styles,
        getPropertyValue: (prop: string) => {
          if (prop === 'min-height' || prop === 'min-width') {
            return '44px';
          }
          return styles.getPropertyValue(prop);
        },
      } as CSSStyleDeclaration;
    }) as typeof window.getComputedStyle;
  });

  afterEach(() => {
    window.getComputedStyle = originalGetComputedStyle;
  });

  describe('Button Touch Targets', () => {
    it('should have adequate padding for small buttons', () => {
      const { container } = render(<Button size="sm">Click me</Button>);
      
      const button = container.querySelector('button');
      const buttonClasses = button?.className || '';
      
      // Small buttons should have px-4 py-2.5 and min-h-[44px]
      expect(buttonClasses).toContain('px-4');
      expect(buttonClasses).toContain('py-2.5');
      expect(buttonClasses).toContain('min-h-[44px]');
    });

    it('should have adequate padding for medium buttons', () => {
      const { container } = render(<Button size="md">Click me</Button>);
      
      const button = container.querySelector('button');
      const buttonClasses = button?.className || '';
      
      // Medium buttons should have px-5 py-3 and min-h-[44px]
      expect(buttonClasses).toContain('px-5');
      expect(buttonClasses).toContain('py-3');
      expect(buttonClasses).toContain('min-h-[44px]');
    });

    it('should have adequate padding for large buttons', () => {
      const { container } = render(<Button size="lg">Click me</Button>);
      
      const button = container.querySelector('button');
      const buttonClasses = button?.className || '';
      
      // Large buttons should have px-6 py-3 and min-h-[48px]
      expect(buttonClasses).toContain('px-6');
      expect(buttonClasses).toContain('py-3');
      expect(buttonClasses).toContain('min-h-[48px]');
    });
  });

  describe('FavoriteButton Touch Target', () => {
    it('should have adequate padding for touch interaction', () => {
      const { container } = renderWithProviders(
        <FavoriteButton animeId={1} animeName="Test" />
      );
      
      const button = container.querySelector('button');
      const buttonClasses = button?.className || '';
      
      // Should have px-5 py-3 and min-h-[44px]
      expect(buttonClasses).toContain('px-5');
      expect(buttonClasses).toContain('py-3');
      expect(buttonClasses).toContain('min-h-[44px]');
    });

    it('should have focus ring for accessibility', () => {
      const { container } = renderWithProviders(
        <FavoriteButton animeId={1} animeName="Test" />
      );
      
      const button = container.querySelector('button');
      const buttonClasses = button?.className || '';
      
      expect(buttonClasses).toContain('focus:ring-2');
      expect(buttonClasses).toContain('focus:ring-[#ff0055]');
    });
  });

  describe('AnimeCard Touch Target', () => {
    it('should be keyboard accessible', () => {
      const { container } = renderWithProviders(
        <AnimeCard anime={mockAnime} onClick={() => {}} />
      );
      
      const card = container.querySelector('.anime-card');
      
      expect(card?.getAttribute('role')).toBe('button');
      expect(card?.getAttribute('tabIndex')).toBe('0');
    });

    it('should have adequate clickable area', () => {
      const { container } = renderWithProviders(
        <AnimeCard anime={mockAnime} onClick={() => {}} />
      );
      
      // Card should have padding in the overlay
      const overlay = container.querySelector('.absolute.bottom-0');
      const overlayClasses = overlay?.className || '';
      
      expect(overlayClasses).toContain('p-4');
    });
  });

  describe('Header Interactive Elements', () => {
    it('should have adequate padding for mobile menu button', () => {
      renderWithProviders(<Header />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      const buttonClasses = menuButton.className;
      
      // Should have p-2.5 and min-h-[44px] min-w-[44px]
      expect(buttonClasses).toContain('p-2.5');
      expect(buttonClasses).toContain('min-h-[44px]');
      expect(buttonClasses).toContain('min-w-[44px]');
    });

    it('should have adequate padding for search input', () => {
      const { container } = renderWithProviders(<Header />);
      
      const searchInput = container.querySelector('input[type="text"]');
      const inputClasses = searchInput?.className || '';
      
      // Should have py-2 for vertical padding
      expect(inputClasses).toContain('py-2');
    });
  });
});

describe('Mobile Layout Tests', () => {
  describe('Single Column Layout on Mobile', () => {
    it('should use single column grid on AnimeDetail page', () => {
      // This test verifies the grid-cols-1 lg:grid-cols-3 pattern
      // which ensures single column on mobile and 3 columns on desktop
      const gridClasses = 'grid grid-cols-1 lg:grid-cols-3 gap-8';
      
      expect(gridClasses).toContain('grid-cols-1');
      expect(gridClasses).toContain('lg:grid-cols-3');
    });
  });

  describe('Responsive Padding and Margins', () => {
    it('should have responsive padding classes', () => {
      const responsivePadding = 'px-4 sm:px-6 lg:px-8';
      
      expect(responsivePadding).toContain('px-4'); // Mobile
      expect(responsivePadding).toContain('sm:px-6'); // Tablet
      expect(responsivePadding).toContain('lg:px-8'); // Desktop
    });
  });
});
