import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  Target,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  RotateCcw,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function GoalsSection({
  fitnessGoals,
  cardExpanded,
  toggleCardExpansion,
  openAddGoalModal,
  openGoalDetails,
  openEditGoalModal,
  handleToggleComplete,
  handleDeleteGoal,
  completeLoadingGoalId,
  deleteLoadingGoalId,
  isCompleted = false,
}) {
  const colors = useThemedColors();
  const filteredGoals = fitnessGoals?.filter((g) =>
    isCompleted ? g.is_completed : !g.is_completed
  );
  const cardType = isCompleted ? 'completedGoals' : 'goals';

  return (
    <View
      style={{
        backgroundColor: colors.background.card,
        borderRadius: 16,
        padding: 24,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: colors.border.light,
        marginBottom: 24,
      }}
    >
      <TouchableOpacity
        onPress={() => toggleCardExpansion(cardType)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold' }}>
          {isCompleted ? 'Completed Goals' : 'Goals'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!isCompleted && (
            <TouchableOpacity
              onPress={openAddGoalModal}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary[100],
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                marginRight: 8,
              }}
            >
              <Plus size={18} color={colors.primary[600]} />
              <Text style={{ color: colors.primary[700], fontWeight: '500', marginLeft: 4 }}>
                Add Goal
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
            {cardExpanded[cardType] ? (
              <ChevronUp size={18} color={colors.text.tertiary} />
            ) : (
              <ChevronDown size={18} color={colors.text.tertiary} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {cardExpanded[cardType] && (
        <>
          {filteredGoals?.length > 0 ? (
            filteredGoals.map((goal, idx, arr) => (
              <View
                key={goal.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border.light,
                }}
              >
                <TouchableOpacity
                  onPress={() => openGoalDetails(goal)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.primary[100],
                      padding: 8,
                      borderRadius: 20,
                      marginRight: 12,
                    }}
                  >
                    <Target size={16} color={colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                      {goal.title}
                    </Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => handleToggleComplete(goal)}
                    disabled={completeLoadingGoalId === goal.id}
                    style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                  >
                    {completeLoadingGoalId === goal.id ? (
                      <ActivityIndicator size="small" color={colors.primary[600]} />
                    ) : goal.is_completed ? (
                      <RotateCcw size={18} color={colors.primary[600]} />
                    ) : (
                      <CheckCircle2 size={18} color={colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openEditGoalModal(goal)}
                    disabled={
                      completeLoadingGoalId === goal.id || deleteLoadingGoalId === goal.id
                    }
                    style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                  >
                    <Pencil
                      size={18}
                      color={
                        completeLoadingGoalId === goal.id ||
                        deleteLoadingGoalId === goal.id
                          ? colors.text.tertiary
                          : colors.text.secondary
                      }
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteGoal(goal.id)}
                    disabled={deleteLoadingGoalId === goal.id}
                    style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                  >
                    {deleteLoadingGoalId === goal.id ? (
                      <ActivityIndicator size="small" color={colors.status.error} />
                    ) : (
                      <Trash2 size={18} color={colors.status.error} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View
              style={{
                backgroundColor: colors.background.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Target size={32} color={colors.text.tertiary} />
              <Text
                style={{ color: colors.text.tertiary, textAlign: 'center', marginTop: 8 }}
              >
                {isCompleted
                  ? 'No completed goals yet.'
                  : 'No goals set yet. Add your first goal!'}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

