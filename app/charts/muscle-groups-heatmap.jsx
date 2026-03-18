import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { BarChart2, Activity } from "lucide-react-native";
import ChartEmptyState from "../../components/Charts/ChartEmptyState";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import MuscleGroupHeatmap from "../../components/Charts/MuscleGroupHeatmap";
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

export default function MuscleGroupsHeatmapScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30);
    const [refreshing, setRefreshing] = useState(false);
    const [loadCompleted, setLoadCompleted] = useState(false);
    
    const user = useAppStore(state => state.user);
    const muscleGroupHeatmapData = useAppStore(state => state.chartsData.muscleGroupHeatmap);
    const loadMuscleGroupHeatmap = useAppStore(state => state.loadMuscleGroupHeatmap);
    
    const muscleGroupHeatmap = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return muscleGroupHeatmapData[timeframeValue] || [];
    }, [muscleGroupHeatmapData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            setLoadCompleted(false);
            loadMuscleGroupHeatmap(selectedTimeframe).finally(() => setLoadCompleted(true));
        }
    }, [user, selectedTimeframe]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        setLoadCompleted(false);
        loadMuscleGroupHeatmap(newTimeframe, false).finally(() => setLoadCompleted(true));
    };

    const handleCustomDateRange = (startDate, endDate) => {
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setSelectedTimeframe(daysDiff);
        setLoadCompleted(false);
        loadMuscleGroupHeatmap(daysDiff, true).finally(() => setLoadCompleted(true));
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMuscleGroupHeatmap(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    const hasData = muscleGroupHeatmap && muscleGroupHeatmap.length > 0;

    if (!loadCompleted && !hasData && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading muscle group heatmap...</Text>
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
                    <MuscleGroupHeatmap heatmapData={muscleGroupHeatmap} timeframe={selectedTimeframe} />
                ) : (
                    <ChartEmptyState
                        icon={Activity}
                        title="No Muscle Data"
                        message={`No muscle group data for the past ${getTimeframeLabel(selectedTimeframe)}. Try a longer range or log some workouts.`}
                    />
                )}
            </ScrollView>
        </View>
    );
}

