import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoriteButton } from './FavoriteButton';
import * as useAuthModule from '../../hooks/useAuth';
import * as useFavoritesModule from '../../hooks/useFavorites';

// Mock the hooks
vi.mock('../../hooks/useAuth');
vi.mock('../../hooks/useFavorites');

describe('FavoriteButton Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('should not render when user is not authenticated', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    // Mock useFavorites even when not authenticated (component still calls it)
    vi.spyOn(useFavoritesModule, 'useFavorites').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as ReturnType<typeof useFavoritesModule.useFavorites>);

    vi.spyOn(useFavoritesModule, 'useAddFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useFavoritesModule.useAddFavorite>);

    vi.spyOn(useFavoritesModule, 'useRemoveFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useFavoritesModule.useRemoveFavorite>);

    const { container } = renderWithProviders(
      <FavoriteButton animeId={1} animeName="Test Anime" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render "Добавить в список" when anime is not in favorites', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', user_metadata: {} },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    vi.spyOn(useFavoritesModule, 'useFavorites').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useFavoritesModule.useFavorites>);

    vi.spyOn(useFavoritesModule, 'useAddFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useFavoritesModule.useAddFavorite>);

    vi.spyOn(useFavoritesModule, 'useRemoveFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useFavoritesModule.useRemoveFavorite>);

    renderWithProviders(
      <FavoriteButton animeId={1} animeName="Test Anime" />
    );

    expect(screen.getByText('Добавить в список')).toBeInTheDocument();
  });

  it('should render "Удалить из списка" when anime is in favorites', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', user_metadata: {} },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    vi.spyOn(useFavoritesModule, 'useFavorites').mockReturnValue({
      data: [
        {
          id: 'fav-1',
          user_id: '1',
          shikimori_id: 1,
          anime_name: 'Test Anime',
          added_at: new Date().toISOString(),
        },
      ],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useFavoritesModule.useFavorites>);

    vi.spyOn(useFavoritesModule, 'useAddFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useFavoritesModule.useFavorites>);

    vi.spyOn(useFavoritesModule, 'useRemoveFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useFavoritesModule.useFavorites>);

    renderWithProviders(
      <FavoriteButton animeId={1} animeName="Test Anime" />
    );

    expect(screen.getByText('Удалить из списка')).toBeInTheDocument();
  });

  it('should show loading state when mutations are pending', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', user_metadata: {} },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    vi.spyOn(useFavoritesModule, 'useFavorites').mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useFavoritesModule.useFavorites>);

    vi.spyOn(useFavoritesModule, 'useAddFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    } as ReturnType<typeof useFavoritesModule.useAddFavorite>);

    vi.spyOn(useFavoritesModule, 'useRemoveFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as ReturnType<typeof useFavoritesModule.useRemoveFavorite>);

    renderWithProviders(
      <FavoriteButton animeId={1} animeName="Test Anime" />
    );

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should display filled heart icon when anime is in favorites', () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { id: '1', email: 'test@example.com', user_metadata: {} },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    vi.spyOn(useFavoritesModule, 'useFavorites').mockReturnValue({
      data: [
        {
          id: 'fav-1',
          user_id: '1',
          shikimori_id: 1,
          anime_name: 'Test Anime',
          added_at: new Date().toISOString(),
        },
      ],
      isLoading: false,
      error: null,
    } as unknown as ReturnType<typeof useFavoritesModule.useFavorites>);

    vi.spyOn(useFavoritesModule, 'useAddFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useFavoritesModule.useFavorites>);

    vi.spyOn(useFavoritesModule, 'useRemoveFavorite').mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useFavoritesModule.useFavorites>);

    renderWithProviders(
      <FavoriteButton animeId={1} animeName="Test Anime" />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-[#ff0055]');
  });
});


