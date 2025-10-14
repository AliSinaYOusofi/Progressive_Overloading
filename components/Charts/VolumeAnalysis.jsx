import { View, Text, TouchableOpacity } from "react-native"
import { useState, useEffect } from "react"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../../constants/ui_colors"
import { getCurrentUser, getVolumeAnalysis } from "../../lib/database"

export default function VolumeAnalysis({ volumeAnalysis: initialData }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(30)
  const [volumeData, setVolumeData] = useState(initialData || {})
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

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
      loadVolumeData()
    }
  }, [userId, selectedTimeframe])

  const loadUser = async () => {
    const user = await getCurrentUser()
    if (user) {
      setUserId(user.id)
    }
  }

  const loadVolumeData = async () => {
    try {
      setLoading(true)
      const data = await getVolumeAnalysis(userId, selectedTimeframe)
      setVolumeData(data || {})
    } catch (error) {
      console.error("Error loading volume analysis:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate what percentage of days you worked out (dynamic based on timeframe)
  const actualTimeframe = selectedTimeframe === 36500 ? volumeData.workoutDays || 30 : selectedTimeframe
  const workoutFrequency = volumeData.workoutDays ? 
    (volumeData.workoutDays / actualTimeframe) * 100 : 0

  if (loading && (!volumeData || volumeData.totalVolume <= 0)) {
    return (
      <View className="mb-10">
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

        <View className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <View className="items-center py-8">
            <Ionicons name="analytics-outline" size={48} color={colors.primary[600]} />
            <Text className="text-slate-500 font-medium mt-3">Loading volume data...</Text>
          </View>
        </View>
      </View>
    )
  }

  if (!volumeData || volumeData.totalVolume <= 0) {
    return (
      <View className="mb-10">
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

        <View className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <View className="items-center py-8">
            <Ionicons name="analytics-outline" size={48} color={colors.neutral[400]} />
            <Text className="text-slate-500 font-medium mt-3">No volume data available</Text>
            <Text className="text-slate-400 text-sm mt-1">Complete workouts to see analysis</Text>
          </View>
        </View>
      </View>
    )
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "increasing":
        return "trending-up"
      case "decreasing":
        return "trending-down"
      default:
        return "remove"
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case "increasing":
        return colors.status.success
      case "decreasing":
        return colors.status.error
      default:
        return colors.status.warning
    }
  }

  const timeframeLabel = timeframes.find(t => t.value === selectedTimeframe)?.label || "30D"

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

      <View className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 mb-4" style={{ opacity: loading ? 0.6 : 1 }}>
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 items-center bg-slate-50 rounded-xl p-4 mr-2">
            <Ionicons name="fitness" size={20} color={colors.primary[600]} className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 mb-1">{volumeData.totalVolume?.toFixed(0) || '0'}</Text>
            <Text className="text-xs text-slate-600 font-medium">Total Volume</Text>
            <Text className="text-xs text-slate-500">(kg)</Text>
          </View>

          <View className="flex-1 items-center bg-slate-50 rounded-xl p-4 mx-1">
            <Ionicons name="barbell" size={20} color={colors.primary[600]} className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 mb-1">
              {volumeData.avgVolumePerWorkout?.toFixed(0) || '0'}
            </Text>
            <Text className="text-xs text-slate-600 font-medium">Avg/Workout</Text>
            <Text className="text-xs text-slate-500">(kg)</Text>
          </View>

          <View className="flex-1 items-center bg-slate-50 rounded-xl p-4 ml-2">
            <Ionicons name="trophy" size={20} color={colors.primary[600]} className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 mb-1">{volumeData.maxVolume?.toFixed(0) || '0'}</Text>
            <Text className="text-xs text-slate-600 font-medium">Peak Day</Text>
            <Text className="text-xs text-slate-500">(kg)</Text>
          </View>
        </View>

        <View className="border-t border-slate-100 pt-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-700 font-semibold">Volume Trend</Text>
            <View className="flex-row items-center">
              <Ionicons
                name={getTrendIcon(volumeData.trend)}
                size={16}
                color={getTrendColor(volumeData.trend)}
              />
              <Text
                className="text-sm font-bold ml-1 capitalize"
                style={{ color: getTrendColor(volumeData.trend) }}
              >
                {volumeData.trend}
              </Text>
            </View>
          </View>
        </View>

        <View className="border-t border-slate-100 pt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-700 font-semibold">Workout Frequency</Text>
            <Text className="text-sm font-bold" style={{ color: colors.primary[600] }}>
              {volumeData.workoutDays || 0} days
            </Text>
          </View>

          <View className="bg-slate-100 rounded-full h-2 mb-2">
            <View
              className="h-2 rounded-full"
              style={{
                width: `${Math.min(workoutFrequency, 100)}%`,
                backgroundColor: colors.primary[500],
              }}
            />
          </View>
          <Text className="text-xs text-slate-500 text-center">
            {Math.min(workoutFrequency, 100).toFixed(0)}% workout frequency ({timeframeLabel})
          </Text>
        </View>
      </View>
    </View>
  )
}
