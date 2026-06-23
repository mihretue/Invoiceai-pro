'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api, { getAuthToken } from '@/lib/api';
import type { ApiUser } from '@/lib/types';

const isAuthed = () => !!getAuthToken();

function triggerDownload(data: string | object, filename: string, mime: string) {
  const content  = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob     = new Blob([content], { type: mime });
  const url      = URL.createObjectURL(blob);
  const a        = document.createElement('a');
  a.href         = url;
  a.download     = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useUserSettings() {
  return useQuery<ApiUser>({
    queryKey: ['user-settings'],
    queryFn: () => api.get('/api/auth/me').then(r => r.data),
    enabled: isAuthed(),
    staleTime: 5 * 60 * 1000,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation<ApiUser, Error, Partial<ApiUser>>({
    mutationFn: data => api.put('/api/auth/me', data).then(r => r.data),
    onSuccess: () => {
      toast.success('Settings updated.');
      qc.invalidateQueries({ queryKey: ['user-settings'] });
      qc.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to update settings.');
    },
  });
}

export function useChangePassword() {
  return useMutation<void, Error, { current_password: string; new_password: string; confirm_password: string }>({
    mutationFn: data => api.post('/api/auth/change-password', data).then(r => r.data),
    onSuccess: () => {
      toast.success('Password changed successfully.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to change password.');
    },
  });
}

export function useExportCSV() {
  return useMutation<string, Error, { category?: string; vendor?: string; dateFrom?: string; dateTo?: string } | undefined>({
    mutationFn: filters =>
      api.get('/api/extractions/export/csv', { params: filters }).then(r => r.data),
    onSuccess: data => {
      const date = new Date().toISOString().split('T')[0];
      triggerDownload(data, `invoices-${date}.csv`, 'text/csv');
      toast.success('CSV exported.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to export CSV.');
    },
  });
}

export function useExportJSON() {
  return useMutation<object, Error, { category?: string; vendor?: string; dateFrom?: string; dateTo?: string } | undefined>({
    mutationFn: filters =>
      api.get('/api/extractions/export/json', { params: filters }).then(r => r.data),
    onSuccess: data => {
      const date = new Date().toISOString().split('T')[0];
      triggerDownload(data, `invoices-${date}.json`, 'application/json');
      toast.success('JSON exported.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to export JSON.');
    },
  });
}
