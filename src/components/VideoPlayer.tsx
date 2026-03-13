import React, {useState, useRef, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Video, {OnLoadData, OnProgressData} from 'react-native-video';
import {Channel} from '@/data/channels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

interface VideoPlayerProps {
  channel: Channel;
  onError?: (error: any) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onError,
}) => {
  const videoRef = useRef<any>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>();
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const showControls = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    setControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    controlsTimeout.current = setTimeout(() => {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setControlsVisible(false));
    }, 5000);
  }, [controlsOpacity]);

  const togglePlayPause = useCallback(() => {
    setPaused(prev => !prev);
    showControls();
  }, [showControls]);

  const handleLoad = useCallback((_data: OnLoadData) => {
    setLoading(false);
    setError(false);
  }, []);

  const handleError = useCallback(
    (err: any) => {
      setError(true);
      setLoading(false);
      onError?.(err);
    },
    [onError],
  );

  const handleBuffer = useCallback(({isBuffering}: {isBuffering: boolean}) => {
    setLoading(isBuffering);
  }, []);

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{uri: channel.streamUrl}}
        style={styles.video}
        resizeMode="contain"
        paused={paused}
        onLoad={handleLoad}
        onError={handleError}
        onBuffer={handleBuffer}
        repeat={false}
        controls={false}
        bufferConfig={{
          minBufferMs: 5000,
          maxBufferMs: 30000,
          bufferForPlaybackMs: 2500,
          bufferForPlaybackAfterRebufferMs: 5000,
        }}
      />

      {/* Touch overlay for play/pause */}
      <TouchableOpacity
        style={styles.touchOverlay}
        onPress={togglePlayPause}
        onFocus={showControls}
        activeOpacity={1}>
        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando...</Text>
            <Text style={styles.loadingIcon}>🐦</Text>
          </View>
        )}

        {/* Error state */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>
              No se pudo cargar el canal
            </Text>
            <Text style={styles.errorSubtext}>
              Intentá de nuevo más tarde
            </Text>
          </View>
        )}

        {/* Controls overlay */}
        {controlsVisible && !error && (
          <Animated.View
            style={[styles.controlsOverlay, {opacity: controlsOpacity}]}>
            {/* Channel info */}
            <View style={styles.channelInfo}>
              <View style={styles.channelLogo}>
                <Text style={styles.channelLogoText}>
                  {channel.name.substring(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.channelName}>{channel.name}</Text>
                {channel.description && (
                  <Text style={styles.channelDesc}>{channel.description}</Text>
                )}
              </View>
            </View>

            {/* Play/Pause button */}
            <View style={styles.controlsCenter}>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>{paused ? '▶' : '⏸'}</Text>
              </View>
            </View>

            {/* Live indicator */}
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>EN VIVO</Text>
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  video: {
    flex: 1,
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  loadingIcon: {
    fontSize: 48,
  },
  errorContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.overlay,
    borderRadius: BorderRadius.lg,
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
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: Spacing.xl,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  channelLogoText: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
  },
  channelName: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  channelDesc: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.7)',
  },
  controlsCenter: {
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 94, 60, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 32,
    color: Colors.white,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E74C3C',
    marginRight: Spacing.sm,
  },
  liveText: {
    fontSize: FontSizes.md,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
});
