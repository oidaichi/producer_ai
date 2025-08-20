import { render, screen, fireEvent, waitFor } from '@/test-utils';
import LoginPage from './page';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth/react
jest.mock('next-auth/react');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('LoginPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    
    // Mock signIn to resolve successfully
    (signIn as jest.Mock).mockResolvedValue({ ok: true });
  });

  it('renders login form', () => {
    render(<LoginPage />);
    
    // Check if the form elements are rendered
    expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    expect(screen.getByText(/アカウントをお持ちでない方は/)).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<LoginPage />);
    
    // Try to submit empty form
    const loginButton = screen.getByRole('button', { name: /ログイン/i });
    fireEvent.click(loginButton);
    
    // Check for validation errors
    expect(await screen.findByText(/メールアドレスを入力してください/i)).toBeInTheDocument();
    expect(await screen.findByText(/パスワードを入力してください/i)).toBeInTheDocument();
    
    // Fill in invalid email
    const emailInput = screen.getByLabelText(/メールアドレス/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(loginButton);
    
    // Check for email validation error
    expect(await screen.findByText(/有効なメールアドレスを入力してください/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    render(<LoginPage />);
    
    // Fill in the form
    const email = 'test@example.com';
    const password = 'password123';
    
    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: email },
    });
    
    fireEvent.change(screen.getByLabelText(/パスワード/i), {
      target: { value: password },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));
    
    // Check if signIn was called with the right arguments
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', {
        email,
        password,
        redirect: false,
      });
    });
    
    // Check if the user is redirected after successful login
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error message when login fails', async () => {
    // Mock signIn to reject with an error
    (signIn as jest.Mock).mockResolvedValueOnce({
      error: 'Invalid credentials',
    });
    
    render(<LoginPage />);
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/パスワード/i), {
      target: { value: 'wrongpassword' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));
    
    // Check if error message is shown
    expect(await screen.findByText(/ログインに失敗しました/i)).toBeInTheDocument();
  });

  it('redirects to signup page when signup link is clicked', () => {
    render(<LoginPage />);
    
    const signupLink = screen.getByRole('link', { name: /新規登録/i });
    fireEvent.click(signupLink);
    
    expect(mockPush).toHaveBeenCalledWith('/signup');
  });
});
