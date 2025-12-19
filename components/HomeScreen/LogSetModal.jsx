import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import exerciseNames from "../../exercise_names.json";

export default function LogSetModal({ visible, onClose, onSubmit, isSubmitting, defaults }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

    // Define close function in RN Runtime scope (required for scheduleOnRN)
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow downward swipes (positive translationY)
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > SWIPE_THRESHOLD) {
                // Swipe exceeded threshold, animate out then close modal
                translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
                    'worklet';
                    scheduleOnRN(handleClose);
                });
            } else {
                // Snap back to original position
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    // Animated style for drag handle that changes color when swiping
    const dragHandleAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            translateY.value,
            [0, 50, 100],
            [colors.border.light, colors.primary[400], colors.primary[600]]
        );
        return {
            backgroundColor,
        };
    });

    const [exerciseName, setExerciseName] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("lb");
    const [sets, setSets] = useState("");
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Weight units only for logging sets
    const weightUnits = [
        { label: "lb", value: "lb" },
        { label: "kg", value: "kg" },
        { label: "oz", value: "oz" },
        { label: "g", value: "g" },
    ];

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

    useEffect(() => {
        if (!visible) {
            setExerciseName("");
            setWeight("");
            setReps("");
            setUnit("lb");
            setSets("");
            setShowUnitDropdown(false);
            setSuggestions([]);
            setShowSuggestions(false);
            setErrorMessage("");
        }
    }, [visible]);

    // Apply defaults when modal becomes visible
    useEffect(() => {
        if (visible && defaults) {
            // Apply defaults when modal opens (only if fields are empty or just reset)
            if (defaults.default_sets) {
                setSets(String(defaults.default_sets));
            }
            if (defaults.default_reps) {
                setReps(String(defaults.default_reps));
            }
            if (defaults.default_weight_unit) {
                setUnit(defaults.default_weight_unit);
            } else {
                setUnit("lb");
            }
        } else if (visible && !defaults) {
            // Reset to defaults if no defaults are set
            setUnit("lb");
        }
    }, [visible, defaults]);

    // Reset translateY when modal becomes visible
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
        }
    }, [visible, translateY]);

    const handleSubmit = () => {
        setErrorMessage(""); // Clear any previous errors
        
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
        onSubmit({ exerciseName: name, weight: w, reps: r, sets: s, unit: u });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                        <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
                        <GestureDetector gesture={panGesture}>
                            <Animated.View style={[
                                { 
                                    backgroundColor: colors.background.card || "white", 
                                    borderTopLeftRadius: 24, 
                                    borderTopRightRadius: 24,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: -2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 10,
                                    maxHeight: "80%",
                                },
                                animatedStyle
                            ]}>
                                {/* Drag Handle */}
                                <Animated.View style={[
                                    { 
                                        width: 48, 
                                        height: 4, 
                                        borderRadius: 2, 
                                        alignSelf: "center", 
                                        marginTop: 12, 
                                        marginBottom: 16 
                                    },
                                    dragHandleAnimatedStyle
                                ]} />
                        <ScrollView 
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ 
                                paddingTop: 20,
                                paddingHorizontal: 24,
                                paddingBottom: 32,
                            }}
                        >
                            {/* Header */}
                            <View style={{ marginBottom: 24 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: errorMessage ? 8 : 0 }}>
                                    <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text.primary }}>Log Set</Text>
                                    <ModalCloseButton onPress={onClose} disabled={isSubmitting} size={20} />
                                </View>
                                {errorMessage ? (
                                    <Text style={{ 
                                        color: colors.status.error, 
                                        fontSize: 14, 
                                        fontWeight: "500",
                                        marginTop: 4,
                                    }}>
                                        {errorMessage}
                                    </Text>
                                ) : null}
                            </View>

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
                                            {suggestions.map((suggestion, index) => (
                                                <TouchableOpacity
                                                    key={suggestion}
                                                    onPress={() => handleSuggestionSelect(suggestion)}
                                                    style={{
                                                        paddingHorizontal: 16,
                                                        paddingVertical: 12,
                                                        borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                                                        borderBottomColor: isDarkMode ? colors.border.medium : "#F3F4F6",
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={{
                                                        fontSize: 16,
                                                        color: colors.text.primary,
                                                        fontWeight: "400",
                                                    }}>
                                                        {suggestion}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
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
                            </Animated.View>
                        </GestureDetector>
                    </View>
                </KeyboardAvoidingView>
            </GestureHandlerRootView>

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
        </Modal>
    );
}


