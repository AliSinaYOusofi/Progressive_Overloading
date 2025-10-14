import { View, Text, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { colors } from "../../constants/ui_colors"
import { Ionicons } from "@expo/vector-icons"
import { getCurrentUser, getProgressiveOverloadInsights } from "../../lib/database"
import ExerciseDetailModal from "./ExerciseDetailModal"

export default function ProgressiveOverloadInsights({ progressiveOverloadInsights: initialData }) {
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [userId, setUserId] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState(30)
  const [insights, setInsights] = useState(initialData || [])
  const [loading, setLoading] = useState(false)

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
      <View className="mb-8">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <View className="items-center py-8">
            <Ionicons name="analytics-outline" size={28} color={colors.primary[600]} />
            <Text className="text-base font-medium text-slate-600 text-center mt-4">Loading insights...</Text>
          </View>
        </View>
      </View>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <View className="mb-8">
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

        <View className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <View className="items-center py-8">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="analytics-outline" size={28} color={colors.text.tertiary} />
            </View>
            <Text className="text-base font-medium text-slate-600 text-center">No progression data available yet</Text>
            <Text className="text-sm text-slate-500 text-center mt-1">Complete more workouts to see insights</Text>
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

      <View className="gap-4">
        {insights.slice(0, 5).map((insight, index) => (
          <View
            key={index}
            className={`${getProgressionBg(insight.progression)} rounded-2xl p-5 shadow-sm border border-slate-100`}
          >
            <View className="flex-row justify-between items-start mb-4">
              <TouchableOpacity 
                className="flex-1 mr-4"
                onPress={() => handleExercisePress(insight.exercise)}
                activeOpacity={0.7}
              >
                <Text className="text-lg font-bold text-slate-900 mb-1" style={{ textDecorationLine: 'underline' }}>
                  {insight.exercise}
                </Text>
                <View className="flex-row items-center mb-1">
                  <Text className="text-2xl font-bold mr-1" style={{ color: getProgressionColor(insight.progression) }}>
                    {insight.totalGain > 0 ? "+" : ""}
                    {(insight.totalGain || 0).toFixed(1)}%
                  </Text>
                  <Text className="text-sm text-slate-600 font-medium">total gain</Text>
                </View>
                <Text className="text-xs text-slate-500">
                  {insight.weeklyGain > 0 ? "+" : ""}
                  {(insight.weeklyGain || 0).toFixed(2)}% per week
                  {insight.timeSpanWeeks ? ` • ${insight.timeSpanWeeks.toFixed(1)} weeks` : ''}
                </Text>
              </TouchableOpacity>

              <View className="items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mb-2"
                  style={{ backgroundColor: getProgressionColor(insight.progression) + "20" }}
                >
                  <Ionicons
                    name={getProgressionIcon(insight.progression)}
                    size={20}
                    color={getProgressionColor(insight.progression)}
                  />
                </View>
                <Text
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: getProgressionColor(insight.progression) }}
                >
                  {insight.progression}
                </Text>
              </View>
            </View>

            <View className="mb-4">
              <View className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${getProgressBarWidth(insight.totalGain)}%`,
                    backgroundColor: getProgressionColor(insight.progression),
                  }}
                />
              </View>
            </View>

            <View className="bg-white/70 rounded-xl p-3">
              <View className="flex-row items-start">
                <Ionicons name="bulb-outline" size={16} color={colors.primary[600]} className="mr-2 mt-0.5" />
                <Text className="text-sm text-slate-700 font-medium flex-1 leading-5">{insight.recommendation}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {insights.length > 5 && (
        <View className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
          <Text className="text-sm text-slate-600 text-center font-medium">
            Showing top 5 exercises • {insights.length - 5} more available
          </Text>
        </View>
      )}

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-white/50">
          <Ionicons name="refresh" size={24} color={colors.primary[600]} />
        </View>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && userId && (
        <ExerciseDetailModal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          exerciseName={selectedExercise}
          userId={userId}
        />
      )}
    </View>
  )
}
