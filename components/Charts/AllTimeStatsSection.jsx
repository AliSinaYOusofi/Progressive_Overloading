import React from "react"
import { View, Text } from "react-native"
import { Target } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { useThemedColors } from '../../hooks/useThemedColors'
import { formatShortNumber } from '../../utils/numberUtils'

export default function AllTimeStatsSection({ 
  allTimeData, 
  analyticsData, 
  selectedTimeframe 
}) {
  const colors = useThemedColors();
  if (!allTimeData) return null

  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Target size={20} color={colors.icon?.primary || colors.primary[600]} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text.primary }}>
          {selectedTimeframe === null ? "Lifetime Performance" : "All-Time Records"}
        </Text>
      </View>
      
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {/* All-Time Peak Weight */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: colors.background.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border.light
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Ionicons name="trophy" size={18} color={colors.icon?.primary || colors.primary[600]} />
            {selectedTimeframe !== null && analyticsData && allTimeData.peakWeight > analyticsData.peakWeight && (
              <View 
                style={{ 
                  backgroundColor: colors.primary[600], 
                  paddingHorizontal: 6, 
                  paddingVertical: 2, 
                  borderRadius: 4 
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "bold", color: colors.text.white }}>
                  RECORD
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5, marginBottom: 2 }}>
            {allTimeData.peakWeight.toFixed(1)} kg
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
            Peak Weight Ever
          </Text>
        </View>

        {/* All-Time Peak Reps */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: colors.background.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border.light
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Ionicons name="flame" size={18} color={colors.icon?.primary || colors.primary[600]} />
            {selectedTimeframe !== null && analyticsData && allTimeData.peakReps > analyticsData.peakReps && (
              <View 
                style={{ 
                  backgroundColor: colors.status.success, 
                  paddingHorizontal: 6, 
                  paddingVertical: 2, 
                  borderRadius: 4 
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: "bold", color: colors.text.white }}>
                  RECORD
                </Text>
              </View>
            )}
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5, marginBottom: 2 }}>
            {allTimeData.peakReps}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
            Peak Reps Ever
          </Text>
        </View>

        {/* All-Time Total Volume */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: colors.background.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border.light
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="analytics" size={18} color={colors.icon?.primary || colors.primary[600]} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5, marginBottom: 2 }}>
            {formatShortNumber(allTimeData.totalVolume)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
            Lifetime Volume
          </Text>
        </View>

        {/* All-Time Total Workouts */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: colors.background.card,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border.light
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="calendar" size={18} color={colors.icon?.primary || colors.primary[600]} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: colors.text.primary, letterSpacing: -0.5, marginBottom: 2 }}>
            {allTimeData.timeSeriesData.length}
          </Text>
          <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
            Total Workouts
          </Text>
        </View>
      </View>
    </View>
  )
}

