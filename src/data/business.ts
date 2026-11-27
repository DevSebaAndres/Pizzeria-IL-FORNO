// src/data/business.ts — FUENTE ÚNICA DE VERDAD (batería v1.0) — IL FORNO Pizzería
// Origen de cada dato:
//   REAL         = tomado del flyer entregado por el cliente (pizza-ilforno-datos.jpeg)
//   PLACEHOLDER_ = ejemplo ficticio pedido por el cliente; a revalidar antes del deploy

export const business = {
  mode: 'local' as const,
  name: 'IL FORNO', // REAL
  displayType: 'Pizzería',
  url: 'https://ilfornopizzeria.com.ar', // Dominio canónico planificado
  lang: 'es-AR',
  locale: 'es_AR',
  schemaType: 'Restaurant' as const, // subtipo de LocalBusiness en Schema.org
  tagline: 'Pizza recién salida del horno', // REAL (flyer)
  description:
    'IL FORNO es una pizzería de San Miguel de Tucumán que vende pizzas recién salidas del horno, combos con gaseosa y pizzas para hornear en casa.',
  // REAL (flyer)
  phone: '+543816362922',
  phoneDisplay: '381 6362922',
  phoneTel: 'tel:+543816362922',
  // Número real de WhatsApp (mismo que el teléfono)
  whatsapp: '543816362922',
  whatsappDisplay: '381 6362922',
  whatsappText: 'Hola IL FORNO, quiero hacer un pedido.',
  email: 'contacto@ilfornopizzeria.com.ar',
  address: {
    street: 'San Luis 601, esq. Lavalle', // REAL
    locality: 'San Miguel de Tucumán', // REAL (flyer: SMT)
    region: 'Tucumán',
    postalCode: 'T4000',
    country: 'AR',
  },
  // Coordenadas geográficas con 5 decimales (esquina San Luis y Lavalle, SMT)
  geo: { lat: -26.83785, lng: -65.21482 },
  mapsUrl: 'https://maps.google.com/?q=San+Luis+601,+San+Miguel+de+Tucum%C3%A1n,+Argentina',
  // PLACEHOLDER_ Instagram de modelo
  instagram: {
    handle: '@ilfornopizzatuc',
    href: 'https://www.instagram.com/ilfornopizzatuc/',
  },
  sameAs: ['https://www.instagram.com/ilfornopizzatuc/'],
  priceRange: '$$',
  // PLACEHOLDER_ horario genérico modelo
  hours: [
    {
      days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '20:00',
      closes: '23:59',
    },
  ],
  hoursText: [
    { days: 'Martes a domingo', time: '20:00 a 00:00 hs' },
    { days: 'Lunes', time: 'Cerrado' },
  ],
  areaServed: [
    {
      name: 'San Miguel de Tucumán',
      type: 'City' as const,
      detail: 'Atención presencial y retiro en local de San Luis 601, esq. Lavalle',
    },
  ],
  services: [
    {
      slug: 'recien-salidas-del-horno',
      name: 'Pizzas recién salidas del horno',
      description:
        'Porciones y pizzas enteras calientes listas para comer, acompañadas de combos con gaseosa.',
    },
    {
      slug: 'para-hornear-en-casa',
      name: 'Pizzas para hornear en casa',
      description:
        'Pizzas comunes y especiales listas para conservar y hornear en casa, con promociones por tres unidades.',
    },
  ],
  // REAL (flyer)
  menu: {
    fresh: [
      {
        name: '2 porciones de pizza + gaseosa 500 cc',
        price: 5000,
        badge: 'Al paso',
        description: 'Dos porciones de pizza caliente al corte acompañadas de gaseosa fría de 500 cc.',
      },
      {
        name: '1 pizza + gaseosa grande',
        price: 19000,
        badge: 'La más pedida',
        description: 'Pizza grande entera recién salida del horno con muzzarella fundida y gaseosa familiar grande.',
      },
      {
        name: '2 pizzas + gaseosa grande',
        price: 34000,
        badge: 'Para compartir',
        description: 'Dos pizzas grandes enteras de horno con gaseosa familiar grande, ideal para reuniones.',
      },
    ],
    bake: [
      {
        name: 'Pizza común',
        price: 7500,
        badge: 'Tradicional',
        description: 'Masa artesanal y muzzarella clásica lista para dar golpe de calor en tu horno hogareño.',
      },
      {
        name: 'Pizza especial',
        price: 9000,
        badge: 'Especial',
        description: 'Toppings selectos sobre base artesanal, envasada para mantener frescura y crocancia.',
      },
      {
        name: 'Promo x3 comunes',
        price: 21000,
        badge: 'Ahorro x3',
        description: 'Tres pizzas comunes para hornear en casa. Perfectas para tener listas en el freezer.',
      },
      {
        name: 'Promo x3 especiales',
        price: 25000,
        badge: 'Combo especial',
        description: 'Tres pizzas especiales con ingredientes premium para disfrutar en cualquier ocasión.',
      },
    ],
  },
  logo: '/favicon.svg',
  ogImage: '/favicon.svg',
  images: ['/favicon.svg'],
};

