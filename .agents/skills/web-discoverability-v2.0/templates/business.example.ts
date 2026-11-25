// src/data/business.ts — FUENTE ÚNICA DE VERDAD (v2.0).
// De aquí salen: HTML visible, capítulos del scrollytelling, catálogo de productos/servicios,
// footer, links de contacto/WhatsApp, JSON-LD (@graph) y FAQ.
// Regla innegociable: ningún dato inventado. Todo valor TODO_ debe reemplazarse antes de publicar.

export type BusinessMode = 'local' | 'general' | 'product';

export interface ProductOffer {
  name: string;             // ej. 'El Lienzo — Line Art Digital' o 'El Render — Póster Personalizado'
  price: number | null;     // null si aún no tiene precio público confirmado (no se emite Offer con precio inventado)
  priceCurrency: string;    // ISO 4217: 'ARS', 'USD', 'EUR'…
  availability?: 'https://schema.org/InStock' | 'https://schema.org/PreOrder' | 'https://schema.org/OutOfStock';
  url?: string;             // ruta o ancla, ej. '/modelos/ferrari-f40/#configurador'
}

export interface CatalogProduct {
  slug: string;             // ej. 'ferrari-f40-1987'
  name: string;             // nombre real, sin keyword stuffing: ej. 'Ferrari F40 (1987)'
  sku?: string;
  decade?: string;          // ej. '80s'
  country?: string;         // ej. 'IT'
  specs?: string;           // dato técnico verificable: ej. 'V8 2.9L Twin-Turbo · 478 CV'
  description: string;      // descripción factual autocontenible
  image: string;            // ruta en /public o asset optimizado
  offers: ProductOffer[];
}

export interface ScrollyChapter {
  id: string;
  label: string;            // ej. '01 / 04 · CHASIS'
  title: string;
  body: string;             // 25–45 palabras, factual y autocontenible
  stillSrc: string;         // imagen clave para prefers-reduced-motion: reduce
  stillAlt: string;
}

export const business = {
  mode: 'product' as BusinessMode,   // 'local' | 'general' | 'product'
  name: 'TODO_NOMBRE_COMERCIAL',     // Nombre REAL, sin keywords añadidas
  url: 'https://TODO-DOMINIO.com',
  lang: 'es-AR',                     // atributo <html lang>
  locale: 'es_AR',                   // og:locale
  schemaType: 'Organization',        // en modo 'local', usar subtipo específico: 'AutoBodyShop', 'Plumber', etc.
  tagline: 'TODO_FRASE_CORTA',
  // Frase de entidad AEO (25–40 palabras, factual, sin superlativos): visible bajo el H1 y base de descripción
  entityStatement:
    'TODO_FRASE_DE_ENTIDAD_AEO_25_A_40_PALABRAS_FACTUAL_SIN_SUPERLATIVOS',
  description:
    'TODO_DESCRIPCION_FACTUAL_1_2_ORACIONES_SIN_KEYWORD_STUFFING',
  phone: '+54TODOTELEFONO',          // formato E.164 (o '' si no aplica en modo product/general)
  whatsapp: '54TODOWHATSAPP',        // solo dígitos para wa.me
  whatsappText: 'Hola, quiero hacer una consulta.',
  email: 'TODO@dominio.com',
  address: {
    street: 'TODO_CALLE_Y_NUMERO',
    locality: 'TODO_CIUDAD',
    region: 'TODO_PROVINCIA',
    postalCode: 'TODO_CP',
    country: 'AR',
  },
  // En modo 'local': coordenadas reales con ≥ 5 decimales.
  geo: null as null | { lat: number; lng: number },
  mapsUrl: 'https://maps.google.com/?cid=TODO',
  sameAs: [] as string[],            // perfiles oficiales reales (Instagram, Maps, etc.)
  priceRange: '$$',
  hours: [
    { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '09:00', closes: '18:00' },
  ],
  areaServed: [
    { name: 'TODO_CIUDAD', type: 'City', detail: 'TODO_DETALLE_REAL' },
  ],
  services: [
    { slug: 'servicio-1', name: 'TODO_SERVICIO_1', description: 'TODO_DESCRIPCION_CON_RESULTADO_CONCRETO' },
  ],
  products: [
    {
      slug: 'todo-producto-1',
      name: 'TODO_NOMBRE_PRODUCTO_1',
      sku: 'TODO_SKU_1',
      decade: '80s',
      country: 'IT',
      specs: 'TODO_ESPECIFICACIONES_REALES',
      description: 'TODO_DESCRIPCION_FACTUAL_DEL_PRODUCTO',
      image: '/img/todo-producto-1.webp',
      offers: [
        {
          name: 'El Lienzo — Line Art',
          price: null,               // reemplazar con número real cuando esté confirmado
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      ],
    },
  ] as CatalogProduct[],
  scrollyChapters: [
    {
      id: 'capitulo-1',
      label: '01 / 03',
      title: 'TODO_TITULO_CAPITULO_1',
      body: 'TODO_TEXTO_AUTOCONTENIBLE_CON_DATOS_REALES_25_A_45_PALABRAS',
      stillSrc: '/img/still-01.webp',
      stillAlt: 'TODO_ALT_DESCRIPTIVO_1',
    },
  ] as ScrollyChapter[],
  logo: '/logo.svg',
  ogImage: '/og.jpg',                // 1200×630
  images: ['/img/marca-1x1.webp', '/img/marca-4x3.webp', '/img/marca-16x9.webp'],
};

export const waLink = () =>
  `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(business.whatsappText)}`;

// FAQ: 5 a 8 preguntas reales. Respuestas < 50 palabras, autocontenibles,
// idénticas carácter por carácter entre el HTML (<details>) y el JSON-LD (FAQPage).
export const faqs: { q: string; a: string }[] = [
  {
    q: '¿Qué formatos incluye TODO_NOMBRE_COMERCIAL?',
    a: 'TODO_NOMBRE_COMERCIAL ofrece TODO_DETALLE_REAL_EN_MENOS_DE_50_PALABRAS.',
  },
];

