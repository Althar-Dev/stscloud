
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

/**
 * @fileOverview Optimasi SEO Global.
 * Menambahkan metadata OpenGraph dan Twitter untuk meningkatkan visibilitas di mesin pencari dan media sosial.
 */

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://stscloud.id'),
  title: {
    default: 'STSCloud | Next-Gen Cloud Hosting & Game Server Indonesia',
    template: '%s | STSCloud'
  },
  description: 'Platform cloud hosting performa tinggi di Indonesia, Singapura, dan Malaysia. Deploy bot, web, dan game server dalam 60 detik dengan infrastruktur lokal ultra-low latency.',
  keywords: ['Cloud Hosting Indonesia', 'Game Server Hosting', 'VPS Jakarta', 'Hosting Bot Nodejs', 'Python Hosting', 'Singapore Cloud Server', 'STSCloud'],
  authors: [{ name: 'STSCloud Infrastructure' }],
  creator: 'STSCloud',
  publisher: 'STSCloud Infrastructure',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'STSCloud | Performa Cloud Tanpa Batas',
    description: 'Deploy aplikasi dan game server Anda di infrastruktur lokal terbaik. Latency rendah, keamanan tinggi, dan harga transparan.',
    url: 'https://stscloud.id',
    siteName: 'STSCloud',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STSCloud | Next-Gen Cloud Hosting',
    description: 'High performance cloud nodes in South East Asia.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/30">
        <FirebaseClientProvider>
          <div className="flex min-h-screen w-full flex-col">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
