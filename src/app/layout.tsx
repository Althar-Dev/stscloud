
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
    default: 'STSCloud | Next-Gen Cloud Hosting Indonesia',
    template: '%s | STSCloud'
  },
  description: 'Platform cloud hosting performa tinggi oleh StarVale Technology Solution. Deploy bot, dan web di STSCloud dengan infrastruktur ultra-low latency. Dikelola oleh Alhadi Adriano.',
  keywords: [
    'StarVale Technology Solution', 
    'Alhadi Adriano', 
    'AltharDev', 
    'Cloud Hosting Indonesia', 
    'Game Server Hosting', 
    'VPS Jakarta', 
    'Hosting Bot Nodejs', 
    'Singapore Cloud Server', 
    'STSCloud',
    'Hosting Murah Indonesia'
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://stscloud.id/#organization",
        "name": "StarVale Technology Solution",
        "url": "https://stscloud.id",
        "logo": "https://stscloud.id/img/icons.png",
        "sameAs": [
          "https://starvale.my.id",
          "https://althar.dev"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://stscloud.id/#website",
        "url": "https://stscloud.id",
        "name": "STSCloud",
        "publisher": { "@id": "https://stscloud.id/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://stscloud.id/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Person",
        "@id": "https://althar.dev/#person",
        "name": "Alhadi Adriano",
        "alternateName": "AltharDev",
        "url": "https://althar.dev",
        "jobTitle": "Solo Founder & Solutions Architect",
        "worksFor": { "@id": "https://stscloud.id/#organization" }
      },
      {
        "@type": "ItemList",
        "name": "STSCloud Navigation",
        "description": "Main sections of the STSCloud platform",
        "itemListElement": [
          {
            "@type": "SiteNavigationElement",
            "position": 1,
            "name": "Cloud Pricing",
            "url": "https://stscloud.id/#pricing"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 2,
            "name": "Help Center",
            "url": "https://stscloud.id/support"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 3,
            "name": "Knowledge Base",
            "url": "https://stscloud.id/support/knowledge-base"
          },
          {
            "@type": "SiteNavigationElement",
            "position": 4,
            "name": "Client Login",
            "url": "https://stscloud.id/auth?type=login"
          }
        ]
      }
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
