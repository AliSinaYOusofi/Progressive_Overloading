import React, { useState, useMemo, useEffect } from 'react';
import { View } from 'react-native';
import { useThemedColors } from '../../hooks/useThemedColors';
import SetListItem from './SetListItem';
import SetGridItem from './SetGridItem';
import SearchBarWithViewToggle from './SearchBarWithViewToggle';
import LoadMoreButton from './LoadMoreButton';
import EmptyState from './EmptyState';
import SectionHeader from './SectionHeader';
import SortFilterModal from './SortFilterModal';

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
  const [displayLimit, setDisplayLimit] = useState(10); // Initial display limit
  const [sortBy, setSortBy] = useState('date'); // 'date', 'weight', 'reps', 'sets', 'exercise'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [sortModalVisible, setSortModalVisible] = useState(false);

  // Filter and sort sets
  const filteredSets = useMemo(() => {
    let sets = recentSets || [];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      sets = sets.filter(set => {
        const exerciseName = (set.exercises?.name || 'Exercise').toLowerCase();
        return exerciseName.includes(query);
      });
    }

    // Apply sorting
    const sorted = [...sets].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.created_at || a.date || 0).getTime();
          bValue = new Date(b.created_at || b.date || 0).getTime();
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
  }, [recentSets, searchQuery, sortBy, sortOrder]);

  // Get sets to display (limited)
  const displayedSets = useMemo(() => {
    return filteredSets.slice(0, displayLimit);
  }, [filteredSets, displayLimit]);

  const hasMore = filteredSets.length > displayLimit;
  const displayCount = searchQuery.trim() ? filteredSets.length : recentSets.length;

  // Reset display limit when search changes or card collapses
  useEffect(() => {
    if (!cardExpanded.recentSets) {
      setSearchQuery('');
      setDisplayLimit(10);
    }
  }, [cardExpanded.recentSets]);

  useEffect(() => {
    setDisplayLimit(10); // Reset to initial limit when search changes
  }, [searchQuery]);

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setDisplayLimit(10); // Reset display limit when sort changes
  };

  const handleLoadMore = () => {
    setDisplayLimit(prev => Math.min(prev + 10, filteredSets.length));
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
        title="Recent Sets"
        count={recentSets?.length > 0 ? displayCount : 0}
        isExpanded={cardExpanded.recentSets}
        onToggle={() => toggleCardExpansion('recentSets')}
        onLogSet={handleOpenLogSet}
        showLogSetButton={true}
      />

      {cardExpanded.recentSets && (
        <>
          {/* Search Input with View Toggle */}
          {recentSets?.length > 0 && (
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

          {/* Content */}
          {recentSets?.length > 0 ? (
            filteredSets.length > 0 ? (
              viewMode === 'list' ? (
                // List View
                <>
                  {displayedSets.map((s, idx, arr) => (
                    <SetListItem
                      key={s.id}
                      set={s}
                      index={idx}
                      isLast={idx === arr.length - 1}
                      onPress={() => openSetDetails(s)}
                      onEdit={() => openEditSetModal(s)}
                      onDelete={() => handleDeleteSetFromList(s)}
                      isDeleting={deleteLoadingSetId === s.id}
                    />
                  ))}
                  {hasMore && (
                    <LoadMoreButton
                      remaining={filteredSets.length - displayLimit}
                      onLoadMore={handleLoadMore}
                    />
                  )}
                </>
              ) : (
                // Grid View
                <>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {displayedSets.map((s, idx) => (
                      <SetGridItem
                        key={s.id}
                        set={s}
                        index={idx}
                        onPress={() => openSetDetails(s)}
                        onEdit={() => openEditSetModal(s)}
                        onDelete={() => handleDeleteSetFromList(s)}
                        isDeleting={deleteLoadingSetId === s.id}
                      />
                    ))}
                  </View>
                  {hasMore && (
                    <LoadMoreButton
                      remaining={filteredSets.length - displayLimit}
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
            <EmptyState type="noSets" />
          )}
        </>
      )}
    </View>
  );
}
