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
  hasActivityOnDate,
  toLocalDateStr
} from '../../utils/dateUtils'

/**
 * Activity Graph Component
 * Displays a GitHub-style contribution graph showing workout activity
 * with multi-level intensity based on workout volume
 */
export default function ActivityGraph({ streakData, selectedYear = null, userJoiningDate = null, onDatePress = null, selectedDate = null }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();

  if (!streakData || !streakData.activityMap) return null

  const handleBoxPress = (date, hasActivity) => {
    const dateKey = toLocalDateStr(date)

    // Call parent callback with the selected date
    if (onDatePress) {
      onDatePress(dateKey, date, hasActivity)
    }
  }

  // Multi-level intensity colors based on activity count
  const getBoxColor = (level) => {
    if (level === 0) {
      return isDarkMode ? colors.neutral[200] + "30" : colors.neutral[200]
    }
    if (level === 1) return isDarkMode ? colors.primary[400] + "60" : colors.primary[200]
    if (level === 2) return isDarkMode ? colors.primary[400] + "90" : colors.primary[400]
    return colors.primary[600] // level 3+
  }

  // Get activity level (0-3) for a date
  const getActivityLevel = (date) => {
    if (!date) return 0
    const dateKey = toLocalDateStr(date)
    const activity = streakData.activityMap[dateKey]
    if (!activity) return 0
    // Treat as binary if activityMap stores booleans, or use count for levels
    if (typeof activity === 'boolean') return activity ? 3 : 0
    if (typeof activity === 'number') {
      if (activity === 0) return 0
      if (activity <= 2) return 1
      if (activity <= 5) return 2
      return 3
    }
    return activity ? 3 : 0
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

  // Determine the start date for filtering
  let startDate = null
  if (displayYear !== null) {
    if (userJoiningDate) {
      const joiningYear = userJoiningDate.getFullYear()
      if (joiningYear === displayYear) {
        startDate = userJoiningDate
      } else if (joiningYear < displayYear) {
        startDate = new Date(displayYear, 0, 1)
      } else {
        startDate = new Date(displayYear, 0, 1)
      }
    } else {
      startDate = new Date(displayYear, 0, 1)
    }
  }

  // Filter days
  let days = displayYear !== null
    ? allDays.filter(date => {
        date.setHours(0, 0, 0, 0)
        const dateStr = toLocalDateStr(date)
        const todayStr = toLocalDateStr(today)
        const startStr = startDate ? toLocalDateStr(startDate) : null
        return (!startStr || dateStr >= startStr) && dateStr <= todayStr
      })
    : filterDaysFromFirstWorkout(allDays, firstWorkoutDate)

  // Group by weeks
  const weeks = displayYear !== null
    ? groupDaysIntoWeeksAligned(days, true)
    : groupDaysIntoWeeks(days)

  // Get months in period
  const endDate = displayYear !== null
    ? today
    : (days.length > 0 ? days[days.length - 1] : new Date())

  let monthStartDate = null
  if (displayYear !== null) {
    if (userJoiningDate) {
      const joiningYear = userJoiningDate.getFullYear()
      if (joiningYear === displayYear) {
        monthStartDate = userJoiningDate
      } else {
        monthStartDate = new Date(displayYear, 0, 1)
      }
    } else {
      monthStartDate = new Date(displayYear, 0, 1)
    }
  } else {
    monthStartDate = firstWorkoutDate || (days.length > 0 ? days[0] : new Date())
  }

  const monthsInPeriod = getMonthsInPeriod(monthStartDate, endDate)

  // Calculate month label positions for full year display
  const getMonthLabelPositions = () => {
    if (displayYear === null) return {}

    const positions = {}
    const labelWidth = 30

    monthsInPeriod.forEach((monthData) => {
      const firstDayOfMonth = new Date(monthData.year, monthData.month, 1)
      firstDayOfMonth.setHours(0, 0, 0, 0)

      let weekIndex = 0
      let found = false

      for (let w = 0; w < weeks.length && !found; w++) {
        for (let d = 0; d < weeks[w].length; d++) {
          const weekDate = weeks[w][d]
          if (weekDate) {
            const weekDateYear = weekDate.getFullYear()
            const weekDateMonth = weekDate.getMonth()
            const weekDateDay = weekDate.getDate()

            if (weekDateYear === monthData.year &&
                weekDateMonth === monthData.month &&
                weekDateDay === 1) {
              weekIndex = w
              found = true
              break
            }
          }
        }
      }

      if (found) {
        let offset = 0
        for (let w = 0; w < weekIndex; w++) {
          const nextWeek = weeks[w + 1]
          const nextWeekHasMonthStart = nextWeek && nextWeek.some(date =>
            date && date.getDate() === 1
          )
          offset += nextWeekHasMonthStart ? 18 : 12
        }

        positions[`${monthData.year}-${monthData.month}`] = offset
      }
    })

    // Prevent label overlap
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
        const spacing = currOffset - prevOffset
        if (spacing < labelWidth && spacing > 0) {
          positions[currKey] = prevOffset + labelWidth
        }
      }
    }

    return positions
  }

  const monthLabelPositions = displayYear !== null ? getMonthLabelPositions() : {}

  // Count total workout days for the subtitle
  const totalWorkoutDays = streakData.workoutDates ? streakData.workoutDates.length : 0

  return (
    <View>
      {/* Section header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 2 }}>
            {streakData.workoutDates.length > 0 ? 'Your Fitness Journey' : 'Activity'}
          </Text>
          {totalWorkoutDays > 0 && (
            <Text style={{ fontSize: 12, color: colors.text.tertiary, fontWeight: "500" }}>
              {totalWorkoutDays} workout{totalWorkoutDays !== 1 ? 's' : ''} logged
            </Text>
          )}
        </View>
        {selectedDate && (
          <View style={{
            paddingHorizontal: 10, paddingVertical: 4,
            borderRadius: 8, backgroundColor: colors.primary[600] + "15",
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.primary[600] }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Month labels */}
          <View
            style={{
              marginBottom: 6,
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
                    fontSize: 10,
                    fontWeight: '600',
                    color: colors.text.tertiary,
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
            {weeks.map((week, weekIndex) => {
              const nextWeek = weeks[weekIndex + 1]
              const nextWeekHasFirstDayOfMonth = nextWeek && nextWeek.some(date => date && date.getDate() === 1)

              return (
                <View
                  key={weekIndex}
                  style={{
                    marginRight: nextWeekHasFirstDayOfMonth ? 8 : 2
                  }}
                >
                  {week.map((date, dayIndex) => {
                    // Handle empty slots
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
                    const level = getActivityLevel(date)
                    const dateKey = toLocalDateStr(date)
                    const isSelected = selectedDate === dateKey

                    return (
                      <TouchableOpacity
                        key={dayIndex}
                        onPress={() => handleBoxPress(date, hasActivity)}
                        style={{
                          width: 10,
                          height: 10,
                          backgroundColor: isSelected ? colors.primary[800] : getBoxColor(level),
                          borderRadius: isSelected ? 10 : 3,
                          marginBottom: 2,
                          borderWidth: isSelected ? 1.5 : 0,
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
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginLeft: 16 }}>
            <Text style={{ fontSize: 11, color: colors.text.tertiary, fontWeight: "500", marginRight: 6 }}>Less</Text>
            <View style={{
              width: 10, height: 10, borderRadius: 3, marginRight: 3,
              backgroundColor: isDarkMode ? colors.neutral[200] + "30" : colors.neutral[200],
            }} />
            <View style={{
              width: 10, height: 10, borderRadius: 3, marginRight: 3,
              backgroundColor: isDarkMode ? colors.primary[400] + "60" : colors.primary[200],
            }} />
            <View style={{
              width: 10, height: 10, borderRadius: 3, marginRight: 3,
              backgroundColor: isDarkMode ? colors.primary[400] + "90" : colors.primary[400],
            }} />
            <View style={{
              width: 10, height: 10, borderRadius: 3, marginRight: 3,
              backgroundColor: colors.primary[600],
            }} />
            <Text style={{ fontSize: 11, color: colors.text.tertiary, fontWeight: "500", marginLeft: 3 }}>More</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
