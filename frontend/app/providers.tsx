'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppProvider } from '@/lib/context';
import ErrorBoundary from '@/components/ErrorBoundary';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 401) return false;
          return failureCount < 1;
        },
      },
      mutations: { retry: false },
    },
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppProvider>
          {children}
        </AppProvider>
      </ErrorBoundary>
      <Toaster richColors position="top-right" closeButton />
    </QueryClientProvider>
  );
}
