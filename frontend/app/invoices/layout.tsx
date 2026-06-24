import AuthGuard from '@/components/AuthGuard';

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
