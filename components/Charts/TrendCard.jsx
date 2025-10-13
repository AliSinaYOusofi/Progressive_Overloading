import React from "react"
import { View, Text } from "react-native"
import { TrendingUp, TrendingDown, Activity } from "lucide-react-native"
import { colors } from '../../constants/ui_colors'

const getTrendIcon = (trend) => {
  switch (trend) {
    case "up":
      return <TrendingUp size={16} color={colors.status.success} />
    case "down":
      return <TrendingDown size={16} color={colors.status.error} />
    default:
      return <Activity size={16} color={colors.status.warning} />
  }
}

const getTrendColor = (trend) => {
  switch (trend) {
    case "up":
      return colors.status.success
    case "down":
      return colors.status.error
    default:
      return colors.status.warning
  }
}

const getTrendBgColor = (trend) => {
  switch (trend) {
    case "up":
      return colors.status.successLight
    case "down":
      return colors.status.errorLight
    default:
      return colors.status.warningLight
  }
}

const getTrendLabel = (trend) => {
  switch (trend) {
    case "up":
      return "Increasing"
    case "down":
      return "Decreasing"
    default:
      return "Stable"
  }
}

export default function TrendCard({ 
  label, 
  trend, 
  trendPercent 
}) {
  return (
    <View 
      style={{ 
        backgroundColor: getTrendBgColor(trend),
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: getTrendColor(trend) + "40"
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.background.card,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12
            }}
          >
            {getTrendIcon(trend)}
          </View>
          <View className="flex-1">
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.neutral[900] }}>
              {label}
            </Text>
            <Text style={{ fontSize: 12, color: colors.neutral[600], marginTop: 2 }}>
              {getTrendLabel(trend)}
            </Text>
          </View>
        </View>
        <Text 
          style={{ 
            fontSize: 24, 
            fontWeight: "bold", 
            color: getTrendColor(trend) 
          }}
        >
          {trend === "up" ? "+" : trend === "down" ? "-" : ""}
          {trendPercent.toFixed(1)}%
        </Text>
      </View>
    </View>
  )
}

