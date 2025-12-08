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
import { BarChart } from "react-native-gifted-charts"
import { useThemedColors } from '../../hooks/useThemedColors'
import { getExerciseDetailedAnalytics } from "../../lib/database"
import TrendInfoModal from "./TrendInfoModal"
import ExerciseMetricCard from "./ExerciseMetricCard"
import TrendCard from "./TrendCard"
import AllTimeStatsSection from "./AllTimeStatsSection"

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')

export default function ExerciseDetailModal({ visible, onClose, exerciseName, userId, initialTimeframe = 30 }) {
  const colors = useThemedColors();
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialTimeframe)
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

  // Sync with initialTimeframe when modal opens or when it changes
  useEffect(() => {
    if (visible && initialTimeframe !== undefined) {
      // Convert 36500 (All from ProgressiveOverloadInsights) to null (All in this modal)
      const convertedTimeframe = initialTimeframe === 36500 ? null : initialTimeframe
      setSelectedTimeframe(convertedTimeframe)
    }
  }, [visible, initialTimeframe])

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
      return []
    }

    const data = analyticsData.timeSeriesData
    
    // Calculate max values for normalization
    const maxWeight = Math.max(...data.map(d => d.avgWeight))
    const maxReps = Math.max(...data.map(d => d.avgReps))
    const maxSets = Math.max(...data.map(d => d.totalSets))
    
    // Format data with stacked bars approach for better visualization
    const barData = data.map((item, index) => {
      const date = new Date(item.date)
      const formattedDate = date.toLocaleDateString("en", { month: "short", day: "numeric" })
      
      return {
        value: item.avgWeight,
        label: formattedDate,
        labelTextStyle: { 
          color: colors.text.tertiary, 
          fontSize: 9,
          fontWeight: '500',
        },
        frontColor: colors.primary[600],
        gradientColor: colors.primary[400],
        spacing: 4,
        labelWidth: 50,
        topLabelComponent: () => (
          <Text style={{ 
            fontSize: 9, 
            color: colors.text.secondary, 
            fontWeight: '600',
            marginBottom: 2 
          }}>
            {item.avgWeight.toFixed(1)}
          </Text>
        ),
        // Add metadata for tooltip
        metadata: {
          weight: item.avgWeight,
          reps: item.avgReps,
          sets: item.totalSets,
          date: formattedDate
        }
      }
    })

    return barData
  }

  const formatSecondaryData = (type) => {
    if (!analyticsData || !analyticsData.timeSeriesData || analyticsData.timeSeriesData.length === 0) {
      return []
    }

    const data = analyticsData.timeSeriesData
    
    return data.map((item) => ({
      value: type === 'reps' ? item.avgReps : item.totalSets,
      frontColor: type === 'reps' ? colors.status.info : colors.status.warning,
      gradientColor: type === 'reps' ? colors.status.info + 'CC' : colors.status.warning + 'CC',
      topLabelComponent: () => (
        <Text style={{ 
          fontSize: 9, 
          color: colors.text.secondary, 
          fontWeight: '600',
          marginBottom: 2 
        }}>
          {type === 'reps' ? item.avgReps.toFixed(0) : item.totalSets.toString()}
        </Text>
      ),
    }))
  }

  const chartData = formatChartData()
  const repsData = formatSecondaryData('reps')
  const setsData = formatSecondaryData('sets')

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          style={{ flex: 1 }}
        />
        <View 
          style={{ 
            backgroundColor: colors.background.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
            maxHeight: screenHeight * 0.9, 
            minHeight: screenHeight * 0.75 
          }}
        >
          {/* Drag Handle */}
          <View style={{ width: 48, height: 4, backgroundColor: colors.border.light, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 16 }} />

          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: 20, 
                  alignItems: "center", 
                  justifyContent: "center", 
                  marginRight: 12,
                  backgroundColor: colors.primary[50] 
                }}
              >
                <Dumbbell size={20} color={colors.primary[600]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }} numberOfLines={1}>
                  {exerciseName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                  Detailed Analytics
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={loadAnalytics}
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 16, 
                  alignItems: "center", 
                  justifyContent: "center",
                  backgroundColor: colors.primary[100] 
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "500", color: colors.primary[600] }}>
                  ↻
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: 16, 
                  alignItems: "center", 
                  justifyContent: "center",
                  backgroundColor: colors.background.primary 
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: "500", color: colors.text.tertiary }}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Timeframe Selector */}
          <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
            <View 
              style={{ 
                flexDirection: "row", 
                backgroundColor: colors.background.primary, 
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
                      ? colors.primary[500] 
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
                        : colors.text.tertiary,
                    }}
                  >
                    {timeframe.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text style={{ marginTop: 16, color: colors.text.secondary }}>
                Loading analytics...
              </Text>
            </View>
          ) : !analyticsData || analyticsData.timeSeriesData.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 }}>
              <View
                style={{ 
                  width: 64, 
                  height: 64, 
                  borderRadius: 32, 
                  alignItems: "center", 
                  justifyContent: "center", 
                  marginBottom: 16,
                  backgroundColor: colors.background.primary 
                }}
              >
                <Ionicons name="bar-chart-outline" size={32} color={colors.icon.secondary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "600", color: colors.text.primary }}>
                No Data Available
              </Text>
              <Text style={{ fontSize: 14, marginTop: 8, color: colors.text.secondary }}>
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
              {chartData.length > 0 && (
                <View style={{ marginBottom: 20 }}>
                  <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text.primary }}>
                      Progression Over Time
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>
                      Swipe to see all data points
                    </Text>
                  </View>
                  
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                  >
                    <View 
                      style={{ 
                        backgroundColor: colors.background.primary, 
                        borderRadius: 12, 
                        padding: 16,
                        paddingTop: 20,
                        paddingBottom: 20
                      }}
                    >
                      {/* Chart Legend */}
                      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
                        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20, marginBottom: 4 }}>
                          <View style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: 4, 
                            backgroundColor: colors.primary[600], 
                            marginRight: 8,
                            shadowColor: colors.primary[600],
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 3,
                            elevation: 3
                          }} />
                          <Text style={{ fontSize: 13, color: colors.text.secondary, fontWeight: '600' }}>Weight (kg)</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 20, marginBottom: 4 }}>
                          <View style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: 4, 
                            backgroundColor: colors.status.info, 
                            marginRight: 8,
                            shadowColor: colors.status.info,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 3,
                            elevation: 3
                          }} />
                          <Text style={{ fontSize: 13, color: colors.text.secondary, fontWeight: '600' }}>Reps</Text>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                          <View style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: 4, 
                            backgroundColor: colors.status.warning, 
                            marginRight: 8,
                            shadowColor: colors.status.warning,
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.3,
                            shadowRadius: 3,
                            elevation: 3
                          }} />
                          <Text style={{ fontSize: 13, color: colors.text.secondary, fontWeight: '600' }}>Sets</Text>
                        </View>
                      </View>

                      {/* Weight Chart */}
                      <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12, marginLeft: 4 }}>
                          Weight Progression
                        </Text>
                        <BarChart
                          data={chartData}
                          width={Math.max(screenWidth - 80, chartData.length * 60)}
                          height={180}
                          barWidth={22}
                          initialSpacing={15}
                          spacing={chartData.length > 5 ? 35 : 45}
                          barBorderRadius={6}
                          showGradient
                          gradientColor={colors.primary[400]}
                          yAxisThickness={1}
                          xAxisThickness={1}
                          xAxisColor={colors.border.medium}
                          yAxisColor={colors.border.medium}
                          yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}
                          xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500', textAlign: 'center' }}
                          yAxisLabelWidth={40}
                          noOfSections={5}
                          isAnimated
                          animationDuration={1000}
                          cappedBars
                          capColor={colors.primary[700]}
                          capThickness={3}
                          capRadius={3}
                          showValuesAsTopLabel
                          topLabelContainerStyle={{ marginBottom: 6 }}
                          rulesColor={colors.border.light}
                          rulesType="solid"
                          dashGap={0}
                        />
                      </View>

                      {/* Reps Chart */}
                      <View style={{ marginBottom: 24 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12, marginLeft: 4 }}>
                          Reps Progression
                        </Text>
                        <BarChart
                          data={repsData.map((item, index) => ({
                            ...item,
                            label: chartData[index]?.label || ''
                          }))}
                          width={Math.max(screenWidth - 80, chartData.length * 60)}
                          height={180}
                          barWidth={22}
                          initialSpacing={15}
                          spacing={chartData.length > 5 ? 35 : 45}
                          barBorderRadius={6}
                          showGradient
                          gradientColor={colors.status.info + 'CC'}
                          yAxisThickness={1}
                          xAxisThickness={1}
                          xAxisColor={colors.border.medium}
                          yAxisColor={colors.border.medium}
                          yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}
                          xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500', textAlign: 'center' }}
                          yAxisLabelWidth={40}
                          noOfSections={5}
                          isAnimated
                          animationDuration={1000}
                          cappedBars
                          capColor={colors.status.info}
                          capThickness={3}
                          capRadius={3}
                          showValuesAsTopLabel
                          topLabelContainerStyle={{ marginBottom: 6 }}
                          rulesColor={colors.border.light}
                          rulesType="solid"
                          dashGap={0}
                        />
                      </View>

                      {/* Sets Chart */}
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12, marginLeft: 4 }}>
                          Sets Progression
                        </Text>
                        <BarChart
                          data={setsData.map((item, index) => ({
                            ...item,
                            label: chartData[index]?.label || ''
                          }))}
                          width={Math.max(screenWidth - 80, chartData.length * 60)}
                          height={180}
                          barWidth={22}
                          initialSpacing={15}
                          spacing={chartData.length > 5 ? 35 : 45}
                          barBorderRadius={6}
                          showGradient
                          gradientColor={colors.status.warning + 'CC'}
                          yAxisThickness={1}
                          xAxisThickness={1}
                          xAxisColor={colors.border.medium}
                          yAxisColor={colors.border.medium}
                          yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 11, fontWeight: '500' }}
                          xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500', textAlign: 'center' }}
                          yAxisLabelWidth={40}
                          noOfSections={5}
                          isAnimated
                          animationDuration={1000}
                          cappedBars
                          capColor={colors.status.warning}
                          capThickness={3}
                          capRadius={3}
                          showValuesAsTopLabel
                          topLabelContainerStyle={{ marginBottom: 6 }}
                          rulesColor={colors.border.light}
                          rulesType="solid"
                          dashGap={0}
                        />
                      </View>
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Trend Insights */}
              <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text.primary }}>
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
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.primary }}>
                          Consistency
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
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

