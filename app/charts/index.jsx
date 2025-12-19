import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useRouter } from "expo-router";
import { 
    getCurrentUser, 
    getUserStats, 
    getExerciseProgressionData, 
    getVolumeProgressionData, 
    getStrengthStandards, 
    getMonthlyStats, 
    getPersonalRecords,
    getWeeklyProgress,
    getRPEAnalysis,
    getProgressiveOverloadInsights,
    getMuscleGroupHeatmapData
} from "../../lib/database";

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


export default function ChartsScreen() {
    const colors = useThemedColors();
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [exerciseProgression, setExerciseProgression] = useState({});
    const [volumeProgression, setVolumeProgression] = useState([]);
    const [strengthStandards, setStrengthStandards] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [weeklyProgress, setWeeklyProgress] = useState([]);
    const [rpeAnalysis, setRpeAnalysis] = useState([]);
    const [progressiveOverloadInsights, setProgressiveOverloadInsights] = useState([]);
    const [muscleGroupHeatmap, setMuscleGroupHeatmap] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadChartsData();
    }, []);

    const loadChartsData = async (isRefresh = false) => {
        try {
            if (!isRefresh) setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            if (!currentUser) return;
            
            setUser(currentUser);

            // Always fetch all-time data (36500 days = ~100 years)
            const allTimeValue = 36500;

            const [
                stats,
                progression,
                volume,
                standards,
                monthly,
                records,
                weekly,
                rpe,
                overloadInsights,
                heatmap
            ] = await Promise.all([
                getUserStats(currentUser.id, allTimeValue),
                getExerciseProgressionData(currentUser.id, null, allTimeValue),
                getVolumeProgressionData(currentUser.id, allTimeValue),
                getStrengthStandards(currentUser.id, allTimeValue),
                getMonthlyStats(currentUser.id, allTimeValue),
                getPersonalRecords(currentUser.id, 100, allTimeValue),
                getWeeklyProgress(currentUser.id, allTimeValue),
                getRPEAnalysis(currentUser.id, allTimeValue),
                getProgressiveOverloadInsights(currentUser.id, allTimeValue),
                getMuscleGroupHeatmapData(currentUser.id, allTimeValue)
            ]);

            setUserStats(stats);
            setExerciseProgression(progression);
            setVolumeProgression(volume);
            setStrengthStandards(standards);
            setMonthlyStats(monthly);
            setPersonalRecords(records);
            setWeeklyProgress(weekly);
            setRpeAnalysis(rpe);
            setProgressiveOverloadInsights(overloadInsights);
            setMuscleGroupHeatmap(heatmap);
        } catch (error) {
            console.error("Error loading charts data:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadChartsData(true);
    };

    if (isLoading) {
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
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 40 }}>
                    <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text.primary, marginBottom: 8, textAlign: 'center', letterSpacing: -0.5 }}>Progressive Overload Analytics</Text>
                    <Text style={{ fontSize: 16, color: colors.text.secondary, textAlign: 'center', fontWeight: '400' }}>Track your strength gains and performance</Text>
                </View>

                {/* Quick Stats - Always Visible */}
                <QuickStats 
                    userStats={userStats}
                    personalRecords={personalRecords}
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
                {strengthStandards && strengthStandards.length > 0 && (
                    <CollapsibleSection
                        title="Strength Standards"
                        subtitle="Compare your strength levels relative to your bodyweight. See how you rank across different exercises and identify areas for improvement."
                        icon={StrengthStandardsIcon}
                        defaultExpanded={false}
                    >
                        <StrengthStandards strengthStandards={strengthStandards} />
                    </CollapsibleSection>
                )}

                {/* Personal Records */}
                {personalRecords && personalRecords.length > 0 && (
                    <PremiumChartCard
                        icon={PersonalRecordsIcon}
                        title="Personal Records"
                        subtitle={`View all your personal best performances across exercises. Celebrate your achievements and track your strongest lifts for each movement.`}
                        badge={personalRecords.length > 0 ? `${personalRecords.length}` : null}
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
                {monthlyStats && monthlyStats.length > 0 && (
                    <PremiumChartCard
                        icon={MonthlyTrendsIcon}
                        title="Monthly Trends"
                        subtitle="Analyze your training trends over months. Track sets, exercises, and overall activity to spot long-term patterns and consistency in your training."
                        onPress={() => router.push('/charts/monthly-trends')}
                    />
                )}

                {/* Progressive Overload Insights */}
                {progressiveOverloadInsights && progressiveOverloadInsights.length > 0 && (
                    <PremiumChartCard
                        icon={ProgressiveOverloadIcon}
                        title="Progressive Overload Analysis"
                        subtitle="Discover insights about your strength progression. Identify when you're effectively overloading and when you might need to adjust your training approach."
                        onPress={() => router.push('/charts/progressive-overload')}
                    />
                )}

                {/* RPE Analysis */}
                {rpeAnalysis && rpeAnalysis.length > 0 && (
                    <CollapsibleSection
                        title="Training Intensity (RPE)"
                        subtitle="Analyze your Rate of Perceived Exertion to understand training intensity patterns. See how hard you're pushing yourself and balance intensity with recovery."
                        icon={RPEAnalysisIcon}
                        defaultExpanded={false}
                    >
                        <RPEAnalysis rpeAnalysis={rpeAnalysis} />
                    </CollapsibleSection>
                )}

                {/* Muscle Group Heatmap */}
                {muscleGroupHeatmap && muscleGroupHeatmap.length > 0 && (
                    <PremiumChartCard
                        icon={MuscleGroupIcon}
                        title="Muscle Group Heatmap"
                        subtitle="Visualize training volume distribution across muscle groups. Identify imbalances in your training and ensure balanced muscle development."
                        onPress={() => router.push('/charts/muscle-groups-heatmap')}
                    />
                )}

            </ScrollView>
        </View>
    );
}

