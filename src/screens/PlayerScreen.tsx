import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, BackHandler, useTVEventHandler} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {VideoPlayer} from '@/components/VideoPlayer';
import {ChannelSidebar} from '@/components/ChannelSidebar';
import {Channel} from '@/data/channels';
import {useChannels} from '@/hooks/useChannels';
import {addRecentChannel} from '@/utils/storage';
import {Colors} from '@/theme/colors';
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

  const currentChannel = allChannels.find(ch => ch.id === currentChannelId);

  // Handle back button: toggle sidebar or go back
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sidebarVisible) {
        setSidebarVisible(false);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [sidebarVisible]);

  // Handle TV remote: left key opens sidebar
  useTVEventHandler(evt => {
    if (evt && evt.eventType === 'left' && !sidebarVisible) {
      setSidebarVisible(true);
    }
  });

  const handleSidebarToggle = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  const handleChannelSelect = useCallback(async (channel: Channel) => {
    setCurrentChannelId(channel.id);
    setSidebarVisible(false);
    await addRecentChannel(channel.id);
  }, []);

  if (!currentChannel) {
    navigation.goBack();
    return null;
  }

  return (
    <View style={styles.container}>
      <VideoPlayer channel={currentChannel} />

      <ChannelSidebar
        currentChannelId={currentChannelId}
        onChannelSelect={handleChannelSelect}
        visible={sidebarVisible}
      />

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
});
