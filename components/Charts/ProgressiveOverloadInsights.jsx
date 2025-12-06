import React, { useState, useEffect } from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { colors } from "../../constants/ui_colors"
import { Ionicons } from "@expo/vector-icons"
import { getCurrentUser, getProgressiveOverloadInsights } from "../../lib/database"
import ExerciseDetailModal from "./ExerciseDetailModal"
import ProgressiveOverloadInfoModal from "./ProgressiveOverloadInfoModal"

export default function ProgressiveOverloadInsights({ 
  progressiveOverloadInsights: initialData,
  parentTimeframe = 30 
}) {
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

  if (loading && insights.length === 0) {
    return (
      <View style={{ marginBottom: 32 }}>
        <View style={{ 
          backgroundColor: "white", 
          borderRadius: 16, 
          padding: 24, 
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#F1F5F9"
        }}>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Ionicons name="analytics-outline" size={28} color={colors.primary[600]} />
            <Text style={{ 
              fontSize: 16, 
              fontWeight: "500", 
              color: colors.neutral[600], 
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
              backgroundColor: colors.neutral[100], 
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
                      : colors.neutral[600],
                  }}
                >
                  {timeframe.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ 
          backgroundColor: "white", 
          borderRadius: 16, 
          padding: 24, 
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 2,
          borderWidth: 1,
          borderColor: "#F1F5F9"
        }}>
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <View style={{ 
              width: 64, 
              height: 64, 
              backgroundColor: "#F1F5F9", 
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
              color: colors.neutral[600], 
              textAlign: "center" 
            }}>No progression data available yet</Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.neutral[500], 
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
      {/* Header with Info Icon */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.neutral[900] }}>
          Progressive Overload Insights
        </Text>
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary[100],
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Ionicons name="information" size={18} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>

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
        {insights.slice(0, 5).map((insight, index) => {
          const bgColor = getProgressionBg(insight.progression)
          const bgColorMap = {
            "bg-green-50": "#F0FDF4",
            "bg-emerald-50": "#ECFDF5",
            "bg-yellow-50": "#FEFCE8",
            "bg-red-50": "#FEF2F2",
            "bg-slate-50": "#F8FAFC"
          }
          return (
            <View
              key={index}
              style={{
                backgroundColor: bgColorMap[bgColor] || "#F8FAFC",
                borderRadius: 16,
                padding: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                borderColor: "#F1F5F9",
                marginBottom: index < insights.slice(0, 5).length - 1 ? 16 : 0
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <TouchableOpacity 
                  style={{ flex: 1, marginRight: 16 }}
                  onPress={() => handleExercisePress(insight.exercise)}
                  activeOpacity={0.7}
                >
                  <Text style={{ 
                    fontSize: 18, 
                    fontWeight: "700", 
                    color: colors.neutral[900], 
                    marginBottom: 4,
                    textDecorationLine: 'underline' 
                  }}>
                    {insight.exercise}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                    <Text style={{ 
                      fontSize: 24, 
                      fontWeight: "700", 
                      marginRight: 4,
                      color: getProgressionColor(insight.progression) 
                    }}>
                      {insight.totalGain > 0 ? "+" : ""}
                      {(insight.totalGain || 0).toFixed(1)}%
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.neutral[600], fontWeight: "500" }}>total gain</Text>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.neutral[500] }}>
                    {insight.weeklyGain > 0 ? "+" : ""}
                    {(insight.weeklyGain || 0).toFixed(2)}% per week
                    {insight.timeSpanWeeks ? ` • ${insight.timeSpanWeeks.toFixed(1)} weeks` : ''}
                  </Text>
                </TouchableOpacity>

                <View style={{ alignItems: "center" }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                      backgroundColor: getProgressionColor(insight.progression) + "20"
                    }}
                  >
                    <Ionicons
                      name={getProgressionIcon(insight.progression)}
                      size={20}
                      color={getProgressionColor(insight.progression)}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
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

              <View style={{ marginBottom: 16 }}>
                <View style={{ 
                  height: 8, 
                  backgroundColor: "#E2E8F0", 
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
                backgroundColor: "rgba(255, 255, 255, 0.7)", 
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
                    color: colors.neutral[700], 
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

      {insights.length > 5 && (
        <View style={{ 
          marginTop: 16, 
          backgroundColor: "#F8FAFC", 
          borderRadius: 12, 
          padding: 16, 
          borderWidth: 1, 
          borderColor: "#F1F5F9" 
        }}>
          <Text style={{ 
            fontSize: 14, 
            color: colors.neutral[600], 
            textAlign: "center", 
            fontWeight: "500" 
          }}>
            Showing top 5 exercises • {insights.length - 5} more available
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
          backgroundColor: "rgba(255, 255, 255, 0.5)" 
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
    </View>
  )
}
