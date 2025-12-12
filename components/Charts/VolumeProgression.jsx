import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Filter, ChevronDown, GitCompare } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from "../../hooks/useThemedColors"
import VolumeCalculationInfoModal from "./VolumeCalculationInfoModal"
import VolumeProgressionCard from "./VolumeProgressionCard"
import VolumeProgressionEmptyState from "./VolumeProgressionEmptyState"
import VolumeProgressionFilterModal from "./VolumeProgressionFilterModal"
import VolumeDayDetailModal from "./VolumeDayDetailModal"
import { getVolumeList, sortVolumeList } from "./utils/volumeProgressionUtils"

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function VolumeProgression({ volumeProgression, onCrossCheckPress }) {
  const colors = useThemedColors();
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showDayDetailModal, setShowDayDetailModal] = useState(false)
  const [selectedVolumeEntry, setSelectedVolumeEntry] = useState(null)

  // Reset visible count when volumeProgression or sort changes
  useEffect(() => {
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  }, [volumeProgression, sortBy, sortOrder]);
  
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + LOAD_MORE_COUNT);
  };

  const handleCardPress = (volumeEntry) => {
    setSelectedVolumeEntry(volumeEntry);
    setShowDayDetailModal(true);
  };

  if (!volumeProgression) {
    return null;
  }

  const volumeList = getVolumeList(volumeProgression);
  const sortedVolumeList = sortVolumeList(volumeList, sortBy, sortOrder);
  const visibleVolumes = sortedVolumeList.slice(0, visibleCount);
  const hasMore = sortedVolumeList.length > visibleCount;
  const remainingCount = sortedVolumeList.length - visibleCount;

  return (
    <View>
      {/* Controls Row */}
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 16 
      }}>
        {/* Info Button */}
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: colors.primary[100],
          }}
        >
          <Ionicons name="information-circle" size={16} color={colors.primary[600]} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary[700] }}>How it's calculated</Text>
        </TouchableOpacity>
      </View>

      {volumeList.length > 0 ? (
        <View>
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 12,
          }}>
            <Text style={{ 
              fontSize: 14, 
              color: colors.text.secondary,
              fontWeight: '500',
            }}>
              {volumeList.length} {volumeList.length === 1 ? 'day' : 'days'}
              {hasMore && ` • Showing ${visibleCount}`}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {onCrossCheckPress && (
                <TouchableOpacity
                  onPress={onCrossCheckPress}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: colors.background.primary,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                  }}
                >
                  <GitCompare size={16} color={colors.primary[600]} />
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: colors.primary[600],
                  }}>
                    Cross Check
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowFilterModal(true)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  backgroundColor: colors.background.primary,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Filter size={16} color={colors.primary[600]} />
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.primary[600],
                }}>
                  Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {visibleVolumes.map((volumeEntry, index) => (
            <VolumeProgressionCard
              key={volumeEntry.date || index}
              volumeEntry={volumeEntry}
              onPress={() => handleCardPress(volumeEntry)}
            />
          ))}
          
          {/* Load More Button */}
          {hasMore && (
            <TouchableOpacity
              onPress={handleLoadMore}
              activeOpacity={0.7}
              style={{
                marginTop: 8,
                marginBottom: 12,
                paddingVertical: 14,
                paddingHorizontal: 20,
                backgroundColor: colors.background.primary,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border.light,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Text style={{
                fontSize: 15,
                fontWeight: '600',
                color: colors.primary[600],
              }}>
                Load {Math.min(LOAD_MORE_COUNT, remainingCount)} More
              </Text>
              <ChevronDown size={18} color={colors.primary[600]} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <VolumeProgressionEmptyState />
      )}

      {/* Volume Calculation Info Modal */}
      <VolumeCalculationInfoModal 
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      {/* Filter Modal */}
      <VolumeProgressionFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />

      {/* Day Detail Modal */}
      <VolumeDayDetailModal
        visible={showDayDetailModal}
        onClose={() => {
          setShowDayDetailModal(false);
          setSelectedVolumeEntry(null);
        }}
        volumeEntry={selectedVolumeEntry}
      />
    </View>
  )
}
