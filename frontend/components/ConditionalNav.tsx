'use client';
import { usePathname } from 'next/navigation';
import Nav from './Nav';

const AUTH_ROUTES = ['/login', '/signup'];

export default function ConditionalNav() {
  const pathname = usePathname();
  if (AUTH_ROUTES.includes(pathname)) return null;
  return <Nav />;
}
