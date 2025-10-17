import { useState, useEffect } from 'react'
import { getStreakAnalytics } from '../lib/database'

/**
 * Custom hook for managing streak data
 * @param {boolean} visible - Whether the modal is visible
 * @param {string} userId - User ID
 * @returns {Object} Streak data and loading state
 */
export const useStreakData = (visible, userId) => {
  const [streakData, setStreakData] = useState(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    if (visible && userId) {
      loadStreakData()
    }
  }, [visible, userId])

  return {
    streakData,
    loading,
    refetch: loadStreakData
  }
}
