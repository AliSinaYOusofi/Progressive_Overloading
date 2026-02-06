import { useState, useEffect } from "react";
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    Modal,
    Linking,
} from "react-native";
import {
    User,
    Edit,
    Trophy,
    Target,
    Calendar,
    Award,
    Settings,
    LogOut,
    AlertTriangle,
    Info,
    ExternalLink,
} from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { signOut, getUser } from "../../lib/auth";
import { getProfile, getUserStats, getUserAchievements, deleteUserAccount } from "../../lib/database";
import BMIInfoModal from "../../components/Profile/BMIInfoModal";
import SetDefaultsModal from "../../components/HomeScreen/SetDefaultsModal";
import { useAppStore } from "../../stores/useAppStore";

export default function ProfileScreen() {
    const colors = useThemedColors();
    const router = useRouter();
    
    // Use Zustand store for profile data
    const { profile: storeProfile, setProfile, user: storeUser } = useAppStore();
    
    const [userProfile, setUserProfile] = useState(null);
    const [userStats, setUserStats] = useState({
        workoutCount: 0,
        currentStreak: 0,
        personalRecordsCount: 0,
        goalProgress: 0,
    });
    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showBMIModal, setShowBMIModal] = useState(false);
    const [showDefaultsModal, setShowDefaultsModal] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    // Refresh data when screen comes into focus (e.g., after editing profile)
    useFocusEffect(
        React.useCallback(() => {
            loadUserData(true);
        }, [])
    );

    const loadUserData = async (isRefresh = false) => {
        try {
            // If we have cached profile data and not refreshing, use it immediately (no loading spinner)
            if (!isRefresh && storeProfile) {
                setUserProfile(storeProfile);
                setIsLoading(false);
                // Still fetch stats and achievements in background, but don't show loading
            } else {
                if (!isRefresh) {
                    setIsLoading(true);
                }
            }

            // Get current user
            const user = storeUser || await getUser();
            if (!user) {
                console.log("No user found");
                setIsLoading(false);
                return;
            }

            // Load profile data (only fetch if refreshing or not cached)
            if (isRefresh || !storeProfile) {
                const profile = await getProfile(user.id);
                setUserProfile(profile);
                setProfile(profile); // Update Zustand store
            } else {
                setUserProfile(storeProfile);
            }

            // Load user statistics (always fetch as they change frequently)
            const stats = await getUserStats(user.id);
            setUserStats(stats);

            // Load achievements
            const userAchievements = await getUserAchievements(user.id);
            setAchievements(userAchievements);

            // Clear any previous errors
            setHasError(false);
        } catch (error) {
            console.error("Error loading user data:", error);
            setHasError(true);
            if (!isRefresh) {
                Alert.alert("Error", "Failed to load user data");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileUpdate = (updates) => {
        setUserProfile((prev) => ({
            ...prev,
            ...updates,
        }));
        // Refresh the data to ensure consistency
        loadUserData(true);
    };

    const handleLogout = async () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
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
                        Alert.alert(
                            "Error",
                            "Failed to sign out. Please try again."
                        );
                    }
                },
            },
        ]);
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "This will initiate the account deletion process. You will be signed out and need to contact support to complete the deletion.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete Account",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // Get current user
                            const user = await getUser();
                            if (!user) {
                                Alert.alert("Error", "User not found");
                                return;
                            }

                            await signOut();
                            await deleteUserAccount(user.id);
                        } catch (error) {
                            console.error(
                                "Error in delete account flow:",
                                error
                            );
                            Alert.alert(
                                "Error",
                                "Failed to process delete account request. Please try again."
                            );
                        }
                    },
                },
            ]
        );
    };

    const getFitnessLevel = (workoutCount) => {
        if (workoutCount === 0) return "Beginner";
        if (workoutCount < 10) return "Novice";
        if (workoutCount < 30) return "Intermediate";
        if (workoutCount < 100) return "Advanced";
        return "Expert";
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5)
            return { category: "Underweight", color: colors.status.warning };
        if (bmi < 25)
            return { category: "Normal", color: colors.status.success };
        if (bmi < 30)
            return { category: "Overweight", color: colors.status.warning };
        return { category: "Obese", color: colors.status.error };
    };

    const styles = getStyles(colors);

    if (isLoading && !hasError) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (hasError && !userProfile) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load profile</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                        setHasError(false);
                        loadUserData();
                    }}
                >
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statsData = [
        {
            label: "Workouts Completed",
            value: userStats.workoutCount.toString(),
            icon: Target,
        },
        {
            label: "Current Streak",
            value: `${userStats.currentStreak} days`,
            icon: Calendar,
        },
        {
            label: "Personal Records",
            value: userStats.personalRecordsCount.toString(),
            icon: Trophy,
        },
        {
            label: "Goal Progress",
            value: `${userStats.goalProgress}%`,
            icon: Award,
        },
    ];

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={false}
                        onRefresh={() => loadUserData(true)}
                        colors={[colors.primary[600]]}
                        tintColor={colors.primary[600]}
                    />
                }
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <User size={40} color={colors.primary[600]} />
                        </View>
                        <TouchableOpacity
                            style={styles.editButton}
                            onPress={() => router.push('/profile/edit-profile')}
                        >
                            <Edit size={20} color={colors.background.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.userName}>
                        {
                            userProfile?.full_name ||
                            "User"
                        }
                    </Text>
                    <Text style={styles.userEmail}>
                        {userProfile?.email || "No email available"}
                    </Text>
                    <Text style={styles.userLevel}>
                        Fitness Level: {getFitnessLevel(userStats.workoutCount)}
                    </Text>

                    {/* Profile Completion */}
                    {(() => {
                        const profileFields = [
                            "height_cm",
                            "weight_kg",
                            "date_of_birth",
                            "gender",
                        ];
                        const completedFields = profileFields.filter(
                            (field) => userProfile?.[field]
                        );
                        const completionPercentage = Math.round(
                            (completedFields.length / profileFields.length) *
                                100
                        );

                        return (
                            <View style={styles.profileCompletion}>
                                <View style={styles.completionBar}>
                                    <View
                                        style={[
                                            styles.completionFill,
                                            {
                                                width: `${completionPercentage}%`,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.completionText}>
                                    Profile {completionPercentage}% Complete
                                </Text>
                            </View>
                        );
                    })()}

                    {/* Additional Profile Info */}
                    <View style={styles.profileDetails}>
                        {userProfile?.height_cm && (
                            <View style={styles.profileDetail}>
                                <Text style={styles.profileDetailLabel}>
                                    Height:
                                </Text>
                                <Text style={styles.profileDetailValue}>
                                    {userProfile.height_cm} cm
                                </Text>
                            </View>
                        )}
                        {userProfile?.weight_kg && (
                            <View style={styles.profileDetail}>
                                <Text style={styles.profileDetailLabel}>
                                    Weight:
                                </Text>
                                <Text style={styles.profileDetailValue}>
                                    {userProfile.weight_kg} kg
                                </Text>
                            </View>
                        )}
                        {userProfile?.date_of_birth && (
                            <View style={styles.profileDetail}>
                                <Text style={styles.profileDetailLabel}>
                                    Age:
                                </Text>
                                <Text style={styles.profileDetailValue}>
                                    {Math.floor(
                                        (new Date() -
                                            new Date(
                                                userProfile.date_of_birth
                                            )) /
                                            (1000 * 60 * 60 * 24 * 365.25)
                                    )}{" "}
                                    years
                                </Text>
                            </View>
                        )}
                        {userProfile?.gender && (
                            <View style={styles.profileDetail}>
                                <Text style={styles.profileDetailLabel}>
                                    Gender:
                                </Text>
                                <Text style={styles.profileDetailValue}>
                                    {userProfile.gender
                                        .charAt(0)
                                        .toUpperCase() +
                                        userProfile.gender
                                            .slice(1)
                                            .replace(/_/g, " ")}
                                </Text>
                            </View>
                        )}
                        {userProfile?.height_cm &&
                            userProfile?.weight_kg &&
                            (() => {
                                const bmi = (
                                    userProfile.weight_kg /
                                    Math.pow(userProfile.height_cm / 100, 2)
                                ).toFixed(1);
                                const bmiInfo = getBMICategory(
                                    Number.parseFloat(bmi)
                                );
                                return (
                                                                         <View style={styles.profileDetail}>
                                         <View style={styles.bmiLabelContainer}>
                                             <Text style={styles.profileDetailLabel}>
                                                 BMI:
                                             </Text>
                                             <TouchableOpacity 
                                                 style={styles.bmiInfoButton}
                                                 onPress={() => setShowBMIModal(true)}
                                             >
                                                 <Info size={14} color={colors.primary[600]} />
                                             </TouchableOpacity>
                                         </View>
                                         <View style={styles.bmiContainer}>
                                             <Text
                                                 style={
                                                     styles.profileDetailValue
                                                 }
                                             >
                                                 {bmi}
                                             </Text>
                                             <Text
                                                 style={[
                                                     styles.bmiCategory,
                                                     { color: bmiInfo.color },
                                                 ]}
                                             >
                                                 {bmiInfo.category}
                                             </Text>
                                         </View>
                                     </View>
                                );
                            })()}
                    </View>
                </View>

                {/* Complete Profile Section */}
                {(!userProfile?.height_cm ||
                    !userProfile?.weight_kg ||
                    !userProfile?.date_of_birth ||
                    !userProfile?.gender) && (
                    <View style={styles.completeProfileSection}>
                        <View style={styles.completeProfileHeader}>
                            <Text style={styles.completeProfileTitle}>
                                Complete Your Profile
                            </Text>
                            <Text style={styles.completeProfileSubtitle}>
                                Add your height, weight, date of birth, and
                                gender to get personalized insights
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.completeProfileButton}
                            onPress={() => router.push('/profile/edit-profile')}
                        >
                            <Edit size={20} color={colors.background.primary} style={{ marginRight: 8 }} />
                            <Text style={styles.completeProfileButtonText}>
                                Complete Profile
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Stats Grid */}
                <View style={styles.statsSection}>
                    <Text style={styles.sectionTitle}>Your Stats</Text>
                    <View style={styles.statsGrid}>
                        {statsData.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <View style={styles.statIcon}>
                                    <stat.icon
                                        size={20}
                                        color={colors.primary[600]}
                                    />
                                </View>
                                <Text style={styles.statValue}>
                                    {stat.value}
                                </Text>
                                <Text style={styles.statLabel}>
                                    {stat.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Achievements */}

                {/* Profile Actions */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => router.push('/profile/edit-profile')}
                    >
                        <View style={styles.actionIcon}>
                            <Edit size={20} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.actionText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => setShowDefaultsModal(true)}
                    >
                        <View style={styles.actionIcon}>
                            <Target size={20} color={colors.primary[600]} />
                        </View>
                        <Text style={styles.actionText}>Workout Defaults</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.actionButton}>
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
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.logoutButton]}
                        onPress={handleLogout}
                    >
                        <View style={styles.actionIcon}>
                            <LogOut size={20} color={colors.status.error} />
                        </View>
                        <Text style={[styles.actionText, styles.logoutText]}>
                            Sign Out
                        </Text>
                    </TouchableOpacity>

                    {/* Separator */}
                    <View style={styles.actionSeparator} />

                    {/* Delete Account Warning */}
                    <View style={styles.dangerZone}>
                        <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
                        
                        <View style={styles.deleteWarning}>
                            <AlertTriangle size={16} color={colors.status.error} />
                            <Text style={styles.deleteWarningText}>
                                This action cannot be undone
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteAccountButton}
                            onPress={handleDeleteAccount}
                        >
                            <AlertTriangle size={18} color={colors.status.error} />
                            <Text style={styles.deleteAccountText}>
                                Delete Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <BMIInfoModal visible={showBMIModal} onClose={() => setShowBMIModal(false)} />

            {/* Workout Defaults Modal */}
            <SetDefaultsModal
                visible={showDefaultsModal}
                onClose={() => {
                    setShowDefaultsModal(false);
                    // Reload profile to get updated defaults
                    loadUserData(true);
                }}
                currentDefaults={userProfile ? {
                    default_sets: userProfile.default_sets,
                    default_reps: userProfile.default_reps,
                    default_weight_unit: userProfile.default_weight_unit,
                } : null}
            />
        </View>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 280, // Increased from 200 to 280 to ensure delete button is fully visible above tab bar
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
        bottom: -4,
        right: -4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary[600],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 3,
        borderColor: colors.background.primary,
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
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
        marginBottom: 16,
    },
    profileDetails: {
        width: "100%",
        marginTop: 8,
    },
    profileDetail: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 16,
        backgroundColor: colors.background.card,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    profileDetailLabel: {
        fontSize: 14,
        color: colors.text.secondary,
        fontWeight: "500",
    },
    profileDetailValue: {
        fontSize: 14,
        color: colors.text.primary,
        fontWeight: "600",
    },
    bmiContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    bmiCategory: {
        fontSize: 12,
        fontWeight: "500",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        backgroundColor: colors.background.primary,
    },
    completeProfileSection: {
        backgroundColor: colors.primary[50],
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: colors.primary[200],
    },
    completeProfileHeader: {
        marginBottom: 16,
    },
    completeProfileTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.primary[700],
        marginBottom: 8,
    },
    completeProfileSubtitle: {
        fontSize: 14,
        color: colors.primary[600],
        lineHeight: 20,
    },
    completeProfileButton: {
        backgroundColor: colors.primary[600],
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    completeProfileButtonText: {
        color: colors.background.primary,
        fontSize: 16,
        fontWeight: "500",
    },
    profileCompletion: {
        alignItems: "center",
        marginBottom: 16,
    },
    completionBar: {
        width: "100%",
        height: 6,
        backgroundColor: colors.primary[100],
        borderRadius: 3,
        marginBottom: 8,
        overflow: "hidden",
    },
    completionFill: {
        height: "100%",
        backgroundColor: colors.primary[600],
        borderRadius: 3,
    },
    completionText: {
        fontSize: 12,
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
        marginBottom: 150, // Increased from 100 to 150 for even more spacing from bottom
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
    dangerZone: {
        backgroundColor: colors.background.card,
        borderRadius: 16,
        padding: 20,
        marginTop: 24,
        marginBottom: 50,
        borderWidth: 1,
        borderColor: colors.status.error + '20', // 20% opacity
        shadowColor: colors.status.error,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dangerZoneTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.status.error,
        marginBottom: 16,
        textAlign: "center",
    },
    deleteWarning: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.status.error + '10', // 10% opacity
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.status.error + '30', // 30% opacity
    },
    deleteWarningText: {
        fontSize: 14,
        color: colors.status.error,
        fontWeight: "500",
        marginLeft: 8,
    },
    deleteAccountButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background.primary,
        borderWidth: 2,
        borderColor: colors.status.error,
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 8,
    },
    deleteAccountText: {
        color: colors.status.error,
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.primary,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.text.secondary,
    },
    noAchievementsCard: {
        alignItems: "center",
        paddingVertical: 30,
        backgroundColor: colors.background.card,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    noAchievementsText: {
        fontSize: 18,
        fontWeight: "bold",
        color: colors.text.primary,
        marginTop: 10,
    },
    noAchievementsSubtext: {
        fontSize: 14,
        color: colors.text.secondary,
        marginTop: 5,
        textAlign: "center",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background.primary,
        paddingHorizontal: 24,
    },
    errorText: {
        fontSize: 18,
        color: colors.text.secondary,
        marginBottom: 20,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: colors.background.primary,
        fontSize: 16,
        fontWeight: "500",
    },
    bmiLabelContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    bmiInfoButton: {
        padding: 2,
    },
    bmiModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bmiModalContainer: {
        backgroundColor: colors.background.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    bmiModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    bmiModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text.primary,
    },
    bmiModalClose: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bmiModalCloseText: {
        fontSize: 20,
        color: colors.text.secondary,
        fontWeight: '300',
    },
    bmiModalDescription: {
        fontSize: 16,
        color: colors.text.secondary,
        lineHeight: 24,
        marginBottom: 20,
    },
    bmiRanges: {
        marginBottom: 24,
    },
    bmiRangesTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 12,
    },
    bmiRange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: colors.background.primary,
        borderRadius: 8,
        marginBottom: 6,
    },
    bmiRangeLabel: {
        fontSize: 14,
        color: colors.text.secondary,
        fontWeight: '500',
    },
    bmiRangeValue: {
        fontSize: 14,
        color: colors.text.primary,
        fontWeight: '600',
    },
    learnMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[200],
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 8,
    },
    learnMoreText: {
        fontSize: 16,
        color: colors.primary[600],
        fontWeight: '600',
    },
});
