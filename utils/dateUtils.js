/**
 * Utility functions for date calculations and formatting
 */

/**
 * Formats a date for tooltip display
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateTooltip = (date) => {
  const options = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
  return date.toLocaleDateString('en-US', options)
}

/**
 * Gets the last N days from today
 * @param {number} days - Number of days to get
 * @returns {Date[]} Array of dates
 */
export const getLastNDays = (days) => {
  const today = new Date()
  const allDays = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    allDays.push(date)
  }
  return allDays
}

/**
 * Gets all days for a specific year
 * @param {number} year - Year to get days for (e.g., 2025)
 * @returns {Date[]} Array of dates for the entire year
 */
export const getDaysForYear = (year) => {
  const startDate = new Date(year, 0, 1) // January 1
  const endDate = new Date(year, 11, 31) // December 31
  const allDays = []
  
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    allDays.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return allDays
}

/**
 * Groups an array of dates into weeks with proper day-of-week alignment
 * For full calendar years, aligns days to their correct day-of-week position
 * @param {Date[]} days - Array of dates
 * @param {boolean} alignToDayOfWeek - If true, align days to their day-of-week (Sunday=0, Monday=1, etc.)
 * @returns {Date[][]} Array of weeks (arrays of dates, with null for padding)
 */
export const groupDaysIntoWeeksAligned = (days, alignToDayOfWeek = false) => {
  if (days.length === 0) return []
  
  if (!alignToDayOfWeek) {
    // Use the original logic for non-aligned display
    return groupDaysIntoWeeks(days)
  }
  
  const weeks = []
  let currentWeek = []
  
  days.forEach((date) => {
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // If this is the first day, pad the week to align it to its day-of-week
    if (currentWeek.length === 0 && dayOfWeek > 0) {
      // Add null padding at the start of the week
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push(null)
      }
    }
    
    // Add the date to the current week
    currentWeek.push(date)
    
    // If the week is full (7 days), start a new week
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })
  
  // Add the last incomplete week if it exists
  if (currentWeek.length > 0) {
    weeks.push([...currentWeek])
  }
  
  return weeks
}

/**
 * Groups an array of dates into weeks, breaking at month boundaries and first workout
 * Always starts each week at the top position (no day-of-week alignment)
 * @param {Date[]} days - Array of dates
 * @returns {Date[][]} Array of weeks (arrays of dates)
 */
export const groupDaysIntoWeeks = (days) => {
  if (days.length === 0) return []
  
  const weeks = []
  let currentWeek = []
  let currentMonth = null
  let isFirstWorkout = true
  
  // Add the actual days
  days.forEach((date, index) => {
    const dateMonth = date.getMonth()
    const dateYear = date.getFullYear()
    const monthKey = `${dateYear}-${dateMonth}`
    
    // If this is the first workout or a new month, start a new week
    if ((isFirstWorkout || (currentMonth !== null && monthKey !== currentMonth)) && currentWeek.length > 0) {
      // Fill remaining slots with null to complete the week
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push([...currentWeek])
      currentWeek = []
    }
    
    // Always start at the top position (no day-of-week alignment needed)
    currentWeek.push(date)
    currentMonth = monthKey
    isFirstWorkout = false
    
    // Complete the week if it's full
    if (currentWeek.length === 7) {
      weeks.push([...currentWeek])
      currentWeek = []
    }
  })
  
  // Add the last incomplete week if it exists
  if (currentWeek.length > 0) {
    weeks.push([...currentWeek])
  }
  
  return weeks
}

/**
 * Gets the first workout date from an array of workout dates
 * @param {string[]} workoutDates - Array of workout date strings
 * @returns {Date|null} First workout date or null
 */
export const getFirstWorkoutDate = (workoutDates) => {
  if (!workoutDates || workoutDates.length === 0) return null
  
  const sortedWorkoutDates = [...workoutDates].sort()
  return new Date(sortedWorkoutDates[0])
}

/**
 * Filters days to show only from first workout onwards
 * @param {Date[]} allDays - All days array
 * @param {Date|null} firstWorkoutDate - First workout date
 * @returns {Date[]} Filtered days array
 */
export const filterDaysFromFirstWorkout = (allDays, firstWorkoutDate) => {
  return firstWorkoutDate 
    ? allDays.filter(date => date >= firstWorkoutDate)
    : allDays
}

/**
 * Gets months in chronological order from start date to end date
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object[]} Array of month objects with name, year, and month
 */
export const getMonthsInPeriod = (startDate, endDate) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthsInPeriod = []
  
  let currentMonthIndex = startDate.getMonth()
  let currentYear = startDate.getFullYear()
  
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
  
  return monthsInPeriod
}

