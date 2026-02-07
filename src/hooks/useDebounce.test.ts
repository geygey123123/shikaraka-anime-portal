import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes with default 300ms delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // Value should still be initial immediately after update
    expect(result.current).toBe('initial');

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 400 }
    );
  });

  it('should debounce value changes with custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Update value
    rerender({ value: 'updated' });

    // Value should still be initial after 300ms
    await new Promise(resolve => setTimeout(resolve, 300));
    expect(result.current).toBe('initial');

    // Wait for full debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 600 }
    );
  });

  it('should cancel previous timeout on rapid value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    // Rapid updates
    rerender({ value: 'update1' });
    await new Promise(resolve => setTimeout(resolve, 100));
    
    rerender({ value: 'update2' });
    await new Promise(resolve => setTimeout(resolve, 100));
    
    rerender({ value: 'final' });

    // Should still be initial during debounce
    expect(result.current).toBe('initial');

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(result.current).toBe('final');
      },
      { timeout: 400 }
    );
  });

  it('should work with different data types', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 0 } }
    );

    expect(result.current).toBe(0);

    rerender({ value: 42 });

    await waitFor(
      () => {
        expect(result.current).toBe(42);
      },
      { timeout: 400 }
    );
  });
});
