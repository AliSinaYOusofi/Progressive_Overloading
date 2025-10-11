import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../../constants/ui_colors"
import { PieChart } from "react-native-gifted-charts"

export default function MonthlyTrends({ monthlyStats }) {
  if (!monthlyStats || monthlyStats.length === 0) {
    return (
      <View className="mb-10">
        <View className="flex-row items-center mb-2">
          <Ionicons name="trending-up" size={24} color={colors.primary[600]} />
          <Text className="text-xl font-bold ml-2" style={{ color: colors.neutral[900] }}>
            Monthly Trends
          </Text>
        </View>
        <Text className="text-sm mb-4" style={{ color: colors.neutral[600] }}>
          Track your workout consistency over time
        </Text>

        <View className="rounded-2xl p-6 items-center justify-center" style={{ backgroundColor: colors.neutral[50] }}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.neutral[400]} />
          <Text className="text-base font-medium mt-3 mb-1" style={{ color: colors.neutral[700] }}>
            No Monthly Data Yet
          </Text>
          <Text className="text-sm text-center" style={{ color: colors.neutral[500] }}>
            Complete more workouts to see your monthly trends
          </Text>
        </View>
      </View>
    )
  }

  // Calculate trend direction
  const currentMonth = monthlyStats[monthlyStats.length - 1]
  const previousMonth = monthlyStats[monthlyStats.length - 2]
  const workoutTrend =
    currentMonth && previousMonth
      ? currentMonth.workouts > previousMonth.workouts
        ? "up"
        : currentMonth.workouts < previousMonth.workouts
          ? "down"
          : "stable"
      : "stable"

  const maxWorkouts = Math.max(...monthlyStats.map((m) => m?.workouts || 0))
  const totalExercises = monthlyStats.reduce((sum, m) => sum + (m?.workouts || 0), 0)
  const totalSets = monthlyStats.reduce((sum, m) => sum + (m?.totalSets || 0), 0)

  const buildPieData = () => {
    try {
      const total = monthlyStats.reduce((s, m) => s + (m?.workouts || 0), 0)
      if (total <= 0) return []
      const variants = [
        colors.primary?.[600] || '#10b981', 
        colors.primary?.[500] || '#10b981', 
        colors.primary?.[700] || '#10b981', 
        colors.status?.success || '#10b981', 
        colors.status?.warning || '#f59e0b'
      ]
      return monthlyStats
        .filter(m => m && m.month && typeof m.month === 'string') // Filter out invalid entries
        .map((m, idx) => {
          try {
            const dateStr = m.month.includes('-') ? m.month + "-01" : m.month;
            const date = new Date(dateStr);
            const label = date.toLocaleDateString("en", { month: "short" });
            return {
              value: m?.workouts || 0,
              color: variants[idx % variants.length],
              text: total ? Math.round(((m?.workouts || 0) / total) * 100) + '%' : '',
              textColor: colors.text?.white || 'white',
              textSize: 10,
              label: label
            };
          } catch (err) {
            console.error('Error formatting month data:', m, err);
            return null;
          }
        })
        .filter(s => s && s.value > 0)
    } catch (error) {
      console.error('Error building pie data:', error);
      return [];
    }
  }

  return (
    <View>
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons
            name={workoutTrend === "up" ? "trending-up" : workoutTrend === "down" ? "trending-down" : "remove"}
            size={16}
            color={
              workoutTrend === "up"
                ? colors.status.success
                : workoutTrend === "down"
                  ? colors.status.error
                  : colors.neutral[500]
            }
          />
          <Text
            className="text-sm font-medium ml-2"
            style={{
              color:
                workoutTrend === "up"
                  ? colors.status.success
                  : workoutTrend === "down"
                    ? colors.status.error
                    : colors.neutral[500],
            }}
          >
            {workoutTrend === "up" ? "Improving" : workoutTrend === "down" ? "Declining" : "Stable"}
          </Text>
        </View>
      </View>

      <View className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: colors.neutral[50] }}>
        {/* Pie Chart */}
        <View className="items-center justify-center mb-4" style={{ height: 220 }}>
          {buildPieData().length > 0 ? (
            <PieChart
              data={buildPieData()}
              radius={80}
              innerRadius={40}
              showText
              textColor={colors.text?.white || 'white'}
              textSize={10}
              centerLabelComponent={() => (
                <View className="items-center">
                  <Text className="text-lg font-bold" style={{ color: colors.neutral?.[900] || '#000' }}>
                    {totalExercises}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.neutral?.[600] || '#666' }}>Workouts</Text>
                </View>
              )}
            />
          ) : (
            <View className="items-center justify-center" style={{ height: 180 }}>
              <Ionicons name="pie-chart-outline" size={48} color={colors.neutral?.[400] || '#999'} />
              <Text className="text-sm mt-3" style={{ color: colors.neutral?.[600] || '#666' }}>
                No data to display
              </Text>
            </View>
          )}
        </View>
        {/* Legend */}
        <View className="flex-row flex-wrap justify-center mb-6">
          {buildPieData().map((s, idx) => (
            <View key={idx} className="flex-row items-center mx-2 my-1">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color, marginRight: 6 }} />
              <Text className="text-xs" style={{ color: colors.neutral[600] }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Stats Summary */}
        <View className="flex-row justify-around pt-4 border-t-2" style={{ borderTopColor: colors.neutral[200] }}>
          <View className="items-center flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="fitness" size={16} color={colors.primary[600]} />
              <Text className="text-lg font-bold ml-1" style={{ color: colors.neutral[900] }}>
                {totalExercises}
              </Text>
            </View>
            <Text className="text-xs font-medium" style={{ color: colors.neutral[600] }}>
              Unique Exercises
            </Text>
          </View>

          <View className="w-px mx-4" style={{ backgroundColor: colors.neutral[300] }} />

          <View className="items-center flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="barbell" size={16} color={colors.primary[600]} />
              <Text className="text-lg font-bold ml-1" style={{ color: colors.neutral[900] }}>
                {totalSets}
              </Text>
            </View>
            <Text className="text-xs font-medium" style={{ color: colors.neutral[600] }}>
              Total Sets
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
