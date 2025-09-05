import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { BarChart3, TrendingUp, Target, Calendar, Award, Dumbbell, Zap, Trophy, Activity, Filter } from "lucide-react-native";
import { colors } from "../constants/ui_colors";
import { 
    getCurrentUser, 
    getUserStats, 
    getExerciseProgressionData, 
    getVolumeProgressionData, 
    getStrengthStandards, 
    getMonthlyStats, 
    getPersonalRecords,
    getWeeklyProgress 
} from "../lib/database";

export default function ChartsScreen() {
    const [user, setUser] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [exerciseProgression, setExerciseProgression] = useState({});
    const [volumeProgression, setVolumeProgression] = useState([]);
    const [strengthStandards, setStrengthStandards] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [weeklyProgress, setWeeklyProgress] = useState([]);
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
                weekly
            ] = await Promise.all([
                getUserStats(currentUser.id),
                getExerciseProgressionData(currentUser.id, null, selectedTimeframe),
                getVolumeProgressionData(currentUser.id, selectedTimeframe),
                getStrengthStandards(currentUser.id),
                getMonthlyStats(currentUser.id, 6),
                getPersonalRecords(currentUser.id, 10),
                getWeeklyProgress(currentUser.id)
            ]);

            setUserStats(stats);
            setExerciseProgression(progression);
            setVolumeProgression(volume);
            setStrengthStandards(standards);
            setMonthlyStats(monthly);
            setPersonalRecords(records);
            setWeeklyProgress(weekly);
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={styles.loadingText}>Loading your progress...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollView} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Progressive Overload Analytics</Text>
                    <Text style={styles.subtitle}>Track your strength gains and performance</Text>
                </View>

                {/* Timeframe Filter */}
                <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Time Period:</Text>
                    <View style={styles.filterButtons}>
                        {getTimeframeOptions().map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.filterButton,
                                    selectedTimeframe === option.value && styles.filterButtonActive
                                ]}
                                onPress={() => {
                                    setSelectedTimeframe(option.value);
                                    loadChartsData();
                                }}
                            >
                                <Text style={[
                                    styles.filterButtonText,
                                    selectedTimeframe === option.value && styles.filterButtonTextActive
                                ]}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <TrendingUp size={24} color={colors.status.success} />
                        </View>
                        <Text style={styles.statValue}>{userStats?.currentStreak || 0}</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Target size={24} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.statValue}>{userStats?.goalProgress || 0}%</Text>
                        <Text style={styles.statLabel}>Goal Progress</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Dumbbell size={24} color={colors.status.info} />
                        </View>
                        <Text style={styles.statValue}>{userStats?.workoutCount || 0}</Text>
                        <Text style={styles.statLabel}>Total Sets</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Trophy size={24} color={colors.status.warning} />
                        </View>
                        <Text style={styles.statValue}>{personalRecords?.length || 0}</Text>
                        <Text style={styles.statLabel}>Personal Records</Text>
                    </View>
                </View>

                {/* Exercise Progression Charts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Exercise Progression</Text>
                    <Text style={styles.sectionSubtitle}>1RM progression over time</Text>
                    
                    {Object.keys(exerciseProgression).length > 0 ? (
                        <View style={styles.exerciseGrid}>
                            {getExerciseNames().map((exerciseName, index) => {
                                const exerciseData = exerciseProgression[exerciseName] || [];
                                const progressionRate = calculateProgressionRate(exerciseData);
                                const firstRM = exerciseData[0]?.oneRM || 0;
                                const lastRM = exerciseData[exerciseData.length - 1]?.oneRM || 0;
                                
                                return (
                                    <View key={index} style={styles.exerciseCard}>
                                        <View style={styles.exerciseHeader}>
                                            <Text style={styles.exerciseName}>{exerciseName}</Text>
                                            <View style={styles.progressionBadge}>
                                                <Text style={styles.progressionText}>
                                                    +{progressionRate.toFixed(1)}%
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        <View style={styles.exerciseStats}>
                                            <View style={styles.statRow}>
                                                <Text style={styles.statLabel}>First 1RM:</Text>
                                                <Text style={styles.statValue}>{firstRM.toFixed(1)} kg</Text>
                                            </View>
                                            <View style={styles.statRow}>
                                                <Text style={styles.statLabel}>Current 1RM:</Text>
                                                <Text style={styles.statValue}>{lastRM.toFixed(1)} kg</Text>
                                            </View>
                                            <View style={styles.statRow}>
                                                <Text style={styles.statLabel}>Gain:</Text>
                                                <Text style={[styles.statValue, { color: colors.status.success }]}>
                                                    +{(lastRM - firstRM).toFixed(1)} kg
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        {/* Simple progression chart */}
                                        <View style={styles.miniChart}>
                                            {exerciseData.slice(-7).map((point, i) => {
                                                const maxOneRM = Math.max(...exerciseData.map(d => d?.oneRM || 0));
                                                return (
                                                    <View key={i} style={styles.miniBarContainer}>
                                                        <View 
                                                            style={[
                                                                styles.miniBar,
                                                                { 
                                                                    height: Math.max(4, maxOneRM > 0 ? (point?.oneRM / maxOneRM) * 40 : 4),
                                                                    backgroundColor: progressionRate > 0 ? colors.status.success : colors.status.warning
                                                                }
                                                            ]} 
                                                        />
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Dumbbell size={48} color={colors.text.tertiary} />
                            <Text style={styles.emptyText}>No exercise data yet</Text>
                            <Text style={styles.emptySubtext}>Start logging sets to see your progression!</Text>
                        </View>
                    )}
                </View>

                {/* Volume Progression */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Volume Progression</Text>
                    <Text style={styles.sectionSubtitle}>Total weight lifted per day</Text>
                    
                    {volumeProgression && volumeProgression.length > 0 ? (
                        <View style={styles.chartContainer}>
                            <View style={styles.volumeChart}>
                                {volumeProgression.slice(-14).map((day, index) => {
                                    const maxVolume = Math.max(...volumeProgression.map(d => d?.totalVolume || 0));
                                    return (
                                        <View key={index} style={styles.volumeBarContainer}>
                                            <View 
                                                style={[
                                                    styles.volumeBar,
                                                    { 
                                                        height: Math.max(4, maxVolume > 0 ? (day?.totalVolume / maxVolume) * 80 : 4),
                                                        backgroundColor: colors.primary[600]
                                                    }
                                                ]} 
                                            />
                                            <Text style={styles.volumeBarLabel}>
                                                {new Date(day?.date).getDate()}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <View style={styles.volumeStats}>
                                <View style={styles.volumeStat}>
                                    <Text style={styles.volumeStatValue}>
                                        {Math.max(...volumeProgression.map(d => d?.totalVolume || 0)).toFixed(0)}
                                    </Text>
                                    <Text style={styles.volumeStatLabel}>Max Volume</Text>
                                </View>
                                <View style={styles.volumeStat}>
                                    <Text style={styles.volumeStatValue}>
                                        {(volumeProgression.reduce((sum, d) => sum + (d?.totalVolume || 0), 0) / volumeProgression.length).toFixed(0)}
                                    </Text>
                                    <Text style={styles.volumeStatLabel}>Avg Volume</Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Activity size={48} color={colors.text.tertiary} />
                            <Text style={styles.emptyText}>No volume data yet</Text>
                        </View>
                    )}
                </View>

                {/* Strength Standards */}
                {strengthStandards && strengthStandards.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Strength Standards</Text>
                        <Text style={styles.sectionSubtitle}>Relative to bodyweight</Text>
                        
                        <View style={styles.standardsContainer}>
                            {strengthStandards.map((standard, index) => {
                                const strengthLevel = getStrengthLevel(standard.relativeStrength, standard.exercise);
                                return (
                                    <View key={index} style={styles.standardCard}>
                                        <View style={styles.standardHeader}>
                                            <Text style={styles.standardExercise}>{standard.exercise}</Text>
                                            <View style={[styles.strengthBadge, { backgroundColor: strengthLevel.color }]}>
                                                <Text style={styles.strengthLevel}>{strengthLevel.level}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.standardStats}>
                                            <Text style={styles.standardValue}>
                                                {standard.oneRM.toFixed(1)} kg
                                            </Text>
                                            <Text style={styles.standardRelative}>
                                                {standard.relativeStrength.toFixed(2)}x bodyweight
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Personal Records */}
                {personalRecords && personalRecords.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Personal Records</Text>
                        <Text style={styles.sectionSubtitle}>Your best performances</Text>
                        
                        <View style={styles.recordsContainer}>
                            {personalRecords.slice(0, 5).map((record, index) => (
                                <View key={index} style={styles.recordCard}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordExercise}>{record.exercise}</Text>
                                        <Text style={styles.recordDate}>
                                            {new Date(record.date).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View style={styles.recordStats}>
                                        <Text style={styles.recordWeight}>
                                            {record.weight} {record.unit || 'kg'}
                                        </Text>
                                        <Text style={styles.recordReps}>
                                            {record.reps} reps
                                        </Text>
                                        <Text style={styles.recordOneRM}>
                                            1RM: {record.oneRM.toFixed(1)} kg
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Weekly Progress */}
                <View style={[styles.section, styles.lastSection]}>
                    <Text style={styles.sectionTitle}>Weekly Progress</Text>
                    <Text style={styles.sectionSubtitle}>Sets logged this week</Text>
                    
                    <View style={styles.chartContainer}>
                        <View style={styles.barChart}>
                            {weeklyProgress.map((day, index) => (
                                <View key={index} style={styles.barColumn}>
                                    <View style={styles.barContainer}>
                                        <View 
                                            style={[
                                                styles.bar, 
                                                { 
                                                    height: day.completed ? 60 : 20,
                                                    backgroundColor: day.completed ? colors.status.success : colors.neutral[300]
                                                }
                                            ]} 
                                        />
                                    </View>
                                    <Text style={styles.barLabel}>{day.day}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Monthly Trends */}
                {monthlyStats && monthlyStats.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Monthly Trends</Text>
                        <Text style={styles.sectionSubtitle}>Sets and exercises over time</Text>
                        
                        <View style={styles.trendCard}>
                            <View style={styles.trendChart}>
                                {monthlyStats.map((month, index) => (
                                    <View key={index} style={styles.trendBar}>
                                        <View 
                                            style={[
                                                styles.trendBarFill, 
                                                { height: Math.max(4, (month?.workouts / 30) * 100) }
                                            ]} 
                                        />
                                        <Text style={styles.trendBarLabel}>
                                            {new Date(month?.month + '-01').toLocaleDateString('en', { month: 'short' })}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.trendStats}>
                                <View style={styles.trendStat}>
                                    <Text style={styles.trendStatValue}>
                                        {monthlyStats.reduce((sum, m) => sum + (m?.workouts || 0), 0)}
                                    </Text>
                                    <Text style={styles.trendStatLabel}>Unique Exercises</Text>
                                </View>
                                <View style={styles.trendStat}>
                                    <Text style={styles.trendStatValue}>
                                        {monthlyStats.reduce((sum, m) => sum + (m?.totalSets || 0), 0)}
                                    </Text>
                                    <Text style={styles.trendStatLabel}>Total Sets</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 150,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.primary,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: colors.text.secondary,
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: "center",
    },
    filterContainer: {
        marginBottom: 24,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 12,
    },
    filterButtons: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.background.card,
        borderWidth: 1,
        borderColor: colors.neutral[200],
    },
    filterButtonActive: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
    },
    filterButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: colors.text.secondary,
    },
    filterButtonTextActive: {
        color: colors.text.white,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    statCard: {
        width: "48%",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
        textAlign: "center",
    },
    section: {
        marginBottom: 30,
    },
    lastSection: {
        marginBottom: 50,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 16,
    },
    exerciseGrid: {
        gap: 16,
    },
    exerciseCard: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    exerciseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        flex: 1,
    },
    progressionBadge: {
        backgroundColor: colors.status.success,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    progressionText: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.white,
    },
    exerciseStats: {
        marginBottom: 12,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    miniChart: {
        flexDirection: "row",
        alignItems: "flex-end",
        height: 40,
        gap: 2,
    },
    miniBarContainer: {
        flex: 1,
        alignItems: "center",
    },
    miniBar: {
        width: 8,
        borderRadius: 4,
        minHeight: 4,
    },
    emptyState: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 32,
        alignItems: "center",
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginTop: 12,
        marginBottom: 4,
    },
    emptySubtext: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: "center",
    },
    chartContainer: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 20,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    volumeChart: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 100,
        marginBottom: 16,
    },
    volumeBarContainer: {
        alignItems: "center",
        flex: 1,
    },
    volumeBar: {
        width: 12,
        borderRadius: 6,
        minHeight: 4,
        marginBottom: 8,
    },
    volumeBarLabel: {
        fontSize: 10,
        color: colors.text.tertiary,
    },
    volumeStats: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    volumeStat: {
        alignItems: "center",
    },
    volumeStatValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text.primary,
    },
    volumeStatLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    standardsContainer: {
        gap: 12,
    },
    standardCard: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    standardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    standardExercise: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
    },
    strengthBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    strengthLevel: {
        fontSize: 12,
        fontWeight: "600",
        color: colors.text.white,
    },
    standardStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    standardValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text.primary,
    },
    standardRelative: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    recordsContainer: {
        gap: 12,
    },
    recordCard: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    recordExercise: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
    },
    recordDate: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    recordStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    recordWeight: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text.primary,
    },
    recordReps: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    recordOneRM: {
        fontSize: 14,
        color: colors.status.success,
        fontWeight: "600",
    },
    barChart: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 100,
    },
    barColumn: {
        alignItems: "center",
        flex: 1,
    },
    barContainer: {
        height: 80,
        justifyContent: "flex-end",
        marginBottom: 8,
    },
    bar: {
        width: 20,
        borderRadius: 10,
        minHeight: 4,
    },
    barLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    trendCard: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 20,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    trendChart: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 80,
        marginBottom: 16,
    },
    trendBar: {
        alignItems: "center",
        flex: 1,
    },
    trendBarFill: {
        width: 16,
        backgroundColor: colors.primary[600],
        borderRadius: 8,
        minHeight: 4,
        marginBottom: 8,
    },
    trendBarLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    trendStats: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    trendStat: {
        alignItems: "center",
    },
    trendStatValue: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text.primary,
    },
    trendStatLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
});
