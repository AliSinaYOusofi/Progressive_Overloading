import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
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
    getProgressiveOverloadInsights
} from "../lib/database";

// Import chart components
import QuickStats from "../components/Charts/QuickStats";
import TimeframeFilter from "../components/Charts/TimeframeFilter";
import CollapsibleSection from "../components/Charts/CollapsibleSection";
import ExerciseProgression from "../components/Charts/ExerciseProgression";
import ExerciseProgressionModal from "../components/Charts/ExerciseProgressionModal";
import VolumeProgression from "../components/Charts/VolumeProgression";
import VolumeProgressionModal from "../components/Charts/VolumeProgressionModal";
import StrengthStandards from "../components/Charts/StrengthStandards";
import PersonalRecords from "../components/Charts/PersonalRecords";
import PersonalRecordsModal from "../components/Charts/PersonalRecordsModal";
import WeeklyProgress from "../components/Charts/WeeklyProgress";
import WeeklyProgressModal from "../components/Charts/WeeklyProgressModal";
import MonthlyTrends from "../components/Charts/MonthlyTrends";
import MonthlyTrendsModal from "../components/Charts/MonthlyTrendsModal";
import ProgressiveOverloadInsightsModal from "../components/Charts/ProgressiveOverloadInsightsModal";
import RPEAnalysis from "../components/Charts/RPEAnalysis";


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
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showExerciseProgressionModal, setShowExerciseProgressionModal] = useState(false);
    const [showVolumeProgressionModal, setShowVolumeProgressionModal] = useState(false);
    const [showWeeklyProgressModal, setShowWeeklyProgressModal] = useState(false);
    const [showPersonalRecordsModal, setShowPersonalRecordsModal] = useState(false);
    const [showMonthlyTrendsModal, setShowMonthlyTrendsModal] = useState(false);
    const [showProgressiveOverloadModal, setShowProgressiveOverloadModal] = useState(false);

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
                overloadInsights
            ] = await Promise.all([
                getUserStats(currentUser.id, timeframeValue),
                getExerciseProgressionData(currentUser.id, null, timeframeValue),
                getVolumeProgressionData(currentUser.id, timeframeValue),
                getStrengthStandards(currentUser.id, timeframeValue),
                getMonthlyStats(currentUser.id, timeframeValue),
                getPersonalRecords(currentUser.id, timeframe === 'all' ? 100 : 10, timeframeValue),
                getWeeklyProgress(currentUser.id, timeframeValue),
                getRPEAnalysis(currentUser.id, timeframeValue),
                getProgressiveOverloadInsights(currentUser.id, timeframeValue)
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
        // Calculate days difference from start to end date
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        // Use daysDiff as the timeframe - this will calculate from today backwards
        // Note: This means custom ranges are relative to today, not absolute dates
        setSelectedTimeframe(daysDiff);
        loadChartsData(false, daysDiff);
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
                <View style={{ marginBottom: 24 }}>
                    <TouchableOpacity
                        onPress={() => setShowExerciseProgressionModal(true)}
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 2,
                            marginBottom: 8
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <View 
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                        backgroundColor: colors.primary[100]
                                    }}
                                >
                                    <TrendingUp size={20} color={colors.primary[600]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>Exercise Progression</Text>
                                    <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>1RM progression over time</Text>
                                </View>
                            </View>
                            <View 
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: colors.background.primary
                                }}
                            >
                                <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Volume Progression */}
                <View style={{ marginBottom: 24 }}>
                    <TouchableOpacity
                        onPress={() => setShowVolumeProgressionModal(true)}
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 2,
                            marginBottom: 8
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <View 
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                        backgroundColor: colors.primary[100]
                                    }}
                                >
                                    <BarChart3 size={20} color={colors.primary[600]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>Volume Progression</Text>
                                    <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>Total weight lifted per day</Text>
                                </View>
                            </View>
                            <View 
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: colors.background.primary
                                }}
                            >
                                <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

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
                    <View style={{ marginBottom: 24 }}>
                        <TouchableOpacity
                            onPress={() => setShowPersonalRecordsModal(true)}
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                                padding: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 2
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                    <View 
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.primary[100]
                                        }}
                                    >
                                        <Trophy size={20} color={colors.primary[600]} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>Personal Records</Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>Your best performances</Text>
                                    </View>
                                </View>
                                <View 
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: colors.background.primary
                                    }}
                                >
                                    <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
                                </View>
                            </View>
                            {/* Preview of first 3 records */}
                            <View style={{ marginTop: 16, gap: 12 }}>
                                {personalRecords.slice(0, 3).map((record, index) => (
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            paddingVertical: 10,
                                            paddingHorizontal: 12,
                                            backgroundColor: colors.background.primary,
                                            borderRadius: 8,
                                            borderWidth: 1,
                                            borderColor: colors.border.light,
                                        }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <View style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: colors.primary[100],
                                                marginRight: 10,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 14, 
                                                    fontWeight: "800", 
                                                    color: colors.primary[700],
                                                }}>
                                                    {index + 1}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ 
                                                    fontSize: 15, 
                                                    fontWeight: "700", 
                                                    color: colors.text.primary,
                                                }}>
                                                    {record.exercise}
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 12, 
                                                    color: colors.text.tertiary,
                                                    marginTop: 2,
                                                }}>
                                                    {record.weight} {record.unit || "kg"} × {record.reps} reps
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={{ 
                                                fontSize: 16, 
                                                fontWeight: "800", 
                                                color: colors.primary[600],
                                            }}>
                                                {record.oneRM.toFixed(1)}
                                            </Text>
                                            <Text style={{ 
                                                fontSize: 11, 
                                                color: colors.text.tertiary,
                                                marginTop: 2,
                                            }}>
                                                1RM (kg)
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                                {personalRecords.length > 3 && (
                                    <Text style={{ 
                                        fontSize: 13, 
                                        color: colors.text.tertiary,
                                        textAlign: 'center',
                                        marginTop: 4,
                                        fontStyle: 'italic',
                                    }}>
                                        +{personalRecords.length - 3} more records
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Weekly Progress */}
                <View style={{ marginBottom: 24 }}>
                    <TouchableOpacity
                        onPress={() => setShowWeeklyProgressModal(true)}
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 2
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                <View 
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: colors.primary[100]
                                    }}
                                >
                                    <Calendar size={20} color={colors.primary[600]} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>Weekly Progress</Text>
                                    <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>Sets logged this week</Text>
                                </View>
                            </View>
                            <View 
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: colors.background.primary
                                }}
                            >
                                <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Monthly Trends */}
                {monthlyStats && monthlyStats.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <TouchableOpacity
                            onPress={() => setShowMonthlyTrendsModal(true)}
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                                padding: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 2
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                    <View 
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: colors.primary[100]
                                        }}
                                    >
                                        <Calendar size={20} color={colors.primary[600]} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary }}>Monthly Trends</Text>
                                        <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>Sets and exercises over time</Text>
                                    </View>
                                </View>
                                <View 
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: colors.background.primary
                                    }}
                                >
                                    <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Progressive Overload Insights */}
                {progressiveOverloadInsights && progressiveOverloadInsights.length > 0 && (
                    <View style={{ marginBottom: 24 }}>
                        <TouchableOpacity
                            onPress={() => setShowProgressiveOverloadModal(true)}
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                                padding: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 2
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                                    <View 
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            backgroundColor: colors.primary[100],
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Target size={20} color={colors.primary[600]} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ 
                                            fontSize: 16, 
                                            fontWeight: '700', 
                                            color: colors.text.primary,
                                            marginBottom: 2
                                        }}>
                                            Progressive Overload Analysis
                                        </Text>
                                        <Text style={{ 
                                            fontSize: 13, 
                                            color: colors.text.secondary 
                                        }}>
                                            Your strength progression insights
                                        </Text>
                                    </View>
                                </View>
                                <View 
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 16,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: colors.background.primary
                                    }}
                                >
                                    <Text style={{ fontSize: 18, color: colors.text.tertiary }}>→</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
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

            </ScrollView>

            {/* Exercise Progression Modal */}
            <ExerciseProgressionModal
                visible={showExerciseProgressionModal}
                onClose={() => setShowExerciseProgressionModal(false)}
                exerciseProgression={exerciseProgression}
            />

            {/* Volume Progression Modal */}
            <VolumeProgressionModal
                visible={showVolumeProgressionModal}
                onClose={() => setShowVolumeProgressionModal(false)}
                volumeProgression={volumeProgression}
            />

            {/* Weekly Progress Modal */}
            <WeeklyProgressModal
                visible={showWeeklyProgressModal}
                onClose={() => setShowWeeklyProgressModal(false)}
                weeklyProgress={weeklyProgress}
                userId={user?.id}
            />

            {/* Personal Records Modal */}
            <PersonalRecordsModal
                visible={showPersonalRecordsModal}
                onClose={() => setShowPersonalRecordsModal(false)}
                personalRecords={personalRecords}
            />

            {/* Monthly Trends Modal */}
            <MonthlyTrendsModal
                visible={showMonthlyTrendsModal}
                onClose={() => setShowMonthlyTrendsModal(false)}
                monthlyStats={monthlyStats}
            />

            {/* Progressive Overload Insights Modal */}
            <ProgressiveOverloadInsightsModal
                visible={showProgressiveOverloadModal}
                onClose={() => setShowProgressiveOverloadModal(false)}
                progressiveOverloadInsights={progressiveOverloadInsights}
                parentTimeframe={selectedTimeframe}
            />
        </View>
    );
}

