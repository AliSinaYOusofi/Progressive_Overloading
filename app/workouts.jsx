import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Dumbbell, Plus, Calendar, Target } from "lucide-react-native";
import { colors } from "../constants/ui_colors";

export default function WorkoutsScreen() {
    const workoutCategories = [
        { name: "Push Day", exercises: 6, lastDone: "2 days ago" },
        { name: "Pull Day", exercises: 5, lastDone: "4 days ago" },
        { name: "Leg Day", exercises: 7, lastDone: "1 week ago" },
        { name: "Core Focus", exercises: 4, lastDone: "3 days ago" },
    ];

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Workouts</Text>
                    <Text style={styles.subtitle}>Manage your workout routines</Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={20} color={colors.text.white} />
                        <Text style={styles.addButtonText}>New Workout</Text>
                    </TouchableOpacity>
                </View>

                {/* Workout Categories */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Workout Categories</Text>
                    {workoutCategories.map((category, index) => (
                        <View key={index} style={styles.categoryCard}>
                            <View style={styles.categoryIcon}>
                                <Dumbbell size={24} color={colors.primary[600]} />
                            </View>
                            <View style={styles.categoryInfo}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.categoryDetails}>
                                    {category.exercises} exercises • {category.lastDone}
                                </Text>
                            </View>
                            <View style={styles.categoryStats}>
                                <Calendar size={16} color={colors.text.tertiary} />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Recent Workouts */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Workouts</Text>
                    <View style={styles.recentWorkout}>
                        <View style={styles.workoutIcon}>
                            <Target size={20} color={colors.status.success} />
                        </View>
                        <View style={styles.workoutInfo}>
                            <Text style={styles.workoutName}>Push Day - Upper Body</Text>
                            <Text style={styles.workoutTime}>45 minutes • 2 days ago</Text>
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
    quickActions: {
        marginBottom: 30,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary[600],
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: colors.shadow.colored,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    addButtonText: {
        color: colors.text.white,
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
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
    categoryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    categoryDetails: {
        fontSize: 14,
        color: colors.text.tertiary,
    },
    categoryStats: {
        padding: 8,
    },
    recentWorkout: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.card,
        padding: 16,
        borderRadius: 12,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    workoutIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.status.successLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    workoutInfo: {
        flex: 1,
    },
    workoutName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    workoutTime: {
        fontSize: 14,
        color: colors.text.tertiary,
    },
});
