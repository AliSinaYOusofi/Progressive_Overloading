import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function SectionHeader({
  title,
  count,
  isExpanded,
  onToggle,
  onLogSet,
  showLogSetButton = true,
  buttonText = 'Log Set',
}) {
  const colors = useThemedColors();

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold' }}>
          {title}
        </Text>
        {count > 0 && (
          <View
            style={{
              backgroundColor: colors.background.input,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border.light,
              marginLeft: 8,
            }}
          >
            <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '600' }}>
              {count}
            </Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {showLogSetButton && (
          <TouchableOpacity
            onPress={onLogSet}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary[100],
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Plus size={18} color={colors.primary[600]} />
            <Text style={{ color: colors.primary[700], fontWeight: '500', marginLeft: 4 }}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        )}
        <View
          style={{
            backgroundColor: colors.background.input,
            padding: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          {isExpanded ? (
            <ChevronUp size={18} color={colors.text.tertiary} />
          ) : (
            <ChevronDown size={18} color={colors.text.tertiary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

