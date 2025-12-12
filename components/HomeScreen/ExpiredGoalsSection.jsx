import React, { useState, useMemo, useEffect } from 'react';
import { View, Text } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';
import { startOfDay } from 'date-fns';
import GoalListItem from './GoalListItem';
import GoalGridItem from './GoalGridItem';
import SearchBarWithViewToggle from './SearchBarWithViewToggle';
import LoadMoreButton from './LoadMoreButton';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import GoalSortFilterModal from './GoalSortFilterModal';

export default function ExpiredGoalsSection({
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
}) {
  const colors = useThemedColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [displayLimit, setDisplayLimit] = useState(10); // Initial display limit
  const [sortBy, setSortBy] = useState('date'); // 'date', 'title', 'progress', 'target', 'overdue'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const cardType = 'expiredGoals';
  
  // Filter goals that are expired (have target_date in the past and are not completed)
  const baseFilteredGoals = useMemo(() => {
    const today = startOfDay(new Date());
    return fitnessGoals?.filter((g) => {
      // Must not be completed
      if (g.is_completed) return false;
      
      // Must have a target_date
      if (!g.target_date) return false;
      
      // Target date must be in the past
      const targetDate = startOfDay(new Date(g.target_date));
      return targetDate < today;
    }) || [];
  }, [fitnessGoals]);

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    let goals = baseFilteredGoals;
    
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
        case 'overdue':
          // Sort by how many days overdue (most overdue first)
          const today = startOfDay(new Date());
          const aTargetDate = startOfDay(new Date(a.target_date || 0));
          const bTargetDate = startOfDay(new Date(b.target_date || 0));
          aValue = today - aTargetDate; // Days overdue
          bValue = today - bTargetDate; // Days overdue
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
  }, [baseFilteredGoals, searchQuery, sortBy, sortOrder]);

  // Get goals to display (limited)
  const displayedGoals = useMemo(() => {
    return filteredGoals.slice(0, displayLimit);
  }, [filteredGoals, displayLimit]);

  const hasMore = filteredGoals.length > displayLimit;
  const displayCount = searchQuery.trim() ? filteredGoals.length : baseFilteredGoals.length;

  // Reset display limit when search changes or card collapses
  useEffect(() => {
    if (!cardExpanded[cardType]) {
      setSearchQuery('');
      setDisplayLimit(10);
    }
  }, [cardExpanded, cardType]);

  useEffect(() => {
    setDisplayLimit(10); // Reset to initial limit when search changes
  }, [searchQuery]);

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setDisplayLimit(10); // Reset display limit when sort changes
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => Math.min(prev + 20, filteredGoals.length));
  };

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
        title="Expired Goals"
        count={baseFilteredGoals.length > 0 ? displayCount : 0}
        isExpanded={cardExpanded[cardType]}
        onToggle={() => toggleCardExpansion(cardType)}
        onLogSet={openAddGoalModal}
        showLogSetButton={false}
        buttonText="Add Goal"
      />

      {cardExpanded[cardType] && (
        <>
          {/* Search Input with View Toggle */}
          {baseFilteredGoals.length > 0 && (
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
            showOverdueOption={true}
          />

          {/* Content */}
          {baseFilteredGoals.length > 0 ? (
            filteredGoals.length > 0 ? (
              viewMode === 'list' ? (
                // List View
                <>
                  {displayedGoals.map((goal, idx, arr) => (
                    <GoalListItem
                      key={goal.id}
                      goal={goal}
                      index={idx}
                      isLast={idx === arr.length - 1}
                      onPress={() => openGoalDetails(goal)}
                      onToggleComplete={() => handleToggleComplete(goal)}
                      onEdit={() => openEditGoalModal(goal)}
                      onDelete={() => handleDeleteGoal(goal.id)}
                      isCompleting={completeLoadingGoalId === goal.id}
                      isDeleting={deleteLoadingGoalId === goal.id}
                    />
                  ))}
                  {hasMore && (
                    <LoadMoreButton
                      remaining={filteredGoals.length - displayLimit}
                      onLoadMore={handleLoadMore}
                    />
                  )}
                </>
              ) : (
                // Grid View
                <>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {displayedGoals.map((goal, idx) => (
                      <GoalGridItem
                        key={goal.id}
                        goal={goal}
                        index={idx}
                        onPress={() => openGoalDetails(goal)}
                        onToggleComplete={() => handleToggleComplete(goal)}
                        onEdit={() => openEditGoalModal(goal)}
                        onDelete={() => handleDeleteGoal(goal.id)}
                        isCompleting={completeLoadingGoalId === goal.id}
                        isDeleting={deleteLoadingGoalId === goal.id}
                      />
                    ))}
                  </View>
                  {hasMore && (
                    <LoadMoreButton
                      remaining={filteredGoals.length - displayLimit}
                      onLoadMore={handleLoadMore}
                      fullWidth={true}
                    />
                  )}
                </>
              )
            ) : (
              <EmptyState type="noMatches" searchQuery={searchQuery} />
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
              <AlertCircle size={32} color={colors.text.tertiary} />
              <Text
                style={{ color: colors.text.tertiary, textAlign: 'center', marginTop: 8 }}
              >
                No expired goals. Great job staying on track!
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}




