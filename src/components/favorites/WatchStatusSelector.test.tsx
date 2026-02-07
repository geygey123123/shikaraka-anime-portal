import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WatchStatusSelector } from './WatchStatusSelector';

describe('WatchStatusSelector Component', () => {
  const mockOnStatusChange = vi.fn();

  it('should render all watch status options', () => {
    render(
      <WatchStatusSelector
        animeId={1}
        currentStatus="plan_to_watch"
        onStatusChange={mockOnStatusChange}
      />
    );
    
    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Смотрю')).toBeInTheDocument();
    expect(screen.getByText('Планирую')).toBeInTheDocument();
    expect(screen.getByText('Завершено')).toBeInTheDocument();
    expect(screen.getByText('Брошено')).toBeInTheDocument();
    expect(screen.getByText('Отложено')).toBeInTheDocument();
  });

  it('should display current status', () => {
    render(
      <WatchStatusSelector
        animeId={1}
        currentStatus="watching"
        onStatusChange={mockOnStatusChange}
      />
    );
    
    expect(screen.getByText('Смотрю')).toBeInTheDocument();
  });

  it('should call onStatusChange when status is selected', () => {
    render(
      <WatchStatusSelector
        animeId={1}
        currentStatus="plan_to_watch"
        onStatusChange={mockOnStatusChange}
      />
    );
    
    // Open dropdown
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Select "Завершено"
    const completedOption = screen.getByText('Завершено');
    fireEvent.click(completedOption);
    
    expect(mockOnStatusChange).toHaveBeenCalledWith('completed');
  });

  it('should show different colors for each status', () => {
    const { rerender } = render(
      <WatchStatusSelector
        animeId={1}
        currentStatus="watching"
        onStatusChange={mockOnStatusChange}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ color: '#ff0055' }); // watching color
    
    rerender(
      <WatchStatusSelector
        animeId={1}
        currentStatus="completed"
        onStatusChange={mockOnStatusChange}
      />
    );
    
    expect(button).toHaveStyle({ color: '#10b981' }); // completed color
  });
});
