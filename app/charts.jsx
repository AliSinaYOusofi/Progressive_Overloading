import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions } from "react-native";
import { BarChart3, TrendingUp, Target, Calendar, Award, Dumbbell, Zap, Trophy, Activity, Filter } from "lucide-react-native";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
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

const { width: screenWidth } = Dimensions.get('window');

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

    const getTimeframeOptions = () => [
        { label: "7 Days", value: 7 },
        { label: "30 Days", value: 30 },
        { label: "90 Days", value: 90 },
        { label: "6 Months", value: 180 }
    ];

    const getExerciseNames = () => {
        return Object.keys(exerciseProgression).slice(0, 5);
    };

    const calculateProgressionRate = (exerciseData) => {
        if (!exerciseData || !Array.isArray(exerciseData) || exerciseData.length < 2) return 0;
        const first = exerciseData[0]?.oneRM || 0;
        const last = exerciseData[exerciseData.length - 1]?.oneRM || 0;
        return last > first ? ((last - first) / first) * 100 : 0;
    };

    const getStrengthLevel = (relativeStrength, exercise) => {
        // Basic strength standards (simplified)
        const standards = {
            'Bench Press': { beginner: 0.75, intermediate: 1.0, advanced: 1.25 },
            'Squat': { beginner: 1.0, intermediate: 1.5, advanced: 2.0 },
            'Deadlift': { beginner: 1.25, intermediate: 1.75, advanced: 2.5 },
            'Overhead Press': { beginner: 0.5, intermediate: 0.75, advanced: 1.0 }
        };
        
        const exerciseStandards = standards[exercise] || { beginner: 0.5, intermediate: 1.0, advanced: 1.5 };
        
        if (relativeStrength >= exerciseStandards.advanced) return { level: "Advanced", color: colors.status.success };
        if (relativeStrength >= exerciseStandards.intermediate) return { level: "Intermediate", color: colors.status.warning };
        return { level: "Beginner", color: colors.status.info };
    };

    // Helper function to format exercise progression data for LineChart
    const formatExerciseDataForChart = (exerciseData, exerciseName) => {
        if (!exerciseData || exerciseData.length === 0) return [];
        
        return exerciseData.map((point, index) => ({
            value: point.oneRM,
            label: index % 2 === 0 ? new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '',
            dataPointText: point.oneRM.toFixed(1),
            labelTextStyle: { color: colors.text.tertiary, fontSize: 9 },
            dataPointTextStyle: { color: colors.text.primary, fontSize: 9 }
        }));
    };

    // Helper function to format volume data for BarChart
    const formatVolumeDataForChart = (volumeData) => {
        if (!volumeData || volumeData.length === 0) return [];
        
        return volumeData.slice(-14).map((day, index) => ({
            value: day.totalVolume,
            label: index % 2 === 0 ? new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '',
            frontColor: colors.primary[600],
            labelTextStyle: { color: colors.text.tertiary, fontSize: 9 }
        }));
    };

    // Helper function to format weekly progress for BarChart
    const formatWeeklyProgressForChart = (weeklyData) => {
        if (!weeklyData || weeklyData.length === 0) return [];
        
        return weeklyData.map((day, index) => ({
            value: day.completed ? 1 : 0,
            label: day.day,
            frontColor: day.completed ? colors.status.success : colors.neutral[300],
            labelTextStyle: { color: colors.text.tertiary, fontSize: 10 }
        }));
    };

    // Helper function to format RPE data for LineChart
    const formatRPEDataForChart = (rpeData) => {
        if (!rpeData || rpeData.length === 0) return [];
        
        return rpeData.slice(-7).map((point, index) => ({
            value: point.rpe,
            label: index % 2 === 0 ? new Date(point.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '',
            dataPointText: point.rpe.toFixed(1),
            labelTextStyle: { color: colors.text.tertiary, fontSize: 8 },
            dataPointTextStyle: { color: colors.text.primary, fontSize: 8 }
        }));
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
                <View className="mb-6">
                    <Text className="text-base font-semibold text-slate-900 mb-3">Time Period:</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {getTimeframeOptions().map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`px-4 py-2 rounded-full border ${
                                    selectedTimeframe === option.value 
                                        ? 'bg-emerald-600 border-emerald-600' 
                                        : 'bg-white border-gray-200'
                                }`}
                                onPress={() => {
                                    setSelectedTimeframe(option.value);
                                    loadChartsData();
                                }}
                            >
                                <Text className={`text-sm font-medium ${
                                    selectedTimeframe === option.value 
                                        ? 'text-white' 
                                        : 'text-slate-700'
                                }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Quick Stats */}
                <View className="flex-row flex-wrap justify-between mb-8">
                    <View className="w-[48%] bg-white p-4 rounded-xl items-center mb-4 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                            <TrendingUp size={24} color={colors.status.success} />
                        </View>
                        <Text className="text-2xl font-bold text-slate-900 mb-1">{userStats?.currentStreak || 0}</Text>
                        <Text className="text-xs text-slate-600 text-center">Day Streak</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-xl items-center mb-4 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                            <Target size={24} color={colors.primary[600]} />
                        </View>
                        <Text className="text-2xl font-bold text-slate-900 mb-1">{userStats?.goalProgress || 0}%</Text>
                        <Text className="text-xs text-slate-600 text-center">Goal Progress</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-xl items-center mb-4 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                            <Dumbbell size={24} color={colors.status.info} />
                        </View>
                        <Text className="text-2xl font-bold text-slate-900 mb-1">{userStats?.workoutCount || 0}</Text>
                        <Text className="text-xs text-slate-600 text-center">Total Sets</Text>
                    </View>
                    <View className="w-[48%] bg-white p-4 rounded-xl items-center mb-4 shadow-sm">
                        <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center mb-2">
                            <Trophy size={24} color={colors.status.warning} />
                        </View>
                        <Text className="text-2xl font-bold text-slate-900 mb-1">{personalRecords?.length || 0}</Text>
                        <Text className="text-xs text-slate-600 text-center">Personal Records</Text>
                    </View>
                </View>

                {/* Exercise Progression Charts */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-slate-900 mb-1">Exercise Progression</Text>
                    <Text className="text-sm text-slate-700 mb-4">1RM progression over time</Text>
                    
                    {Object.keys(exerciseProgression).length > 0 ? (
                        <View className="gap-4">
                            {getExerciseNames().slice(0, 3).map((exerciseName, index) => {
                                const exerciseData = exerciseProgression[exerciseName] || [];
                                const progressionRate = calculateProgressionRate(exerciseData);
                                const firstRM = exerciseData[0]?.oneRM || 0;
                                const lastRM = exerciseData[exerciseData.length - 1]?.oneRM || 0;
                                const chartData = formatExerciseDataForChart(exerciseData, exerciseName);
                                
                                return (
                                    <View key={index} className="bg-white rounded-xl p-4 shadow-sm">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text className="text-base font-semibold text-slate-900 flex-1">{exerciseName}</Text>
                                            <View className="bg-emerald-600 px-2 py-1 rounded-xl">
                                                <Text className="text-xs font-semibold text-white">
                                                    +{progressionRate.toFixed(1)}%
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View className="mb-3">
                                            <View className="flex-row justify-between items-center mb-1">
                                                <Text className="text-xs text-slate-600">First 1RM:</Text>
                                                <Text className="text-sm font-bold text-slate-900">{firstRM.toFixed(1)} kg</Text>
                                            </View>
                                            <View className="flex-row justify-between items-center mb-1">
                                                <Text className="text-xs text-slate-600">Current 1RM:</Text>
                                                <Text className="text-sm font-bold text-slate-900">{lastRM.toFixed(1)} kg</Text>
                                            </View>
                                            <View className="flex-row justify-between items-center mb-1">
                                                <Text className="text-xs text-slate-600">Gain:</Text>
                                                <Text className="text-sm font-bold text-emerald-600">
                                                    +{(lastRM - firstRM).toFixed(1)} kg
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        {/* Line Chart for progression */}
                                        {chartData.length > 1 && (
                                            <View className="h-40 mb-2">
                                                <LineChart
                                                    data={chartData}
                                                    width={screenWidth - 100}
                                                    height={140}
                                                    color={progressionRate > 0 ? colors.status.success : colors.status.warning}
                                                    thickness={2}
                                                    dataPointsColor={progressionRate > 0 ? colors.status.success : colors.status.warning}
                                                    dataPointsRadius={4}
                                                    hideDataPoints={false}
                                                    startFillColor={progressionRate > 0 ? colors.status.success : colors.status.warning}
                                                    endFillColor={progressionRate > 0 ? colors.status.success + '20' : colors.status.warning + '20'}
                                                    startOpacity={0.3}
                                                    endOpacity={0.1}
                                                    areaChart
                                                    hideRules={false}
                                                    rulesType="solid"
                                                    rulesColor={colors.neutral[200]}
                                                    yAxisColor={colors.neutral[200]}
                                                    xAxisColor={colors.neutral[200]}
                                                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 9 }}
                                                    xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9 }}
                                                    showVerticalLines={false}
                                                    showHorizontalLines={true}
                                                    spacing={25}
                                                    initialSpacing={15}
                                                    endSpacing={15}
                                                    yAxisSide="left"
                                                    xAxisSide="bottom"
                                                />
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View className="bg-white rounded-xl p-8 items-center shadow-sm">
                            <Dumbbell size={48} color={colors.text.tertiary} />
                            <Text className="text-base font-semibold text-slate-900 mt-3 mb-1">No exercise data yet</Text>
                            <Text className="text-sm text-slate-700 text-center">Start logging sets to see your progression!</Text>
                        </View>
                    )}
                </View>

                {/* Volume Progression */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-slate-900 mb-1">Volume Progression</Text>
                    <Text className="text-sm text-slate-700 mb-4">Total weight lifted per day</Text>
                    
                    {volumeProgression && volumeProgression.length > 0 ? (
                        <View className="bg-white rounded-xl p-6 shadow-sm">
                            <View className="h-48 mb-6">
                                <BarChart
                                    data={formatVolumeDataForChart(volumeProgression)}
                                    width={screenWidth - 120}
                                    height={180}
                                    barWidth={18}
                                    spacing={8}
                                    roundedTop
                                    roundedBottom
                                    hideRules={false}
                                    rulesType="solid"
                                    rulesColor={colors.neutral[200]}
                                    yAxisColor={colors.neutral[200]}
                                    xAxisColor={colors.neutral[200]}
                                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 9 }}
                                    xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9 }}
                                    showVerticalLines={false}
                                    showHorizontalLines={true}
                                    noOfSections={4}
                                    maxValue={Math.max(...volumeProgression.map(d => d?.totalVolume || 0))}
                                    showYAxisIndices={true}
                                    yAxisIndicesColor={colors.neutral[200]}
                                    yAxisIndicesWidth={1}
                                    yAxisSide="left"
                                    xAxisSide="bottom"
                                />
                            </View>
                            <View className="flex-row justify-around px-4">
                                <View className="items-center flex-1">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {Math.max(...volumeProgression.map(d => d?.totalVolume || 0)).toFixed(0)}
                                    </Text>
                                    <Text className="text-xs text-slate-600 text-center">Max Volume</Text>
                                </View>
                                <View className="items-center flex-1">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {(volumeProgression.reduce((sum, d) => sum + (d?.totalVolume || 0), 0) / volumeProgression.length).toFixed(0)}
                                    </Text>
                                    <Text className="text-xs text-slate-600 text-center">Avg Volume</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="bg-white rounded-xl p-8 items-center shadow-sm">
                            <Activity size={48} color={colors.text.tertiary} />
                            <Text className="text-base font-semibold text-slate-900 mt-3 mb-1">No volume data yet</Text>
                        </View>
                    )}
                </View>

                {/* Strength Standards */}
                {strengthStandards && strengthStandards.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-semibold text-slate-900 mb-1">Strength Standards</Text>
                        <Text className="text-sm text-slate-700 mb-4">Relative to bodyweight</Text>
                        
                        <View className="gap-3">
                            {strengthStandards.map((standard, index) => {
                                const strengthLevel = getStrengthLevel(standard.relativeStrength, standard.exercise);
                                return (
                                    <View key={index} className="bg-white rounded-xl p-4 shadow-sm">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-base font-semibold text-slate-900">{standard.exercise}</Text>
                                            <View 
                                                className="px-2 py-1 rounded-xl"
                                                style={{ backgroundColor: strengthLevel.color }}
                                            >
                                                <Text className="text-xs font-semibold text-white">{strengthLevel.level}</Text>
                                            </View>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-lg font-bold text-slate-900">
                                                {standard.oneRM.toFixed(1)} kg
                                            </Text>
                                            <Text className="text-sm text-slate-700">
                                                {standard.relativeStrength.toFixed(2)}x bodyweight
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                        
                        {/* Strength Level Distribution Pie Chart */}
                        {strengthStandards.length > 1 && (
                            <View className="bg-white rounded-xl p-6 shadow-sm mt-4">
                                <Text className="text-base font-semibold text-slate-900 mb-6 text-center">Strength Level Distribution</Text>
                                <View className="items-center h-48 justify-center">
                                    <PieChart
                                        data={strengthStandards.map((standard, index) => {
                                            const strengthLevel = getStrengthLevel(standard.relativeStrength, standard.exercise);
                                            return {
                                                value: 1,
                                                color: strengthLevel.color,
                                                text: standard.exercise,
                                                textColor: colors.text.white,
                                                textSize: 9
                                            };
                                        })}
                                        radius={70}
                                        innerRadius={35}
                                        centerLabelComponent={() => (
                                            <View className="items-center">
                                                <Text className="text-lg font-bold text-slate-900">
                                                    {strengthStandards.length}
                                                </Text>
                                                <Text className="text-xs text-slate-600">Exercises</Text>
                                            </View>
                                        )}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Personal Records */}
                {personalRecords && personalRecords.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-semibold text-slate-900 mb-1">Personal Records</Text>
                        <Text className="text-sm text-slate-700 mb-4">Your best performances</Text>
                        
                        <View className="gap-3">
                            {personalRecords.slice(0, 5).map((record, index) => (
                                <View key={index} className="bg-white rounded-xl p-4 shadow-sm">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-base font-semibold text-slate-900">{record.exercise}</Text>
                                        <Text className="text-xs text-slate-600">
                                            {new Date(record.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-lg font-bold text-slate-900">
                                            {record.weight} {record.unit || 'kg'}
                                        </Text>
                                        <Text className="text-sm text-slate-700">
                                            {record.reps} reps
                                        </Text>
                                        <Text className="text-sm text-emerald-600 font-semibold">
                                            1RM: {record.oneRM.toFixed(1)} kg
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Weekly Progress */}
                <View className="mb-8">
                    <Text className="text-xl font-semibold text-slate-900 mb-1">Weekly Progress</Text>
                    <Text className="text-sm text-slate-700 mb-4">Sets logged this week</Text>
                    
                    <View className="bg-white rounded-xl p-6 shadow-sm">
                        <View className="h-36 mb-2">
                            <BarChart
                                data={formatWeeklyProgressForChart(weeklyProgress)}
                                width={screenWidth - 100}
                                height={140}
                                barWidth={25}
                                spacing={12}
                                roundedTop
                                roundedBottom
                                hideRules={false}
                                rulesType="solid"
                                rulesColor={colors.neutral[200]}
                                yAxisColor={colors.neutral[200]}
                                xAxisColor={colors.neutral[200]}
                                yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 9 }}
                                xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9 }}
                                showVerticalLines={false}
                                showHorizontalLines={true}
                                noOfSections={1}
                                maxValue={1}
                                showYAxisIndices={false}
                                isAnimated={true}
                                yAxisSide="left"
                                xAxisSide="bottom"
                            />
                        </View>
                    </View>
                </View>

                {/* Monthly Trends */}
                {monthlyStats && monthlyStats.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-semibold text-slate-900 mb-1">Monthly Trends</Text>
                        <Text className="text-sm text-slate-700 mb-4">Sets and exercises over time</Text>
                        
                        <View className="bg-white rounded-xl p-5 shadow-sm">
                            <View className="flex-row justify-between items-end h-20 mb-4">
                                {monthlyStats.map((month, index) => (
                                    <View key={index} className="items-center flex-1">
                                        <View 
                                            className="w-4 rounded-lg min-h-1 mb-2"
                                            style={{ height: Math.max(4, (month?.workouts / 30) * 100) }}
                                        />
                                        <Text className="text-xs text-slate-600">
                                            {new Date(month?.month + '-01').toLocaleDateString('en', { month: 'short' })}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View className="flex-row justify-around">
                                <View className="items-center">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {monthlyStats.reduce((sum, m) => sum + (m?.workouts || 0), 0)}
                                    </Text>
                                    <Text className="text-xs text-slate-600">Unique Exercises</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {monthlyStats.reduce((sum, m) => sum + (m?.totalSets || 0), 0)}
                                    </Text>
                                    <Text className="text-xs text-slate-600">Total Sets</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                {/* Progressive Overload Insights */}
                {progressiveOverloadInsights && progressiveOverloadInsights.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-semibold text-slate-900 mb-1">Progressive Overload Analysis</Text>
                        <Text className="text-sm text-slate-700 mb-4">Your strength progression insights</Text>
                        
                        <View className="gap-3">
                            {progressiveOverloadInsights.slice(0, 5).map((insight, index) => {
                                const getProgressionColor = (progression) => {
                                    switch (progression) {
                                        case 'excellent': return colors.status.success;
                                        case 'good': return colors.primary[600];
                                        case 'stable': return colors.status.warning;
                                        case 'declining': return colors.status.error;
                                        default: return colors.text.tertiary;
                                    }
                                };

                                const getProgressionIcon = (progression) => {
                                    switch (progression) {
                                        case 'excellent': return '🚀';
                                        case 'good': return '📈';
                                        case 'stable': return '➡️';
                                        case 'declining': return '📉';
                                        default: return '❓';
                                    }
                                };

                                return (
                                    <View key={index} className="bg-white rounded-xl p-4 shadow-sm">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-base font-semibold text-slate-900 flex-1">{insight.exercise}</Text>
                                            <View className="flex-row items-center gap-1.5">
                                                <Text className="text-base">
                                                    {getProgressionIcon(insight.progression)}
                                                </Text>
                                                <Text 
                                                    className="text-xs font-semibold"
                                                    style={{ color: getProgressionColor(insight.progression) }}
                                                >
                                                    {insight.progression.charAt(0).toUpperCase() + insight.progression.slice(1)}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View className="gap-1">
                                            <Text className="text-sm font-semibold text-slate-700">
                                                {insight.weeklyGain > 0 ? '+' : ''}{insight.weeklyGain.toFixed(1)}% weekly gain
                                            </Text>
                                            <Text className="text-xs text-slate-600 italic">
                                                {insight.recommendation}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* RPE Analysis */}
                {rpeAnalysis && rpeAnalysis.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-semibold text-slate-900 mb-1">Training Intensity (RPE)</Text>
                        <Text className="text-sm text-slate-700 mb-4">Rate of Perceived Exertion analysis</Text>
                        
                        <View className="gap-3">
                            {rpeAnalysis.slice(0, 4).map((exercise, index) => {
                                const getIntensityColor = (intensity) => {
                                    switch (intensity) {
                                        case 'high': return colors.status.error;
                                        case 'moderate': return colors.status.warning;
                                        case 'low': return colors.status.success;
                                        default: return colors.text.tertiary;
                                    }
                                };

                                return (
                                    <View key={index} className="bg-white rounded-xl p-4 shadow-sm">
                                        <View className="flex-row justify-between items-center mb-2">
                                            <Text className="text-base font-semibold text-slate-900 flex-1">{exercise.exercise}</Text>
                                            <View 
                                                className="px-2 py-1 rounded-xl"
                                                style={{ backgroundColor: getIntensityColor(exercise.intensity) }}
                                            >
                                                <Text className="text-xs font-semibold text-white">
                                                    {exercise.intensity.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View className="flex-row justify-between mb-3">
                                            <Text className="text-sm font-semibold text-slate-700">
                                                Avg RPE: {exercise.avgRPE.toFixed(1)}/10
                                            </Text>
                                            <Text className="text-xs text-slate-600">
                                                {exercise.totalSets} sets logged
                                            </Text>
                                        </View>
                                        
                                        {/* RPE Trend Visualization */}
                                        {exercise.rpeTrend.length > 1 && (
                                            <View className="h-24 mb-2">
                                                <LineChart
                                                    data={formatRPEDataForChart(exercise.rpeTrend)}
                                                    width={screenWidth - 100}
                                                    height={90}
                                                    color={getIntensityColor(exercise.intensity)}
                                                    thickness={2}
                                                    dataPointsColor={getIntensityColor(exercise.intensity)}
                                                    dataPointsRadius={3}
                                                    hideDataPoints={false}
                                                    hideRules={false}
                                                    rulesType="solid"
                                                    rulesColor={colors.neutral[200]}
                                                    yAxisColor={colors.neutral[200]}
                                                    xAxisColor={colors.neutral[200]}
                                                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 8 }}
                                                    xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 8 }}
                                                    showVerticalLines={false}
                                                    showHorizontalLines={true}
                                                    spacing={18}
                                                    initialSpacing={8}
                                                    endSpacing={8}
                                                    maxValue={10}
                                                    noOfSections={5}
                                                    yAxisSide="left"
                                                    xAxisSide="bottom"
                                                />
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Volume Analysis */}
                {volumeAnalysis && volumeAnalysis.totalVolume > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-semibold text-slate-900 mb-1">Volume Analysis</Text>
                        <Text className="text-sm text-slate-700 mb-4">Training volume insights and trends</Text>
                        
                        <View className="bg-white rounded-xl p-5 shadow-sm">
                            <View className="flex-row justify-around mb-4">
                                <View className="items-center">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {volumeAnalysis.totalVolume.toFixed(0)}
                                    </Text>
                                    <Text className="text-xs text-slate-600">Total Volume (kg)</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {volumeAnalysis.avgDailyVolume.toFixed(0)}
                                    </Text>
                                    <Text className="text-xs text-slate-600">Avg Daily Volume</Text>
                                </View>
                                <View className="items-center">
                                    <Text className="text-lg font-bold text-slate-900">
                                        {volumeAnalysis.maxVolume.toFixed(0)}
                                    </Text>
                                    <Text className="text-xs text-slate-600">Peak Volume</Text>
                                </View>
                            </View>
                            
                            <View className="items-center">
                                <Text className="text-sm text-slate-700 font-medium">
                                    Volume Trend: 
                                    <Text 
                                        className="text-sm font-semibold ml-1"
                                        style={{ 
                                            color: volumeAnalysis.trend === 'increasing' ? colors.status.success : 
                                                   volumeAnalysis.trend === 'decreasing' ? colors.status.error : 
                                                   colors.status.warning
                                        }}
                                    >
                                        {volumeAnalysis.trend.charAt(0).toUpperCase() + volumeAnalysis.trend.slice(1)}
                                    </Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

