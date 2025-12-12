import { View, Text, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import { Filter, ChevronDown } from "lucide-react-native"
import { useThemedColors } from "../../hooks/useThemedColors"
import { getCurrentUser } from "../../lib/database"
import ExerciseDetailModal from "./ExerciseDetailModal"
import PersonalRecordsFilterModal from "./PersonalRecordsFilterModal"
import { sortPersonalRecords } from "./utils/personalRecordsUtils"

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function PersonalRecords({ personalRecords }) {
  const colors = useThemedColors();
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [userId, setUserId] = useState(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [sortBy, setSortBy] = useState('oneRM')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const user = await getCurrentUser()
    if (user) {
      setUserId(user.id)
    }
  }

  const handleExercisePress = (exerciseName) => {
    setSelectedExercise(exerciseName)
    setShowDetailModal(true)
  }

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + LOAD_MORE_COUNT);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  // Reset visible count when personalRecords or sort changes
  useEffect(() => {
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  }, [personalRecords, sortBy, sortOrder]);

  if (!personalRecords || personalRecords.length === 0) {
    return (
      <View>
        <View style={{
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          backgroundColor: colors.background.primary
        }}>
          <Ionicons name="medal-outline" size={48} color={colors.text.tertiary} />
          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.text.secondary }}>
            No Records Yet
          </Text>
          <Text style={{ textAlign: 'center', color: colors.text.tertiary }}>
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

  if (!personalRecords || personalRecords.length === 0) {
    return (
      <View>
        <View style={{
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          backgroundColor: colors.background.primary
        }}>
          <Ionicons name="medal-outline" size={48} color={colors.text.tertiary} />
          <Text style={{ fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8, color: colors.text.secondary }}>
            No Records Yet
          </Text>
          <Text style={{ textAlign: 'center', color: colors.text.tertiary }}>
            Start working out to set your first personal records!
          </Text>
        </View>
      </View>
    )
  }

  const sortedRecords = sortPersonalRecords(personalRecords, sortBy, sortOrder);
  const visibleRecords = sortedRecords.slice(0, visibleCount);
  const hasMore = sortedRecords.length > visibleCount;
  const remainingCount = sortedRecords.length - visibleCount;

  return (
    <View>
      {/* Controls Row */}
      <View style={{ 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 16 
      }}>
        <Text style={{ 
          fontSize: 14, 
          color: colors.text.secondary,
          fontWeight: '500',
        }}>
          {sortedRecords.length} {sortedRecords.length === 1 ? 'record' : 'records'}
          {hasMore && ` • Showing ${visibleCount}`}
        </Text>
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

      <View style={{ gap: 16 }}>
        {visibleRecords.map((record, index) => {
          // Calculate actual rank position in the full sorted list
          const actualRank = sortedRecords.findIndex(r => r === record);
          const rankIcon = getRankIcon(actualRank)
          return (
            <View
              key={index}
              style={{
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
                borderWidth: 1,
                backgroundColor: actualRank === 0 ? colors.primary[50] : colors.background.card,
                borderColor: actualRank === 0 ? colors.primary[200] : colors.border.light,
              }}
            >
              {/* Header with rank and exercise */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      backgroundColor: colors.primary[100]
                    }}
                  >
                    <Ionicons name={getExerciseIcon(record.exercise)} size={20} color={colors.primary[600]} />
                  </View>
                  <TouchableOpacity 
                    style={{ flex: 1 }} 
                    onPress={() => handleExercisePress(record.exercise)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text.primary, textDecorationLine: 'underline' }}>
                      {record.exercise}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ alignItems: 'center' }}>
                  <Ionicons name={rankIcon.name} size={24} color={rankIcon.color} />
                  <Text style={{ fontSize: 12, fontWeight: '600', marginTop: 4, color: colors.text.secondary }}>
                    #{actualRank + 1}
                  </Text>
                </View>
              </View>

              {/* Stats row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: colors.text.secondary }}>
                    Weight
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                    {record.weight}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                    {record.unit || "kg"}
                  </Text>
                </View>

                <View style={{ width: 1, height: 48, backgroundColor: colors.border.light }} />

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: colors.text.secondary }}>
                    Reps
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>
                    {record.reps}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                    reps
                  </Text>
                </View>

                <View style={{ width: 1, height: 48, backgroundColor: colors.border.light }} />

                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '500', marginBottom: 4, color: colors.text.secondary }}>
                    1RM
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary[600] }}>
                    {record.oneRM.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                    kg
                  </Text>
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

      {/* Exercise Detail Modal */}
      {selectedExercise && userId && (
        <ExerciseDetailModal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          exerciseName={selectedExercise}
          userId={userId}
        />
      )}

      {/* Filter Modal */}
      <PersonalRecordsFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
      />
    </View>
  )
}
