import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import {
  TrendingUp,
  Plus,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Repeat,
  Layers,
  Pencil,
  Trash2,
} from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';

export default function RecentSetsSection({
  recentSets,
  cardExpanded,
  toggleCardExpansion,
  handleOpenLogSet,
  openSetDetails,
  openEditSetModal,
  handleDeleteSetFromList,
  deleteLoadingSetId,
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
      <TouchableOpacity
        onPress={() => toggleCardExpansion('recentSets')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold' }}>
          Recent Sets
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleOpenLogSet}
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
              Log Set
            </Text>
          </TouchableOpacity>
          <View
            style={{ backgroundColor: colors.primary[50], padding: 8, borderRadius: 20 }}
          >
            {cardExpanded.recentSets ? (
              <ChevronUp size={18} color={colors.primary[600]} />
            ) : (
              <ChevronDown size={18} color={colors.primary[600]} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {cardExpanded.recentSets && (
        <>
          {recentSets?.length > 0 ? (
            recentSets.map((s, idx, arr) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => openSetDetails(s)}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: idx < arr.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border.light,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <View
                    style={{
                      backgroundColor: colors.primary[100],
                      padding: 8,
                      borderRadius: 20,
                      marginRight: 12,
                    }}
                  >
                    <Dumbbell size={16} color={colors.primary[600]} />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: '600',
                        marginBottom: 6,
                      }}
                    >
                      {s.exercises?.name || 'Exercise'}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.primary[50],
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 20,
                        }}
                      >
                        <Dumbbell size={14} color={colors.icon.accent} />
                        <Text
                          style={{
                            color: colors.text.secondary,
                            fontSize: 12,
                            marginLeft: 4,
                          }}
                        >
                          {s.weight} {s.unit}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.primary[50],
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 20,
                        }}
                      >
                        <Repeat size={14} color={colors.icon.accent} />
                        <Text
                          style={{
                            color: colors.text.secondary,
                            fontSize: 12,
                            marginLeft: 4,
                          }}
                        >
                          {s.reps} reps
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: colors.primary[50],
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 20,
                        }}
                      >
                        <Layers size={14} color={colors.icon.accent} />
                        <Text
                          style={{
                            color: colors.text.secondary,
                            fontSize: 12,
                            marginLeft: 4,
                          }}
                        >
                          {s.sets} sets
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => openEditSetModal(s)}
                      style={{ paddingHorizontal: 6, paddingVertical: 6 }}
                    >
                      <Pencil size={18} color={colors.text.tertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteSetFromList(s)}
                      disabled={deleteLoadingSetId === s.id}
                      style={{ paddingHorizontal: 6, paddingVertical: 6 }}
                    >
                      {deleteLoadingSetId === s.id ? (
                        <ActivityIndicator size="small" color={colors.status.error} />
                      ) : (
                        <Trash2 size={18} color={colors.status.error} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
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
              <TrendingUp size={32} color={colors.text.tertiary} />
              <Text
                style={{ color: colors.text.tertiary, textAlign: 'center', marginTop: 8 }}
              >
                No sets logged yet. Log your first set!
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

