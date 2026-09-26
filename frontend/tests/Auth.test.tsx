import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { ToastProvider } from '../src/context/ToastContext';
import { LoginPage } from '../src/pages/LoginPage';
import { RegisterPage } from '../src/pages/RegisterPage';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

describe('Frontend Authentication Pages', () => {
  describe('LoginPage', () => {
    it('renders login form inputs and buttons', () => {
      renderWithProviders(<LoginPage />);
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
      expect(screen.getByText(/Register now/i)).toBeInTheDocument();
    });

    it('shows error if submitted without email or password', async () => {
      const { container } = renderWithProviders(<LoginPage />);
      const form = container.querySelector('form')!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Please enter both email and password/i)).toBeInTheDocument();
      });
    });
  });

  describe('RegisterPage', () => {
    it('renders registration form inputs, complexity checklist, and role selection', () => {
      renderWithProviders(<RegisterPage />);
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Candidate$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Admin \/ Evaluator/i })).toBeInTheDocument();
      expect(screen.getByText(/At least 8 chars/i)).toBeInTheDocument();
    });

    it('validates password complexity interactively', () => {
      renderWithProviders(<RegisterPage />);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      const submitBtn = screen.getByRole('button', { name: /Create Account/i });
      expect(submitBtn).toBeDisabled();

      fireEvent.change(passwordInput, { target: { value: 'ValidPassword123' } });
      expect(submitBtn).not.toBeDisabled();
    });
  });
});
