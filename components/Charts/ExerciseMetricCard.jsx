import React from "react"
import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from '../../hooks/useThemedColors'

export default function ExerciseMetricCard({ 
  icon, 
  iconColor, 
  value, 
  label, 
  backgroundColor 
}) {
  const colors = useThemedColors();
  return (
    <View 
      style={{ 
        flex: 1, 
        minWidth: "45%",
        backgroundColor: colors.background.card, 
        padding: 16, 
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border.light,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Ionicons 
          name={icon} 
          size={18} 
          color={iconColor || colors.icon?.primary || colors.primary[600]} 
        />
        <Text 
          style={{ 
            fontSize: 12, 
            color: colors.text.tertiary,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            flex: 1,
            flexWrap: "wrap",
          }}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>
      <Text style={{ 
        fontSize: 24, 
        fontWeight: "800", 
        color: colors.text.primary,
        letterSpacing: -0.5,
      }}>
        {value}
      </Text>
    </View>
  )
}

