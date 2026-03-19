import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Dimensions,
  ActivityIndicator
} from "react-native"
import { Dumbbell, Calendar } from "lucide-react-native"
import { Ionicons } from "@expo/vector-icons"
import { BarChart, LineChart } from "react-native-gifted-charts"
import { useThemedColors } from '../../hooks/useThemedColors'
import { useTheme } from '../../contexts/ThemeContext'
import { getExerciseDetailedAnalytics } from "../../lib/database"
import TrendInfoModal from "./TrendInfoModal"
import ExerciseMetricCard from "./ExerciseMetricCard"
import TrendCard from "./TrendCard"
import AllTimeStatsSection from "./AllTimeStatsSection"
import { MODAL_LAYOUT } from "../../constants/modal"
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { formatShortNumber } from "../../utils/numberUtils"

const { height: screenHeight, width: screenWidth } = Dimensions.get('window')

// Helper to remove floating point noise (e.g. 13.200000000000001) at a given precision
const normalizeNumber = (num, decimals = 1) => {
    const n = Number(num);
    if (!Number.isFinite(n)) return 0;
    return Number(n.toFixed(decimals));
};

export default function ExerciseDetailModal({ visible, onClose, exerciseName, userId, initialTimeframe = 30 }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const [selectedTimeframe, setSelectedTimeframe] = useState(initialTimeframe)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [allTimeData, setAllTimeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [showTrendInfoModal, setShowTrendInfoModal] = useState(false)
  
  // Gesture handling for swipe-to-close
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

  // Define close function in RN Runtime scope (required for scheduleOnRN)
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward swipes (positive translationY)
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SWIPE_THRESHOLD) {
        // Swipe exceeded threshold, animate out then close modal
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
          'worklet';
          scheduleOnRN(handleClose);
        });
      } else {
        // Snap back to original position
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Animated style for drag handle that changes color when swiping
  const dragHandleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateY.value,
      [0, 50, 100],
      [colors.border.light, colors.primary[400], colors.primary[600]]
    );
    return {
      backgroundColor,
    };
  });

  // Reset translateY when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

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
      
      // Clean up any floating point noise so gifted-charts doesn't render long decimals in the top label
      const cleanWeight = normalizeNumber(item.avgWeight, 1);
      
      return {
        value: cleanWeight,
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
            color: isDarkMode ? colors.text.white : colors.text.primary, 
            fontWeight: '600',
            marginBottom: 2 
          }}>
            {cleanWeight.toFixed(1)}
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
    
    return data.map((item) => {
      // Clean up any floating point noise so gifted-charts doesn't render long decimals in the top label
      const cleanValue = type === 'reps' 
        ? normalizeNumber(item.avgReps, 0)  // Reps should be integers
        : normalizeNumber(item.totalSets, 0); // Sets should be integers
      
      return {
        value: cleanValue,
        frontColor: type === 'reps' ? colors.status.info : colors.status.warning,
        gradientColor: type === 'reps' ? colors.status.info + 'CC' : colors.status.warning + 'CC',
        topLabelComponent: () => (
          <Text style={{ 
            fontSize: 9, 
            color: isDarkMode ? colors.text.white : colors.text.primary, 
            fontWeight: '600',
            marginBottom: 2 
          }}>
            {type === 'reps' ? cleanValue.toFixed(0) : cleanValue.toString()}
          </Text>
        ),
      };
    })
  }

  const chartData = formatChartData()
  const repsData = formatSecondaryData('reps')
  const setsData = formatSecondaryData('sets')

  // Format data for weight line chart
  const formatWeightLineChartData = () => {
    if (!analyticsData || !analyticsData.timeSeriesData || analyticsData.timeSeriesData.length === 0) {
      return []
    }

    const data = analyticsData.timeSeriesData
    
    return data.map((item) => {
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
        dataPointText: item.avgWeight.toFixed(1), // Show all weight values
        textColor: isDarkMode ? colors.text.white : colors.text.primary,
        textFontSize: 9,
        textShiftY: -10,
        textShiftX: -5,
      }
    })
  }

  const weightLineChartData = formatWeightLineChartData()
  
  // Calculate min and max for y-axis with padding (extra top padding for data point labels)
  const weightLineChartMinMax = useMemo(() => {
    if (!analyticsData || !analyticsData.timeSeriesData || analyticsData.timeSeriesData.length === 0) {
      return { min: 0, max: 100 }
    }
    
    const weights = analyticsData.timeSeriesData.map(d => d.avgWeight)
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const range = maxWeight - minWeight
    const bottomPadding = range * 0.1 || 5 // 10% padding or 5kg minimum
    const topPadding = range * 0.4 || 30 // 40% top padding for labels or 30kg minimum
    
    return {
      min: Math.max(0, minWeight - bottomPadding),
      max: maxWeight + topPadding
    }
  }, [analyticsData])

  // Calculate chart width and spacing (same approach as ProgressiveOverloadChart)
  const chartWidth = useMemo(() => {
    const containerPadding = 16;
    const screenMargins = 48; // Approximate padding from parent ScrollView
    const availableWidth = screenWidth - (screenMargins * 2) - (containerPadding * 2);
    return availableWidth;
  }, []);

  const initialSpacing = 20;
  const endSpacing = 20;
  const chartSpacing = 48;

  // Calculate numeric trend values (actual change, not just percentage)
  const trendValues = useMemo(() => {
    if (!analyticsData || !analyticsData.timeSeriesData || analyticsData.timeSeriesData.length < 2) {
      return { weight: 0, reps: 0, sets: 0 };
    }

    const timeSeriesData = analyticsData.timeSeriesData;
    const midPoint = Math.floor(timeSeriesData.length / 2);
    const firstHalf = timeSeriesData.slice(0, midPoint);
    const secondHalf = timeSeriesData.slice(midPoint);

    const firstHalfAvgWeight = firstHalf.reduce((sum, d) => sum + d.avgWeight, 0) / firstHalf.length;
    const secondHalfAvgWeight = secondHalf.reduce((sum, d) => sum + d.avgWeight, 0) / secondHalf.length;
    const weightChange = secondHalfAvgWeight - firstHalfAvgWeight;

    const firstHalfAvgReps = firstHalf.reduce((sum, d) => sum + d.avgReps, 0) / firstHalf.length;
    const secondHalfAvgReps = secondHalf.reduce((sum, d) => sum + d.avgReps, 0) / secondHalf.length;
    const repsChange = secondHalfAvgReps - firstHalfAvgReps;

    const firstHalfAvgSets = firstHalf.reduce((sum, d) => sum + d.totalSets, 0) / firstHalf.length;
    const secondHalfAvgSets = secondHalf.reduce((sum, d) => sum + d.totalSets, 0) / secondHalf.length;
    const setsChange = secondHalfAvgSets - firstHalfAvgSets;

    return {
      weight: weightChange,
      reps: repsChange,
      sets: setsChange
    };
  }, [analyticsData]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                {
                  backgroundColor: colors.background.card,
                  borderRadius: MODAL_LAYOUT.borderRadius,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: -8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 24,
                  elevation: 24,
                  maxHeight: screenHeight * 0.9,
                  minHeight: screenHeight * 0.75,
                  overflow: "hidden"
                },
                animatedStyle
              ]}
            >
              {/* Drag Handle */}
              <Animated.View style={[
                { 
                  width: 48, 
                  height: 4, 
                  borderRadius: 2, 
                  alignSelf: "center", 
                  marginTop: 12, 
                  marginBottom: 16 
                },
                dragHandleAnimatedStyle
              ]} />

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
                  backgroundColor: colors.background.secondary || colors.neutral[100]
                }}
              >
                <Dumbbell size={20} color={colors.icon?.primary || colors.primary[600]} />
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
                  backgroundColor: colors.background.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "500", color: colors.icon?.primary || colors.primary[600] }}>
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
                  backgroundColor: colors.background.primary,
                  borderWidth: 1,
                  borderColor: colors.border.light,
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
                    iconColor={colors.icon?.primary || colors.primary[600]}
                    value={analyticsData.peakWeight.toFixed(1)}
                    label="Peak Weight"
                  />
                  <ExerciseMetricCard
                    icon="repeat"
                    iconColor={colors.icon?.primary || colors.primary[600]}
                    value={analyticsData.peakReps}
                    label="Peak Reps"
                  />
                  <ExerciseMetricCard
                    icon="stats-chart"
                    iconColor={colors.icon?.primary || colors.primary[600]}
                    value={formatShortNumber(analyticsData.totalVolume)}
                    label="Total Volume (kg)"
                  />
                  <ExerciseMetricCard
                    icon="layers"
                    iconColor={colors.icon?.primary || colors.primary[600]}
                    value={analyticsData.avgSetsPerWorkout.toFixed(1)}
                    label="Avg Sets/Wk"
                  />
                </View>
              </View>

              {/* Weight Progression Line Chart */}
              {weightLineChartData.length > 1 && (
                <View style={{ marginBottom: 20, paddingHorizontal: 24 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text.primary }}>
                      Weight Progression
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 4 }}>
                      Weight progression from start to finish
                    </Text>
                  </View>
                  
                  <View style={{ 
                    backgroundColor: colors.background.primary, 
                    borderRadius: 12, 
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    overflow: 'hidden'
                  }}>
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                      <LineChart
                        data={weightLineChartData}
                        width={chartWidth}
                        height={200}
                        color={colors.primary[600]}
                        thickness={3}
                        dataPointsColor={colors.primary[600]}
                        dataPointsRadius={5}
                        hideDataPoints={false}
                        hideRules={false}
                        rulesType="solid"
                        rulesColor={colors.border.light}
                        yAxisColor={colors.border.light}
                        xAxisColor={colors.border.light}
                        yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                        xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: '500' }}
                        showVerticalLines={false}
                        showHorizontalLines={true}
                        spacing={chartSpacing}
                        initialSpacing={initialSpacing}
                        endSpacing={endSpacing}
                        maxValue={weightLineChartMinMax.max}
                        minValue={weightLineChartMinMax.min}
                        noOfSections={5}
                        yAxisSide="left"
                        xAxisSide="bottom"
                        curved={true}
                        areaChart={true}
                        startFillColor={colors.primary[600] + "40"}
                        endFillColor={colors.primary[600] + "10"}
                        startOpacity={0.4}
                        endOpacity={0.1}
                        yAxisThickness={1}
                        xAxisThickness={1}
                        yAxisLabelWidth={40}
                        textColor={isDarkMode ? colors.text.white : colors.text.primary}
                        textFontSize={9}
                        textShiftY={-10}
                        textShiftX={-5}
                        showTextOnDataPoints={true}
                        textBackgroundColor="transparent"
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* Multi-Metric Chart */}
              {chartData.length > 0 && (
                <View style={{ marginBottom: 20, paddingHorizontal: 24 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text.primary }}>
                      Progression Over Time
                    </Text>
                  </View>
                  
                  <View 
                    style={{ 
                      backgroundColor: colors.background.primary, 
                      borderRadius: 12, 
                      padding: 16,
                      paddingTop: 20,
                      paddingBottom: 20,
                      borderWidth: 1,
                      borderColor: colors.border.light,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Chart Legend */}
                    <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
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

                    {/* Reps Chart */}
                    <View style={{ marginBottom: 24 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12, marginLeft: 4 }}>
                        Reps Progression
                      </Text>
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart
                          data={repsData.map((item, index) => ({
                            ...item,
                            label: chartData[index]?.label || ''
                          }))}
                          width={chartWidth}
                          height={180}
                          barWidth={Math.max(12, Math.min(22, (chartWidth - 60) / chartData.length - 10))}
                          initialSpacing={15}
                          spacing={28}
                          barBorderRadius={6}
                          showGradient
                          gradientColor={colors.status.info + 'CC'}
                          yAxisThickness={1}
                          xAxisThickness={1}
                          xAxisColor={colors.border.medium}
                          yAxisColor={colors.border.medium}
                          yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                          xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 8, fontWeight: '500' }}
                          yAxisLabelWidth={35}
                          noOfSections={4}
                          cappedBars
                          capColor={colors.status.info}
                          capThickness={2}
                          capRadius={2}
                          rulesColor={colors.border.light}
                          rulesType="solid"
                          dashGap={0}
                        />
                      </View>
                    </View>

                    {/* Sets Chart */}
                    <View>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginBottom: 12, marginLeft: 4 }}>
                        Sets Progression
                      </Text>
                      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart
                          data={setsData.map((item, index) => ({
                            ...item,
                            label: chartData[index]?.label || ''
                          }))}
                          width={chartWidth}
                          height={180}
                          barWidth={Math.max(12, Math.min(22, (chartWidth - 60) / chartData.length - 10))}
                          initialSpacing={15}
                          spacing={28}
                          barBorderRadius={6}
                          showGradient
                          gradientColor={colors.status.warning + 'CC'}
                          yAxisThickness={1}
                          xAxisThickness={1}
                          xAxisColor={colors.border.medium}
                          yAxisColor={colors.border.medium}
                          yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                          xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 8, fontWeight: '500' }}
                          yAxisLabelWidth={35}
                          noOfSections={4}
                          cappedBars
                          capColor={colors.status.warning}
                          capThickness={2}
                          capRadius={2}
                          rulesColor={colors.border.light}
                          rulesType="solid"
                          dashGap={0}
                        />
                      </View>
                    </View>
                  </View>
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
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.background.primary,
                      borderWidth: 1,
                      borderColor: colors.border.light,
                    }}
                  >
                    <Ionicons name="information-circle" size={18} color={colors.icon.primary || colors.primary[600]} />
                  </TouchableOpacity>
                </View>
                
                <TrendCard
                  label="Weight"
                  trend={analyticsData.weightTrend}
                  trendPercent={analyticsData.weightTrendPercent}
                  trendValue={trendValues.weight}
                  unit=" kg"
                />
                
                <TrendCard
                  label="Reps"
                  trend={analyticsData.repsTrend}
                  trendPercent={analyticsData.repsTrendPercent}
                  trendValue={trendValues.reps}
                  unit=" reps"
                />
                
                <TrendCard
                  label="Sets"
                  trend={analyticsData.setsTrend}
                  trendPercent={analyticsData.setsTrendPercent}
                  trendValue={trendValues.sets}
                  unit=" sets"
                />

                {/* Consistency */}
                <View 
                  style={{ 
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border.light
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: colors.background.secondary || colors.neutral[100],
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12
                        }}
                      >
                        <Calendar size={16} color={colors.icon?.primary || colors.primary[600]} />
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
                        fontWeight: "800", 
                        color: colors.text.primary,
                        letterSpacing: -0.5,
                      }}
                    >
                      {analyticsData.workoutsPerWeek.toFixed(1)}x
                    </Text>
                  </View>
                </View>
              </View>

              {/* Top Heaviest Lifts */}
              {analyticsData && analyticsData.topLifts && analyticsData.topLifts.length > 0 && (
                <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text.primary }}>
                      Top {analyticsData.topLifts.length} Heaviest Lift{analyticsData.topLifts.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  
                  <View style={{ gap: 12 }}>
                    {analyticsData.topLifts.map((lift, index) => {
                      const liftDate = new Date(lift.date);
                      const formattedDate = liftDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      
                      return (
                        <View
                          key={index}
                          style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          {/* Rank Badge */}
                          <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: colors.background.secondary || colors.neutral[100],
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                          }}>
                            <Text style={{
                              fontSize: 16,
                              fontWeight: "800",
                              color: colors.text.secondary,
                            }}>
                              {lift.rank}
                            </Text>
                          </View>
                          
                          {/* Lift Details */}
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 4 }}>
                              <Text style={{
                                fontSize: 24,
                                fontWeight: "800",
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                              }}>
                                {lift.weight.toFixed(1)}
                              </Text>
                              <Text style={{
                                fontSize: 14,
                                color: colors.text.tertiary,
                                marginLeft: 4,
                                fontWeight: "600",
                              }}>
                                kg
                              </Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                                {lift.reps} reps
                              </Text>
                              {lift.sets > 1 && (
                                <>
                                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>•</Text>
                                  <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                                    {lift.sets} sets
                                  </Text>
                                </>
                              )}
                              <Text style={{ fontSize: 12, color: colors.text.tertiary }}>•</Text>
                              <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                                {formattedDate}
                              </Text>
                            </View>
                          </View>
                          
                          {/* Volume Badge (optional) */}
                          <View style={{
                            backgroundColor: colors.background.secondary || colors.neutral[100],
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            paddingVertical: 6,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                          }}>
                            <Text style={{
                              fontSize: 11,
                              color: colors.text.tertiary,
                              fontWeight: "600",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              marginBottom: 2,
                            }}>
                              Volume
                            </Text>
                            <Text style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: colors.text.primary,
                            }}>
                              {formatShortNumber(lift.volume)}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* All-Time Stats */}
              <AllTimeStatsSection
                allTimeData={allTimeData}
                analyticsData={analyticsData}
                selectedTimeframe={selectedTimeframe}
              />
            </ScrollView>
          )}
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>

      {/* Trend Info Modal */}
      <TrendInfoModal
        visible={showTrendInfoModal}
        onClose={() => setShowTrendInfoModal(false)}
      />
    </Modal>
  )
}

