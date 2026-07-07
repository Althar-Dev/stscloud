
import { MetadataRoute } from 'next';

/**
 * @fileOverview Generator Sitemap untuk SEO.
 * Memastikan mesin pencari dapat menemukan seluruh halaman publik.
 */

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://stscloud.id';
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/auth?type=login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
