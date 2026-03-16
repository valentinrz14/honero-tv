import React, {useState, useCallback, useRef} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {Channel} from '@/data/channels';
import {useSearchChannels} from '@/hooks/useChannels';
import {Colors, Spacing, FontSizes, BorderRadius} from '@/theme/colors';

interface SearchBarProps {
  onChannelSelect: (channel: Channel) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({onChannelSelect}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const results = useSearchChannels(query);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
  }, []);

  const handleSelect = useCallback(
    (channel: Channel) => {
      setQuery('');
      onChannelSelect(channel);
    },
    [onChannelSelect],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => inputRef.current?.focus()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.inputContainer, focused && styles.inputFocused]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={handleSearch}
          placeholder="Buscar canales..."
          placeholderTextColor={Colors.textMuted}
          focusable={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <SearchResultItem channel={item} onPress={handleSelect} />
            )}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const SearchResultItem: React.FC<{
  channel: Channel;
  onPress: (channel: Channel) => void;
}> = ({channel, onPress}) => {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.resultItem, focused && styles.resultItemFocused]}
      onPress={() => onPress(channel)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}>
      <View style={styles.resultLogo}>
        <Text style={styles.resultLogoText}>
          {channel.name.substring(0, 2).toUpperCase()}
        </Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{channel.name}</Text>
        {channel.description && (
          <Text style={styles.resultDesc} numberOfLines={1}>
            {channel.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.lg,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  inputFocused: {
    borderColor: Colors.focusedBorder,
    backgroundColor: Colors.backgroundElevated,
  },
  searchIcon: {
    fontSize: FontSizes.lg,
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    padding: 0,
  },
  clearButton: {
    fontSize: FontSizes.lg,
    color: Colors.textMuted,
    padding: Spacing.sm,
  },
  resultsContainer: {
    position: 'absolute',
    top: 72,
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: Colors.backgroundElevated,
    borderRadius: BorderRadius.lg,
    maxHeight: 400,
    elevation: 20,
    zIndex: 100,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  resultsList: {
    borderRadius: BorderRadius.lg,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundCard,
  },
  resultItemFocused: {
    backgroundColor: Colors.primary,
  },
  resultLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  resultLogoText: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: Colors.white,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  resultDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
