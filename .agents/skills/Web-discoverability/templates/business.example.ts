// src/data/business.ts — FUENTE ÚNICA DE VERDAD.
// De aquí salen: HTML visible, footer, links de WhatsApp, JSON-LD y FAQ.
// Regla: ningún dato inventado. Todo valor TODO_ debe reemplazarse antes de publicar.

export const business = {
  mode: 'local' as 'local' | 'general',
  name: 'TODO_NOMBRE_COMERCIAL',
  url: 'https://TODO-DOMINIO.com',
  lang: 'es-AR',            // atributo <html lang>
  locale: 'es_AR',          // og:locale
  schemaType: 'Plumber',    // subtipo de LocalBusiness real: Plumber, Electrician, Dentist, HairSalon…
  // Nombre REAL del negocio, sin keywords extra ("Electricista Barato 24hs" está prohibido).
  tagline: 'TODO_FRASE_CORTA',
  description: 'TODO_DESCRIPCIÓN_FACTUAL_1-2_ORACIONES_SIN_KEYWORD_STUFFING', // schema + meta description base
  phone: '+54TODOTELEFONO',          // formato E.164, visible y en schema
  whatsapp: '54TODOWHATSAPP',        // solo dígitos para wa.me
  whatsappText: 'Hola, quiero pedir un presupuesto.',
  email: 'TODO@dominio.com',
  address: {
    street: 'TODO_CALLE_Y_NUMERO',
    locality: 'TODO_CIUDAD',
    region: 'TODO_PROVINCIA',
    postalCode: 'TODO_CP',
    country: 'AR',
  },
  // Coordenadas reales con ≥ 5 decimales (Google lo pide para LocalBusiness). Un 0 final se omite al serializar y es válido.
  geo: null as null | { lat: number; lng: number },
  mapsUrl: 'https://maps.google.com/?cid=TODO',
  sameAs: [] as string[],            // perfiles oficiales: Maps, Instagram, Facebook…
  priceRange: '$$',
  hours: [
    // Horarios reales. Ejemplo 24/7: todos los días 00:00–23:59
    { days: ['Monday','Tuesday','Wednesday','Thursday','Friday'], opens: '09:00', closes: '18:00' },
  ],
  areaServed: [
    // type: 'City' para la ciudad; 'AdministrativeArea' para barrios/zonas/partidos
    { name: 'TODO_CIUDAD', type: 'City', detail: 'TODO_DETALLE_REAL_O_TIEMPO_ESTIMADO' },
    { name: 'TODO_BARRIO_1', type: 'AdministrativeArea', detail: 'TODO_DETALLE_REAL_O_TIEMPO_ESTIMADO' },
  ],
  services: [
    { slug: 'servicio-1', name: 'TODO_SERVICIO_1', description: 'TODO_DESCRIPCIÓN_CON_RESULTADO_CONCRETO' },
  ],
  logo: '/logo.png',
  ogImage: '/og.jpg',                // 1200×630
  // Google recomienda varias proporciones de la misma imagen (1:1, 4:3, 16:9), en WebP/AVIF/JPG
  images: ['/img/negocio-1x1.webp', '/img/negocio-4x3.webp', '/img/negocio-16x9.webp'],
};

export const waLink = () =>
  `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(business.whatsappText)}`;

// FAQ: 5 a 8 preguntas (calidad > cantidad). Respuestas < 50 palabras, autocontenibles
// (sujeto + afirmación + calificador), nombran negocio y ubicación. Datos concretos > adjetivos.
export const faqs: { q: string; a: string }[] = [
  { q: '¿Qué zonas cubre TODO_NOMBRE?', a: 'TODO_NOMBRE cubre TODO_CIUDAD, con atención prioritaria en TODO_BARRIOS.' },
  // …completar con las 5+ preguntas reales
];
