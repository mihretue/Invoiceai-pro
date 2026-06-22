import { Inter, Manrope, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/lib/context';
import Nav from '@/components/Nav';
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${manrope.variable} ${robotoMono.variable}`}>
        <AppProvider>
          <div className="app">
            <Nav />
            <main className="page">
              {children}
            </main>
            <TweaksPanel />
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
