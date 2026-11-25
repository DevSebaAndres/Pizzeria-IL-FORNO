// src/lib/schema.ts — genera el @graph JSON-LD único desde business.ts (en <head>).
// Soporta modos 'local' (LocalBusiness), 'general' (Organization + Service) y 'product' (Organization + Product/Offer).
// Regla: nunca incluye aggregateRating/review autopromocionales ni emite Offer sin precio numérico real.

import { business, faqs } from '../data/business';

const base = business.url.replace(/\/$/, '');
const id = (frag: string) => `${base}/#${frag}`;
const abs = (u: string) => (/^https?:\/\//i.test(u) ? u : `${base}${u.startsWith('/') ? '' : '/'}${u}`);

export function buildGraph(opts: { path?: string; pageName?: string; pageDescription?: string } = {}) {
  const { path = '/', pageName, pageDescription } = opts;
  const pageUrl = `${base}${path}`;
  const isLocal = business.mode === 'local';
  const isProduct = business.mode === 'product';

  const org: Record<string, unknown> = {
    '@type': isLocal ? business.schemaType : 'Organization',
    '@id': id('business'),
    name: business.name,
    url: base,
    logo: abs(business.logo),
    description: business.description,
    image: business.images.length ? business.images.map(abs) : abs(business.ogImage),
    ...(business.phone ? { telephone: business.phone } : {}),
    ...(business.email ? { email: business.email } : {}),
    ...(business.sameAs.length ? { sameAs: business.sameAs } : {}),
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
  ];

  if (!isProduct) {
    for (const s of business.services) {
      graph.push({
        '@type': 'Service',
        '@id': `${base}/#service-${s.slug}`,
        name: s.name,
        description: s.description,
        provider: { '@id': id('business') },
        ...(isLocal ? { areaServed: business.areaServed.map((a) => ({ '@type': a.type, name: a.name })) } : {}),
      });
    }
  }

  if (isProduct && Array.isArray(business.products)) {
    for (const p of business.products) {
      const validOffers = (p.offers ?? []).filter(
        (o) => typeof o.price === 'number' && Number.isFinite(o.price) && o.price >= 0
      );
      const productNode: Record<string, unknown> = {
        '@type': 'Product',
        '@id': `${base}/#product-${p.slug}`,
        name: p.name,
        description: p.description,
        image: abs(p.image),
        ...(p.sku ? { sku: p.sku } : {}),
        brand: { '@id': id('business') },
      };
      if (validOffers.length === 1) {
        const o = validOffers[0];
        productNode.offers = {
          '@type': 'Offer',
          name: o.name,
          price: o.price,
          priceCurrency: o.priceCurrency,
          availability: o.availability ?? 'https://schema.org/InStock',
          url: o.url ? abs(o.url) : pageUrl,
        };
      } else if (validOffers.length > 1) {
        productNode.offers = validOffers.map((o) => ({
          '@type': 'Offer',
          name: o.name,
          price: o.price,
          priceCurrency: o.priceCurrency,
          availability: o.availability ?? 'https://schema.org/InStock',
          url: o.url ? abs(o.url) : pageUrl,
        }));
      }
      graph.push(productNode);
    }
  }

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

