import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart3, TrendingUp, Target, Calendar, Award } from "lucide-react-native";
import { colors } from "../constants/ui_colors";

export default function ChartsScreen() {
    const weeklyProgress = [
        { day: "Mon", weight: 220, completed: true },
        { day: "Tue", weight: 185, completed: true },
        { day: "Wed", weight: 0, completed: false },
        { day: "Thu", weight: 225, completed: true },
        { day: "Fri", weight: 0, completed: false },
        { day: "Sat", weight: 205, completed: true },
        { day: "Sun", weight: 0, completed: false },
    ];

    const monthlyStats = [
        { month: "Jan", workouts: 18, avgWeight: 210 },
        { month: "Feb", workouts: 22, avgWeight: 215 },
        { month: "Mar", workouts: 20, avgWeight: 220 },
        { month: "Apr", workouts: 25, avgWeight: 225 },
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Analytics</Text>
                    <Text style={styles.subtitle}>Track your progress and performance</Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <TrendingUp size={24} color={colors.status.success} />
                        </View>
                        <Text style={styles.statValue}>12</Text>
                        <Text style={styles.statLabel}>Day Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Target size={24} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.statValue}>85%</Text>
                        <Text style={styles.statLabel}>Goal Progress</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Calendar size={24} color={colors.status.info} />
                        </View>
                        <Text style={styles.statValue}>22</Text>
                        <Text style={styles.statLabel}>This Month</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={styles.statIcon}>
                            <Award size={24} color={colors.status.warning} />
                        </View>
                        <Text style={styles.statValue}>5</Text>
                        <Text style={styles.statLabel}>PRs Set</Text>
                    </View>
                </View>

                {/* Weekly Progress */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weekly Progress</Text>
                    <View style={styles.chartContainer}>
                        <View style={styles.chartHeader}>
                            <Text style={styles.chartLabel}>Workout Completion</Text>
                        </View>
                        <View style={styles.barChart}>
                            {weeklyProgress.map((day, index) => (
                                <View key={index} style={styles.barColumn}>
                                    <View style={styles.barContainer}>
                                        <View 
                                            style={[
                                                styles.bar, 
                                                { 
                                                    height: day.completed ? 60 : 20,
                                                    backgroundColor: day.completed ? colors.status.success : colors.neutral[300]
                                                }
                                            ]} 
                                        />
                                    </View>
                                    <Text style={styles.barLabel}>{day.day}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Monthly Trends */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Monthly Trends</Text>
                    <View style={styles.trendCard}>
                        <View style={styles.trendHeader}>
                            <Text style={styles.trendTitle}>Workout Frequency</Text>
                            <Text style={styles.trendValue}>+15%</Text>
                        </View>
                        <View style={styles.trendChart}>
                            {monthlyStats.map((month, index) => (
                                <View key={index} style={styles.trendBar}>
                                    <View 
                                        style={[
                                            styles.trendBarFill, 
                                            { height: (month.workouts / 30) * 100 }
                                        ]} 
                                    />
                                    <Text style={styles.trendBarLabel}>{month.month}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Performance Insights */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance Insights</Text>
                    <View style={styles.insightCard}>
                        <View style={styles.insightIcon}>
                            <BarChart3 size={20} color={colors.primary[600]} />
                        </View>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightTitle}>Strength Gains</Text>
                            <Text style={styles.insightText}>
                                Your bench press has improved by 15% this month. Keep up the great work!
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 100, // Add bottom padding to avoid tab bar
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: "center",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 30,
    },
    statCard: {
        width: "48%",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
        textAlign: "center",
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 16,
    },
    chartContainer: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 20,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    chartHeader: {
        marginBottom: 20,
    },
    chartLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
    },
    barChart: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 100,
    },
    barColumn: {
        alignItems: "center",
        flex: 1,
    },
    barContainer: {
        height: 80,
        justifyContent: "flex-end",
        marginBottom: 8,
    },
    bar: {
        width: 20,
        borderRadius: 10,
        minHeight: 4,
    },
    barLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    trendCard: {
        backgroundColor: colors.background.card,
        borderRadius: 12,
        padding: 20,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    trendHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    trendTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
    },
    trendValue: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.status.success,
    },
    trendChart: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 80,
    },
    trendBar: {
        alignItems: "center",
        flex: 1,
    },
    trendBarFill: {
        width: 16,
        backgroundColor: colors.primary[600],
        borderRadius: 8,
        minHeight: 4,
        marginBottom: 8,
    },
    trendBarLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    insightCard: {
        flexDirection: "row",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    insightIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    insightContent: {
        flex: 1,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    insightText: {
        fontSize: 14,
        color: colors.text.secondary,
        lineHeight: 20,
    },
});
