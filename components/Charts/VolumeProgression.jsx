import React, { useState, useEffect, useMemo } from "react"
import { View, Text, TouchableOpacity, Dimensions } from "react-native"
import { Filter, ChevronDown, GitCompare, TrendingUp, TrendingDown, Activity, Trophy, Target, Calendar } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from "../../hooks/useThemedColors"
import { useTheme } from "../../contexts/ThemeContext"
import { BarChart } from "react-native-gifted-charts"
import VolumeCalculationInfoModal from "./VolumeCalculationInfoModal"
import VolumeProgressionCard from "./VolumeProgressionCard"
import VolumeProgressionEmptyState from "./VolumeProgressionEmptyState"
import VolumeProgressionFilterModal from "./VolumeProgressionFilterModal"
import VolumeDayDetailModal from "./VolumeDayDetailModal"
import { getVolumeList, sortVolumeList, calculateVolumeTrend } from "./utils/volumeProgressionUtils"

const { width: screenWidth } = Dimensions.get('window');

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function VolumeProgression({ volumeProgression, onCrossCheckPress }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
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

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!volumeList || volumeList.length === 0) {
      return {
        totalVolume: 0,
        averageVolume: 0,
        bestDay: null,
        workoutDays: 0,
        trend: null,
        weekOverWeekChange: 0,
      };
    }

    const totalVolume = volumeList.reduce((sum, day) => sum + (day.totalVolume || 0), 0);
    const averageVolume = totalVolume / volumeList.length;
    const bestDay = volumeList.reduce((best, current) => {
      if ((current.totalVolume || 0) > (best?.totalVolume || 0)) {
        return current;
      }
      return best;
    }, null);

    // Calculate week-over-week trend
    const sortedByDate = sortVolumeList(volumeList, 'date', 'desc');
    const lastWeek = sortedByDate.slice(0, 7);
    const previousWeek = sortedByDate.slice(7, 14);
    
    const lastWeekAvg = lastWeek.length > 0 
      ? lastWeek.reduce((sum, d) => sum + (d.totalVolume || 0), 0) / lastWeek.length 
      : 0;
    const previousWeekAvg = previousWeek.length > 0 
      ? previousWeek.reduce((sum, d) => sum + (d.totalVolume || 0), 0) / previousWeek.length 
      : 0;
    
    const weekOverWeekChange = previousWeekAvg > 0 
      ? ((lastWeekAvg - previousWeekAvg) / previousWeekAvg) * 100 
      : 0;

    const trend = calculateVolumeTrend(sortedByDate);

    return {
      totalVolume,
      averageVolume,
      bestDay,
      workoutDays: volumeList.length,
      trend,
      weekOverWeekChange,
    };
  }, [volumeList]);

  // Prepare bar chart data (chronological order for trend visualization)
  const barChartData = useMemo(() => {
    if (!volumeList || volumeList.length === 0) return [];
    
    const chronologicalList = sortVolumeList(volumeList, 'date', 'asc');
    // Show last 14 days or all if less
    const recentDays = chronologicalList.slice(-14);
    
    return recentDays.map((day) => {
      const date = new Date(day.date);
      const label = date.toLocaleDateString("en", { month: "short", day: "numeric" });
      
      return {
        value: day.totalVolume || 0,
        label: label,
        labelTextStyle: { 
          color: colors.text.tertiary, 
          fontSize: 9,
          fontWeight: '500',
        },
        frontColor: colors.primary[600],
        topLabelComponent: () => (
          <Text style={{ 
            fontSize: 8, 
            color: isDarkMode ? colors.text.white : colors.text.primary, 
            fontWeight: '600',
            marginBottom: 2 
          }}>
            {day.totalVolume >= 1000 ? `${(day.totalVolume / 1000).toFixed(1)}k` : day.totalVolume.toFixed(0)}
          </Text>
        ),
      };
    });
  }, [volumeList, colors, isDarkMode]);

  // Get top exercises by total volume contribution
  const topExercises = useMemo(() => {
    if (!volumeList || volumeList.length === 0) return [];
    
    const exerciseTotals = {};
    
    volumeList.forEach(day => {
      if (day.exerciseVolumes) {
        Object.keys(day.exerciseVolumes).forEach(exercise => {
          if (!exerciseTotals[exercise]) {
            exerciseTotals[exercise] = 0;
          }
          exerciseTotals[exercise] += day.exerciseVolumes[exercise] || 0;
        });
      }
    });
    
    return Object.entries(exerciseTotals)
      .map(([exercise, volume]) => ({ exercise, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
  }, [volumeList]);

  // Format volume helper
  const formatVolume = (volume) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k`;
    }
    return volume.toFixed(0);
  };

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
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background.primary,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        >
          <Ionicons name="information-circle" size={18} color={colors.icon.primary || colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {volumeList.length > 0 ? (
        <View>
          {/* Summary Statistics */}
          <View style={{ 
            flexDirection: "row", 
            flexWrap: "wrap", 
            gap: 12,
            marginBottom: 24 
          }}>
            <View style={{ 
              flex: 1,
              minWidth: "47%",
              backgroundColor: colors.background.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Activity size={18} color={colors.icon.primary} />
                <Text style={{ 
                  fontSize: 12, 
                  color: colors.text.tertiary,
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}>
                  Total Volume
                </Text>
              </View>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: "800", 
                color: colors.text.primary,
                letterSpacing: -0.5,
              }}>
                {formatVolume(summaryStats.totalVolume)}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: colors.text.secondary,
                marginTop: 2,
              }}>
                kg across {summaryStats.workoutDays} {summaryStats.workoutDays === 1 ? 'day' : 'days'}
              </Text>
            </View>

            <View style={{ 
              flex: 1,
              minWidth: "47%",
              backgroundColor: colors.background.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Target size={18} color={colors.icon.primary} />
                <Text style={{ 
                  fontSize: 12, 
                  color: colors.text.tertiary,
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}>
                  Avg per Day
                </Text>
              </View>
              <Text style={{ 
                fontSize: 24, 
                fontWeight: "800", 
                color: colors.text.primary,
                letterSpacing: -0.5,
              }}>
                {formatVolume(summaryStats.averageVolume)}
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: colors.text.secondary,
                marginTop: 2,
              }}>
                kg per workout
              </Text>
            </View>

            {summaryStats.bestDay && (
              <View style={{ 
                flex: 1,
                minWidth: "47%",
                backgroundColor: colors.background.card,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border.light,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Trophy size={18} color={colors.primary[600]} />
                  <Text style={{ 
                    fontSize: 12, 
                    color: colors.text.tertiary,
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}>
                    Best Day
                  </Text>
                </View>
                <Text style={{ 
                  fontSize: 20, 
                  fontWeight: "800", 
                  color: colors.text.primary,
                  letterSpacing: -0.5,
                }}>
                  {formatVolume(summaryStats.bestDay.totalVolume)}
                </Text>
                <Text style={{ 
                  fontSize: 12, 
                  color: colors.text.secondary,
                  marginTop: 2,
                }}>
                  {new Date(summaryStats.bestDay.date).toLocaleDateString("en", { 
                    month: "short", 
                    day: "numeric" 
                  })}
                </Text>
              </View>
            )}

            <View style={{ 
              flex: 1,
              minWidth: "47%",
              backgroundColor: colors.background.card,
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Calendar size={18} color={colors.primary[600]} />
                <Text style={{ 
                  fontSize: 12, 
                  color: colors.text.tertiary,
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}>
                  Workout Frequency
                </Text>
              </View>
              <Text style={{ 
                fontSize: 20, 
                fontWeight: "800", 
                color: colors.text.primary,
                letterSpacing: -0.5,
              }}>
                {summaryStats.workoutDays}
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: colors.text.secondary,
                marginTop: 2,
              }}>
                {summaryStats.workoutDays === 1 ? 'day' : 'days'} logged
              </Text>
            </View>
          </View>

          {/* Trend Indicator */}
          {summaryStats.trend && summaryStats.trend !== 'stable' && (
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: summaryStats.weekOverWeekChange > 0 
                ? colors.status.success + '15' 
                : colors.status.error + '15',
              borderRadius: 12,
              padding: 14,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: summaryStats.weekOverWeekChange > 0 
                ? colors.status.success + '30' 
                : colors.status.error + '30',
            }}>
              {summaryStats.weekOverWeekChange > 0 ? (
                <TrendingUp size={20} color={colors.status.success} />
              ) : (
                <TrendingDown size={20} color={colors.status.error} />
              )}
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={{ 
                  fontSize: 15, 
                  fontWeight: "700", 
                  color: colors.text.primary,
                }}>
                  {summaryStats.weekOverWeekChange > 0 ? "Volume Increased" : "Volume Decreased"}
                </Text>
                <Text style={{ 
                  fontSize: 13, 
                  color: colors.text.secondary,
                  marginTop: 2,
                }}>
                  {Math.abs(summaryStats.weekOverWeekChange).toFixed(1)}% change from last week
                </Text>
              </View>
            </View>
          )}

          {/* Volume Trend Chart */}
          {barChartData.length > 0 && (
            <View style={{ 
              backgroundColor: colors.background.primary,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: colors.border.light,
            }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: "600", 
                color: colors.text.primary,
                marginBottom: 16 
              }}>
                Volume Trend (Last 14 Days)
              </Text>
              <BarChart
                data={barChartData}
                width={screenWidth - 100}
                height={200}
                barWidth={20}
                initialSpacing={10}
                spacing={12}
                barBorderRadius={6}
                showGradient
                gradientColor={colors.primary[400]}
                yAxisThickness={1}
                xAxisThickness={1}
                xAxisColor={colors.border.medium}
                yAxisColor={colors.border.medium}
                yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: '500' }}
                yAxisLabelWidth={40}
                maxValue={Math.max(...barChartData.map(d => d.value)) * 1.1 || 1000}
                noOfSections={4}
                isAnimated
                animationDuration={1000}
                cappedBars
                capColor={colors.primary[700]}
                capThickness={3}
                capRadius={3}
                showValuesAsTopLabel
                topLabelTextStyle={{ color: isDarkMode ? colors.text.white : colors.text.primary, fontSize: 8, fontWeight: '600' }}
                topLabelContainerStyle={{ marginBottom: 6 }}
                rulesColor={colors.border.light}
                rulesType="solid"
                dashGap={0}
              />
            </View>
          )}

          {/* Top Exercises Breakdown */}
          {topExercises.length > 0 && (
            <View style={{ 
              marginBottom: 24,
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.background.secondary || colors.neutral[100],
                }}>
                  <Activity size={18} color={colors.icon.primary} />
                </View>
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: "600", 
                  color: colors.text.primary,
                }}>
                  Top Exercises by Volume
                </Text>
              </View>
              {topExercises.map((item, index) => {
                const percentage = summaryStats.totalVolume > 0 
                  ? (item.volume / summaryStats.totalVolume) * 100 
                  : 0;
                return (
                  <View
                    key={item.exercise}
                    style={{
                      backgroundColor: colors.background.card,
                      borderRadius: 14,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: colors.border.light,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                      {/* Rank Badge */}
                      <View style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: colors.background.secondary || colors.neutral[100],
                        marginRight: 12,
                      }}>
                        <Text style={{ 
                          fontSize: 14, 
                          fontWeight: "700", 
                          color: colors.text.secondary,
                        }}>
                          #{index + 1}
                        </Text>
                      </View>
                      
                      {/* Exercise Info */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          fontSize: 16, 
                          fontWeight: "600", 
                          color: colors.text.primary,
                          marginBottom: 4,
                        }}>
                          {item.exercise}
                        </Text>
                        <Text style={{ 
                          fontSize: 12, 
                          color: colors.text.tertiary,
                        }}>
                          {percentage.toFixed(1)}% of total volume
                        </Text>
                      </View>
                    </View>
                    
                    {/* Volume Display */}
                    <View style={{ 
                      flexDirection: "row", 
                      alignItems: "center", 
                      justifyContent: "space-between",
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: colors.border.light,
                    }}>
                      <View>
                        <Text style={{ 
                          fontSize: 13, 
                          fontWeight: "600", 
                          color: colors.text.secondary,
                          marginBottom: 2,
                        }}>
                          Total Volume
                        </Text>
                        <Text style={{ 
                          fontSize: 20, 
                          fontWeight: "700", 
                          color: colors.text.primary,
                        }}>
                          {formatVolume(item.volume)} kg
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ 
                          fontSize: 13, 
                          fontWeight: "600", 
                          color: colors.text.secondary,
                          marginBottom: 2,
                        }}>
                          Percentage
                        </Text>
                        <Text style={{ 
                          fontSize: 20, 
                          fontWeight: "700", 
                          color: colors.text.primary,
                        }}>
                          {percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

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
