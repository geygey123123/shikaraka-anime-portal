import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { KodikPlayerWrapper } from './KodikPlayerWrapper';
import * as useAuthModule from '../../hooks/useAuth';
import * as voiceStatsServiceModule from '../../services/voiceStats.service';

describe('KodikPlayerWrapper Component', () => {
  let queryClient: QueryClient;
  let mockInvalidateQueries: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);
    queryClient.invalidateQueries = mockInvalidateQueries;

    // Mock useAuth hook
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { 
        id: 'test-user-id', 
        email: 'test@example.com',
        user_metadata: {}
      },
      loading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    // Mock voiceStatsService
    vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection').mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  const mockProps = {
    animeId: 12345,
    shikimoriId: 54321,
    animeName: 'Test Anime',
  };

  it('should render iframe with correct URL', () => {
    const { container } = renderWithProviders(<KodikPlayerWrapper {...mockProps} />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain('kodik.info/find-player');
    expect(iframe?.src).toContain('shikimoriID=54321');
  });

  it('should have 16:9 aspect ratio', () => {
    const { container } = renderWithProviders(<KodikPlayerWrapper {...mockProps} />);
    
    const wrapper = container.querySelector('div[style*="padding-bottom"]');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('style')).toContain('56.25%');
  });

  it('should have proper accessibility attributes', () => {
    const { container } = renderWithProviders(<KodikPlayerWrapper {...mockProps} />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('title')).toBe('Видеоплеер для Test Anime');
    expect(iframe?.getAttribute('allowFullScreen')).toBe('');
  });

  describe('PostMessage Security - Origin Validation', () => {
    it('should reject postMessage from unauthorized origins', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      // Wait for iframe to be loaded
      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Give time for event listener to be attached
      await new Promise(resolve => setTimeout(resolve, 50));

      // Simulate postMessage from unauthorized origin
      const unauthorizedOrigins = [
        'https://malicious-site.com',
        'https://fake-kodik.com',
        'http://kodik.biz', // Wrong protocol
      ];

      for (const origin of unauthorizedOrigins) {
        window.dispatchEvent(
          new MessageEvent('message', {
            origin,
            data: {
              type: 'translation_change',
              translation: 'Anilibria',
            },
          })
        );
      }

      // Wait for event processing
      await new Promise(resolve => setTimeout(resolve, 50));

      // Should have warned about unauthorized origins
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy.mock.calls.some(call => 
        call[0] === 'Rejected postMessage from unauthorized origin:'
      )).toBe(true);

      // Voice recording should NOT be called
      expect(recordSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should accept postMessage from authorized Kodik origins', async () => {
      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate postMessage from authorized origin
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: {
            type: 'translation_change',
            translation: 'Anilibria',
          },
        })
      );

      await waitFor(() => {
        expect(recordSpy).toHaveBeenCalledWith({
          user_id: 'test-user-id',
          anime_id: 12345,
          voice_name: 'Anilibria',
        });
      });
    });
  });

  describe('Translation Change Event Handling', () => {
    it('should handle translation_change event and record voice selection', async () => {
      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate translation_change event
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.info',
          data: {
            type: 'translation_change',
            translation: 'AniDUB',
            quality: '720p',
            episode: 5,
          },
        })
      );

      await waitFor(() => {
        expect(recordSpy).toHaveBeenCalledWith({
          user_id: 'test-user-id',
          anime_id: 12345,
          voice_name: 'AniDUB',
        });
      });
    });

    it('should invalidate cache after recording voice selection', async () => {
      vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection').mockResolvedValue();

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate translation_change event
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://anime.v0e.me',
          data: {
            type: 'translation_change',
            translation: 'Anilibria',
          },
        })
      );

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ['voiceStats', 12345],
        });
      });
    });

    it('should call onVoiceChange callback when provided', async () => {
      const onVoiceChangeMock = vi.fn();

      renderWithProviders(
        <KodikPlayerWrapper {...mockProps} onVoiceChange={onVoiceChangeMock} />
      );

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate translation_change event
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: {
            type: 'translation_change',
            translation: 'AniDUB',
          },
        })
      );

      await waitFor(() => {
        expect(onVoiceChangeMock).toHaveBeenCalledWith('AniDUB');
      });
    });

    it('should ignore messages with invalid format', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate invalid message formats
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: null,
        })
      );

      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: 'invalid string data',
        })
      );

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          'Invalid postMessage format:',
          expect.anything()
        );
      });

      expect(recordSpy).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('should ignore messages without translation data', async () => {
      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate message without translation
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: {
            type: 'translation_change',
            // Missing translation field
          },
        })
      );

      // Wait a bit to ensure no recording happens
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(recordSpy).not.toHaveBeenCalled();
    });
  });

  describe('Voice Recording Integration', () => {
    it('should not record voice selection for anonymous users', async () => {
      // Mock anonymous user
      vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
        user: null,
        loading: false,
        error: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        isAuthenticated: false,
      });

      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate translation_change event
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: {
            type: 'translation_change',
            translation: 'Anilibria',
          },
        })
      );

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          'User not authenticated - voice selection not recorded'
        );
      });

      expect(recordSpy).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should handle voice recording errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection').mockRejectedValue(
        new Error('Database error')
      );

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Simulate translation_change event
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: {
            type: 'translation_change',
            translation: 'Anilibria',
          },
        })
      );

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to record voice selection:',
          expect.any(Error)
        );
      });

      // Component should not crash
      const iframe2 = document.querySelector('iframe');
      expect(iframe2).toBeTruthy();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Iframe Load Handling', () => {
    it('should not listen to postMessage before iframe loads', async () => {
      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Don't trigger iframe load event

      // Simulate translation_change event before load
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: {
            type: 'translation_change',
            translation: 'Anilibria',
          },
        })
      );

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not record because iframe hasn't loaded
      expect(recordSpy).not.toHaveBeenCalled();
    });

    it('should start listening after iframe loads', async () => {
      const recordSpy = vi.spyOn(voiceStatsServiceModule.voiceStatsService, 'recordVoiceSelection');

      renderWithProviders(<KodikPlayerWrapper {...mockProps} />);

      // Simulate iframe load
      const iframe = document.querySelector('iframe');
      if (iframe) {
        iframe.dispatchEvent(new Event('load'));
      }

      await waitFor(() => {
        expect(iframe).toBeTruthy();
      });

      // Now simulate translation_change event
      window.dispatchEvent(
        new MessageEvent('message', {
          origin: 'https://kodik.biz',
          data: {
            type: 'translation_change',
            translation: 'Anilibria',
          },
        })
      );

      await waitFor(() => {
        expect(recordSpy).toHaveBeenCalled();
      });
    });
  });
});
