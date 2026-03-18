import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { BarChart2, Calendar } from "lucide-react-native";
import ChartEmptyState from "../../components/Charts/ChartEmptyState";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import MonthlyTrends from "../../components/Charts/MonthlyTrends";
import MonthlyCrossCheckModal from "../../components/Charts/MonthlyCrossCheckModal";
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

export default function MonthlyTrendsScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30);
    const [refreshing, setRefreshing] = useState(false);
    const [loadCompleted, setLoadCompleted] = useState(false);
    const [showCrossCheckModal, setShowCrossCheckModal] = useState(false);
    
    const user = useAppStore(state => state.user);
    const monthlyStatsData = useAppStore(state => state.chartsData.monthlyStats);
    const loadMonthlyStats = useAppStore(state => state.loadMonthlyStats);
    
    const monthlyStats = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return monthlyStatsData[timeframeValue] || [];
    }, [monthlyStatsData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            setLoadCompleted(false);
            loadMonthlyStats(selectedTimeframe).finally(() => setLoadCompleted(true));
        }
    }, [user, selectedTimeframe]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        setLoadCompleted(false);
        loadMonthlyStats(newTimeframe, false).finally(() => setLoadCompleted(true));
    };

    const handleCustomDateRange = (startDate, endDate) => {
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setSelectedTimeframe(daysDiff);
        setLoadCompleted(false);
        loadMonthlyStats(daysDiff, true).finally(() => setLoadCompleted(true));
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMonthlyStats(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    const hasData = monthlyStats && monthlyStats.length > 0;

    if (!loadCompleted && !hasData && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading monthly trends...</Text>
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
                    <MonthlyTrends 
                        monthlyStats={monthlyStats} 
                        onCrossCheckPress={() => setShowCrossCheckModal(true)}
                    />
                ) : (
                    <ChartEmptyState
                        icon={Calendar}
                        title="No Monthly Trends"
                        message={`No trends for the past ${getTimeframeLabel(selectedTimeframe)}. Try a longer range or log some workouts.`}
                    />
                )}
            </ScrollView>
            
            <MonthlyCrossCheckModal
                visible={showCrossCheckModal}
                onClose={() => setShowCrossCheckModal(false)}
                monthlyStats={monthlyStats}
            />
        </View>
    );
}

