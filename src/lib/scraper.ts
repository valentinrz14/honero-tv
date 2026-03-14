import {Channel, Category, StreamOption} from '@/data/channels';

const PELISJUANITA_URL = 'https://pelisjuanita.com/tv/';
const LOGO_BASE_URL = 'https://pelisjuanita.com/tv/logos/';

// Category colors and icons mapping
const CATEGORY_STYLES: Record<string, {color: string; icon: string}> = {
  noticias: {color: '#8B5E3C', icon: '📰'},
  infantiles: {color: '#3C8B9E', icon: '🧸'},
  musicales: {color: '#9E3C7B', icon: '🎵'},
  deportes: {color: '#7B9E3C', icon: '⚽'},
  documentales: {color: '#5C8B3C', icon: '📚'},
  variedad: {color: '#B85C3C', icon: '📺'},
  'peliculas y series': {color: '#8B3C5C', icon: '🎬'},
  'películas y series': {color: '#8B3C5C', icon: '🎬'},
  reality: {color: '#C67B3C', icon: '🌟'},
  religion: {color: '#5C3C8B', icon: '⛪'},
  religión: {color: '#5C3C8B', icon: '⛪'},
  adultos: {color: '#8B3C3C', icon: '🔞'},
};

// Country flags
const COUNTRY_FLAGS: Record<string, string> = {
  argentina: '🇦🇷',
  uruguay: '🇺🇾',
  paraguay: '🇵🇾',
  colombia: '🇨🇴',
  mexico: '🇲🇽',
  méxico: '🇲🇽',
  'estados unidos': '🇺🇸',
  chile: '🇨🇱',
  peru: '🇵🇪',
  perú: '🇵🇪',
  venezuela: '🇻🇪',
  brasil: '🇧🇷',
  ecuador: '🇪🇨',
  españa: '🇪🇸',
  internacional: '🌍',
};

/**
 * Fetch and parse channels from pelisjuanita.com/tv/
 */
export async function scrapeChannels(): Promise<{
  channels: Channel[];
  categories: Category[];
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(PELISJUANITA_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14; Chromecast HD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    return parseChannelsFromHTML(html);
  } catch (err) {
    clearTimeout(timeout);
    console.log('Failed to scrape pelisjuanita.com:', err);
    throw err;
  }
}

/**
 * Parse channels from the pelisjuanita.com/tv/ HTML.
 *
 * The HTML structure is:
 * <div class="item" data-categoria="Deportes" data-pais="Argentina"
 *      data-slug="espn" onclick="cambiarOpcion(this, [{url:'...', nombre:'...'}, ...])">
 *   <img src="logos/espn.png">
 *   <h2>ESPN</h2>
 *   ...
 * </div>
 */
export function parseChannelsFromHTML(html: string): {
  channels: Channel[];
  categories: Category[];
} {
  const channels: Channel[] = [];
  const categorySet = new Set<string>();
  const countrySet = new Set<string>();

  // Extract each item opening tag with all attributes
  // Use a flexible approach: find each <div class="item" ...> tag
  const tagRegex =
    /<div\s+class="item"([^>]*)>/g;

  let tagMatch;
  while ((tagMatch = tagRegex.exec(html)) !== null) {
    const attrs = tagMatch[1];
    const tagEndPos = tagMatch.index + tagMatch[0].length;

    // Extract attributes
    const categoriaMatch = attrs.match(/data-categoria="([^"]*)"/);
    const paisMatch = attrs.match(/data-pais="([^"]*)"/);
    const slugMatch = attrs.match(/data-slug="([^"]*)"/);

    if (!slugMatch) continue;

    const categoria = categoriaMatch ? categoriaMatch[1].trim() : '';
    const pais = paisMatch ? paisMatch[1].trim() : '';
    const slug = slugMatch[1].trim();

    // Extract stream options from onclick attribute
    // The onclick contains: cambiarOpcion(this, [{...}, ...])
    // The JSON uses single quotes inside double-quoted attribute
    const onclickMatch = attrs.match(
      /onclick="cambiarOpcion\(this,\s*(\[[\s\S]*?\])\s*\)"/,
    );

    let streamOptions: StreamOption[] = [];
    if (onclickMatch) {
      try {
        // Convert JS object notation to valid JSON
        // {url: '...', nombre: '...'} -> {"url": "...", "nombre": "..."}
        let jsonStr = onclickMatch[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/'/g, '"');

        // Handle unquoted keys like {url: "...", nombre: "..."}
        jsonStr = jsonStr.replace(
          /(\{|,)\s*(\w+)\s*:/g,
          '$1"$2":',
        );

        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          streamOptions = parsed.map(
            (opt: {url?: string; nombre?: string}, idx: number) => {
              let streamUrl = opt.url || '';
              // Make relative URLs absolute
              if (streamUrl && !streamUrl.startsWith('http')) {
                streamUrl = PELISJUANITA_URL + streamUrl;
              }
              return {
                id: `${slug}-opt-${idx}`,
                label: opt.nombre || `Opción ${idx + 1}`,
                streamUrl,
                hasAds: false,
                priority: idx,
              };
            },
          );
        }
      } catch (e) {
        console.log(`Failed to parse stream options for ${slug}:`, e);
      }
    }

    // Skip channels with no stream options
    if (streamOptions.length === 0) continue;

    // Look ahead in the HTML for the img and h2 inside this item
    // Search within the next ~500 chars for the closing content
    const contentChunk = html.substring(tagEndPos, tagEndPos + 500);

    // Extract channel name from <h2>
    const nameMatch = contentChunk.match(/<h2[^>]*>([^<]+)<\/h2>/);
    const name = nameMatch ? nameMatch[1].trim() : slug;

    // Extract logo from <img src="...">
    const imgMatch = contentChunk.match(/<img[^>]*src="([^"]*)"[^>]*>/);
    let logoUrl = '';
    if (imgMatch) {
      const src = imgMatch[1];
      if (src.startsWith('http')) {
        logoUrl = src;
      } else {
        logoUrl = PELISJUANITA_URL + src;
      }
    } else {
      logoUrl = LOGO_BASE_URL + slug + '.png';
    }

    const categoryId = categoria.toLowerCase().replace(/\s+/g, '-');
    const countryId = pais.toLowerCase().replace(/\s+/g, '-');

    if (categoria) categorySet.add(categoria);
    if (pais) countrySet.add(pais);

    channels.push({
      id: slug,
      name,
      category: categoryId,
      country: countryId,
      slug,
      logoUrl,
      streamOptions,
    });
  }

  // Build categories from genres
  const categories: Category[] = [];

  // Add genre categories first
  categorySet.forEach(cat => {
    const id = cat.toLowerCase().replace(/\s+/g, '-');
    const style = CATEGORY_STYLES[cat.toLowerCase()] || {
      color: '#5C8B8B',
      icon: '📺',
    };
    categories.push({
      id,
      name: cat,
      color: style.color,
      icon: style.icon,
    });
  });

  // Add country categories
  countrySet.forEach(country => {
    const id = 'pais-' + country.toLowerCase().replace(/\s+/g, '-');
    const flag = COUNTRY_FLAGS[country.toLowerCase()] || '🌍';
    categories.push({
      id,
      name: country,
      color: '#5C7B8B',
      icon: flag,
    });
  });

  console.log(
    `Scraped ${channels.length} channels in ${categories.length} categories`,
  );

  return {channels, categories};
}
