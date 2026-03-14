import React, {useState, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {Channel, StreamOption, getChannelUrl} from '@/data/channels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

interface VideoPlayerProps {
  channel: Channel;
  /** If provided, loads this stream URL directly instead of the tvlibr3 page */
  streamOption?: StreamOption | null;
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
];

// CSS to hide site chrome and make iframe player fullscreen
const INJECTED_CSS = `
  /* Hide site chrome */
  header, footer, nav, aside,
  .channel-aside, .player-actions, .canal-wrap > h1,
  .wrap.privce, .note, .about, .watching-card,
  .helper-links, .ops, .actions-row, .server-links,
  [class*="banner"], [class*="cookie"], [class*="popup"],
  [class*="social"], [class*="share"], [class*="overlay"],
  [id*="header"], [id*="footer"], [id*="sidebar"],
  [id*="overlay"], [id*="modal"], [id*="popup"],
  .breadcrumb, .page-title, .channel-info-box,
  .ads, .ad, [class*="advert"], [class*="sponsor"],
  [id*="ad-"], [id*="ads"], div[class*="close"],
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

  /* Remove all padding/margins from containers */
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

  /* Make the player iframe fullscreen */
  iframe#iframe, iframe[name="iframe"],
  iframe:first-of-type {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    z-index: 99999 !important;
    border: none !important;
    aspect-ratio: auto !important;
    margin: 0 !important;
  }

  /* For pages without named iframe, target main video/iframe */
  .iframe-wrap iframe:only-child,
  article iframe:first-of-type {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 99999 !important;
    border: none !important;
    aspect-ratio: auto !important;
    margin: 0 !important;
  }

  /* Fullscreen video elements too */
  video {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    z-index: 99999 !important;
    object-fit: contain !important;
  }
`;

const INJECTED_JS = `
  (function() {
    'use strict';

    // Block popup/ad scripts before they execute
    window.open = function() { return null; };
    window.aclib = { runPop: function() {} };
    window.alert = function() {};
    window.confirm = function() { return false; };
    window.prompt = function() { return null; };

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = ${JSON.stringify(INJECTED_CSS)};
    document.head.appendChild(style);

    // Remove ad scripts
    var scripts = document.querySelectorAll('script[src*="acscdn"], script[src*="sharethis"], script[src*="aclib"], script[src*="popads"], script[src*="propeller"], script[src*="exoclick"]');
    scripts.forEach(function(s) { s.remove(); });

    // Remove all overlays, popups, modals
    function removeOverlays() {
      var overlays = document.querySelectorAll(
        '[class*="overlay"], [class*="popup"], [class*="modal"], [id*="overlay"], [id*="popup"], [id*="modal"], [class*="close"], .ads, .ad, [class*="advert"]'
      );
      overlays.forEach(function(el) {
        // Don't remove the video/iframe container
        if (!el.querySelector('video') && !el.querySelector('iframe') && el.tagName !== 'VIDEO' && el.tagName !== 'IFRAME') {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        }
      });
    }

    removeOverlays();

    // Re-apply CSS on DOM changes (dynamic content)
    var applied = false;
    var observer = new MutationObserver(function() {
      if (!applied) {
        applied = true;
        setTimeout(function() {
          var s = document.createElement('style');
          s.textContent = ${JSON.stringify(INJECTED_CSS)};
          document.head.appendChild(s);
          removeOverlays();
          applied = false;
        }, 100);
      }
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Auto-click play buttons after a delay
    setTimeout(function() {
      var playBtns = document.querySelectorAll(
        '[class*="play"], button[aria-label*="play"], .vjs-big-play-button, .ytp-large-play-button'
      );
      playBtns.forEach(function(btn) { try { btn.click(); } catch(e) {} });
    }, 3000);

    // Notify RN that page loaded OK
    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loaded'}));
  })();
  true;
`;

// JS injected BEFORE the page loads (blocks ads early)
const INJECTED_JS_BEFORE = `
  window.open = function() { return null; };
  window.aclib = { runPop: function() {} };
  window.alert = function() {};
  window.confirm = function() { return false; };
  window.prompt = function() { return null; };

  // Block createElement for ad iframes
  var origCreate = document.createElement.bind(document);
  document.createElement = function(tag) {
    var el = origCreate(tag);
    if (tag.toLowerCase() === 'iframe') {
      var origSetAttr = el.setAttribute.bind(el);
      el.setAttribute = function(name, value) {
        if (name === 'src' && value) {
          var blocked = ${JSON.stringify(BLOCKED_DOMAINS)};
          for (var i = 0; i < blocked.length; i++) {
            if (value.indexOf(blocked[i]) !== -1) {
              return;
            }
          }
        }
        return origSetAttr(name, value);
      };
    }
    return el;
  };
  true;
`;

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  streamOption,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [httpError, setHttpError] = useState(false);
  const mainUrlLoaded = useRef(false);

  // If a stream option is provided, use its URL directly; otherwise fall back to tvlibr3
  const channelUrl = streamOption
    ? streamOption.streamUrl
    : getChannelUrl(channel);

  const handleLoadEnd = useCallback(() => {
    // Only clear loading once the main page has had time to render
    mainUrlLoaded.current = true;
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const handleHttpError = useCallback(
    (syntheticEvent: any) => {
      const {nativeEvent} = syntheticEvent;
      const statusCode = nativeEvent?.statusCode;
      const url = nativeEvent?.url || '';

      // Ignore errors from ad domains
      const isAdUrl = BLOCKED_DOMAINS.some(d => url.includes(d));
      if (isAdUrl) return;

      // Only treat 4xx/5xx on the main page as real errors
      if (statusCode >= 400) {
        // If using stream option, any 4xx/5xx is a real error
        // If using tvlibr3, only errors from tvlibr3 domain
        const isMainUrl = streamOption
          ? url === channelUrl || url.startsWith(channelUrl)
          : url.includes('tvlibr3.com');

        if (isMainUrl) {
          setHttpError(true);
          setLoading(false);
          onError?.(nativeEvent);
        }
      }
    },
    [onError, streamOption, channelUrl],
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

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'loaded') {
        setLoading(false);
      }
    } catch {
      // ignore
    }
  }, []);

  // Block navigation to ad/popup URLs
  const handleShouldStartLoad = useCallback(
    (event: WebViewNavigation) => {
      const {url} = event;
      // Block known ad domains
      const isBlocked = BLOCKED_DOMAINS.some(d => url.includes(d));
      if (isBlocked) return false;
      // Block about:blank popups
      if (url === 'about:blank') return false;
      return true;
    },
    [],
  );

  const handleRetry = useCallback(() => {
    setError(false);
    setHttpError(false);
    setLoading(true);
    mainUrlLoaded.current = false;
    webViewRef.current?.reload();
  }, []);

  const showError = error || httpError;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
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
        userAgent="Mozilla/5.0 (Linux; Android 10; BRAVIA 4K GB) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require('@/assets/hornero-icon.png')}
            style={styles.loadingIcon}
          />
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Cargando {channel.name}...</Text>
          {streamOption && (
            <Text style={styles.loadingSubtext}>
              {streamOption.label}
            </Text>
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

      {/* Channel name badge - top left */}
      {!loading && !showError && (
        <View style={styles.channelBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.channelBadgeText}>{channel.name}</Text>
          {streamOption && (
            <Text style={styles.streamLabel}> - {streamOption.label}</Text>
          )}
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
  streamLabel: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});
