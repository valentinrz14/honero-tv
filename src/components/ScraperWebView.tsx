import React, {useRef, useCallback, useEffect, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import {
  PELISJUANITA_URL,
  SCRAPE_INJECTION_JS,
  onScrapeResult,
  onScrapeError,
  isScraping,
} from '@/lib/scraper';

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Chromecast HD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Hidden WebView that loads pelisjuanita.com/tv/ and scrapes channel data.
 * Must be mounted in the component tree for scraping to work.
 * The WebView is 1x1 pixel and positioned off-screen.
 */
export const ScraperWebView: React.FC = () => {
  const webViewRef = useRef<WebView>(null);
  const [shouldLoad, setShouldLoad] = useState(true);
  const hasScraped = useRef(false);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'scrape_result') {
        console.log(`ScraperWebView: received ${data.total} channels`);
        hasScraped.current = true;
        onScrapeResult(data.channels || []);
        // Hide WebView after successful scrape
        setShouldLoad(false);
      } else if (data.type === 'scrape_error') {
        console.log('ScraperWebView error:', data.error);
        onScrapeError(data.error || 'Unknown scrape error');
      }
    } catch (err) {
      console.log('ScraperWebView: failed to parse message:', err);
    }
  }, []);

  const handleLoadEnd = useCallback(() => {
    // Inject the scraping script after page loads
    if (webViewRef.current && !hasScraped.current) {
      console.log('ScraperWebView: page loaded, injecting scrape script');
      webViewRef.current.injectJavaScript(SCRAPE_INJECTION_JS);
    }
  }, []);

  const handleError = useCallback((syntheticEvent: any) => {
    const {nativeEvent} = syntheticEvent;
    console.log('ScraperWebView load error:', nativeEvent?.description);
    onScrapeError(nativeEvent?.description || 'WebView load failed');
  }, []);

  if (!shouldLoad) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <WebView
        ref={webViewRef}
        source={{uri: PELISJUANITA_URL}}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        userAgent={USER_AGENT}
        cacheEnabled
        // Don't play any media
        mediaPlaybackRequiresUserAction
        // Minimize resource usage
        setSupportMultipleWindows={false}
        // Block navigation away from the page
        onShouldStartLoadWithRequest={request => {
          return request.url.includes('pelisjuanita.com');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // WebView needs real dimensions on Android to execute JS
    width: 100,
    height: 100,
    left: -200,
    top: -200,
    opacity: 0,
    overflow: 'hidden',
  },
  webview: {
    width: 100,
    height: 100,
  },
});
