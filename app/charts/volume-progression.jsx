import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import VolumeProgression from "../../components/Charts/VolumeProgression";
import VolumeCrossCheckModal from "../../components/Charts/VolumeCrossCheckModal";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";

export default function VolumeProgressionScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days
    const [refreshing, setRefreshing] = useState(false);
    const [showCrossCheckModal, setShowCrossCheckModal] = useState(false);
    
    // Use selective subscriptions from store - subscribe to entire nested object
    const user = useAppStore(state => state.user);
    const volumeProgressionData = useAppStore(state => state.chartsData.volumeProgression);
    const loadVolumeProgression = useAppStore(state => state.loadVolumeProgression);
    
    // Extract timeframe-specific data using useMemo to avoid infinite loops
    const volumeProgression = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return volumeProgressionData[timeframeValue] || [];
    }, [volumeProgressionData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            loadVolumeProgression(selectedTimeframe);
        }
    }, [user, selectedTimeframe]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        // Check cache first - don't force refresh
        loadVolumeProgression(newTimeframe, false);
    };

    const handleCustomDateRange = (startDate, endDate) => {
        // Calculate days difference from start to end date
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        // Use daysDiff as the timeframe - this will calculate from today backwards
        // Note: This means custom ranges are relative to today, not absolute dates
        setSelectedTimeframe(daysDiff);
        loadVolumeProgression(daysDiff, true);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadVolumeProgression(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    // Show loading only if no data exists and we're waiting for initial load
    const isLoading = !volumeProgression || volumeProgression.length === 0;
    
    if (isLoading && !refreshing) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading volume progression...</Text>
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

                <VolumeProgression 
                    volumeProgression={volumeProgression}
                    onCrossCheckPress={() => setShowCrossCheckModal(true)}
                />
            </ScrollView>
            
            {/* Cross Check Modal */}
            <VolumeCrossCheckModal
                visible={showCrossCheckModal}
                onClose={() => setShowCrossCheckModal(false)}
                volumeProgression={volumeProgression}
            />
        </View>
    );
}

