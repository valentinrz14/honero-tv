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

// CSS to hide tvlibr3 chrome and make the iframe player fullscreen
const FULLSCREEN_CSS = `
  /* Hide everything except the iframe player */
  header, footer, nav, aside,
  .channel-aside, .player-actions, .canal-wrap > h1,
  .wrap.privce, .note, .about, .watching-card,
  .helper-links, .ops, .actions-row, .server-links,
  [class*="banner"], [class*="cookie"], [class*="popup"],
  [class*="social"], [class*="share"],
  [id*="header"], [id*="footer"], [id*="sidebar"],
  .breadcrumb, .page-title, .channel-info-box,
  .ads, .ad, [class*="advert"], [class*="sponsor"],
  [id*="ad-"], [id*="ads"],
  a[target="_blank"], .btn-close, .close-btn {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
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

  /* Remove padding from containers */
  .wrap, .canal-wrap, main, .channel-layout,
  .player-card, .iframe-wrap, article {
    margin: 0 !important;
    padding: 0 !important;
    max-width: 100vw !important;
    width: 100vw !important;
    height: 100vh !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    display: block !important;
  }

  /* Make player iframe fullscreen */
  iframe#iframe, iframe[name="iframe"] {
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

  /* For pages without named iframe */
  .iframe-wrap iframe:only-child,
  article iframe:first-of-type {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
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

  /* Remove blur/filter effects */
  * {
    -webkit-filter: none !important;
    filter: none !important;
  }
`;

// Single JS that: scrapes options, picks the best, clicks it, and cleans up the page
const INJECTED_JS = `
  (function() {
    'use strict';

    // Block popups and ads immediately
    window.open = function() { return null; };
    window.aclib = { runPop: function() {} };
    window.alert = function() {};
    window.confirm = function() { return false; };
    window.prompt = function() { return null; };

    // Inject fullscreen CSS
    function injectCSS() {
      var style = document.createElement('style');
      style.id = 'hornero-css';
      style.textContent = ${JSON.stringify(FULLSCREEN_CSS)};
      document.head.appendChild(style);
    }
    injectCSS();

    // Remove ad scripts
    document.querySelectorAll(
      'script[src*="acscdn"], script[src*="sharethis"], script[src*="aclib"], ' +
      'script[src*="popads"], script[src*="propeller"], script[src*="exoclick"], ' +
      'script[src*="monetag"]'
    ).forEach(function(s) { s.remove(); });

    // Extract stream option URLs from the server-links nav
    function extractOptions() {
      var options = [];
      var links = document.querySelectorAll('.server-links a, nav.server-links a');

      links.forEach(function(link, index) {
        var onclick = link.getAttribute('onclick') || '';
        var match = onclick.match(/\\.src\\s*=\\s*'([^']+)'/) ||
                    onclick.match(/\\.src\\s*=\\s*"([^"]+)"/);
        if (match && match[1]) {
          var label = (link.textContent || '').trim() || ('Opcion ' + (index + 1));
          var hasAds = label.toLowerCase().indexOf('ads') !== -1;
          options.push({
            url: match[1],
            label: label,
            hasAds: hasAds,
            index: index,
            element: link
          });
        }
      });
      return options;
    }

    // Pick the best option: prefer non-ads, use first available
    function pickBest(options) {
      // Sort: non-ads first
      var sorted = options.slice().sort(function(a, b) {
        if (a.hasAds !== b.hasAds) return a.hasAds ? 1 : -1;
        return a.index - b.index;
      });
      return sorted[0] || null;
    }

    // Click the best option to load it in the iframe (keeps referrer!)
    function activateBestOption(options) {
      var best = pickBest(options);
      if (best && best.element) {
        // Click the link to trigger its onclick handler
        try { best.element.click(); } catch(e) {}

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'stream_activated',
          label: best.label,
          url: best.url
        }));
      } else if (best) {
        // Fallback: set iframe src directly
        var iframe = document.querySelector('iframe#iframe, iframe[name="iframe"]');
        if (iframe) {
          iframe.src = best.url;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'stream_activated',
            label: best.label,
            url: best.url
          }));
        }
      }
    }

    // Try to extract and activate, with retries
    function tryActivate(attempts) {
      var options = extractOptions();
      if (options.length > 0) {
        activateBestOption(options);
        // Re-inject CSS after option click (DOM might change)
        setTimeout(injectCSS, 500);
        setTimeout(injectCSS, 2000);
      } else if (attempts < 8) {
        // Retry - page might still be loading
        setTimeout(function() { tryActivate(attempts + 1); }, 1000);
      } else {
        // No options found - check if there's already an iframe playing
        var iframe = document.querySelector('iframe#iframe, iframe[name="iframe"]');
        if (iframe && iframe.src && iframe.src !== 'about:blank') {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'stream_activated',
            label: 'Principal',
            url: iframe.src
          }));
        } else {
          // Nothing found - just show what we have
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'stream_activated',
            label: '',
            url: ''
          }));
        }
      }
    }

    // Re-apply CSS on DOM changes
    var cssApplied = false;
    var observer = new MutationObserver(function() {
      if (!cssApplied) {
        cssApplied = true;
        setTimeout(function() {
          injectCSS();
          cssApplied = false;
        }, 200);
      }
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Auto-click play buttons after stream loads
    setTimeout(function() {
      var playBtns = document.querySelectorAll(
        '[class*="play"], button[aria-label*="play"], .vjs-big-play-button, .ytp-large-play-button'
      );
      playBtns.forEach(function(btn) { try { btn.click(); } catch(e) {} });
    }, 4000);

    // Start extraction
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { tryActivate(0); });
    } else {
      tryActivate(0);
    }
  })();
  true;
`;

