import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from "expo-router";
import { useAppStore } from "../../stores/useAppStore";
import AnimatedItem from "../../components/AnimatedItem";

// Import chart components
import QuickStats from "../../components/Charts/QuickStats";
import CollapsibleSection from "../../components/Charts/CollapsibleSection";
import StrengthStandards from "../../components/Charts/StrengthStandards";
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


// Accent palette for each card category
const CARD_ACCENTS = {
    exercise:   { light: '#047857', dark: '#34D399' },   // emerald
    volume:     { light: '#2563EB', dark: '#60A5FA' },   // blue
    strength:   { light: '#7C3AED', dark: '#A78BFA' },   // purple
    records:    { light: '#D97706', dark: '#FBBF24' },   // amber
    weekly:     { light: '#0891B2', dark: '#22D3EE' },   // cyan
    monthly:    { light: '#6D28D9', dark: '#C4B5FD' },   // violet
    overload:   { light: '#059669', dark: '#6EE7B7' },   // green
    rpe:        { light: '#DC2626', dark: '#F87171' },   // red
    muscle:     { light: '#EA580C', dark: '#FB923C' },   // orange
    goals:      { light: '#0284C7', dark: '#38BDF8' },   // sky
};

function SectionLabel({ label, colors }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, marginTop: 8, marginLeft: 4 }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.tertiary, opacity: 0.5 }} />
            <Text style={{
                fontSize: 13,
                fontWeight: '600',
                color: colors.text.tertiary,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
            }}>
                {label}
            </Text>
        </View>
    );
}

