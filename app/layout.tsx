import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { PWAProvider } from '@/components/providers/PWAProvider';
import { Navigation } from '@/components/layout/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AgroVision - Dashboard Agrícola',
  description: 'Dashboard moderno para gestão de culturas agrícolas',
  manifest: '/manifest.json',
  themeColor: '#007369',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-900 text-white min-h-screen`}>
        <PWAProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1 p-4 lg:p-6">
              {children}
            </main>
          </div>
        </PWAProvider>
      </body>
    </html>
  );
}