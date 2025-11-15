import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'service' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  schema?: any;
  noIndex?: boolean;
  canonicalUrl?: string;
}

const DEFAULT_SEO = {
  title: 'MH26 Services - Trusted Local Services in Nanded',
  description: 'Connect with verified tiffin services, skilled plumbers, electricians, and experienced tourism guides in Nanded. Quality service, trusted providers.',
  keywords: [
    'Nanded services',
    'tiffin service Nanded',
    'plumber Nanded',
    'electrician Nanded',
    'tourism guide Nanded',
    'local services',
    'home services',
    'Maharashtra services'
  ],
  image: 'https://mh26services.com/og-image.jpg',
  url: 'https://mh26services.com',
  type: 'website' as const,
  locale: 'en_IN'
};

export function SEOOptimized({
  title = DEFAULT_SEO.title,
  description = DEFAULT_SEO.description,
  keywords = DEFAULT_SEO.keywords,
  image = DEFAULT_SEO.image,
  url = DEFAULT_SEO.url,
  type = DEFAULT_SEO.type,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  locale = DEFAULT_SEO.locale,
  schema,
  noIndex = false,
  canonicalUrl
}: SEOProps) {
  // Generate structured data
  const generateSchema = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'MH26 Services',
      description: description,
      url: url,
      logo: 'https://mh26services.com/logo.png',
      image: image,
      telephone: '+91-XXXXXXXXXX',
      email: 'contact@mh26services.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nanded',
        addressRegion: 'Maharashtra',
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '19.1383',
        longitude: '77.3210'
      },
      areaServed: {
        '@type': 'City',
        name: 'Nanded',
        addressRegion: 'Maharashtra',
        addressCountry: 'IN'
      },
      serviceType: [
        'Tiffin Services',
        'Plumbing Services', 
        'Electrical Services',
        'Tourism Guide Services'
      ],
      openingHours: 'Mo-Su 06:00-22:00',
      priceRange: '₹₹',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '500+'
      }
    };

    return schema || baseSchema;
  };

  const fullTitle = title.includes('MH26 Services') ? title : `${title} | MH26 Services`;
  const keywordsString = keywords.join(', ');

  useEffect(() => {
    // Update document title
    document.title = fullTitle;
    
    // Update meta tags
    const updateOrCreateMeta = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateOrCreateMeta('description', description);
    updateOrCreateMeta('keywords', keywordsString);
    if (author) updateOrCreateMeta('author', author);
    updateOrCreateMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    
    // Open Graph tags
    updateOrCreateMeta('og:type', type, true);
    updateOrCreateMeta('og:title', fullTitle, true);
    updateOrCreateMeta('og:description', description, true);
    updateOrCreateMeta('og:image', image, true);
    updateOrCreateMeta('og:url', url, true);
    updateOrCreateMeta('og:site_name', 'MH26 Services', true);
    updateOrCreateMeta('og:locale', locale, true);
    
    // Twitter tags
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    updateOrCreateMeta('twitter:title', fullTitle);
    updateOrCreateMeta('twitter:description', description);
    updateOrCreateMeta('twitter:image', image);
    
    // App specific
    updateOrCreateMeta('application-name', 'MH26 Services');
    updateOrCreateMeta('apple-mobile-web-app-title', 'MH26 Services');
    updateOrCreateMeta('apple-mobile-web-app-capable', 'yes');
    updateOrCreateMeta('theme-color', '#ff6b35');
    
    // Structured data
    let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.id = 'structured-data';
      structuredDataScript.type = 'application/ld+json';
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(generateSchema());
    
    // Canonical URL
    if (canonicalUrl) {
      let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = canonicalUrl;
    }
    
  }, [fullTitle, description, keywordsString, author, noIndex, type, image, url, locale, canonicalUrl, schema]);

  return null; // This component only updates the document head
}

