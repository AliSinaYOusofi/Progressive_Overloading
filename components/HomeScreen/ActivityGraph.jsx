import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useThemedColors } from '../../hooks/useThemedColors'
import { useTheme } from '../../contexts/ThemeContext'
import { 
  getLastNDays, 
  getDaysForYear,
  groupDaysIntoWeeks,
  groupDaysIntoWeeksAligned, 
  getFirstWorkoutDate, 
  filterDaysFromFirstWorkout,
  getMonthsInPeriod,
  hasActivityOnDate
} from '../../utils/dateUtils'

/**
 * Activity Graph Component
 * Displays a GitHub-style contribution graph showing workout activity
 */
export default function ActivityGraph({ streakData, selectedYear = null, userJoiningDate = null, onDatePress = null, selectedDate = null }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();

  if (!streakData || !streakData.activityMap) return null

  const handleBoxPress = (date, hasActivity) => {
    const dateKey = date.toISOString().split('T')[0]
    
    // Call parent callback with the selected date
    if (onDatePress) {
      onDatePress(dateKey, date, hasActivity)
    }
  }

  const getBoxColor = (level) => {
    if (level === 0) return colors.neutral[200]
    return colors.primary[600]
  }

  // Use selectedYear prop if provided, otherwise try to detect from data
  const getDisplayYear = () => {
    if (selectedYear !== null && selectedYear !== undefined) {
      return selectedYear
    }
    
    // Fallback: try to detect from activityMap dates
    if (streakData.activityMap && Object.keys(streakData.activityMap).length > 0) {
      const activityDates = Object.keys(streakData.activityMap)
      const years = new Set()
      
      activityDates.forEach(dateStr => {
        if (dateStr && dateStr.length >= 4) {
          const year = parseInt(dateStr.substring(0, 4), 10)
          if (!isNaN(year)) years.add(year)
        }
      })
      
      // If all activity dates are from a single year, use that year
      if (years.size === 1) {
        return Array.from(years)[0]
      }
    }
    
    return null
  }

  const displayYear = getDisplayYear()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get days for the selected year, or fall back to last 365 days
  const allDays = displayYear !== null 
    ? getDaysForYear(displayYear)
    : getLastNDays(365)
  
  // Find the first workout date
  const firstWorkoutDate = getFirstWorkoutDate(streakData.workoutDates)
  
  // Determine the start date for filtering:
  // - When showing a specific year: start from joining date (if within that year) or Jan 1
  // - When showing rolling window: filter from first workout onwards
  let startDate = null
  if (displayYear !== null) {
    if (userJoiningDate) {
      const joiningYear = userJoiningDate.getFullYear()
      if (joiningYear === displayYear) {
        // User joined in this year, start from joining date
        startDate = userJoiningDate
      } else if (joiningYear < displayYear) {
        // User joined in a previous year, start from Jan 1 of selected year
        startDate = new Date(displayYear, 0, 1)
      } else {
        // User joined in a future year (shouldn't happen), start from Jan 1
        startDate = new Date(displayYear, 0, 1)
      }
    } else {
      // No joining date available, start from Jan 1
      startDate = new Date(displayYear, 0, 1)
    }
  }
  
  // Filter days:
  // - When showing a specific year: show days from start date (joining date or Jan 1) up to today
  // - When showing rolling window: filter from first workout onwards
  let days = displayYear !== null
    ? allDays.filter(date => {
        date.setHours(0, 0, 0, 0)
        const dateStr = date.toISOString().split('T')[0]
        const todayStr = today.toISOString().split('T')[0]
        const startStr = startDate ? startDate.toISOString().split('T')[0] : null
        // Filter: date >= startDate AND date <= today
        return (!startStr || dateStr >= startStr) && dateStr <= todayStr
      })
    : filterDaysFromFirstWorkout(allDays, firstWorkoutDate) // Filter from first workout for rolling window
  
  // Group by weeks
  // Use day-of-week alignment for full year display, otherwise use month-boundary grouping
  const weeks = displayYear !== null
    ? groupDaysIntoWeeksAligned(days, true) // Align to day-of-week for full year
    : groupDaysIntoWeeks(days) // Use month-boundary grouping for rolling window
  
  // Get months in period
  // When showing a specific year: start from joining date (if within that year) or Jan 1, end at today
  // When showing rolling window: start from first workout date
  const endDate = displayYear !== null 
    ? today // For year view, end at today (not future dates)
    : (days.length > 0 ? days[days.length - 1] : new Date())
  
  let monthStartDate = null
  if (displayYear !== null) {
    // Use the same startDate logic we used for filtering days
    if (userJoiningDate) {
      const joiningYear = userJoiningDate.getFullYear()
      if (joiningYear === displayYear) {
        // User joined in this year, start from joining date
        monthStartDate = userJoiningDate
      } else {
        // User joined in a different year, start from Jan 1 of selected year
        monthStartDate = new Date(displayYear, 0, 1)
      }
    } else {
      // No joining date available, start from Jan 1
      monthStartDate = new Date(displayYear, 0, 1)
    }
  } else {
    // For rolling window, use first workout date
    monthStartDate = firstWorkoutDate || (days.length > 0 ? days[0] : new Date())
  }
  
  const monthsInPeriod = getMonthsInPeriod(monthStartDate, endDate)
  
  // Calculate month label positions for full year display
  const getMonthLabelPositions = () => {
    if (displayYear === null) return {}
    
    const positions = {}
    const labelWidth = 30 // Width of each month label
    
    monthsInPeriod.forEach((monthData) => {
      // Create date in local timezone to match the dates in weeks array
      const firstDayOfMonth = new Date(monthData.year, monthData.month, 1)
      firstDayOfMonth.setHours(0, 0, 0, 0)
      
      // Find which week and day position this date is in
      let weekIndex = 0
      let dayIndex = 0
      let found = false
      
      for (let w = 0; w < weeks.length && !found; w++) {
        for (let d = 0; d < weeks[w].length; d++) {
          const weekDate = weeks[w][d]
          if (weekDate) {
            // Compare dates directly (same year, month, day)
            const weekDateYear = weekDate.getFullYear()
            const weekDateMonth = weekDate.getMonth()
            const weekDateDay = weekDate.getDate()
            
            if (weekDateYear === monthData.year && 
                weekDateMonth === monthData.month && 
                weekDateDay === 1) {
              weekIndex = w
              dayIndex = d
              found = true
              break
            }
          }
        }
      }
      
      if (found) {
        // Calculate pixel offset to align with the exact position of the first day of the month
        // The month label should align with where the first day appears in the grid
        // Note: Initial 16px left margin is handled by parent container's marginLeft
        
        // Each week column contains 7 day boxes stacked vertically, but horizontally each column is only 10px wide
        // Plus the marginRight between columns
        
        let offset = 0
        
        // Calculate offset for all complete weeks before the target week
        for (let w = 0; w < weekIndex; w++) {
          // The margin after week w is determined by whether the NEXT week (w+1) starts a new month
          // This matches the grid rendering logic: marginRight is 8px before month start, 2px otherwise
          const nextWeek = weeks[w + 1]
          const nextWeekHasMonthStart = nextWeek && nextWeek.some(date => 
            date && date.getDate() === 1
          )
          // Each week column: 10px (box width) + marginRight (8px if next week starts month, 2px otherwise)
          offset += nextWeekHasMonthStart ? 18 : 12
        }
        
        // Add the position within the current week
        // Since boxes are stacked vertically in each column, dayIndex doesn't affect horizontal position
        // All days in the same week column are at the same horizontal position
        // So we don't add dayIndex * 10, we just use the column start position
        
        positions[`${monthData.year}-${monthData.month}`] = offset
      }
    })
    
    // Prevent label overlap - if labels are too close together, adjust spacing
    const sortedMonths = [...monthsInPeriod].sort((a, b) => {
      const keyA = `${a.year}-${a.month}`
      const keyB = `${b.year}-${b.month}`
      return (positions[keyA] || 0) - (positions[keyB] || 0)
    })
    
    for (let i = 1; i < sortedMonths.length; i++) {
      const prevKey = `${sortedMonths[i - 1].year}-${sortedMonths[i - 1].month}`
      const currKey = `${sortedMonths[i].year}-${sortedMonths[i].month}`
      const prevOffset = positions[prevKey]
      const currOffset = positions[currKey]
      
      if (prevOffset !== undefined && currOffset !== undefined) {
        // If labels are too close (less than labelWidth apart), adjust current label
        const spacing = currOffset - prevOffset
        if (spacing < labelWidth && spacing > 0) {
          // Move current label to the right to prevent overlap
          positions[currKey] = prevOffset + labelWidth
        }
      }
    }
    
    return positions
  }
  
  const monthLabelPositions = displayYear !== null ? getMonthLabelPositions() : {}

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.neutral[700], marginBottom: 8 }}>
        {streakData.workoutDates.length > 0 ? 'Your Fitness Journey' : 'Last 365 Days Activity'}
      </Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Month labels */}
          <View 
            style={{ 
              marginBottom: 4, 
              marginLeft: 16, 
              position: 'relative', 
              height: 16,
              minHeight: 16,
              width: displayYear !== null ? '100%' : undefined
            }}
          >
            {monthsInPeriod.map((monthData, index) => {
              const monthKey = `${monthData.year}-${monthData.month}`
              const monthOffset = monthLabelPositions[monthKey]
              
              // Only render if we have a valid offset or if not using year filter
              if (displayYear !== null && (monthOffset === undefined || monthOffset === null)) {
                return null
              }
              
              return (
                <Text 
                  key={monthKey}
                  style={{ 
                    position: displayYear !== null ? 'absolute' : 'relative',
                    left: displayYear !== null ? monthOffset : undefined,
                    width: displayYear !== null ? 30 : 44,
                    fontSize: 9, 
                    color: colors.neutral[500],
                    textAlign: displayYear !== null ? 'left' : 'center',
                    marginRight: displayYear === null && index < monthsInPeriod.length - 1 ? 2 : 0,
                    zIndex: 10,
                    backgroundColor: 'transparent',
                  }}
                >
                  {monthData.name}
                </Text>
              )
            })}
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
                    const isSelected = selectedDate === dateKey
                    
                    
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
      
    </View>
  )
}
