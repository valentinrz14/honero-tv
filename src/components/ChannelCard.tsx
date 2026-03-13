import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TVFocusGuideView,
} from 'react-native';
import {Channel, getCategoryById} from '@/data/channels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

interface ChannelCardProps {
  channel: Channel;
  onPress: (channel: Channel) => void;
  size?: 'small' | 'medium' | 'large';
  showCategory?: boolean;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onPress,
  size = 'medium',
  showCategory = false,
}) => {
  const [focused, setFocused] = useState(false);
  const category = getCategoryById(channel.category);

  const dimensions = {
    small: {width: 160, height: 100},
    medium: {width: 220, height: 140},
    large: {width: 300, height: 180},
  }[size];

  const handlePress = useCallback(() => {
    onPress(channel);
  }, [channel, onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.8}
      style={[
        styles.card,
        {width: dimensions.width, height: dimensions.height},
        focused && styles.cardFocused,
      ]}>
      <View
        style={[
          styles.cardInner,
          {backgroundColor: category?.color || Colors.backgroundCard},
        ]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>
            {channel.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.channelName} numberOfLines={1}>
          {channel.name}
        </Text>
        {showCategory && category && (
          <Text style={styles.categoryLabel}>{category.name}</Text>
        )}
      </View>
      {focused && <View style={styles.focusBorder} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  cardFocused: {
    transform: [{scale: 1.08}],
    elevation: 10,
    zIndex: 10,
  },
  cardInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logoText: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.white,
  },
  channelName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  categoryLabel: {
    fontSize: FontSizes.xs,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.xs,
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.lg,
    borderWidth: 3,
    borderColor: Colors.focusedBorder,
  },
});
