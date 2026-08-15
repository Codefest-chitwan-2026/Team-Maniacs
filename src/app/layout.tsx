import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/language-context';
import Header from '@/components/header';
import OfflineBanner from '@/components/offline-banner';
import Navigation from '@/components/navigation';

export const metadata: Metadata = {
  title: 'Satark Nepal | सतर्क नेपाल — Quick Response, Stronger Rescue',
  description: 'Citizen-focused disaster emergency response platform for Nepal featuring Satark Pulse, Satark AI, Trust Layer, Live Map, and Relief Coordination.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Satark Nepal',
  },
};

export const viewport: Viewport = {
  themeColor: '#dc2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="np">
      <body className="bg-navy-950 text-slate-100 flex flex-col min-h-screen pb-20 md:pb-0">
        <LanguageProvider>
          <OfflineBanner />
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4">
            {children}
          </main>
          <Navigation />
        </LanguageProvider>
      </body>
    </html>
  );
}