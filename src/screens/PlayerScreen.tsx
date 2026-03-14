import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {VideoPlayer} from '@/components/VideoPlayer';
import {ChannelSidebar} from '@/components/ChannelSidebar';
import {Channel, StreamOption} from '@/data/channels';
import {useChannels} from '@/hooks/useChannels';
import {findWorkingStream} from '@/lib/channelsApi';
import {addRecentChannel} from '@/utils/storage';
import {Colors, Spacing, FontSizes} from '@/theme/colors';
import {RootStackParamList} from '@/navigation/AppNavigator';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;

export const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation();
  const allChannels = useChannels();
  const [currentChannelId, setCurrentChannelId] = useState(
    route.params.channelId,
  );
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [validatingStreams, setValidatingStreams] = useState(false);
  const [activeStream, setActiveStream] = useState<StreamOption | null>(null);
  const [streamChecked, setStreamChecked] = useState(false);

  const currentChannel = allChannels.find(ch => ch.id === currentChannelId);

  // Validate stream options when channel changes
  useEffect(() => {
    let cancelled = false;

    async function checkStreams() {
      if (!currentChannel) return;

      const options = currentChannel.streamOptions || [];
      if (options.length === 0) {
        // No stream options - use legacy tvlibr3 URL
        setActiveStream(null);
        setStreamChecked(true);
        return;
      }

      setValidatingStreams(true);
      setStreamChecked(false);
      setActiveStream(null);

      const working = await findWorkingStream(currentChannel);

      if (!cancelled) {
        setActiveStream(working);
        setValidatingStreams(false);
        setStreamChecked(true);
      }
    }

    checkStreams();
    return () => {
      cancelled = true;
    };
  }, [currentChannelId, currentChannel]);

  // Handle back button: toggle sidebar or go back
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sidebarVisible) {
        setSidebarVisible(false);
        return true;
      }
      return false; // let default behavior (go back) happen
    });
    return () => handler.remove();
  }, [sidebarVisible]);

  // Show sidebar on left D-pad press (handled via focus)
  const handleSidebarToggle = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  const handleChannelSelect = useCallback(async (channel: Channel) => {
    setCurrentChannelId(channel.id);
    setSidebarVisible(false);
    setStreamChecked(false);
    setActiveStream(null);
    await addRecentChannel(channel.id);
  }, []);

  if (!currentChannel) {
    navigation.goBack();
    return null;
  }

  // Show loading while validating stream options
  const showValidating =
    validatingStreams ||
    (!streamChecked && (currentChannel.streamOptions || []).length > 0);

  return (
    <View style={styles.container}>
      {showValidating ? (
        <View style={styles.validatingOverlay}>
          <Image
            source={require('@/assets/hornero-icon.png')}
            style={styles.validatingIcon}
          />
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.validatingText}>
            Buscando mejor señal para {currentChannel.name}...
          </Text>
          <Text style={styles.validatingSubtext}>
            Probando opciones de streaming
          </Text>
        </View>
      ) : (
        <VideoPlayer
          channel={currentChannel}
          streamOption={activeStream}
        />
      )}

      {/* Sidebar - triggered by left D-pad navigation */}
      <ChannelSidebar
        currentChannelId={currentChannelId}
        onChannelSelect={handleChannelSelect}
        visible={sidebarVisible}
      />

      {/* Invisible touch zone on left edge to show sidebar */}
      <View
        style={styles.sidebarTrigger}
        onTouchStart={handleSidebarToggle}
        accessible
        accessibilityLabel="Abrir lista de canales"
        accessibilityRole="button"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  sidebarTrigger: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 40,
    zIndex: 10,
  },
  validatingOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  validatingIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: Spacing.md,
  },
  validatingText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  validatingSubtext: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
});
