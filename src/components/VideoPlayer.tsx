import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {Channel, getChannelUrl} from '@/data/channels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

// Modern Chrome user agent - avoids "Dispositivo no compatible" checks
const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Chromecast HD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

interface VideoPlayerProps {
  channel: Channel;
  onError?: (error: any) => void;
}

// Block ad/popup domains
const BLOCKED_DOMAINS = [
  'acscdn.com',
  'sharethis.com',
  'adsbygoogle',
  'doubleclick.net',
  'googlesyndication',
  'popads.net',
  'popunder',
  'adnxs.com',
  'adsrvr.org',
  'googletagmanager.com',
  'google-analytics.com',
  'facebook.net',
  'hotjar.com',
  'propellerads.com',
  'exoclick.com',
  'juicyads.com',
  'trafficjunky.com',
  'clickadu.com',
  'hilltopads.net',
  'ad-maven.com',
  'admaven.com',
  'revenuehits.com',
  'popcash.net',
  'clickaine.com',
  'pushnotifications',
  'onesignal.com',
  'monetag.com',
  'bidswitch.net',
  'outbrain.com',
  'taboola.com',
];

// --- Phase 1: JS to scrape stream options from tvlibr3 channel page ---
const SCRAPER_JS = `
  (function() {
    'use strict';
    // Block popups immediately
    window.open = function() { return null; };
    window.aclib = { runPop: function() {} };
    window.alert = function() {};

    function extractStreamOptions() {
      var options = [];
      // Look for server-links nav with option links
      var links = document.querySelectorAll('.server-links a, nav.server-links a, .opciones a, .options a');

      links.forEach(function(link, index) {
        var onclick = link.getAttribute('onclick') || '';
        // Extract URL from onclick="document.getElementById('iframe').src='URL'; return false;"
        var match = onclick.match(/\\.src\\s*=\\s*'([^']+)'/);
        if (!match) {
          match = onclick.match(/\\.src\\s*=\\s*"([^"]+)"/);
        }
        if (match && match[1]) {
          var label = (link.textContent || '').trim() || ('Opcion ' + (index + 1));
          var hasAds = label.toLowerCase().indexOf('ads') !== -1 || label.toLowerCase().indexOf('ad') !== -1;
          options.push({
            url: match[1],
            label: label,
            hasAds: hasAds,
            priority: index
          });
        }
      });

      // Also check if there's a direct iframe already loaded
      if (options.length === 0) {
        var iframe = document.querySelector('iframe#iframe, iframe[name="iframe"], .iframe-wrap iframe');
        if (iframe && iframe.src && iframe.src !== 'about:blank' && iframe.src.indexOf('tvlibr3') === -1) {
          options.push({
            url: iframe.src,
            label: 'Principal',
            hasAds: false,
            priority: 0
          });
        }
      }

      return options;
    }

    // Try immediately, then retry after short delays (page might load dynamically)
    function tryExtract(attempts) {
      var options = extractStreamOptions();
      if (options.length > 0) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'stream_options',
          options: options
        }));
      } else if (attempts < 5) {
        setTimeout(function() { tryExtract(attempts + 1); }, 1000);
      } else {
        // No options found - tell RN to just play the page as-is
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'stream_options',
          options: []
        }));
      }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { tryExtract(0); });
    } else {
      tryExtract(0);
    }
  })();
  true;
`;

