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
  /** For /en-vivo/ channels: the slug. For /eventos/ channels: the full path. */
  slug: string;
  logoUrl: string;
  description?: string;
  /** true if this channel uses the /eventos/sin-chat/ URL pattern */
  isEvento?: boolean;
  /** Stream options fetched from Supabase */
  streamOptions?: StreamOption[];
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const categories: Category[] = [
  {id: 'argentina', name: 'Argentina', color: '#8B5E3C', icon: '🇦🇷'},
  {id: 'deportes', name: 'Deportes', color: '#7B9E3C', icon: '⚽'},
  {id: 'entretenimiento', name: 'Entretenimiento', color: '#B85C3C', icon: '🎬'},
  {id: 'documentales', name: 'Documentales', color: '#5C8B3C', icon: '📚'},
  {id: 'infantiles', name: 'Infantiles', color: '#3C8B9E', icon: '🧸'},
  {id: 'musica', name: 'Música', color: '#9E3C7B', icon: '🎵'},
  {id: 'gastronomia', name: 'Gastronomía', color: '#C67B3C', icon: '🍳'},
  {id: 'uruguay', name: 'Uruguay', color: '#3C5C8B', icon: '🇺🇾'},
  {id: 'paraguay', name: 'Paraguay', color: '#8B3C5C', icon: '🇵🇾'},
  {id: 'colombia', name: 'Colombia', color: '#9E7B3C', icon: '🇨🇴'},
  {id: 'mexico', name: 'México', color: '#5C3C8B', icon: '🇲🇽'},
  {id: 'espana', name: 'España', color: '#8B5C3C', icon: '🇪🇸'},
  {id: 'eeuu', name: 'Estados Unidos', color: '#3C8B5C', icon: '🇺🇸'},
  {id: 'europa', name: 'Europa', color: '#5C8B8B', icon: '🇪🇺'},
  {id: 'adultos', name: 'Adultos (+18)', color: '#8B3C3C', icon: '🔞'},
];

export const TVLIBR3_BASE_URL = 'https://tvlibr3.com';

