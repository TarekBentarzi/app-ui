import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import App from './App';
import * as useAuthHook from '@/shared/hooks/useAuth';

jest.mock('@/infra/primary/components/AuthHeader', () => ({
  AuthHeader: ({ onSignInPress, onSignOutPress, user }: any) => (
    <div data-testid="auth-header">
      <button onClick={onSignInPress}>Mock Sign In</button>
      <button onClick={onSignOutPress}>Mock Sign Out</button>
      {user && <span>Logged as {user.name}</span>}
    </div>
  ),
}));

jest.mock('@/infra/primary/components/RegistrationForm', () => ({
  RegistrationForm: ({ onRegister, onCancel }: any) => (
    <div data-testid="registration-form">
      <button onClick={() => onRegister({ name: 'New', email: 'n@e.c' })}>Mock Register</button>
      <button onClick={onCancel}>Mock Cancel</button>
    </div>
  ),
}));

describe('App Component', () => {
  let mockAuth: any;

  beforeEach(() => {
    mockAuth = {
      user: null,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    };
    jest.spyOn(useAuthHook, 'useAuth').mockReturnValue(mockAuth);
    global.alert = jest.fn();
    jest.clearAllMocks();
  });

  it('should render the welcome screen initially', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to QLearn/i)).toBeInTheDocument();
  });

  it('should render loading state', () => {
    mockAuth.loading = true;
    render(<App />);
    expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
  });

  it('should display user name when logged in', () => {
    mockAuth.user = { id: '1', name: 'Alice', email: 'alice@example.com' };
    render(<App />);
    expect(screen.getByText(/You are signed in as Alice/i)).toBeInTheDocument();
  });

  it('should toggle registration form visibility', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Mock Sign In'));
    expect(screen.getByTestId('registration-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mock Cancel'));
    expect(screen.queryByTestId('registration-form')).not.toBeInTheDocument();
  });

  it('should handle successful registration', async () => {
    mockAuth.signIn.mockResolvedValueOnce(undefined);
    render(<App />);
    fireEvent.click(screen.getByText('Mock Sign In'));
    fireEvent.click(screen.getByText('Mock Register'));
    await waitFor(() => {
      expect(mockAuth.signIn).toHaveBeenCalled();
    });
  });

  it('should call signOut when header triggers it', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Mock Sign Out'));
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it('should catch and log registration errors', async () => {
    const error = new Error('Async Handle Error');
    mockAuth.signIn.mockRejectedValue(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    // Prevent the test suite from failing on the unhandled re-rejection
    const originalEmit = process.emit;
    // @ts-ignore
    process.emit = jest.fn();

    render(<App />);
    fireEvent.click(screen.getByText('Mock Sign In'));

    // Trigger register
    fireEvent.click(screen.getByText('Mock Register'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    consoleSpy.mockRestore();
    // @ts-ignore
    process.emit = originalEmit;
  });
});
