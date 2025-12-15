import React from "react"
import { View, Text } from "react-native"
import { TrendingUp, TrendingDown, Activity } from "lucide-react-native"
import { useThemedColors } from '../../hooks/useThemedColors'

const getTrendIcon = (trend, colors) => {
  switch (trend) {
    case "up":
      return <TrendingUp size={16} color={colors.status.success} />
    case "down":
      return <TrendingDown size={16} color={colors.status.error} />
    default:
      return <Activity size={16} color={colors.status.warning} />
  }
}

const getTrendColor = (trend, colors) => {
  switch (trend) {
    case "up":
      return colors.status.success
    case "down":
      return colors.status.error
    default:
      return colors.status.warning
  }
}

const getTrendBgColor = (trend, colors) => {
  switch (trend) {
    case "up":
      return colors.status.success + "15"
    case "down":
      return colors.status.error + "15"
    default:
      return colors.status.warning + "15"
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
  trendPercent,
  trendValue,
  unit = ""
}) {
  const colors = useThemedColors();
  return (
    <View 
      style={{ 
        backgroundColor: getTrendBgColor(trend, colors),
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: getTrendColor(trend, colors) + "25"
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
            {getTrendIcon(trend, colors)}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.primary }}>
              {label}
            </Text>
            <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
              {getTrendLabel(trend)}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text 
            style={{ 
              fontSize: 24, 
              fontWeight: "bold", 
              color: getTrendColor(trend, colors) 
            }}
          >
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}
            {trendPercent.toFixed(1)}%
          </Text>
          {trendValue !== undefined && trendValue !== null && (
            <Text 
              style={{ 
                fontSize: 13, 
                fontWeight: "600", 
                color: colors.text.secondary,
                marginTop: 4,
              }}
            >
              {trend === "up" ? "+" : trend === "down" ? "-" : ""}
              {Math.abs(trendValue).toFixed(1)}{unit}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

