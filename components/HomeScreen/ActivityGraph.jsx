import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useThemedColors } from '../../hooks/useThemedColors'
import { 
  getLastNDays, 
  groupDaysIntoWeeks, 
  getFirstWorkoutDate, 
  filterDaysFromFirstWorkout,
  getMonthsInPeriod,
  hasActivityOnDate,
  formatDateTooltip
} from '../../utils/dateUtils'

/**
 * Activity Graph Component
 * Displays a GitHub-style contribution graph showing workout activity
 */
export default function ActivityGraph({ streakData }) {
  const colors = useThemedColors()
  const [tooltip, setTooltip] = useState(null)
  const [selectedBox, setSelectedBox] = useState(null)

  if (!streakData || !streakData.activityMap) return null

  const handleBoxPress = (date, hasActivity) => {
    const tooltipText = formatDateTooltip(date)
    const activityText = hasActivity ? ' - Workout logged! 💪' : ' - No workout'
    const dateKey = date.toISOString().split('T')[0]
    
    setTooltip({
      text: tooltipText + activityText,
      date: dateKey
    })
    
    // Set selected box for visual feedback
    setSelectedBox(dateKey)
    
    // Auto-hide tooltip and selection after 2 seconds
    setTimeout(() => {
      setTooltip(null)
      setSelectedBox(null)
    }, 2000)
  }

  const getBoxColor = (level) => {
    if (level === 0) return colors.neutral[200]
    return colors.primary[600]
  }

  // Get last 365 days
  const allDays = getLastNDays(365)
  
  // Find the first workout date
  const firstWorkoutDate = getFirstWorkoutDate(streakData.workoutDates)
  
  // Filter days to only show from first workout onwards
  const days = filterDaysFromFirstWorkout(allDays, firstWorkoutDate)
  
  // Group by weeks
  const weeks = groupDaysIntoWeeks(days)
  
  // Get months in period
  const endDate = days[days.length - 1]
  const startDate = firstWorkoutDate || days[0]
  const monthsInPeriod = getMonthsInPeriod(startDate, endDate)

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[700], marginBottom: 8 }}>
        {streakData.workoutDates.length > 0 ? 'Your Fitness Journey' : 'Last 365 Days Activity'}
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
                  textAlign: 'center',
                  marginRight: index < monthsInPeriod.length - 1 ? 2 : 0
                }}
              >
                {monthData.name}
              </Text>
            ))}
          </View>

          {/* Activity grid */}
          <View style={{ flexDirection: 'row' }}>
            {/* Day labels - commented out as they're redundant now */}
            {/* <View style={{ marginRight: 4, justifyContent: 'space-around' }}>
              <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>S</Text>
              <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>M</Text>
              <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>T</Text>
              <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>W</Text>
              <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>T</Text>
              <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>F</Text>
              <Text style={{ fontSize: 9, color: colors.neutral[500], height: 10 }}>S</Text>
            </View> */}

            {/* Grid */}
            {weeks.map((week, weekIndex) => {
              // Check if the NEXT week contains the first day of a new month
              const nextWeek = weeks[weekIndex + 1]
              const nextWeekHasFirstDayOfMonth = nextWeek && nextWeek.some(date => date && date.getDate() === 1)
              
              return (
                <View 
                  key={weekIndex} 
                  style={{ 
                    marginRight: nextWeekHasFirstDayOfMonth ? 8 : 2 // Extra spacing before weeks with first day of month
                  }}
                >
                  {week.map((date, dayIndex) => {
                    // Handle empty slots (null values) for days before the first date
                    if (date === null) {
                      return (
                        <View
                          key={dayIndex}
                          style={{
                            width: 10,
                            height: 10,
                            marginBottom: 2
                          }}
                        />
                      )
                    }
                    
                    const hasActivity = hasActivityOnDate(date, streakData.activityMap)
                    const level = hasActivity ? 1 : 0
                    const dateKey = date.toISOString().split('T')[0]
                    const isSelected = selectedBox === dateKey
                    
                    
                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        onPress={() => handleBoxPress(date, hasActivity)}
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: isSelected ? colors.primary[800] : getBoxColor(level),
                          borderRadius: isSelected ? 10 : 2,
                          marginBottom: 2,
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: isSelected ? colors.text.white : 'transparent',
                          shadowColor: isSelected ? colors.primary[600] : 'transparent',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: isSelected ? 0.8 : 0,
                          shadowRadius: isSelected ? 4 : 0,
                          elevation: isSelected ? 4 : 0
                        }}
                        activeOpacity={0.6}
                      />
                    )
                  })}
                </View>
              )
            })}
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
          bottom: -60,
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