export default function ChartsScreen() {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const router = useRouter();

    const user = useAppStore(state => state.user);

    const exerciseProgressionData = useAppStore(state => state.chartsData.exerciseProgression);
    const volumeProgressionData = useAppStore(state => state.chartsData.volumeProgression);
    const monthlyStatsData = useAppStore(state => state.chartsData.monthlyStats);
    const personalRecordsData = useAppStore(state => state.chartsData.personalRecords);
    const weeklyProgressData = useAppStore(state => state.chartsData.weeklyProgress);
    const progressiveOverloadInsightsData = useAppStore(state => state.chartsData.progressiveOverloadInsights);
    const muscleGroupHeatmapData = useAppStore(state => state.chartsData.muscleGroupHeatmap);
    const goalAnalyticsData = useAppStore(state => state.chartsData.goalAnalytics);

    const EMPTY_OBJECT = {};
    const EMPTY_ARRAY = [];

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

    const userStats = useAppStore(state => state.chartsData.userStats);
    const strengthStandards = useAppStore(state => state.chartsData.strengthStandards);
    const rpeAnalysisData = useAppStore(state => state.chartsData.rpeAnalysis);

    const rpeAnalysis = useMemo(() => {
        const data = rpeAnalysisData[36500] || [];
        return Array.isArray(data) ? data : Object.values(data);
    }, [rpeAnalysisData]);

    const chartsData = useMemo(() => ({
        userStats,
        exerciseProgression,
        volumeProgression,
        strengthStandards,
        monthlyStats,
        personalRecords,
        weeklyProgress,
        rpeAnalysis,
        progressiveOverloadInsights,
        muscleGroupHeatmap,
        goalAnalytics,
    }), [userStats, exerciseProgression, volumeProgression, strengthStandards, monthlyStats, personalRecords, weeklyProgress, rpeAnalysis, progressiveOverloadInsights, muscleGroupHeatmap, goalAnalytics]);

    const [focusTrigger, setFocusTrigger] = useState(0);
    const skipNextAnimationRef = useRef(false);

    const handleChartPress = useCallback((path) => {
        skipNextAnimationRef.current = true;
        router.push(path);
    }, [router]);

    useFocusEffect(useCallback(() => {
        if (skipNextAnimationRef.current) {
            skipNextAnimationRef.current = false;
            return;
        }
        setFocusTrigger((t) => t + 1);
    }, []));

    const chartsLoading = useAppStore(state => state.chartsLoading);
    const chartsRefreshing = useAppStore(state => state.chartsRefreshing);
    const chartsError = useAppStore(state => state.chartsError);
    const loadChartsData = useAppStore(state => state.loadChartsData);
    const refreshChartsData = useAppStore(state => state.refreshChartsData);

    useEffect(() => {
        if (user && !chartsLoading && (!userStats || !exerciseProgressionData[36500] || Object.keys(exerciseProgressionData[36500] || {}).length === 0)) {
            loadChartsData();
        }
    }, [user, userStats, exerciseProgressionData, loadChartsData, chartsLoading]);

    const onRefresh = () => {
        refreshChartsData();
    };

    const accent = (key) => isDarkMode ? CARD_ACCENTS[key].dark : CARD_ACCENTS[key].light;

    // Error state
    if (chartsError && !chartsData.userStats && !chartsLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary, paddingHorizontal: 20 }}>
                <View style={{
                    width: 64,
                    height: 64,
                    borderRadius: 20,
                    backgroundColor: `${colors.status.error}12`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                }}>
                    <Text style={{ fontSize: 28 }}>!</Text>
                </View>
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, marginBottom: 8, textAlign: 'center' }}>Unable to Load Insights</Text>
                <Text style={{ fontSize: 15, color: colors.text.tertiary, marginBottom: 28, textAlign: 'center', lineHeight: 22 }}>{chartsError}</Text>
                <TouchableOpacity
                    onPress={() => loadChartsData(true)}
                    style={{
                        backgroundColor: colors.primary[600],
                        paddingHorizontal: 28,
                        paddingVertical: 14,
                        borderRadius: 14,
                    }}
                >
                    <Text style={{ color: colors.text.white, fontSize: 15, fontWeight: '600' }}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Loading state
    if (chartsLoading && !chartsData.userStats) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 15, color: colors.text.tertiary, fontWeight: '500' }}>Loading your insights...</Text>
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
                <AnimatedItem index={0} trigger={focusTrigger}>
                    <View style={{ marginBottom: 32 }}>
                        <Text style={{
                            fontSize: 34,
                            fontWeight: '800',
                            color: colors.text.primary,
                            letterSpacing: -0.8,
                            marginBottom: 6,
                        }}>
                            Insights
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            color: colors.text.tertiary,
                            fontWeight: '400',
                            letterSpacing: -0.2,
                        }}>
                            Your strength journey at a glance
                        </Text>
                    </View>
                </AnimatedItem>

                {/* Error Banner */}
                {chartsError && chartsData.userStats && (
                    <View style={{
                        backgroundColor: isDarkMode ? `${colors.status.error}15` : `${colors.status.error}08`,
                        borderWidth: 1,
                        borderColor: `${colors.status.error}25`,
                        padding: 16,
                        borderRadius: 16,
                        marginBottom: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                    }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.status.error, marginBottom: 4 }}>
                                Couldn't refresh data
                            </Text>
                            <Text style={{ fontSize: 13, color: colors.text.tertiary, lineHeight: 18 }}>
                                {chartsError}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => loadChartsData(true)}
                            style={{
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                borderRadius: 10,
                                backgroundColor: colors.status.error,
                            }}
                        >
                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Quick Stats */}
                <AnimatedItem index={1} trigger={focusTrigger}>
                    <QuickStats
                        userStats={chartsData.userStats}
                        personalRecords={chartsData.personalRecords}
                    />
                </AnimatedItem>

                {/* ── PROGRESSION ── */}
                <AnimatedItem index={2} trigger={focusTrigger}>
                    <SectionLabel label="Progression" colors={colors} />
                    <PremiumChartCard
                        icon={ExerciseProgressionIcon}
                        title="Exercise Progression"
                        subtitle="Track your 1RM progression over time for each exercise"
                        accent={accent('exercise')}
                        onPress={() => handleChartPress('/charts/exercise-progression')}
                    />
                </AnimatedItem>

                <AnimatedItem index={3} trigger={focusTrigger}>
                    <PremiumChartCard
                        icon={VolumeProgressionIcon}
                        title="Volume Progression"
                        subtitle="Total weight lifted per day — workload patterns and consistency"
                        accent={accent('volume')}
                        onPress={() => handleChartPress('/charts/volume-progression')}
                    />
                </AnimatedItem>

                <AnimatedItem index={4} trigger={focusTrigger}>
                    <PremiumChartCard
                        icon={ProgressiveOverloadIcon}
                        title="Progressive Overload"
                        subtitle="See when you're effectively overloading and where to adjust"
                        accent={accent('overload')}
                        onPress={() => handleChartPress('/charts/progressive-overload')}
                    />
                </AnimatedItem>

                {/* ── BENCHMARKS ── */}
                {chartsData.strengthStandards && chartsData.strengthStandards.length > 0 && (
                    <AnimatedItem index={5} trigger={focusTrigger}>
                        <SectionLabel label="Benchmarks" colors={colors} />
                        <CollapsibleSection
                            title="Strength Standards"
                            subtitle="Compare your lifts relative to bodyweight"
                            icon={StrengthStandardsIcon}
                            accent={accent('strength')}
                            defaultExpanded={false}
                        >
                            <StrengthStandards strengthStandards={chartsData.strengthStandards} />
                        </CollapsibleSection>
                    </AnimatedItem>
                )}

                {chartsData.personalRecords && chartsData.personalRecords.length > 0 && (
                    <AnimatedItem index={6} trigger={focusTrigger}>
                        <PremiumChartCard
                            icon={PersonalRecordsIcon}
                            title="Personal Records"
                            subtitle="Your best performances across all exercises"
                            accent={accent('records')}
                            badge={chartsData.personalRecords.length > 0 ? `${chartsData.personalRecords.length}` : null}
                            onPress={() => handleChartPress('/charts/personal-records')}
                        />
                    </AnimatedItem>
                )}

                {/* ── ACTIVITY ── */}
                <AnimatedItem index={7} trigger={focusTrigger}>
                    <SectionLabel label="Activity" colors={colors} />
                    <PremiumChartCard
                        icon={WeeklyProgressIcon}
                        title="Weekly Progress"
                        subtitle="Sets, exercises, and volume breakdown each day"
                        accent={accent('weekly')}
                        onPress={() => handleChartPress('/charts/weekly-progress')}
                    />
                </AnimatedItem>

                {chartsData.monthlyStats && chartsData.monthlyStats.length > 0 && (
                    <AnimatedItem index={8} trigger={focusTrigger}>
                        <PremiumChartCard
                            icon={MonthlyTrendsIcon}
                            title="Monthly Trends"
                            subtitle="Long-term training patterns and consistency"
                            accent={accent('monthly')}
                            onPress={() => handleChartPress('/charts/monthly-trends')}
                        />
                    </AnimatedItem>
                )}

                {/* ── DEEP DIVES ── */}
                <AnimatedItem index={9} trigger={focusTrigger}>
                    <SectionLabel label="Deep Dives" colors={colors} />
                    {rpeAnalysis && rpeAnalysis.length > 0 && (
                        <PremiumChartCard
                            icon={RPEAnalysisIcon}
                            title="Training Intensity (RPE)"
                            subtitle="Understand intensity patterns and balance recovery"
                            accent={accent('rpe')}
                            badge="BETA"
                            onPress={() => handleChartPress('/charts/training-intensity')}
                        />
                    )}
                </AnimatedItem>

                <AnimatedItem index={10} trigger={focusTrigger}>
                    <PremiumChartCard
                        icon={MuscleGroupIcon}
                        title="Muscle Group Heatmap"
                        subtitle="Volume distribution and balance across muscle groups"
                        accent={accent('muscle')}
                        badge="BETA"
                        onPress={() => handleChartPress('/charts/muscle-groups-heatmap')}
                    />
                </AnimatedItem>

                <AnimatedItem index={11} trigger={focusTrigger}>
                    <PremiumChartCard
                        icon={GoalAnalyticsIcon}
                        title="Goal Analytics"
                        subtitle="Completion rates, trends, and goal-setting patterns"
                        accent={accent('goals')}
                        onPress={() => handleChartPress('/charts/goal-analytics')}
                    />
                </AnimatedItem>

            </ScrollView>
        </View>
    );
}
