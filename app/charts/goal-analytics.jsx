import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { BarChart2, Target } from "lucide-react-native";
import ChartEmptyState from "../../components/Charts/ChartEmptyState";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import GoalAnalytics from "../../components/Charts/GoalAnalytics";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";

const TIMEFRAME_LABELS = {
    7: "7 days",
    30: "1 month",
    90: "3 months",
    180: "6 months",
    365: "1 year",
};

function getTimeframeLabel(tf) {
    if (tf === "all" || tf === 36500) return "all time";
    return TIMEFRAME_LABELS[tf] || `${tf} days`;
}

export default function GoalAnalyticsScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30);
    const [refreshing, setRefreshing] = useState(false);
    const [loadCompleted, setLoadCompleted] = useState(false);
    
    const user = useAppStore(state => state.user);
    const goalAnalyticsData = useAppStore(state => state.chartsData.goalAnalytics);
    const fitnessGoals = useAppStore(state => state.fitnessGoals);
    const loadGoalAnalytics = useAppStore(state => state.loadGoalAnalytics);
    
    const goalAnalytics = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return goalAnalyticsData[timeframeValue] || {
        completionRateOverTime: [],
        goalsCreatedOverTime: [],
        statusBreakdown: { active: 0, completed: 0, expired: 0 },
        averageProgressOverTime: [],
        averageCompletionTime: 0,
        totalGoals: 0,
        completedGoals: 0,
        activeGoals: 0,
        expiredGoals: 0,
      };
    }, [goalAnalyticsData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            setLoadCompleted(false);
            loadGoalAnalytics(selectedTimeframe).finally(() => setLoadCompleted(true));
        }
    }, [user, selectedTimeframe, loadGoalAnalytics]);
    
    const completedGoalsCount = useMemo(() => {
        return fitnessGoals.filter(g => g.is_completed).length;
    }, [fitnessGoals]);
    
    useEffect(() => {
        if (user && fitnessGoals.length > 0) {
            loadGoalAnalytics(selectedTimeframe, true).finally(() => setLoadCompleted(true));
        }
    }, [completedGoalsCount, user, selectedTimeframe, loadGoalAnalytics]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        setLoadCompleted(false);
        loadGoalAnalytics(newTimeframe, false).finally(() => setLoadCompleted(true));
    };

    const handleCustomDateRange = (startDate, endDate) => {
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setSelectedTimeframe(daysDiff);
        setLoadCompleted(false);
        loadGoalAnalytics(daysDiff, true).finally(() => setLoadCompleted(true));
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadGoalAnalytics(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    const hasData = goalAnalytics && goalAnalytics.totalGoals > 0;

    if (!loadCompleted && !hasData && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading goal analytics...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            <ScrollView 
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <TimeframeFilter 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onCustomDateRange={handleCustomDateRange}
                />

                {hasData ? (
                    <GoalAnalytics goalAnalytics={goalAnalytics} />
                ) : (
                    <ChartEmptyState
                        icon={Target}
                        title="No Goal Data"
                        message={`No goal analytics for the past ${getTimeframeLabel(selectedTimeframe)}. Try a longer range or create some fitness goals.`}
                    />
                )}
            </ScrollView>
        </View>
    );
}

