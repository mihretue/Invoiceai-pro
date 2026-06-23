import { Inter, Manrope, Roboto_Mono } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';
import Providers from './providers';
import ConditionalNav from '@/components/ConditionalNav';
import TweaksPanel from '@/components/TweaksPanel';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'InvoiceAI Pro',
  description: 'AI-powered invoice extraction and management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} ${robotoMono.variable}`}>
        <Providers>
          <div className="app">
            <ConditionalNav />
            <main className="page">
              {children}
            </main>
            <TweaksPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}
