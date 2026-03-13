import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Animated,
} from 'react-native';
import {Channel, categories, getChannelsByCategory} from '@/data/channels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

interface ChannelSidebarProps {
  currentChannelId: string;
  onChannelSelect: (channel: Channel) => void;
  visible: boolean;
}

interface SectionData {
  title: string;
  color: string;
  icon: string;
  data: Channel[];
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  currentChannelId,
  onChannelSelect,
  visible,
}) => {
  const slideAnim = useRef(new Animated.Value(visible ? 0 : -320)).current;

  React.useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -320,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  const sections: SectionData[] = categories
    .map(cat => ({
      title: cat.name,
      color: cat.color,
      icon: cat.icon,
      data: getChannelsByCategory(cat.id),
    }))
    .filter(s => s.data.length > 0);

  const renderSectionHeader = ({section}: {section: SectionData}) => (
    <View style={[styles.sectionHeader, {borderLeftColor: section.color}]}>
      <Text style={styles.sectionIcon}>{section.icon}</Text>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  const renderItem = ({item}: {item: Channel}) => (
    <SidebarItem
      channel={item}
      isActive={item.id === currentChannelId}
      onPress={onChannelSelect}
    />
  );

  return (
    <Animated.View
      style={[styles.container, {transform: [{translateX: slideAnim}]}]}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🐦</Text>
        <Text style={styles.headerTitle}>Canales</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews
      />
    </Animated.View>
  );
};

const SidebarItem: React.FC<{
  channel: Channel;
  isActive: boolean;
  onPress: (channel: Channel) => void;
}> = ({channel, isActive, onPress}) => {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.item,
        isActive && styles.itemActive,
        focused && styles.itemFocused,
      ]}
      onPress={() => onPress(channel)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}>
      <View
        style={[styles.itemLogo, isActive && styles.itemLogoActive]}>
        <Text style={styles.itemLogoText}>
          {channel.name.substring(0, 2).toUpperCase()}
        </Text>
      </View>
      <Text
        style={[styles.itemName, isActive && styles.itemNameActive]}
        numberOfLines={1}>
        {channel.name}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: Colors.overlay,
    zIndex: 50,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundCard,
  },
  headerIcon: {
    fontSize: FontSizes.xl,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
    borderLeftWidth: 4,
  },
  sectionIcon: {
    fontSize: FontSizes.md,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.accent,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  itemActive: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.sm,
  },
  itemFocused: {
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.sm,
  },
  itemLogo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  itemLogoActive: {
    backgroundColor: Colors.accentWarm,
  },
  itemLogoText: {
    fontSize: FontSizes.xs,
    fontWeight: 'bold',
    color: Colors.white,
  },
  itemName: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  itemNameActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accentWarm,
  },
});
