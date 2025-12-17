import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { getCurrentUser, getPersonalRecords } from "../../lib/database";
import PersonalRecords from "../../components/Charts/PersonalRecords";
import PersonalRecordsInfoModal from "../../components/Charts/PersonalRecordsInfoModal";
import TimeframeFilter from "../../components/Charts/TimeframeFilter";

export default function PersonalRecordsScreen() {
    const colors = useThemedColors();
    const [personalRecords, setPersonalRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [selectedTimeframe, setSelectedTimeframe] = useState(30); // days

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (isRefresh = false, timeframe = selectedTimeframe) => {
        try {
            if (!isRefresh) setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            if (!currentUser) return;

            // For "All Time", use a very large number to get all data
            const timeframeValue = timeframe === 'all' ? 36500 : timeframe; // 100 years for all time
            const records = await getPersonalRecords(currentUser.id, 100, timeframeValue);
            setPersonalRecords(records);
        } catch (error) {
            console.error("Error loading personal records:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleTimeframeChange = (newTimeframe) => {
        setSelectedTimeframe(newTimeframe);
        loadData(false, newTimeframe);
    };

    const handleCustomDateRange = (startDate, endDate) => {
        // Calculate days difference from start to end date
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        // Use daysDiff as the timeframe - this will calculate from today backwards
        // Note: This means custom ranges are relative to today, not absolute dates
        setSelectedTimeframe(daysDiff);
        loadData(false, daysDiff);
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.primary }}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Loading personal records...</Text>
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

                <PersonalRecords 
                    personalRecords={personalRecords}
                    onInfoPress={() => setShowInfoModal(true)}
                />
            </ScrollView>
            
            <PersonalRecordsInfoModal
                visible={showInfoModal}
                onClose={() => setShowInfoModal(false)}
            />
        </View>
    );
}

