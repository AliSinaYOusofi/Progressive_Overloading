import React, { useState, useEffect, useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { Search, X, Filter, Activity, TrendingUp, TrendingDown, Minus, Target, Award, Zap } from "lucide-react-native";
import { LineChart } from "react-native-gifted-charts";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";
import RPEAnalysisFilterModal from "../../components/Charts/RPEAnalysisFilterModal";

const { width: screenWidth } = Dimensions.get('window');
const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

export default function TrainingIntensityScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
    
    // Use selective subscriptions from store - subscribe to entire nested object
    const user = useAppStore(state => state.user);
    const rpeAnalysisData = useAppStore(state => state.chartsData.rpeAnalysis);
    const loadRPEAnalysis = useAppStore(state => state.loadRPEAnalysis);
    
    // Extract timeframe-specific data using useMemo to avoid infinite loops
    const rawRpeAnalysis = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      // Convert object values to array if needed
      const data = rpeAnalysisData[timeframeValue] || [];
      return Array.isArray(data) ? data : Object.values(data);
    }, [rpeAnalysisData, selectedTimeframe]);

    // Filter and sort RPE analysis data
    const rpeAnalysis = useMemo(() => {
      let filtered = [...rawRpeAnalysis];

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(exercise => 
          exercise.exercise?.toLowerCase().includes(query)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'name':
            aValue = a.exercise?.toLowerCase() || '';
            bValue = b.exercise?.toLowerCase() || '';
            break;
          case 'avgRPE':
            aValue = a.avgRPE || 0;
            bValue = b.avgRPE || 0;
            break;
          case 'intensity':
            const intensityOrder = { 'high': 3, 'moderate': 2, 'low': 1 };
            aValue = intensityOrder[a.intensity] || 0;
            bValue = intensityOrder[b.intensity] || 0;
            break;
          case 'totalSets':
            aValue = a.totalSets || 0;
            bValue = b.totalSets || 0;
            break;
          default:
            return 0;
        }

        if (typeof aValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else {
          return sortOrder === 'asc' 
            ? aValue - bValue
            : bValue - aValue;
        }
      });

      return filtered;
    }, [rawRpeAnalysis, searchQuery, sortBy, sortOrder]);

    // Get visible exercises for pagination
    const visibleExercises = useMemo(() => {
      return rpeAnalysis.slice(0, visibleCount);
    }, [rpeAnalysis, visibleCount]);

    const hasMore = rpeAnalysis.length > visibleCount;
    const remainingCount = rpeAnalysis.length - visibleCount;

    // Calculate summary statistics
    const summaryStats = useMemo(() => {
        if (!rawRpeAnalysis || rawRpeAnalysis.length === 0) {
            return {
                overallAvgRPE: 0,
                totalExercises: 0,
                totalSets: 0,
                intensityBreakdown: { high: 0, moderate: 0, low: 0 },
                mostIntenseExercise: null,
                leastIntenseExercise: null,
            };
        }

        const allRPEValues = [];
        let totalSets = 0;
        const intensityBreakdown = { high: 0, moderate: 0, low: 0 };
        let mostIntense = null;
        let leastIntense = null;

        rawRpeAnalysis.forEach(exercise => {
            if (exercise.rpeTrend && exercise.rpeTrend.length > 0) {
                exercise.rpeTrend.forEach(point => {
                    if (point.rpe !== undefined && point.rpe !== null) {
                        allRPEValues.push(point.rpe);
                    }
                });
            }
            totalSets += exercise.totalSets || 0;
            
            // Count intensity breakdown
            if (exercise.intensity === 'high') intensityBreakdown.high++;
            else if (exercise.intensity === 'moderate') intensityBreakdown.moderate++;
            else if (exercise.intensity === 'low') intensityBreakdown.low++;
            
            // Find most/least intense
            if (!mostIntense || (exercise.avgRPE || 0) > (mostIntense.avgRPE || 0)) {
                mostIntense = exercise;
            }
            if (!leastIntense || (exercise.avgRPE || 0) < (leastIntense.avgRPE || 0)) {
                leastIntense = exercise;
            }
        });

        const overallAvgRPE = allRPEValues.length > 0
            ? allRPEValues.reduce((sum, rpe) => sum + rpe, 0) / allRPEValues.length
            : 0;

        return {
            overallAvgRPE,
            totalExercises: rawRpeAnalysis.length,
            totalSets,
            intensityBreakdown,
            mostIntenseExercise: mostIntense,
            leastIntenseExercise: leastIntense,
        };
    }, [rawRpeAnalysis]);

    // Reset visible count when filters change
    useEffect(() => {
      setVisibleCount(INITIAL_DISPLAY_COUNT);
    }, [searchQuery, sortBy, sortOrder, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            loadRPEAnalysis(selectedTimeframe);
        }
    }, [user, selectedTimeframe, loadRPEAnalysis]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        // Check cache first - don't force refresh
        loadRPEAnalysis(newTimeframe, false);
    };

    const handleCustomDateRange = (startDate, endDate) => {
        // Calculate days difference from start to end date
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        // Use daysDiff as the timeframe - this will calculate from today backwards
        // Note: This means custom ranges are relative to today, not absolute dates
        setSelectedTimeframe(daysDiff);
        loadRPEAnalysis(daysDiff, true);
    };

    const handleSortChange = (newSortBy, newSortOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    };

    const handleLoadMore = () => {
        if (hasMore) {
            setVisibleCount(prev => Math.min(prev + LOAD_MORE_COUNT, rpeAnalysis.length));
        }
    };

    const getIntensityColor = (intensity) => {
        switch (intensity) {
            case 'high': return colors.status.error;
            case 'moderate': return colors.status.warning;
            case 'low': return colors.status.success;
            default: return colors.text.tertiary;
        }
    };

    // Helper function to get min and max RPE values
    const getMinMaxRPE = (rpeTrend) => {
        if (!rpeTrend || rpeTrend.length === 0) return { min: 0, max: 0 };
        const rpeValues = rpeTrend.map(point => point.rpe).filter(rpe => rpe !== undefined && rpe !== null);
        if (rpeValues.length === 0) return { min: 0, max: 0 };
        return {
            min: Math.min(...rpeValues),
            max: Math.max(...rpeValues)
        };
    };

    // Helper function to get unique training days
    const getUniqueDays = (rpeTrend) => {
        if (!rpeTrend || rpeTrend.length === 0) return 0;
        const uniqueDates = new Set(
            rpeTrend
                .filter(point => point.date)
                .map(point => new Date(point.date).toDateString())
        );
        return uniqueDates.size;
    };

    // Helper function to calculate trend direction
    const calculateTrendDirection = (rpeTrend) => {
        if (!rpeTrend || rpeTrend.length < 6) return 'stable';
        
        const sortedTrend = [...rpeTrend].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
        );
        
        const recentCount = Math.min(5, Math.floor(sortedTrend.length / 2));
        const previousCount = recentCount;
        
        const recentValues = sortedTrend.slice(-recentCount).map(p => p.rpe);
        const previousValues = sortedTrend.slice(-recentCount * 2, -recentCount).map(p => p.rpe);
        
        if (previousValues.length === 0) return 'stable';
        
        const recentAvg = recentValues.reduce((sum, rpe) => sum + rpe, 0) / recentValues.length;
        const previousAvg = previousValues.reduce((sum, rpe) => sum + rpe, 0) / previousValues.length;
        
        const difference = recentAvg - previousAvg;
        const threshold = 0.3; // Minimum change to be considered significant
        
        if (difference > threshold) return 'increasing';
        if (difference < -threshold) return 'decreasing';
        return 'stable';
    };

    // Helper function to calculate RPE distribution
    const calculateRPEDistribution = (rpeTrend) => {
        if (!rpeTrend || rpeTrend.length === 0) {
            return { low: 0, moderate: 0, high: 0, veryHigh: 0 };
        }
        
        const distribution = { low: 0, moderate: 0, high: 0, veryHigh: 0 };
        
        rpeTrend.forEach(point => {
            const rpe = point.rpe;
            if (rpe >= 1 && rpe <= 5) distribution.low++;
            else if (rpe >= 6 && rpe <= 7) distribution.moderate++;
            else if (rpe >= 8 && rpe <= 9) distribution.high++;
            else if (rpe === 10) distribution.veryHigh++;
        });
        
        return distribution;
    };

    const formatRPEDataForChart = (rpeData) => {
        if (!rpeData || rpeData.length === 0) return [];
        
        const dataPoints = rpeData.slice(-14);
        const filteredData = dataPoints.filter(point => point && point.date && point.rpe !== undefined);
        
        return filteredData.map((point) => ({
            value: point.rpe,
            label: new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            dataPointText: point.rpe.toFixed(1),
            labelTextStyle: { color: colors.text.tertiary, fontSize: 8 },
            dataPointTextStyle: { color: colors.text.primary, fontSize: 8 }
        }));
    };

    const renderExerciseItem = ({ item: exercise, index }) => {
        if (!exercise || !exercise.exercise) return null;
        
        const { min, max } = getMinMaxRPE(exercise.rpeTrend);
        const uniqueDays = getUniqueDays(exercise.rpeTrend);
        const trendDirection = calculateTrendDirection(exercise.rpeTrend);
        const distribution = calculateRPEDistribution(exercise.rpeTrend);
        
        // Get most recent RPE
        const sortedTrend = exercise.rpeTrend 
            ? [...exercise.rpeTrend].sort((a, b) => new Date(b.date) - new Date(a.date))
            : [];
        const mostRecentRPE = sortedTrend.length > 0 ? sortedTrend[0] : null;
        
        const getTrendIcon = () => {
            switch (trendDirection) {
                case 'increasing': return TrendingUp;
                case 'decreasing': return TrendingDown;
                default: return Minus;
            }
        };
        
        const getTrendColor = () => {
            switch (trendDirection) {
                case 'increasing': return colors.status.error;
                case 'decreasing': return colors.status.success;
                default: return colors.text.tertiary;
            }
        };
        
        const TrendIcon = getTrendIcon();
        
        return (
            <View 
                style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                }}
            >
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, flex: 1 }}>{exercise.exercise}</Text>
                    <View 
                        style={{
                            paddingHorizontal: 8,
                            paddingVertical: 4,
                            borderRadius: 12,
                            backgroundColor: getIntensityColor(exercise.intensity)
                        }}
                    >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.white }}>
                            {(exercise.intensity || 'low').toUpperCase()}
                        </Text>
                    </View>
                </View>
                
                {/* Primary Metrics Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary }}>
                            Avg RPE: {(exercise.avgRPE || 0).toFixed(1)}/10
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
                            Range: {min.toFixed(1)} - {max.toFixed(1)}
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                            {exercise.totalSets || 0} sets
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.text.tertiary, marginTop: 2 }}>
                            {uniqueDays} {uniqueDays === 1 ? 'day' : 'days'}
                        </Text>
                    </View>
                </View>

                {/* Secondary Metrics Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border.light }}>
                    {/* Most Recent RPE */}
                    {mostRecentRPE && (
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                                Most Recent
                            </Text>
                            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>
                                {mostRecentRPE.rpe.toFixed(1)}/10
                            </Text>
                            <Text style={{ fontSize: 10, color: colors.text.tertiary, marginTop: 2 }}>
                                {new Date(mostRecentRPE.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                    )}
                    
                    {/* Trend Direction */}
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={{ fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                            Trend
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <TrendIcon size={16} color={getTrendColor()} />
                            <Text style={{ fontSize: 14, fontWeight: '600', color: getTrendColor(), textTransform: 'capitalize' }}>
                                {trendDirection}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* RPE Distribution */}
                {exercise.rpeTrend && exercise.rpeTrend.length > 0 && (
                    <View style={{ marginBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border.light }}>
                        <Text style={{ fontSize: 11, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            RPE Distribution
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                            {distribution.low > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.status.success + '15', borderRadius: 6 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.status.success }} />
                                    <Text style={{ fontSize: 11, color: colors.text.secondary }}>
                                        Low (1-5): {distribution.low}
                                    </Text>
                                </View>
                            )}
                            {distribution.moderate > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.status.warning + '15', borderRadius: 6 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.status.warning }} />
                                    <Text style={{ fontSize: 11, color: colors.text.secondary }}>
                                        Mod (6-7): {distribution.moderate}
                                    </Text>
                                </View>
                            )}
                            {distribution.high > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.status.error + '15', borderRadius: 6 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.status.error }} />
                                    <Text style={{ fontSize: 11, color: colors.text.secondary }}>
                                        High (8-9): {distribution.high}
                                    </Text>
                                </View>
                            )}
                            {distribution.veryHigh > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.status.error + '25', borderRadius: 6 }}>
                                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.status.error }} />
                                    <Text style={{ fontSize: 11, color: colors.text.secondary }}>
                                        Max (10): {distribution.veryHigh}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}
                
                {/* RPE Trend Visualization */}
                {exercise.rpeTrend && exercise.rpeTrend.length > 1 && (
                    <View style={{ marginBottom: 8, width: '100%' }}>
                        <LineChart
                            data={formatRPEDataForChart(exercise.rpeTrend)}
                            width={screenWidth - 112}
                            height={90}
                            color={getIntensityColor(exercise.intensity)}
                            thickness={2}
                            dataPointsColor={getIntensityColor(exercise.intensity)}
                            dataPointsRadius={3}
                            hideDataPoints={false}
                            hideRules={false}
                            rulesType="solid"
                            rulesColor={colors.border.light}
                            yAxisColor={colors.border.light}
                            xAxisColor={colors.border.light}
                            yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 8 }}
                            xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 8 }}
                            showVerticalLines={false}
                            showHorizontalLines={true}
                            spacing={48}
                            initialSpacing={12}
                            endSpacing={12}
                            maxValue={10}
                            noOfSections={5}
                            yAxisSide="left"
                            xAxisSide="bottom"
                            curved={true}
                            areaChart={true}
                            startFillColor={getIntensityColor(exercise.intensity) + '40'}
                            endFillColor={getIntensityColor(exercise.intensity) + '10'}
                            startOpacity={0.4}
                            endOpacity={0.1}
                        />
                    </View>
                )}
            </View>
        );
    };

    const renderListHeader = () => (
        <>
            {/* Timeframe Filter */}
            <TimeframeFilter 
                selectedTimeframe={selectedTimeframe}
                onTimeframeChange={handleTimeframeChange}
                onCustomDateRange={handleCustomDateRange}
            />

            {/* Summary Statistics */}
            {rawRpeAnalysis && rawRpeAnalysis.length > 0 && summaryStats && (
                <View style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                }}>
                    {/* Header */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: colors.primary[50] || colors.primary[100] + '30',
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 12,
                        }}>
                            <Activity size={20} color={colors.primary[600]} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ 
                                fontSize: 18, 
                                fontWeight: "700", 
                                color: colors.text.primary,
                                marginBottom: 2
                            }}>
                                Summary Statistics
                            </Text>
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary 
                            }}>
                                Overall Training Intensity Overview
                            </Text>
                        </View>
                    </View>

                    {/* Key Metrics Grid */}
                    <View style={{ gap: 12 }}>
                        {/* First Row: Overall Avg RPE & Total Exercises */}
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            {/* Overall Average RPE */}
                            <View style={{
                                flex: 1,
                                minWidth: 0,
                                backgroundColor: colors.background.primary,
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                                    <Target size={16} color={colors.primary[600]} />
                                    <Text style={{ 
                                        fontSize: 10, 
                                        color: colors.text.tertiary,
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        flexShrink: 1,
                                    }} numberOfLines={2}>
                                        Overall Avg RPE
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "800", 
                                    color: colors.text.primary,
                                    letterSpacing: -0.5,
                                }} numberOfLines={1}>
                                    {summaryStats.overallAvgRPE.toFixed(1)}
                                </Text>
                                <Text style={{ 
                                    fontSize: 11, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    / 10
                                </Text>
                            </View>

                            {/* Total Exercises */}
                            <View style={{
                                flex: 1,
                                minWidth: 0,
                                backgroundColor: colors.background.primary,
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                                    <Activity size={16} color={colors.icon.primary} />
                                    <Text style={{ 
                                        fontSize: 10, 
                                        color: colors.text.tertiary,
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                        flexShrink: 1,
                                    }} numberOfLines={2}>
                                        Total Exercises
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "800", 
                                    color: colors.text.primary,
                                    letterSpacing: -0.5,
                                }} numberOfLines={1}>
                                    {summaryStats.totalExercises}
                                </Text>
                                <Text style={{ 
                                    fontSize: 11, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }} numberOfLines={1}>
                                    {summaryStats.totalSets} sets
                                </Text>
                            </View>
                        </View>

                        {/* Second Row: Intensity Breakdown */}
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            {/* High Intensity */}
                            <View style={{
                                flex: 1,
                                backgroundColor: colors.background.primary,
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.status.error + '30',
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <Zap size={18} color={colors.status.error} />
                                    <Text style={{ 
                                        fontSize: 11, 
                                        color: colors.text.tertiary,
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}>
                                        High Intensity
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "800", 
                                    color: colors.status.error,
                                    letterSpacing: -0.5,
                                }}>
                                    {summaryStats.intensityBreakdown.high}
                                </Text>
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    exercises
                                </Text>
                            </View>

                            {/* Moderate Intensity */}
                            <View style={{
                                flex: 1,
                                backgroundColor: colors.background.primary,
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.status.warning + '30',
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <TrendingUp size={18} color={colors.status.warning} />
                                    <Text style={{ 
                                        fontSize: 11, 
                                        color: colors.text.tertiary,
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}>
                                        Moderate
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "800", 
                                    color: colors.status.warning,
                                    letterSpacing: -0.5,
                                }}>
                                    {summaryStats.intensityBreakdown.moderate}
                                </Text>
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    exercises
                                </Text>
                            </View>
                        </View>

                        {/* Third Row: Most/Least Intense Exercises */}
                        {(summaryStats.mostIntenseExercise || summaryStats.leastIntenseExercise) && (
                            <View style={{ flexDirection: "row", gap: 12 }}>
                                {/* Most Intense Exercise */}
                                {summaryStats.mostIntenseExercise && (
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: colors.background.primary,
                                        borderRadius: 12,
                                        padding: 16,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <Award size={18} color={colors.status.error} />
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                                letterSpacing: 0.5,
                                            }}>
                                                Most Intense
                                            </Text>
                                        </View>
                                        <Text style={{ 
                                            fontSize: 14, 
                                            fontWeight: "700", 
                                            color: colors.text.primary,
                                            marginBottom: 4,
                                        }} numberOfLines={1}>
                                            {summaryStats.mostIntenseExercise.exercise}
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            fontWeight: "800", 
                                            color: colors.status.error,
                                        }}>
                                            {(summaryStats.mostIntenseExercise.avgRPE || 0).toFixed(1)}/10
                                        </Text>
                                    </View>
                                )}

                                {/* Least Intense Exercise */}
                                {summaryStats.leastIntenseExercise && (
                                    <View style={{
                                        flex: 1,
                                        backgroundColor: colors.background.primary,
                                        borderRadius: 12,
                                        padding: 16,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                    }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                            <Target size={18} color={colors.status.success} />
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                fontWeight: "600",
                                                textTransform: "uppercase",
                                                letterSpacing: 0.5,
                                            }}>
                                                Least Intense
                                            </Text>
                                        </View>
                                        <Text style={{ 
                                            fontSize: 14, 
                                            fontWeight: "700", 
                                            color: colors.text.primary,
                                            marginBottom: 4,
                                        }} numberOfLines={1}>
                                            {summaryStats.leastIntenseExercise.exercise}
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            fontWeight: "800", 
                                            color: colors.status.success,
                                        }}>
                                            {(summaryStats.leastIntenseExercise.avgRPE || 0).toFixed(1)}/10
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            )}

            {/* Search and Filter Bar */}
            {rpeAnalysis && rpeAnalysis.length > 0 && (
                <View style={{ 
                    flexDirection: 'row', 
                    gap: 12, 
                    marginBottom: 16,
                    marginTop: 8
                }}>
                    {/* Search Input */}
                    <View style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                    }}>
                        <Search size={18} color={colors.text.tertiary} />
                        <TextInput
                            style={{
                                flex: 1,
                                marginLeft: 8,
                                color: colors.text.primary,
                                fontSize: 14,
                            }}
                            placeholder="Search exercises..."
                            placeholderTextColor={colors.text.tertiary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                style={{ padding: 4 }}
                            >
                                <X size={18} color={colors.text.tertiary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filter Button */}
                    <TouchableOpacity
                        onPress={() => setShowFilterModal(true)}
                        activeOpacity={0.7}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}
                    >
                        <Filter size={18} color={colors.primary[600]} />
                        <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: colors.primary[600],
                        }}>
                            Filter
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </>
    );

    const renderListFooter = () => {
        if (!hasMore) return null;
        
        return (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={handleLoadMore}
                    style={{
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        backgroundColor: colors.background.card,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border.light,
                    }}
                >
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.primary[600],
                    }}>
                        Load More ({remainingCount} remaining)
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyComponent = () => {
        if (searchQuery.trim()) {
            return (
                <View style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 12,
                    padding: 24,
                    alignItems: 'center',
                    marginTop: 20
                }}>
                    <Text style={{
                        fontSize: 16,
                        color: colors.text.secondary,
                        textAlign: 'center'
                    }}>
                        No exercises found matching "{searchQuery}".
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: colors.text.tertiary,
                        textAlign: 'center',
                        marginTop: 8
                    }}>
                        Try adjusting your search query.
                    </Text>
                </View>
            );
        }
        
        return (
            <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 12,
                padding: 24,
                alignItems: 'center',
                marginTop: 20
            }}>
                <Text style={{
                    fontSize: 16,
                    color: colors.text.secondary,
                    textAlign: 'center'
                }}>
                    No RPE data available for the selected timeframe.
                </Text>
                <Text style={{
                    fontSize: 14,
                    color: colors.text.tertiary,
                    textAlign: 'center',
                    marginTop: 8
                }}>
                    Start logging sets with RPE values to see your training intensity analysis.
                </Text>
            </View>
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadRPEAnalysis(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    // Show loading only if no data exists and we're waiting for initial load
    const isLoading = !rawRpeAnalysis || rawRpeAnalysis.length === 0;
    
    if (isLoading && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading training intensity data...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            <FlatList
                data={visibleExercises}
                renderItem={renderExerciseItem}
                keyExtractor={(item, index) => item?.exercise || `exercise-${index}`}
                ListHeaderComponent={renderListHeader}
                ListFooterComponent={renderListFooter}
                ListEmptyComponent={renderEmptyComponent}
                contentContainerStyle={{ 
                    padding: 24, 
                    paddingBottom: 100,
                    flexGrow: 1
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={10}
                windowSize={10}
            />

            {/* Filter Modal */}
            <RPEAnalysisFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
            />
        </View>
    );
}

