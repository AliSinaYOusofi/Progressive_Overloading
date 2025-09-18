import { View, Text } from "react-native"
import { colors } from "../../constants/ui_colors"
import { Ionicons } from "@expo/vector-icons"

export default function ProgressiveOverloadInsights({ progressiveOverloadInsights }) {
  if (!progressiveOverloadInsights || progressiveOverloadInsights.length === 0) {
    return (
      <View className="mb-8">
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

  const getProgressBarWidth = (weeklyGain) => {
    const maxGain = Math.max(...progressiveOverloadInsights.map((i) => Math.abs(i.weeklyGain)))
    return Math.min((Math.abs(weeklyGain) / maxGain) * 100, 100)
  }

  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-6">
        <View className="w-10 h-10 bg-emerald-100 rounded-xl items-center justify-center mr-3">
          <Ionicons name="analytics" size={20} color={colors.primary[600]} />
        </View>
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-900">Progressive Overload Analysis</Text>
          <Text className="text-sm text-slate-600 mt-0.5">Track your strength progression trends</Text>
        </View>
      </View>

      <View className="gap-4">
        {progressiveOverloadInsights.slice(0, 5).map((insight, index) => (
          <View
            key={index}
            className={`${getProgressionBg(insight.progression)} rounded-2xl p-5 shadow-sm border border-slate-100`}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-4">
                <Text className="text-lg font-bold text-slate-900 mb-1">{insight.exercise}</Text>
                <View className="flex-row items-center">
                  <Text className="text-2xl font-bold mr-1" style={{ color: getProgressionColor(insight.progression) }}>
                    {insight.weeklyGain > 0 ? "+" : ""}
                    {insight.weeklyGain.toFixed(1)}%
                  </Text>
                  <Text className="text-sm text-slate-600 font-medium">weekly</Text>
                </View>
              </View>

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
                    width: `${getProgressBarWidth(insight.weeklyGain)}%`,
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

      {progressiveOverloadInsights.length > 5 && (
        <View className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
          <Text className="text-sm text-slate-600 text-center font-medium">
            Showing top 5 exercises • {progressiveOverloadInsights.length - 5} more available
          </Text>
        </View>
      )}
    </View>
  )
}
