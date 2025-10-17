import React from 'react'
import { View, Text } from 'react-native'
import { Flame, Trophy, Calendar, TrendingUp } from 'lucide-react-native'
import { colors } from '../../constants/ui_colors'

/**
 * Individual Stat Card Component
 */
const StatCard = ({ 
  icon: Icon, 
  iconColor, 
  backgroundColor, 
  borderColor, 
  title, 
  value, 
  subtitle 
}) => (
  <View 
    style={{ 
      flex: 1,
      minWidth: '45%',
      backgroundColor,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: iconColor,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 8
        }}
      >
        <Icon size={16} color={colors.text.white} />
      </View>
      <Text style={{ fontSize: 12, color: colors.neutral[600], fontWeight: '600' }}>
        {title}
      </Text>
    </View>
    <Text style={{ fontSize: 32, fontWeight: 'bold', color: iconColor }}>
      {value}
    </Text>
    <Text style={{ fontSize: 12, color: colors.neutral[600] }}>
      {subtitle}
    </Text>
  </View>
)

/**
 * Streak Stats Cards Component
 * Displays current streak, longest streak, total days, and this week stats
 */
export default function StreakStatsCards({ streakData }) {
  const stats = [
    {
      icon: Flame,
      iconColor: colors.primary[600],
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[200],
      title: 'Current Streak',
      value: streakData?.currentStreak || 0,
      subtitle: 'days in a row'
    },
    {
      icon: Trophy,
      iconColor: colors.status.success,
      backgroundColor: colors.status.successLight,
      borderColor: colors.status.success + '30',
      title: 'Longest Streak',
      value: streakData?.longestStreak || 0,
      subtitle: 'personal best 🏆'
    },
    {
      icon: Calendar,
      iconColor: colors.status.info,
      backgroundColor: colors.status.infoLight,
      borderColor: colors.status.info + '30',
      title: 'Total Days',
      value: streakData?.totalWorkoutDays || 0,
      subtitle: 'workouts logged'
    },
    {
      icon: TrendingUp,
      iconColor: colors.status.warning,
      backgroundColor: colors.status.warningLight,
      borderColor: colors.status.warning + '30',
      title: 'This Week',
      value: streakData?.thisWeekWorkouts || 0,
      subtitle: 'out of 7 days'
    }
  ]

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </View>
  )
}