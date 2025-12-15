import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { getCurrentUser, getProgressiveOverloadInsights } from "../../lib/database";
import ProgressiveOverloadInsights from "../../components/Charts/ProgressiveOverloadInsights";

export default function ProgressiveOverloadScreen() {
    const colors = useThemedColors();
    const [progressiveOverloadInsights, setProgressiveOverloadInsights] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async (isRefresh = false) => {
        try {
            if (!isRefresh) setIsLoading(true);
            
            const currentUser = await getCurrentUser();
            if (!currentUser) return;

            // Default to 30 days timeframe
            const timeframeValue = 30;
            const insights = await getProgressiveOverloadInsights(currentUser.id, timeframeValue);
            setProgressiveOverloadInsights(insights);
        } catch (error) {
            console.error("Error loading progressive overload insights:", error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData(true);
    };

    if (isLoading) {
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
                <ProgressiveOverloadInsights 
                    progressiveOverloadInsights={progressiveOverloadInsights}
                    parentTimeframe={30}
                />
            </ScrollView>
        </View>
    );
}

