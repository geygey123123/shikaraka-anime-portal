import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RatingDisplay } from './RatingDisplay';

describe('RatingDisplay', () => {
  it('renders card variant with rating and star', () => {
    render(<RatingDisplay rating={8.5} count={100} variant="card" />);
    
    expect(screen.getByText('8.5')).toBeInTheDocument();
  });

  it('renders detail variant with full information', () => {
    render(<RatingDisplay rating={7.8} count={50} variant="detail" />);
    
    expect(screen.getByText('7.8')).toBeInTheDocument();
    expect(screen.getByText('/ 10')).toBeInTheDocument();
    expect(screen.getByText('50 оценок')).toBeInTheDocument();
  });

  it('displays correct plural forms for count', () => {
    const { rerender } = render(<RatingDisplay rating={5.0} count={0} variant="detail" />);
    expect(screen.getByText('Нет оценок')).toBeInTheDocument();

    rerender(<RatingDisplay rating={5.0} count={1} variant="detail" />);
    expect(screen.getByText('1 оценка')).toBeInTheDocument();

    rerender(<RatingDisplay rating={5.0} count={3} variant="detail" />);
    expect(screen.getByText('3 оценки')).toBeInTheDocument();

    rerender(<RatingDisplay rating={5.0} count={10} variant="detail" />);
    expect(screen.getByText('10 оценок')).toBeInTheDocument();
  });

  it('displays placeholder when rating is 0', () => {
    render(<RatingDisplay rating={0} count={0} variant="card" />);
    
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
