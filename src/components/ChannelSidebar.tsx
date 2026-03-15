import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {Channel} from '@/data/channels';
import {useChannels, useCategories} from '@/hooks/useChannels';
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
  const allChannels = useChannels();
  const allCategories = useCategories();
  const listRef = useRef<SectionList<Channel, SectionData>>(null);

  const sections: SectionData[] = useMemo(
    () =>
      allCategories
        .map(cat => ({
          title: cat.name,
          color: cat.color,
          icon: cat.icon,
          data: allChannels.filter(ch => ch.category === cat.id),
        }))
        .filter(s => s.data.length > 0),
    [allCategories, allChannels],
  );

  // Scroll to the active channel when the sidebar becomes visible
  useEffect(() => {
    if (!visible) return;
    // Find section and item indices for the current channel
    for (let sIdx = 0; sIdx < sections.length; sIdx++) {
      const iIdx = sections[sIdx].data.findIndex(
        ch => ch.id === currentChannelId,
      );
      if (iIdx !== -1) {
        // Small delay to ensure list is rendered before scrolling
        const timer = setTimeout(() => {
          try {
            listRef.current?.scrollToLocation({
              sectionIndex: sIdx,
              itemIndex: iIdx,
              viewOffset: 100,
              animated: true,
            });
          } catch (_) {
            // Ignore scroll errors (e.g. if list not mounted yet)
          }
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [visible, currentChannelId, sections]);

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
      grabFocus={visible && item.id === currentChannelId}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('@/assets/hornero-icon.png')} style={styles.headerIcon} />
        <Text style={styles.headerTitle}>Canales</Text>
      </View>
      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={item => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        updateCellsBatchingPeriod={50}
        getItemLayout={(data, index) => ({
          length: 48,
          offset: 48 * index,
          index,
        })}
      />
    </View>
  );
};

const SidebarItem: React.FC<{
  channel: Channel;
  isActive: boolean;
  onPress: (channel: Channel) => void;
  grabFocus?: boolean;
}> = ({channel, isActive, onPress, grabFocus}) => {
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
      onBlur={() => setFocused(false)}
      hasTVPreferredFocus={grabFocus}>
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
    flex: 1,
    backgroundColor: Colors.overlay,
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
    width: 28,
    height: 28,
    borderRadius: 6,
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
