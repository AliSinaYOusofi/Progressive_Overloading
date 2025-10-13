import React, { useState, useEffect } from "react"
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator 
} from "react-native"
import { Dumbbell, Calendar } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-gifted-charts"
import { colors } from '../../constants/ui_colors'
import { getExerciseDetailedAnalytics } from "../../lib/database"
import TrendInfoModal from "./TrendInfoModal"
import ExerciseMetricCard from "./ExerciseMetricCard"
import TrendCard from "./TrendCard"
import AllTimeStatsSection from "./AllTimeStatsSection"

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')

export default function ExerciseDetailModal({ visible, onClose, exerciseName, userId }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(30)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [allTimeData, setAllTimeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [showTrendInfoModal, setShowTrendInfoModal] = useState(false)

  const timeframes = [
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
    { label: "All", value: null },
  ]

  useEffect(() => {
    if (visible && exerciseName && userId) {
      loadAnalytics()
    }
  }, [visible, exerciseName, userId, selectedTimeframe])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load data for selected timeframe
      const data = await getExerciseDetailedAnalytics(userId, exerciseName, selectedTimeframe)
      setAnalyticsData(data)

      // Load all-time stats if not already loaded
      if (!allTimeData && selectedTimeframe !== null) {
        const allTime = await getExerciseDetailedAnalytics(userId, exerciseName, null)
        setAllTimeData(allTime)
      } else if (selectedTimeframe === null) {
        setAllTimeData(data)
      }
    } catch (error) {
      console.error("Error loading exercise analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatChartData = () => {
    if (!analyticsData || !analyticsData.timeSeriesData || analyticsData.timeSeriesData.length === 0) {
      return { weightData: [], repsData: [], setsData: [] }
    }

    const data = analyticsData.timeSeriesData

    // Prepare data for line chart
    const weightData = data.map((item, index) => ({
      value: item.avgWeight,
      label: index % Math.ceil(data.length / 5) === 0 
        ? new Date(item.date).toLocaleDateString("en", { month: "short", day: "numeric" })
        : "",
      dataPointText: item.avgWeight.toFixed(1),
    }))

    const repsData = data.map((item) => ({
      value: item.avgReps,
      dataPointText: item.avgReps.toFixed(0),
    }))

    const setsData = data.map((item) => ({
      value: item.totalSets,
      dataPointText: item.totalSets.toString(),
    }))

    return { weightData, repsData, setsData }
  }

  const { weightData, repsData, setsData } = formatChartData()

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          className="flex-1"
        />
        <View 
          className="bg-white rounded-t-3xl shadow-2xl"
          style={{ maxHeight: screenHeight * 0.9, minHeight: screenHeight * 0.75 }}
        >
          {/* Drag Handle */}
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mt-3 mb-4" />

          {/* Header */}
          <View className="flex-row justify-between items-center px-6 mb-4">
            <View className="flex-row items-center flex-1">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary[50] }}
              >
                <Dumbbell size={20} color={colors.primary[600]} />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold" style={{ color: colors.neutral[900] }} numberOfLines={1}>
                  {exerciseName}
                </Text>
                <Text className="text-xs" style={{ color: colors.neutral[500] }}>
                  Detailed Analytics
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.neutral[100] }}
            >
              <Text className="text-xl font-medium" style={{ color: colors.neutral[500] }}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          {/* Timeframe Selector */}
          <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <View 
              style={{ 
                flexDirection: "row", 
                backgroundColor: colors.neutral[100], 
                borderRadius: 12, 
                padding: 4 
              }}
            >
              {timeframes.map((timeframe) => (
                <TouchableOpacity
                  key={timeframe.label}
                  onPress={() => setSelectedTimeframe(timeframe.value)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: selectedTimeframe === timeframe.value 
                      ? colors.primary[600] 
                      : "transparent",
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "600",
                      fontSize: 14,
                      color: selectedTimeframe === timeframe.value 
                        ? colors.text.white 
                        : colors.neutral[600],
                    }}
                  >
                    {timeframe.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text className="mt-4" style={{ color: colors.neutral[600] }}>
                Loading analytics...
              </Text>
            </View>
          ) : !analyticsData || analyticsData.timeSeriesData.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.neutral[100] }}
              >
                <Ionicons name="bar-chart-outline" size={32} color={colors.neutral[400]} />
              </View>
              <Text className="text-lg font-semibold" style={{ color: colors.neutral[700] }}>
                No Data Available
              </Text>
              <Text className="text-sm mt-2" style={{ color: colors.neutral[500] }}>
                No data for selected timeframe
              </Text>
            </View>
          ) : (
            <ScrollView 
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 32 }}
            >
              {/* Key Metrics Cards */}
              <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                  <ExerciseMetricCard
                    icon="barbell"
                    iconColor={colors.primary[600]}
                    value={analyticsData.peakWeight.toFixed(1)}
                    label="Peak Weight (kg)"
                    backgroundColor={colors.primary[50]}
                  />
                  <ExerciseMetricCard
                    icon="repeat"
                    iconColor={colors.neutral[600]}
                    value={analyticsData.peakReps}
                    label="Peak Reps"
                    backgroundColor={colors.neutral[50]}
                  />
                  <ExerciseMetricCard
                    icon="stats-chart"
                    iconColor={colors.status.info}
                    value={analyticsData.totalVolume.toFixed(0)}
                    label="Total Volume (kg)"
                    backgroundColor={colors.status.infoLight}
                  />
                  <ExerciseMetricCard
                    icon="layers"
                    iconColor={colors.status.warning}
                    value={analyticsData.avgSetsPerWorkout.toFixed(1)}
                    label="Avg Sets/Workout"
                    backgroundColor={colors.status.warningLight}
                  />
                </View>
              </View>

              {/* Multi-Metric Chart */}
              {weightData.length > 0 && (
                <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 12, color: colors.neutral[900] }}>
                    Progression Over Time
                  </Text>
                  <View 
                    style={{ 
                      backgroundColor: colors.neutral[50], 
                      borderRadius: 12, 
                      padding: 16,
                      paddingTop: 20
                    }}
                  >
                    {/* Chart Legend */}
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 4 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary[600], marginRight: 6 }} />
                        <Text style={{ fontSize: 12, color: colors.neutral[600] }}>Weight</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 4 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.info, marginRight: 6 }} />
                        <Text style={{ fontSize: 12, color: colors.neutral[600] }}>Reps</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.warning, marginRight: 6 }} />
                        <Text style={{ fontSize: 12, color: colors.neutral[600] }}>Sets</Text>
                      </View>
                    </View>

                    <LineChart
                      data={weightData}
                      data2={repsData}
                      data3={setsData}
                      width={screenWidth - 100}
                      height={200}
                      spacing={Math.max(40, (screenWidth - 100) / Math.min(weightData.length, 10))}
                      initialSpacing={10}
                      color1={colors.primary[600]}
                      color2={colors.status.info}
                      color3={colors.status.warning}
                      thickness={3}
                      startFillColor1={colors.primary[100]}
                      startFillColor2={colors.status.infoLight}
                      startFillColor3={colors.status.warningLight}
                      endFillColor1={colors.primary[50]}
                      endFillColor2={colors.background.card}
                      endFillColor3={colors.background.card}
                      startOpacity={0.4}
                      endOpacity={0.1}
                      areaChart
                      curved
                      hideRules
                      hideDataPoints={false}
                      dataPointsColor1={colors.primary[700]}
                      dataPointsColor2={colors.status.info}
                      dataPointsColor3={colors.status.warning}
                      dataPointsRadius={4}
                      yAxisColor={colors.border.medium}
                      xAxisColor={colors.border.medium}
                      yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10 }}
                      xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10 }}
                      noOfSections={4}
                      maxValue={Math.max(...weightData.map(d => d.value), ...repsData.map(d => d.value), ...setsData.map(d => d.value)) * 1.2}
                    />
                  </View>
                </View>
              )}

              {/* Trend Insights */}
              <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.neutral[900] }}>
                    Performance Trends
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTrendInfoModal(true)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: colors.primary[100],
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Ionicons name="information" size={16} color={colors.primary[600]} />
                  </TouchableOpacity>
                </View>
                
                <TrendCard
                  label="Weight"
                  trend={analyticsData.weightTrend}
                  trendPercent={analyticsData.weightTrendPercent}
                />
                
                <TrendCard
                  label="Reps"
                  trend={analyticsData.repsTrend}
                  trendPercent={analyticsData.repsTrendPercent}
                />
                
                <TrendCard
                  label="Sets"
                  trend={analyticsData.setsTrend}
                  trendPercent={analyticsData.setsTrendPercent}
                />

                {/* Consistency */}
                <View 
                  style={{ 
                    backgroundColor: colors.primary[50],
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.primary[200]
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
                        <Calendar size={16} color={colors.primary[600]} />
                      </View>
                      <View className="flex-1">
                        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.neutral[900] }}>
                          Consistency
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.neutral[600], marginTop: 2 }}>
                          Workouts per week
                        </Text>
                      </View>
                    </View>
                    <Text 
                      style={{ 
                        fontSize: 24, 
                        fontWeight: "bold", 
                        color: colors.primary[600] 
                      }}
                    >
                      {analyticsData.workoutsPerWeek.toFixed(1)}x
                    </Text>
                  </View>
                </View>
              </View>

              {/* All-Time Stats */}
              <AllTimeStatsSection
                allTimeData={allTimeData}
                analyticsData={analyticsData}
                selectedTimeframe={selectedTimeframe}
              />
            </ScrollView>
          )}
        </View>
      </View>

      {/* Trend Info Modal */}
      <TrendInfoModal
        visible={showTrendInfoModal}
        onClose={() => setShowTrendInfoModal(false)}
      />
    </Modal>
  )
}

