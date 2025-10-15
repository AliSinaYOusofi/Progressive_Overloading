import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react-native"
import { colors } from '../../constants/ui_colors'
import { getStreakAnalytics } from "../../lib/database"

const { height: screenHeight } = Dimensions.get('window')

export default function StreakInfoModal({ visible, onClose, userId }) {
  const [streakData, setStreakData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    if (visible && userId) {
      loadStreakData()
    } else if (!visible) {
      setTooltip(null) // Clear tooltip when modal closes
    }
  }, [visible, userId])

  const loadStreakData = async () => {
    try {
      setLoading(true)
      const data = await getStreakAnalytics(userId, 365)
      setStreakData(data)
    } catch (error) {
      console.error("Error loading streak data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDateTooltip = (date) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }
    return date.toLocaleDateString('en-US', options)
  }

  const handleBoxPress = (date, hasActivity) => {
    const tooltipText = formatDateTooltip(date)
    const activityText = hasActivity ? ' - Workout logged! 💪' : ' - No workout'
    
    setTooltip({
      text: tooltipText + activityText,
      date: date.toISOString().split('T')[0]
    })
    
    // Auto-hide tooltip after 2 seconds
    setTimeout(() => {
      setTooltip(null)
    }, 2000)
  }

  const renderActivityGraph = () => {
    if (!streakData || !streakData.activityMap) return null

    // Get last 365 days, but filter to show only from first workout onwards
    const today = new Date()
    const allDays = []
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      allDays.push(date)
    }
    
    // Find the first workout date
    const workoutDates = streakData.workoutDates || []
    let firstWorkoutDate = null
    
    if (workoutDates.length > 0) {
      const sortedWorkoutDates = [...workoutDates].sort()
      firstWorkoutDate = new Date(sortedWorkoutDates[0])
    }
    
    // Filter days to only show from first workout onwards
    const days = firstWorkoutDate 
      ? allDays.filter(date => date >= firstWorkoutDate)
      : allDays
    

    // Group by weeks (7 columns x 53 rows)
    const weeks = []
    let currentWeek = []
    
    days.forEach((date, index) => {
      currentWeek.push(date)
      if (currentWeek.length === 7 || index === days.length - 1) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    })

    const getActivityLevel = (date) => {
      const dateStr = date.toISOString().split('T')[0]
      // Check if this date has any workout activity
      const hasActivity = streakData.activityMap[dateStr] === true
      return hasActivity ? 1 : 0
    }

    const getBoxColor = (level) => {
      if (level === 0) return colors.neutral[200]
      return colors.primary[600]
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    // Calculate which months appear starting from the first workout date
    const endDate = days[days.length - 1]
    const startDate = firstWorkoutDate || days[0]
    
    // Get unique months in chronological order from first workout
    const monthsInPeriod = []
    
    let currentMonthIndex = startDate.getMonth()
    let currentYear = startDate.getFullYear()
    
    // Add all months from first workout to end
    while (true) {
      const monthKey = `${currentYear}-${currentMonthIndex}`
      monthsInPeriod.push({
        name: months[currentMonthIndex],
        year: currentYear,
        month: currentMonthIndex
      })
      
      // Move to next month
      currentMonthIndex++
      if (currentMonthIndex > 11) {
        currentMonthIndex = 0
        currentYear++
      }
      
      // Stop when we reach the end month
      if (currentYear > endDate.getFullYear() || 
          (currentYear === endDate.getFullYear() && currentMonthIndex > endDate.getMonth())) {
        break
      }
    }

    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[700], marginBottom: 8 }}>
          {workoutDates.length > 0 ? 'Your Fitness Journey' : 'Last 365 Days Activity'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            {/* Month labels */}
            <View style={{ flexDirection: 'row', marginBottom: 4, marginLeft: 16 }}>
              {monthsInPeriod.map((monthData, index) => (
                <Text 
                  key={`${monthData.year}-${monthData.month}`}
                  style={{ 
                    width: 44, 
                    fontSize: 9, 
                    color: colors.neutral[500],
                    textAlign: 'center'
                  }}
                >
                  {monthData.name}
                </Text>
              ))}
            </View>

            {/* Activity grid */}
            <View style={{ flexDirection: 'row' }}>
              {/* Day labels */}
              <View style={{ marginRight: 4, justifyContent: 'space-around' }}>
                <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>S</Text>
                <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>M</Text>
                <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>T</Text>
                <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>W</Text>
                <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>T</Text>
                <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>F</Text>
                <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>S</Text>
              </View>

              {/* Grid */}
              {weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={{ marginRight: 2 }}>
                  {week.map((date, dayIndex) => {
                    const level = getActivityLevel(date)
                    const hasActivity = level === 1
                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        onPress={() => handleBoxPress(date, hasActivity)}
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: getBoxColor(level),
                          borderRadius: 2,
                          marginBottom: 2
                        }}
                        activeOpacity={0.7}
                      />
                    )
                  })}
                </View>
              ))}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, marginLeft: 16 }}>
              <Text style={{ fontSize: 10, color: colors.neutral[600], marginRight: 6 }}>Less</Text>
              <View style={{ width: 10, height: 10, backgroundColor: colors.neutral[200], borderRadius: 2, marginRight: 2 }} />
              <View style={{ width: 10, height: 10, backgroundColor: colors.primary[600], borderRadius: 2, marginRight: 2 }} />
              <Text style={{ fontSize: 10, color: colors.neutral[600], marginLeft: 6 }}>More</Text>
            </View>
          </View>
        </ScrollView>
        
        {/* Tooltip */}
        {tooltip && (
          <View style={{
            position: 'absolute',
            top: 50,
            left: 20,
            right: 20,
            backgroundColor: colors.neutral[800],
            borderRadius: 8,
            padding: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 1000
          }}>
            <Text style={{ 
              color: colors.text.white, 
              fontSize: 14, 
              fontWeight: '600',
              textAlign: 'center'
            }}>
              {tooltip.text}
            </Text>
          </View>
        )}
      </View>
    )
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <View 
          style={{ 
            backgroundColor: colors.background.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: screenHeight * 0.85,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 20
          }}
        >
          {/* Drag Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: colors.neutral[300], borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 8 }} />

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primary[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12
                  }}
                >
                  <Flame size={24} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.neutral[900] }}>
                  Your Workout Streak
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.neutral[100],
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ fontSize: 20, color: colors.neutral[600], fontWeight: "500" }}>×</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text style={{ marginTop: 12, color: colors.neutral[600] }}>Loading your stats...</Text>
            </View>
          ) : (
            <ScrollView 
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            >
              {/* Stats Cards */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                {/* Current Streak */}
                <View 
                  style={{ 
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: colors.primary[50],
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.primary[200]
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.primary[600],
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8
                      }}
                    >
                      <Flame size={16} color={colors.text.white} />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.neutral[600], fontWeight: '600' }}>
                      Current Streak
                    </Text>
                  </View>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.primary[600] }}>
                    {streakData?.currentStreak || 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.neutral[600] }}>
                    days in a row
                  </Text>
                </View>

                {/* Longest Streak */}
                <View 
                  style={{ 
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: colors.status.successLight,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.status.success + '30'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.status.success,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8
                      }}
                    >
                      <Trophy size={16} color={colors.text.white} />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.neutral[600], fontWeight: '600' }}>
                      Longest Streak
                    </Text>
                  </View>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.status.success }}>
                    {streakData?.longestStreak || 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.neutral[600] }}>
                    personal best 🏆
                  </Text>
                </View>

                {/* Total Workout Days */}
                <View 
                  style={{ 
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: colors.status.infoLight,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.status.info + '30'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.status.info,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8
                      }}
                    >
                      <Calendar size={16} color={colors.text.white} />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.neutral[600], fontWeight: '600' }}>
                      Total Days
                    </Text>
                  </View>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.status.info }}>
                    {streakData?.totalWorkoutDays || 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.neutral[600] }}>
                    workouts logged
                  </Text>
                </View>

                {/* This Week */}
                <View 
                  style={{ 
                    flex: 1,
                    minWidth: '45%',
                    backgroundColor: colors.status.warningLight,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.status.warning + '30'
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: colors.status.warning,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8
                      }}
                    >
                      <TrendingUp size={16} color={colors.text.white} />
                    </View>
                    <Text style={{ fontSize: 12, color: colors.neutral[600], fontWeight: '600' }}>
                      This Week
                    </Text>
                  </View>
                  <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.status.warning }}>
                    {streakData?.thisWeekWorkouts || 0}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.neutral[600] }}>
                    out of 7 days
                  </Text>
                </View>
              </View>

              {/* Activity Graph */}
              <View 
                style={{ 
                  backgroundColor: colors.neutral[50],
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: colors.neutral[200]
                }}
              >
                {renderActivityGraph()}
              </View>

              {/* Tips */}
              <View 
                style={{ 
                  backgroundColor: colors.primary[50],
                  borderRadius: 16,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: colors.primary[200]
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.primary[600],
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10
                    }}
                  >
                    <Ionicons name="bulb" size={18} color={colors.text.white} />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.neutral[900] }}>
                    Keep Your Streak Alive!
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: colors.neutral[700], lineHeight: 22 }}>
                  • Consistency is key to achieving your fitness goals{'\n'}
                  • Even a quick 15-minute workout counts!{'\n'}
                  • Set reminders to help maintain your streak{'\n'}
                  • Celebrate milestones along the way 🎉
                </Text>
              </View>
            </ScrollView>
          )}

          {/* Footer Button */}
          <View style={{ 
            paddingHorizontal: 24, 
            paddingTop: 12, 
            paddingBottom: 20, 
            borderTopWidth: 1, 
            borderTopColor: colors.border.light, 
            backgroundColor: colors.background.card 
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.primary[600],
                paddingVertical: 14,
                borderRadius: 12,
                shadowColor: colors.primary[600],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text style={{ 
                textAlign: "center", 
                color: colors.text.white, 
                fontWeight: "700",
                fontSize: 16
              }}>
                Keep it going! 🔥
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

