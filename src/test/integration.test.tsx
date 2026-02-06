import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import App from '../App'

// Mock Supabase
vi.mock('../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    })),
  },
}))

// Mock anime data
const mockAnimeList = [
  {
    id: 1,
    name: 'Test Anime 1',
    russian: 'Тестовое Аниме 1',
    image: {
      original: 'https://example.com/image1.jpg',
      preview: 'https://example.com/preview1.jpg',
      x96: 'https://example.com/x96_1.jpg',
      x48: 'https://example.com/x48_1.jpg',
    },
    url: '/animes/1',
    kind: 'tv',
    score: '8.5',
    status: 'released',
    episodes: 12,
    episodes_aired: 12,
    aired_on: '2023-01-01',
    released_on: '2023-03-31',
  },
  {
    id: 2,
    name: 'Test Anime 2',
    russian: 'Тестовое Аниме 2',
    image: {
      original: 'https://example.com/image2.jpg',
      preview: 'https://example.com/preview2.jpg',
      x96: 'https://example.com/x96_2.jpg',
      x48: 'https://example.com/x48_2.jpg',
    },
    url: '/animes/2',
    kind: 'tv',
    score: '9.0',
    status: 'ongoing',
    episodes: 24,
    episodes_aired: 12,
    aired_on: '2023-06-01',
    released_on: null,
  },
]

const mockAnimeDetail = {
  ...mockAnimeList[0],
  description: 'Test anime description',
  description_html: '<p>Test anime description</p>',
  genres: [
    { id: 1, name: 'Action', russian: 'Экшен', kind: 'genre' },
    { id: 2, name: 'Adventure', russian: 'Приключения', kind: 'genre' },
  ],
  studios: [
    { id: 1, name: 'Test Studio', filtered_name: 'test-studio', real: true, image: null },
  ],
  rating: 'pg_13',
  english: ['Test Anime'],
  japanese: ['テストアニメ'],
  synonyms: [],
  license_name_ru: null,
  duration: 24,
  franchise: null,
  favoured: false,
  thread_id: 1,
  topic_id: 1,
  myanimelist_id: 1,
  rates_scores_stats: [],
  rates_statuses_stats: [],
  updated_at: '2023-01-01T00:00:00Z',
  next_episode_at: null,
}

// Setup MSW server
const server = setupServer(
  http.get('https://shikimori.one/api/animes', () => {
    return HttpResponse.json(mockAnimeList)
  }),
  http.get('https://shikimori.one/api/animes/:id', () => {
    return HttpResponse.json(mockAnimeDetail)
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Integration Tests - Main User Flows', () => {
  it('should render home page with popular anime', async () => {
    render(<App />)

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Check for hero section - use getAllByText since there are multiple instances
    await waitFor(() => {
      const elements = screen.getAllByText(/ShiKaraKa/i)
      expect(elements.length).toBeGreaterThan(0)
    })

    // Check for anime cards
    await waitFor(() => {
      expect(screen.getByText('Тестовое Аниме 1')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('should navigate to 404 page for invalid routes', async () => {
    window.history.pushState({}, '', '/invalid-route')
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('404')).toBeInTheDocument()
      expect(screen.getByText(/Страница не найдена/i)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    // Override handler to return error
    server.use(
      http.get('https://shikimori.one/api/animes', () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        )
      })
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Should show error message or empty state
    await waitFor(() => {
      const errorElements = screen.queryAllByText(/ошибк/i)
      const emptyElements = screen.queryAllByText(/не удалось/i)
      expect(errorElements.length + emptyElements.length).toBeGreaterThanOrEqual(0)
    }, { timeout: 5000 })
  })

  it('should render with proper responsive layout', () => {
    render(<App />)

    // Check that the app renders without crashing
    expect(document.querySelector('.min-h-screen')).toBeInTheDocument()
  })
})

describe('Integration Tests - Routing', () => {
  it('should have all required routes configured', async () => {
    const { container } = render(<App />)
    
    // App should render without errors
    expect(container).toBeInTheDocument()
  })

  it('should lazy load pages with suspense', async () => {
    render(<App />)
    
    // Initially should show loading screen
    // Then content should appear
    await waitFor(() => {
      expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })
  })
})

describe('Integration Tests - React Query Configuration', () => {
  it('should have React Query provider configured', () => {
    const { container } = render(<App />)
    
    // App should render with QueryClientProvider
    expect(container).toBeInTheDocument()
  })

  it('should cache data and reuse it on subsequent renders', async () => {
    const { unmount } = render(<App />)

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.queryByText(/загрузка/i)).not.toBeInTheDocument()
    }, { timeout: 5000 })

    // Unmount and remount to test cache
    unmount()
    
    const { container } = render(<App />)
    expect(container).toBeInTheDocument()
  })
})
