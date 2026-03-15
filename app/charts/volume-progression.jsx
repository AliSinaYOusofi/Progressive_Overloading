import React, { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { BarChart2 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useAppStore } from "../../stores/useAppStore";
import VolumeProgression from "../../components/Charts/VolumeProgression";
import VolumeCrossCheckModal from "../../components/Charts/VolumeCrossCheckModal";
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

export default function VolumeProgressionScreen() {
    const colors = useThemedColors();
    const [selectedTimeframe, setSelectedTimeframe] = useState(30);
    const [refreshing, setRefreshing] = useState(false);
    const [loadCompleted, setLoadCompleted] = useState(false);
    const [showCrossCheckModal, setShowCrossCheckModal] = useState(false);
    
    const user = useAppStore(state => state.user);
    const volumeProgressionData = useAppStore(state => state.chartsData.volumeProgression);
    const loadVolumeProgression = useAppStore(state => state.loadVolumeProgression);
    
    const volumeProgression = useMemo(() => {
      const timeframeValue = selectedTimeframe === 'all' ? 36500 : selectedTimeframe;
      return volumeProgressionData[timeframeValue] || [];
    }, [volumeProgressionData, selectedTimeframe]);

    useEffect(() => {
        if (user) {
            setLoadCompleted(false);
            loadVolumeProgression(selectedTimeframe).finally(() => setLoadCompleted(true));
        }
    }, [user, selectedTimeframe]);

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        setLoadCompleted(false);
        loadVolumeProgression(newTimeframe, false).finally(() => setLoadCompleted(true));
    };

    const handleCustomDateRange = (startDate, endDate) => {
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        setSelectedTimeframe(daysDiff);
        setLoadCompleted(false);
        loadVolumeProgression(daysDiff, true).finally(() => setLoadCompleted(true));
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadVolumeProgression(selectedTimeframe, true).finally(() => {
            setRefreshing(false);
        });
    };

    const hasData = volumeProgression && volumeProgression.length > 0;

    if (!loadCompleted && !hasData && !refreshing) {
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
                <TimeframeFilter 
                    selectedTimeframe={selectedTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onCustomDateRange={handleCustomDateRange}
                />

                {hasData ? (
                    <VolumeProgression 
                        volumeProgression={volumeProgression}
                        onCrossCheckPress={() => setShowCrossCheckModal(true)}
                    />
                ) : (
                    <View style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 60,
                        paddingHorizontal: 24,
                    }}>
                        <View style={{
                            width: 64,
                            height: 64,
                            borderRadius: 32,
                            backgroundColor: colors.primary[100] || colors.background.input,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                        }}>
                            <BarChart2 size={28} color={colors.primary[600]} />
                        </View>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '700',
                            color: colors.text.primary,
                            textAlign: 'center',
                            marginBottom: 8,
                        }}>
                            No data in this range
                        </Text>
                        <Text style={{
                            fontSize: 15,
                            color: colors.text.secondary,
                            textAlign: 'center',
                            lineHeight: 22,
                        }}>
                            There's no volume progression data for the past {getTimeframeLabel(selectedTimeframe)}. Try selecting a longer date range or log some workouts to start tracking your volume.
                        </Text>
                    </View>
                )}
            </ScrollView>
            
            <VolumeCrossCheckModal
                visible={showCrossCheckModal}
                onClose={() => setShowCrossCheckModal(false)}
                volumeProgression={volumeProgression}
            />
        </View>
    );
}

