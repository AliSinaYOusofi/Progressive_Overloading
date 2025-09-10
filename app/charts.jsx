import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { colors } from "../constants/ui_colors";
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

    const loadChartsData = async (isRefresh = false) => {
        try {
            if (!isRefresh) setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            if (!currentUser) return;
            
            setUser(currentUser);

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
                getExerciseProgressionData(currentUser.id, null, selectedTimeframe),
                getVolumeProgressionData(currentUser.id, selectedTimeframe),
                getStrengthStandards(currentUser.id),
                getMonthlyStats(currentUser.id, 6),
                getPersonalRecords(currentUser.id, 10),
                getWeeklyProgress(currentUser.id),
                getRPEAnalysis(currentUser.id, selectedTimeframe),
                getProgressiveOverloadInsights(currentUser.id, selectedTimeframe),
                getVolumeAnalysis(currentUser.id, selectedTimeframe)
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
        loadChartsData();
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text className="mt-4 text-base text-slate-700">Loading your progress...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 60, paddingBottom: 150, flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View className="items-center mb-8">
                    <Text className="text-3xl font-bold text-slate-900 mb-2 text-center">Progressive Overload Analytics</Text>
                    <Text className="text-base text-slate-700 text-center">Track your strength gains and performance</Text>
                </View>

                {/* Timeframe Filter */}
                <TimeframeFilter 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                />

                {/* Quick Stats */}
                <QuickStats 
                    userStats={userStats}
                    personalRecords={personalRecords}
                />

                {/* Exercise Progression Charts */}
                <ExerciseProgression exerciseProgression={exerciseProgression} />

                {/* Volume Progression */}
                <VolumeProgression volumeProgression={volumeProgression} />

                {/* Strength Standards */}
                <StrengthStandards strengthStandards={strengthStandards} />

                {/* Personal Records */}
                <PersonalRecords personalRecords={personalRecords} />

                {/* Weekly Progress */}
                <WeeklyProgress weeklyProgress={weeklyProgress} />

                {/* Monthly Trends */}
                <MonthlyTrends monthlyStats={monthlyStats} />

                {/* Progressive Overload Insights */}
                <ProgressiveOverloadInsights progressiveOverloadInsights={progressiveOverloadInsights} />

                {/* RPE Analysis */}
                <RPEAnalysis rpeAnalysis={rpeAnalysis} />

                {/* Volume Analysis */}
                <VolumeAnalysis volumeAnalysis={volumeAnalysis} />
            </ScrollView>
        </View>
    );
}