// Predefined SEO configurations for different pages
export const SEO_CONFIGS = {
  home: {
    title: 'MH26 Services - Trusted Local Services in Nanded',
    description: 'Connect with verified tiffin services, skilled plumbers, electricians, and experienced tourism guides in Nanded. Quality service, trusted providers.',
    keywords: ['Nanded services', 'tiffin service Nanded', 'plumber Nanded', 'electrician Nanded', 'tourism guide Nanded']
  },
  
  services: {
    title: 'Browse Local Services - Tiffin, Plumber, Electrician, Tourism Guide',
    description: 'Find and book verified local service providers in Nanded. Compare ratings, prices, and availability for all your service needs.',
    keywords: ['browse services Nanded', 'service providers', 'book services online', 'Nanded local services']
  },
  
  tiffin: {
    title: 'Best Tiffin Services in Nanded - Home Cooked Meals Delivered',
    description: 'Order fresh, home-cooked meals from verified tiffin services in Nanded. Daily meal plans, authentic Maharashtrian cuisine, and reliable delivery.',
    keywords: ['tiffin service Nanded', 'home food delivery', 'Maharashtrian meals', 'daily tiffin'],
    type: 'service' as const
  },
  
  plumber: {
    title: 'Professional Plumber Services in Nanded - Emergency & Repair',
    description: 'Find skilled plumbers in Nanded for emergency repairs, installations, and maintenance. Licensed professionals with transparent pricing.',
    keywords: ['plumber Nanded', 'emergency plumbing', 'pipe repair', 'plumbing services'],
    type: 'service' as const
  },
  
  electrician: {
    title: 'Certified Electrician Services in Nanded - Repair & Installation',
    description: 'Book certified electricians in Nanded for electrical repairs, installations, and maintenance. Safe, reliable, and professional service.',
    keywords: ['electrician Nanded', 'electrical repair', 'wiring services', 'electrical installation'],
    type: 'service' as const
  },
  
  tourism: {
    title: 'Tourism Guide Services in Nanded - Historical & Cultural Tours',
    description: 'Explore Nanded with experienced local guides. Historical sites, cultural tours, and personalized travel experiences.',
    keywords: ['tourism guide Nanded', 'Nanded tours', 'historical tours', 'cultural guide'],
    type: 'service' as const
  },
  
  about: {
    title: 'About MH26 Services - Your Trusted Local Service Platform',
    description: 'Learn about MH26 Services, connecting customers with verified local service providers in Nanded since 2023. Our mission, values, and commitment to quality.',
    keywords: ['about MH26 services', 'local service platform', 'Nanded services company']
  },
  
  providers: {
    title: 'Join as Service Provider - Grow Your Business with MH26 Services',
    description: 'Register as a service provider on MH26 Services platform. Reach more customers, manage bookings, and grow your business in Nanded.',
    keywords: ['service provider registration', 'join MH26 services', 'grow business Nanded']
  },
  
  contact: {
    title: 'Contact MH26 Services - Support & Customer Care',
    description: 'Get in touch with MH26 Services for support, partnerships, or general inquiries. We\'re here to help you connect with the best local services.',
    keywords: ['contact MH26 services', 'customer support', 'help center']
  }
};

// Component for specific page SEO
export function PageSEO({ page, ...overrides }: { page: keyof typeof SEO_CONFIGS } & Partial<SEOProps>) {
  const config = SEO_CONFIGS[page];
  return <SEOOptimized {...config} {...overrides} />;
}

// Hook for dynamic SEO
export function useDynamicSEO(baseConfig: Partial<SEOProps>) {
  const [seoData, setSeoData] = React.useState(baseConfig);
  
  const updateSEO = React.useCallback((updates: Partial<SEOProps>) => {
    setSeoData(prev => ({ ...prev, ...updates }));
  }, []);
  
  return {
    seoData,
    updateSEO,
    SEOComponent: () => <SEOOptimized {...seoData} />
  };
}

// Schema generators for different content types
export const generateServiceSchema = (service: {
  name: string;
  description: string;
  category: string;
  provider: string;
  price: number;
  rating: number;
  reviewCount: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  serviceType: service.category,
  provider: {
    '@type': 'LocalBusiness',
    name: service.provider
  },
  offers: {
    '@type': 'Offer',
    price: service.price,
    priceCurrency: 'INR'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: service.rating,
    reviewCount: service.reviewCount
  },
  areaServed: {
    '@type': 'City',
    name: 'Nanded',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN'
  }
});

export const generateProviderSchema = (provider: {
  name: string;
  description: string;
  services: string[];
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: provider.name,
  description: provider.description,
  serviceType: provider.services,
  telephone: provider.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: provider.address,
    addressLocality: 'Nanded',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: provider.rating,
    reviewCount: provider.reviewCount
  }
});