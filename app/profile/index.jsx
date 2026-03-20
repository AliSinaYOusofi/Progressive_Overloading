import { useState, useEffect } from "react";
import React from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Platform,
} from "react-native";
import {
    User,
    Edit,
    Trophy,
    Target,
    Calendar,
    Award,
    LogOut,
    AlertTriangle,
    Info,
    ChevronRight,
    Heart,
    Ruler,
    Weight,
    Users,
    Dumbbell,
    RefreshCw,
    AlertCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import { getProfile, getUserStats, getUserAchievements } from "../../lib/database";
import BMIInfoModal from "../../components/Profile/BMIInfoModal";
import FitnessLevelInfoModal from "../../components/Profile/FitnessLevelInfoModal";
import SetDefaultsModal from "../../components/HomeScreen/SetDefaultsModal";
import SignOutModal from "../../components/Profile/SignOutModal";
import DeleteAccountModal from "../../components/Profile/DeleteAccountModal";
import { useAppStore } from "../../stores/useAppStore";
import AnimatedSlideIn from "../../components/AnimatedSlideIn";

export default function ProfileScreen() {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const router = useRouter();

    // Use individual selectors to avoid re-rendering on every store change
    const storeProfile = useAppStore(state => state.profile);
    const setProfile = useAppStore(state => state.setProfile);
    const storeUser = useAppStore(state => state.user);

    const [userProfile, setUserProfile] = useState(storeProfile || null);
    const [userStats, setUserStats] = useState({
        workoutCount: 0,
        currentStreak: 0,
        personalRecordsCount: 0,
        goalProgress: 0,
    });
    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(!storeProfile);
    const [showBMIModal, setShowBMIModal] = useState(false);
    const [showFitnessLevelModal, setShowFitnessLevelModal] = useState(false);
    const [showDefaultsModal, setShowDefaultsModal] = useState(false);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [focusTrigger, setFocusTrigger] = useState(0);

    // Reset local state and reload when user changes
    useEffect(() => {
        if (!storeUser?.id) return; // Don't fire during sign-out
        setUserProfile(null);
        setIsLoading(true);
        loadUserData();
    }, [storeUser?.id]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            if (!storeUser?.id) return; // Don't fire during sign-out
            loadUserData(true);
            setFocusTrigger(t => t + 1);
        }, [storeUser?.id])
    );

    const loadUserData = async (isRefresh = false) => {
        try {
            if (!isRefresh) {
                setIsLoading(true);
            }

            // Use the store user instead of making a network call to getUser()
            // — the store is already populated by initializeUserData in _layout.jsx
            const userId = useAppStore.getState().user?.id;
            if (!userId) return;

            const [profile, stats, userAchievements] = await Promise.all([
                getProfile(userId),
                getUserStats(userId),
                getUserAchievements(userId),
            ]);

            setUserProfile(profile);
            setProfile(profile);
            setUserStats(stats);
            setAchievements(userAchievements);

            setHasError(false);
        } catch (error) {
            console.error("Error loading user data:", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        setShowSignOutModal(true);
    };

    const handleDeleteAccount = () => {
        setShowDeleteAccountModal(true);
    };

    const getFitnessLevel = (workoutCount) => {
        if (workoutCount === 0) return { label: "Beginner", color: colors.text.tertiary };
        if (workoutCount < 25) return { label: "Novice", color: colors.status.info };
        if (workoutCount < 75) return { label: "Intermediate", color: colors.primary[600] };
        if (workoutCount < 200) return { label: "Advanced", color: colors.status.warning };
        return { label: "Expert", color: colors.status.success };
    };

    const getBMI = () => {
        if (!userProfile?.height_cm || !userProfile?.weight_kg) return null;
        const bmi = (userProfile.weight_kg / Math.pow(userProfile.height_cm / 100, 2)).toFixed(1);
        let category = "Normal", color = colors.status.success;
        if (bmi < 18.5) { category = "Underweight"; color = colors.status.warning; }
        else if (bmi >= 25 && bmi < 30) { category = "Overweight"; color = colors.status.warning; }
        else if (bmi >= 30) { category = "Obese"; color = colors.status.error; }
        return { bmi, category, color };
    };

    const getAge = () => {
        if (!userProfile?.date_of_birth) return null;
        return Math.floor((new Date() - new Date(userProfile.date_of_birth)) / (1000 * 60 * 60 * 24 * 365.25));
    };

    const fitnessLevel = getFitnessLevel(userStats.workoutCount);
    const bmiData = getBMI();
    const age = getAge();

    // Profile completion
    const profileFields = ["height_cm", "weight_kg", "date_of_birth", "gender"];
    const completedFields = profileFields.filter(f => userProfile?.[f]);
    const completionPercent = Math.round((completedFields.length / profileFields.length) * 100);
    const isProfileComplete = completionPercent === 100;

    // Loading state
    if (isLoading && !hasError && !userProfile) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: "center", alignItems: "center" }}>
                <View style={{
                    width: 56, height: 56, borderRadius: 28,
                    backgroundColor: colors.primary[600] + "12",
                    alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                    <ActivityIndicator size="small" color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.primary, marginBottom: 4 }}>
                    Loading Profile
                </Text>
                <Text style={{ fontSize: 14, color: colors.text.tertiary }}>
                    Fetching your details...
                </Text>
            </View>
        );
    }

    // Error state
    if (hasError && !userProfile) {
        return (
            <View style={{ flex: 1, backgroundColor: colors.background.primary, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }}>
                <View style={{
                    width: 60, height: 60, borderRadius: 30,
                    backgroundColor: colors.status.error + "12",
                    alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                    <AlertCircle size={28} color={colors.status.error} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary, marginBottom: 6, textAlign: "center" }}>
                    Something went wrong
                </Text>
                <Text style={{ fontSize: 14, color: colors.text.tertiary, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
                    Failed to load your profile data
                </Text>
                <TouchableOpacity
                    onPress={() => { setHasError(false); loadUserData(); }}
                    style={{
                        flexDirection: "row", alignItems: "center", gap: 8,
                        backgroundColor: colors.primary[600] + "12",
                        paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
                    }}
                >
                    <RefreshCw size={18} color={colors.primary[600]} />
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.primary[600] }}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const statsData = [
        { label: "Workouts", value: userStats.workoutCount.toString(), icon: Dumbbell, color: colors.primary[600], bg: colors.primary[50] },
        { label: "Streak", value: `${userStats.currentStreak}d`, icon: Calendar, color: colors.status.success, bg: colors.status.successLight },
        { label: "PRs", value: userStats.personalRecordsCount.toString(), icon: Trophy, color: colors.status.warning, bg: colors.status.warningLight },
        { label: "Goals", value: `${userStats.goalProgress}%`, icon: Target, color: colors.status.info, bg: colors.status.infoLight },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            <ScrollView
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
                {/* Premium Gradient Header */}
                <AnimatedSlideIn index={0} trigger={focusTrigger}>
                    <LinearGradient
                        colors={isDarkMode
                            ? [colors.primary[50], colors.background.primary]
                            : [colors.primary[100], colors.primary[50], colors.background.primary]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0.3, y: 1 }}
                        style={{
                            paddingHorizontal: 24,
                            paddingTop: Platform.OS === "ios" ? 64 : 44,
                            paddingBottom: 32,
                            alignItems: "center",
                        }}
                    >
                        {/* Avatar */}
                        <View style={{ position: "relative", marginBottom: 20 }}>
                            <View style={{
                                width: 88, height: 88, borderRadius: 44,
                                backgroundColor: colors.primary[600] + "15",
                                alignItems: "center", justifyContent: "center",
                                borderWidth: 3, borderColor: colors.primary[600] + "30",
                            }}>
                                <User size={40} color={colors.primary[600]} />
                            </View>
                            <TouchableOpacity
                                onPress={() => router.push('/profile/edit-profile')}
                                style={{
                                    position: "absolute", bottom: -2, right: -2,
                                    width: 34, height: 34, borderRadius: 17,
                                    backgroundColor: colors.primary[600],
                                    alignItems: "center", justifyContent: "center",
                                    borderWidth: 3, borderColor: colors.background.primary,
                                    shadowColor: colors.primary[600],
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
                                }}
                            >
                                <Edit size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Name & Email */}
                        <Text style={{
                            fontSize: 26, fontWeight: "800",
                            color: colors.text.primary, letterSpacing: -0.5,
                            marginBottom: 4,
                        }}>
                            {userProfile?.full_name || "User"}
                        </Text>
                        <Text style={{
                            fontSize: 14, color: colors.text.tertiary,
                            fontWeight: "500", marginBottom: 12,
                        }}>
                            {userProfile?.email || "No email available"}
                        </Text>

                        {/* Fitness Level Badge */}
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <View style={{
                                backgroundColor: fitnessLevel.color + "15",
                                paddingHorizontal: 16, paddingVertical: 6,
                                borderRadius: 20, borderWidth: 1,
                                borderColor: fitnessLevel.color + "30",
                            }}>
                                <Text style={{
                                    fontSize: 13, fontWeight: "700",
                                    color: fitnessLevel.color, letterSpacing: 0.3,
                                }}>
                                    {fitnessLevel.label}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowFitnessLevelModal(true)}
                                activeOpacity={0.7}
                                style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    backgroundColor: fitnessLevel.color + "15",
                                    alignItems: "center", justifyContent: "center",
                                    borderWidth: 1, borderColor: fitnessLevel.color + "30",
                                }}
                            >
                                <Info size={14} color={fitnessLevel.color} />
                            </TouchableOpacity>
                        </View>

                        {/* Profile Completion Bar */}
                        {!isProfileComplete && (
                            <View style={{ width: "100%", marginTop: 20 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                                    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.secondary }}>
                                        Profile Completion
                                    </Text>
                                    <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary[600] }}>
                                        {completionPercent}%
                                    </Text>
                                </View>
                                <View style={{
                                    width: "100%", height: 6,
                                    backgroundColor: colors.primary[600] + "15",
                                    borderRadius: 3, overflow: "hidden",
                                }}>
                                    <View style={{
                                        width: `${completionPercent}%`, height: "100%",
                                        backgroundColor: colors.primary[600], borderRadius: 3,
                                    }} />
                                </View>
                            </View>
                        )}
                    </LinearGradient>
                </AnimatedSlideIn>

                <View style={{ paddingHorizontal: 20 }}>
                    {/* Stats Grid */}
                    <AnimatedSlideIn index={1} trigger={focusTrigger}>
                        <View style={{
                            flexDirection: "row", flexWrap: "wrap",
                            gap: 10, marginBottom: 20,
                        }}>
                            {statsData.map((stat, index) => (
                                <View key={index} style={{
                                    width: "48%", flexGrow: 1,
                                    backgroundColor: colors.background.card,
                                    borderRadius: 14, padding: 16,
                                    alignItems: "center",
                                    borderWidth: 1, borderColor: colors.border.light,
                                    shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 1, shadowRadius: 6, elevation: 2,
                                }}>
                                    <View style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        backgroundColor: stat.color + "15",
                                        alignItems: "center", justifyContent: "center",
                                        marginBottom: 8,
                                    }}>
                                        <stat.icon size={18} color={stat.color} />
                                    </View>
                                    <Text style={{
                                        fontSize: 22, fontWeight: "800",
                                        color: colors.text.primary, marginBottom: 2,
                                    }}>
                                        {stat.value}
                                    </Text>
                                    <Text style={{
                                        fontSize: 12, fontWeight: "600",
                                        color: colors.text.tertiary,
                                        textAlign: "center",
                                    }}>
                                        {stat.label}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </AnimatedSlideIn>

                    {/* Body Details Card */}
                    {(userProfile?.height_cm || userProfile?.weight_kg || age || userProfile?.gender) && (
                        <AnimatedSlideIn index={2} trigger={focusTrigger}>
                            <View style={{
                                backgroundColor: colors.background.card,
                                borderRadius: 16, padding: 20,
                                borderWidth: 1, borderColor: colors.border.light,
                                marginBottom: 20,
                                shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 1, shadowRadius: 8, elevation: 2,
                            }}>
                                {/* Section Header */}
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
                                    <View style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        backgroundColor: colors.primary[600] + "15",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <User size={20} color={colors.primary[600]} />
                                    </View>
                                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }}>
                                        Body Details
                                    </Text>
                                </View>

                                {/* Detail Rows */}
                                <View style={{ gap: 10 }}>
                                    {userProfile?.height_cm && (
                                        <View style={{
                                            flexDirection: "row", alignItems: "center",
                                            backgroundColor: colors.background.primary,
                                            borderRadius: 12, padding: 14,
                                            borderWidth: 1, borderColor: colors.border.light,
                                        }}>
                                            <View style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                backgroundColor: colors.status.info + "15",
                                                alignItems: "center", justifyContent: "center",
                                                marginRight: 12,
                                            }}>
                                                <Ruler size={16} color={colors.status.info} />
                                            </View>
                                            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text.secondary }}>
                                                Height
                                            </Text>
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                                                {userProfile.height_cm} cm
                                            </Text>
                                        </View>
                                    )}

                                    {userProfile?.weight_kg && (
                                        <View style={{
                                            flexDirection: "row", alignItems: "center",
                                            backgroundColor: colors.background.primary,
                                            borderRadius: 12, padding: 14,
                                            borderWidth: 1, borderColor: colors.border.light,
                                        }}>
                                            <View style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                backgroundColor: colors.status.warning + "15",
                                                alignItems: "center", justifyContent: "center",
                                                marginRight: 12,
                                            }}>
                                                <Weight size={16} color={colors.status.warning} />
                                            </View>
                                            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text.secondary }}>
                                                Weight
                                            </Text>
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                                                {userProfile.weight_kg} kg
                                            </Text>
                                        </View>
                                    )}

                                    {age && (
                                        <View style={{
                                            flexDirection: "row", alignItems: "center",
                                            backgroundColor: colors.background.primary,
                                            borderRadius: 12, padding: 14,
                                            borderWidth: 1, borderColor: colors.border.light,
                                        }}>
                                            <View style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                backgroundColor: colors.primary[600] + "15",
                                                alignItems: "center", justifyContent: "center",
                                                marginRight: 12,
                                            }}>
                                                <Calendar size={16} color={colors.primary[600]} />
                                            </View>
                                            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text.secondary }}>
                                                Age
                                            </Text>
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                                                {age} years
                                            </Text>
                                        </View>
                                    )}

                                    {userProfile?.gender && (
                                        <View style={{
                                            flexDirection: "row", alignItems: "center",
                                            backgroundColor: colors.background.primary,
                                            borderRadius: 12, padding: 14,
                                            borderWidth: 1, borderColor: colors.border.light,
                                        }}>
                                            <View style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                backgroundColor: colors.status.success + "15",
                                                alignItems: "center", justifyContent: "center",
                                                marginRight: 12,
                                            }}>
                                                <Users size={16} color={colors.status.success} />
                                            </View>
                                            <Text style={{ flex: 1, fontSize: 14, fontWeight: "500", color: colors.text.secondary }}>
                                                Gender
                                            </Text>
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary }}>
                                                {userProfile.gender.charAt(0).toUpperCase() + userProfile.gender.slice(1).replace(/_/g, " ")}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* BMI Card */}
                                {bmiData && (
                                    <TouchableOpacity
                                        onPress={() => setShowBMIModal(true)}
                                        activeOpacity={0.7}
                                        style={{
                                            marginTop: 12,
                                            backgroundColor: bmiData.color + "10",
                                            borderRadius: 12, padding: 14,
                                            borderWidth: 1, borderColor: bmiData.color + "25",
                                            flexDirection: "row", alignItems: "center", gap: 12,
                                        }}
                                    >
                                        <View style={{
                                            width: 40, height: 40, borderRadius: 20,
                                            backgroundColor: bmiData.color + "18",
                                            alignItems: "center", justifyContent: "center",
                                        }}>
                                            <Heart size={18} color={bmiData.color} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text.secondary, marginBottom: 2 }}>
                                                Body Mass Index
                                            </Text>
                                            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                                                <Text style={{ fontSize: 22, fontWeight: "800", color: bmiData.color }}>
                                                    {bmiData.bmi}
                                                </Text>
                                                <Text style={{ fontSize: 13, fontWeight: "600", color: bmiData.color }}>
                                                    {bmiData.category}
                                                </Text>
                                            </View>
                                        </View>
                                        <Info size={18} color={bmiData.color} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </AnimatedSlideIn>
                    )}

                    {/* Complete Profile CTA */}
                    {!isProfileComplete && (
                        <AnimatedSlideIn index={3} trigger={focusTrigger}>
                            <TouchableOpacity
                                onPress={() => router.push('/profile/edit-profile')}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={[colors.primary[500], colors.primary[700]]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={{
                                        borderRadius: 16, padding: 20,
                                        marginBottom: 20,
                                        flexDirection: "row", alignItems: "center",
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={{
                                            fontSize: 17, fontWeight: "700",
                                            color: "#FFFFFF", marginBottom: 4,
                                        }}>
                                            Complete Your Profile
                                        </Text>
                                        <Text style={{
                                            fontSize: 13, color: "rgba(255,255,255,0.8)",
                                            fontWeight: "500", lineHeight: 18,
                                        }}>
                                            Add your details for personalized insights
                                        </Text>
                                    </View>
                                    <View style={{
                                        width: 40, height: 40, borderRadius: 20,
                                        backgroundColor: "rgba(255,255,255,0.2)",
                                        alignItems: "center", justifyContent: "center",
                                    }}>
                                        <ChevronRight size={22} color="#FFFFFF" />
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        </AnimatedSlideIn>
                    )}

                    {/* Account Section */}
                    <AnimatedSlideIn index={4} trigger={focusTrigger}>
                        <View style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 16, padding: 6,
                            borderWidth: 1, borderColor: colors.border.light,
                            marginBottom: 20,
                            shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1, shadowRadius: 8, elevation: 2,
                        }}>
                            {/* Section Header */}
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, paddingBottom: 6 }}>
                                <Text style={{
                                    fontSize: 13, fontWeight: "600",
                                    color: colors.text.tertiary,
                                    textTransform: "uppercase", letterSpacing: 0.5,
                                }}>
                                    Account
                                </Text>
                            </View>

                            {/* Edit Profile */}
                            <TouchableOpacity
                                onPress={() => router.push('/profile/edit-profile')}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    padding: 14, borderRadius: 12,
                                }}
                                activeOpacity={0.6}
                            >
                                <View style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    backgroundColor: colors.primary[600] + "12",
                                    alignItems: "center", justifyContent: "center",
                                    marginRight: 14,
                                }}>
                                    <Edit size={18} color={colors.primary[600]} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 16, fontWeight: "500", color: colors.text.primary }}>
                                    Edit Profile
                                </Text>
                                <ChevronRight size={18} color={colors.text.tertiary} />
                            </TouchableOpacity>

                            {/* Workout Defaults */}
                            <TouchableOpacity
                                onPress={() => setShowDefaultsModal(true)}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    padding: 14, borderRadius: 12,
                                }}
                                activeOpacity={0.6}
                            >
                                <View style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    backgroundColor: colors.status.info + "12",
                                    alignItems: "center", justifyContent: "center",
                                    marginRight: 14,
                                }}>
                                    <Target size={18} color={colors.status.info} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 16, fontWeight: "500", color: colors.text.primary }}>
                                    Workout Defaults
                                </Text>
                                <ChevronRight size={18} color={colors.text.tertiary} />
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={{
                                height: 1, backgroundColor: colors.border.light,
                                marginHorizontal: 14, marginVertical: 4,
                            }} />

                            {/* Sign Out */}
                            <TouchableOpacity
                                onPress={handleLogout}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    padding: 14, borderRadius: 12,
                                }}
                                activeOpacity={0.6}
                            >
                                <View style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    backgroundColor: colors.status.error + "12",
                                    alignItems: "center", justifyContent: "center",
                                    marginRight: 14,
                                }}>
                                    <LogOut size={18} color={colors.status.error} />
                                </View>
                                <Text style={{ flex: 1, fontSize: 16, fontWeight: "500", color: colors.status.error }}>
                                    Sign Out
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedSlideIn>

                    {/* Danger Zone */}
                    <AnimatedSlideIn index={5} trigger={focusTrigger}>
                        <View style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 16, padding: 20,
                            borderWidth: 1, borderColor: colors.status.error + "20",
                            marginBottom: 140,
                        }}>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                <AlertTriangle size={16} color={colors.status.error} />
                                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.status.error }}>
                                    Danger Zone
                                </Text>
                            </View>

                            <View style={{
                                backgroundColor: colors.status.error + "08",
                                borderRadius: 10, padding: 12,
                                marginBottom: 16,
                                borderWidth: 1, borderColor: colors.status.error + "15",
                            }}>
                                <Text style={{
                                    fontSize: 13, color: colors.text.secondary,
                                    lineHeight: 18, fontWeight: "500",
                                }}>
                                    Deleting your account will permanently remove all your workout data, goals, and progress. This action cannot be undone.
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={handleDeleteAccount}
                                style={{
                                    flexDirection: "row", alignItems: "center",
                                    justifyContent: "center", gap: 8,
                                    backgroundColor: colors.background.primary,
                                    borderWidth: 1.5, borderColor: colors.status.error + "40",
                                    borderRadius: 12, paddingVertical: 14,
                                }}
                                activeOpacity={0.7}
                            >
                                <AlertTriangle size={16} color={colors.status.error} />
                                <Text style={{
                                    fontSize: 15, fontWeight: "600",
                                    color: colors.status.error,
                                }}>
                                    Delete Account
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedSlideIn>
                </View>
            </ScrollView>

            <BMIInfoModal visible={showBMIModal} onClose={() => setShowBMIModal(false)} />

            <FitnessLevelInfoModal
                visible={showFitnessLevelModal}
                onClose={() => setShowFitnessLevelModal(false)}
                currentLevel={fitnessLevel.label}
                workoutCount={userStats.workoutCount}
            />

            <SetDefaultsModal
                visible={showDefaultsModal}
                onClose={() => {
                    setShowDefaultsModal(false);
                    loadUserData(true);
                }}
                currentDefaults={userProfile ? {
                    default_sets: userProfile.default_sets,
                    default_reps: userProfile.default_reps,
                    default_weight_unit: userProfile.default_weight_unit,
                } : null}
            />

            <SignOutModal
                visible={showSignOutModal}
                onClose={() => setShowSignOutModal(false)}
            />

            <DeleteAccountModal
                visible={showDeleteAccountModal}
                onClose={() => setShowDeleteAccountModal(false)}
            />
        </View>
    );
}
