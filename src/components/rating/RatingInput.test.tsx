import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RatingInput } from './RatingInput';

describe('RatingInput', () => {
  it('renders 10 star buttons', () => {
    const onRate = vi.fn();
    render(<RatingInput animeId={1} onRate={onRate} />);
    
    const buttons = screen.getAllByRole('radio');
    expect(buttons).toHaveLength(10);
  });

  it('calls onRate when star is clicked', () => {
    const onRate = vi.fn();
    render(<RatingInput animeId={1} onRate={onRate} />);
    
    const buttons = screen.getAllByRole('radio');
    fireEvent.click(buttons[4]); // Click 5th star (rating 5)
    
    expect(onRate).toHaveBeenCalledWith(5);
  });

  it('highlights current rating', () => {
    const onRate = vi.fn();
    render(<RatingInput animeId={1} currentRating={7} onRate={onRate} />);
    
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('shows hover preview', () => {
    const onRate = vi.fn();
    render(<RatingInput animeId={1} onRate={onRate} />);
    
    const buttons = screen.getAllByRole('radio');
    fireEvent.mouseEnter(buttons[8]); // Hover over 9th star
    
    expect(screen.getByText('9/10')).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', () => {
    const onRate = vi.fn();
    render(<RatingInput animeId={1} onRate={onRate} disabled={true} />);
    
    const buttons = screen.getAllByRole('radio');
    fireEvent.click(buttons[4]);
    
    expect(onRate).not.toHaveBeenCalled();
    expect(buttons[0]).toBeDisabled();
  });

  it('displays helper text based on rating state', () => {
    const onRate = vi.fn();
    const { rerender } = render(<RatingInput animeId={1} onRate={onRate} />);
    
    expect(screen.getByText('Нажмите на звезду, чтобы оценить')).toBeInTheDocument();
    
    rerender(<RatingInput animeId={1} currentRating={5} onRate={onRate} />);
    expect(screen.getByText('Нажмите на звезду, чтобы изменить оценку')).toBeInTheDocument();
  });
});
