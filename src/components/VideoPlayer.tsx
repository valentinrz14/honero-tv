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
import {Channel, getChannelUrl} from '@/data/channels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

interface VideoPlayerProps {
  channel: Channel;
  onError?: (error: any) => void;
}

// Modern user agent to avoid "Dispositivo no compatible"
const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Chromecast HD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

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
  'monetag.com',
];

// CSS to hide tvlibr3 site chrome and make iframe fullscreen
const INJECTED_CSS = `
  /* Hide site chrome */
  header, footer, nav, aside,
  .channel-aside, .player-actions, .canal-wrap > h1,
  .wrap.privce, .note, .about, .watching-card,
  .helper-links, .ops, .actions-row, .server-links,
  [class*="banner"], [class*="cookie"], [class*="popup"],
  [class*="social"], [class*="share"],
  [id*="header"], [id*="footer"], [id*="sidebar"],
  .breadcrumb, .page-title, .channel-info-box {
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

  /* Make the player iframe fullscreen */
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
    aspect-ratio: auto !important;
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
    aspect-ratio: auto !important;
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
`;

const INJECTED_JS = `
  (function() {
    'use strict';

    // Block popups
    window.open = function() { return null; };
    window.aclib = { runPop: function() {} };

    // Inject CSS
    var style = document.createElement('style');
    style.textContent = ${JSON.stringify(INJECTED_CSS)};
    document.head.appendChild(style);

    // Remove ad scripts
    document.querySelectorAll('script[src*="acscdn"], script[src*="sharethis"], script[src*="aclib"]').forEach(function(s) { s.remove(); });

    // Re-apply CSS once on dynamic changes
    var applied = false;
    var observer = new MutationObserver(function() {
      if (!applied) {
        applied = true;
        setTimeout(function() {
          var s = document.createElement('style');
          s.textContent = ${JSON.stringify(INJECTED_CSS)};
          document.head.appendChild(s);
          applied = false;
        }, 500);
      }
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Auto-click play buttons after delay
    setTimeout(function() {
      var playBtns = document.querySelectorAll(
        '[class*="play"], button[aria-label*="play"], .vjs-big-play-button, .ytp-large-play-button'
      );
      playBtns.forEach(function(btn) { try { btn.click(); } catch(e) {} });
    }, 3000);

    // Notify RN that page loaded
    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loaded'}));
  })();
  true;
`;

const INJECTED_JS_BEFORE = `
  window.open = function() { return null; };
  window.aclib = { runPop: function() {} };
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
  const mainUrlLoaded = useRef(false);

  const channelUrl = getChannelUrl(channel);

  const handleLoadEnd = useCallback(() => {
    mainUrlLoaded.current = true;
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const handleHttpError = useCallback(
    (syntheticEvent: any) => {
      const {nativeEvent} = syntheticEvent;
      const statusCode = nativeEvent?.statusCode;
      const url = nativeEvent?.url || '';

      const isAdUrl = BLOCKED_DOMAINS.some(d => url.includes(d));
      if (isAdUrl) return;

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
      {loading && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require('@/assets/hornero-icon.png')}
            style={styles.loadingIcon}
          />
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Cargando {channel.name}...</Text>
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
});
