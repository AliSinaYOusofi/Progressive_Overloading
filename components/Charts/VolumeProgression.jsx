import { View, Text, TouchableOpacity } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { PieChart } from "react-native-gifted-charts"
import { colors } from "../../constants/ui_colors"
import VolumeCalculationInfoModal from "./VolumeCalculationInfoModal"

export default function VolumeProgression({ volumeProgression }) {
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Helper for PieChart (distribution of volume over the last 14 days)
  const formatVolumeDataForPie = (volumeData) => {
    if (!volumeData || volumeData.length === 0) return []

    const recent = volumeData.slice(-14)
    const total = recent.reduce((sum, d) => sum + (d?.totalVolume || 0), 0)
    if (total <= 0) return []

    // Show only days with non-zero volume and cap slices to keep readability
    const slices = recent
      .filter((day) => day && day.date) // Filter out invalid entries
      .map((day) => ({
        value: day?.totalVolume || 0,
        label: new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      }))
      .filter((s) => s.value > 0)

    // Assign distinct colors for better visibility
    const colorPalette = [
      '#10b981', // emerald-500
      '#3b82f6', // blue-500
      '#8b5cf6', // violet-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#06b6d4', // cyan-500
      '#ec4899', // pink-500
      '#84cc16', // lime-500
      '#f97316', // orange-500
      '#6366f1', // indigo-500
      '#14b8a6', // teal-500
      '#a855f7', // purple-500
      '#22c55e', // green-500
      '#0ea5e9', // sky-500
    ]
    
    return slices.map((s, idx) => ({
      value: s.value,
      color: colorPalette[idx % colorPalette.length],
      text: Math.round((s.value / total) * 100) + '%',
      textColor: colors.text.white,
      textSize: 10,
      label: s.label,
    }))
  }

  const calculateTrend = () => {
    if (!volumeProgression || volumeProgression.length < 2) return null
    const recent = volumeProgression.slice(-7)
    const previous = volumeProgression.slice(-14, -7)
    if (recent.length === 0 || previous.length === 0) return null

    const recentAvg = recent.reduce((sum, d) => sum + (d?.totalVolume || 0), 0) / recent.length
    const previousAvg = previous.reduce((sum, d) => sum + (d?.totalVolume || 0), 0) / previous.length

    return recentAvg > previousAvg ? "up" : recentAvg < previousAvg ? "down" : "stable"
  }

  const trend = calculateTrend()

  return (
    <View>
      {/* Controls Row */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        {/* Info Button */}
        <TouchableOpacity
          onPress={() => setShowInfoModal(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: colors.primary[100],
          }}
        >
          <Ionicons name="information-circle" size={16} color={colors.primary[600]} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary[700] }}>How it's calculated</Text>
        </TouchableOpacity>

        {trend && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor:
                trend === "up"
                  ? colors.status.successLight
                  : trend === "down"
                    ? colors.status.errorLight
                    : colors.neutral[100],
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Ionicons
              name={trend === "up" ? "trending-up" : trend === "down" ? "trending-down" : "remove"}
              size={14}
              color={
                trend === "up" ? colors.status.success : trend === "down" ? colors.status.error : colors.text.tertiary
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color:
                  trend === "up"
                    ? colors.status.success
                    : trend === "down"
                      ? colors.status.error
                      : colors.text.tertiary,
              }}
            >
              {trend === "up" ? "Up" : trend === "down" ? "Down" : "Stable"}
            </Text>
          </View>
        )}
      </View>

      {volumeProgression && volumeProgression.length > 0 ? (
        <View
          style={{
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 20,
            shadowColor: colors.shadow.light,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              height: 220,
              marginBottom: 20,
              backgroundColor: colors.neutral[50],
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PieChart
              data={formatVolumeDataForPie(volumeProgression)}
              radius={80}
              innerRadius={40}
              showText
              textColor={colors.text.white}
              textSize={10}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary }}>
                    {volumeProgression.slice(-14).reduce((s, d) => s + (d?.totalVolume || 0), 0).toFixed(0)}
                  </Text>
                  <Text style={{ fontSize: 10, color: colors.text.tertiary }}>Last 14d</Text>
                </View>
              )}
            />
            {/* Legend */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12, paddingHorizontal: 8 }}>
              {formatVolumeDataForPie(volumeProgression).slice(0,6).map((s, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 6, marginVertical: 4 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color, marginRight: 6 }} />
                  <Text style={{ fontSize: 10, color: colors.text.secondary }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View
              style={{
                alignItems: "center",
                flex: 1,
                backgroundColor: colors.primary[50],
                padding: 16,
                borderRadius: 12,
                marginRight: 8,
              }}
            >
              <Ionicons name="trending-up" size={20} color={colors.primary[600]} style={{ marginBottom: 4 }} />
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                {Math.max(...volumeProgression.map((d) => d?.totalVolume || 0)).toFixed(0)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text.tertiary, textAlign: "center", marginTop: 2 }}>
                Peak Volume
              </Text>
            </View>

            <View
              style={{
                alignItems: "center",
                flex: 1,
                backgroundColor: colors.neutral[100],
                padding: 16,
                borderRadius: 12,
                marginLeft: 8,
              }}
            >
              <Ionicons name="analytics" size={20} color={colors.text.secondary} style={{ marginBottom: 4 }} />
              <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                {(
                  volumeProgression.reduce((sum, d) => sum + (d?.totalVolume || 0), 0) / volumeProgression.length
                ).toFixed(0)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text.tertiary, textAlign: "center", marginTop: 2 }}>
                Daily Average
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 32,
            alignItems: "center",
            shadowColor: colors.shadow.light,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              backgroundColor: colors.neutral[100],
              borderRadius: 32,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Ionicons name="bar-chart-outline" size={48} color={colors.text.tertiary} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text.primary, marginBottom: 8 }}>
            No Volume Data Yet
          </Text>
          <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: "center", lineHeight: 20 }}>
            Start tracking your workouts to see your volume progression over time
          </Text>
        </View>
      )}

      {/* Volume Calculation Info Modal */}
      <VolumeCalculationInfoModal 
        visible={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </View>
  )
}
