import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import VideoPlayer from './VideoPlayer';

describe('VideoPlayer Component', () => {
  const mockProps = {
    shikimoriId: 12345,
    animeName: 'Test Anime',
  };

  it('should render iframe with correct URL', () => {
    const { container } = render(<VideoPlayer {...mockProps} />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe?.src).toContain('kodik.info/find-player');
    expect(iframe?.src).toContain('shikimoriID=12345');
  });

  it('should have 16:9 aspect ratio', () => {
    const { container } = render(<VideoPlayer {...mockProps} />);
    
    const wrapper = container.querySelector('div[style*="padding-bottom"]');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.getAttribute('style')).toContain('56.25%'); // 16:9 ratio
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(<VideoPlayer {...mockProps} />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('title')).toBe('Видеоплеер для Test Anime');
    expect(iframe?.getAttribute('allowFullScreen')).toBe('');
  });

  it('should allow autoplay and fullscreen', () => {
    const { container } = render(<VideoPlayer {...mockProps} />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe?.getAttribute('allow')).toContain('autoplay');
    expect(iframe?.getAttribute('allow')).toContain('fullscreen');
    expect(iframe?.getAttribute('allow')).toContain('picture-in-picture');
  });

  it('should have rounded corners and proper styling', () => {
    const { container } = render(<VideoPlayer {...mockProps} />);
    
    const wrapper = container.querySelector('.rounded-lg');
    expect(wrapper).toBeTruthy();
    expect(wrapper?.className).toContain('bg-gray-900');
  });

  it('should generate correct Shikimori URL for different IDs', () => {
    const { container: container1 } = render(<VideoPlayer shikimoriId={999} animeName="Anime 1" />);
    const iframe1 = container1.querySelector('iframe');
    expect(iframe1?.src).toContain('shikimoriID=999');

    const { container: container2 } = render(<VideoPlayer shikimoriId={54321} animeName="Anime 2" />);
    const iframe2 = container2.querySelector('iframe');
    expect(iframe2?.src).toContain('shikimoriID=54321');
  });
});
