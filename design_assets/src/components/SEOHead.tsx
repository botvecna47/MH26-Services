// SEO and Meta tags component for better search engine optimization
import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  locale?: string;
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  schema?: object;
}

const defaultMeta = {
  title: 'MH26 Services - Local Service Marketplace in Nanded',
  description: 'Connect with trusted local service providers in Nanded. Book tiffin services, plumbers, electricians, tourism guides and more. Reliable, verified, and affordable services.',
  keywords: [
    'local services',
    'Nanded services',
    'tiffin service',
    'plumber',
    'electrician',
    'tourism guide',
    'home services',
    'service marketplace',
    'Maharashtra services',
    'reliable services'
  ],
  image: '/og-image.jpg',
  url: 'https://mh26services.com',
  type: 'website' as const,
  siteName: 'MH26 Services',
  locale: 'en_IN',
  twitterCard: 'summary_large_image' as const,
};

export function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  locale,
  siteName,
  twitterCard = 'summary_large_image',
  canonical,
  noindex = false,
  nofollow = false,
  schema,
}: SEOHeadProps) {
  const meta = {
    title: title || defaultMeta.title,
    description: description || defaultMeta.description,
    keywords: [...defaultMeta.keywords, ...keywords],
    image: image || defaultMeta.image,
    url: url || defaultMeta.url,
    type,
    siteName: siteName || defaultMeta.siteName,
    locale: locale || defaultMeta.locale,
    twitterCard,
  };

  useEffect(() => {
    // Update document title
    document.title = meta.title;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo]');
    existingMetas.forEach(meta => meta.remove());

    // Create and append new meta tags
    const metaTags = [
      // Basic meta tags
      { name: 'description', content: meta.description },
      { name: 'keywords', content: meta.keywords.join(', ') },
      { name: 'author', content: author || 'MH26 Services Team' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { name: 'theme-color', content: '#ff6b35' },
      
      // Open Graph tags
      { property: 'og:title', content: meta.title },
      { property: 'og:description', content: meta.description },
      { property: 'og:image', content: meta.image },
      { property: 'og:url', content: meta.url },
      { property: 'og:type', content: meta.type },
      { property: 'og:site_name', content: meta.siteName },
      { property: 'og:locale', content: meta.locale },
      
      // Twitter Card tags
      { name: 'twitter:card', content: meta.twitterCard },
      { name: 'twitter:title', content: meta.title },
      { name: 'twitter:description', content: meta.description },
      { name: 'twitter:image', content: meta.image },
      { name: 'twitter:site', content: '@MH26Services' },
      { name: 'twitter:creator', content: '@MH26Services' },
      
      // Additional meta tags
      { name: 'robots', content: `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}` },
      { name: 'googlebot', content: `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}` },
      
      // Geographic tags
      { name: 'geo.region', content: 'IN-MH' },
      { name: 'geo.placename', content: 'Nanded, Maharashtra, India' },
      { name: 'geo.position', content: '19.1383;77.3210' },
      { name: 'ICBM', content: '19.1383, 77.3210' },
      
      // Mobile app tags
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'MH26 Services' },
      { name: 'application-name', content: 'MH26 Services' },
      { name: 'msapplication-TileColor', content: '#ff6b35' },
      { name: 'msapplication-TileImage', content: '/mstile-144x144.png' },
    ];

    // Add time-based meta tags if provided
    if (publishedTime) {
      metaTags.push({ property: 'article:published_time', content: publishedTime });
    }
    if (modifiedTime) {
      metaTags.push({ property: 'article:modified_time', content: modifiedTime });
    }

    // Create and append meta tags
    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.setAttribute('name', name);
      if (property) meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      meta.setAttribute('data-seo', 'true');
      document.head.appendChild(meta);
    });

    // Add canonical link if provided
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Add JSON-LD structured data if provided
    if (schema) {
      let scriptTag = document.querySelector('script[type="application/ld+json"][data-seo]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.type = 'application/ld+json';
        scriptTag.setAttribute('data-seo', 'true');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    }

    // Add hreflang for multilingual support (if needed in future)
    const hreflangs = [
      { lang: 'en', href: meta.url },
      { lang: 'hi', href: `${meta.url}/hi` },
      { lang: 'mr', href: `${meta.url}/mr` },
    ];

    hreflangs.forEach(({ lang, href }) => {
      let hreflangLink = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!hreflangLink) {
        hreflangLink = document.createElement('link');
        hreflangLink.rel = 'alternate';
        hreflangLink.hreflang = lang;
        hreflangLink.setAttribute('data-seo', 'true');
        document.head.appendChild(hreflangLink);
      }
      hreflangLink.href = href;
    });

    // Add preload for critical resources
    const preloadResources = [
      { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' },
      { href: meta.image, as: 'image' },
    ];

    preloadResources.forEach(({ href, as, type, crossorigin }) => {
      const existing = document.querySelector(`link[href="${href}"][rel="preload"]`);
      if (!existing) {
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.href = href;
        preloadLink.as = as;
        if (type) preloadLink.type = type;
        if (crossorigin) preloadLink.crossOrigin = crossorigin;
        preloadLink.setAttribute('data-seo', 'true');
        document.head.appendChild(preloadLink);
      }
    });

    // Add DNS prefetch for external resources
    const dnsPrefetchDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://images.unsplash.com',
      'https://api.mh26services.com',
    ];

    dnsPrefetchDomains.forEach(domain => {
      const existing = document.querySelector(`link[href="${domain}"][rel="dns-prefetch"]`);
      if (!existing) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'dns-prefetch';
        prefetchLink.href = domain;
        prefetchLink.setAttribute('data-seo', 'true');
        document.head.appendChild(prefetchLink);
      }
    });

  }, [
    meta.title,
    meta.description,
    meta.keywords,
    meta.image,
    meta.url,
    meta.type,
    meta.siteName,
    meta.locale,
    meta.twitterCard,
    author,
    publishedTime,
    modifiedTime,
    canonical,
    noindex,
    nofollow,
    schema,
  ]);

  return null; // This component doesn't render anything
}

// Predefined schemas for different page types
export const schemas = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MH26 Services',
    url: 'https://mh26services.com',
    logo: 'https://mh26services.com/logo.png',
    description: 'Local service marketplace connecting customers with verified service providers in Nanded',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nanded',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9876543210',
      contactType: 'customer service',
      availableLanguage: ['English', 'Hindi', 'Marathi'],
    },
    sameAs: [
      'https://facebook.com/mh26services',
      'https://twitter.com/mh26services',
      'https://instagram.com/mh26services',
    ],
  },

  localBusiness: {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MH26 Services',
    description: 'Trusted local service marketplace in Nanded',
    url: 'https://mh26services.com',
    telephone: '+91-9876543210',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nanded',
      addressRegion: 'Maharashtra',
      postalCode: '431601',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.1383,
      longitude: 77.3210,
    },
    openingHours: 'Mo-Su 00:00-23:59',
    priceRange: '₹₹',
    servedCuisine: 'Home-cooked Indian food',
    serviceArea: {
      '@type': 'City',
      name: 'Nanded',
    },
  },

  service: (serviceName: string, description: string, price: string) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description,
    provider: {
      '@type': 'Organization',
      name: 'MH26 Services',
      url: 'https://mh26services.com',
    },
    areaServed: {
      '@type': 'City',
      name: 'Nanded',
    },
    offers: {
      '@type': 'Offer',
      price: price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  }),

  breadcrumb: (items: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
};

export default SEOHead;