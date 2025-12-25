import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import GoalAnalytics from "../../components/Charts/GoalAnalytics";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";

export default function GoalAnalyticsScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days
    const [refreshing, setRefreshing] = useState(false);
    
    // Use selective subscriptions from store - subscribe to entire nested object
    const user = useAppStore(state => state.user);
    const goalAnalyticsData = useAppStore(state => state.chartsData.goalAnalytics);
    const fitnessGoals = useAppStore(state => state.fitnessGoals);
    const loadGoalAnalytics = useAppStore(state => state.loadGoalAnalytics);
    
    // Extract timeframe-specific data using useMemo to avoid infinite loops
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
            loadGoalAnalytics(selectedTimeframe);
        }
    }, [user, selectedTimeframe, loadGoalAnalytics]);
    
    // Track completed goals count to detect when goals are marked as completed
    const completedGoalsCount = useMemo(() => {
        return fitnessGoals.filter(g => g.is_completed).length;
    }, [fitnessGoals]);
    
    // Reload analytics when completed goals count changes (e.g., when a goal is completed)
    useEffect(() => {
        if (user && fitnessGoals.length > 0) {
            // Force refresh to get updated analytics after goal completion status changes
            loadGoalAnalytics(selectedTimeframe, true);
        }
    }, [completedGoalsCount, user, selectedTimeframe, loadGoalAnalytics]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        // Check cache first - don't force refresh
        loadGoalAnalytics(newTimeframe, false);
    };

    const handleCustomDateRange = (startDate, endDate) => {
        // Calculate days difference from start to end date
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        // Use daysDiff as the timeframe - this will calculate from today backwards
        // Note: This means custom ranges are relative to today, not absolute dates
        setSelectedTimeframe(daysDiff);
        loadGoalAnalytics(daysDiff, true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadGoalAnalytics(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    // Show loading only if no data exists and we're waiting for initial load
    const isLoading = !goalAnalytics || goalAnalytics.totalGoals === 0 && !refreshing;
    
    if (isLoading && !refreshing) {
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
                {/* Timeframe Filter */}
                <TimeframeFilter 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onCustomDateRange={handleCustomDateRange}
                />

                <GoalAnalytics goalAnalytics={goalAnalytics} />
            </ScrollView>
        </View>
    );
}

