import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Target, CheckCircle2, RotateCcw, Pencil, Trash2 } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function GoalListItem({
  goal,
  index,
  isLast,
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
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border.light,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
        {/* Index Badge */}
        <View
          style={{
            backgroundColor: colors.primary[100],
            padding: 9,
            borderRadius: 20,
            marginRight: 14,
            minWidth: 36,
            minHeight: 36,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.primary[600], fontWeight: '700', fontSize: 14 }}>
            {index + 1}
          </Text>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1, marginRight: 10 }}>
          {/* Goal Title */}
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: '600',
              fontSize: 15,
              marginBottom: 6,
            }}
            numberOfLines={1}
          >
            {goal.title}
          </Text>

          {/* Progress Info */}
          <View style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View
                style={{
                  backgroundColor: colors.background.input,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 12,
                    fontWeight: '500',
                  }}
                >
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </Text>
              </View>
            </View>
            {/* Progress Bar */}
            <View
              style={{
                height: 4,
                backgroundColor: colors.background.input,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: colors.primary[600],
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            disabled={isCompleting}
            style={{ padding: 8, opacity: isCompleting ? 0.6 : 1 }}
          >
            {isCompleting ? (
              <ActivityIndicator size="small" color={colors.primary[600]} />
            ) : goal.is_completed ? (
              <RotateCcw size={18} color={colors.primary[600]} />
            ) : (
              <CheckCircle2 size={18} color={colors.primary[600]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            disabled={isCompleting || isDeleting}
            style={{ padding: 8 }}
          >
            <Pencil
              size={18}
              color={
                isCompleting || isDeleting
                  ? colors.text.tertiary
                  : colors.text.tertiary
              }
            />
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

