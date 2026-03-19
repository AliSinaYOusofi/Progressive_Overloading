import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Modal, Dimensions } from "react-native";
import { ChevronLeft, Minus, Plus, Dumbbell, Repeat, Layers, Calendar, CheckCircle2, AlertCircle, Weight } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useThemedColors } from "../hooks/useThemedColors";
import { useTheme } from "../contexts/ThemeContext";
import { useRouter } from "expo-router";
import { useAppStore } from "../stores/useAppStore";
import { getCurrentUser } from "../lib/database";
import exerciseNames from "../exercise_names.json";
import { useExerciseMuscleGroups } from "../hooks/useExerciseMuscleGroups";
import AnimatedSlideIn from "../components/AnimatedSlideIn";
import ModalCloseButton from "../components/ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { formatDistanceToNow, format } from "date-fns";
import { LAYOUT } from "../constants/layout";

export default function LogSetScreen() {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const user = useAppStore(state => state.user);
    const recentSets = useAppStore(state => state.recentSets);
    const addExerciseSet = useAppStore(state => state.addExerciseSet);
    const refreshRecentSets = useAppStore(state => state.refreshRecentSets);
    const refreshProgress = useAppStore(state => state.refreshProgress);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusTrigger, setFocusTrigger] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const scrollRef = useRef(null);

    useFocusEffect(useCallback(() => {
        setFocusTrigger((t) => t + 1);
    }, []));

    const [exerciseName, setExerciseName] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("lb");
    const [sets, setSets] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [defaults, setDefaults] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedChipName, setSelectedChipName] = useState(null);
    const prevIsSubmittingRef = useRef(false);

    // Gesture handling for chip detail modal swipe-to-close
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.01;

    const handleModalClose = useCallback(() => {
        setSelectedChipName(null);
    }, []);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > SWIPE_THRESHOLD) {
                translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
                    'worklet';
                    scheduleOnRN(handleModalClose);
                });
            } else {
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const modalAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const dragHandleAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            translateY.value,
            [0, 50, 100],
            [colors.border.light, colors.primary[400], colors.primary[600]]
        );
        return { backgroundColor };
    });

    useEffect(() => {
        if (selectedChipName) {
            translateY.value = 0;
        }
    }, [selectedChipName, translateY]);

    // Derive recent exercises (unique, today only, max 8) and last set per exercise
    const { recentExercises, lastSetByExercise } = useMemo(() => {
        const sets = recentSets || [];
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const todaySets = sets.filter(s => {
            const performed = s.performed_at ? new Date(s.performed_at).getTime() : 0;
            return performed >= todayStart;
        });
        const seen = new Set();
        const exercises = [];
        const lastByExercise = {};
        for (const s of todaySets) {
            const name = s.exercises?.name;
            if (!name) continue;
            if (!seen.has(name)) {
                seen.add(name);
                exercises.push(name);
                if (exercises.length >= 8) break;
            }
            if (!lastByExercise[name]) lastByExercise[name] = s;
        }
        return { recentExercises: exercises, lastSetByExercise: lastByExercise };
    }, [recentSets]);

    // Get muscle groups for suggestions and recent exercises
    const getMuscleGroup = useExerciseMuscleGroups([...suggestions, ...recentExercises]);

    // Weight units only for logging sets
    const weightUnits = [
        { label: "lb", value: "lb" },
        { label: "kg", value: "kg" },
        { label: "oz", value: "oz" },
        { label: "g", value: "g" },
    ];

    // Fetch defaults on mount
    useEffect(() => {
        if (!user) return; // Don't fetch during sign-out
        const fetchDefaults = async () => {
            try {
                const currentUser = user || (await getCurrentUser());
                if (currentUser) {
                    const { getProfile } = await import("../lib/database");
                    const profile = await getProfile(currentUser.id);
                    if (profile) {
                        setDefaults({
                            default_sets: profile.default_sets,
                            default_reps: profile.default_reps,
                            default_weight_unit: profile.default_weight_unit,
                        });
                        // Apply defaults
                        if (profile.default_sets) {
                            setSets(String(profile.default_sets));
                        }
                        if (profile.default_reps) {
                            setReps(String(profile.default_reps));
                        }
                        if (profile.default_weight_unit) {
                            setUnit(profile.default_weight_unit);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching user defaults:', error);
            }
        };
        fetchDefaults();
    }, [user]);

    // Check if exercise is a bodyweight exercise
    const isBodyweightExercise = useCallback((exerciseName) => {
        if (!exerciseName) return false;
        const lower = exerciseName.toLowerCase();
        const bodyweightKeywords = [
            'bodyweight', 'sit-up', 'sit up', 'crunch', 'plank', 'push-up',
            'push up', 'pull-up', 'pull up', 'stretch', 'stretching',
            'yoga', 'cardio', 'running', 'walking', 'jumping', 'jump',
            'burpee', 'mountain climber', 'abs', 'abdominal', 'lunge',
            'squat', 'dip', 'chin-up', 'chin up', 'muscle-up', 'muscle up',
            'handstand', 'wall sit', 'flutter kick', 'leg raise', 'hip raise',
            'glute bridge', 'superman', 'dead bug', 'bird dog', 'side plank',
            'russian twist', 'bicycle', 'toe touch', 'v-up', 'hollow hold'
        ];
        return bodyweightKeywords.some(keyword => lower.includes(keyword));
    }, []);

    // Filter exercises based on query
    const filterExercises = useCallback((query) => {
        if (!query || query.trim().length < 3) {
            return [];
        }

        const normalizedQuery = query.toLowerCase().trim();
        const startsWithMatches = [];
        const containsMatches = [];

        exerciseNames.forEach((exercise) => {
            const normalizedExercise = exercise.toLowerCase();
            if (normalizedExercise.startsWith(normalizedQuery)) {
                startsWithMatches.push(exercise);
            } else if (normalizedExercise.includes(normalizedQuery)) {
                containsMatches.push(exercise);
            }
        });

        // Combine: starts-with matches first, then contains matches
        const allMatches = [...startsWithMatches, ...containsMatches];
        return allMatches.slice(0, 8);
    }, []);

    // Handle exercise name change
    const handleExerciseNameChange = useCallback((text) => {
        setExerciseName(text);
        const filtered = filterExercises(text);
        setSuggestions(filtered);
        setShowSuggestions(text.trim().length >= 3 && filtered.length > 0);

        // Auto-suggest weight = 0 for bodyweight exercises if weight field is empty
        if (isBodyweightExercise(text) && (!weight || weight === "")) {
            setWeight("0");
        }
    }, [filterExercises, isBodyweightExercise, weight]);

    // Handle suggestion selection
    const handleSuggestionSelect = useCallback((selectedExercise) => {
        setExerciseName(selectedExercise);
        setShowSuggestions(false);
        setSuggestions([]);

        // Auto-suggest weight = 0 for bodyweight exercises if weight field is empty
        if (isBodyweightExercise(selectedExercise) && (!weight || weight === "")) {
            setWeight("0");
        }
    }, [isBodyweightExercise, weight]);

    // Handle input blur
    const handleExerciseInputBlur = useCallback(() => {
        // Delay hiding suggestions to allow for selection
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    }, []);

    // Handle quick-fill from recent exercise chip
    const handleQuickFillSelect = useCallback((name) => {
        const last = lastSetByExercise[name];
        setExerciseName(name);
        setShowSuggestions(false);
        setSuggestions([]);
        if (last) {
            setWeight(String(last.weight ?? 0));
            setReps(String(last.reps ?? ""));
            setSets(String(last.sets ?? 1));
            setUnit(last.unit || "lb");
        }
        if (isBodyweightExercise(name) && (!last || last.weight == null)) {
            setWeight("0");
        }
    }, [lastSetByExercise, isBodyweightExercise]);

    const incrementReps = useCallback(() => {
        const v = parseInt(reps, 10) || 0;
        setReps(String(Math.min(100, v + 1)));
    }, [reps]);
    const decrementReps = useCallback(() => {
        const v = parseInt(reps, 10) || 0;
        setReps(String(Math.max(1, v - 1)));
    }, [reps]);
    const incrementSets = useCallback(() => {
        const v = parseInt(sets, 10) || 0;
        setSets(String(Math.min(30, v + 1)));
    }, [sets]);
    const decrementSets = useCallback(() => {
        const v = parseInt(sets, 10) || 0;
        setSets(String(Math.max(1, v - 1)));
    }, [sets]);

    // Handle success/error messages and reset form after successful submission
    useEffect(() => {
        const wasSubmitting = prevIsSubmittingRef.current;
        prevIsSubmittingRef.current = isSubmitting;

        // Only process if we just finished submitting (went from true to false)
        if (wasSubmitting && !isSubmitting) {
            if (!errorMessage) {
                // Success - show success message and reset form
                setSuccessMessage(isEditMode ? "Set edited!" : "Exercise logged!");
                setIsSaved(true);
                scrollRef.current?.scrollTo({ y: 0, animated: true });

                // Reset form to defaults for next exercise
                const resetForm = () => {
                    setExerciseName("");
                    setWeight("");
                    setReps("");
                    setSets("");
                    setShowSuggestions(false);
                    setSuggestions([]);
                    setErrorMessage("");
                    setIsEditMode(false);

                    // Re-apply defaults
                    if (defaults) {
                        if (defaults.default_sets) {
                            setSets(String(defaults.default_sets));
                        }
                        if (defaults.default_reps) {
                            setReps(String(defaults.default_reps));
                        }
                        if (defaults.default_weight_unit) {
                            setUnit(defaults.default_weight_unit);
                        }
                    } else {
                        setUnit("lb");
                    }
                };

                // Reset form after a short delay
                setTimeout(resetForm, 100);

                // Clear success message after 5 seconds
                const successTimeout = setTimeout(() => {
                    setSuccessMessage("");
                    setIsSaved(false);
                }, 5000);
                return () => clearTimeout(successTimeout);
            } else {
                // Error - error message is already set, clear it after 5 seconds
                const errorTimeout = setTimeout(() => {
                    setErrorMessage("");
                }, 5000);
                return () => clearTimeout(errorTimeout);
            }
        }
    }, [isSubmitting, errorMessage, defaults]);

    const handleSubmit = async () => {
        setErrorMessage(""); // Clear any previous errors
        setSuccessMessage(""); // Clear any previous success messages

        const name = exerciseName.trim();
        if (!name) {
            setErrorMessage("Please enter an exercise name.");
            return;
        }

        // Weight is optional - default to 0 if empty
        const weightValue = weight.trim() === "" ? "0" : weight;
        const w = parseFloat(weightValue);
        if (isNaN(w) || w < 0) {
            setErrorMessage("Please enter a valid weight (0 or leave empty for bodyweight exercises).");
            return;
        }

        // Validate reps - must be a number between 1 and 100
        const repsTrimmed = reps.trim();
        if (!repsTrimmed || repsTrimmed === "") {
            setErrorMessage("Please enter the number of reps.");
            return;
        }
        const r = parseInt(repsTrimmed, 10);
        if (isNaN(r) || r <= 0 || r > 100) {
            setErrorMessage("Reps must be between 1 and 100.");
            return;
        }

        // Validate sets - must be a number between 1 and 30
        const setsTrimmed = sets.trim();
        if (!setsTrimmed || setsTrimmed === "") {
            setErrorMessage("Please enter the number of sets.");
            return;
        }
        const s = parseInt(setsTrimmed, 10);
        if (isNaN(s) || s <= 0 || s > 30) {
            setErrorMessage("Sets must be between 1 and 30.");
            return;
        }
        const u = (unit || "lb").trim(); // Default to "lb" if no unit is selected

        // Call the API directly to avoid toast messages
        setIsSubmitting(true);
        try {
            const currentUser = user || (await getCurrentUser());
            if (!currentUser) {
                setErrorMessage("User not found. Please try again.");
                setIsSubmitting(false);
                return;
            }

            const { findOrCreateExercise, createExerciseSet } = await import("../lib/database");
            const exercise = await findOrCreateExercise(currentUser.id, name);
            const newSet = await createExerciseSet({
                user_id: currentUser.id,
                exercise_id: exercise.id,
                weight: w,
                reps: r,
                sets: s,
                unit: u,
                performed_at: new Date().toISOString(),
            });

            // Add set to store with exercise relation for display
            const setWithExercise = {
                ...newSet,
                exercises: { name: exercise.name }
            };
            addExerciseSet(setWithExercise);

            // Refresh recent sets and progress in background
            refreshRecentSets();
            refreshProgress();

            // Success will be handled by useEffect when isSubmitting becomes false
        } catch (error) {
            const { getUserFriendlyError, logError } = await import("../utils/errorHandler");
            logError(error, 'log-set');
            setErrorMessage(getUserFriendlyError(error, "Failed to log set. Please try again."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const lastUsedForExercise = exerciseName.trim() ? lastSetByExercise[exerciseName.trim()] : null;
    const borderColor = isDarkMode ? colors.border.medium : "#E5E7EB";
    const cardBg = colors.background.card;

    // Computed: form completion
    const filledFields = [
        exerciseName.trim(),
        reps.trim(),
        sets.trim(),
    ].filter(Boolean).length;
    const totalRequiredFields = 3;

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background.primary },
        header: {
            paddingHorizontal: 24,
            paddingTop: Platform.OS === "ios" ? 64 : 44,
            paddingBottom: 28,
        },
        scrollContent: {
            flexGrow: 1,
            paddingBottom: 120,
            paddingHorizontal: 20,
        },
        // Completion dots
        completionBar: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
        },
        completionDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        // Section card
        sectionCard: {
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
            marginBottom: 20,
            shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 2,
        },
        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 18,
        },
        sectionIconBadge: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: colors.primary[600] + "15",
            alignItems: "center",
            justifyContent: "center",
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text.primary,
        },
        // Premium inputs
        inputWrapper: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.background.input,
            borderWidth: 1.5,
            borderColor: colors.border.light,
            borderRadius: 12,
            paddingHorizontal: 14,
        },
        inputField: {
            flex: 1,
            fontSize: 16,
            color: colors.text.primary,
            paddingVertical: Platform.OS === "ios" ? 14 : 12,
            paddingHorizontal: 0,
        },
        inputLabel: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text.secondary,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 0.5,
        },
        inputIcon: {
            marginRight: 10,
        },
        // Stepper
        stepperRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
        },
        stepperBtn: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary[600] + "15",
            alignItems: "center",
            justifyContent: "center",
        },
        // CTA
        ctaButton: LAYOUT.ctaButton,
        ctaButtonText: LAYOUT.ctaText,
        cancelLink: {
            alignItems: "center",
            paddingVertical: 14,
            marginTop: 8,
        },
        cancelLinkText: {
            color: colors.text.tertiary,
            fontSize: 15,
            fontWeight: "600",
        },
    });

    return (
        <View style={styles.container}>
            {/* Hero Header with Gradient */}
            <AnimatedSlideIn index={0} trigger={focusTrigger}>
                <LinearGradient
                    colors={isDarkMode
                        ? [colors.primary[50], colors.background.primary]
                        : [colors.primary[100], colors.primary[50], colors.background.primary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.3, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity
                        style={{ padding: 8, alignSelf: "flex-start", marginBottom: 16 }}
                        onPress={() => router.back()}
                        disabled={isSubmitting}
                    >
                        <ChevronLeft size={24} color={colors.text.primary} />
                    </TouchableOpacity>

                    <View style={{
                        width: 56, height: 56, borderRadius: 16,
                        backgroundColor: colors.primary[600] + "20",
                        alignItems: "center", justifyContent: "center",
                        marginBottom: 16,
                    }}>
                        <Dumbbell size={28} color={colors.primary[600]} />
                    </View>

                    <Text style={{
                        fontSize: 28, fontWeight: "800",
                        color: colors.text.primary, letterSpacing: -0.5,
                        marginBottom: 6,
                    }}>
                        {isEditMode ? "Edit Exercise" : "Log Exercise"}
                    </Text>
                    <Text style={{
                        fontSize: 15, color: colors.text.secondary,
                        fontWeight: "500", lineHeight: 20,
                    }}>
                        {isEditMode
                            ? "Update your exercise set details"
                            : "Record your workout and track progress"}
                    </Text>
                </LinearGradient>
            </AnimatedSlideIn>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <ScrollView
                    ref={scrollRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Form Completion Indicator */}
                    <AnimatedSlideIn index={1} trigger={focusTrigger}>
                        <View style={styles.completionBar}>
                            {[0, 1, 2].map((i) => (
                                <View key={i} style={[
                                    styles.completionDot,
                                    { backgroundColor: i < filledFields ? colors.primary[600] : colors.border.light },
                                ]} />
                            ))}
                            <Text style={{
                                fontSize: 12, fontWeight: "600",
                                color: filledFields === totalRequiredFields ? colors.status.success : colors.text.tertiary,
                                marginLeft: 4,
                            }}>
                                {filledFields}/{totalRequiredFields} required
                            </Text>
                        </View>
                    </AnimatedSlideIn>

                    {/* Success Message */}
                    {successMessage ? (
                        <View style={{
                            marginBottom: 16,
                            backgroundColor: colors.status.success + "20",
                            padding: 12,
                            borderRadius: 12,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.status.success,
                            flexDirection: "row",
                            alignItems: "center",
                        }}>
                            <CheckCircle2 size={16} color={colors.status.success} style={{ marginRight: 8 }} />
                            <Text style={{ color: colors.status.success, fontSize: 14, fontWeight: "600", flex: 1 }}>
                                {successMessage}
                            </Text>
                        </View>
                    ) : null}

                    {/* Error Message */}
                    {errorMessage ? (
                        <View style={{
                            marginBottom: 16,
                            backgroundColor: colors.status.error + "20",
                            padding: 12,
                            borderRadius: 12,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.status.error,
                            flexDirection: "row",
                            alignItems: "center",
                        }}>
                            <AlertCircle size={16} color={colors.status.error} style={{ marginRight: 8 }} />
                            <Text style={{ color: colors.status.error, fontSize: 14, fontWeight: "600", flex: 1 }}>
                                {errorMessage}
                            </Text>
                        </View>
                    ) : null}

                    {/* Quick-fill recent exercises */}
                    {recentExercises.length > 0 && (
                        <AnimatedSlideIn index={2} trigger={focusTrigger}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={{ marginBottom: 20 }}
                                contentContainerStyle={{ paddingLeft: 2, paddingRight: 16 }}
                                snapToInterval={168}
                                decelerationRate="fast"
                                snapToAlignment="start"
                            >
                                {recentExercises.map((name, index) => {
                                    const lastSet = lastSetByExercise[name];
                                    return (
                                        <TouchableOpacity
                                            key={name}
                                            onPress={() => !isSubmitting && setSelectedChipName(name)}
                                            disabled={isSubmitting}
                                            style={{
                                                width: 156,
                                                marginRight: 12,
                                                paddingHorizontal: 14,
                                                paddingVertical: 14,
                                                borderRadius: 18,
                                                backgroundColor: "transparent",
                                                borderWidth: 1,
                                                borderColor: colors.primary[600] + "30",
                                                shadowColor: colors.primary[600],
                                                shadowOffset: { width: 0, height: 3 },
                                                shadowOpacity: 0.15,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            {/* Index badge + muscle group row */}
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                                <View style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 14,
                                                    backgroundColor: colors.primary[600],
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}>
                                                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff" }}>
                                                        {index + 1}
                                                    </Text>
                                                </View>
                                                {getMuscleGroup(name) && (
                                                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: colors.primary[600] + "15" }}>
                                                        <Text style={{ fontSize: 10, fontWeight: "700", color: colors.primary[600] }}>{getMuscleGroup(name)}</Text>
                                                    </View>
                                                )}
                                            </View>

                                            {/* Exercise name */}
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text.primary, marginBottom: 6 }} numberOfLines={2}>
                                                {name}
                                            </Text>

                                            {/* Last set info */}
                                            {lastSet && (
                                                <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text.tertiary }}>
                                                    {lastSet.weight ?? 0} {lastSet.unit || "lb"} x {lastSet.reps ?? 0} x {lastSet.sets ?? 1}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </AnimatedSlideIn>
                    )}

                    {/* ===== CARD 1: Exercise ===== */}
                    <AnimatedSlideIn index={3} trigger={focusTrigger} style={{ zIndex: showSuggestions && suggestions.length > 0 ? 999 : 1, elevation: showSuggestions && suggestions.length > 0 ? 999 : 1 }}>
                        <View style={[styles.sectionCard, { marginBottom: showSuggestions && suggestions.length > 0 ? 20 : 20 }]}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBadge}>
                                    <Dumbbell size={20} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.sectionTitle}>Exercise</Text>
                            </View>

                            <Text style={styles.inputLabel}>Exercise Name *</Text>
                            <View style={{ zIndex: showSuggestions ? 1000 : 1 }}>
                                <View style={[
                                    styles.inputWrapper,
                                    showSuggestions && { borderColor: isDarkMode ? colors.primary[400] : colors.primary[500] }
                                ]}>
                                    <Dumbbell size={18} color={colors.text.tertiary} style={styles.inputIcon} />
                                    <TextInput
                                        editable={!isSubmitting}
                                        value={exerciseName}
                                        onChangeText={handleExerciseNameChange}
                                        onBlur={handleExerciseInputBlur}
                                        onFocus={() => {
                                            if (exerciseName.trim().length >= 3) {
                                                const filtered = filterExercises(exerciseName);
                                                setSuggestions(filtered);
                                                setShowSuggestions(filtered.length > 0);
                                            }
                                        }}
                                        placeholder="e.g., Bench Press"
                                        placeholderTextColor={colors.text.placeholder}
                                        style={styles.inputField}
                                    />
                                </View>
                                {showSuggestions && suggestions.length > 0 && (
                                    <View style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        marginTop: 4,
                                        backgroundColor: cardBg,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderColor: borderColor,
                                        shadowColor: "#000",
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 8,
                                        elevation: 999,
                                        maxHeight: 220,
                                        zIndex: 1000,
                                        overflow: "hidden",
                                    }}>
                                        <ScrollView
                                            nestedScrollEnabled={true}
                                            showsVerticalScrollIndicator={false}
                                            keyboardShouldPersistTaps="handled"
                                        >
                                            {suggestions.map((suggestion, index) => {
                                                const muscleGroup = getMuscleGroup(suggestion);
                                                return (
                                                    <TouchableOpacity
                                                        key={suggestion}
                                                        onPress={() => handleSuggestionSelect(suggestion)}
                                                        style={{
                                                            paddingHorizontal: 16,
                                                            paddingVertical: 12,
                                                            borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                                                            borderBottomColor: isDarkMode ? colors.border.medium : "#F3F4F6",
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={{
                                                            fontSize: 16,
                                                            color: colors.text.primary,
                                                            fontWeight: "400",
                                                            flex: 1,
                                                            flexShrink: 1,
                                                            marginRight: 8,
                                                        }} numberOfLines={1}>
                                                            {suggestion}
                                                        </Text>
                                                        {muscleGroup && (
                                                            <View style={{
                                                                paddingHorizontal: 6,
                                                                paddingVertical: 2,
                                                                borderRadius: 8,
                                                                backgroundColor: colors.background.secondary || colors.neutral[100],
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: 10,
                                                                    color: colors.text.tertiary || colors.text.secondary,
                                                                    fontWeight: '500',
                                                                }}>
                                                                    {muscleGroup}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                            {(exerciseName.trim() && (getMuscleGroup(exerciseName.trim()) || lastUsedForExercise)) ? (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                                    {getMuscleGroup(exerciseName.trim()) && (
                                        <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: colors.primary[600] + "15" }}>
                                            <Text style={{ fontSize: 12, fontWeight: "600", color: colors.primary[600] }}>{getMuscleGroup(exerciseName.trim())}</Text>
                                        </View>
                                    )}
                                    {lastUsedForExercise && (
                                        <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
                                            Last: {lastUsedForExercise.weight ?? 0} {lastUsedForExercise.unit || "lb"} x {lastUsedForExercise.reps ?? 0} x {lastUsedForExercise.sets ?? 1}
                                        </Text>
                                    )}
                                </View>
                            ) : null}
                        </View>
                    </AnimatedSlideIn>

                    {/* ===== CARD 2: Weight ===== */}
                    <AnimatedSlideIn index={4} trigger={focusTrigger} style={{ zIndex: 1 }}>
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBadge}>
                                    <Weight size={20} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.sectionTitle}>Weight</Text>
                            </View>

                            <Text style={styles.inputLabel}>Amount</Text>
                            <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-end" }}>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <TextInput
                                        editable={!isSubmitting}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        placeholder={isBodyweightExercise(exerciseName) ? "0 (bodyweight)" : "0"}
                                        placeholderTextColor={colors.text.placeholder}
                                        style={[styles.inputField, { textAlign: "center" }]}
                                    />
                                </View>
                                <View style={{ flexDirection: "row", borderRadius: 12, overflow: "hidden", borderWidth: 1.5, borderColor: colors.border.light, backgroundColor: colors.background.input }}>
                                    {weightUnits.map((u) => (
                                        <TouchableOpacity
                                            key={u.value}
                                            onPress={() => !isSubmitting && setUnit(u.value)}
                                            disabled={isSubmitting}
                                            style={{
                                                paddingHorizontal: 14,
                                                paddingVertical: 12,
                                                backgroundColor: unit === u.value ? colors.primary[600] : "transparent",
                                            }}
                                        >
                                            <Text style={{ fontSize: 13, fontWeight: "700", color: unit === u.value ? "#fff" : colors.text.secondary }}>{u.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </AnimatedSlideIn>

                    {/* ===== CARD 3: Reps & Sets ===== */}
                    <AnimatedSlideIn index={5} trigger={focusTrigger} style={{ zIndex: 1 }}>
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <View style={styles.sectionIconBadge}>
                                    <Repeat size={20} color={colors.primary[600]} />
                                </View>
                                <Text style={styles.sectionTitle}>Reps & Sets</Text>
                            </View>

                            <Text style={styles.inputLabel}>Reps *</Text>
                            <View style={[styles.stepperRow, { marginBottom: 20 }]}>
                                <TouchableOpacity onPress={decrementReps} disabled={isSubmitting} style={styles.stepperBtn} activeOpacity={0.7}>
                                    <Minus size={20} color={colors.primary[600]} strokeWidth={2.5} />
                                </TouchableOpacity>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <TextInput
                                        editable={!isSubmitting}
                                        value={reps}
                                        onChangeText={setReps}
                                        keyboardType="number-pad"
                                        placeholder="0"
                                        placeholderTextColor={colors.text.placeholder}
                                        style={[styles.inputField, { textAlign: "center" }]}
                                    />
                                </View>
                                <TouchableOpacity onPress={incrementReps} disabled={isSubmitting} style={styles.stepperBtn} activeOpacity={0.7}>
                                    <Plus size={20} color={colors.primary[600]} strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: 1, backgroundColor: colors.border.light, marginBottom: 20 }} />

                            <Text style={styles.inputLabel}>Sets *</Text>
                            <View style={styles.stepperRow}>
                                <TouchableOpacity onPress={decrementSets} disabled={isSubmitting} style={styles.stepperBtn} activeOpacity={0.7}>
                                    <Minus size={20} color={colors.primary[600]} strokeWidth={2.5} />
                                </TouchableOpacity>
                                <View style={[styles.inputWrapper, { flex: 1 }]}>
                                    <TextInput
                                        editable={!isSubmitting}
                                        value={sets}
                                        onChangeText={setSets}
                                        keyboardType="number-pad"
                                        placeholder="0"
                                        placeholderTextColor={colors.text.placeholder}
                                        style={[styles.inputField, { textAlign: "center" }]}
                                    />
                                </View>
                                <TouchableOpacity onPress={incrementSets} disabled={isSubmitting} style={styles.stepperBtn} activeOpacity={0.7}>
                                    <Plus size={20} color={colors.primary[600]} strokeWidth={2.5} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </AnimatedSlideIn>

                    {/* ===== Premium CTA Button ===== */}
                    <AnimatedSlideIn index={6} trigger={focusTrigger}>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting || isSaved}
                            activeOpacity={0.85}
                            style={{
                                opacity: isSubmitting ? 0.7 : 1, marginTop: 4,
                                shadowColor: isSaved ? colors.status.success : (colors.shadow?.colored || "rgba(5,150,105,0.3)"),
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.5,
                                shadowRadius: 12,
                                elevation: 4,
                            }}
                        >
                            {isSaved ? (
                                <View style={[styles.ctaButton, { backgroundColor: colors.status.success, flexDirection: "row", gap: 8 }]}>
                                    <CheckCircle2 size={20} color="#FFFFFF" />
                                    <Text style={styles.ctaButtonText}>
                                        {isEditMode ? "Set Saved" : "Exercise Logged"}
                                    </Text>
                                </View>
                            ) : (
                                <LinearGradient
                                    colors={isDarkMode
                                        ? [colors.primary[400], colors.primary[300]]
                                        : [colors.primary[500], colors.primary[600]]
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.ctaButton}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.ctaButtonText}>
                                            {isEditMode ? "Save Set" : "Log Exercise"}
                                        </Text>
                                    )}
                                </LinearGradient>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.back()}
                            disabled={isSubmitting}
                            style={[styles.cancelLink, { opacity: isSubmitting ? 0.5 : 1 }]}
                        >
                            <Text style={styles.cancelLinkText}>Cancel</Text>
                        </TouchableOpacity>
                    </AnimatedSlideIn>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Recent Exercise Detail Modal */}
            <Modal
                transparent
                visible={!!selectedChipName}
                animationType="slide"
                onRequestClose={handleModalClose}
            >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={handleModalClose}
                        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
                    >
                        <GestureDetector gesture={panGesture}>
                            <Animated.View style={[
                                {
                                    backgroundColor: colors.background.card,
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    padding: 20,
                                },
                                modalAnimatedStyle,
                            ]}>
                                {/* Drag Handle */}
                                <Animated.View style={[
                                    {
                                        width: 48,
                                        height: 4,
                                        borderRadius: 2,
                                        alignSelf: "center",
                                        marginTop: 2,
                                        marginBottom: 16,
                                    },
                                    dragHandleAnimatedStyle,
                                ]} />

                                {(() => {
                                    const chipSet = selectedChipName ? lastSetByExercise[selectedChipName] : null;
                                    const setDate = chipSet?.performed_at || chipSet?.created_at;
                                    const dateObj = setDate ? new Date(setDate) : null;
                                    const formattedDate = dateObj ? format(dateObj, 'MMM dd, yyyy') : null;
                                    const dateDifference = dateObj ? formatDistanceToNow(dateObj, { addSuffix: true }) : '';

                                    return (
                                        <>
                                            {/* Header */}
                                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                                                    <View style={{ backgroundColor: colors.primary[100], padding: 8, borderRadius: 20, marginRight: 12 }}>
                                                        <Dumbbell size={16} color={colors.primary[600]} />
                                                    </View>
                                                    <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary }} numberOfLines={1}>
                                                        {selectedChipName}
                                                    </Text>
                                                </View>
                                                <ModalCloseButton onPress={handleModalClose} size={18} />
                                            </View>

                                            {/* Set Details Pills */}
                                            {chipSet && (
                                                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.input, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                                                        <Dumbbell size={18} color={colors.text.tertiary} />
                                                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 6, fontWeight: '500' }}>{chipSet.weight} {chipSet.unit}</Text>
                                                    </View>
                                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.input, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                                                        <Repeat size={18} color={colors.text.tertiary} />
                                                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 6, fontWeight: '500' }}>{chipSet.reps} reps</Text>
                                                    </View>
                                                    <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.background.input, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border.light }}>
                                                        <Layers size={18} color={colors.text.tertiary} />
                                                        <Text style={{ color: colors.text.secondary, fontSize: 14, marginLeft: 6, fontWeight: '500' }}>{chipSet.sets} sets</Text>
                                                    </View>
                                                </View>
                                            )}

                                            {/* Date Info */}
                                            {dateObj && (
                                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: colors.background.input, borderRadius: 12, borderWidth: 1, borderColor: colors.border.light }}>
                                                    <Calendar size={16} color={colors.text.tertiary} />
                                                    <View style={{ marginLeft: 8, flex: 1 }}>
                                                        <Text style={{ color: colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                                                            {formattedDate}
                                                        </Text>
                                                        <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                                                            {dateDifference}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}

                                            {/* Edit Button */}
                                            <TouchableOpacity
                                                onPress={() => {
                                                    setIsEditMode(true);
                                                    handleQuickFillSelect(selectedChipName);
                                                    handleModalClose();
                                                }}
                                                style={{ overflow: "hidden", borderRadius: 14 }}
                                                activeOpacity={0.85}
                                            >
                                                <LinearGradient
                                                    colors={isDarkMode
                                                        ? [colors.primary[400], colors.primary[300]]
                                                        : [colors.primary[500], colors.primary[600]]
                                                    }
                                                    start={{ x: 0, y: 0 }}
                                                    end={{ x: 1, y: 1 }}
                                                    style={{
                                                        borderRadius: 14,
                                                        paddingVertical: 14,
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Edit</Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </>
                                    );
                                })()}
                            </Animated.View>
                        </GestureDetector>
                    </TouchableOpacity>
                </GestureHandlerRootView>
            </Modal>
        </View>
    );
}
