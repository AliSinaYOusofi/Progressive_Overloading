import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from "../../hooks/useThemedColors"
import { PieChart } from "react-native-gifted-charts"

export default function MonthlyTrends({ monthlyStats }) {
  const colors = useThemedColors();
  if (!monthlyStats || monthlyStats.length === 0) {
    return (
      <View className="mb-10">
        <View className="flex-row items-center mb-2">
          <Ionicons name="trending-up" size={24} color={colors.primary[600]} />
          <Text className="text-xl font-bold ml-2" style={{ color: colors.text.primary }}>
            Monthly Trends
          </Text>
        </View>
        <Text className="text-sm mb-4" style={{ color: colors.text.secondary }}>
          Track your workout consistency over time
        </Text>

        <View className="rounded-2xl p-6 items-center justify-center" style={{ backgroundColor: colors.background.card }}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
          <Text className="text-base font-medium mt-3 mb-1" style={{ color: colors.text.secondary }}>
            No Monthly Data Yet
          </Text>
          <Text className="text-sm text-center" style={{ color: colors.text.tertiary }}>
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
      // Distinct color palette for better visibility
      const colorPalette = [
        '#10b981', // emerald-500
        '#3b82f6', // blue-500
        '#8b5cf6', // violet-500
        '#f59e0b', // amber-500
        '#ef4444', // red-500
        '#06b6d4', // cyan-500
        '#ec4899', // pink-500
        '#84cc16', // lime-500
        '#f97316', // orange-500
        '#6366f1', // indigo-500
        '#14b8a6', // teal-500
        '#a855f7', // purple-500
        '#22c55e', // green-500
        '#0ea5e9', // sky-500
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
              color: colorPalette[idx % colorPalette.length],
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

      <View className="rounded-2xl p-6 shadow-sm" style={{ backgroundColor: colors.background.card }}>
        {/* Pie Chart */}
        <View className="items-center justify-center mb-4" style={{ height: 220 }}>
          {buildPieData().length > 0 ? (
            <PieChart
              data={buildPieData()}
              radius={80}
              innerRadius={40}
              innerCircleColor={colors.background.card}
              showText
              textColor={colors.text?.white || 'white'}
              textSize={10}
              centerLabelComponent={() => (
                <View className="items-center">
                  <Text className="text-lg font-bold" style={{ color: colors.text.primary }}>
                    {totalExercises}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.text.secondary }}>Workouts</Text>
                </View>
              )}
            />
          ) : (
            <View className="items-center justify-center" style={{ height: 180 }}>
              <Ionicons name="pie-chart-outline" size={48} color={colors.text.tertiary} />
              <Text className="text-sm mt-3" style={{ color: colors.text.secondary }}>
                No data to display
              </Text>
            </View>
          )}
        </View>
        {/* Legend - Grouped by Year */}
        <View className="mb-6">
          {(() => {
            // Group months by year
            const groupedByYear = {};
            monthlyStats
              .filter(m => m && m.month && typeof m.month === 'string')
              .forEach(m => {
                try {
                  const dateStr = m.month.includes('-') ? m.month + "-01" : m.month;
                  const date = new Date(dateStr);
                  const year = date.getFullYear();
                  const monthLabel = date.toLocaleDateString("en", { month: "short" });
                  
                  if (!groupedByYear[year]) {
                    groupedByYear[year] = [];
                  }
                  groupedByYear[year].push({
                    label: monthLabel,
                    totalSets: m?.totalSets || 0,
                    month: m.month
                  });
                } catch (err) {
                  console.error('Error formatting month data:', m, err);
                }
              });

            // Sort years descending
            const sortedYears = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

            return sortedYears.map(year => (
              <View key={year} className="mb-3">
                <Text className="text-sm font-semibold mb-2" style={{ color: colors.text.secondary }}>
                  {year}:
                </Text>
                <View className="flex-row flex-wrap">
                  {groupedByYear[year].map((monthData, idx) => (
                    <Text key={idx} className="text-xs mx-2 my-1" style={{ color: colors.text.tertiary }}>
                      {monthData.label}({monthData.totalSets})
                    </Text>
                  ))}
                </View>
              </View>
            ));
          })()}
        </View>

        {/* Stats Summary */}
        <View className="flex-row justify-around pt-4 border-t-2" style={{ borderTopColor: colors.border.light }}>
          <View className="items-center flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="fitness" size={16} color={colors.primary[600]} />
              <Text className="text-lg font-bold ml-1" style={{ color: colors.text.primary }}>
                {totalExercises}
              </Text>
            </View>
            <Text className="text-xs font-medium" style={{ color: colors.text.secondary }}>
              Unique Exercises
            </Text>
          </View>

          <View className="w-px mx-4" style={{ backgroundColor: colors.border.light }} />

          <View className="items-center flex-1">
            <View className="flex-row items-center mb-1">
              <Ionicons name="barbell" size={16} color={colors.primary[600]} />
              <Text className="text-lg font-bold ml-1" style={{ color: colors.text.primary }}>
                {totalSets}
              </Text>
            </View>
            <Text className="text-xs font-medium" style={{ color: colors.text.secondary }}>
              Total Sets
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}
