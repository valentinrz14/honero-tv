import {Channel, Category, StreamOption} from '@/data/channels';

export const PELISJUANITA_URL = 'https://pelisjuanita.com/tv/';
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
 * JS to inject into the WebView that extracts channel data from the DOM.
 * This runs inside the real browser context, so it has full DOM access.
 */
export const SCRAPE_INJECTION_JS = `
(function() {
  try {
    var items = document.querySelectorAll('.item');
    var channels = [];

    items.forEach(function(item) {
      var categoria = item.getAttribute('data-categoria') || '';
      var pais = item.getAttribute('data-pais') || '';
      var slug = item.getAttribute('data-slug') || '';

      if (!slug) return;

      // Get channel name
      var h2 = item.querySelector('h2');
      var name = h2 ? h2.textContent.trim() : slug;

      // Get logo URL
      var img = item.querySelector('img');
      var logoSrc = img ? img.getAttribute('src') : '';

      // Extract stream options from onclick attribute
      var onclick = item.getAttribute('onclick') || '';
      var options = [];

      // The onclick is: cambiarOpcion(this, [{url:'...', nombre:'...'}, ...])
      // Extract the array part
      var match = onclick.match(/cambiarOpcion\\(this,\\s*(\\[.*\\])\\s*\\)/);
      if (match) {
        try {
          // eval is safe here - we're in a sandboxed WebView context
          options = eval('(' + match[1] + ')');
        } catch(e) {
          // Try JSON.parse as fallback
          try {
            var jsonStr = match[1].replace(/'/g, '"');
            jsonStr = jsonStr.replace(/(\\{|,)\\s*(\\w+)\\s*:/g, '$1"$2":');
            options = JSON.parse(jsonStr);
          } catch(e2) {}
        }
      }

      if (!options || options.length === 0) return;

      channels.push({
        slug: slug,
        name: name,
        categoria: categoria,
        pais: pais,
        logoSrc: logoSrc,
        rawOnclick: match ? match[1] : '',
        options: options.map(function(opt) {
          return { url: opt.url || '', nombre: opt.nombre || '' };
        })
      });
    });

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'scrape_result',
      channels: channels,
      total: channels.length
    }));
  } catch(err) {
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'scrape_error',
      error: err.message || String(err)
    }));
  }
})();
true;
`;

/**
 * Global promise resolver for WebView scraping.
 * The WebView component calls this when it receives data.
 */
let _resolveChannels: ((data: {channels: Channel[]; categories: Category[]}) => void) | null = null;
let _rejectChannels: ((err: Error) => void) | null = null;
let _scrapeTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Called by the ScraperWebView component when it receives scraped data.
 */
export function onScrapeResult(rawChannels: RawScrapedChannel[]): void {
  if (!_resolveChannels) return;

  const result = transformScrapedData(rawChannels);
  _resolveChannels(result);
  _resolveChannels = null;
  _rejectChannels = null;
  if (_scrapeTimeout) {
    clearTimeout(_scrapeTimeout);
    _scrapeTimeout = null;
  }
}

/**
 * Called by the ScraperWebView component on error.
 */
export function onScrapeError(errorMsg: string): void {
  if (!_rejectChannels) return;

  _rejectChannels(new Error(errorMsg));
  _resolveChannels = null;
  _rejectChannels = null;
  if (_scrapeTimeout) {
    clearTimeout(_scrapeTimeout);
    _scrapeTimeout = null;
  }
}

/**
 * Request channel scraping. Returns a promise that resolves when
 * the WebView finishes scraping and calls onScrapeResult.
 */
export function scrapeChannels(): Promise<{
  channels: Channel[];
  categories: Category[];
}> {
  return new Promise((resolve, reject) => {
    // Cancel any previous pending scrape
    if (_rejectChannels) {
      _rejectChannels(new Error('Cancelled by new scrape request'));
    }

    _resolveChannels = resolve;
    _rejectChannels = reject;

    // Timeout after 30 seconds (page needs time for external JS to render DOM)
    _scrapeTimeout = setTimeout(() => {
      if (_rejectChannels) {
        _rejectChannels(new Error('Scraping timed out after 30s'));
        _resolveChannels = null;
        _rejectChannels = null;
      }
    }, 30000);
  });
}

/**
 * Check if a scrape is currently pending (WebView should be visible).
 */
export function isScraping(): boolean {
  return _resolveChannels !== null;
}

export interface RawScrapedChannel {
  slug: string;
  name: string;
  categoria: string;
  pais: string;
  logoSrc: string;
  rawOnclick: string;
  options: Array<{url: string; nombre: string}>;
}

/**
 * Transform raw scraped data into our app's Channel/Category format.
 */
function transformScrapedData(rawChannels: RawScrapedChannel[]): {
  channels: Channel[];
  categories: Category[];
} {
  const channels: Channel[] = [];
  const categorySet = new Set<string>();
  const countrySet = new Set<string>();

  for (const raw of rawChannels) {
    if (!raw.options || raw.options.length === 0) continue;

    // Skip "Agenda Deportiva" - it's not a real channel
    if (
      raw.slug === 'agenda-deportiva' ||
      raw.name.toLowerCase().includes('agenda deportiva')
    ) {
      continue;
    }

    const streamOptions: StreamOption[] = raw.options.map((opt, idx) => {
      let streamUrl = opt.url || '';
      if (streamUrl && !streamUrl.startsWith('http')) {
        streamUrl = PELISJUANITA_URL + streamUrl;
      }
      return {
        id: `${raw.slug}-opt-${idx}`,
        label: opt.nombre || `Opción ${idx + 1}`,
        streamUrl,
        hasAds: false,
        priority: idx,
      };
    });

    // Build logo URL
    let logoUrl = '';
    if (raw.logoSrc) {
      if (raw.logoSrc.startsWith('http')) {
        logoUrl = raw.logoSrc;
      } else {
        logoUrl = PELISJUANITA_URL + raw.logoSrc;
      }
    } else {
      logoUrl = LOGO_BASE_URL + raw.slug + '.png';
    }

    const categoryId = raw.categoria.toLowerCase().replace(/\s+/g, '-');
    const countryId = raw.pais.toLowerCase().replace(/\s+/g, '-');

    if (raw.categoria) categorySet.add(raw.categoria);
    if (raw.pais) countrySet.add(raw.pais);

    channels.push({
      id: raw.slug,
      name: raw.name,
      category: categoryId,
      country: countryId,
      slug: raw.slug,
      logoUrl,
      streamOptions,
      rawOnclickOptions: raw.rawOnclick || '',
    });
  }

  // Build categories
  const categories: Category[] = [];

  categorySet.forEach(cat => {
    const id = cat.toLowerCase().replace(/\s+/g, '-');
    const style = CATEGORY_STYLES[cat.toLowerCase()] || {
      color: '#5C8B8B',
      icon: '📺',
    };
    categories.push({id, name: cat, color: style.color, icon: style.icon});
  });

  countrySet.forEach(country => {
    const id = 'pais-' + country.toLowerCase().replace(/\s+/g, '-');
    const flag = COUNTRY_FLAGS[country.toLowerCase()] || '🌍';
    categories.push({id, name: country, color: '#5C7B8B', icon: flag});
  });

  console.log(
    `Scraped ${channels.length} channels in ${categories.length} categories`,
  );

  return {channels, categories};
}