// --- Phase 2: CSS/JS to clean up stream provider page ---
const STREAM_CSS = `
  /* Hide everything that's not the player */
  header, footer, nav, aside,
  [class*="banner"], [class*="cookie"], [class*="popup"],
  [class*="social"], [class*="share"], [class*="overlay"]:not(:has(video)):not(:has(iframe)),
  [id*="header"], [id*="footer"], [id*="sidebar"],
  [id*="overlay"]:not(:has(video)):not(:has(iframe)),
  [id*="modal"]:not(:has(video)):not(:has(iframe)),
  [id*="popup"], [class*="advert"], [class*="sponsor"],
  [id*="ad-"], [id*="ads"], .ads, .ad,
  a[target="_blank"], .btn-close, .close-btn,
  div[class*="close"]:not(:has(video)),
  [class*="compatible"], [class*="device-check"],
  [class*="blocker"], [class*="warning"]:not(:has(video)) {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
    opacity: 0 !important;
    position: absolute !important;
    z-index: -1 !important;
  }

  /* Dark background */
  html, body {
    background: #000 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    width: 100vw !important;
    height: 100vh !important;
  }

  /* Make player containers fullscreen */
  .wrap, main, article, section, .player-card,
  .iframe-wrap, .player, .video-container,
  [class*="player"], [class*="video-wrap"] {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100vw !important;
    width: 100vw !important;
    height: 100vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    display: block !important;
    background: #000 !important;
  }

  /* Make iframes fullscreen */
  iframe {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    z-index: 99999 !important;
    border: none !important;
    margin: 0 !important;
  }

  /* Fullscreen video elements */
  video {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 99999 !important;
    object-fit: contain !important;
  }

  /* Remove any blur/filter effects */
  * {
    -webkit-filter: none !important;
    filter: none !important;
  }
  video, iframe {
    -webkit-filter: none !important;
    filter: none !important;
  }
`;

const STREAM_JS = `
  (function() {
    'use strict';

    // Block popups and ads
    window.open = function() { return null; };
    window.aclib = { runPop: function() {} };
    window.alert = function() {};
    window.confirm = function() { return false; };
    window.prompt = function() { return null; };

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = ${JSON.stringify(STREAM_CSS)};
    document.head.appendChild(style);

    // Remove ad scripts
    document.querySelectorAll('script[src*="acscdn"], script[src*="sharethis"], script[src*="aclib"], script[src*="popads"], script[src*="propeller"], script[src*="exoclick"], script[src*="monetag"]').forEach(function(s) { s.remove(); });

    // Aggressively remove overlays and "device not compatible" messages
    function cleanPage() {
      // Remove all absolute/fixed positioned overlays that aren't the video
      document.querySelectorAll('div, section, aside').forEach(function(el) {
        var style = window.getComputedStyle(el);
        var isOverlay = (style.position === 'fixed' || style.position === 'absolute') &&
                        (style.zIndex > 100 || style.backgroundColor.indexOf('rgba') !== -1);
        if (isOverlay && !el.querySelector('video') && !el.querySelector('iframe') &&
            el.tagName !== 'VIDEO' && el.tagName !== 'IFRAME') {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        }
      });

      // Remove "device not compatible" or blur elements
      document.querySelectorAll('*').forEach(function(el) {
        var text = (el.textContent || '').toLowerCase();
        var isDeviceMsg = text.indexOf('dispositivo no compatible') !== -1 ||
                          text.indexOf('device not compatible') !== -1 ||
                          text.indexOf('not supported') !== -1 ||
                          text.indexOf('no soportado') !== -1;
        if (isDeviceMsg && !el.querySelector('video') && !el.querySelector('iframe')) {
          el.style.display = 'none';
        }
      });

      // Remove blur from everything
      document.querySelectorAll('*').forEach(function(el) {
        var style = window.getComputedStyle(el);
        if (style.filter && style.filter !== 'none') {
          el.style.filter = 'none';
          el.style.webkitFilter = 'none';
        }
      });

      // Re-apply CSS
      var s = document.createElement('style');
      s.textContent = ${JSON.stringify(STREAM_CSS)};
      document.head.appendChild(s);
    }

    cleanPage();

    // Observe DOM changes and re-clean
    var observer = new MutationObserver(function() {
      setTimeout(cleanPage, 200);
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Auto-click play buttons
    setTimeout(function() {
      var playBtns = document.querySelectorAll(
        '[class*="play"], button[aria-label*="play"], .vjs-big-play-button, .ytp-large-play-button, .plyr__control--overlaid'
      );
      playBtns.forEach(function(btn) { try { btn.click(); } catch(e) {} });

      // Try clicking any center-positioned button (often play buttons)
      document.querySelectorAll('button, [role="button"]').forEach(function(btn) {
        var rect = btn.getBoundingClientRect();
        var centerX = window.innerWidth / 2;
        var centerY = window.innerHeight / 2;
        if (Math.abs(rect.left + rect.width/2 - centerX) < 200 &&
            Math.abs(rect.top + rect.height/2 - centerY) < 200) {
          try { btn.click(); } catch(e) {}
        }
      });
    }, 2000);

    // Second attempt to click play
    setTimeout(function() {
      document.querySelectorAll('[class*="play"], .vjs-big-play-button').forEach(function(btn) {
        try { btn.click(); } catch(e) {}
      });
    }, 5000);

    // Notify RN that page loaded
    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loaded'}));
  })();
  true;
`;

