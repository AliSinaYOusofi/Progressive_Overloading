import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X, LayoutGrid, List, ArrowUpDown } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function SearchBarWithViewToggle({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onSortPress,
  showViewToggle = true,
}) {
  const colors = useThemedColors();

  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.background.input,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border.light,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <Search size={18} color={colors.text.tertiary} />
        <TextInput
          style={{
            flex: 1,
            marginLeft: 8,
            color: colors.text.primary,
            fontSize: 14,
          }}
          placeholder="Search exercises..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            style={{ padding: 4, marginRight: 8 }}
          >
            <X size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            onPress={onSortPress}
            style={{
              backgroundColor: colors.background.input,
              padding: 6,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <ArrowUpDown size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
          {showViewToggle && (
            <>
              <TouchableOpacity
                onPress={() => onViewModeChange('list')}
                style={{
                  backgroundColor: viewMode === 'list' ? colors.neutral[200] : 'transparent',
                  padding: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: viewMode === 'list' ? colors.border.light : colors.border.light,
                }}
              >
                <List size={16} color={viewMode === 'list' ? colors.text.primary : colors.text.tertiary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onViewModeChange('grid')}
                style={{
                  backgroundColor: viewMode === 'grid' ? colors.neutral[200] : 'transparent',
                  padding: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: viewMode === 'grid' ? colors.border.light : colors.border.light,
                }}
              >
                <LayoutGrid size={16} color={viewMode === 'grid' ? colors.text.primary : colors.text.tertiary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

