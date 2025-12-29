import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { ChevronDown, Filter, TrendingUp, TrendingDown, Trophy, Activity, Target, Dumbbell, Award } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { LineChart } from "react-native-gifted-charts";
import { getCurrentUser } from "../../lib/database";
import ExerciseDetailModal from "./ExerciseDetailModal";
import ExerciseProgressionCard from "./ExerciseProgressionCard";
import ExerciseProgressionEmptyState from "./ExerciseProgressionEmptyState";
import ExerciseProgressionFilterModal from "./ExerciseProgressionFilterModal";
import { getExerciseList, sortExerciseList, calculateProgressionRate } from "./utils/exerciseProgressionUtils";

const { width: screenWidth } = Dimensions.get('window');

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

// Helper to remove floating point noise (e.g. 13.200000000000001) at a given precision
const normalizeNumber = (num, decimals = 1) => {
    const n = Number(num);
    if (!Number.isFinite(n)) return 0;
    return Number(n.toFixed(decimals));
};

// Helper function to format numbers with max 1 decimal place, removing trailing zeros
const formatNumber = (num) => {
    // Round to 1 decimal place and convert to string
    const str = num.toFixed(1);
    // Remove trailing zeros and decimal point if not needed
    return str.replace(/\.?0+$/, '');
};