export const waLink = (customText?: string) => {
  const text = customText || business.whatsappText;
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;
};

export const money = (n: number) => '$' + n.toLocaleString('es-AR');

// Contenido de la Fase 4 (ver docs/contenido.md)
export const entityStatement =
  'IL FORNO es una pizzería de San Miguel de Tucumán, ubicada en San Luis 601 esquina Lavalle, que vende pizzas recién salidas del horno, combos con gaseosa y pizzas para hornear en casa, con pedidos por teléfono y WhatsApp.';

export const seo = {
  title: 'IL FORNO Pizzería | Pizza en San Miguel de Tucumán', // 50 caracteres (<= 65)
  description:
    'Pizzas recién salidas del horno y para hornear en casa en San Miguel de Tucumán. Combos con gaseosa. Pedí al 381 6362922 o en San Luis 601, esq. Lavalle.', // 153 caracteres (150–160)
  h1: 'Pizzas recién salidas del horno en San Miguel de Tucumán',
};

// FAQ semántica: 6 preguntas, respuestas < 50 palabras, paridad 1:1 estricta con JSON-LD
export const faqs: { q: string; a: string }[] = [
  {
    q: '¿Qué vende IL FORNO en San Miguel de Tucumán?',
    a: 'IL FORNO vende en San Miguel de Tucumán pizzas recién salidas del horno en combos con gaseosa, y pizzas comunes o especiales para hornear en casa, con promos por tres unidades.',
  },
  {
    q: '¿Cuánto cuesta una pizza para hornear en casa en IL FORNO?',
    a: 'En IL FORNO la pizza común para hornear en casa cuesta $7.500 y la especial $9.000. La promo por tres comunes cuesta $21.000 y la de tres especiales $25.000, según la carta vigente.',
  },
  {
    q: '¿Qué combos de pizza recién hecha ofrece IL FORNO?',
    a: 'IL FORNO ofrece tres combos: 2 porciones de pizza con gaseosa de 500 cc por $5.000, 1 pizza con gaseosa grande por $19.000 y 2 pizzas con gaseosa grande por $34.000.',
  },
  {
    q: '¿Dónde queda IL FORNO?',
    a: 'IL FORNO queda en San Luis 601, esquina Lavalle, en San Miguel de Tucumán. Podés visitarnos en el local o hacer tu pedido antes por teléfono o WhatsApp.',
  },
  {
    q: '¿Cómo hago un pedido en IL FORNO?',
    a: 'Podés pedir en IL FORNO llamando al 381 6362922 o escribiendo por WhatsApp al 381 6362922. También podés acercarte al local de San Luis 601, esquina Lavalle, en San Miguel de Tucumán.',
  },
  {
    q: '¿Cuál es el horario de atención de IL FORNO?',
    a: 'IL FORNO atiende de martes a domingo de 20:00 a 00:00 hs en San Luis 601, esquina Lavalle, San Miguel de Tucumán. Los lunes permanece cerrado. Horario de ejemplo, a confirmar por el local.',
  },
];
