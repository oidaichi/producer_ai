import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { NextIntlProvider } from 'next-intl';
import { Toaster } from '@/components/ui/toaster';

// Mock session for testing
const mockSession = {
  data: {
    user: {
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER',
    },
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
  },
  status: 'authenticated',
};

// Custom render function with all the necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider session={mockSession.data}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <NextIntlProvider locale="ja" messages={{}}>
          {children}
          <Toaster />
        </NextIntlProvider>
      </ThemeProvider>
    </SessionProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
// Override render method
export { customRender as render };

// Utility functions for testing
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
};

export const mockSessionData = mockSession;
