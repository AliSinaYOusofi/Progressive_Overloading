import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { TrendingUp, BarChart3, Award, Trophy, Calendar, Target, Activity, Zap } from "lucide-react-native";
import { useThemedColors } from "../hooks/useThemedColors";
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
    getVolumeAnalysis
} from "../lib/database";

// Import chart components
import QuickStats from "../components/Charts/QuickStats";
import TimeframeFilter from "../components/Charts/TimeframeFilter";
import CollapsibleSection from "../components/Charts/CollapsibleSection";
import ExerciseProgression from "../components/Charts/ExerciseProgression";
import VolumeProgression from "../components/Charts/VolumeProgression";
import StrengthStandards from "../components/Charts/StrengthStandards";
import PersonalRecords from "../components/Charts/PersonalRecords";
import WeeklyProgress from "../components/Charts/WeeklyProgress";
import MonthlyTrends from "../components/Charts/MonthlyTrends";
import ProgressiveOverloadInsights from "../components/Charts/ProgressiveOverloadInsights";
import RPEAnalysis from "../components/Charts/RPEAnalysis";
import VolumeAnalysis from "../components/Charts/VolumeAnalysis";


export default function ChartsScreen() {
    const colors = useThemedColors();
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
    const [volumeAnalysis, setVolumeAnalysis] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days
    const [selectedExercise, setSelectedExercise] = useState(null);

    useEffect(() => {
        loadChartsData();
    }, []);

    const loadChartsData = async (isRefresh = false, timeframe = selectedTimeframe) => {
        try {
            if (!isRefresh) setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            if (!currentUser) return;
            
            setUser(currentUser);

            // For "All Time", use a very large number or null to get all data
            const timeframeValue = timeframe === 'all' ? 36500 : timeframe; // 100 years for all time

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
                volumeInsights
            ] = await Promise.all([
                getUserStats(currentUser.id),
                getExerciseProgressionData(currentUser.id, null, timeframeValue),
                getVolumeProgressionData(currentUser.id, timeframeValue),
                getStrengthStandards(currentUser.id),
                getMonthlyStats(currentUser.id, timeframe === 'all' ? 120 : 6), // 10 years of months for all time
                getPersonalRecords(currentUser.id, timeframe === 'all' ? 100 : 10), // More records for all time
                getWeeklyProgress(currentUser.id),
                getRPEAnalysis(currentUser.id, timeframeValue),
                getProgressiveOverloadInsights(currentUser.id, timeframeValue),
                getVolumeAnalysis(currentUser.id, timeframeValue)
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
            setVolumeAnalysis(volumeInsights);
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

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        loadChartsData(false, newTimeframe);
    };

    const handleCustomDateRange = (startDate, endDate) => {
        // Calculate days difference
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setSelectedTimeframe('custom');
        // You can pass the custom date range to loadChartsData if needed
        // For now, we'll use the daysDiff as the timeframe
        loadChartsData();
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
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 150, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={{ alignItems: 'center', marginBottom: 32 }}>
                    <Text style={{ fontSize: 30, fontWeight: 'bold', color: colors.text.primary, marginBottom: 8, textAlign: 'center' }}>Progressive Overload Analytics</Text>
                    <Text style={{ fontSize: 16, color: colors.text.secondary, textAlign: 'center' }}>Track your strength gains and performance</Text>
                </View>

                {/* Timeframe Filter */}
                <TimeframeFilter 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onCustomDateRange={handleCustomDateRange}
                />

                {/* Quick Stats - Always Visible */}
                <QuickStats 
                    userStats={userStats}
                    personalRecords={personalRecords}
                />

                {/* Exercise Progression Charts */}
                <CollapsibleSection
                    title="Exercise Progression"
                    subtitle="1RM progression over time"
                    icon={TrendingUp}
                    defaultExpanded={true}
                >
                    <ExerciseProgression exerciseProgression={exerciseProgression} />
                </CollapsibleSection>

                {/* Volume Progression */}
                <CollapsibleSection
                    title="Volume Progression"
                    subtitle="Total weight lifted per day"
                    icon={BarChart3}
                    defaultExpanded={false}
                >
                    <VolumeProgression volumeProgression={volumeProgression} />
                </CollapsibleSection>

                {/* Strength Standards */}
                {strengthStandards && strengthStandards.length > 0 && (
                    <CollapsibleSection
                        title="Strength Standards"
                        subtitle="Relative to bodyweight"
                        icon={Award}
                        defaultExpanded={false}
                    >
                        <StrengthStandards strengthStandards={strengthStandards} />
                    </CollapsibleSection>
                )}

                {/* Personal Records */}
                {personalRecords && personalRecords.length > 0 && (
                    <CollapsibleSection
                        title="Personal Records"
                        subtitle="Your best performances"
                        icon={Trophy}
                        defaultExpanded={false}
                    >
                        <PersonalRecords personalRecords={personalRecords} />
                    </CollapsibleSection>
                )}

                {/* Weekly Progress */}
                <CollapsibleSection
                    title="Weekly Progress"
                    subtitle="Sets logged this week"
                    icon={Calendar}
                    defaultExpanded={false}
                >
                    <WeeklyProgress weeklyProgress={weeklyProgress} />
                </CollapsibleSection>

                {/* Monthly Trends */}
                {monthlyStats && monthlyStats.length > 0 && (
                    <CollapsibleSection
                        title="Monthly Trends"
                        subtitle="Sets and exercises over time"
                        icon={Calendar}
                        defaultExpanded={false}
                    >
                        <MonthlyTrends monthlyStats={monthlyStats} />
                    </CollapsibleSection>
                )}

                {/* Progressive Overload Insights */}
                {progressiveOverloadInsights && progressiveOverloadInsights.length > 0 && (
                    <CollapsibleSection
                        title="Progressive Overload Analysis"
                        subtitle="Your strength progression insights"
                        icon={Target}
                        defaultExpanded={false}
                    >
                        <ProgressiveOverloadInsights 
                          progressiveOverloadInsights={progressiveOverloadInsights}
                          parentTimeframe={selectedTimeframe}
                        />
                    </CollapsibleSection>
                )}

                {/* RPE Analysis */}
                {rpeAnalysis && rpeAnalysis.length > 0 && (
                    <CollapsibleSection
                        title="Training Intensity (RPE)"
                        subtitle="Rate of Perceived Exertion analysis"
                        icon={Zap}
                        defaultExpanded={false}
                    >
                        <RPEAnalysis rpeAnalysis={rpeAnalysis} />
                    </CollapsibleSection>
                )}

                {/* Volume Analysis */}
                {volumeAnalysis && volumeAnalysis.totalVolume > 0 && (
                    <CollapsibleSection
                        title="Volume Analysis"
                        subtitle="Training volume insights and trends"
                        icon={Activity}
                        defaultExpanded={false}
                    >
                        <VolumeAnalysis 
                          volumeAnalysis={volumeAnalysis}
                          parentTimeframe={selectedTimeframe}
                        />
                    </CollapsibleSection>
                )}
            </ScrollView>
        </View>
    );
}