export default function ExerciseProgression({ exerciseProgression }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [userId, setUserId] = useState(null);
    const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [sortBy, setSortBy] = useState('last1RM');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        const user = await getCurrentUser();
        if (user) {
            setUserId(user.id);
        }
    };

    const handleExercisePress = (exerciseName) => {
        setSelectedExercise(exerciseName);
        setShowDetailModal(true);
    };

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + LOAD_MORE_COUNT);
    };

    // Reset visible count when exerciseProgression or sort changes
    useEffect(() => {
        setVisibleCount(INITIAL_DISPLAY_COUNT);
    }, [exerciseProgression, sortBy, sortOrder]);
    
    const handleSortChange = (newSortBy, newSortOrder) => {
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
    };

    if (!exerciseProgression) {
        return null;
    }

    const exerciseList = getExerciseList(exerciseProgression);
    const sortedExerciseList = sortExerciseList(exerciseList, sortBy, sortOrder);
    const visibleExercises = sortedExerciseList.slice(0, visibleCount);
    const hasMore = sortedExerciseList.length > visibleCount;
    const remainingCount = sortedExerciseList.length - visibleCount;

    // Calculate comprehensive summary statistics
    const summaryStats = useMemo(() => {
        if (!exerciseList || exerciseList.length === 0) {
            return {
                totalExercises: 0,
                totalRecords: 0,
                averageProgression: 0,
                bestProgression: null,
                strongestExercise: null,
                mostTracked: null,
                improvingExercises: 0,
                decliningExercises: 0,
                average1RM: 0,
            };
        }

        const totalRecords = exerciseList.reduce((sum, ex) => sum + (ex.data?.length || 0), 0);
        const progressions = exerciseList.map(ex => ex.progressionRate).filter(p => !isNaN(p) && isFinite(p));
        const averageProgression = progressions.length > 0 
            ? progressions.reduce((sum, p) => sum + p, 0) / progressions.length 
            : 0;
        
        const bestProgression = exerciseList.reduce((best, current) => {
            if ((current.progressionRate || 0) > (best?.progressionRate || 0)) {
                return current;
            }
            return best;
        }, null);

        const strongestExercise = exerciseList.reduce((strongest, current) => {
            if ((current.last1RM || 0) > (strongest?.last1RM || 0)) {
                return current;
            }
            return strongest;
        }, null);

        const mostTracked = exerciseList.reduce((most, current) => {
            if ((current.data?.length || 0) > (most?.data?.length || 0)) {
                return current;
            }
            return most;
        }, null);

        const improvingExercises = exerciseList.filter(ex => ex.progressionRate > 0).length;
        const decliningExercises = exerciseList.filter(ex => ex.progressionRate < 0).length;

        const all1RMs = exerciseList.map(ex => ex.last1RM).filter(rm => rm > 0);
        const average1RM = all1RMs.length > 0 
            ? all1RMs.reduce((sum, rm) => sum + rm, 0) / all1RMs.length 
            : 0;

        return {
            totalExercises: exerciseList.length,
            totalRecords,
            averageProgression,
            bestProgression,
            strongestExercise,
            mostTracked,
            improvingExercises,
            decliningExercises,
            average1RM,
        };
    }, [exerciseList]);

    // Prepare data for overall progression chart (top exercises by 1RM)
    const topExercisesChartData = useMemo(() => {
        if (!exerciseList || exerciseList.length === 0) return [];
        
        const sortedBy1RM = [...exerciseList]
            .sort((a, b) => b.last1RM - a.last1RM)
            .slice(0, 8); // Top 8 exercises
        
        return sortedBy1RM.map((exercise) => {
            const name = exercise.name.length > 10 
                ? exercise.name.substring(0, 10) + '...' 
                : exercise.name;
            
            // Clean up any floating point noise so gifted-charts doesn't render long decimals in the top label
            const clean1RM = normalizeNumber(exercise.last1RM, 1);

            // Format 1RM to show max 1 decimal place, removing trailing zeros
            const formatted1RM = formatNumber(clean1RM);
            
            return {
                value: clean1RM,
                label: name,
                labelTextStyle: { 
                    color: colors.text.tertiary, 
                    fontSize: 9,
                    fontWeight: '500',
                },
                dataPointText: formatted1RM,
                textShiftY: -10,
                textShiftX: -5,
                textColor: isDarkMode ? colors.text.white : colors.text.primary,
                textFontSize: 9,
                dataPointTextStyle: {
                    color: isDarkMode ? colors.text.white : colors.text.primary,
                    fontSize: 9,
                    fontWeight: '600',
                },
            };
        });
    }, [exerciseList, colors, isDarkMode]);

    // Prepare data for progression rate chart (top improving exercises)
    const progressionChartData = useMemo(() => {
        if (!exerciseList || exerciseList.length === 0) return [];
        
        const sortedByProgression = [...exerciseList]
            .sort((a, b) => b.progressionRate - a.progressionRate)
            .slice(0, 8); // Top 8 by progression
        
        return sortedByProgression.map((exercise) => {
            const name = exercise.name.length > 10 
                ? exercise.name.substring(0, 10) + '...' 
                : exercise.name;
            
            const isPositive = exercise.progressionRate >= 0;
            const color = isPositive ? colors.status.success : colors.status.error;

            // Clean up any floating point noise so gifted-charts doesn't render long decimals in the top label
            const cleanRate = normalizeNumber(exercise.progressionRate, 1);
            
            // Format progression rate to show max 1 decimal place, removing trailing zeros
            const formattedRate = formatNumber(cleanRate);
            
            return {
                value: Math.abs(cleanRate),
                label: name,
                labelTextStyle: { 
                    color: colors.text.tertiary, 
                    fontSize: 9,
                    fontWeight: '500',
                },
                dataPointText: `${isPositive ? '+' : ''}${formattedRate}%`,
                textShiftY: -10,
                textShiftX: -5,
                textColor: isDarkMode ? colors.text.white : colors.text.primary,
                textFontSize: 9,
                dataPointTextStyle: {
                    color: isDarkMode ? colors.text.white : colors.text.primary,
                    fontSize: 9,
                    fontWeight: '600',
                },
            };
        });
    }, [exerciseList, colors, isDarkMode]);

    // Get top improving exercises
    const topImprovingExercises = useMemo(() => {
        if (!exerciseList || exerciseList.length === 0) return [];
        
        return [...exerciseList]
            .filter(ex => ex.progressionRate > 0)
            .sort((a, b) => b.progressionRate - a.progressionRate)
            .slice(0, 5);
    }, [exerciseList]);

    // Get top declining exercises (for awareness)
    const topDecliningExercises = useMemo(() => {
        if (!exerciseList || exerciseList.length === 0) return [];
        
        return [...exerciseList]
            .filter(ex => ex.progressionRate < 0)
            .sort((a, b) => a.progressionRate - b.progressionRate)
            .slice(0, 3);
    }, [exerciseList]);

    return (
        <View>
            {exerciseList.length > 0 ? (
                <View>
                    {/* Summary Statistics */}
                    <View style={{ 
                        flexDirection: "row", 
                        flexWrap: "wrap", 
                        gap: 12,
                        marginBottom: 24 
                    }}>
                        <View style={{ 
                            flex: 1,
                            minWidth: "47%",
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <Dumbbell size={18} color={colors.icon.primary} />
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.tertiary,
                                    fontWeight: "500",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}>
                                    Total Exercises
                                </Text>
                            </View>
                            <Text style={{ 
                                fontSize: 24, 
                                fontWeight: "800", 
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                            }}>
                                {summaryStats.totalExercises}
                            </Text>
                            <Text style={{ 
                                fontSize: 14, 
                                color: colors.text.secondary,
                                marginTop: 2,
                            }}>
                                {summaryStats.totalRecords} {summaryStats.totalRecords === 1 ? 'record' : 'records'}
                            </Text>
                        </View>

                        <View style={{ 
                            flex: 1,
                            minWidth: "47%",
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <TrendingUp size={18} color={colors.icon.primary} />
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.tertiary,
                                    fontWeight: "500",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}>
                                    Avg Progression
                                </Text>
                            </View>
                            <Text style={{ 
                                fontSize: 24, 
                                fontWeight: "800", 
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                            }}>
                                {summaryStats.averageProgression >= 0 ? '+' : ''}{summaryStats.averageProgression.toFixed(1)}%
                            </Text>
                            <Text style={{ 
                                fontSize: 14, 
                                color: colors.text.secondary,
                                marginTop: 2,
                            }}>
                                across all exercises
                            </Text>
                        </View>

                        {summaryStats.strongestExercise && (
                            <View style={{ 
                                flex: 1,
                                minWidth: "47%",
                                backgroundColor: colors.background.card,
                                borderRadius: 12,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                            }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                    <Trophy size={18} color={colors.primary[600]} />
                                    <Text style={{ 
                                        fontSize: 12, 
                                        color: colors.text.tertiary,
                                        fontWeight: "500",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}>
                                        Strongest
                                    </Text>
                                </View>
                                <Text style={{ 
                                    fontSize: 20, 
                                    fontWeight: "800", 
                                    color: colors.text.primary,
                                    letterSpacing: -0.5,
                                }}>
                                    {summaryStats.strongestExercise.last1RM.toFixed(1).replace(/\.?0+$/, '')} kg
                                </Text>
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }} numberOfLines={1}>
                                    {summaryStats.strongestExercise.name}
                                </Text>
                            </View>
                        )}

                        <View style={{ 
                            flex: 1,
                            minWidth: "47%",
                            backgroundColor: colors.background.card,
                            borderRadius: 12,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                <Activity size={18} color={colors.primary[600]} />
                                <Text style={{ 
                                    fontSize: 12, 
                                    color: colors.text.tertiary,
                                    fontWeight: "500",
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                }}>
                                    Performance
                                </Text>
                            </View>
                            <Text style={{ 
                                fontSize: 20, 
                                fontWeight: "800", 
                                color: colors.text.primary,
                                letterSpacing: -0.5,
                            }}>
                                {summaryStats.improvingExercises}/{summaryStats.totalExercises}
                            </Text>
                            <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.secondary,
                                marginTop: 2,
                            }}>
                                exercises improving
                            </Text>
                        </View>
                    </View>

                    {/* Performance Overview */}
                    {summaryStats.improvingExercises > 0 && (
                        <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: colors.status.success + '15',
                            borderRadius: 12,
                            padding: 14,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.status.success + '30',
                        }}>
                            <TrendingUp size={20} color={colors.status.success} />
                            <View style={{ marginLeft: 12, flex: 1 }}>
                                <Text style={{ 
                                    fontSize: 15, 
                                    fontWeight: "700", 
                                    color: colors.text.primary,
                                }}>
                                    {summaryStats.improvingExercises} {summaryStats.improvingExercises === 1 ? 'Exercise' : 'Exercises'} Improving
                                </Text>
                                <Text style={{ 
                                    fontSize: 13, 
                                    color: colors.text.secondary,
                                    marginTop: 2,
                                }}>
                                    {summaryStats.decliningExercises > 0 
                                        ? `${summaryStats.decliningExercises} ${summaryStats.decliningExercises === 1 ? 'exercise' : 'exercises'} declining`
                                        : 'All exercises showing positive trends!'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Top Exercises by 1RM Chart */}
                    {topExercisesChartData.length > 0 && (
                        <View style={{ 
                            backgroundColor: colors.background.primary,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                            overflow: 'hidden' // Prevent chart from extending beyond container
                        }}>
                            <Text style={{ 
                                fontSize: 16, 
                                fontWeight: "600", 
                                color: colors.text.primary,
                                marginBottom: 16 
                            }}>
                                Top Exercises by 1RM
                            </Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <LineChart
                                    data={topExercisesChartData}
                                    width={screenWidth - 120} // Account for container padding (16*2) + screen margins (48*2)
                                    height={200}
                                    spacing={100}
                                    initialSpacing={20}
                                    thickness={3}
                                    color={colors.primary[600]}
                                    curved={true}
                                    areaChart={true}
                                    startFillColor={colors.primary[600] + '40'}
                                    endFillColor={colors.primary[600] + '10'}
                                    startOpacity={0.4}
                                    endOpacity={0.1}
                                    dataPointsColor={colors.primary[600]}
                                    dataPointsRadius={4}
                                    hideDataPoints={false}
                                    hideRules={false}
                                    rulesType="solid"
                                    rulesColor={colors.border.light}
                                    yAxisColor={colors.border.light}
                                    xAxisColor={colors.border.light}
                                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                                    xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: '500' }}
                                    yAxisLabelWidth={40}
                                    maxValue={Math.max(...topExercisesChartData.map(d => d.value)) * 1.1 || 100}
                                    noOfSections={4}
                                    yAxisThickness={1}
                                    xAxisThickness={1}
                                    showTextOnDataPoints={true}
                                    textBackgroundColor="transparent"
                                />
                            </View>
                        </View>
                    )}

                    {/* Progression Rate Chart */}
                    {progressionChartData.length > 0 && (
                        <View style={{ 
                            backgroundColor: colors.background.primary,
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                            overflow: 'hidden' // Prevent chart from extending beyond container
                        }}>
                            <Text style={{ 
                                fontSize: 16, 
                                fontWeight: "600", 
                                color: colors.text.primary,
                                marginBottom: 16 
                            }}>
                                Progression Rates
                            </Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <LineChart
                                    data={progressionChartData}
                                    width={screenWidth - 120} // Account for container padding (16*2) + screen margins (48*2)
                                    height={200}
                                    spacing={100}
                                    initialSpacing={20}
                                    thickness={3}
                                    color={colors.status.success}
                                    curved={true}
                                    areaChart={true}
                                    startFillColor={colors.status.success + '40'}
                                    endFillColor={colors.status.success + '10'}
                                    startOpacity={0.4}
                                    endOpacity={0.1}
                                    dataPointsColor={colors.status.success}
                                    dataPointsRadius={4}
                                    hideDataPoints={false}
                                    hideRules={false}
                                    rulesType="solid"
                                    rulesColor={colors.border.light}
                                    yAxisColor={colors.border.light}
                                    xAxisColor={colors.border.light}
                                    yAxisTextStyle={{ color: colors.text.tertiary, fontSize: 10, fontWeight: '500' }}
                                    xAxisLabelTextStyle={{ color: colors.text.tertiary, fontSize: 9, fontWeight: '500' }}
                                    yAxisLabelWidth={40}
                                    maxValue={Math.max(...progressionChartData.map(d => d.value)) * 1.1 || 50}
                                    noOfSections={4}
                                    yAxisThickness={1}
                                    xAxisThickness={1}
                                    showTextOnDataPoints={true}
                                    textBackgroundColor="transparent"
                                />
                            </View>
                        </View>
                    )}

                    {/* Top Improving Exercises */}
                    {topImprovingExercises.length > 0 && (
                        <View style={{ 
                            marginBottom: 24,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                <View style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: colors.background.secondary || colors.neutral[100],
                                }}>
                                    <Award size={18} color={colors.icon.primary} />
                                </View>
                                <Text style={{ 
                                    fontSize: 16, 
                                    fontWeight: "600", 
                                    color: colors.text.primary,
                                }}>
                                    Top Improving Exercises
                                </Text>
                            </View>
                            {topImprovingExercises.map((exercise, index) => {
                                const first1RM = exercise.data[0]?.oneRM || 0;
                                const improvement = exercise.last1RM - first1RM;
                                
                                return (
                                    <View
                                        key={exercise.name}
                                        style={{
                                            backgroundColor: colors.background.card,
                                            borderRadius: 14,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: colors.border.light,
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 2,
                                            elevation: 1,
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                                            {/* Rank Badge */}
                                            <View style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: colors.background.secondary || colors.neutral[100],
                                                marginRight: 12,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 14, 
                                                    fontWeight: "700", 
                                                    color: colors.text.secondary,
                                                }}>
                                                    #{index + 1}
                                                </Text>
                                            </View>
                                            
                                            {/* Exercise Info */}
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: "600", 
                                                    color: colors.text.primary,
                                                    marginBottom: 4,
                                                }}>
                                                    {exercise.name}
                                                </Text>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                    }}>
                                                        {exercise.data.length} {exercise.data.length === 1 ? 'record' : 'records'}
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                    }}>
                                                        •
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                    }}>
                                                        {exercise.last1RM.toFixed(1)} kg current
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        {/* Improvement Stats */}
                                        <View style={{ 
                                            flexDirection: "row", 
                                            alignItems: "center", 
                                            justifyContent: "space-between",
                                            paddingTop: 12,
                                            borderTopWidth: 1,
                                            borderTopColor: colors.border.light,
                                        }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <TrendingUp size={14} color={colors.icon.primary} />
                                                <View>
                                                    <Text style={{ 
                                                        fontSize: 13, 
                                                        fontWeight: "600", 
                                                        color: colors.text.secondary,
                                                    }}>
                                                        {improvement > 0 ? '+' : ''}{improvement.toFixed(1)} kg
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 11, 
                                                        color: colors.text.tertiary,
                                                        marginTop: 2,
                                                    }}>
                                                        improvement
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ alignItems: "flex-end" }}>
                                                <Text style={{ 
                                                    fontSize: 15, 
                                                    fontWeight: "700", 
                                                    color: colors.text.primary,
                                                }}>
                                                    +{exercise.progressionRate.toFixed(1)}%
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 11, 
                                                    color: colors.text.tertiary,
                                                    marginTop: 2,
                                                }}>
                                                    of total
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Declining Exercises Alert */}
                    {topDecliningExercises.length > 0 && (
                        <View style={{ 
                            backgroundColor: colors.status.error + '15',
                            borderRadius: 12,
                            padding: 16,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.status.error + '30',
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <View style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: colors.status.error + '20',
                                }}>
                                    <TrendingDown size={18} color={colors.status.error} />
                                </View>
                                <Text style={{ 
                                    fontSize: 16, 
                                    fontWeight: "600", 
                                    color: colors.text.primary,
                                }}>
                                    Exercises Needing Attention
                                </Text>
                            </View>
                            {topDecliningExercises.map((exercise, index) => {
                                const first1RM = exercise.data[0]?.oneRM || 0;
                                const decline = first1RM - exercise.last1RM;
                                
                                return (
                                    <View
                                        key={exercise.name}
                                        style={{
                                            backgroundColor: colors.background.card,
                                            borderRadius: 14,
                                            padding: 16,
                                            marginBottom: 12,
                                            borderWidth: 1,
                                            borderColor: colors.border.light,
                                            shadowColor: "#000",
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 2,
                                            elevation: 1,
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
                                            {/* Rank Badge */}
                                            <View style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 8,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: colors.background.secondary || colors.neutral[100],
                                                marginRight: 12,
                                            }}>
                                                <Text style={{ 
                                                    fontSize: 14, 
                                                    fontWeight: "700", 
                                                    color: colors.text.secondary,
                                                }}>
                                                    #{index + 1}
                                                </Text>
                                            </View>
                                            
                                            {/* Exercise Info */}
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ 
                                                    fontSize: 16, 
                                                    fontWeight: "600", 
                                                    color: colors.text.primary,
                                                    marginBottom: 4,
                                                }}>
                                                    {exercise.name}
                                                </Text>
                                                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                    }}>
                                                        {exercise.data.length} {exercise.data.length === 1 ? 'record' : 'records'}
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                    }}>
                                                        •
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 12, 
                                                        color: colors.text.tertiary,
                                                    }}>
                                                        {exercise.last1RM.toFixed(1).replace(/\.?0+$/, '')} kg current
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        
                                        {/* Decline Stats */}
                                        <View style={{ 
                                            flexDirection: "row", 
                                            alignItems: "center", 
                                            justifyContent: "space-between",
                                            paddingTop: 12,
                                            borderTopWidth: 1,
                                            borderTopColor: colors.border.light,
                                        }}>
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                                <TrendingDown size={14} color={colors.status.error} />
                                                <View>
                                                    <Text style={{ 
                                                        fontSize: 13, 
                                                        fontWeight: "600", 
                                                        color: colors.text.secondary,
                                                    }}>
                                                        {decline > 0 ? '-' : ''}{decline.toFixed(1).replace(/\.?0+$/, '')} kg
                                                    </Text>
                                                    <Text style={{ 
                                                        fontSize: 11, 
                                                        color: colors.text.tertiary,
                                                        marginTop: 2,
                                                    }}>
                                                        decline
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ alignItems: "flex-end" }}>
                                                <Text style={{ 
                                                    fontSize: 15, 
                                                    fontWeight: "700", 
                                                    color: colors.status.error,
                                                }}>
                                                    {exercise.progressionRate.toFixed(1).replace(/\.?0+$/, '')}%
                                                </Text>
                                                <Text style={{ 
                                                    fontSize: 11, 
                                                    color: colors.text.tertiary,
                                                    marginTop: 2,
                                                }}>
                                                    decline rate
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: 12,
                        marginTop: 8,
                    }}>
                        <Text style={{ 
                            fontSize: 14, 
                            color: colors.text.secondary,
                            fontWeight: '500',
                        }}>
                            {exerciseList.length} {exerciseList.length === 1 ? 'exercise' : 'exercises'}
                            {hasMore && ` • Showing ${visibleCount}`}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFilterModal(true)}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                backgroundColor: colors.background.primary,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                            }}
                        >
                            <Filter size={16} color={colors.primary[600]} />
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: colors.primary[600],
                            }}>
                                Filter
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {visibleExercises.map((exercise) => (
                        <ExerciseProgressionCard
                            key={exercise.name}
                            exercise={exercise}
                            onPress={() => handleExercisePress(exercise.name)}
                        />
                    ))}
                    
                    {/* Load More Button */}
                    {hasMore && (
                        <TouchableOpacity
                            onPress={handleLoadMore}
                            activeOpacity={0.7}
                            style={{
                                marginTop: 8,
                                marginBottom: 12,
                                paddingVertical: 14,
                                paddingHorizontal: 20,
                                backgroundColor: colors.background.primary,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                            }}
                        >
                            <Text style={{
                                fontSize: 15,
                                fontWeight: '600',
                                color: colors.primary[600],
                            }}>
                                Load {Math.min(LOAD_MORE_COUNT, remainingCount)} More
                            </Text>
                            <ChevronDown size={18} color={colors.primary[600]} />
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <ExerciseProgressionEmptyState />
            )}

            {/* Exercise Detail Modal */}
            {selectedExercise && userId && (
                <ExerciseDetailModal
                    visible={showDetailModal}
                    onClose={() => setShowDetailModal(false)}
                    exerciseName={selectedExercise}
                    userId={userId}
                />
            )}

            {/* Filter Modal */}
            <ExerciseProgressionFilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
            />
        </View>
    );
}
