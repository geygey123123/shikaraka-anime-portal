import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingStats } from './RatingStats';

describe('RatingStats', () => {
  it('renders average rating and count', () => {
    render(<RatingStats average={8.5} count={100} />);
    
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Средняя оценка')).toBeInTheDocument();
    expect(screen.getByText('Всего оценок')).toBeInTheDocument();
  });

  it('displays distribution bars when provided', () => {
    const distribution = {
      10: 20,
      9: 15,
      8: 30,
      7: 20,
      6: 10,
      5: 5,
    };

    render(<RatingStats average={8.2} count={100} distribution={distribution} />);
    
    expect(screen.getByText('Распределение оценок')).toBeInTheDocument();
    
    // Check that distribution counts are displayed (use getAllByText for duplicates)
    const twentyCounts = screen.getAllByText('20');
    expect(twentyCounts.length).toBeGreaterThanOrEqual(2); // Rating 10 and 7 both have 20
    
    const thirtyCounts = screen.getAllByText('30');
    expect(thirtyCounts.length).toBeGreaterThanOrEqual(1); // Rating 8 has 30
  });

  it('shows empty state when count is 0', () => {
    render(<RatingStats average={0} count={0} />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('Пока нет оценок. Будьте первым!')).toBeInTheDocument();
  });

  it('renders all rating levels from 1 to 10', () => {
    const distribution = { 5: 10 };
    render(<RatingStats average={5.0} count={10} distribution={distribution} />);
    
    // Check that all rating labels are present in the distribution section
    // Use a more specific query to avoid conflicts with other numbers
    const distributionSection = screen.getByText('Распределение оценок').parentElement;
    expect(distributionSection).toBeInTheDocument();
    
    // Verify the distribution bars exist by checking for rating labels
    for (let i = 1; i <= 10; i++) {
      const labels = screen.getAllByText(i.toString());
      expect(labels.length).toBeGreaterThanOrEqual(1);
    }
  });
});
