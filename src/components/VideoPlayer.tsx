import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {Channel} from '@/data/channels';
import {PELISJUANITA_URL} from '@/lib/scraper';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

export interface VideoPlayerHandle {
  togglePlayPause: () => void;
  mute: () => void;
  unmute: () => void;
  volumeUp: () => void;
  volumeDown: () => void;
  retry: () => void;
  hasError: () => boolean;
}

interface VideoPlayerProps {
  channel: Channel;
  onError?: (error: any) => void;
  onErrorStateChange?: (hasError: boolean) => void;
}

// Modern user agent to avoid device compatibility issues
const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Chromecast HD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Block ad/popup domains (NOT doubleclick/googlesyndication - YouTube needs them)
const BLOCKED_DOMAINS = [
  'acscdn.com',
  'sharethis.com',
  'popads.net',
  'popunder',
  'adnxs.com',
  'adsrvr.org',
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

// CSS to hide pelisjuanita chrome and make player fullscreen
const FULLSCREEN_CSS = `
  /* Hide everything except the player area */
  header, footer, nav, aside,
  .filtros, .items, .canales-grid, .channel-list,
  .nota, .about, .watching-card, .search-bar,
  .helper-links, .actions-row, .server-links,
  [class*="banner"], [class*="cookie"], [class*="popup"],
  [class*="social"], [class*="share"], [class*="filtro"],
  [id*="header"], [id*="footer"], [id*="sidebar"],
  .breadcrumb, .page-title, .channel-info-box,
  .ads, .ad, [class*="ad-"], [id*="ad-"],
  .overlay:not(.player-overlay), .modal, .popup,
  h1, h2, h3, p, .logo, .menu, .categoria-title,
  .opciones, .servidores, .btn-group,
  script[src*="acscdn"], script[src*="aclib"] {
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

  /* Make the player container fullscreen */
  .reproductor, .player, .player-container, .video-container,
  .iframe-container, .embed-responsive, #reproductor, #player {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: 99998 !important;
    display: block !important;
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
`;

/**
 * Build JS to inject after pelisjuanita.com/tv/ loads.
 * It calls cambiarOpcion() to start the channel, then applies fullscreen CSS.
 */
function buildInjectedJS(channel: Channel): string {
  const rawOptions = channel.rawOnclickOptions || '';

  return `
(function() {
  'use strict';

  // Block popups
  window.open = function() { return null; };

  // Remove ad scripts immediately
  function removeAds() {
    document.querySelectorAll(
      'script[src*="acscdn"], script[src*="sharethis"], script[src*="aclib"], ' +
      '[class*="ad-"], [id*="ad-"], .ads, .ad'
    ).forEach(function(el) { el.remove(); });
  }
  removeAds();

  // Find the channel item and click it to trigger cambiarOpcion
  var slug = ${JSON.stringify(channel.slug)};
  var rawOptions = ${JSON.stringify(rawOptions)};

  function startChannel() {
    // Method 1: Use the raw onclick options directly
    if (rawOptions && typeof cambiarOpcion === 'function') {
      try {
        var options = eval('(' + rawOptions + ')');
        // Find the item element by slug to pass as 'this' context
        var item = document.querySelector('.item[data-slug="' + slug + '"]');
        if (item) {
          cambiarOpcion(item, options);
          applyFullscreen();
          return true;
        }
        // If no item found, try creating a dummy element
        var dummy = document.createElement('div');
        dummy.className = 'item';
        dummy.setAttribute('data-slug', slug);
        document.body.appendChild(dummy);
        cambiarOpcion(dummy, options);
        applyFullscreen();
        return true;
      } catch(e) {
        console.log('cambiarOpcion error:', e);
      }
    }

    // Method 2: Click the item directly
    var item = document.querySelector('.item[data-slug="' + slug + '"]');
    if (item) {
      item.click();
      applyFullscreen();
      return true;
    }

    return false;
  }

  // Single style element - reuse it, never create duplicates
  var _styleEl = null;
  function applyFullscreen() {
    // Apply CSS once using a single style element
    if (!_styleEl) {
      _styleEl = document.createElement('style');
      _styleEl.id = 'honero-fullscreen';
      document.head.appendChild(_styleEl);
    }
    _styleEl.textContent = ${JSON.stringify(FULLSCREEN_CSS)};
    removeAds();

    // Wait for the iframe/player to be created, then make body visible and notify RN
    setTimeout(function() {
      // Make body visible - only the player iframe should be showing
      document.body.style.visibility = 'visible';
      removeAds();

      window.ReactNativeWebView.postMessage(JSON.stringify({type: 'playing'}));
    }, 1500);

    // Watch for new ad elements and detect geo-block messages
    var observerCount = 0;
    var observer = new MutationObserver(function(mutations) {
      observerCount++;
      if (observerCount > 15) {
        observer.disconnect();
        return;
      }
      removeAds();

      // Check for geo-block or VPN error messages in the page
      var bodyText = document.body ? document.body.innerText.toLowerCase() : '';
      if (bodyText.indexOf('vpn') !== -1 && bodyText.indexOf('region') !== -1 ||
          bodyText.indexOf('not available in your') !== -1 ||
          bodyText.indexOf('no disponible en tu') !== -1 ||
          bodyText.indexOf('geo') !== -1 && bodyText.indexOf('block') !== -1) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'error',
          message: 'Canal con restricción geográfica'
        }));
        observer.disconnect();
      }
    });
    if (document.body) {
      // Only watch direct children, not subtree - avoids YouTube player mutations
      observer.observe(document.body, { childList: true });
    }
  }

  // Try to start the channel after the page renders
  if (!startChannel()) {
    // If the page hasn't fully rendered yet, try again after a delay
    setTimeout(function() {
      if (!startChannel()) {
        setTimeout(function() {
          if (!startChannel()) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: 'No se encontró el canal'
            }));
          }
        }, 3000);
      }
    }, 2000);
  }
})();
true;
`;
}

// JS that runs BEFORE page content loads - hides everything immediately
const INJECTED_JS_BEFORE = `
  window.open = function() { return null; };
  // Hide body immediately so the page is never visible
  document.addEventListener('DOMContentLoaded', function() {
    document.body.style.cssText = 'background:#000!important;visibility:hidden!important;';
  });
  // Also try to hide via documentElement for even earlier effect
  if (document.documentElement) {
    document.documentElement.style.cssText = 'background:#000!important;';
  }
  true;
`;

// Helper JS function shared across mute/unmute/toggle scripts.
// It finds all reachable <video> and <audio> elements (including same-origin iframes)
// and also sends YouTube postMessage commands for cross-origin YouTube iframes.
const MEDIA_HELPER_JS = `
function _honeroFindMedia() {
  var media = Array.from(document.querySelectorAll('video, audio'));
  // Try same-origin iframes
  document.querySelectorAll('iframe').forEach(function(iframe) {
    try {
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      if (doc) {
        media = media.concat(Array.from(doc.querySelectorAll('video, audio')));
      }
    } catch(e) { /* cross-origin, skip */ }
  });
  return media;
}
function _honeroYouTubeCmd(func, args) {
  document.querySelectorAll('iframe').forEach(function(iframe) {
    var src = iframe.src || '';
    if (src.indexOf('youtube') !== -1 || src.indexOf('youtu.be') !== -1) {
      try {
        var msg = {event: 'command', func: func};
        if (args) msg.args = args;
        iframe.contentWindow.postMessage(JSON.stringify(msg), '*');
      } catch(e) {}
    }
  });
}
`;

// Mute all media
const MUTE_JS = `
(function() {
  ${MEDIA_HELPER_JS}
  var media = _honeroFindMedia();
  media.forEach(function(m) {
    m._honeroOldVolume = m.volume;
    m.muted = true;
    m.volume = 0;
  });
  // YouTube: mute via API
  _honeroYouTubeCmd('mute');
  _honeroYouTubeCmd('setVolume', [0]);
})();
true;
`;

// Unmute all media
const UNMUTE_JS = `
(function() {
  ${MEDIA_HELPER_JS}
  var media = _honeroFindMedia();
  media.forEach(function(m) {
    m.muted = false;
    m.volume = m._honeroOldVolume !== undefined ? m._honeroOldVolume : 1;
  });
  // YouTube: unmute via API
  _honeroYouTubeCmd('unMute');
  _honeroYouTubeCmd('setVolume', [100]);
})();
true;
`;

// Toggle play/pause on all reachable media
const TOGGLE_PLAY_PAUSE_JS = `
(function() {
  ${MEDIA_HELPER_JS}
  var media = _honeroFindMedia();
  if (media.length > 0) {
    media.forEach(function(m) {
      if (m.paused) { m.play(); } else { m.pause(); }
    });
    return;
  }
  // Fallback: YouTube postMessage toggle
  _honeroYouTubeCmd('pauseVideo');
})();
true;
`;

// JS to check if there's actually media playing in the WebView
const CHECK_MEDIA_JS = `
(function() {
  ${MEDIA_HELPER_JS}
  var media = _honeroFindMedia();
  var hasIframe = document.querySelectorAll('iframe').length > 0;
  var hasVideo = media.length > 0;
  var isPlaying = media.some(function(m) { return !m.paused && m.readyState >= 2; });
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'mediaCheck',
    hasIframe: hasIframe,
    hasVideo: hasVideo,
    isPlaying: isPlaying
  }));
})();
true;
`;

const STUCK_TIMEOUT_MS = 15000; // 15s to detect stuck state
const MAX_AUTO_RETRIES = 2;

const VideoPlayerInner: React.ForwardRefRenderFunction<
  VideoPlayerHandle,
  VideoPlayerProps
> = ({channel, onError, onErrorStateChange}, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const readyRef = useRef(false);
  const errorRef = useRef(false);
  const autoRetryCount = useRef(0);
  const stuckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelIdRef = useRef(channel.id);

  const clearStuckTimer = useCallback(() => {
    if (stuckTimerRef.current) {
      clearTimeout(stuckTimerRef.current);
      stuckTimerRef.current = null;
    }
  }, []);

  const setErrorState = useCallback(
    (hasError: boolean) => {
      errorRef.current = hasError;
      setError(hasError);
      onErrorStateChange?.(hasError);
      if (hasError) {
        clearStuckTimer();
      }
    },
    [onErrorStateChange, clearStuckTimer],
  );

  const handleRetry = useCallback(() => {
    setErrorState(false);
    setLoading(true);
    readyRef.current = false;
    autoRetryCount.current = 0;
    webViewRef.current?.reload();
  }, [setErrorState]);

  const doAutoRetry = useCallback(() => {
    if (autoRetryCount.current < MAX_AUTO_RETRIES) {
      autoRetryCount.current++;
      console.log(
        `Auto-retry ${autoRetryCount.current}/${MAX_AUTO_RETRIES} for ${channel.name}`,
      );
      readyRef.current = false;
      setLoading(true);
      setErrorState(false);
      webViewRef.current?.reload();
    } else {
      // Max retries reached - show error
      setErrorState(true);
      setLoading(false);
    }
  }, [channel.name, setErrorState]);

  useImperativeHandle(ref, () => ({
    togglePlayPause: () => {
      webViewRef.current?.injectJavaScript(TOGGLE_PLAY_PAUSE_JS);
    },
    mute: () => {
      webViewRef.current?.injectJavaScript(MUTE_JS);
    },
    unmute: () => {
      webViewRef.current?.injectJavaScript(UNMUTE_JS);
    },
    volumeUp: () => {},
    volumeDown: () => {},
    retry: handleRetry,
    hasError: () => errorRef.current,
  }));

  // Reset state when channel changes
  useEffect(() => {
    channelIdRef.current = channel.id;
    readyRef.current = false;
    errorRef.current = false;
    autoRetryCount.current = 0;
    setLoading(true);
    setError(false);
    clearStuckTimer();
  }, [channel.id, clearStuckTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearStuckTimer();
  }, [clearStuckTimer]);

  const startStuckDetection = useCallback(() => {
    clearStuckTimer();
    stuckTimerRef.current = setTimeout(() => {
      // After timeout, check if there's media actually playing
      if (!readyRef.current && !errorRef.current) {
        webViewRef.current?.injectJavaScript(CHECK_MEDIA_JS);
        // Give the check 2s to respond, then force error
        stuckTimerRef.current = setTimeout(() => {
          if (!readyRef.current && !errorRef.current) {
            console.log('Stuck detected - no media found, auto-retrying');
            doAutoRetry();
          }
        }, 2000);
      }
    }, STUCK_TIMEOUT_MS);
  }, [clearStuckTimer, doAutoRetry]);

  const handleLoadEnd = useCallback(() => {
    // Page loaded - the injected JS will call cambiarOpcion and send 'playing' message
    // Start stuck detection instead of a blind fallback
    startStuckDetection();

    // Still have a fallback to hide loading if 'playing' message arrives late
    setTimeout(() => {
      if (!readyRef.current && !errorRef.current) {
        // Check media before giving up
        webViewRef.current?.injectJavaScript(CHECK_MEDIA_JS);
      }
    }, 8000);
  }, [startStuckDetection]);

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'playing' && !readyRef.current) {
          readyRef.current = true;
          clearStuckTimer();
          autoRetryCount.current = 0;
          setLoading(false);
        } else if (data.type === 'mediaCheck') {
          // Response from our media check
          if (data.hasIframe || data.hasVideo) {
            // There's media content - consider it loaded
            if (!readyRef.current) {
              readyRef.current = true;
              clearStuckTimer();
              setLoading(false);
            }
          } else if (!readyRef.current && !errorRef.current) {
            // No media found at all - stuck
            console.log('Media check: no media found, auto-retrying');
            doAutoRetry();
          }
        } else if (data.type === 'error') {
          console.log('VideoPlayer error:', data.message);
          setErrorState(true);
          setLoading(false);
        } else if (data.type === 'geo_blocked') {
          console.log('VideoPlayer geo-blocked:', data.message);
          setErrorState(true);
          setLoading(false);
        }
      } catch {
        // ignore
      }
    },
    [setErrorState, clearStuckTimer, doAutoRetry],
  );

  const handleError = useCallback(
    (syntheticEvent: any) => {
      setErrorState(true);
      setLoading(false);
      onError?.(syntheticEvent.nativeEvent);
    },
    [onError, setErrorState],
  );

  const handleShouldStartLoad = useCallback((event: WebViewNavigation) => {
    const {url} = event;
    // Always allow YouTube, Google Video, and the main site
    if (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('googlevideo.com') ||
      url.includes('google.com') ||
      url.includes('gstatic.com') ||
      url.includes('pelisjuanita.com')
    ) {
      return true;
    }
    // Block ad domains
    const isBlocked = BLOCKED_DOMAINS.some(d => url.includes(d));
    if (isBlocked) return false;
    if (url === 'about:blank') return false;
    return true;
  }, []);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        key={channel.id}
        source={{uri: PELISJUANITA_URL}}
        style={[styles.webview, loading && styles.webviewHidden]}
        javaScriptEnabled
        domStorageEnabled
        javaScriptCanOpenWindowsAutomatically={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        injectedJavaScript={buildInjectedJS(channel)}
        injectedJavaScriptBeforeContentLoaded={INJECTED_JS_BEFORE}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
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
        focusable={false}
        tabIndex={-1}
        incognito
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
          <Text style={styles.loadingSubtext}>Buscando señal...</Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>No se pudo cargar el canal</Text>
          <Text style={styles.errorSubtext}>
            La señal no responde. Verificá tu conexión o probá otro canal.
          </Text>
          <Pressable
            style={({focused}) => [
              styles.retryButton,
              focused && styles.retryButtonFocused,
            ]}
            onPress={handleRetry}
            hasTVPreferredFocus>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      )}

      {/* Channel name badge */}
      {!loading && !error && (
        <View style={styles.channelBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.channelBadgeText}>{channel.name}</Text>
        </View>
      )}
    </View>
  );
};

export const VideoPlayer = forwardRef(VideoPlayerInner);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  webviewHidden: {
    opacity: 0,
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
    fontSize: FontSizes.sm,
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
    borderWidth: 3,
    borderColor: 'transparent',
  },
  retryButtonFocused: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent,
    transform: [{scale: 1.1}],
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
