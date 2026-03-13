export interface Channel {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  logoUrl: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const categories: Category[] = [
  {id: 'noticias', name: 'Noticias', color: '#C67B3C', icon: '📰'},
  {id: 'deportes', name: 'Deportes', color: '#7B9E3C', icon: '⚽'},
  {id: 'entretenimiento', name: 'Entretenimiento', color: '#B85C3C', icon: '🎬'},
  {id: 'infantil', name: 'Infantil', color: '#3C8B9E', icon: '🧸'},
  {id: 'musica', name: 'Música', color: '#9E3C7B', icon: '🎵'},
  {id: 'cultura', name: 'Cultura', color: '#5C8B3C', icon: '📚'},
  {id: 'internacional', name: 'Internacional', color: '#3C5C8B', icon: '🌎'},
  {id: 'publicos', name: 'Públicos', color: '#8B5E3C', icon: '📺'},
];

// Argentine TV channels with their M3U8/stream URLs
export const channels: Channel[] = [
  // Noticias
  {
    id: 'c5n',
    name: 'C5N',
    category: 'noticias',
    streamUrl: 'https://live-05-13-c5n.vodgc.net/c5n/index.m3u8',
    logoUrl: 'https://www.c5n.com/images/logo-c5n.png',
    description: 'Canal de noticias argentino 24 horas',
  },
  {
    id: 'tn',
    name: 'TN - Todo Noticias',
    category: 'noticias',
    streamUrl: 'https://live-05-13-tn.vodgc.net/tn/index.m3u8',
    logoUrl: 'https://tn.com.ar/images/logo-tn.png',
    description: 'Todo Noticias - Canal de noticias de Argentina',
  },
  {
    id: 'cronica',
    name: 'Crónica TV',
    category: 'noticias',
    streamUrl: 'https://live-05-13-cronica.vodgc.net/cronica/index.m3u8',
    logoUrl: 'https://www.cronicatv.com.ar/images/logo.png',
    description: 'Crónica TV - Noticias las 24 horas',
  },
  {
    id: 'a24',
    name: 'A24',
    category: 'noticias',
    streamUrl: 'https://live-05-13-a24.vodgc.net/a24/index.m3u8',
    logoUrl: 'https://www.a24.com/images/logo.png',
    description: 'A24 - Canal de noticias',
  },
  {
    id: 'ln_plus',
    name: 'LN+',
    category: 'noticias',
    streamUrl: 'https://live-05-13-lnmas.vodgc.net/lnmas/index.m3u8',
    logoUrl: 'https://www.lanacion.com.ar/images/logo.png',
    description: 'La Nación+ - Canal de noticias',
  },
  {
    id: 'ip',
    name: 'IP Noticias',
    category: 'noticias',
    streamUrl: 'https://live-05-13-ip.vodgc.net/ip/index.m3u8',
    logoUrl: 'https://www.ipnoticias.com.ar/images/logo.png',
    description: 'IP Noticias - Información Periodística',
  },
  // Deportes
  {
    id: 'tycsports',
    name: 'TyC Sports',
    category: 'deportes',
    streamUrl: 'https://live-05-13-tyc.vodgc.net/tycsports/index.m3u8',
    logoUrl: 'https://www.tycsports.com/images/logo.png',
    description: 'TyC Sports - Canal deportivo argentino',
  },
  {
    id: 'espn',
    name: 'ESPN',
    category: 'deportes',
    streamUrl: 'https://live-05-13-espn.vodgc.net/espn/index.m3u8',
    logoUrl: 'https://www.espn.com.ar/images/logo.png',
    description: 'ESPN - Deportes',
  },
  {
    id: 'deportv',
    name: 'DeporTV',
    category: 'deportes',
    streamUrl: 'https://live-05-13-deportv.vodgc.net/deportv/index.m3u8',
    logoUrl: 'https://deportv.com.ar/images/logo.png',
    description: 'DeporTV - Canal público de deportes',
  },
  // Entretenimiento
  {
    id: 'eltrece',
    name: 'El Trece',
    category: 'entretenimiento',
    streamUrl: 'https://live-05-13-eltrece.vodgc.net/eltrece/index.m3u8',
    logoUrl: 'https://www.eltrecetv.com.ar/images/logo.png',
    description: 'Canal 13 - Buenos Aires',
  },
  {
    id: 'telefe',
    name: 'Telefe',
    category: 'entretenimiento',
    streamUrl: 'https://live-05-13-telefe.vodgc.net/telefe/index.m3u8',
    logoUrl: 'https://www.telefe.com/images/logo.png',
    description: 'Telefe - Televisión Federal',
  },
  {
    id: 'america',
    name: 'América TV',
    category: 'entretenimiento',
    streamUrl: 'https://live-05-13-america.vodgc.net/america/index.m3u8',
    logoUrl: 'https://www.americatv.com.ar/images/logo.png',
    description: 'América TV - Canal 2',
  },
  {
    id: 'canal9',
    name: 'Canal 9',
    category: 'entretenimiento',
    streamUrl: 'https://live-05-13-canal9.vodgc.net/canal9/index.m3u8',
    logoUrl: 'https://www.canal9.com.ar/images/logo.png',
    description: 'Canal 9 - Buenos Aires',
  },
  {
    id: 'nettv',
    name: 'Net TV',
    category: 'entretenimiento',
    streamUrl: 'https://live-05-13-nettv.vodgc.net/nettv/index.m3u8',
    logoUrl: 'https://www.nettv.com.ar/images/logo.png',
    description: 'Net TV - Canal abierto',
  },
  // Infantil
  {
    id: 'pakapaka',
    name: 'Paka Paka',
    category: 'infantil',
    streamUrl: 'https://live-05-13-pakapaka.vodgc.net/pakapaka/index.m3u8',
    logoUrl: 'https://www.pakapaka.gob.ar/images/logo.png',
    description: 'Paka Paka - Canal infantil público argentino',
  },
  // Música
  {
    id: 'musictop',
    name: 'Music Top',
    category: 'musica',
    streamUrl: 'https://live-05-13-musictop.vodgc.net/musictop/index.m3u8',
    logoUrl: 'https://www.musictop.com.ar/images/logo.png',
    description: 'Music Top - Canal de música',
  },
  // Cultura
  {
    id: 'encuentro',
    name: 'Canal Encuentro',
    category: 'cultura',
    streamUrl: 'https://live-05-13-encuentro.vodgc.net/encuentro/index.m3u8',
    logoUrl: 'https://encuentro.gob.ar/images/logo.png',
    description: 'Canal Encuentro - Canal educativo público',
  },
  // Públicos
  {
    id: 'tpa',
    name: 'TV Pública Argentina',
    category: 'publicos',
    streamUrl: 'https://live-05-13-tpa.vodgc.net/tpa/index.m3u8',
    logoUrl: 'https://www.tvpublica.com.ar/images/logo.png',
    description: 'TV Pública - Canal 7',
  },
  // Internacional
  {
    id: 'dw',
    name: 'DW Español',
    category: 'internacional',
    streamUrl: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8',
    logoUrl: 'https://www.dw.com/images/logo.png',
    description: 'Deutsche Welle en español',
  },
  {
    id: 'france24',
    name: 'France 24 Español',
    category: 'internacional',
    streamUrl: 'https://live-05-13-france24.vodgc.net/france24/index.m3u8',
    logoUrl: 'https://www.france24.com/images/logo.png',
    description: 'France 24 en español',
  },
  {
    id: 'rt',
    name: 'RT en Español',
    category: 'internacional',
    streamUrl: 'https://live-05-13-rt.vodgc.net/rt/index.m3u8',
    logoUrl: 'https://www.rt.com/images/logo.png',
    description: 'RT en español',
  },
];

export function getChannelsByCategory(categoryId: string): Channel[] {
  return channels.filter(ch => ch.category === categoryId);
}

export function searchChannels(query: string): Channel[] {
  const lower = query.toLowerCase();
  return channels.filter(
    ch =>
      ch.name.toLowerCase().includes(lower) ||
      ch.category.toLowerCase().includes(lower) ||
      (ch.description && ch.description.toLowerCase().includes(lower)),
  );
}

export function getCategoryById(categoryId: string): Category | undefined {
  return categories.find(c => c.id === categoryId);
}
