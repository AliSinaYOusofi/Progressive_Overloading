import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Modal } from "react-native";
import { ChevronDown, ArrowLeft } from "lucide-react-native";
import { useThemedColors } from "../hooks/useThemedColors";
import { useTheme } from "../contexts/ThemeContext";
import { useRouter } from "expo-router";
import { useAppStore } from "../stores/useAppStore";
import { getCurrentUser } from "../lib/database";
import exerciseNames from "../exercise_names.json";
import { useExerciseMuscleGroups } from "../hooks/useExerciseMuscleGroups";

export default function LogSetScreen() {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const router = useRouter();
    const { user, addExerciseSet, refreshRecentSets, refreshProgress } = useAppStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [exerciseName, setExerciseName] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("lb");
    const [sets, setSets] = useState("");
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [defaults, setDefaults] = useState(null);
    const prevIsSubmittingRef = useRef(false);

    // Get muscle groups for suggestions
    const getMuscleGroup = useExerciseMuscleGroups(suggestions);

    // Weight units only for logging sets
    const weightUnits = [
        { label: "lb", value: "lb" },
        { label: "kg", value: "kg" },
        { label: "oz", value: "oz" },
        { label: "g", value: "g" },
    ];

    // Fetch defaults on mount
    useEffect(() => {
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

    // Handle success/error messages and reset form after successful submission
    useEffect(() => {
        const wasSubmitting = prevIsSubmittingRef.current;
        prevIsSubmittingRef.current = isSubmitting;
        
        // Only process if we just finished submitting (went from true to false)
        if (wasSubmitting && !isSubmitting) {
            if (!errorMessage) {
                // Success - show success message and reset form
                setSuccessMessage("Exercise logged!");
                
                // Reset form to defaults for next exercise
                const resetForm = () => {
                    setExerciseName("");
                    setWeight("");
                    setReps("");
                    setSets("");
                    setShowSuggestions(false);
                    setSuggestions([]);
                    setErrorMessage("");
                    
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
                
                // Clear success message after 3 seconds
                const successTimeout = setTimeout(() => {
                    setSuccessMessage("");
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background.primary,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: Platform.OS === "ios" ? 60 : 40,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
            backgroundColor: colors.background.card,
            shadowColor: colors.shadow?.dark || "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        backButton: {
            padding: 8,
            marginRight: 12,
        },
        title: {
            fontSize: 24,
            fontWeight: "700",
            color: colors.text.primary,
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 14,
            color: colors.text.secondary,
            fontWeight: "400",
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: 'center',
            paddingTop: 0,
            paddingBottom: 24,
            paddingHorizontal: 24,
        },
    });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Log Exercise</Text>
                    <Text style={styles.subtitle}>Track your workout progress</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Description Section */}
                    <View style={{ marginTop: 0, marginBottom: 32, alignItems: 'center' }}>
                        <Text style={{ 
                            fontSize: 28, 
                            fontWeight: '700',
                            color: colors.text.primary, 
                            textAlign: 'center',
                            marginBottom: 12,
                        }}>
                            Log Exercise
                        </Text>
                        <Text style={{ 
                            fontSize: 16, 
                            color: colors.text.secondary, 
                            textAlign: 'center',
                            lineHeight: 22,
                        }}>
                            Record your exercise sets and track your strength progress over time
                        </Text>
                    </View>

                    {/* Success Message */}
                    {successMessage ? (
                        <View style={{ 
                            marginBottom: 16,
                            backgroundColor: colors.status.success + '20',
                            padding: 12,
                            borderRadius: 8,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.status.success,
                        }}>
                            <Text style={{ 
                                color: colors.status.success, 
                                fontSize: 14, 
                                fontWeight: "600",
                            }}>
                                {successMessage}
                            </Text>
                        </View>
                    ) : null}

                    {/* Error Message */}
                    {errorMessage ? (
                        <View style={{ 
                            marginBottom: 16,
                            backgroundColor: colors.status.error + '20',
                            padding: 12,
                            borderRadius: 8,
                            borderLeftWidth: 4,
                            borderLeftColor: colors.status.error,
                        }}>
                            <Text style={{ 
                                color: colors.status.error, 
                                fontSize: 14, 
                                fontWeight: "600",
                            }}>
                                {errorMessage}
                            </Text>
                        </View>
                    ) : null}

                    {/* Exercise Input */}
                    <View style={{ marginBottom: 20, position: "relative", zIndex: 1 }}>
                        <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Exercise</Text>
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
                            placeholderTextColor={colors.text.tertiary}
                            style={{ 
                                borderWidth: 1, 
                                borderColor: showSuggestions ? (isDarkMode ? colors.primary[400] : colors.primary[500]) : "#E5E7EB", 
                                borderRadius: 12, 
                                paddingHorizontal: 16, 
                                paddingVertical: 14,
                                fontSize: 16,
                                color: colors.text.primary,
                                backgroundColor: colors.background.card || "white",
                                shadowColor: colors.shadow?.light || "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.05,
                                shadowRadius: 2,
                                elevation: 1,
                            }}
                        />
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <View style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                right: 0,
                                marginTop: 4,
                                backgroundColor: colors.background.card || "white",
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: isDarkMode ? colors.border.medium : "#E5E7EB",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                                elevation: 8,
                                maxHeight: 200,
                                zIndex: 1000,
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

                    {/* Weight, Reps, Sets, Unit Row */}
                    <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Weight</Text>
                            <TextInput
                                editable={!isSubmitting}
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                placeholder={isBodyweightExercise(exerciseName) ? "0 (bodyweight)" : "0"}
                                placeholderTextColor={colors.text.tertiary}
                                style={{ 
                                    borderWidth: 1, 
                                    borderColor: "#E5E7EB", 
                                    borderRadius: 12, 
                                    paddingHorizontal: 16, 
                                    paddingVertical: 14,
                                    fontSize: 16,
                                    color: colors.text.primary,
                                    backgroundColor: colors.background.card || "white",
                                    shadowColor: colors.shadow?.light || "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1,
                                }}
                            />
                        </View>
                        <View style={{ width: 80 }}>
                            <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Reps</Text>
                            <TextInput
                                editable={!isSubmitting}
                                value={reps}
                                onChangeText={setReps}
                                keyboardType="number-pad"
                                placeholder="0"
                                placeholderTextColor={colors.text.tertiary}
                                style={{ 
                                    borderWidth: 1, 
                                    borderColor: "#E5E7EB", 
                                    borderRadius: 12, 
                                    paddingHorizontal: 12, 
                                    paddingVertical: 14,
                                    fontSize: 16,
                                    color: colors.text.primary,
                                    backgroundColor: colors.background.card || "white",
                                    shadowColor: colors.shadow?.light || "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1,
                                    textAlign: "center",
                                }}
                            />
                        </View>
                        <View style={{ width: 80 }}>
                            <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Sets</Text>
                            <TextInput
                                editable={!isSubmitting}
                                value={sets}
                                onChangeText={setSets}
                                keyboardType="number-pad"
                                placeholder="0"
                                placeholderTextColor={colors.text.tertiary}
                                style={{ 
                                    borderWidth: 1, 
                                    borderColor: "#E5E7EB", 
                                    borderRadius: 12, 
                                    paddingHorizontal: 12, 
                                    paddingVertical: 14,
                                    fontSize: 16,
                                    color: colors.text.primary,
                                    backgroundColor: colors.background.card || "white",
                                    shadowColor: colors.shadow?.light || "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1,
                                    textAlign: "center",
                                }}
                            />
                        </View>
                        <View style={{ width: 90 }}>
                            <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Unit</Text>
                            <TouchableOpacity
                                onPress={() => !isSubmitting && setShowUnitDropdown(true)}
                                disabled={isSubmitting}
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 14,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    opacity: isSubmitting ? 0.6 : 1,
                                    minHeight: 48,
                                    backgroundColor: colors.background.card || "white",
                                    shadowColor: colors.shadow?.light || "#000",
                                    shadowOffset: { width: 0, height: 1 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 2,
                                    elevation: 1,
                                }}
                            >
                                <Text style={{ color: unit ? colors.text.primary : colors.text.tertiary, flex: 1, fontSize: 16, fontWeight: unit ? "500" : "400" }}>
                                    {unit || "Select"}
                                </Text>
                                <ChevronDown size={18} color={colors.text.tertiary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        style={{ 
                            backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600], 
                            borderRadius: 12, 
                            paddingVertical: 16, 
                            alignItems: "center", 
                            marginTop: 8,
                            shadowColor: colors.shadow?.colored || (isDarkMode ? colors.primary[200] : colors.primary[600]),
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 4,
                            opacity: isSubmitting ? 0.7 : 1,
                        }}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : (
                            <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Save Set</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Unit Dropdown Modal */}
            <Modal
                transparent
                visible={showUnitDropdown}
                animationType="fade"
                onRequestClose={() => setShowUnitDropdown(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setShowUnitDropdown(false)}
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
                >
                    <View style={{ 
                        backgroundColor: colors.background.card || "white", 
                        borderRadius: 20, 
                        width: "100%", 
                        maxWidth: 384,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25,
                        shadowRadius: 12,
                        elevation: 8,
                    }}>
                        <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
                            <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: "700" }}>Select Unit</Text>
                        </View>
                        <ScrollView style={{ maxHeight: 256 }} showsVerticalScrollIndicator={false}>
                            {weightUnits.map((unitOption, index) => (
                                <TouchableOpacity
                                    key={unitOption.value}
                                    onPress={() => {
                                        setUnit(unitOption.value);
                                        setShowUnitDropdown(false);
                                    }}
                                    style={{
                                        paddingHorizontal: 20,
                                        paddingVertical: 16,
                                        borderBottomWidth: index < weightUnits.length - 1 ? 1 : 0,
                                        borderBottomColor: isDarkMode ? colors.border.medium : "#F3F4F6",
                                        backgroundColor: unit === unitOption.value ? (isDarkMode ? colors.primary[100] : colors.primary[50]) : "transparent",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            color: unit === unitOption.value ? colors.primary[600] : colors.text.primary,
                                            fontWeight: unit === unitOption.value ? "600" : "400",
                                        }}
                                    >
                                        {unitOption.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

