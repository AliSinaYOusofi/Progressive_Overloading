import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import { getProgressiveOverloadComparison } from "../../lib/database";
import ProgressiveOverloadInsights from "../../components/Charts/ProgressiveOverloadInsights";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";

export default function ProgressiveOverloadScreen() {
    const colors = useThemedColors();
    const [comparisonData, setComparisonData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days
    
    // Use selective subscriptions from store - subscribe to entire nested object
    const user = useAppStore(state => state.user);
    const progressiveOverloadInsightsData = useAppStore(state => state.chartsData.progressiveOverloadInsights);
    const loadProgressiveOverloadInsights = useAppStore(state => state.loadProgressiveOverloadInsights);
    
    // Extract timeframe-specific data using useMemo to avoid infinite loops
    const progressiveOverloadInsights = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return progressiveOverloadInsightsData[timeframeValue] || [];
    }, [progressiveOverloadInsightsData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            loadProgressiveOverloadInsights(selectedTimeframe).then(() => {
                // Fetch comparison data if needed
                const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
                if (timeframeValue !== 36500 && typeof timeframeValue === 'number' && timeframeValue <= 365) {
                    getProgressiveOverloadComparison(user.id, timeframeValue).then(comparison => {
                        setComparisonData(comparison);
                    }).catch(error => {
                        console.error("Error loading comparison data:", error);
                    });
                } else {
                    setComparisonData(null);
                }
            });
        }
    }, [user, selectedTimeframe]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        // Check cache first - don't force refresh
        loadProgressiveOverloadInsights(newTimeframe, false).then(() => {
            const timeframeValue = newTimeframe === 'all' ? 36500 : newTimeframe;
            if (timeframeValue !== 36500 && typeof timeframeValue === 'number' && timeframeValue <= 365) {
                return getProgressiveOverloadComparison(user.id, timeframeValue);
            }
            return null;
        }).then(comparison => {
            setComparisonData(comparison);
        }).catch(error => {
            console.error("Error loading comparison data:", error);
        });
    };

    const handleCustomDateRange = (startDate, endDate) => {
        // Calculate days difference from start to end date
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        // Use daysDiff as the timeframe - this will calculate from today backwards
        // Note: This means custom ranges are relative to today, not absolute dates
        setSelectedTimeframe(daysDiff);
        loadProgressiveOverloadInsights(daysDiff, true).then(() => {
            if (daysDiff <= 365) {
                return getProgressiveOverloadComparison(user.id, daysDiff);
            }
            return null;
        }).then(comparison => {
            setComparisonData(comparison);
        }).catch(error => {
            console.error("Error loading comparison data:", error);
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadProgressiveOverloadInsights(selectedTimeframe, true).then(() => {
            const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
            if (timeframeValue !== 36500 && typeof timeframeValue === 'number' && timeframeValue <= 365) {
                return getProgressiveOverloadComparison(user.id, timeframeValue);
            }
            return null;
        }).then(comparison => {
            setComparisonData(comparison);
        }).finally(() => {
            setRefreshing(false);
        });
    };

    // Show loading only if no data exists and we're waiting for initial load
    const isLoading = !progressiveOverloadInsights || progressiveOverloadInsights.length === 0;
    
    if (isLoading && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading progressive overload insights...</Text>
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

                <ProgressiveOverloadInsights 
                    progressiveOverloadInsights={progressiveOverloadInsights}
                    parentTimeframe={selectedTimeframe}
                    comparisonData={comparisonData}
                />
            </ScrollView>
        </View>
    );
}

