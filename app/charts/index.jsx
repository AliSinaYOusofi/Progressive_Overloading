import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useRouter } from "expo-router";
import { useAppStore } from "../../stores/useAppStore";

// Import chart components
import QuickStats from "../../components/Charts/QuickStats";
import CollapsibleSection from "../../components/Charts/CollapsibleSection";
import StrengthStandards from "../../components/Charts/StrengthStandards";
import RPEAnalysis from "../../components/Charts/RPEAnalysis";
import PremiumChartCard from "../../components/Charts/PremiumChartCard";

// Import custom SVG icons
import ExerciseProgressionIcon from "../../components/Charts/Icons/ExerciseProgressionIcon";
import VolumeProgressionIcon from "../../components/Charts/Icons/VolumeProgressionIcon";
import PersonalRecordsIcon from "../../components/Charts/Icons/PersonalRecordsIcon";
import WeeklyProgressIcon from "../../components/Charts/Icons/WeeklyProgressIcon";
import MonthlyTrendsIcon from "../../components/Charts/Icons/MonthlyTrendsIcon";
import ProgressiveOverloadIcon from "../../components/Charts/Icons/ProgressiveOverloadIcon";
import RPEAnalysisIcon from "../../components/Charts/Icons/RPEAnalysisIcon";
import MuscleGroupIcon from "../../components/Charts/Icons/MuscleGroupIcon";
import StrengthStandardsIcon from "../../components/Charts/Icons/StrengthStandardsIcon";
import GoalAnalyticsIcon from "../../components/Charts/Icons/GoalAnalyticsIcon";


