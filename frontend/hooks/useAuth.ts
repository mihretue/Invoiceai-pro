'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api, { setAuthToken, clearAuthToken, getAuthToken } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { ApiUser, AuthResponse, SignupResponse } from '@/lib/types';

// ── Queries ───────────────────────────────────────────────────────────────────

export function useUserProfile() {
  return useQuery<ApiUser>({
    queryKey: ['user'],
    queryFn: () => api.get('/api/auth/me').then(r => r.data),
    enabled: !!getAuthToken(),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const router = useRouter();
  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: data => api.post('/api/auth/login', data).then(r => r.data),
    onSuccess: data => {
      setAuthToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Login successful!');
      router.push('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Login failed. Please try again.');
    },
  });
}

export function useSignup() {
  const router = useRouter();
  return useMutation<SignupResponse, Error, { email: string; password: string }>({
    mutationFn: data => api.post('/api/auth/signup', data).then(r => r.data),
    onSuccess: data => {
      setAuthToken(data.access_token);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Account created! Welcome aboard.');
      router.push('/');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Signup failed. Please try again.');
    },
  });
}

export function useLogout() {
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post('/api/auth/logout').then(r => r.data),
    onSettled: () => {
      clearAuthToken();
      queryClient.clear();
      router.push('/login');
    },
  });
}
