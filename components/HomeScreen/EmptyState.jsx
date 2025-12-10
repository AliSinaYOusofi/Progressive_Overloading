import React from 'react';
import { View, Text } from 'react-native';
import { Search, TrendingUp } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function EmptyState({ type, searchQuery }) {
  const colors = useThemedColors();

  if (type === 'noMatches') {
    return (
      <View
        style={{
          backgroundColor: colors.background.card,
          borderRadius: 12,
          padding: 24,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.border.light,
          borderStyle: 'dashed',
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.background.input,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            borderWidth: 2,
            borderColor: colors.border.light,
          }}
        >
          <Search size={28} color={colors.text.tertiary} />
        </View>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 4,
          }}
        >
          No matches found
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: 14,
            textAlign: 'center',
          }}
        >
          No sets found matching "{searchQuery}"
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: colors.background.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
      }}
    >
      <TrendingUp size={32} color={colors.text.tertiary} />
      <Text
        style={{ color: colors.text.tertiary, textAlign: 'center', marginTop: 8 }}
      >
        No sets logged yet. Log your first set!
      </Text>
    </View>
  );
}

