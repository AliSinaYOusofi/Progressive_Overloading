import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, ChevronRight, ChevronDown } from 'lucide-react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTheme } from '../../contexts/ThemeContext';
import LoadMoreButton from './LoadMoreButton';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';

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
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [dateDisplayLimit, setDateDisplayLimit] = useState(10); // Show last 10 days initially
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  const cardType = isCompleted ? 'completedGoals' : 'goals';
  
  // Filter goals by completion status
  const baseFilteredGoals = useMemo(() => {
    return fitnessGoals?.filter((g) =>
      isCompleted ? g.is_completed : !g.is_completed
    ) || [];
  }, [fitnessGoals, isCompleted]);

  // Group goals by date
  const goalsByDate = useMemo(() => {
    const grouped = {};
    
    (baseFilteredGoals || []).forEach(goal => {
      const dateKey = goal.created_at;
      if (!dateKey) return;
      
      const date = new Date(dateKey);
      const dateStr = format(date, 'yyyy-MM-dd'); // Use consistent date string as key
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = {
          date: date,
          dateStr: dateStr,
          goals: [],
        };
      }
      grouped[dateStr].goals.push(goal);
    });

    // Convert to array and sort by date (newest first)
    return Object.values(grouped).sort((a, b) => {
      return b.date.getTime() - a.date.getTime();
    });
  }, [baseFilteredGoals]);

  // No filtering needed - show all dates
  const filteredDates = goalsByDate;

  // Get dates to display (limited)
  const displayedDates = useMemo(() => {
    return filteredDates.slice(0, dateDisplayLimit);
  }, [filteredDates, dateDisplayLimit]);

  const hasMore = filteredDates.length > dateDisplayLimit;
  const totalDatesCount = goalsByDate.length;

  // Format date for display
  const formatDateLabel = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  // Calculate stats for a date
  const getDateStats = (dateGroup) => {
    const totalGoals = dateGroup.goals.length;
    const completedGoals = dateGroup.goals.filter(g => g.is_completed).length;
    const totalProgress = dateGroup.goals.reduce((sum, g) => {
      const progress = g.target_value > 0 
        ? (g.current_value / g.target_value) * 100 
        : 0;
      return sum + progress;
    }, 0);
    const avgProgress = totalGoals > 0 ? totalProgress / totalGoals : 0;
    
    return { totalGoals, completedGoals, avgProgress };
  };

  const handleDatePress = (dateStr) => {
    router.push({
      pathname: '/homescreen/goal-day-detail',
      params: { date: dateStr, isCompleted: isCompleted ? 'true' : 'false' }
    });
  };

  const handleDateSelect = (dateStr) => {
    setShowDateDropdown(false);
    handleDatePress(dateStr);
  };

  const handleLoadMore = () => {
    setDateDisplayLimit(prev => prev + 10);
  };

  // Reset when card collapses
  useEffect(() => {
    if (!cardExpanded[cardType]) {
      setDateDisplayLimit(10);
    }
  }, [cardExpanded, cardType]);

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
      <SectionHeader
        title={isCompleted ? 'Completed Goals' : 'Goals'}
        count={totalDatesCount}
        isExpanded={cardExpanded[cardType]}
        onToggle={() => toggleCardExpansion(cardType)}
        onLogSet={openAddGoalModal}
        showLogSetButton={!isCompleted}
        buttonText="Add Goal"
      />

      {cardExpanded[cardType] && (
        <>
          {/* Date Dropdown Button */}
          {baseFilteredGoals.length > 0 && goalsByDate.length > 0 && (
            <View style={{ marginBottom: 16, position: 'relative' }}>
              <TouchableOpacity
                onPress={() => setShowDateDropdown(!showDateDropdown)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  backgroundColor: colors.background.primary,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: showDateDropdown ? colors.primary[600] : colors.border.light,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Calendar size={18} color={colors.primary[600]} />
                  <Text style={{ 
                    fontSize: 15, 
                    color: colors.text.primary,
                    fontWeight: '600'
                  }}>
                    Jump to Date ({goalsByDate.length} {goalsByDate.length === 1 ? 'day' : 'days'})
                  </Text>
                </View>
                <ChevronDown size={18} color={colors.text.tertiary} />
              </TouchableOpacity>

              {/* Date Dropdown */}
              {showDateDropdown && (
                <>
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: -300,
                      zIndex: 999,
                    }}
                    activeOpacity={1}
                    onPress={() => setShowDateDropdown(false)}
                  />
                  <View style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 4,
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    maxHeight: 200,
                    zIndex: 1000,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
                  }}>
                    <ScrollView 
                      nestedScrollEnabled
                      style={{ maxHeight: 200 }}
                    >
                      {goalsByDate.map((dateGroup, index) => {
                        const stats = getDateStats(dateGroup);
                        return (
                          <TouchableOpacity
                            key={dateGroup.dateStr}
                            onPress={() => handleDateSelect(dateGroup.dateStr)}
                            style={{
                              paddingHorizontal: 16,
                              paddingVertical: 12,
                              backgroundColor: 'transparent',
                              borderBottomWidth: index < goalsByDate.length - 1 ? 1 : 0,
                              borderBottomColor: colors.border.light,
                            }}
                          >
                            <Text style={{
                              fontSize: 14,
                              color: colors.text.primary,
                              fontWeight: '600',
                              marginBottom: 4,
                            }}>
                              {formatDateLabel(dateGroup.date)}
                            </Text>
                            <Text style={{
                              fontSize: 12,
                              color: colors.text.secondary,
                            }}>
                              {stats.totalGoals} {stats.totalGoals === 1 ? 'goal' : 'goals'} • {stats.completedGoals} completed
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Date Grouped Content */}
          {baseFilteredGoals.length > 0 ? (
            displayedDates.length > 0 ? (
              <>
                {displayedDates.map((dateGroup) => {
                  const stats = getDateStats(dateGroup);

                  return (
                    <TouchableOpacity
                      key={dateGroup.dateStr}
                      onPress={() => handleDatePress(dateGroup.dateStr)}
                      activeOpacity={0.7}
                      style={{
                        marginBottom: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                        backgroundColor: isDarkMode 
                          ? colors.neutral[200] 
                          : colors.background.card,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Date Header Card */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          <View
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              backgroundColor: isDarkMode
                                ? colors.neutral[300]
                                : colors.neutral[100],
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12,
                            }}
                          >
                            <Calendar
                              size={18}
                              color={colors.text.secondary}
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: colors.text.primary,
                                marginBottom: 2,
                              }}
                            >
                              {formatDateLabel(dateGroup.date)}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: colors.text.secondary,
                              }}
                            >
                              {stats.totalGoals} {stats.totalGoals === 1 ? 'goal' : 'goals'} • {stats.completedGoals} completed
                            </Text>
                          </View>
                        </View>
                        <ChevronRight 
                          size={20} 
                          color={colors.text.secondary}
                          style={{ opacity: 0.5 }}
                        />
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {hasMore && (
                  <LoadMoreButton
                    remaining={filteredDates.length - dateDisplayLimit}
                    onLoadMore={handleLoadMore}
                    fullWidth={true}
                  />
                )}
              </>
            ) : null
          ) : (
            <EmptyState type="noSets" />
          )}
        </>
      )}
    </View>
  );
}
