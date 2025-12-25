import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import MuscleGroupHeatmap from "../../components/Charts/MuscleGroupHeatmap";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";

export default function MuscleGroupsHeatmapScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days
    const [refreshing, setRefreshing] = useState(false);
    
    // Use selective subscriptions from store - subscribe to entire nested object
    const user = useAppStore(state => state.user);
    const muscleGroupHeatmapData = useAppStore(state => state.chartsData.muscleGroupHeatmap);
    const loadMuscleGroupHeatmap = useAppStore(state => state.loadMuscleGroupHeatmap);
    
    // Extract timeframe-specific data using useMemo to avoid infinite loops
    const muscleGroupHeatmap = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return muscleGroupHeatmapData[timeframeValue] || [];
    }, [muscleGroupHeatmapData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            loadMuscleGroupHeatmap(selectedTimeframe);
        }
    }, [user, selectedTimeframe]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        // Check cache first - don't force refresh
        loadMuscleGroupHeatmap(newTimeframe, false);
    };

    const handleCustomDateRange = (startDate, endDate) => {
        // Calculate days difference from start to end date
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        // Use daysDiff as the timeframe - this will calculate from today backwards
        // Note: This means custom ranges are relative to today, not absolute dates
        setSelectedTimeframe(daysDiff);
        loadMuscleGroupHeatmap(daysDiff, true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadMuscleGroupHeatmap(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    // Show loading only if no data exists and we're waiting for initial load
    const isLoading = !muscleGroupHeatmap || muscleGroupHeatmap.length === 0;
    
    if (isLoading && !refreshing) {
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
                {/* Timeframe Filter */}
                <TimeframeFilter 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onCustomDateRange={handleCustomDateRange}
                />

                <MuscleGroupHeatmap heatmapData={muscleGroupHeatmap} timeframe={selectedTimeframe} />
            </ScrollView>
        </View>
    );
}

