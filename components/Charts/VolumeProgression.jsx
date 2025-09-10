import { View, Text, Dimensions, TouchableOpacity } from "react-native"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { BarChart, PieChart } from "react-native-gifted-charts"
import { colors } from "../../constants/ui_colors"
import VolumeCalculationInfoModal from "./VolumeCalculationInfoModal"

const { width: screenWidth } = Dimensions.get("window")

export default function VolumeProgression({ volumeProgression }) {
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [chartType, setChartType] = useState('pie') // 'bar' | 'pie'

  // Helper function to format volume data for BarChart
  const formatVolumeDataForChart = (volumeData) => {
    if (!volumeData || volumeData.length === 0) return []

    return volumeData.slice(-14).map((day, index) => ({
      value: day.totalVolume,
      label: index % 2 === 0 ? new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "",
      frontColor: colors.primary[600],
      labelTextStyle: { color: colors.text.tertiary, fontSize: 10 },
    }))
  }

  // Helper for PieChart (distribution of volume over the last 14 days)
  const formatVolumeDataForPie = (volumeData) => {
    if (!volumeData || volumeData.length === 0) return []

    const recent = volumeData.slice(-14)
    const total = recent.reduce((sum, d) => sum + (d?.totalVolume || 0), 0)
    if (total <= 0) return []

    // Show only days with non-zero volume and cap slices to keep readability
    const slices = recent
      .map((day) => ({
        value: day?.totalVolume || 0,
        label: new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
      }))
      .filter((s) => s.value > 0)

    // Assign colors with slight variations
    const base = colors.primary[600]
    const alt = colors.primary[500]
    return slices.map((s, idx) => ({
      value: s.value,
      color: idx % 2 === 0 ? base : alt,
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
    <View style={{ marginBottom: 32 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="bar-chart" size={24} color={colors.primary[600]} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 20, fontWeight: "600", color: colors.text.primary }}>Volume Progression</Text>
          <TouchableOpacity
            onPress={() => setShowInfoModal(true)}
            style={{
              marginLeft: 8,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.primary[100],
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Ionicons name="information-circle" size={16} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Chart type toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, backgroundColor: colors.neutral[100], borderRadius: 12 }}>
            <TouchableOpacity
              onPress={() => setChartType('bar')}
              style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: chartType === 'bar' ? colors.primary[100] : 'transparent' }}
            >
              <Ionicons name="bar-chart" size={16} color={chartType === 'bar' ? colors.primary[700] : colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setChartType('pie')}
              style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: chartType === 'pie' ? colors.primary[100] : 'transparent' }}
            >
              <Ionicons name="pie-chart" size={16} color={chartType === 'pie' ? colors.primary[700] : colors.text.secondary} />
            </TouchableOpacity>
          </View>
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
              {trend === "up" ? "Trending Up" : trend === "down" ? "Declining" : "Stable"}
            </Text>
          </View>
          )}
        </View>
      </View>

      <Text style={{ fontSize: 14, color: colors.text.secondary, marginBottom: 16 }}>
        Total weight lifted per day over the last 2 weeks
      </Text>

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
          {chartType === 'bar' ? (
            <View
              style={{
                height: 200,
                marginBottom: 20,
                backgroundColor: colors.neutral[50],
                borderRadius: 12,
                padding: 12,
              }}
            >
              <BarChart
                data={formatVolumeDataForChart(volumeProgression)}
                width={screenWidth - 140}
                height={176}
                barWidth={20}
                spacing={10}
                roundedTop
                roundedBottom
                hideRules={false}
                rulesType="solid"
                rulesColor={colors.border.light}
                yAxisColor={colors.border.medium}
                xAxisColor={colors.border.medium}
                yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10 }}
                showVerticalLines={false}
                showHorizontalLines={true}
                noOfSections={4}
                maxValue={Math.max(...volumeProgression.map((d) => d?.totalVolume || 0)) * 1.1}
                showYAxisIndices={true}
                yAxisIndicesColor={colors.border.light}
                yAxisIndicesWidth={1}
                yAxisSide="left"
                xAxisSide="bottom"
              />
            </View>
          ) : (
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
          )}

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
