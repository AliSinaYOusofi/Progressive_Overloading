import React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from '../../constants/ui_colors'

export default function ExerciseMetricCard({ 
  icon, 
  iconColor, 
  value, 
  label, 
  backgroundColor 
}) {
  return (
    <View 
      style={{ 
        flex: 1, 
        minWidth: "45%",
        backgroundColor: backgroundColor, 
        padding: 16, 
        borderRadius: 12 
      }}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={iconColor} 
        style={{ marginBottom: 8 }} 
      />
      <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.neutral[900] }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: colors.neutral[600], marginTop: 2 }}>
        {label}
      </Text>
    </View>
  )
}

