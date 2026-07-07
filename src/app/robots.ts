
import { MetadataRoute } from 'next';

/**
 * @fileOverview Konfigurasi robots.txt.
 * Melindungi rute sensitif dari crawling mesin pencari.
 */

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/servers/',
        '/dev/',
        '/api/',
      ],
    },
    sitemap: 'https://stscloud.id/sitemap.xml',
  };
}
