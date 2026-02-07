import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RatingInput } from './RatingInput';

describe('RatingInput Component', () => {
  const mockOnRate = vi.fn();

  it('should render 10 star buttons', () => {
    render(<RatingInput animeId={1} onRate={mockOnRate} />);
    
    const stars = screen.getAllByRole('radio');
    expect(stars).toHaveLength(10);
  });

  it('should highlight current rating', () => {
    render(<RatingInput animeId={1} currentRating={7} onRate={mockOnRate} />);
    
    const stars = screen.getAllByRole('radio');
    // First 7 stars should be filled
    for (let i = 0; i < 7; i++) {
      expect(stars[i].querySelector('svg')).toHaveAttribute('fill', '#ff0055');
    }
  });

  it('should call onRate when star is clicked', () => {
    render(<RatingInput animeId={1} onRate={mockOnRate} />);
    
    const stars = screen.getAllByRole('radio');
    fireEvent.click(stars[4]); // Click 5th star (rating 5)
    
    expect(mockOnRate).toHaveBeenCalledWith(5);
  });

  it('should show hover preview', () => {
    render(<RatingInput animeId={1} onRate={mockOnRate} />);
    
    const stars = screen.getAllByRole('radio');
    fireEvent.mouseEnter(stars[7]); // Hover over 8th star
    
    // First 8 stars should be highlighted on hover
    for (let i = 0; i < 8; i++) {
      expect(stars[i].querySelector('svg')).toHaveAttribute('fill', '#ff0055');
    }
  });

  it('should be disabled when disabled prop is true', () => {
    render(<RatingInput animeId={1} onRate={mockOnRate} disabled />);
    
    const stars = screen.getAllByRole('radio');
    stars.forEach(star => {
      expect(star).toBeDisabled();
    });
  });
});
