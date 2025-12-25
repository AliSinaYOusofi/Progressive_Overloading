import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Target, CheckCircle2, RotateCcw, Pencil, Trash2 } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function GoalGridItem({
  goal,
  index,
  onPress,
  onToggleComplete,
  onEdit,
  onDelete,
  isCompleting,
  isDeleting,
}) {
  const colors = useThemedColors();
  const progress = goal.target_value > 0 
    ? (goal.current_value / goal.target_value) * 100 
    : 0;

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
      {/* Header with Index Number and Goal Title */}
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
          {goal.title}
        </Text>
      </View>

      {/* Progress Info */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            backgroundColor: colors.background.input,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border.light,
            marginBottom: 8,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 13,
              fontWeight: '600',
            }}
          >
            {goal.current_value} / {goal.target_value} {goal.unit}
          </Text>
        </View>
        {/* Progress Bar */}
        <View
          style={{
            height: 6,
            backgroundColor: colors.background.input,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: colors.primary[600],
              borderRadius: 3,
            }}
          />
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
        gap: 12
      }}>
        <TouchableOpacity
          onPress={onToggleComplete}
          disabled={isCompleting}
          style={{ 
            padding: 8,
            backgroundColor: colors.background.input,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.border.light,
            opacity: isCompleting ? 0.6 : 1,
          }}
        >
          {isCompleting ? (
            <ActivityIndicator size="small" color={colors.primary[600]} />
          ) : goal.is_completed ? (
            <RotateCcw size={16} color={colors.primary[600]} />
          ) : (
            <CheckCircle2 size={16} color={colors.primary[600]} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEdit}
          disabled={isCompleting || isDeleting}
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
            backgroundColor: colors.status.errorLight || colors.background.input,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.status.error + '30' || colors.border.light,
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

