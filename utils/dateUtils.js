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
