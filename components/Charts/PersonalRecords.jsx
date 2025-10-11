import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import colors from "../../constants/ui_colors"

export default function PersonalRecords({ personalRecords }) {
  if (!personalRecords || personalRecords.length === 0) {
    return (
      <View>
        <View className="rounded-2xl p-8 items-center" style={{ backgroundColor: colors.neutral[50] }}>
          <Ionicons name="medal-outline" size={48} color={colors.neutral[400]} />
          <Text className="text-lg font-semibold mt-4 mb-2" style={{ color: colors.neutral[700] }}>
            No Records Yet
          </Text>
          <Text className="text-center" style={{ color: colors.neutral[500] }}>
            Start working out to set your first personal records!
          </Text>
        </View>
      </View>
    )
  }

  const getExerciseIcon = (exercise) => {
    const exerciseName = exercise.toLowerCase()
    if (exerciseName.includes("bench") || exerciseName.includes("press")) return "barbell"
    if (exerciseName.includes("squat")) return "fitness"
    if (exerciseName.includes("deadlift")) return "barbell"
    if (exerciseName.includes("curl")) return "fitness"
    if (exerciseName.includes("row")) return "barbell"
    return "trophy"
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return { name: "trophy", color: colors.primary[500] } // Gold
      case 1:
        return { name: "medal", color: colors.primary[400] } // Silver
      case 2:
        return { name: "medal-outline", color: colors.primary[600] } // Bronze
      default:
        return { name: "star", color: colors.primary[500] }
    }
  }

  return (
    <View>
      <View className="gap-4">
        {personalRecords.slice(0, 5).map((record, index) => {
          const rankIcon = getRankIcon(index)
          return (
            <View
              key={index}
              className="rounded-2xl p-5 shadow-sm border"
              style={{
                backgroundColor: index === 0 ? colors.primary[50] : colors.neutral[50],
                borderColor: index === 0 ? colors.primary[200] : colors.neutral[200],
              }}
            >
              {/* Header with rank and exercise */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: colors.primary[100] }}
                  >
                    <Ionicons name={getExerciseIcon(record.exercise)} size={20} color={colors.primary[600]} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold" style={{ color: colors.neutral[900] }}>
                      {record.exercise}
                    </Text>
                    <Text className="text-xs" style={{ color: colors.neutral[500] }}>
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                <View className="items-center">
                  <Ionicons name={rankIcon.name} size={24} color={rankIcon.color} />
                  <Text className="text-xs font-semibold mt-1" style={{ color: colors.neutral[600] }}>
                    #{index + 1}
                  </Text>
                </View>
              </View>

              {/* Stats row */}
              <View className="flex-row justify-between items-center">
                <View className="items-center">
                  <Text className="text-xs font-medium mb-1" style={{ color: colors.neutral[600] }}>
                    Weight
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: colors.neutral[900] }}>
                    {record.weight}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.neutral[500] }}>
                    {record.unit || "kg"}
                  </Text>
                </View>

                <View className="w-px h-12" style={{ backgroundColor: colors.neutral[200] }} />

                <View className="items-center">
                  <Text className="text-xs font-medium mb-1" style={{ color: colors.neutral[600] }}>
                    Reps
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: colors.neutral[900] }}>
                    {record.reps}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.neutral[500] }}>
                    reps
                  </Text>
                </View>

                <View className="w-px h-12" style={{ backgroundColor: colors.neutral[200] }} />

                <View className="items-center">
                  <Text className="text-xs font-medium mb-1" style={{ color: colors.neutral[600] }}>
                    1RM
                  </Text>
                  <Text className="text-lg font-bold" style={{ color: colors.primary[600] }}>
                    {record.oneRM.toFixed(1)}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.neutral[500] }}>
                    kg
                  </Text>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