export default function ChartsScreen() {
    const colors = useThemedColors();
    const router = useRouter();
    
    // Get data from Zustand store using selective subscriptions
    // Charts index uses all-time data (36500), so read from nested structure
    const user = useAppStore(state => state.user);
    
    // Subscribe to entire nested objects to get stable references
    const exerciseProgressionData = useAppStore(state => state.chartsData.exerciseProgression);
    const volumeProgressionData = useAppStore(state => state.chartsData.volumeProgression);
    const monthlyStatsData = useAppStore(state => state.chartsData.monthlyStats);
    const personalRecordsData = useAppStore(state => state.chartsData.personalRecords);
    const weeklyProgressData = useAppStore(state => state.chartsData.weeklyProgress);
    const progressiveOverloadInsightsData = useAppStore(state => state.chartsData.progressiveOverloadInsights);
    const muscleGroupHeatmapData = useAppStore(state => state.chartsData.muscleGroupHeatmap);
    const goalAnalyticsData = useAppStore(state => state.chartsData.goalAnalytics);
    
    // Use stable empty objects/arrays to prevent new references on every render
    const EMPTY_OBJECT = {};
    const EMPTY_ARRAY = [];
    
    // Extract timeframe-specific data using useMemo with stable fallbacks
    const exerciseProgression = useMemo(() => exerciseProgressionData[36500] || EMPTY_OBJECT, [exerciseProgressionData]);
    const volumeProgression = useMemo(() => volumeProgressionData[36500] || EMPTY_ARRAY, [volumeProgressionData]);
    const monthlyStats = useMemo(() => monthlyStatsData[36500] || EMPTY_ARRAY, [monthlyStatsData]);
    const personalRecords = useMemo(() => personalRecordsData[36500] || EMPTY_ARRAY, [personalRecordsData]);
    const weeklyProgress = useMemo(() => weeklyProgressData[36500] || EMPTY_ARRAY, [weeklyProgressData]);
    const progressiveOverloadInsights = useMemo(() => progressiveOverloadInsightsData[36500] || EMPTY_ARRAY, [progressiveOverloadInsightsData]);
    const muscleGroupHeatmap = useMemo(() => muscleGroupHeatmapData[36500] || EMPTY_ARRAY, [muscleGroupHeatmapData]);
    const goalAnalytics = useMemo(() => goalAnalyticsData[36500] || {
      completionRateOverTime: [],
      goalsCreatedOverTime: [],
      statusBreakdown: { active: 0, completed: 0, expired: 0 },
      averageProgressOverTime: [],
      averageCompletionTime: 0,
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      expiredGoals: 0,
    }, [goalAnalyticsData]);
    
    // Direct selectors for non-nested data
    const userStats = useAppStore(state => state.chartsData.userStats);
    const strengthStandards = useAppStore(state => state.chartsData.strengthStandards);
    const rpeAnalysisData = useAppStore(state => state.chartsData.rpeAnalysis);
    
    // Extract timeframe-specific data for RPE analysis
    const rpeAnalysis = useMemo(() => {
      const data = rpeAnalysisData[36500] || [];
      return Array.isArray(data) ? data : Object.values(data);
    }, [rpeAnalysisData]);
    
    // Memoize chartsData object to prevent infinite loops
    const chartsData = useMemo(() => ({
      userStats,
      exerciseProgression,
      volumeProgression,
      strengthStandards,
      monthlyStats,
      personalRecords,
      weeklyProgress,
      rpeAnalysis: rpeAnalysis,
      progressiveOverloadInsights,
      muscleGroupHeatmap,
      goalAnalytics,
    }), [userStats, exerciseProgression, volumeProgression, strengthStandards, monthlyStats, personalRecords, weeklyProgress, rpeAnalysis, progressiveOverloadInsights, muscleGroupHeatmap, goalAnalytics]);
    
    const chartsLoading = useAppStore(state => state.chartsLoading);
    const chartsRefreshing = useAppStore(state => state.chartsRefreshing);
    const chartsError = useAppStore(state => state.chartsError);
    const loadChartsData = useAppStore(state => state.loadChartsData);
    const refreshChartsData = useAppStore(state => state.refreshChartsData);

    useEffect(() => {
        // Only load if user exists, data is missing, and not already loading
        if (user && !chartsLoading && (!userStats || !exerciseProgressionData[36500] || Object.keys(exerciseProgressionData[36500] || {}).length === 0)) {
            loadChartsData();
        }
    }, [user, userStats, exerciseProgressionData, loadChartsData, chartsLoading]);

    const onRefresh = () => {
        refreshChartsData();
    };

    // Show error state if there's an error and no data
    if (chartsError && !chartsData.userStats && !chartsLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary, paddingHorizontal: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.status.error, marginBottom: 12, textAlign: 'center' }}>Unable to Load Insights</Text>
                <Text style={{ fontSize: 16, color: colors.text.secondary, marginBottom: 24, textAlign: 'center', lineHeight: 24 }}>{chartsError}</Text>
                <TouchableOpacity
                    onPress={() => {
                        loadChartsData(true);
                    }}
                    style={{
                        backgroundColor: colors.primary[600],
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        borderRadius: 12,
                    }}
                >
                    <Text style={{ color: colors.text.white, fontSize: 16, fontWeight: '600' }}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (chartsLoading && !chartsData.userStats) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading your progress...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            <ScrollView 
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 150, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={chartsRefreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text.primary, marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 }}>Insights</Text>
                    <Text style={{ fontSize: 16, color: colors.text.secondary, textAlign: 'center', fontWeight: '400' }}>Track your strength gains and performance</Text>
                </View>

                {/* Error Banner - Show if there's an error but we have some data */}
                {chartsError && chartsData.userStats && (
                    <View style={{
                        backgroundColor: colors.status.error + '15',
                        borderLeftWidth: 4,
                        borderLeftColor: colors.status.error,
                        padding: 16,
                        borderRadius: 12,
                        marginBottom: 24,
                    }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.status.error, marginBottom: 8 }}>
                            Unable to Load Latest Data
                        </Text>
                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginBottom: 12, lineHeight: 20 }}>
                            {chartsError}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                loadChartsData(true);
                            }}
                            style={{
                                backgroundColor: colors.status.error,
                                paddingHorizontal: 16,
                                paddingVertical: 8,
                                borderRadius: 8,
                                alignSelf: 'flex-start',
                            }}
                        >
                            <Text style={{ color: colors.text.white, fontSize: 14, fontWeight: '600' }}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Stats - Always Visible */}
                <QuickStats 
                    userStats={chartsData.userStats}
                    personalRecords={chartsData.personalRecords}
                />

                {/* Exercise Progression Charts */}
                <PremiumChartCard
                    icon={ExerciseProgressionIcon}
                    title="Exercise Progression"
                    subtitle="Track your one-rep max (1RM) progression over time for each exercise. See how your strength has improved and identify your strongest movements."
                    onPress={() => router.push('/charts/exercise-progression')}
                />

                {/* Volume Progression */}
                <PremiumChartCard
                    icon={VolumeProgressionIcon}
                    title="Volume Progression"
                    subtitle="Monitor your total training volume - the cumulative weight lifted per day. Understand your workload patterns and training consistency over time."
                    onPress={() => router.push('/charts/volume-progression')}
                />

                {/* Strength Standards */}
                {chartsData.strengthStandards && chartsData.strengthStandards.length > 0 && (
                    <CollapsibleSection
                        title="Strength Standards"
                        subtitle="Compare your strength levels relative to your bodyweight. See how you rank across different exercises and identify areas for improvement."
                        icon={StrengthStandardsIcon}
                        defaultExpanded={false}
                    >
                        <StrengthStandards strengthStandards={chartsData.strengthStandards} />
                    </CollapsibleSection>
                )}

                {/* Personal Records */}
                {chartsData.personalRecords && chartsData.personalRecords.length > 0 && (
                    <PremiumChartCard
                        icon={PersonalRecordsIcon}
                        title="Personal Records"
                        subtitle={`View all your personal best performances across exercises. Celebrate your achievements and track your strongest lifts for each movement.`}
                        badge={chartsData.personalRecords.length > 0 ? `${chartsData.personalRecords.length}` : null}
                        onPress={() => router.push('/charts/personal-records')}
                    />
                )}

                {/* Weekly Progress */}
                <PremiumChartCard
                    icon={WeeklyProgressIcon}
                    title="Weekly Progress"
                    subtitle="Get a detailed breakdown of your training week. See sets, exercises, and volume logged each day to understand your weekly training patterns."
                    onPress={() => router.push('/charts/weekly-progress')}
                />

                {/* Monthly Trends */}
                {chartsData.monthlyStats && chartsData.monthlyStats.length > 0 && (
                    <PremiumChartCard
                        icon={MonthlyTrendsIcon}
                        title="Monthly Trends"
                        subtitle="Analyze your training trends over months. Track sets, exercises, and overall activity to spot long-term patterns and consistency in your training."
                        onPress={() => router.push('/charts/monthly-trends')}
                    />
                )}

                {/* Progressive Overload Insights */}
                {chartsData.progressiveOverloadInsights && chartsData.progressiveOverloadInsights.length > 0 && (
                    <PremiumChartCard
                        icon={ProgressiveOverloadIcon}
                        title="Progressive Overload Analysis"
                        subtitle="Discover insights about your strength progression. Identify when you're effectively overloading and when you might need to adjust your training approach."
                        onPress={() => router.push('/charts/progressive-overload')}
                    />
                )}

                {/* Training Intensity (RPE) */}
                {rpeAnalysis && rpeAnalysis.length > 0 && (
                    <PremiumChartCard
                        icon={RPEAnalysisIcon}
                        title="Training Intensity (RPE)"
                        subtitle="Analyze your Rate of Perceived Exertion to understand training intensity patterns. See how hard you're pushing yourself and balance intensity with recovery."
                        badge="BETA"
                        onPress={() => router.push('/charts/training-intensity')}
                    />
                )}

                {/* Muscle Group Heatmap */}
                <PremiumChartCard
                    icon={MuscleGroupIcon}
                    title="Muscle Group Heatmap"
                    subtitle="Visualize training volume distribution across muscle groups. Identify imbalances in your training and ensure balanced muscle development."
                    badge="BETA"
                    onPress={() => router.push('/charts/muscle-groups-heatmap')}
                />

                {/* Goal Analytics */}
                <PremiumChartCard
                    icon={GoalAnalyticsIcon}
                    title="Goal Analytics"
                    subtitle="Track your fitness goals progress, completion rates, and trends. Analyze your goal-setting patterns and achievement rates over time."
                    onPress={() => router.push('/charts/goal-analytics')}
                />

            </ScrollView>
        </View>
    );
}

