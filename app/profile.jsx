import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { User, Edit, Trophy, Target, Calendar, Award, Settings, LogOut } from "lucide-react-native";
import { colors } from "../constants/ui_colors";
import { signOut } from "../lib/auth";
import { router } from "expo-router";

export default function ProfileScreen() {
    const userStats = [
        { label: "Workouts Completed", value: "156", icon: Target },
        { label: "Current Streak", value: "12 days", icon: Calendar },
        { label: "Personal Records", value: "8", icon: Trophy },
        { label: "Goal Progress", value: "85%", icon: Award },
    ];

    const achievements = [
        { name: "First Workout", description: "Completed your first workout", date: "2 months ago" },
        { name: "Week Warrior", description: "Worked out 7 days in a row", date: "1 month ago" },
        { name: "Strength Master", description: "Increased all lifts by 20%", date: "2 weeks ago" },
    ];

    const handleLogout = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            // The layout will automatically show auth screens
                            // No need to navigate manually
                        } catch (error) {
                            console.log("Logout error:", error);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <User size={40} color={colors.primary[600]} />
                        </View>
                        <TouchableOpacity style={styles.editButton}>
                            <Edit size={16} color={colors.primary[600]} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>John Doe</Text>
                    <Text style={styles.userEmail}>john.doe@example.com</Text>
                    <Text style={styles.userLevel}>Fitness Level: Intermediate</Text>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Your Stats</Text>
                    <View style={styles.statsGrid}>
                        {userStats.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <View style={styles.statIcon}>
                                    <stat.icon size={20} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Achievements */}
                <View style={styles.achievementsSection}>
                    <Text style={styles.sectionTitle}>Recent Achievements</Text>
                    {achievements.map((achievement, index) => (
                        <View key={index} style={styles.achievementCard}>
                            <View style={styles.achievementIcon}>
                                <Trophy size={24} color={colors.status.warning} />
                            </View>
                            <View style={styles.achievementContent}>
                                <Text style={styles.achievementName}>{achievement.name}</Text>
                                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                                <Text style={styles.achievementDate}>{achievement.date}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Profile Actions */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.actionIcon}>
                            <Settings size={20} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.actionText}>Account Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={styles.actionIcon}>
                            <Target size={20} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.actionText}>Fitness Goals</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <View style={styles.actionIcon}>
                            <LogOut size={20} color={colors.status.error} />
                        </View>
                        <Text style={[styles.actionText, styles.logoutText]}>Sign Out</Text>
                    </TouchableOpacity>
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
    profileHeader: {
        alignItems: "center",
        marginBottom: 30,
    },
    avatarContainer: {
        position: "relative",
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: colors.primary[200],
    },
    editButton: {
        position: "absolute",
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.background.card,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.primary[200],
    },
    userName: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: colors.text.secondary,
        marginBottom: 8,
    },
    userLevel: {
        fontSize: 14,
        color: colors.primary[600],
        fontWeight: "500",
    },
    statsSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: colors.text.tertiary,
        textAlign: "center",
    },
    achievementsSection: {
        marginBottom: 30,
    },
    achievementCard: {
        flexDirection: "row",
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
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.status.warningLight,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    achievementContent: {
        flex: 1,
    },
    achievementName: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    achievementDate: {
        fontSize: 12,
        color: colors.text.tertiary,
    },
    actionsSection: {
        marginBottom: 30,
    },
    actionButton: {
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
    actionIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    actionText: {
        fontSize: 16,
        color: colors.text.primary,
        fontWeight: "500",
    },
    logoutButton: {
        borderWidth: 1,
        borderColor: colors.status.errorLight,
    },
    logoutText: {
        color: colors.status.error,
    },
});