/**
 * Checks if a date has workout activity
 * @param {Date} date - Date to check
 * @param {Object} activityMap - Activity map object
 * @returns {boolean} True if date has activity
 */
export const hasActivityOnDate = (date, activityMap) => {
  const dateStr = date.toISOString().split('T')[0]
  return activityMap[dateStr] === true
}

/**
 * Extracts available years from workout dates
 * @param {string[]} workoutDates - Array of workout date strings (YYYY-MM-DD format)
 * @returns {number[]} Array of unique years, sorted in descending order
 */
export const getAvailableYears = (workoutDates) => {
  if (!workoutDates || workoutDates.length === 0) return []
  
  const years = new Set()
  workoutDates.forEach(dateStr => {
    if (dateStr && dateStr.length >= 4) {
      const year = parseInt(dateStr.substring(0, 4), 10)
      if (!isNaN(year)) {
        years.add(year)
      }
    }
  })
  
  return Array.from(years).sort((a, b) => b - a) // Descending order
}

/**
 * Filters and recalculates streak data for a specific year
 * @param {Object} streakData - Original streak data object
 * @param {number} year - Year to filter by (e.g., 2025)
 * @returns {Object} Filtered and recalculated streak data
 */
export const filterStreakDataByYear = (streakData, year) => {
  if (!streakData || !streakData.workoutDates || !streakData.activityMap) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalWorkoutDays: 0,
      thisWeekWorkouts: 0,
      activityMap: {},
      workoutDates: []
    }
  }

  // Filter workout dates to only include dates from the selected year
  const yearStart = `${year}-01-01`
  const yearEnd = `${year}-12-31`
  const filteredWorkoutDates = streakData.workoutDates.filter(dateStr => {
    return dateStr >= yearStart && dateStr <= yearEnd
  })

  // Filter activity map to only include dates from the selected year
  const filteredActivityMap = {}
  const yearStartDate = new Date(`${year}-01-01T00:00:00Z`)
  const yearEndDate = new Date(`${year}-12-31T23:59:59Z`)
  
  Object.keys(streakData.activityMap).forEach(dateStr => {
    const date = new Date(dateStr + 'T00:00:00Z')
    if (date >= yearStartDate && date <= yearEndDate) {
      filteredActivityMap[dateStr] = streakData.activityMap[dateStr]
    }
  })

  // Recalculate current streak for the year (ending on Dec 31 of that year, or the last workout date if earlier)
  let currentStreak = 0
  if (filteredWorkoutDates.length > 0) {
    const sortedDates = [...filteredWorkoutDates].sort().reverse()
    const yearEndStr = yearEnd
    
    // Find the most recent workout date on or before Dec 31
    let checkDateStr = sortedDates[0]
    if (checkDateStr > yearEndStr) {
      // If most recent workout is after year end (shouldn't happen after filtering, but safety check)
      checkDateStr = yearEndStr
    }
    
    // Build a set for O(1) lookup
    const workoutDatesSet = new Set(filteredWorkoutDates)
    
    // Start from the end date and work backwards
    let currentDateStr = checkDateStr
    while (currentDateStr >= yearStart) {
      if (workoutDatesSet.has(currentDateStr)) {
        currentStreak++
        // Move to the previous day
        const currentDate = new Date(currentDateStr + 'T00:00:00Z')
        currentDate.setUTCDate(currentDate.getUTCDate() - 1)
        currentDateStr = currentDate.toISOString().split('T')[0]
      } else {
        // Gap found, stop counting
        break
      }
    }
  }

  // Recalculate longest streak for the year only
  let longestStreak = 0
  let tempStreak = 0
  const allDates = [...filteredWorkoutDates].sort()
  
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1
    } else {
      const prevDate = new Date(allDates[i - 1] + 'T00:00:00Z')
      const currDate = new Date(allDates[i] + 'T00:00:00Z')
      const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24))
      
      if (dayDiff === 1) {
        tempStreak++
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  // Recalculate total workout days for the year
  const totalWorkoutDays = filteredWorkoutDates.length

  // Recalculate this week's workouts only if current week is within selected year
  const today = new Date()
  const currentYear = today.getFullYear()
  let thisWeekWorkouts = 0
  
  if (year === currentYear) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      if (filteredActivityMap[dateStr]) {
        thisWeekWorkouts++
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalWorkoutDays,
    thisWeekWorkouts,
    activityMap: filteredActivityMap,
    workoutDates: filteredWorkoutDates
  }
}