// JS before page loads
const INJECTED_JS_BEFORE = `
  window.open = function() { return null; };
  window.aclib = { runPop: function() {} };
  window.alert = function() {};
  window.confirm = function() { return false; };
  window.prompt = function() { return null; };
  true;
`;

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [httpError, setHttpError] = useState(false);
  const [streamLabel, setStreamLabel] = useState<string>('');
  const mainUrlLoaded = useRef(false);

  const channelUrl = getChannelUrl(channel);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'stream_activated') {
        setStreamLabel(data.label || '');
        // Give the iframe a moment to load the stream
        setTimeout(() => setLoading(false), 2500);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLoadEnd = useCallback(() => {
    mainUrlLoaded.current = true;
    // Fallback: if no stream_activated message after a while, clear loading anyway
    setTimeout(() => setLoading(false), 12000);
  }, []);

  const handleHttpError = useCallback(
    (syntheticEvent: any) => {
      const {nativeEvent} = syntheticEvent;
      const statusCode = nativeEvent?.statusCode;
      const url = nativeEvent?.url || '';

      const isAdUrl = BLOCKED_DOMAINS.some(d => url.includes(d));
      if (isAdUrl) return;

      // Only error on main tvlibr3 page failure
      if (statusCode >= 400 && url.includes('tvlibr3.com')) {
        setHttpError(true);
        setLoading(false);
        onError?.(nativeEvent);
      }
    },
    [onError],
  );

  const handleError = useCallback(
    (syntheticEvent: any) => {
      if (!mainUrlLoaded.current) {
        setError(true);
        setLoading(false);
        onError?.(syntheticEvent.nativeEvent);
      }
    },
    [onError],
  );

  const handleShouldStartLoad = useCallback((event: WebViewNavigation) => {
    const {url} = event;
    const isBlocked = BLOCKED_DOMAINS.some(d => url.includes(d));
    if (isBlocked) return false;
    if (url === 'about:blank') return false;
    return true;
  }, []);

  const handleRetry = useCallback(() => {
    setError(false);
    setHttpError(false);
    setLoading(true);
    setStreamLabel('');
    mainUrlLoaded.current = false;
    webViewRef.current?.reload();
  }, []);

  const showError = error || httpError;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        key={channel.id}
        source={{uri: channelUrl}}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        javaScriptCanOpenWindowsAutomatically={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        injectedJavaScript={INJECTED_JS}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JS_BEFORE}
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

      {/* Loading overlay */}
      {loading && !showError && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require('@/assets/hornero-icon.png')}
            style={styles.loadingIcon}
          />
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>
            Cargando {channel.name}...
          </Text>
          {streamLabel ? (
            <Text style={styles.loadingSubtext}>{streamLabel}</Text>
          ) : (
            <Text style={styles.loadingSubtext}>Buscando mejor señal...</Text>
          )}
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

      {/* Channel name badge */}
      {!loading && !showError && (
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
