export interface StreamOption {
  id: string;
  label: string;
  streamUrl: string;
  hasAds: boolean;
  priority: number;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  /** Country ID from data-pais attribute */
  country?: string;
  slug: string;
  logoUrl: string;
  description?: string;
  /** Stream options parsed from pelisjuanita.com */
  streamOptions?: StreamOption[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const PELISJUANITA_BASE_URL = 'https://pelisjuanita.com/tv/';

// Fallback categories if scraping fails
export const categories: Category[] = [
  {id: 'noticias', name: 'Noticias', color: '#8B5E3C', icon: '📰'},
  {id: 'deportes', name: 'Deportes', color: '#7B9E3C', icon: '⚽'},
  {id: 'infantiles', name: 'Infantiles', color: '#3C8B9E', icon: '🧸'},
  {id: 'musicales', name: 'Musicales', color: '#9E3C7B', icon: '🎵'},
  {id: 'documentales', name: 'Documentales', color: '#5C8B3C', icon: '📚'},
  {id: 'variedad', name: 'Variedad', color: '#B85C3C', icon: '📺'},
  {id: 'peliculas-y-series', name: 'Películas y series', color: '#8B3C5C', icon: '🎬'},
  {id: 'reality', name: 'Reality', color: '#C67B3C', icon: '🌟'},
  {id: 'religion', name: 'Religión', color: '#5C3C8B', icon: '⛪'},
  {id: 'adultos', name: 'Adultos', color: '#8B3C3C', icon: '🔞'},
];

// Empty fallback - channels are loaded dynamically via scraping
export const channels: Channel[] = [];

/**
 * Get the best available stream URL for a channel.
 * Returns the first stream option URL, or empty string.
 */
export function getChannelStreamUrl(channel: Channel): string {
  if (channel.streamOptions && channel.streamOptions.length > 0) {
    return channel.streamOptions[0].streamUrl;
  }
  return '';
}

/**
 * Get channels filtered by category
 */
export function getChannelsByCategory(
  allChannels: Channel[],
  categoryId: string,
): Channel[] {
  return allChannels.filter(ch => ch.category === categoryId);
}

/**
 * Search channels by name or category
 */
export function searchChannels(
  allChannels: Channel[],
  query: string,
): Channel[] {
  const lower = query.toLowerCase();
  return allChannels.filter(
    ch =>
      ch.name.toLowerCase().includes(lower) ||
      ch.category.toLowerCase().includes(lower) ||
      (ch.country && ch.country.toLowerCase().includes(lower)),
  );
}

/**
 * Get a category by ID
 */
export function getCategoryById(
  allCategories: Category[],
  id: string,
): Category | undefined {
  return allCategories.find(c => c.id === id);
}
