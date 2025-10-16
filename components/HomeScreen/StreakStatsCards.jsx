import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import { Flame, Trophy, Calendar, TrendingUp } from "lucide-react-native"
import { colors } from '../../constants/ui_colors'

export default function StreakStatsCards({ streakData }) {
  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    backgroundColor, 
    borderColor, 
    iconBackgroundColor, 
    textColor 
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
            backgroundColor: iconBackgroundColor,
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
      <Text style={{ fontSize: 32, fontWeight: 'bold', color: textColor }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: colors.neutral[600] }}>
        {subtitle}
      </Text>
    </View>
  )

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
      <StatCard
        title="Current Streak"
        value={streakData?.currentStreak || 0}
        subtitle="days in a row"
        icon={Flame}
        backgroundColor={colors.primary[50]}
        borderColor={colors.primary[200]}
        iconBackgroundColor={colors.primary[600]}
        textColor={colors.primary[600]}
      />
      
      <StatCard
        title="Longest Streak"
        value={streakData?.longestStreak || 0}
        subtitle="personal best 🏆"
        icon={Trophy}
        backgroundColor={colors.status.successLight}
        borderColor={colors.status.success + '30'}
        iconBackgroundColor={colors.status.success}
        textColor={colors.status.success}
      />
      
      <StatCard
        title="Total Days"
        value={streakData?.totalWorkoutDays || 0}
        subtitle="workouts logged"
        icon={Calendar}
        backgroundColor={colors.status.infoLight}
        borderColor={colors.status.info + '30'}
        iconBackgroundColor={colors.status.info}
        textColor={colors.status.info}
      />
      
      <StatCard
        title="This Week"
        value={streakData?.thisWeekWorkouts || 0}
        subtitle="out of 7 days"
        icon={TrendingUp}
        backgroundColor={colors.status.warningLight}
        borderColor={colors.status.warning + '30'}
        iconBackgroundColor={colors.status.warning}
        textColor={colors.status.warning}
      />
    </View>
  )
}
