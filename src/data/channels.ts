export interface Channel {
  id: string;
  name: string;
  category: string;
  slug: string; // tvlibree.com URL slug: https://tvlibree.com/en-vivo/{slug}/
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
  {id: 'publicos', name: 'Canales Abiertos', color: '#8B5E3C', icon: '📺'},
  {id: 'noticias', name: 'Noticias', color: '#C67B3C', icon: '📰'},
  {id: 'deportes', name: 'Deportes', color: '#7B9E3C', icon: '⚽'},
  {id: 'entretenimiento', name: 'Entretenimiento', color: '#B85C3C', icon: '🎬'},
  {id: 'infantil', name: 'Infantil', color: '#3C8B9E', icon: '🧸'},
  {id: 'musica', name: 'Música', color: '#9E3C7B', icon: '🎵'},
  {id: 'cultura', name: 'Cultura y Documentales', color: '#5C8B3C', icon: '📚'},
  {id: 'cine', name: 'Cine y Series', color: '#8B3C5C', icon: '🎥'},
  {id: 'internacional', name: 'Internacional', color: '#3C5C8B', icon: '🌎'},
];

export const TVLIBREE_BASE_URL = 'https://tvlibree.com/en-vivo';

// All channels sourced from tvlibree.com
// Each channel loads via WebView: https://tvlibree.com/en-vivo/{slug}/
export const channels: Channel[] = [
  // Canales Abiertos
  {id: 'telefe', name: 'Telefe', category: 'publicos', slug: 'telefe', logoUrl: '', description: 'Telefe - Canal 11'},
  {id: 'el-trece', name: 'El Trece', category: 'publicos', slug: 'el-trece', logoUrl: '', description: 'Canal 13 Buenos Aires'},
  {id: 'america-tv', name: 'América TV', category: 'publicos', slug: 'america-tv', logoUrl: '', description: 'América TV - Canal 2'},
  {id: 'canal-9', name: 'Canal 9', category: 'publicos', slug: 'canal-9', logoUrl: '', description: 'Canal 9 Buenos Aires'},
  {id: 'tv-publica', name: 'TV Pública', category: 'publicos', slug: 'tv-publica', logoUrl: '', description: 'TV Pública Argentina - Canal 7'},
  {id: 'nettv', name: 'Net TV', category: 'publicos', slug: 'nettv', logoUrl: '', description: 'Net TV - Canal abierto'},
  {id: 'bravo', name: 'Bravo TV', category: 'publicos', slug: 'bravo', logoUrl: '', description: 'Bravo TV'},
  {id: 'telemax', name: 'Telemax (TLX)', category: 'publicos', slug: 'telemax', logoUrl: '', description: 'Telemax TLX HD'},

  // Noticias
  {id: 'tn', name: 'TN - Todo Noticias', category: 'noticias', slug: 'tn', logoUrl: '', description: 'Todo Noticias 24hs'},
  {id: 'c5n', name: 'C5N', category: 'noticias', slug: 'c5n', logoUrl: '', description: 'C5N Noticias'},
  {id: 'cronica-tv', name: 'Crónica TV', category: 'noticias', slug: 'cronica-tv', logoUrl: '', description: 'Crónica TV'},
  {id: 'a24', name: 'A24', category: 'noticias', slug: 'a24', logoUrl: '', description: 'A24 Noticias'},
  {id: 'ln-plus', name: 'LN+', category: 'noticias', slug: 'ln-plus', logoUrl: '', description: 'La Nación+'},
  {id: 'ip', name: 'IP Noticias', category: 'noticias', slug: 'ip', logoUrl: '', description: 'Información Periodística'},
  {id: 'canal-26', name: 'Canal 26', category: 'noticias', slug: 'canal-26', logoUrl: '', description: 'Canal 26 Noticias'},

  // Deportes
  {id: 'espn-ar', name: 'ESPN', category: 'deportes', slug: 'espn-ar', logoUrl: '', description: 'ESPN Argentina'},
  {id: 'espn-2', name: 'ESPN 2', category: 'deportes', slug: 'espn-2', logoUrl: '', description: 'ESPN 2'},
  {id: 'espn-3', name: 'ESPN 3', category: 'deportes', slug: 'espn-3', logoUrl: '', description: 'ESPN 3'},
  {id: 'tnt-sports', name: 'TNT Sports', category: 'deportes', slug: 'tnt-sports', logoUrl: '', description: 'TNT Sports Argentina'},
  {id: 'tyc-sports', name: 'TyC Sports', category: 'deportes', slug: 'tyc-sports', logoUrl: '', description: 'TyC Sports'},
  {id: 'deportv', name: 'DeporTV', category: 'deportes', slug: 'deportv', logoUrl: '', description: 'DeporTV Canal público'},
  {id: 'fox-sports', name: 'Fox Sports', category: 'deportes', slug: 'fox-sports', logoUrl: '', description: 'Fox Sports'},

  // Entretenimiento
  {id: 'volver', name: 'Volver', category: 'entretenimiento', slug: 'volver', logoUrl: '', description: 'Volver - Cine y TV clásica'},
  {id: 'magazine', name: 'Magazine', category: 'entretenimiento', slug: 'magazine', logoUrl: '', description: 'Magazine'},
  {id: 'warner', name: 'Warner Channel', category: 'entretenimiento', slug: 'warner', logoUrl: '', description: 'Warner Channel'},
  {id: 'tnt', name: 'TNT', category: 'entretenimiento', slug: 'tnt', logoUrl: '', description: 'TNT Series y Películas'},
  {id: 'fx', name: 'FX', category: 'entretenimiento', slug: 'fx', logoUrl: '', description: 'FX Series'},
  {id: 'lifetime', name: 'Lifetime', category: 'entretenimiento', slug: 'lifetime', logoUrl: '', description: 'Lifetime'},
  {id: 'e', name: 'E! Entertainment', category: 'entretenimiento', slug: 'e', logoUrl: '', description: 'E! Entertainment'},
  {id: 'space', name: 'Space', category: 'entretenimiento', slug: 'space', logoUrl: '', description: 'Space - Cine'},
  {id: 'paramount', name: 'Paramount', category: 'entretenimiento', slug: 'paramount', logoUrl: '', description: 'Paramount Network'},

  // Infantil
  {id: 'paka-paka', name: 'Paka Paka', category: 'infantil', slug: 'paka-paka', logoUrl: '', description: 'Paka Paka - Canal infantil'},
  {id: 'cartoon-network', name: 'Cartoon Network', category: 'infantil', slug: 'cartoon-network', logoUrl: '', description: 'Cartoon Network'},
  {id: 'disney-channel', name: 'Disney Channel', category: 'infantil', slug: 'disney-channel', logoUrl: '', description: 'Disney Channel'},
  {id: 'nick', name: 'Nickelodeon', category: 'infantil', slug: 'nick', logoUrl: '', description: 'Nickelodeon'},
  {id: 'disney-jr', name: 'Disney Jr', category: 'infantil', slug: 'disney-jr', logoUrl: '', description: 'Disney Junior'},

  // Música
  {id: 'mtv', name: 'MTV', category: 'musica', slug: 'mtv', logoUrl: '', description: 'MTV'},
  {id: 'vh1', name: 'VH1', category: 'musica', slug: 'vh1', logoUrl: '', description: 'VH1 Music'},
  {id: 'quiero-musica', name: 'Quiero Música', category: 'musica', slug: 'quiero-musica', logoUrl: '', description: 'Quiero Música en mi Idioma'},

  // Cultura / Documentales
  {id: 'encuentro', name: 'Canal Encuentro', category: 'cultura', slug: 'encuentro', logoUrl: '', description: 'Canal Encuentro - Educativo'},
  {id: 'discovery', name: 'Discovery Channel', category: 'cultura', slug: 'discovery', logoUrl: '', description: 'Discovery Channel'},
  {id: 'discovery-theater', name: 'Discovery Theater', category: 'cultura', slug: 'discovery-theater', logoUrl: '', description: 'Discovery Theater'},
  {id: 'discovery-world', name: 'Discovery World', category: 'cultura', slug: 'discovery-world', logoUrl: '', description: 'Discovery World'},
  {id: 'nat-geo', name: 'Nat Geo', category: 'cultura', slug: 'nat-geo', logoUrl: '', description: 'National Geographic'},
  {id: 'history', name: 'History', category: 'cultura', slug: 'history', logoUrl: '', description: 'History Channel'},

  // Cine y Series
  {id: 'hbo', name: 'HBO', category: 'cine', slug: 'hbo', logoUrl: '', description: 'HBO'},
  {id: 'film-and-arts', name: 'Film & Arts', category: 'cine', slug: 'film-and-arts', logoUrl: '', description: 'Film & Arts'},
  {id: 'star-channel', name: 'Star Channel', category: 'cine', slug: 'star-channel', logoUrl: '', description: 'Star Channel'},
  {id: 'cinecanal', name: 'Cinecanal', category: 'cine', slug: 'cinecanal', logoUrl: '', description: 'Cinecanal'},
  {id: 'universal', name: 'Universal TV', category: 'cine', slug: 'universal', logoUrl: '', description: 'Universal TV'},
  {id: 'axn', name: 'AXN', category: 'cine', slug: 'axn', logoUrl: '', description: 'AXN'},
  {id: 'a-e', name: 'A&E', category: 'cine', slug: 'a-e', logoUrl: '', description: 'A&E'},
  {id: 'syfy', name: 'SyFy', category: 'cine', slug: 'syfy', logoUrl: '', description: 'SyFy'},

  // Internacional
  {id: 'teledoce', name: 'Teledoce', category: 'internacional', slug: 'teledoce', logoUrl: '', description: 'Teledoce - Uruguay'},
  {id: 'vtv-plus', name: 'VTV+', category: 'internacional', slug: 'vtv-plus', logoUrl: '', description: 'VTV+ Uruguay'},
  {id: 'canal5-mx', name: 'Canal 5 MX', category: 'internacional', slug: 'canal5-mx', logoUrl: '', description: 'Canal 5 México'},
];

export function getChannelUrl(channel: Channel): string {
  return `${TVLIBREE_BASE_URL}/${channel.slug}/`;
}

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

export function getChannelById(channelId: string): Channel | undefined {
  return channels.find(c => c.id === channelId);
}
