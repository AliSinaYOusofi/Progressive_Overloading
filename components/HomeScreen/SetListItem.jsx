import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dumbbell, Repeat, Layers, Pencil, Trash2 } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function SetListItem({
  set,
  index,
  isLast,
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
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border.light,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        <View
          style={{
            backgroundColor: colors.neutral[100],
            padding: 9,
            borderRadius: 20,
            marginRight: 14,
            minWidth: 36,
            minHeight: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Text style={{ color: colors.text.secondary, fontWeight: '700', fontSize: 14 }}>
            {index + 1}
          </Text>
        </View>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: '600',
              fontSize: 15,
              marginBottom: 8,
            }}
          >
            {set.exercises?.name || 'Exercise'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.background.input,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Dumbbell size={14} color={colors.text.tertiary} />
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 12,
                  marginLeft: 5,
                  fontWeight: '500',
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
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Repeat size={14} color={colors.text.tertiary} />
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 12,
                  marginLeft: 5,
                  fontWeight: '500',
                }}
              >
                {set.reps} reps
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.background.input,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Layers size={14} color={colors.text.tertiary} />
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: 12,
                  marginLeft: 5,
                  fontWeight: '500',
                }}
              >
                {set.sets} sets
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            style={{ padding: 8 }}
          >
            <Pencil size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            style={{ padding: 8, opacity: isDeleting ? 0.6 : 1 }}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color={colors.status.error} />
            ) : (
              <Trash2 size={18} color={colors.status.error} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

