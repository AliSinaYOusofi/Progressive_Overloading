import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Dumbbell, Repeat, Layers, TrendingUp, Activity } from 'lucide-react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTheme } from '../../contexts/ThemeContext';
import { getCurrentUser, getExerciseSetsByDate } from '../../lib/database';
import SetListItem from '../../components/HomeScreen/SetListItem';
import SetGridItem from '../../components/HomeScreen/SetGridItem';
import SearchBarWithViewToggle from '../../components/HomeScreen/SearchBarWithViewToggle';
import EmptyState from '../../components/HomeScreen/EmptyState';
import SortFilterModal from '../../components/HomeScreen/SortFilterModal';
import { useSetActions } from '../../hooks/useSetActions';
import { useHomeScreenData } from '../../hooks/useHomeScreenData';
import SetDetailsModal from '../../components/HomeScreen/SetDetailsModal';
import EditSetModal from '../../components/HomeScreen/EditSetModal';
import { formatShortNumber } from '../../utils/numberUtils';

export default function DayDetailScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { date: dateParam } = useLocalSearchParams();
  const { loadProgressFromSets, loadRecentSets } = useHomeScreenData();
  const [user, setUser] = useState(null);
  const [sets, setSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Parse date from param
  const selectedDate = useMemo(() => {
    if (!dateParam) return null;
    try {
      // dateParam should be in format 'yyyy-MM-dd'
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) return null;
      return date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }, [dateParam]);

  // Format date for display
  const formatDateLabel = (date) => {
    if (!date) return 'Invalid Date';
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  // Calculate comprehensive stats for the day
  const dayStats = useMemo(() => {
    const uniqueExercises = new Set(
      sets.map(s => s.exercises?.name || 'Exercise')
    ).size;
    const totalSets = sets.reduce((sum, s) => sum + (parseInt(s.sets) || 1), 0);
    const totalReps = sets.reduce((sum, s) => {
      return sum + ((parseInt(s.reps) || 0) * (parseInt(s.sets) || 1));
    }, 0);
    const totalVolume = sets.reduce((sum, s) => {
      return sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0) * (parseInt(s.sets) || 1));
    }, 0);
    
    // Calculate average RPE
    const rpeValues = sets
      .map(s => parseFloat(s.rpe))
      .filter(rpe => rpe && !isNaN(rpe));
    const avgRPE = rpeValues.length > 0
      ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length
      : null;

    // Calculate average weight
    const avgWeight = sets.length > 0
      ? sets.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0) / sets.length
      : 0;

    // Calculate max weight lifted
    const maxWeight = sets.length > 0
      ? Math.max(...sets.map(s => parseFloat(s.weight) || 0))
      : 0;

    // Group by exercise for breakdown
    const exerciseBreakdown = sets.reduce((acc, set) => {
      const exerciseName = set.exercises?.name || 'Exercise';
      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          name: exerciseName,
          sets: 0,
          reps: 0,
          volume: 0,
          weights: [],
          maxWeight: 0,
          avgWeight: 0,
          oneRM: 0,
        };
      }
      const setCount = parseInt(set.sets) || 1;
      const repCount = parseInt(set.reps) || 0;
      const weight = parseFloat(set.weight) || 0;
      const volume = weight * repCount * setCount;
      
      acc[exerciseName].sets += setCount;
      acc[exerciseName].reps += repCount * setCount;
      acc[exerciseName].volume += volume;
      acc[exerciseName].weights.push(weight);
      
      return acc;
    }, {});

    // Calculate per-exercise stats
    Object.values(exerciseBreakdown).forEach(ex => {
      ex.maxWeight = Math.max(...ex.weights);
      ex.avgWeight = ex.weights.reduce((sum, w) => sum + w, 0) / ex.weights.length;
      // Estimate 1RM using Epley formula: 1RM = weight × (1 + reps/30)
      const bestSet = sets
        .filter(s => (s.exercises?.name || 'Exercise') === ex.name)
        .reduce((best, s) => {
          const current1RM = (parseFloat(s.weight) || 0) * (1 + (parseInt(s.reps) || 0) / 30);
          const best1RM = (parseFloat(best.weight) || 0) * (1 + (parseInt(best.reps) || 0) / 30);
          return current1RM > best1RM ? s : best;
        }, sets.find(s => (s.exercises?.name || 'Exercise') === ex.name) || { weight: 0, reps: 0 });
      
      if (bestSet && bestSet.weight && bestSet.reps) {
        ex.oneRM = (parseFloat(bestSet.weight) || 0) * (1 + (parseInt(bestSet.reps) || 0) / 30);
      }
    });

    // Get muscle groups worked
    const muscleGroups = new Set();
    sets.forEach(set => {
      const mg = set.exercises?.muscle_groups;
      if (mg) {
        if (Array.isArray(mg)) {
          mg.forEach(m => muscleGroups.add(m));
        } else if (typeof mg === 'object') {
          const primary = mg.primary || mg.primaryMuscles || [];
          const secondary = mg.secondary || mg.secondaryMuscles || [];
          [...primary, ...secondary].forEach(m => muscleGroups.add(m));
        }
      }
    });

    return {
      uniqueExercises,
      totalSets,
      totalReps,
      totalVolume,
      avgRPE,
      avgWeight,
      maxWeight,
      exerciseBreakdown: Object.values(exerciseBreakdown).sort((a, b) => b.volume - a.volume),
      muscleGroups: Array.from(muscleGroups),
    };
  }, [sets]);

  // Load sets for the date
  const loadSets = async (isRefresh = false) => {
    try {
      if (!isRefresh) setIsLoading(true);
      
      const currentUser = await getCurrentUser();
      if (!currentUser || !selectedDate) {
        setIsLoading(false);
        return;
      }

      setUser(currentUser);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const daySets = await getExerciseSetsByDate(currentUser.id, dateStr);
      setSets(daySets || []);
    } catch (error) {
      console.error('Error loading day sets:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadSets();
    }
  }, [selectedDate]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSets(true);
  };

  // Filter and sort sets
  const filteredSets = useMemo(() => {
    let filtered = sets || [];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(set => {
        const exerciseName = (set.exercises?.name || 'Exercise').toLowerCase();
        return exerciseName.includes(query);
      });
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.performed_at || a.created_at || a.date || 0).getTime();
          bValue = new Date(b.performed_at || b.created_at || b.date || 0).getTime();
          break;
        case 'weight':
          aValue = parseFloat(a.weight) || 0;
          bValue = parseFloat(b.weight) || 0;
          break;
        case 'reps':
          aValue = parseInt(a.reps) || 0;
          bValue = parseInt(b.reps) || 0;
          break;
        case 'sets':
          aValue = parseInt(a.sets) || 0;
          bValue = parseInt(b.sets) || 0;
          break;
        case 'exercise':
          aValue = (a.exercises?.name || 'Exercise').toLowerCase();
          bValue = (b.exercises?.name || 'Exercise').toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortBy === 'exercise') {
        // String comparison for exercise names
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        // Numeric/date comparison
        if (sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
    });

    return sorted;
  }, [sets, searchQuery, sortBy, sortOrder]);

  // Set actions hook
  const setActions = useSetActions({ user, loadProgressFromSets, loadRecentSets });

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Refresh sets after edit/delete
  useEffect(() => {
    loadSets(true);
  }, [setActions.deleteLoadingSetId, setActions.isEditSetVisible]);

  if (!selectedDate) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text.secondary, fontSize: 16 }}>Invalid date</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, padding: 12, backgroundColor: colors.primary[100], borderRadius: 8 }}
        >
          <Text style={{ color: colors.primary[600], fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={{ color: colors.text.secondary, marginTop: 16 }}>Loading workout details...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20,
          backgroundColor: colors.background.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            marginRight: 12,
            borderRadius: 8,
            backgroundColor: colors.background.input,
          }}
        >
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Calendar size={18} color={colors.text.secondary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary }}>
              {formatDateLabel(selectedDate)}
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: colors.text.secondary, marginLeft: 26 }}>
            {dayStats.uniqueExercises} {dayStats.uniqueExercises === 1 ? 'exercise' : 'exercises'} • {dayStats.totalSets} {dayStats.totalSets === 1 ? 'set' : 'sets'}
          </Text>
          {dayStats.avgRPE && (
            <Text style={{ fontSize: 12, color: colors.text.tertiary, marginLeft: 26, marginTop: 2 }}>
              Avg RPE: {dayStats.avgRPE.toFixed(1)}
            </Text>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Workout Summary Stats */}
        {sets.length > 0 && (
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 16,
              }}
            >
              Workout Summary
            </Text>

            {/* Main Stats Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {/* Total Volume */}
              <View
                style={{
                  flex: 1,
                  minWidth: '47%',
                  backgroundColor: colors.primary[50],
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.primary[200],
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Dumbbell size={18} color={colors.primary[600]} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text.tertiary,
                      fontWeight: '600',
                      marginLeft: 6,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Total Volume
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: colors.primary[700],
                    marginBottom: 2,
                  }}
                >
                  {formatShortNumber(dayStats.totalVolume)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>kg</Text>
              </View>

              {/* Total Sets */}
              <View
                style={{
                  flex: 1,
                  minWidth: '47%',
                  backgroundColor: colors.background.primary,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Layers size={18} color={colors.text.secondary} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text.tertiary,
                      fontWeight: '600',
                      marginLeft: 6,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Total Sets
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: colors.text.primary,
                    marginBottom: 2,
                  }}
                >
                  {dayStats.totalSets}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>sets</Text>
              </View>

              {/* Total Reps */}
              <View
                style={{
                  flex: 1,
                  minWidth: '47%',
                  backgroundColor: colors.background.primary,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Repeat size={18} color={colors.text.secondary} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text.tertiary,
                      fontWeight: '600',
                      marginLeft: 6,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Total Reps
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: colors.text.primary,
                    marginBottom: 2,
                  }}
                >
                  {formatShortNumber(dayStats.totalReps)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>reps</Text>
              </View>

              {/* Max Weight */}
              <View
                style={{
                  flex: 1,
                  minWidth: '47%',
                  backgroundColor: colors.background.primary,
                  borderRadius: 12,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TrendingUp size={18} color={colors.text.secondary} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.text.tertiary,
                      fontWeight: '600',
                      marginLeft: 6,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Max Weight
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '800',
                    color: colors.text.primary,
                    marginBottom: 2,
                  }}
                >
                  {dayStats.maxWeight.toFixed(1)}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>kg</Text>
              </View>
            </View>

            {/* Muscle Groups Worked */}
            {dayStats.muscleGroups.length > 0 && (
              <View style={{ marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border.light }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.text.secondary,
                    fontWeight: '600',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Muscle Groups Worked
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {dayStats.muscleGroups.map((muscle, idx) => (
                    <View
                      key={idx}
                      style={{
                        backgroundColor: colors.primary[100],
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.primary[200],
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.primary[700],
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}
                      >
                        {muscle}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Exercise Breakdown */}
        {sets.length > 0 && dayStats.exerciseBreakdown.length > 0 && (
          <View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text.primary,
                marginBottom: 16,
              }}
            >
              Exercise Breakdown
            </Text>

            {dayStats.exerciseBreakdown.map((exercise, idx) => (
              <View
                key={idx}
                style={{
                  paddingBottom: idx < dayStats.exerciseBreakdown.length - 1 ? 16 : 0,
                  marginBottom: idx < dayStats.exerciseBreakdown.length - 1 ? 16 : 0,
                  borderBottomWidth: idx < dayStats.exerciseBreakdown.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border.light,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: colors.text.primary,
                        marginBottom: 4,
                      }}
                    >
                      {exercise.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.text.secondary,
                      }}
                    >
                      {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'} • {exercise.reps} {exercise.reps === 1 ? 'rep' : 'reps'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '800',
                        color: colors.primary[600],
                      }}
                    >
                      {formatShortNumber(exercise.volume)} kg
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.text.tertiary,
                      }}
                    >
                      Volume
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.background.primary,
                      borderRadius: 8,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: colors.border.light,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 4 }}>Avg Weight</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>
                      {exercise.avgWeight.toFixed(1)} kg
                    </Text>
                  </View>
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: colors.background.primary,
                      borderRadius: 8,
                      padding: 10,
                      borderWidth: 1,
                      borderColor: colors.border.light,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 4 }}>Max Weight</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text.primary }}>
                      {exercise.maxWeight.toFixed(1)} kg
                    </Text>
                  </View>
                  {exercise.oneRM > 0 && (
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: colors.primary[50],
                        borderRadius: 8,
                        padding: 10,
                        borderWidth: 1,
                        borderColor: colors.primary[200],
                      }}
                    >
                      <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 4 }}>Est. 1RM</Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary[700] }}>
                        {exercise.oneRM.toFixed(1)} kg
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Search and Sort */}
        {sets.length > 0 && (
          <SearchBarWithViewToggle
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSortPress={() => setSortModalVisible(true)}
          />
        )}

        {/* Sort/Filter Modal */}
        <SortFilterModal
          visible={sortModalVisible}
          onClose={() => setSortModalVisible(false)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {/* Sets List/Grid */}
        {sets.length > 0 ? (
          filteredSets.length > 0 ? (
            viewMode === 'list' ? (
              // List View
              <View
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                {filteredSets.map((s, idx, arr) => (
                  <SetListItem
                    key={s.id}
                    set={s}
                    index={idx}
                    isLast={idx === arr.length - 1}
                    onPress={() => setActions.openSetDetails(s)}
                    onEdit={() => setActions.openEditSetModal(s)}
                    onDelete={() => setActions.handleDeleteSetFromList(s)}
                    isDeleting={setActions.deleteLoadingSetId === s.id}
                  />
                ))}
              </View>
            ) : (
              // Grid View
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {filteredSets.map((s, idx) => (
                  <SetGridItem
                    key={s.id}
                    set={s}
                    index={idx}
                    onPress={() => setActions.openSetDetails(s)}
                    onEdit={() => setActions.openEditSetModal(s)}
                    onDelete={() => setActions.handleDeleteSetFromList(s)}
                    isDeleting={setActions.deleteLoadingSetId === s.id}
                  />
                ))}
              </View>
            )
          ) : (
            <EmptyState type="noMatches" searchQuery={searchQuery} />
          )
        ) : (
          <EmptyState type="noSets" />
        )}
      </ScrollView>

      {/* Modals */}
      <SetDetailsModal
        visible={setActions.isSetDetailsVisible}
        onClose={setActions.closeSetDetails}
        selectedSet={setActions.selectedSet}
        onEdit={() => {
          setActions.closeSetDetails();
          setActions.openEditSetModal(setActions.selectedSet);
        }}
        onDelete={setActions.handleDeleteSetFromModal}
        isDeleting={setActions.modalDeleteLoadingSetId !== null}
        deleteLoadingId={setActions.modalDeleteLoadingSetId}
      />

      <EditSetModal
        visible={setActions.isEditSetVisible}
        onClose={setActions.closeEditSetModal}
        onSubmit={setActions.handleSaveEditedSet}
        onDelete={setActions.handleDeleteSet}
        isSubmitting={setActions.isEditSubmitting}
        isDeleting={setActions.isEditDeleting}
        initialValues={setActions.editingSet ? {
          exerciseName: setActions.editingSet?.exercises?.name || "",
          weight: setActions.editingSet?.weight,
          reps: setActions.editingSet?.reps,
          sets: setActions.editingSet?.sets,
          unit: setActions.editingSet?.unit,
        } : null}
      />
    </View>
  );
}