const STREAM_JS_BEFORE = `
  window.open = function() { return null; };
  window.aclib = { runPop: function() {} };
  window.alert = function() {};
  window.confirm = function() { return false; };
  window.prompt = function() { return null; };
  true;
`;

type Phase = 'scraping' | 'playing';

interface ScrapedOption {
  url: string;
  label: string;
  hasAds: boolean;
  priority: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [phase, setPhase] = useState<Phase>('scraping');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [httpError, setHttpError] = useState(false);
  const [statusText, setStatusText] = useState('Buscando señales...');
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [streamLabel, setStreamLabel] = useState<string>('');
  const mainUrlLoaded = useRef(false);
  const phaseRef = useRef<Phase>('scraping');
  const channelIdRef = useRef(channel.id);

  // Keep ref in sync with state
  phaseRef.current = phase;

  // Reset state when channel changes
  useEffect(() => {
    if (channelIdRef.current !== channel.id) {
      channelIdRef.current = channel.id;
      setPhase('scraping');
      phaseRef.current = 'scraping';
      setLoading(true);
      setError(false);
      setHttpError(false);
      setStreamUrl(null);
      setStreamLabel('');
      setStatusText('Buscando señales...');
      mainUrlLoaded.current = false;
    }
  }, [channel.id]);

  // If channel has stream options from Supabase, skip scraping
  useEffect(() => {
    const options = channel.streamOptions || [];
    if (options.length > 0) {
      const sorted = [...options].sort((a, b) => {
        if (a.hasAds !== b.hasAds) return a.hasAds ? 1 : -1;
        return a.priority - b.priority;
      });
      setStreamUrl(sorted[0].streamUrl);
      setStreamLabel(sorted[0].label);
      setPhase('playing');
    }
  }, [channel]);

  // Timeout fallback: if scraping takes too long, play tvlibr3 page directly
  useEffect(() => {
    if (phase !== 'scraping') return;
    const timer = setTimeout(() => {
      if (phaseRef.current === 'scraping') {
        console.log('Scraping timeout - falling back to tvlibr3 page');
        setPhase('playing');
        setStreamUrl(null);
        setStreamLabel('');
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [phase, channel.id]);

  const tvlibr3Url = getChannelUrl(channel);

  // Handle messages from injected JS (use refs to avoid stale closures)
  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'stream_options' && phaseRef.current === 'scraping') {
          const options: ScrapedOption[] = data.options || [];

          if (options.length === 0) {
            // No options found - play the tvlibr3 page as-is
            setPhase('playing');
            setStreamUrl(null);
            setStreamLabel('');
            return;
          }

          // Sort: non-ads first, then by priority
          const sorted = [...options].sort((a, b) => {
            if (a.hasAds !== b.hasAds) return a.hasAds ? 1 : -1;
            return a.priority - b.priority;
          });

          setStatusText(`Probando ${sorted.length} opciones...`);

          // Test each option and use the first working one
          testStreamOptions(sorted).then(working => {
            if (working) {
              setStreamUrl(working.url);
              setStreamLabel(working.label);
            } else {
              // None responded to HEAD/GET - use first option anyway
              // (stream providers often block direct fetch but work in WebView)
              setStreamUrl(sorted[0].url);
              setStreamLabel(sorted[0].label);
            }
            setPhase('playing');
          });
        }

        if (data.type === 'loaded' && phaseRef.current === 'playing') {
          setLoading(false);
        }
      } catch {
        // ignore
      }
    },
    [],
  );

