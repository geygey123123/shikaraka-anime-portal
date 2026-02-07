import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileEditor } from './ProfileEditor';

describe('ProfileEditor Component', () => {
  const mockProfile = {
    id: 'user1',
    username: 'TestUser',
    avatar_url: null,
    bio: 'Test bio',
  };

  const mockOnSave = vi.fn();

  it('should render profile form with current values', () => {
    render(<ProfileEditor profile={mockProfile} onSave={mockOnSave} />);
    
    expect(screen.getByDisplayValue('TestUser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
  });

  it('should validate username length', () => {
    render(<ProfileEditor profile={mockProfile} onSave={mockOnSave} />);
    
    const usernameInput = screen.getByLabelText(/имя пользователя/i);
    fireEvent.change(usernameInput, { target: { value: 'ab' } });
    
    expect(screen.getByText(/минимум 3 символа/i)).toBeInTheDocument();
  });

  it('should call onSave with updated values', async () => {
    render(<ProfileEditor profile={mockProfile} onSave={mockOnSave} />);
    
    const usernameInput = screen.getByLabelText(/имя пользователя/i);
    fireEvent.change(usernameInput, { target: { value: 'NewUsername' } });
    
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'NewUsername' })
    );
  });

  it('should disable save button during submission', () => {
    const slowSave = vi.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));
    render(<ProfileEditor profile={mockProfile} onSave={slowSave} />);
    
    const saveButton = screen.getByRole('button', { name: /сохранить/i });
    fireEvent.click(saveButton);
    
    expect(saveButton).toBeDisabled();
  });
});
