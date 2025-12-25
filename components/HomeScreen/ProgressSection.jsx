import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, Plus, Info, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function ProgressSection({
  progressByExercise,
  cardExpanded,
  toggleCardExpansion,
  handleOpenLogSet,
  setShowRMInfoModal,
}) {
  const colors = useThemedColors();

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
      <View style={{ marginBottom: 16 }}>
        {/* Title Row */}
        <TouchableOpacity
          onPress={() => toggleCardExpansion('progress')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold', marginRight: 2 }}>
            Your Progress
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setShowRMInfoModal(true);
              }}
              style={{
                backgroundColor: colors.background.input,
                padding: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              <Info size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
            <View
              style={{
                backgroundColor: colors.background.input,
                padding: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
            >
              {cardExpanded.progress ? (
                <ChevronUp size={18} color={colors.text.tertiary} />
              ) : (
                <ChevronDown size={18} color={colors.text.tertiary} />
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Log Exercise Button Row */}
        <TouchableOpacity
          onPress={handleOpenLogSet}
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
            Log Exercise
          </Text>
        </TouchableOpacity>
      </View>

      {cardExpanded.progress && (
        <>
          {progressByExercise.length === 0 ? (
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
                No progress yet. Log exercises to begin tracking your improvements.
              </Text>
            </View>
          ) : (
            progressByExercise.map((row, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: idx < progressByExercise.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border.light,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text.primary, fontWeight: '600' }}>
                    {row.exerciseName}
                  </Text>
                  <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                    First 1RM: {row.first1RM.toFixed(1)} kg
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.primary[600], fontWeight: '600' }}>
                    +{row.delta.toFixed(1)} kg
                  </Text>
                  <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                    Best: {row.best1RM.toFixed(1)} kg
                  </Text>
                </View>
              </View>
            ))
          )}
        </>
      )}
    </View>
  );
}

