import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Target, CheckCircle2, TrendingUp } from 'lucide-react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppStore } from '../../stores/useAppStore';
import GoalListItem from '../../components/HomeScreen/GoalListItem';
import GoalGridItem from '../../components/HomeScreen/GoalGridItem';
import SearchBarWithViewToggle from '../../components/HomeScreen/SearchBarWithViewToggle';
import EmptyState from '../../components/HomeScreen/EmptyState';
import GoalSortFilterModal from '../../components/HomeScreen/GoalSortFilterModal';
import { useGoalActions } from '../../hooks/useGoalActions';
import GoalDetailsModal from '../../components/HomeScreen/GoalDetailsModal';

export default function GoalDayDetailScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const { date: dateParam, isCompleted: isCompletedParam } = useLocalSearchParams();
  
  // Use individual selectors to avoid re-rendering on every store change
  const user = useAppStore(state => state.user);
  const fitnessGoals = useAppStore(state => state.fitnessGoals);
  
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isCompleted = isCompletedParam === 'true';

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

  // Filter goals by date and completion status
  const dayGoals = useMemo(() => {
    if (!selectedDate || !fitnessGoals) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    return fitnessGoals.filter(goal => {
      if (!goal.created_at) return false;
      const goalDateStr = format(new Date(goal.created_at), 'yyyy-MM-dd');
      const matchesDate = goalDateStr === dateStr;
      const matchesCompletion = isCompleted ? goal.is_completed : !goal.is_completed;
      return matchesDate && matchesCompletion;
    });
  }, [fitnessGoals, selectedDate, isCompleted]);

  // Format date for display
  const formatDateLabel = (date) => {
    if (!date) return 'Invalid Date';
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  // Calculate comprehensive stats for the day
  const dayStats = useMemo(() => {
    const totalGoals = dayGoals.length;
    const completedGoals = dayGoals.filter(g => g.is_completed).length;
    const totalProgress = dayGoals.reduce((sum, g) => {
      const progress = g.target_value > 0 
        ? (g.current_value / g.target_value) * 100 
        : 0;
      return sum + progress;
    }, 0);
    const avgProgress = totalGoals > 0 ? totalProgress / totalGoals : 0;
    
    const totalTargetValue = dayGoals.reduce((sum, g) => sum + (parseFloat(g.target_value) || 0), 0);
    const totalCurrentValue = dayGoals.reduce((sum, g) => sum + (parseFloat(g.current_value) || 0), 0);
    
    // Goals with target dates
    const goalsWithTargetDate = dayGoals.filter(g => g.target_date);
    const upcomingDeadlines = goalsWithTargetDate.filter(g => {
      const targetDate = new Date(g.target_date);
      return targetDate > new Date();
    }).length;

    return {
      totalGoals,
      completedGoals,
      avgProgress,
      totalTargetValue,
      totalCurrentValue,
      upcomingDeadlines,
    };
  }, [dayGoals]);

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let goals = dayGoals;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      goals = goals.filter(goal => {
        const title = (goal.title || '').toLowerCase();
        const description = (goal.description || '').toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }

    // Apply sorting
    const sorted = [...goals].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'progress':
          const aProgress = a.target_value > 0 
            ? (a.current_value / a.target_value) * 100 
            : 0;
          const bProgress = b.target_value > 0 
            ? (b.current_value / b.target_value) * 100 
            : 0;
          aValue = aProgress;
          bValue = bProgress;
          break;
        case 'target':
          aValue = parseFloat(a.target_value) || 0;
          bValue = parseFloat(b.target_value) || 0;
          break;
        default:
          return 0;
      }

      if (sortBy === 'title') {
        // String comparison for titles
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
  }, [dayGoals, searchQuery, sortBy, sortOrder]);

  // Goal actions hook
  const goalActions = useGoalActions({ 
    user, 
    fitnessGoals, 
    setFitnessGoals: useAppStore.getState().setFitnessGoals,
    addFitnessGoal: useAppStore.getState().addFitnessGoal,
    updateFitnessGoal: useAppStore.getState().updateFitnessGoal,
    removeFitnessGoal: useAppStore.getState().removeFitnessGoal,
  });

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  // Wrapper for handleToggleComplete with success/error messages
  const handleToggleCompleteWithMessage = async (goal) => {
    setErrorMessage("");
    setSuccessMessage("");
    
    const wasCompleted = goal.is_completed;
    
    try {
      // Call the toggle function (it does optimistic updates internally)
      await goalActions.handleToggleComplete(goal);
      
      // Show success message immediately since the function does optimistic updates
      // If there's an error, the state will revert but we show success for better UX
      setSuccessMessage(wasCompleted ? "Goal reopened successfully!" : "Goal completed successfully!");
    } catch (error) {
      console.error('Error toggling goal completion:', error);
      setErrorMessage(error.message || "Failed to update goal. Please try again.");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Refresh goals from store - data should already be up to date
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // Refresh goals after edit/delete
  useEffect(() => {
    // Goals are already in the store, no need to reload
  }, [goalActions.deleteLoadingGoalId, goalActions.completeLoadingGoalId]);

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
        <Text style={{ color: colors.text.secondary, marginTop: 16 }}>Loading goals...</Text>
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
            {dayStats.totalGoals} {dayStats.totalGoals === 1 ? 'goal' : 'goals'} • {dayStats.completedGoals} completed
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Success Message */}
        {successMessage ? (
          <View style={{ 
            marginBottom: 16,
            backgroundColor: colors.status.success + '20',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: colors.status.success,
          }}>
            <Text style={{ 
              color: colors.status.success, 
              fontSize: 14, 
              fontWeight: "600",
            }}>
              {successMessage}
            </Text>
          </View>
        ) : null}

        {/* Error Message */}
        {errorMessage ? (
          <View style={{ 
            marginBottom: 16,
            backgroundColor: colors.status.error + '20',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: colors.status.error,
          }}>
            <Text style={{ 
              color: colors.status.error, 
              fontSize: 14, 
              fontWeight: "600",
            }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Goal Summary Stats */}
        {dayGoals.length > 0 && (
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
              Goals Summary
            </Text>

            {/* Main Stats Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              {/* Total Goals */}
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
                  <Target size={18} color={colors.primary[600]} />
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
                    Total Goals
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
                  {dayStats.totalGoals}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>goals</Text>
              </View>

              {/* Completed Goals */}
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
                  <CheckCircle2 size={18} color={colors.text.secondary} />
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
                    Completed
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
                  {dayStats.completedGoals}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>goals</Text>
              </View>

              {/* Average Progress */}
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
                    Avg Progress
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
                  {dayStats.avgProgress.toFixed(1)}%
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.secondary }}>average</Text>
              </View>

              {/* Upcoming Deadlines */}
              {dayStats.upcomingDeadlines > 0 && (
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
                    <Calendar size={18} color={colors.text.secondary} />
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
                      Deadlines
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
                    {dayStats.upcomingDeadlines}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.secondary }}>upcoming</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Search and Sort */}
        {dayGoals.length > 0 && (
          <SearchBarWithViewToggle
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSortPress={() => setSortModalVisible(true)}
          />
        )}

        {/* Sort/Filter Modal */}
        <GoalSortFilterModal
          visible={sortModalVisible}
          onClose={() => setSortModalVisible(false)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
        />

        {/* Goals List/Grid */}
        {dayGoals.length > 0 ? (
          filteredGoals.length > 0 ? (
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
                {filteredGoals.map((goal, idx, arr) => (
                  <GoalListItem
                    key={goal.id}
                    goal={goal}
                    index={idx}
                    isLast={idx === arr.length - 1}
                    onPress={() => goalActions.openGoalDetails(goal)}
                    onToggleComplete={() => handleToggleCompleteWithMessage(goal)}
                    onEdit={() => goalActions.openEditGoalModal(goal)}
                    onDelete={() => goalActions.handleDeleteGoal(goal.id)}
                    isCompleting={goalActions.completeLoadingGoalId === goal.id}
                    isDeleting={goalActions.deleteLoadingGoalId === goal.id}
                  />
                ))}
              </View>
            ) : (
              // Grid View
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {filteredGoals.map((goal, idx) => (
                  <GoalGridItem
                    key={goal.id}
                    goal={goal}
                    index={idx}
                    onPress={() => goalActions.openGoalDetails(goal)}
                    onToggleComplete={() => handleToggleCompleteWithMessage(goal)}
                    onEdit={() => goalActions.openEditGoalModal(goal)}
                    onDelete={() => goalActions.handleDeleteGoal(goal.id)}
                    isCompleting={goalActions.completeLoadingGoalId === goal.id}
                    isDeleting={goalActions.deleteLoadingGoalId === goal.id}
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
      <GoalDetailsModal
        visible={goalActions.isGoalDetailsVisible}
        onClose={() => goalActions.setIsGoalDetailsVisible(false)}
        selectedGoal={goalActions.selectedGoal}
        onToggleComplete={(goal) => goalActions.handleToggleComplete(goal, true)}
        onEdit={(goal) => goalActions.openEditGoalModal(goal)}
        onDelete={(goalId) => goalActions.handleDeleteGoal(goalId, true)}
        isCompleteLoading={goalActions.modalCompleteLoadingGoalId !== null}
        isDeleteLoading={goalActions.modalDeleteLoadingGoalId !== null}
        completeLoadingId={goalActions.modalCompleteLoadingGoalId}
        deleteLoadingId={goalActions.modalDeleteLoadingGoalId}
      />
    </View>
  );
}

