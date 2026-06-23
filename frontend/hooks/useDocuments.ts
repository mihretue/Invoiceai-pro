'use client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { getAuthToken } from '@/lib/api';
import type {
  ApiExtraction,
  ExtractionUpdatePayload,
  UploadResponse,
  DashboardSummary,
  CategoryBreakdown,
  MonthlyTrend,
  TopVendorsResponse,
} from '@/lib/types';

const isAuthed = () => !!getAuthToken();

function invalidateAll() {
  queryClient.invalidateQueries({ queryKey: ['extractions'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

// ── Queries ───────────────────────────────────────────────────────────────────

export function useExtractions() {
  return useQuery<ApiExtraction[]>({
    queryKey: ['extractions'],
    queryFn: () => api.get('/api/extractions').then(r => r.data),
    enabled: isAuthed(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardData() {
  return useQuery<DashboardSummary>({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get('/api/dashboard/summary').then(r => r.data),
    enabled: isAuthed(),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCategoryBreakdown() {
  return useQuery<CategoryBreakdown>({
    queryKey: ['dashboard', 'category-breakdown'],
    queryFn: () => api.get('/api/dashboard/category-breakdown').then(r => r.data),
    enabled: isAuthed(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyTrend() {
  return useQuery<MonthlyTrend>({
    queryKey: ['dashboard', 'monthly-trend'],
    queryFn: () => api.get('/api/dashboard/monthly-trend').then(r => r.data),
    enabled: isAuthed(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopVendors() {
  return useQuery<TopVendorsResponse>({
    queryKey: ['dashboard', 'top-vendors'],
    queryFn: () => api.get('/api/dashboard/top-vendors').then(r => r.data),
    enabled: isAuthed(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExtraction(id: number | null) {
  return useQuery<ApiExtraction>({
    queryKey: ['extraction', id],
    queryFn: () => api.get(`/api/extractions/${id}`).then(r => r.data),
    enabled: isAuthed() && id != null,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFilterExtractions({
  category,
  vendor,
  search,
}: { category?: string; vendor?: string; search?: string } = {}) {
  return useQuery<ApiExtraction[]>({
    queryKey: ['extractions-filter', category, vendor, search],
    queryFn: async () => {
      if (category) return api.get(`/api/extractions/filter/category/${encodeURIComponent(category)}`).then(r => r.data);
      if (vendor)   return api.get(`/api/extractions/filter/vendor/${encodeURIComponent(vendor)}`).then(r => r.data);
      if (search)   return api.get('/api/extractions/search', { params: { q: search } }).then(r => r.data);
      return [];
    },
    enabled: isAuthed() && !!(category || vendor || search),
    staleTime: 1 * 60 * 1000,
  });
}

export function useExportExtractions() {
  return useMutation<string, Error, { format: 'csv' | 'json'; category?: string; vendor?: string }>({
    mutationFn: ({ format, ...filters }) =>
      api.get(`/api/extractions/export/${format}`, { params: filters }).then(r => r.data),
    onSuccess: (_, { format }) => {
      toast.success(`Exported as ${format.toUpperCase()}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Export failed.');
    },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useUploadDocument() {
  return useMutation<UploadResponse, Error, File>({
    mutationFn: file => {
      const form = new FormData();
      form.append('file', file);
      return api.post('/api/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },
    onSuccess: data => {
      toast.success(`${data.filename} uploaded — extraction queued.`);
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Upload failed. Please try again.');
    },
  });
}

export function useUpdateExtraction() {
  return useMutation<ApiExtraction, Error, { id: number; data: ExtractionUpdatePayload }>({
    mutationFn: ({ id, data }) =>
      api.put(`/api/extractions/${id}`, data).then(r => r.data),
    onSuccess: () => {
      toast.success('Invoice saved.');
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to save invoice.');
    },
  });
}

export function useDeleteExtraction() {
  return useMutation<void, Error, number>({
    mutationFn: id => api.delete(`/api/extractions/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Invoice deleted.');
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Failed to delete invoice.');
    },
  });
}
