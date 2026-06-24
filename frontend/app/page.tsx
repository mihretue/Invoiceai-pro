'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/lib/api';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getAuthToken() ? '/dashboard' : '/login');
  }, [router]);

  return null;
}
