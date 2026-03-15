import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {Channel, Category} from '@/data/channels';
import {ChannelCard} from './ChannelCard';
import {Colors, Spacing, FontSizes} from '@/theme/colors';

interface CategoryRowProps {
  category: Category;
  channels: Channel[];
  onChannelPress: (channel: Channel) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  channels,
  onChannelPress,
}) => {
  if (channels.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{category.icon}</Text>
        <Text style={styles.title}>{category.name}</Text>
        <View style={[styles.badge, {backgroundColor: category.color}]}>
          <Text style={styles.badgeText}>{channels.length}</Text>
        </View>
      </View>
      <FlatList
        horizontal
        data={channels}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ChannelCard channel={item} onPress={onChannelPress} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        removeClippedSubviews
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  icon: {
    fontSize: FontSizes.xl,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: FontSizes.sm,
    color: Colors.white,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: Spacing.xl,
  },
});
