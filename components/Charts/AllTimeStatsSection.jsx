import React from "react"
import { View, Text } from "react-native"
import { Target } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from '../../constants/ui_colors'

export default function AllTimeStatsSection({ 
  allTimeData, 
  analyticsData, 
  selectedTimeframe 
}) {
  if (!allTimeData) return null

  return (
    <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
        <Target size={20} color={colors.primary[600]} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.neutral[900] }}>
          {selectedTimeframe === null ? "Lifetime Performance" : "All-Time Records"}
        </Text>
      </View>
      
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {/* All-Time Peak Weight */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: "linear-gradient(135deg, " + colors.primary[600] + " 0%, " + colors.primary[700] + " 100%)",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.primary[300]
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Ionicons name="trophy" size={20} color={colors.primary[600]} />
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
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.neutral[900], marginBottom: 2 }}>
            {allTimeData.peakWeight.toFixed(1)} kg
          </Text>
          <Text style={{ fontSize: 11, color: colors.neutral[600] }}>
            Peak Weight Ever
          </Text>
        </View>

        {/* All-Time Peak Reps */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: colors.status.successLight,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.status.success + "40"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <Ionicons name="flame" size={20} color={colors.status.success} />
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
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.neutral[900], marginBottom: 2 }}>
            {allTimeData.peakReps}
          </Text>
          <Text style={{ fontSize: 11, color: colors.neutral[600] }}>
            Peak Reps Ever
          </Text>
        </View>

        {/* All-Time Total Volume */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: colors.status.infoLight,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.status.info + "40"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="analytics" size={20} color={colors.status.info} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.neutral[900], marginBottom: 2 }}>
            {(allTimeData.totalVolume / 1000).toFixed(1)}t
          </Text>
          <Text style={{ fontSize: 11, color: colors.neutral[600] }}>
            Lifetime Volume
          </Text>
        </View>

        {/* All-Time Total Workouts */}
        <View 
          style={{ 
            flex: 1, 
            minWidth: "45%",
            backgroundColor: colors.status.warningLight,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.status.warning + "40"
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Ionicons name="calendar" size={20} color={colors.status.warning} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.neutral[900], marginBottom: 2 }}>
            {allTimeData.timeSeriesData.length}
          </Text>
          <Text style={{ fontSize: 11, color: colors.neutral[600] }}>
            Total Workouts
          </Text>
        </View>
      </View>
    </View>
  )
}

