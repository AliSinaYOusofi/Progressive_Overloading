import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function LoadMoreButton({ remaining, onLoadMore, fullWidth = false }) {
  const colors = useThemedColors();

  return (
    <TouchableOpacity
      onPress={onLoadMore}
      style={{
        width: fullWidth ? '100%' : 'auto',
        marginTop: 12,
        paddingVertical: fullWidth ? 14 : 12,
        paddingHorizontal: 16,
        backgroundColor: colors.background.input,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.light,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: colors.text.secondary, fontWeight: '600', fontSize: 14 }}>
        Load More ({remaining} remaining)
      </Text>
    </TouchableOpacity>
  );
}