  const handleLoadEnd = useCallback(() => {
    mainUrlLoaded.current = true;
    if (phaseRef.current === 'playing') {
      setTimeout(() => setLoading(false), 1500);
    }
  }, []);

  const handleHttpError = useCallback(
    (syntheticEvent: any) => {
      const {nativeEvent} = syntheticEvent;
      const statusCode = nativeEvent?.statusCode;
      const url = nativeEvent?.url || '';

      if (phaseRef.current === 'scraping') return;

      const isAdUrl = BLOCKED_DOMAINS.some(d => url.includes(d));
      if (isAdUrl) return;

      if (statusCode >= 400) {
        setHttpError(true);
        setLoading(false);
        onError?.(nativeEvent);
      }
    },
    [onError],
  );

  const handleError = useCallback(
    (syntheticEvent: any) => {
      if (phaseRef.current === 'scraping') return;
      if (!mainUrlLoaded.current) {
        setError(true);
        setLoading(false);
        onError?.(syntheticEvent.nativeEvent);
      }
    },
    [onError],
  );

  const handleShouldStartLoad = useCallback(
    (event: WebViewNavigation) => {
      const {url} = event;
      const isBlocked = BLOCKED_DOMAINS.some(d => url.includes(d));
      if (isBlocked) return false;
      if (url === 'about:blank') return false;
      return true;
    },
    [],
  );

  const handleRetry = useCallback(() => {
    setError(false);
    setHttpError(false);
    setLoading(true);
    setPhase('scraping');
    setStreamUrl(null);
    setStreamLabel('');
    mainUrlLoaded.current = false;
  }, []);

  const showError = error || httpError;

  // Determine what URL and JS to use based on phase
  const currentUrl = phase === 'scraping' ? tvlibr3Url : (streamUrl || tvlibr3Url);
  const currentJS = phase === 'scraping' ? SCRAPER_JS : STREAM_JS;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        key={`${channel.id}-${phase}-${streamUrl || 'default'}`}
        source={{uri: currentUrl}}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        javaScriptCanOpenWindowsAutomatically={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        injectedJavaScript={currentJS}
        injectedJavaScriptBeforeContentLoaded={STREAM_JS_BEFORE}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onHttpError={handleHttpError}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        allowsFullscreenVideo
        allowFileAccess
        thirdPartyCookiesEnabled
        cacheEnabled
        originWhitelist={['*']}
        userAgent={USER_AGENT}
      />

      {/* Loading overlay - shown during scraping and initial playing load */}
      {(phase === 'scraping' || loading) && !showError && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require('@/assets/hornero-icon.png')}
            style={styles.loadingIcon}
          />
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>
            {phase === 'scraping'
              ? `Buscando señal para ${channel.name}...`
              : `Cargando ${channel.name}...`}
          </Text>
          <Text style={styles.loadingSubtext}>
            {phase === 'scraping' ? statusText : streamLabel}
          </Text>
        </View>
      )}

      {/* Error state */}
      {showError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>No se pudo cargar el canal</Text>
          <Text style={styles.errorSubtext}>
            Verificá tu conexión a internet
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Channel name badge - top left */}
      {phase === 'playing' && !loading && !showError && (
        <View style={styles.channelBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.channelBadgeText}>{channel.name}</Text>
          {streamLabel ? (
            <Text style={styles.streamLabelText}> - {streamLabel}</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

// Test stream option URLs to find one that works
async function testStreamOptions(
  options: ScrapedOption[],
): Promise<ScrapedOption | null> {
  for (const option of options) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(option.url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      clearTimeout(timeout);
      if (response.status < 400) {
        return option;
      }
    } catch {
      // HEAD failed, try GET with minimal data
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(option.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': USER_AGENT,
            Range: 'bytes=0-0',
          },
        });
        clearTimeout(timeout);
        if (response.status < 400) {
          return option;
        }
      } catch {
        continue;
      }
    }
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  loadingText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    fontSize: FontSizes.md,
    color: Colors.white,
    fontWeight: '600',
  },
  channelBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 18, 16, 0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    zIndex: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
    marginRight: Spacing.sm,
  },
  channelBadgeText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: '600',
  },
  streamLabelText: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});
