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
  buttonText = 'Log Exercise',
}) {
  const colors = useThemedColors();

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Title Row */}
      <TouchableOpacity
        onPress={onToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: showLogSetButton ? 12 : 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold' }}>
            {title}
          </Text>
          {count > 0 && (
            <View
              style={{
                backgroundColor: colors.neutral[100],
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
      </TouchableOpacity>

      {/* Log Exercise Button Row */}
      {showLogSetButton && (
        <TouchableOpacity
          onPress={onLogSet}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            backgroundColor: colors.primary[100],
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Plus size={20} color={colors.primary[600]} />
          <Text style={{ color: colors.primary[700], fontWeight: '600', fontSize: 15, marginLeft: 6 }}>
            {buttonText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

