
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import Script from 'next/script';

/**
 * @fileOverview Deep SEO & GEO Optimization.
 * Configured for StarVale Technology Solution by Alhadi Adriano (AltharDev).
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
  description: 'Platform cloud hosting performa tinggi oleh StarVale Technology Solution. Deploy bot, web, dan game server di Jakarta, Singapura, dan Malaysia dengan infrastruktur ultra-low latency.',
  keywords: [
    'StarVale Technology Solution', 
    'Alhadi Adriano', 
    'AltharDev', 
    'Cloud Hosting Indonesia', 
    'Game Server Hosting', 
    'VPS Jakarta', 
    'Hosting Bot Nodejs', 
    'Singapore Cloud Server', 
    'STSCloud'
  ],
  authors: [{ name: 'Alhadi Adriano', url: 'https://althar.dev' }],
  creator: 'AltharDev',
  publisher: 'StarVale Technology Solution',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'STSCloud | Powered by StarVale Technology Solution',
    description: 'High performance cloud nodes in South East Asia managed by Alhadi Adriano.',
    url: 'https://stscloud.id',
    siteName: 'STSCloud',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STSCloud | Next-Gen Cloud Hosting',
    description: 'Managed infrastructure by StarVale Technology Solution.',
    creator: '@althardev',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "StarVale Technology Solution",
    "alternateName": "StarVale",
    "url": "https://stscloud.id",
    "logo": "https://stscloud.id/img/icons.png",
    "founder": {
      "@type": "Person",
      "name": "Alhadi Adriano",
      "alternateName": "AltharDev",
      "url": "https://althar.dev"
    },
    "sameAs": [
      "https://starvale.my.id",
      "https://althar.dev"
    ]
  };

  return (
    <html lang="id" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
