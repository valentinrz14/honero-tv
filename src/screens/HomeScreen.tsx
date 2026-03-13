import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SearchBar} from '@/components/SearchBar';
import {CategoryRow} from '@/components/CategoryRow';
import {ChannelCard} from '@/components/ChannelCard';
import {
  Channel,
  categories,
  channels,
  getChannelsByCategory,
} from '@/data/channels';
import {getRecentChannels, addRecentChannel} from '@/utils/storage';
import {Colors, Spacing, FontSizes} from '@/theme/colors';
import {RootStackParamList} from '@/navigation/AppNavigator';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const [recentChannelIds, setRecentChannelIds] = useState<string[]>([]);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const recent = await getRecentChannels();
    setRecentChannelIds(recent);
  };

  const handleChannelPress = useCallback(
    async (channel: Channel) => {
      await addRecentChannel(channel.id);
      setRecentChannelIds(prev => {
        const filtered = prev.filter(id => id !== channel.id);
        return [channel.id, ...filtered].slice(0, 10);
      });
      navigation.navigate('Player', {channelId: channel.id});
    },
    [navigation],
  );

  const recentChannels = recentChannelIds
    .map(id => channels.find(ch => ch.id === id))
    .filter(Boolean) as Channel[];

  const renderHeader = () => (
    <View>
      {/* App header */}
      <View style={styles.appHeader}>
        <Text style={styles.appIcon}>🐦</Text>
        <View>
          <Text style={styles.appTitle}>Hornero TV</Text>
          <Text style={styles.appSubtitle}>Televisión Argentina en vivo</Text>
        </View>
      </View>

      {/* Search */}
      <SearchBar onChannelSelect={handleChannelPress} />

      {/* Recently watched */}
      {recentChannels.length > 0 && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🕐</Text>
            <Text style={styles.sectionTitle}>Vistos recientemente</Text>
          </View>
          <FlatList
            horizontal
            data={recentChannels}
            keyExtractor={item => `recent-${item.id}`}
            renderItem={({item}) => (
              <ChannelCard
                channel={item}
                onPress={handleChannelPress}
                size="large"
                showCategory
              />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentList}
          />
        </View>
      )}

      {/* Featured section */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>⭐</Text>
          <Text style={styles.sectionTitle}>Canales destacados</Text>
        </View>
        <FlatList
          horizontal
          data={channels.slice(0, 6)}
          keyExtractor={item => `featured-${item.id}`}
          renderItem={({item}) => (
            <ChannelCard
              channel={item}
              onPress={handleChannelPress}
              size="large"
              showCategory
            />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredList}
        />
      </View>
    </View>
  );

  const categoryData = categories.map(cat => ({
    category: cat,
    channels: getChannelsByCategory(cat.id),
  }));

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.background} barStyle="light-content" />
      <FlatList
        data={categoryData}
        keyExtractor={item => item.category.id}
        ListHeaderComponent={renderHeader}
        renderItem={({item}) => (
          <CategoryRow
            category={item.category}
            channels={item.channels}
            onChannelPress={handleChannelPress}
          />
        )}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        contentContainerStyle={styles.content}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  appIcon: {
    fontSize: 40,
    marginRight: Spacing.md,
  },
  appTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.accent,
  },
  appSubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    fontSize: FontSizes.xl,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  recentSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  recentList: {
    paddingHorizontal: Spacing.xl,
  },
  featuredSection: {
    marginBottom: Spacing.lg,
  },
  featuredList: {
    paddingHorizontal: Spacing.xl,
  },
});
