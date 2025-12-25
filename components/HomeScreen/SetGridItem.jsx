import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dumbbell, Repeat, Layers, Pencil, Trash2 } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function SetGridItem({
  set,
  index,
  onPress,
  onEdit,
  onDelete,
  isDeleting,
}) {
  const colors = useThemedColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        width: '48%',
        backgroundColor: colors.background.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border.light,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header with Index Number and Exercise Name */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: colors.neutral[100],
            padding: 14,
            borderRadius: 24,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border.light,
            minWidth: 48,
            minHeight: 48,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.text.secondary, fontWeight: '700', fontSize: 18 }}>
            {index + 1}
          </Text>
        </View>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: '700',
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 20,
          }}
          numberOfLines={2}
        >
          {set.exercises?.name || 'Exercise'}
        </Text>
      </View>

      {/* Stats in a compact row */}
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        gap: 6, 
        marginBottom: 12,
        justifyContent: 'center'
      }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.input,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.light,
            minWidth: 60,
            justifyContent: 'center',
          }}
        >
          <Dumbbell size={12} color={colors.text.tertiary} />
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 11,
              marginLeft: 4,
              fontWeight: '600',
            }}
          >
            {set.weight} {set.unit}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.input,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.light,
            minWidth: 60,
            justifyContent: 'center',
          }}
        >
          <Repeat size={12} color={colors.text.tertiary} />
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 11,
              marginLeft: 4,
              fontWeight: '600',
            }}
          >
            {set.reps}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.background.input,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border.light,
            minWidth: 60,
            justifyContent: 'center',
          }}
        >
          <Layers size={12} color={colors.text.tertiary} />
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 11,
              marginLeft: 4,
              fontWeight: '600',
            }}
          >
            {set.sets}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'center', 
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border.light,
        gap: 16
      }}>
        <TouchableOpacity
          onPress={onEdit}
          style={{ 
            padding: 8,
            backgroundColor: colors.background.input,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Pencil size={16} color={colors.text.tertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onDelete}
          disabled={isDeleting}
          style={{ 
            padding: 8,
            backgroundColor: colors.status.errorLight,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.status.error + '30',
            opacity: isDeleting ? 0.6 : 1,
          }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.status.error} />
          ) : (
            <Trash2 size={16} color={colors.status.error} />
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

