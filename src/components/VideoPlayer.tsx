import React, {useState, useRef, useCallback} from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import {Channel, getChannelUrl} from '@/data/channels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

interface VideoPlayerProps {
  channel: Channel;
  onError?: (error: any) => void;
}

// CSS injected into the WebView to make the player fullscreen and hide
// tvlibree.com's navigation, ads, sidebar, etc.
const INJECTED_CSS = `
  /* Hide everything except the video player */
  header, nav, footer, .sidebar, .ads, .ad,
  [class*="banner"], [class*="cookie"], [class*="popup"],
  [class*="social"], [class*="share"], [class*="comment"],
  [class*="related"], [class*="menu"], [class*="nav"],
  [id*="header"], [id*="footer"], [id*="sidebar"],
  [id*="cookie"], [id*="banner"], [id*="popup"],
  .top-bar, .bottom-bar, .site-header, .site-footer,
  .breadcrumb, .page-title, .channel-info-box,
  .entry-content > *:not(.video-container):not(.player-container):not(iframe):not(video):not([class*="player"]):not([class*="video"]),
  script[src*="ads"], ins.adsbygoogle {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    overflow: hidden !important;
  }

  /* Make body dark and clean */
  html, body {
    background: #1A1210 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  /* Make the video/iframe player fullscreen */
  iframe, video, .video-container, .player-container,
  [class*="player"], [class*="video-wrapper"] {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: 100vw !important;
    max-height: 100vh !important;
    z-index: 9999 !important;
    border: none !important;
  }
`;

const INJECTED_JS = `
  (function() {
    // Inject CSS
    var style = document.createElement('style');
    style.textContent = ${JSON.stringify(INJECTED_CSS)};
    document.head.appendChild(style);

    // Auto-click play buttons if present
    setTimeout(function() {
      var playBtns = document.querySelectorAll('[class*="play"], button[aria-label*="play"], .vjs-big-play-button');
      playBtns.forEach(function(btn) { btn.click(); });
    }, 2000);

    // Re-apply styles after dynamic content loads
    var observer = new MutationObserver(function() {
      var style2 = document.createElement('style');
      style2.textContent = ${JSON.stringify(INJECTED_CSS)};
      document.head.appendChild(style2);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Notify RN when done loading
    window.ReactNativeWebView.postMessage(JSON.stringify({type: 'loaded'}));
  })();
  true;
`;

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onError,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const channelUrl = getChannelUrl(channel);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
  }, []);

  const handleError = useCallback(
    (syntheticEvent: any) => {
      setError(true);
      setLoading(false);
      onError?.(syntheticEvent.nativeEvent);
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

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: channelUrl}}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        injectedJavaScript={INJECTED_JS}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        setSupportMultipleWindows={false}
        mixedContentMode="always"
        allowsFullscreenVideo
        userAgent="Mozilla/5.0 (Linux; Android 10; Android TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      />

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <Image source={require('@/assets/hornero-icon.png')} style={styles.loadingIcon} />
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Cargando {channel.name}...</Text>
        </View>
      )}

      {/* Error state */}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>No se pudo cargar el canal</Text>
          <Text style={styles.errorSubtext}>Intentá de nuevo más tarde</Text>
        </View>
      )}

      {/* Channel name badge - top left */}
      {!loading && !error && (
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
