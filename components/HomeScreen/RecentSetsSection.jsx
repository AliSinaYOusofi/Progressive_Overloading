import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
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
  Search,
  X,
  LayoutGrid,
  List,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  // Filter sets based on search query
  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) {
      return recentSets || [];
    }
    const query = searchQuery.toLowerCase().trim();
    return (recentSets || []).filter(set => {
      const exerciseName = (set.exercises?.name || 'Exercise').toLowerCase();
      return exerciseName.includes(query);
    });
  }, [recentSets, searchQuery]);

  // Clear search when card is collapsed
  React.useEffect(() => {
    if (!cardExpanded.recentSets) {
      setSearchQuery('');
    }
  }, [cardExpanded.recentSets]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold' }}>
            Recent Sets
          </Text>
          {recentSets?.length > 0 && (
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
                {searchQuery.trim() ? filteredSets.length : recentSets.length}
              </Text>
            </View>
          )}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity
            onPress={handleOpenLogSet}
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
              Log Set
            </Text>
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
            {cardExpanded.recentSets ? (
              <ChevronUp size={18} color={colors.text.tertiary} />
            ) : (
              <ChevronDown size={18} color={colors.text.tertiary} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {cardExpanded.recentSets && (
        <>
          {/* Search Input */}
          {recentSets?.length > 0 && (
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
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={{ padding: 4, marginRight: 8 }}
                  >
                    <X size={18} color={colors.text.tertiary} />
                  </TouchableOpacity>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TouchableOpacity
                    onPress={() => setViewMode('list')}
                    style={{
                      backgroundColor: viewMode === 'list' ? colors.primary[100] : 'transparent',
                      padding: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: viewMode === 'list' ? colors.primary[200] : colors.border.light,
                    }}
                  >
                    <List size={16} color={viewMode === 'list' ? colors.primary[600] : colors.text.tertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setViewMode('grid')}
                    style={{
                      backgroundColor: viewMode === 'grid' ? colors.primary[100] : 'transparent',
                      padding: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: viewMode === 'grid' ? colors.primary[200] : colors.border.light,
                    }}
                  >
                    <LayoutGrid size={16} color={viewMode === 'grid' ? colors.primary[600] : colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {recentSets?.length > 0 ? (
            filteredSets.length > 0 ? (
              viewMode === 'list' ? (
                // List View
                filteredSets.map((s, idx, arr) => (
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
                              backgroundColor: colors.background.input,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
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
                              backgroundColor: colors.background.input,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
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
                              backgroundColor: colors.background.input,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
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
                // Grid View
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {filteredSets.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => openSetDetails(s)}
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
                      {/* Header with Icon and Exercise Name */}
                      <View style={{ alignItems: 'center', marginBottom: 16 }}>
                        <View
                          style={{
                            backgroundColor: colors.primary[100],
                            padding: 14,
                            borderRadius: 24,
                            marginBottom: 10,
                            borderWidth: 2,
                            borderColor: colors.primary[200],
                          }}
                        >
                          <Dumbbell size={24} color={colors.primary[600]} />
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
                          {s.exercises?.name || 'Exercise'}
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
                            {s.weight} {s.unit}
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
                            {s.reps}
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
                            {s.sets}
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
                          onPress={() => openEditSetModal(s)}
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
                          onPress={() => handleDeleteSetFromList(s)}
                          disabled={deleteLoadingSetId === s.id}
                          style={{ 
                            padding: 8,
                            backgroundColor: colors.status.errorLight,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: colors.status.error + '30',
                            opacity: deleteLoadingSetId === s.id ? 0.6 : 1,
                          }}
                        >
                          {deleteLoadingSetId === s.id ? (
                            <ActivityIndicator size="small" color={colors.status.error} />
                          ) : (
                            <Trash2 size={16} color={colors.status.error} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )
            ) : (
              <View
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 12,
                  padding: 24,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  borderStyle: 'dashed',
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: colors.background.input,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: colors.border.light,
                  }}
                >
                  <Search size={28} color={colors.text.tertiary} />
                </View>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: 4,
                  }}
                >
                  No matches found
                </Text>
                <Text
                  style={{
                    color: colors.text.secondary,
                    fontSize: 14,
                    textAlign: 'center',
                  }}
                >
                  No sets found matching "{searchQuery}"
                </Text>
              </View>
            )
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

