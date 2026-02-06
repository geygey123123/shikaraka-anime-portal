import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonCard } from './SkeletonCard';

describe('SkeletonCard Component', () => {
  it('should render skeleton card with loading status', () => {
    render(<SkeletonCard />);
    const skeleton = screen.getByRole('status', { name: 'Loading...' });
    expect(skeleton).toBeInTheDocument();
  });

  it('should have animate-pulse class for animation', () => {
    render(<SkeletonCard />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    render(<SkeletonCard className="custom-class" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-class');
  });
});
