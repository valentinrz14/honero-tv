import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  useTVEventHandler,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {VideoPlayer, VideoPlayerHandle} from '@/components/VideoPlayer';
import {ChannelSidebar} from '@/components/ChannelSidebar';
import {Channel} from '@/data/channels';
import {useChannels} from '@/hooks/useChannels';
import {addRecentChannel} from '@/utils/storage';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';
import {RootStackParamList} from '@/navigation/AppNavigator';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;

export const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation();
  const allChannels = useChannels();
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [currentChannelId, setCurrentChannelId] = useState(
    route.params.channelId,
  );
  const [paused, setPaused] = useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sidebarSlide = useRef(new Animated.Value(-320)).current;

  const currentChannel = allChannels.find(ch => ch.id === currentChannelId);

  // Animate overlay in/out when paused state changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: paused ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sidebarSlide, {
        toValue: paused ? 0 : -320,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [paused, overlayOpacity, sidebarSlide]);

  const doPause = useCallback(() => {
    if (!paused) {
      playerRef.current?.togglePlayPause();
      setPaused(true);
    }
  }, [paused]);

  const doResume = useCallback(() => {
    if (paused) {
      playerRef.current?.togglePlayPause();
      setPaused(false);
    }
  }, [paused]);

  const togglePlayPause = useCallback(() => {
    if (paused) {
      doResume();
    } else {
      doPause();
    }
  }, [paused, doPause, doResume]);

  // Handle back button: if paused/overlay visible, resume; else go back
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (paused) {
        doResume();
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [paused, doResume]);

  // Handle TV remote events
  useTVEventHandler(evt => {
    if (!evt) return;
    const type = evt.eventType;

    // DOWN → pause and show overlay
    if (type === 'down' && !paused) {
      doPause();
      return;
    }

    // SELECT or PLAY/PAUSE → toggle
    if (type === 'select' || type === 'playPause') {
      togglePlayPause();
      return;
    }

    // LEFT → open sidebar (pause if not paused)
    if (type === 'left' && !paused) {
      doPause();
      return;
    }
  });

  const handleChannelSelect = useCallback(
    async (channel: Channel) => {
      setCurrentChannelId(channel.id);
      setPaused(false);
      await addRecentChannel(channel.id);
    },
    [],
  );

  // Navigate back if channel not found
  useEffect(() => {
    if (!currentChannel) {
      navigation.goBack();
    }
  }, [currentChannel, navigation]);

  if (!currentChannel) {
    return null;
  }

  return (
    <View style={styles.container}>
      <VideoPlayer ref={playerRef} channel={currentChannel} />

      {/* Dark overlay + sidebar + play button when paused */}
      <Animated.View
        style={[styles.overlay, {opacity: overlayOpacity}]}
        pointerEvents={paused ? 'auto' : 'none'}>
        {/* Sidebar on the left */}
        <Animated.View
          style={[
            styles.sidebarContainer,
            {transform: [{translateX: sidebarSlide}]},
          ]}>
          <ChannelSidebar
            currentChannelId={currentChannelId}
            onChannelSelect={handleChannelSelect}
            visible={paused}
          />
        </Animated.View>

        {/* Play button in center-right area */}
        <View style={styles.playButtonArea}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={doResume}
            activeOpacity={0.7}
            hasTVPreferredFocus={paused}>
            <View style={styles.playIconContainer}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            <Text style={styles.playLabel}>{currentChannel.name}</Text>
            <Text style={styles.pausedLabel}>En pausa</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    zIndex: 50,
  },
  sidebarContainer: {
    width: 300,
    height: '100%',
  },
  playButtonArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(26, 18, 16, 0.6)',
  },
  playIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  playIcon: {
    fontSize: 36,
    color: Colors.white,
    marginLeft: 4,
  },
  playLabel: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  pausedLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
});