// All channels sourced from tvlibr3.com
export const channels: Channel[] = [
  // Argentina
  {id: 'telefe', name: 'Telefe', category: 'argentina', slug: 'telefe', logoUrl: 'https://bestleague.world/img/telefe.png'},
  {id: 'el-trece', name: 'El Trece', category: 'argentina', slug: 'el-trece', logoUrl: 'https://bestleague.world/img/eltrece.webp'},
  {id: 'el-nueve', name: 'El Nueve', category: 'argentina', slug: 'el-nueve', logoUrl: 'https://bestleague.world/img/nueve.webp'},
  {id: 'tv-publica', name: 'TV Pública', category: 'argentina', slug: 'tv-publica', logoUrl: 'https://bestleague.world/img/tvpublica.webp'},
  {id: 'america-tv', name: 'América TV', category: 'argentina', slug: 'america-tv', logoUrl: 'https://bestleague.world/img/america.webp'},
  {id: 'cronica', name: 'Crónica TV', category: 'argentina', slug: 'cronica', logoUrl: 'https://bestleague.world/img/cronica.png'},
  {id: 'c5n', name: 'C5N', category: 'argentina', slug: 'c5n', logoUrl: 'https://bestleague.world/img/c5n.webp'},
  {id: 'tn', name: 'TN', category: 'argentina', slug: 'tn', logoUrl: 'https://bestleague.world/img/tn.png'},
  {id: 'a24', name: 'A24', category: 'argentina', slug: 'a24', logoUrl: 'https://bestleague.world/img/a24.webp'},
  {id: 'canal-26', name: 'Canal 26', category: 'argentina', slug: 'canal-26', logoUrl: 'https://bestleague.world/img/canal26.webp'},
  {id: 'ln', name: 'La Nación', category: 'argentina', slug: 'ln', logoUrl: 'https://bestleague.world/img/ln.webp'},
  {id: 'dtv', name: 'Diputados TV', category: 'argentina', slug: 'dtv', logoUrl: 'https://bestleague.world/img/dtv.webp'},
  {id: 'volver', name: 'Volver', category: 'argentina', slug: 'volver', logoUrl: 'https://bestleague.world/img/volver.webp'},
  {id: 'ciudad-magazine', name: 'Ciudad Magazine', category: 'argentina', slug: 'ciudad-magazine', logoUrl: 'https://bestleague.world/img/ciudad.webp'},
  {id: 'bravotv', name: 'Bravo TV', category: 'argentina', slug: 'bravotv', logoUrl: 'https://bestleague.world/img/bravotv.png'},
  {id: 'nettv', name: 'Net TV', category: 'argentina', slug: 'nettv', logoUrl: 'https://bestleague.world/img/nettv.webp'},
  {id: 'ip', name: 'Ip Noticias', category: 'argentina', slug: 'ip', logoUrl: 'https://bestleague.world/img/ip.webp'},
  {id: 'encuentro', name: 'Encuentro', category: 'argentina', slug: 'encuentro', logoUrl: 'https://bestleague.world/img/encuentro.webp'},
  {id: 'canaldelaciudad', name: 'Canal de la Ciudad', category: 'argentina', slug: 'canaldelaciudad', logoUrl: 'https://bestleague.world/img/canaldelaciudad.webp'},
  {id: 'televida', name: 'Televida', category: 'argentina', slug: 'televida', logoUrl: 'https://bestleague.world/img/televida.webp'},
  {id: 'metro', name: 'Metro Nos Vemos', category: 'argentina', slug: 'metro', logoUrl: 'https://bestleague.world/img/metro.png'},
  {id: 'kzo', name: 'KZO', category: 'argentina', slug: 'kzo', logoUrl: 'https://bestleague.world/img/kzowhite.png'},
  {id: 'canal12cordoba', name: 'Canal 12 de Córdoba', category: 'argentina', slug: 'canal12cordoba', logoUrl: 'https://bestleague.world/img/docor.png'},
  {id: 'argentinisima', name: 'Argentinísima', category: 'argentina', slug: 'argentinisima', logoUrl: 'https://bestleague.world/img/arsat.png'},
  {id: 'rural', name: 'Rural', category: 'argentina', slug: 'rural', logoUrl: 'https://bestleague.world/img/rural.webp'},
  {id: 'flow-sports-1', name: 'Flow Sports 1', category: 'argentina', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1SWFpsYm5SdmN6RklSQQ==', logoUrl: 'https://bestleague.world/img/flowsports1.png', isEvento: true},
  {id: 'flow-sports-2', name: 'Flow Sports 2', category: 'argentina', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1SWFpsYm5SdmMxOHlYMGhF', logoUrl: 'https://bestleague.world/img/flowsports2.png', isEvento: true},

  // Uruguay
  {id: 'canal4uy', name: 'Canal 4', category: 'uruguay', slug: 'canal4uy', logoUrl: 'https://bestleague.world/img/canal4uy.webp'},
  {id: 'teledoce', name: 'Teledoce', category: 'uruguay', slug: 'teledoce', logoUrl: 'https://bestleague.world/img/teledoce.webp'},
  {id: 'canal10', name: 'Canal 10', category: 'uruguay', slug: 'canal10', logoUrl: 'https://bestleague.world/img/canal10.webp'},
  {id: 'tv-ciudad', name: 'TV Ciudad', category: 'uruguay', slug: 'tv-ciudad', logoUrl: 'https://bestleague.world/img/tvc.png'},
  {id: 'flow-eventos-uy', name: 'Flow Eventos 1 UY', category: 'uruguay', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1SWFpsYm5SdmMxOUlSRjlWZVE9PQ==', logoUrl: 'https://bestleague.world/img/eventos.png', isEvento: true},

  // Colombia
  {id: 'caracoltv', name: 'Caracol TV', category: 'colombia', slug: 'caracoltv', logoUrl: 'https://bestleague.world/img/caracoltv.webp'},

  // Paraguay
  {id: 'latele', name: 'La Tele', category: 'paraguay', slug: 'latele', logoUrl: 'https://bestleague.world/img/latele.webp'},
  {id: 'snt', name: 'SNT', category: 'paraguay', slug: 'snt', logoUrl: 'https://bestleague.world/img/snt.webp'},
  {id: 'telefuturo', name: 'Telefuturo', category: 'paraguay', slug: 'telefuturo', logoUrl: 'https://bestleague.world/img/telefuturo.webp'},
  {id: 'paravision', name: 'Paravisión', category: 'paraguay', slug: 'paravision', logoUrl: 'https://bestleague.world/img/paravision.webp'},
  {id: 'trecepy', name: 'El Trece', category: 'paraguay', slug: 'trecepy', logoUrl: 'https://bestleague.world/img/trecepy.webp'},
  {id: 'genpy', name: 'GEN', category: 'paraguay', slug: 'genpy', logoUrl: 'https://bestleague.world/img/genpy.png'},
  {id: 'c9n', name: 'C9N', category: 'paraguay', slug: 'c9n', logoUrl: 'https://bestleague.world/img/c9n.png'},
  {id: 'pytv', name: 'Paraguay TV', category: 'paraguay', slug: 'pytv', logoUrl: 'https://bestleague.world/img/pytv.png'},
  {id: 'noticiaspy', name: 'Noticias Paraguay', category: 'paraguay', slug: 'noticiaspy', logoUrl: 'https://bestleague.world/img/npy.png'},
  {id: 'venus-py', name: 'Venus', category: 'paraguay', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9kZXNkZXBhcmFndWF5LmNvbS9leHRlcm5hbC8/dmVudXNtZWRpYQ==', logoUrl: 'https://bestleague.world/img/venus.png', isEvento: true},

  // México
  {id: 'canal5-mx', name: 'Canal 5', category: 'mexico', slug: 'canal5-mx', logoUrl: 'https://bestleague.world/img/canal5.webp'},

  // Deportes
  {id: 'tyc-sports', name: 'TyC Sports', category: 'deportes', slug: 'tyc-sports', logoUrl: 'https://bestleague.world/img/tyc.webp'},
  {id: 'tnt-sports', name: 'TNT Sports Premium', category: 'deportes', slug: 'tnt-sports', logoUrl: 'https://bestleague.world/img/tntar.svg'},
  {id: 'espn-premium', name: 'ESPN Premium', category: 'deportes', slug: 'espn-premium', logoUrl: 'https://bestleague.world/img/espnpr.webp'},
  {id: 'dsports', name: 'DSports', category: 'deportes', slug: 'dsports', logoUrl: 'https://bestleague.world/img/dsports.webp'},
  {id: 'dsports-2', name: 'DSports 2', category: 'deportes', slug: 'dsports-2', logoUrl: 'https://bestleague.world/img/dsports2.webp'},
  {id: 'dsports-plus', name: 'DSports Plus', category: 'deportes', slug: 'dsports-plus', logoUrl: 'https://bestleague.world/img/dsportsplus.webp'},
  {id: 'espn', name: 'ESPN 1', category: 'deportes', slug: 'espn', logoUrl: 'https://bestleague.world/img/espn.webp'},
  {id: 'espn-2', name: 'ESPN 2', category: 'deportes', slug: 'espn-2', logoUrl: 'https://bestleague.world/img/espn2.webp'},
  {id: 'espn-3', name: 'ESPN 3', category: 'deportes', slug: 'espn-3', logoUrl: 'https://bestleague.world/img/espn3.webp'},
  {id: 'espn-4', name: 'ESPN 4', category: 'deportes', slug: 'espn-4', logoUrl: 'https://bestleague.world/img/espn4.webp'},
  {id: 'espn-5', name: 'ESPN 5', category: 'deportes', slug: 'espn-5', logoUrl: 'https://bestleague.world/img/espn5.webp'},
  {id: 'espn-6', name: 'ESPN 6', category: 'deportes', slug: 'espn-6', logoUrl: 'https://bestleague.world/img/espn6.webp'},
  {id: 'espn-7', name: 'ESPN 7', category: 'deportes', slug: 'espn-7', logoUrl: 'https://bestleague.world/img/espn7.png'},
  {id: 'fox-sports', name: 'FOX Sports 1', category: 'deportes', slug: 'fox-sports', logoUrl: 'https://bestleague.world/img/foxnew.png'},
  {id: 'fox-sports-2', name: 'FOX Sports 2', category: 'deportes', slug: 'fox-sports-2', logoUrl: 'https://bestleague.world/img/foxnew2.png'},
  {id: 'fox-sports-3', name: 'FOX Sports 3', category: 'deportes', slug: 'fox-sports-3', logoUrl: 'https://bestleague.world/img/foxnew3.png'},
  {id: 'fox-sports-mx', name: 'FOX Sports 1 MX', category: 'deportes', slug: 'fox-sports-mx', logoUrl: 'https://bestleague.world/img/foxmx.png'},
  {id: 'fox-sports-2-mx', name: 'FOX Sports 2 MX', category: 'deportes', slug: 'fox-sports-2-mx', logoUrl: 'https://bestleague.world/img/fox2mx.png'},
  {id: 'fox-sports-3-mx', name: 'FOX Sports 3 MX', category: 'deportes', slug: 'fox-sports-3-mx', logoUrl: 'https://bestleague.world/img/fox3mx.png'},
  {id: 'fox-sports-premium-mx', name: 'FOX Sports Premium MX', category: 'deportes', slug: 'fox-sports-premium-mx', logoUrl: 'https://bestleague.world/img/foxpr.png'},
  {id: 'espn-mx', name: 'ESPN 1 MX', category: 'deportes', slug: 'espn-mx', logoUrl: 'https://bestleague.world/img/espn.webp'},
  {id: 'espn-2-mx', name: 'ESPN 2 MX', category: 'deportes', slug: 'espn-2-mx', logoUrl: 'https://bestleague.world/img/espn2.webp'},
  {id: 'espn-3-mx', name: 'ESPN 3 MX', category: 'deportes', slug: 'espn-3-mx', logoUrl: 'https://bestleague.world/img/espn3.webp'},
  {id: 'espn-4-mx', name: 'ESPN 4 MX', category: 'deportes', slug: 'espn-4-mx', logoUrl: 'https://bestleague.world/img/espn4.webp'},
  {id: 'tudn', name: 'TUDN', category: 'deportes', slug: 'tudn', logoUrl: 'https://bestleague.world/img/tudn.png'},
  {id: 'espn-deportes', name: 'ESPN Deportes', category: 'deportes', slug: 'espn-deportes', logoUrl: 'https://bestleague.world/img/espndep.png'},
  {id: 'fox-deportes', name: 'FOX Deportes', category: 'deportes', slug: 'fox-deportes', logoUrl: 'https://bestleague.world/img/foxdep.png'},
  {id: 'vtv', name: 'VTV', category: 'deportes', slug: 'vtv', logoUrl: 'https://bestleague.world/img/vtv.webp'},
  {id: 'vtv-plus', name: 'VTV Plus', category: 'deportes', slug: 'vtv-plus', logoUrl: 'https://bestleague.world/img/vtvplus.webp'},
  {id: 'deportv', name: 'DeporTV', category: 'deportes', slug: 'deportv', logoUrl: 'https://bestleague.world/img/deportv.webp'},
  {id: 'nba-tv', name: 'NBA TV', category: 'deportes', slug: 'nba-tv', logoUrl: 'https://bestleague.world/img/nba.png'},
  {id: 'win-sports', name: 'Win Sports', category: 'deportes', slug: 'win-sports', logoUrl: 'https://bestleague.world/img/win.png'},
  {id: 'win-sports-premium', name: 'Win Sports +', category: 'deportes', slug: 'win-sports-premium', logoUrl: 'https://bestleague.world/img/winsports.webp'},
  {id: 'liga1max', name: 'Liga1 MAX', category: 'deportes', slug: 'liga1max', logoUrl: 'https://bestleague.world/img/liga1max.webp'},

  // Documentales
  {id: 'discovery', name: 'Discovery Channel', category: 'documentales', slug: 'discovery', logoUrl: 'https://bestleague.world/img/discovery.webp'},
  {id: 'discovery-world', name: 'Discovery World', category: 'documentales', slug: 'discovery-world', logoUrl: 'https://bestleague.world/img/disworld.webp'},
  {id: 'discovery-theater', name: 'Discovery Theater', category: 'documentales', slug: 'discovery-theater', logoUrl: 'https://bestleague.world/img/distheater.webp'},
  {id: 'discovery-science', name: 'Discovery Science', category: 'documentales', slug: 'discovery-science', logoUrl: 'https://bestleague.world/img/disscience.webp'},
  {id: 'discovery-tlc', name: 'Discovery TLC', category: 'documentales', slug: 'discovery-tlc', logoUrl: 'https://bestleague.world/img/tlc.webp'},
  {id: 'discovery-turbo', name: 'Discovery Turbo', category: 'documentales', slug: 'discovery-turbo', logoUrl: 'https://bestleague.world/img/turbo.webp'},
  {id: 'discovery-hyh', name: 'Discovery HyH', category: 'documentales', slug: 'discovery-hyh', logoUrl: 'https://bestleague.world/img/hyh.webp'},
  {id: 'discovery-id', name: 'Discovery ID', category: 'documentales', slug: 'discovery-id', logoUrl: 'https://bestleague.world/img/id.webp'},
  {id: 'lifetime', name: 'Lifetime', category: 'documentales', slug: 'lifetime', logoUrl: 'https://bestleague.world/img/lifetime.webp'},
  {id: 'history', name: 'History', category: 'documentales', slug: 'history', logoUrl: 'https://bestleague.world/img/history.webp'},
  {id: 'history-2', name: 'History 2', category: 'documentales', slug: 'history-2', logoUrl: 'https://bestleague.world/img/history2.webp'},
  {id: 'animal-planet', name: 'Animal Planet', category: 'documentales', slug: 'animal-planet', logoUrl: 'https://bestleague.world/img/aplanet.webp'},
  {id: 'natgeo', name: 'National Geographic', category: 'documentales', slug: 'natgeo', logoUrl: 'https://bestleague.world/img/natgeo.webp'},
  {id: 'love-nature', name: 'Love Nature', category: 'documentales', slug: 'love-nature', logoUrl: 'https://bestleague.world/img/lovenature.png'},
  {id: 'telemax', name: 'Telemax', category: 'documentales', slug: 'telemax', logoUrl: 'https://bestleague.world/img/telemax.webp'},
  {id: 'film-and-arts', name: 'Film & Arts', category: 'documentales', slug: 'film-and-arts', logoUrl: 'https://bestleague.world/img/film.png'},
  {id: 'sun', name: 'Sun Channel', category: 'documentales', slug: 'sun', logoUrl: 'https://bestleague.world/img/sun.png'},

  // Gastronomía
  {id: 'food-network', name: 'Food Network', category: 'gastronomia', slug: 'food-network', logoUrl: 'https://bestleague.world/img/food.webp'},
  {id: 'gourmet', name: 'Gourmet', category: 'gastronomia', slug: 'gourmet', logoUrl: 'https://bestleague.world/img/Group.svg'},

  // Entretenimiento
  {id: 'comedy-central', name: 'Comedy Central', category: 'entretenimiento', slug: 'comedy-central', logoUrl: 'https://bestleague.world/img/comedy.webp'},
  {id: 'telemundo-internacional', name: 'Telemundo Internacional', category: 'entretenimiento', slug: 'telemundo-internacional', logoUrl: 'https://bestleague.world/img/telemundo.png'},
  {id: 'ae', name: 'A&E', category: 'entretenimiento', slug: 'ae', logoUrl: 'https://bestleague.world/img/ae.webp'},
  {id: 'cinecanal', name: 'Cinecanal', category: 'entretenimiento', slug: 'cinecanal', logoUrl: 'https://bestleague.world/img/cinecanal.webp'},
  {id: 'tnt', name: 'TNT', category: 'entretenimiento', slug: 'tnt', logoUrl: 'https://bestleague.world/img/tnt.webp'},
  {id: 'tnt-series', name: 'TNT Series', category: 'entretenimiento', slug: 'tnt-series', logoUrl: 'https://bestleague.world/img/tntseries.webp'},
  {id: 'tnt-novelas', name: 'TNT Novelas', category: 'entretenimiento', slug: 'tnt-novelas', logoUrl: 'https://bestleague.world/img/tntnovelas.png'},
  {id: 'fx', name: 'FX', category: 'entretenimiento', slug: 'fx', logoUrl: 'https://bestleague.world/img/fx.webp'},
  {id: 'warner', name: 'Warner Channel', category: 'entretenimiento', slug: 'warner', logoUrl: 'https://bestleague.world/img/warner.webp'},
  {id: 'cinemax', name: 'Cinemax', category: 'entretenimiento', slug: 'cinemax', logoUrl: 'https://bestleague.world/img/cinemax.webp'},
  {id: 'space', name: 'Space', category: 'entretenimiento', slug: 'space', logoUrl: 'https://bestleague.world/img/space.webp'},
  {id: 'star-channel', name: 'Star Channel', category: 'entretenimiento', slug: 'star-channel', logoUrl: 'https://bestleague.world/img/star.webp'},
  {id: 'studio-universal', name: 'Studio Universal', category: 'entretenimiento', slug: 'studio-universal', logoUrl: 'https://bestleague.world/img/studio.webp'},
  {id: 'sony-channel', name: 'Sony Channel', category: 'entretenimiento', slug: 'sony-channel', logoUrl: 'https://bestleague.world/img/sony.webp'},
  {id: 'paramount-network', name: 'Paramount Network', category: 'entretenimiento', slug: 'paramount-network', logoUrl: 'https://bestleague.world/img/paramount.webp'},
  {id: 'amc', name: 'AMC', category: 'entretenimiento', slug: 'amc', logoUrl: 'https://bestleague.world/img/amc.webp'},
  {id: 'axn', name: 'AXN', category: 'entretenimiento', slug: 'axn', logoUrl: 'https://bestleague.world/img/axn.webp'},
  {id: 'tcm', name: 'TCM', category: 'entretenimiento', slug: 'tcm', logoUrl: 'https://bestleague.world/img/tcm.webp'},
  {id: 'e', name: 'E! Entertainment', category: 'entretenimiento', slug: 'e', logoUrl: 'https://bestleague.world/img/e.webp'},
  {id: 'a3cine', name: 'A3CINE & A3SERIES', category: 'entretenimiento', slug: 'a3cine', logoUrl: 'https://bestleague.world/img/a3cine.png'},
  {id: 'cinear', name: 'Cine AR', category: 'entretenimiento', slug: 'cinear', logoUrl: 'https://bestleague.world/img/cinear.png'},
  {id: 'hbo', name: 'HBO', category: 'entretenimiento', slug: 'hbo', logoUrl: 'https://bestleague.world/img/hbo.webp'},
  {id: 'hbo-2', name: 'HBO 2', category: 'entretenimiento', slug: 'hbo-2', logoUrl: 'https://bestleague.world/img/hbo2.webp'},
  {id: 'hbo-plus', name: 'HBO Plus', category: 'entretenimiento', slug: 'hbo-plus', logoUrl: 'https://bestleague.world/img/hboplus.webp'},
  {id: 'hbo-family', name: 'HBO Family', category: 'entretenimiento', slug: 'hbo-family', logoUrl: 'https://bestleague.world/img/hbofam.webp'},
  {id: 'hbo-xtreme', name: 'HBO Xtreme', category: 'entretenimiento', slug: 'hbo-xtreme', logoUrl: 'https://bestleague.world/img/hboxtreme.webp'},
  {id: 'hbo-mundi', name: 'HBO Mundi', category: 'entretenimiento', slug: 'hbo-mundi', logoUrl: 'https://bestleague.world/img/hbomundi.webp'},
  {id: 'hbo-pop', name: 'HBO Pop', category: 'entretenimiento', slug: 'hbo-pop', logoUrl: 'https://bestleague.world/img/hbopop.webp'},
  {id: 'hbo-sig', name: 'HBO Signature', category: 'entretenimiento', slug: 'hbo-sig', logoUrl: 'https://bestleague.world/img/hbosig.webp'},
  {id: 'universal-cinema', name: 'Universal Cinema', category: 'entretenimiento', slug: 'universal-cinema', logoUrl: 'https://bestleague.world/img/universalcinema.webp'},
  {id: 'universal-crime', name: 'Universal Crime', category: 'entretenimiento', slug: 'universal-crime', logoUrl: 'https://bestleague.world/img/universalcrime.webp'},
  {id: 'universal-comedy', name: 'Universal Comedy', category: 'entretenimiento', slug: 'universal-comedy', logoUrl: 'https://bestleague.world/img/universalcomedy.webp'},
  {id: 'universal-reality', name: 'Universal Reality', category: 'entretenimiento', slug: 'universal-reality', logoUrl: 'https://bestleague.world/img/universalreality.webp'},
  {id: 'universal-premiere', name: 'Universal Premiere', category: 'entretenimiento', slug: 'universal-premiere', logoUrl: 'https://bestleague.world/img/universalpremiere.webp'},
  {id: 'golden', name: 'Golden', category: 'entretenimiento', slug: 'golden', logoUrl: 'https://bestleague.world/img/Logo_Golden_TV.svg'},
  {id: 'estrellas', name: 'Las Estrellas', category: 'entretenimiento', slug: 'estrellas', logoUrl: 'https://bestleague.world/img/estrellas.png'},
  {id: 'eurochannel', name: 'Eurochannel', category: 'entretenimiento', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1SWFZ5YjJOb1lXNXVaV3c9', logoUrl: 'https://bestleague.world/img/eurochannel.png', isEvento: true},
  {id: 'europa-europa', name: 'Europa Europa', category: 'entretenimiento', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1SWFZ5YjNCaFgwVjFjbTl3WVE=', logoUrl: 'https://bestleague.world/img/eueu.png', isEvento: true},
  {id: 'garage-tv', name: 'El Garage TV', category: 'entretenimiento', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1SV3hmUjJGeVlXZGw=', logoUrl: 'https://bestleague.world/img/garagetv.webp', isEvento: true},
  {id: 'hola-tv', name: '¡Hola! TV', category: 'entretenimiento', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1TRzlzWVY5VVZnPT0=', logoUrl: 'https://bestleague.world/img/holatv.jpg', isEvento: true},
  {id: 'amc-series', name: 'AMC Series', category: 'entretenimiento', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1RVTFEWDFObGNtbGxjdz09', logoUrl: 'https://bestleague.world/img/amc-sr.png', isEvento: true},
  {id: 'usa-network', name: 'USA Network', category: 'entretenimiento', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1WVk5CWDA1bGRIZHZjbXM9', logoUrl: 'https://bestleague.world/img/uss.png', isEvento: true},
  {id: 'tv5monde', name: 'TV5MONDE América Latina', category: 'entretenimiento', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1WRlkxWDAxdmJtUmw=', logoUrl: 'https://bestleague.world/img/tv5monde.png', isEvento: true},
  {id: 'adult-swim', name: 'Adult Swim', category: 'entretenimiento', slug: 'adult-swim', logoUrl: 'https://bestleague.world/img/adults.png'},

  // Infantiles
  {id: 'cartoon-network', name: 'Cartoon Network', category: 'infantiles', slug: 'cartoon-network', logoUrl: 'https://bestleague.world/img/cn.webp'},
  {id: 'cartoonito', name: 'Cartoonito', category: 'infantiles', slug: 'cartoonito', logoUrl: 'https://bestleague.world/img/cart.webp'},
  {id: 'disney-channel', name: 'Disney Channel', category: 'infantiles', slug: 'disney-channel', logoUrl: 'https://bestleague.world/img/disney.webp'},
  {id: 'disney-jr', name: 'Disney Junior', category: 'infantiles', slug: 'disney-jr', logoUrl: 'https://bestleague.world/img/disneyjr.webp'},
  {id: 'discovery-kids', name: 'Discovery Kids', category: 'infantiles', slug: 'discovery-kids', logoUrl: 'https://bestleague.world/img/diskids.webp'},
  {id: 'nick', name: 'Nickelodeon', category: 'infantiles', slug: 'nick', logoUrl: 'https://bestleague.world/img/nick.png'},
  {id: 'nickjr', name: 'Nick Jr.', category: 'infantiles', slug: 'nickjr', logoUrl: 'https://bestleague.world/img/nickjr.webp'},
  {id: 'dreamworks', name: 'DreamWorks', category: 'infantiles', slug: 'dreamworks', logoUrl: 'https://bestleague.world/img/dream.png'},
  {id: 'pakapaka', name: 'Pakapaka', category: 'infantiles', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1VRUZMUVY5UVFVdEI=', logoUrl: 'https://bestleague.world/img/pakapaka.png', isEvento: true},

  // Música
  {id: 'quiero-musica', name: 'Quiero Música', category: 'musica', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1VWFZwWlhKdlgwaEU=', logoUrl: 'https://bestleague.world/img/quiero.webp', isEvento: true},
  {id: 'mtv', name: 'MTV', category: 'musica', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1UVlJXWDBoRQ==', logoUrl: 'https://bestleague.world/img/mtv.webp', isEvento: true},
  {id: 'mtv-hits', name: 'MTV Hits', category: 'musica', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1UVlJXWDBocGRITT0=', logoUrl: 'https://bestleague.world/img/mtvhts.webp', isEvento: true},
  {id: 'mtv-00s', name: 'MTV 00s', category: 'musica', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1UVlJXTURBPQ==', logoUrl: 'https://bestleague.world/img/mtv00s.png', isEvento: true},
  {id: 'htv', name: 'HTV', category: 'musica', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1TRlJX', logoUrl: 'https://bestleague.world/img/htv.webp', isEvento: true},
  {id: 'cm', name: 'CM', category: 'musica', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1RMDA9', logoUrl: 'https://bestleague.world/img/cm.webp', isEvento: true},
  {id: 'flow-music', name: 'Flow Music', category: 'musica', slug: 'flow-music', logoUrl: 'https://bestleague.world/img/flowmusic.webp'},

  // España
  {id: 'tve-internacional', name: 'TVE Internacional', category: 'espana', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1WRlpmUlhOd1lXNWg=', logoUrl: 'https://bestleague.world/img/tvees.png', isEvento: true},
  {id: 'antena3', name: 'Antena 3', category: 'espana', slug: 'antena3', logoUrl: 'https://bestleague.world/img/antena3.webp'},
  {id: 'la1', name: 'La 1', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9TEEx&vpnes=on', logoUrl: 'https://bestleague.world/img/la1.png', isEvento: true},
  {id: 'la2', name: 'La 2', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9TEEy&vpnes=on', logoUrl: 'https://bestleague.world/img/la2.png', isEvento: true},
  {id: 'cuatro', name: 'Cuatro', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9Q1VBVFJP&vpnes=on', logoUrl: 'https://bestleague.world/img/cuatro.png', isEvento: true},
  {id: 'telecinco', name: 'Telecinco', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9VEVMRUNJTkNP&vpnes=on', logoUrl: 'https://bestleague.world/img/telecinco.png', isEvento: true},
  {id: 'lasexta', name: 'La Sexta', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9TEFTRVhUQQ==&vpnes=on', logoUrl: 'https://bestleague.world/img/lasexta.png', isEvento: true},
  {id: 'fdf', name: 'FDF', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9RkRG&vpnes=on', logoUrl: 'https://bestleague.world/img/fdf.png', isEvento: true},
  {id: 'amc-break', name: 'AMC Break', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9QU1DX0JSRUFL&vpnes=on', logoUrl: 'https://bestleague.world/img/amcbk.png', isEvento: true},
  {id: 'dark', name: 'Dark', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9REFSSw==&vpnes=on', logoUrl: 'https://bestleague.world/img/dark.png', isEvento: true},
  {id: 'dkiss', name: 'DKISS', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9RF9LSVNT&vpnes=on', logoUrl: 'https://bestleague.world/img/dkiss.png', isEvento: true},
  {id: 'odisea', name: 'Odisea', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9T0RJU0VB&vpnes=on', logoUrl: 'https://bestleague.world/img/odisea.png', isEvento: true},
  {id: 'bemad', name: 'Be Mad', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9Ql9NQUQ=&vpnes=on', logoUrl: 'https://bestleague.world/img/b-mad.png', isEvento: true},
  {id: 'mega', name: 'MEGA', category: 'espana', slug: '/eventos/sin-chat/?r=aHR0cHM6Ly9iZXN0bGVhZ3VlLndvcmxkL2NsYXBwci8/aWQ9TUVHQQ==&vpnes=on', logoUrl: 'https://bestleague.world/img/mega.png', isEvento: true},

  // Estados Unidos
  {id: 'universo', name: 'Universo', category: 'eeuu', slug: 'universo', logoUrl: 'https://bestleague.world/img/universo.png'},
  {id: 'univision', name: 'Univisión', category: 'eeuu', slug: 'univision', logoUrl: 'https://bestleague.world/img/univision.png'},

  // Europa
  {id: 'euronews', name: 'Euronews', category: 'europa', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1SWFZ5YjI1bGQzTT0=', logoUrl: 'https://bestleague.world/img/euronews.png', isEvento: true},

  // Adultos (+18)
  {id: 'venus-adult', name: 'Venus', category: 'adultos', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1WbVZ1ZFhNPQ==', logoUrl: 'https://bestleague.world/img/venuspaj.png', isEvento: true},
  {id: 'sextreme', name: 'SeXtreme', category: 'adultos', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1VMlY0ZEhKbGJXVQ==', logoUrl: 'https://bestleague.world/img/sextreme.png', isEvento: true},
  {id: 'playboy', name: 'Playboy TV', category: 'adultos', slug: '/eventos/sin-chat/?r=L2h0bWwvZmwvP2dldD1VR3hoZVdKdmVR', logoUrl: 'https://bestleague.world/img/playboy.png', isEvento: true},
];

export function getChannelUrl(channel: Channel): string {
  if (channel.isEvento) {
    return `${TVLIBR3_BASE_URL}${channel.slug}`;
  }
  return `${TVLIBR3_BASE_URL}/en-vivo/${channel.slug}`;
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
