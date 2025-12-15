import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { useThemedColors } from "../../hooks/useThemedColors"
import { Ionicons } from "@expo/vector-icons"
import { Filter, TrendingUp, TrendingDown, Activity, Dumbbell } from "lucide-react-native"
import { getCurrentUser, getProgressiveOverloadInsights } from "../../lib/database"
import ExerciseDetailModal from "./ExerciseDetailModal"
import ProgressiveOverloadInfoModal from "./ProgressiveOverloadInfoModal"
import ProgressiveOverloadFilterModal from "./ProgressiveOverloadFilterModal"
import { sortProgressiveOverloadInsights } from "./utils/progressiveOverloadUtils"

export default function ProgressiveOverloadInsights({ 
  progressiveOverloadInsights: initialData,
  parentTimeframe = 30 
}) {
  const colors = useThemedColors();
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [userId, setUserId] = useState(null)
  const [hasUserChangedFilter, setHasUserChangedFilter] = useState(false)
  
  // Convert parent timeframe to component's format
  const convertParentTimeframe = (timeframe) => {
    if (timeframe === 'all') return 36500
    if (typeof timeframe === 'number') return timeframe
    return 30
  }
  
  const [selectedTimeframe, setSelectedTimeframe] = useState(() => convertParentTimeframe(parentTimeframe))
  const [insights, setInsights] = useState(initialData || [])
  const [loading, setLoading] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(10)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [sortBy, setSortBy] = useState('totalGain')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Sync with parent timeframe when it changes (only if user hasn't manually changed it)
  useEffect(() => {
    if (!hasUserChangedFilter) {
      const newTimeframe = convertParentTimeframe(parentTimeframe)
      setSelectedTimeframe(newTimeframe)
    }
    // Reset the flag when parent changes to 'all' to allow syncing
    if (parentTimeframe === 'all') {
      setHasUserChangedFilter(false)
    }
  }, [parentTimeframe])

  const timeframes = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
    { label: "All", value: 36500 }, // 100 years for all time
  ]

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (userId) {
      loadInsights()
    }
  }, [userId, selectedTimeframe])

  const loadUser = async () => {
    const user = await getCurrentUser()
    if (user) {
      setUserId(user.id)
    }
  }

  const loadInsights = async () => {
    try {
      setLoading(true)
      const data = await getProgressiveOverloadInsights(userId, selectedTimeframe)
      setInsights(data || [])
    } catch (error) {
      console.error("Error loading progressive overload insights:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExercisePress = (exerciseName) => {
    setSelectedExercise(exerciseName)
    setShowDetailModal(true)
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10)
  }

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  // Reset visible count when insights or sort changes
  useEffect(() => {
    setVisibleCount(10)
  }, [insights, sortBy, sortOrder])

  // Calculate summary statistics
  const summaryStats = React.useMemo(() => {
    if (!insights || insights.length === 0) return null
    
    const excellent = insights.filter(i => i.progression === 'excellent').length
    const good = insights.filter(i => i.progression === 'good').length
    const stable = insights.filter(i => i.progression === 'stable').length
    const declining = insights.filter(i => i.progression === 'declining').length
    
    const avgTotalGain = insights.reduce((sum, i) => sum + (i.totalGain || 0), 0) / insights.length
    const avgWeeklyGain = insights.reduce((sum, i) => sum + (i.weeklyGain || 0), 0) / insights.length
    const totalWorkouts = insights.reduce((sum, i) => sum + (i.workoutCount || 0), 0)
    const totalSets = insights.reduce((sum, i) => sum + (i.totalSets || 0), 0)
    
    // Calculate average numerical gains
    const exercisesWith1RM = insights.filter(i => i.starting1RM && i.ending1RM)
    const avgTotalNumericalGain = exercisesWith1RM.length > 0
      ? exercisesWith1RM.reduce((sum, i) => sum + (i.ending1RM - i.starting1RM), 0) / exercisesWith1RM.length
      : null
    
    const exercisesWithWeeklyData = insights.filter(i => i.starting1RM && i.ending1RM && i.timeSpanWeeks)
    const avgWeeklyNumericalGain = exercisesWithWeeklyData.length > 0
      ? exercisesWithWeeklyData.reduce((sum, i) => sum + ((i.ending1RM - i.starting1RM) / i.timeSpanWeeks), 0) / exercisesWithWeeklyData.length
      : null
    
    return {
      total: insights.length,
      excellent,
      good,
      stable,
      declining,
      avgTotalGain,
      avgWeeklyGain,
      avgTotalNumericalGain,
      avgWeeklyNumericalGain,
      totalWorkouts,
      totalSets
    }
  }, [insights])

  // Get sorted and visible insights
  const sortedInsights = React.useMemo(() => {
    return sortProgressiveOverloadInsights(insights, sortBy, sortOrder)
  }, [insights, sortBy, sortOrder])

  const visibleInsights = sortedInsights.slice(0, visibleCount)
  const hasMore = sortedInsights.length > visibleCount

  if (loading && insights.length === 0) {
    return (
      <View style={{ marginBottom: 32 }}>
        <View style={{ 
          backgroundColor: colors.background.card, 
          borderRadius: 16, 
          padding: 24, 
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: colors.border.light
        }}>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Ionicons name="analytics-outline" size={28} color={colors.primary[600]} />
            <Text style={{ 
              fontSize: 16, 
              fontWeight: "500", 
              color: colors.text.secondary, 
              textAlign: "center", 
              marginTop: 16 
            }}>Loading insights...</Text>
          </View>
        </View>
      </View>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <View style={{ marginBottom: 32 }}>
        {/* Timeframe Filter */}
        <View style={{ marginBottom: 16 }}>
          <View 
            style={{ 
              flexDirection: "row", 
              backgroundColor: colors.background.secondary, 
              borderRadius: 12, 
              padding: 4 
            }}
          >
            {timeframes.map((timeframe) => (
              <TouchableOpacity
                key={timeframe.label}
                onPress={() => {
                  setSelectedTimeframe(timeframe.value)
                  setHasUserChangedFilter(true)
                }}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: selectedTimeframe === timeframe.value 
                    ? colors.primary[600] 
                    : "transparent",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: 14,
                    color: selectedTimeframe === timeframe.value 
                      ? colors.text.white 
                      : colors.text.secondary,
                  }}
                >
                  {timeframe.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ 
          backgroundColor: colors.background.card, 
          borderRadius: 16, 
          padding: 24, 
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: colors.border.light
        }}>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <View style={{ 
              width: 64, 
              height: 64, 
              backgroundColor: colors.background.secondary, 
              borderRadius: 32, 
              alignItems: "center", 
              justifyContent: "center", 
              marginBottom: 16 
            }}>
              <Ionicons name="analytics-outline" size={28} color={colors.text.tertiary} />
            </View>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: "500", 
              color: colors.text.secondary, 
              textAlign: "center" 
            }}>No progression data available yet</Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.text.tertiary, 
              textAlign: "center", 
              marginTop: 4 
            }}>Complete more workouts to see insights</Text>
          </View>
        </View>
      </View>
    )
  }

  const getProgressionColor = (progression) => {
    switch (progression) {
      case "excellent":
        return colors.status.success
      case "good":
        return colors.primary[600]
      case "stable":
        return colors.status.warning
      case "declining":
        return colors.status.error
      default:
        return colors.text.tertiary
    }
  }

  const getProgressionIcon = (progression) => {
    switch (progression) {
      case "excellent":
        return "trending-up"
      case "good":
        return "arrow-up"
      case "stable":
        return "arrow-forward"
      case "declining":
        return "trending-down"
      default:
        return "help"
    }
  }

  const getProgressionBg = (progression) => {
    switch (progression) {
      case "excellent":
        return "bg-green-50"
      case "good":
        return "bg-emerald-50"
      case "stable":
        return "bg-yellow-50"
      case "declining":
        return "bg-red-50"
      default:
        return "bg-slate-50"
    }
  }

  const getProgressBarWidth = (totalGain) => {
    const maxGain = Math.max(...insights.map((i) => Math.abs(i.totalGain || 0)), 1)
    return Math.min((Math.abs(totalGain || 0) / maxGain) * 100, 100)
  }

  return (
    <View>
      {/* Header with Info Icon and Filter */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
            PO Insights
          </Text>
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

      {/* Summary Statistics */}
      {summaryStats && (
        <View style={{
          backgroundColor: colors.background.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border.light,
        }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
            <View style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 4 }}>Total Exercises</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text.primary }}>
                {summaryStats.total}
              </Text>
            </View>
            <View style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 4 }}>Avg Total Gain</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: summaryStats.avgTotalGain >= 0 ? colors.status.success : colors.status.error }}>
                  {summaryStats.avgTotalGain >= 0 ? '+' : ''}{summaryStats.avgTotalGain.toFixed(1)}%
                </Text>
                {summaryStats.avgTotalNumericalGain !== null && !isNaN(summaryStats.avgTotalNumericalGain) && isFinite(summaryStats.avgTotalNumericalGain) && (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.secondary, marginLeft: 6 }}>
                    ({summaryStats.avgTotalNumericalGain >= 0 ? '+' : ''}{summaryStats.avgTotalNumericalGain.toFixed(1)} kg)
                  </Text>
                )}
              </View>
            </View>
            <View style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 4 }}>Avg Weekly Gain</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
                <Text style={{ fontSize: 20, fontWeight: "700", color: summaryStats.avgWeeklyGain >= 0 ? colors.status.success : colors.status.error }}>
                  {summaryStats.avgWeeklyGain >= 0 ? '+' : ''}{summaryStats.avgWeeklyGain.toFixed(2)}%
                </Text>
                {summaryStats.avgWeeklyNumericalGain !== null && !isNaN(summaryStats.avgWeeklyNumericalGain) && isFinite(summaryStats.avgWeeklyNumericalGain) && (
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.secondary, marginLeft: 6 }}>
                    ({summaryStats.avgWeeklyNumericalGain >= 0 ? '+' : ''}{summaryStats.avgWeeklyNumericalGain.toFixed(2)} kg/week)
                  </Text>
                )}
              </View>
            </View>
            <View style={{ flex: 1, minWidth: "45%" }}>
              <Text style={{ fontSize: 12, color: colors.text.tertiary, marginBottom: 4 }}>Total Workouts</Text>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text.primary }}>
                {summaryStats.totalWorkouts}
              </Text>
            </View>
          </View>
          
          {/* Progression Breakdown */}
          <View style={{ 
            flexDirection: "row", 
            gap: 8, 
            paddingTop: 12, 
            borderTopWidth: 1, 
            borderTopColor: colors.border.light 
          }}>
            {summaryStats.excellent > 0 && (
              <View style={{ 
                flex: 1, 
                backgroundColor: colors.status.success + '20', 
                borderRadius: 8, 
                padding: 8, 
                alignItems: "center" 
              }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.status.success }}>
                  {summaryStats.excellent}
                </Text>
                <Text style={{ fontSize: 10, color: colors.text.tertiary, marginTop: 2 }}>Excellent</Text>
              </View>
            )}
            {summaryStats.good > 0 && (
              <View style={{ 
                flex: 1, 
                backgroundColor: colors.primary[100], 
                borderRadius: 8, 
                padding: 8, 
                alignItems: "center" 
              }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.primary[600] }}>
                  {summaryStats.good}
                </Text>
                <Text style={{ fontSize: 10, color: colors.text.tertiary, marginTop: 2 }}>Good</Text>
              </View>
            )}
            {summaryStats.stable > 0 && (
              <View style={{ 
                flex: 1, 
                backgroundColor: colors.status.warning + '20', 
                borderRadius: 8, 
                padding: 8, 
                alignItems: "center" 
              }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.status.warning }}>
                  {summaryStats.stable}
                </Text>
                <Text style={{ fontSize: 10, color: colors.text.tertiary, marginTop: 2 }}>Stable</Text>
              </View>
            )}
            {summaryStats.declining > 0 && (
              <View style={{ 
                flex: 1, 
                backgroundColor: colors.status.error + '20', 
                borderRadius: 8, 
                padding: 8, 
                alignItems: "center" 
              }}>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.status.error }}>
                  {summaryStats.declining}
                </Text>
                <Text style={{ fontSize: 10, color: colors.text.tertiary, marginTop: 2 }}>Declining</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Timeframe Filter */}
      <View style={{ marginBottom: 16 }}>
        <View 
          style={{ 
            flexDirection: "row", 
            backgroundColor: colors.neutral[100], 
            borderRadius: 12, 
            padding: 4 
          }}
        >
          {timeframes.map((timeframe) => (
            <TouchableOpacity
              key={timeframe.label}
              onPress={() => setSelectedTimeframe(timeframe.value)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: selectedTimeframe === timeframe.value 
                  ? colors.primary[600] 
                  : "transparent",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: 14,
                  color: selectedTimeframe === timeframe.value 
                    ? colors.text.white 
                    : colors.neutral[600],
                }}
              >
                {timeframe.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View>
        {visibleInsights.map((insight, index) => {
          return (
            <View
              key={index}
              style={{
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: colors.border.light,
                marginBottom: 16
              }}
            >
              {/* Header: Exercise Name and Progression Badge */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <TouchableOpacity 
                  style={{ flex: 1, marginRight: 16 }}
                  onPress={() => handleExercisePress(insight.exercise)}
                  activeOpacity={0.7}
                >
                  <Text style={{ 
                    fontSize: 20, 
                    fontWeight: "700", 
                    color: colors.text.primary, 
                    marginBottom: 12,
                    textDecorationLine: 'underline' 
                  }}>
                    {insight.exercise}
                  </Text>
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                      backgroundColor: getProgressionColor(insight.progression) + "20"
                    }}
                  >
                    <Ionicons
                      name={getProgressionIcon(insight.progression)}
                      size={22}
                      color={getProgressionColor(insight.progression)}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: getProgressionColor(insight.progression)
                    }}
                  >
                    {insight.progression}
                  </Text>
                </View>
              </View>

              {/* 1RM Values Section */}
              {insight.starting1RM && insight.ending1RM && (
                <View style={{ 
                  backgroundColor: colors.background.primary, 
                  borderRadius: 12, 
                  padding: 14, 
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}>
                  <Text style={{ 
                    fontSize: 11, 
                    color: colors.text.tertiary, 
                    marginBottom: 8,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 0.5
                  }}>
                    1RM Progression
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ alignItems: "flex-start" }}>
                      <Text style={{ fontSize: 10, color: colors.text.tertiary, marginBottom: 4 }}>Starting</Text>
                      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.secondary }}>
                        {insight.starting1RM.toFixed(1)} kg
                      </Text>
                    </View>
                    <View style={{ 
                      width: 40, 
                      height: 1, 
                      backgroundColor: colors.border.light,
                      marginHorizontal: 12
                    }} />
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 10, color: colors.text.tertiary, marginBottom: 4 }}>Current</Text>
                      <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                        {insight.ending1RM.toFixed(1)} kg
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Total Gain Section */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 8 }}>
                  <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
                    <Text style={{ 
                      fontSize: 32, 
                      fontWeight: "800", 
                      marginRight: 8,
                      color: getProgressionColor(insight.progression),
                      letterSpacing: -0.5
                    }}>
                      {insight.totalGain > 0 ? "+" : ""}
                      {(insight.totalGain || 0).toFixed(1)}%
                    </Text>
                    {insight.starting1RM && insight.ending1RM && (
                      <Text style={{ 
                        fontSize: 18, 
                        fontWeight: "700", 
                        marginRight: 8,
                        color: colors.text.secondary,
                        letterSpacing: -0.3
                      }}>
                        ({insight.ending1RM - insight.starting1RM > 0 ? "+" : ""}
                        {(insight.ending1RM - insight.starting1RM).toFixed(1)} kg)
                      </Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 15, color: colors.text.secondary, fontWeight: "600" }}>
                    Total Gain
                  </Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={{ 
                backgroundColor: colors.background.primary, 
                borderRadius: 12, 
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.border.light
              }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
                  <View style={{ flex: 1, minWidth: "45%" }}>
                    <Text style={{ fontSize: 10, color: colors.text.tertiary, marginBottom: 4, fontWeight: "600" }}>
                      Weekly Gain
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap" }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                        {insight.weeklyGain > 0 ? "+" : ""}
                        {(insight.weeklyGain || 0).toFixed(2)}%
                      </Text>
                      {insight.starting1RM && insight.ending1RM && insight.timeSpanWeeks && (
                        <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text.secondary, marginLeft: 6 }}>
                          ({((insight.ending1RM - insight.starting1RM) / insight.timeSpanWeeks) >= 0 ? "+" : ""}
                          {((insight.ending1RM - insight.starting1RM) / insight.timeSpanWeeks).toFixed(2)} kg/week)
                        </Text>
                      )}
                    </View>
                  </View>
                  {insight.timeSpanWeeks && (
                    <View style={{ flex: 1, minWidth: "45%" }}>
                      <Text style={{ fontSize: 10, color: colors.text.tertiary, marginBottom: 4, fontWeight: "600" }}>
                        Time Period
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                        {insight.timeSpanWeeks.toFixed(1)} weeks
                      </Text>
                    </View>
                  )}
                  {insight.workoutCount && (
                    <View style={{ flex: 1, minWidth: "45%" }}>
                      <Text style={{ fontSize: 10, color: colors.text.tertiary, marginBottom: 4, fontWeight: "600" }}>
                        Workouts
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                        {insight.workoutCount}
                      </Text>
                    </View>
                  )}
                  {insight.totalSets && (
                    <View style={{ flex: 1, minWidth: "45%" }}>
                      <Text style={{ fontSize: 10, color: colors.text.tertiary, marginBottom: 4, fontWeight: "600" }}>
                        Total Sets
                      </Text>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                        {insight.totalSets}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <View style={{ 
                  height: 8, 
                  backgroundColor: colors.background.secondary, 
                  borderRadius: 4, 
                  overflow: "hidden" 
                }}>
                  <View
                    style={{
                      height: "100%",
                      borderRadius: 4,
                      width: `${getProgressBarWidth(insight.totalGain)}%`,
                      backgroundColor: getProgressionColor(insight.progression),
                    }}
                  />
                </View>
              </View>

              <View style={{ 
                backgroundColor: colors.background.primary, 
                borderRadius: 12, 
                padding: 12 
              }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                  <Ionicons 
                    name="bulb-outline" 
                    size={16} 
                    color={colors.primary[600]} 
                    style={{ marginRight: 8, marginTop: 2 }} 
                  />
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.text.secondary, 
                    fontWeight: "500", 
                    flex: 1, 
                    lineHeight: 20 
                  }}>{insight.recommendation}</Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>

      {/* Load More Button */}
      {hasMore && (
        <TouchableOpacity
          onPress={handleLoadMore}
          activeOpacity={0.7}
          style={{
            marginTop: 16,
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border.light,
            alignItems: "center"
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.primary[600]
          }}>
            Load More ({sortedInsights.length - visibleCount} remaining)
          </Text>
        </TouchableOpacity>
      )}

      {/* Records Count */}
      {sortedInsights.length > 0 && (
        <View style={{
          marginTop: 12,
          paddingVertical: 8,
          alignItems: "center"
        }}>
          <Text style={{
            fontSize: 12,
            color: colors.text.tertiary
          }}>
            Showing {Math.min(visibleCount, sortedInsights.length)} of {sortedInsights.length} exercises
          </Text>
        </View>
      )}

      {loading && (
        <View style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          alignItems: "center", 
          justifyContent: "center", 
          backgroundColor: colors.background.card + "80"
        }}>
          <Ionicons name="refresh" size={24} color={colors.primary[600]} />
        </View>
      )}

      {/* Exercise Detail Modal - Only render when actually needed */}
      {showDetailModal && selectedExercise && userId && (
        <ExerciseDetailModal
          visible={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedExercise(null)
          }}
          exerciseName={selectedExercise}
          userId={userId}
          initialTimeframe={selectedTimeframe === 36500 ? null : selectedTimeframe}
        />
      )}

      {/* Info Modal - Only render when actually needed */}
      {showInfoModal && (
        <ProgressiveOverloadInfoModal
          visible={showInfoModal}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* Filter Modal */}
      <ProgressiveOverloadFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
    </View>
  )
}
