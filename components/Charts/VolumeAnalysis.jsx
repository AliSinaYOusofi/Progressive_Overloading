import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../../constants/ui_colors"

export default function VolumeAnalysis({ volumeAnalysis }) {
  if (!volumeAnalysis || volumeAnalysis.totalVolume <= 0) {
    return (
      <View className="mb-10">
        <View className="flex-row items-center mb-3">
          <Ionicons name="bar-chart" size={24} color={colors.primary[600]} />
          <Text className="text-xl font-bold text-slate-900 ml-2">Volume Analysis</Text>
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

  const volumeProgress = Math.min((volumeAnalysis.totalVolume / volumeAnalysis.maxVolume) * 100, 100)

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

  return (
    <View>
      <View className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 mb-4">
        <View className="flex-row justify-between mb-6">
          <View className="flex-1 items-center bg-slate-50 rounded-xl p-4 mr-2">
            <Ionicons name="fitness" size={20} color={colors.primary[600]} className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 mb-1">{volumeAnalysis.totalVolume.toFixed(0)}</Text>
            <Text className="text-xs text-slate-600 font-medium">Total Volume</Text>
            <Text className="text-xs text-slate-500">(kg)</Text>
          </View>

          <View className="flex-1 items-center bg-slate-50 rounded-xl p-4 mx-1">
            <Ionicons name="calendar" size={20} color={colors.primary[600]} className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 mb-1">{volumeAnalysis.avgDailyVolume.toFixed(0)}</Text>
            <Text className="text-xs text-slate-600 font-medium">Daily Avg</Text>
            <Text className="text-xs text-slate-500">(kg)</Text>
          </View>

          <View className="flex-1 items-center bg-slate-50 rounded-xl p-4 ml-2">
            <Ionicons name="trophy" size={20} color={colors.primary[600]} className="mb-2" />
            <Text className="text-2xl font-bold text-slate-900 mb-1">{volumeAnalysis.maxVolume.toFixed(0)}</Text>
            <Text className="text-xs text-slate-600 font-medium">Peak Volume</Text>
            <Text className="text-xs text-slate-500">(kg)</Text>
          </View>
        </View>

        <View className="border-t border-slate-100 pt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-700 font-semibold">Volume Trend</Text>
            <View className="flex-row items-center">
              <Ionicons
                name={getTrendIcon(volumeAnalysis.trend)}
                size={16}
                color={getTrendColor(volumeAnalysis.trend)}
              />
              <Text
                className="text-sm font-bold ml-1 capitalize"
                style={{ color: getTrendColor(volumeAnalysis.trend) }}
              >
                {volumeAnalysis.trend}
              </Text>
            </View>
          </View>

          <View className="bg-slate-100 rounded-full h-2 mb-2">
            <View
              className="h-2 rounded-full"
              style={{
                width: `${volumeProgress}%`,
                backgroundColor: colors.primary[500],
              }}
            />
          </View>
          <Text className="text-xs text-slate-500 text-center">
            {volumeProgress.toFixed(0)}% of peak volume achieved
          </Text>
        </View>
      </View>
    </View>
  )
}
