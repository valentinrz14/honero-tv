import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, BackHandler} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {VideoPlayer} from '@/components/VideoPlayer';
import {ChannelSidebar} from '@/components/ChannelSidebar';
import {Channel, channels} from '@/data/channels';
import {addRecentChannel} from '@/utils/storage';
import {Colors} from '@/theme/colors';
import {RootStackParamList} from '@/navigation/AppNavigator';

type PlayerRouteProp = RouteProp<RootStackParamList, 'Player'>;

export const PlayerScreen: React.FC = () => {
  const route = useRoute<PlayerRouteProp>();
  const navigation = useNavigation();
  const [currentChannelId, setCurrentChannelId] = useState(
    route.params.channelId,
  );
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const currentChannel = channels.find(ch => ch.id === currentChannelId);

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
    await addRecentChannel(channel.id);
  }, []);

  if (!currentChannel) {
    navigation.goBack();
    return null;
  }

  return (
    <View style={styles.container}>
      <VideoPlayer channel={currentChannel} />

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
});
