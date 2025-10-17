import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../../constants/ui_colors'

/**
 * Streak Tips Component
 * Displays motivational tips for maintaining workout streaks
 */
export default function StreakTips() {
  const tips = [
    'Consistency is key to achieving your fitness goals',
    'Even a quick 15-minute workout counts!',
    'Set reminders to help maintain your streak',
    'Celebrate milestones along the way 🎉'
  ]

  return (
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
        {tips.map((tip, index) => `• ${tip}${index < tips.length - 1 ? '\n' : ''}`).join('')}
      </Text>
    </View>
  )
}
