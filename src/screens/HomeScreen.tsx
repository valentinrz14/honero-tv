import React, {useCallback, useMemo} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SearchBar} from '@/components/SearchBar';
import {CategoryRow} from '@/components/CategoryRow';
import {ChannelCard} from '@/components/ChannelCard';
import {Channel} from '@/data/channels';
import {useChannels, useCategories, useChannelsLoading} from '@/hooks/useChannels';
import {useRecentChannels, useAddRecentChannel} from '@/hooks/useRecentChannels';
import {Colors, Spacing, FontSizes} from '@/theme/colors';
import {RootStackParamList} from '@/navigation/AppNavigator';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const allChannels = useChannels();
  const allCategories = useCategories();
  const isLoadingChannels = useChannelsLoading();
  const {data: recentChannelIds = []} = useRecentChannels();
  const addRecent = useAddRecentChannel();

  const handleChannelPress = useCallback(
    (channel: Channel) => {
      addRecent.mutate(channel.id);
      navigation.navigate('Player', {channelId: channel.id});
    },
    [navigation, addRecent],
  );

  const recentChannels = useMemo(
    () =>
      recentChannelIds
        .map(id => allChannels.find(ch => ch.id === id))
        .filter(Boolean) as Channel[],
    [recentChannelIds, allChannels],
  );

  const renderHeader = () => (
    <View>
      {/* App header */}
      <View style={styles.appHeader}>
        <Image source={require('@/assets/hornero-icon.png')} style={styles.appIcon} />
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
          data={allChannels.slice(0, 6)}
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

  const categoryData = allCategories.map(cat => ({
    category: cat,
    channels: allChannels.filter(ch => ch.category === cat.id),
  }));

  if (isLoadingChannels && allChannels.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={Colors.background} barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Image source={require('@/assets/hornero-icon.png')} style={styles.loadingIcon} />
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.loadingText}>Cargando canales...</Text>
        </View>
      </View>
    );
  }

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
    width: 48,
    height: 48,
    borderRadius: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
