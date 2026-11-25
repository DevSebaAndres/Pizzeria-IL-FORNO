// src/lib/schema.ts — genera el @graph JSON-LD desde business.ts (una sola vez, en <head>)
import { business, faqs } from '../data/business';

const base = business.url.replace(/\/$/, '');
const id = (frag: string) => `${base}/#${frag}`;

export function buildGraph(opts: { path?: string; pageName?: string; pageDescription?: string } = {}) {
  const { path = '/', pageName, pageDescription } = opts;
  const pageUrl = `${base}${path}`;
  const isLocal = business.mode === 'local';

  const org: Record<string, unknown> = {
    '@type': isLocal ? business.schemaType : 'Organization',
    '@id': id('business'),
    name: business.name,
    url: base,
    logo: `${base}${business.logo}`,
    description: business.description,
    image: business.images.length
      ? business.images.map((i) => `${base}${i}`)
      : `${base}${business.ogImage}`,
    telephone: business.phone,
    email: business.email,
    sameAs: business.sameAs,
  };

  if (isLocal) {
    Object.assign(org, {
      priceRange: business.priceRange,
      address: {
        '@type': 'PostalAddress',
        streetAddress: business.address.street,
        addressLocality: business.address.locality,
        addressRegion: business.address.region,
        postalCode: business.address.postalCode,
        addressCountry: business.address.country,
      },
      hasMap: business.mapsUrl,
      areaServed: business.areaServed.map((a) => ({ '@type': a.type, name: a.name })),
      openingHoursSpecification: business.hours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
    });
    if (business.geo) {
      org.geo = {
        '@type': 'GeoCoordinates',
        latitude: business.geo.lat,
        longitude: business.geo.lng,
      };
    }
  }

  const graph: Record<string, unknown>[] = [
    org,
    {
      '@type': 'WebSite',
      '@id': id('website'),
      url: base,
      name: business.name,
      inLanguage: business.lang,
      publisher: { '@id': id('business') },
    },
    {
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: pageName ?? business.name,
      description: pageDescription ?? business.description,
      isPartOf: { '@id': id('website') },
      about: { '@id': id('business') },
      inLanguage: business.lang,
    },
    ...business.services.map((s) => ({
      '@type': 'Service',
      '@id': `${base}/#service-${s.slug}`,
      name: s.name,
      description: s.description,
      provider: { '@id': id('business') },
      ...(isLocal ? { areaServed: business.areaServed.map((a) => ({ '@type': a.type, name: a.name })) } : {}),
    })),
  ];

  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return graph;
}

