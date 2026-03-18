import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Trash2, ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";
import { MODAL_LAYOUT } from "../../constants/modal";

export default function EditSetModal({ visible, onClose, onSubmit, onDelete, isSubmitting, isDeleting, initialValues }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [exerciseName, setExerciseName] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("lb");
    const [sets, setSets] = useState("");
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    // Weight units only for editing sets
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

    useEffect(() => {
        if (visible && initialValues) {
            setExerciseName(initialValues.exerciseName || "");
            setWeight(String(initialValues.weight ?? ""));
            setReps(String(initialValues.reps ?? ""));
            setUnit(initialValues.unit || "lb");
            setSets(String(initialValues.sets ?? ""));
            setIsInitialLoad(true);
        } else if (!visible) {
            setIsInitialLoad(false);
        }
    }, [visible, initialValues]);

    // Handle exercise name change to auto-suggest weight for bodyweight exercises
    // Only auto-set when user manually changes the exercise name (not on initial load)
    const handleExerciseNameChange = useCallback((text) => {
        setExerciseName(text);
        // Auto-suggest weight = 0 for bodyweight exercises if weight is empty
        // Only do this after initial load to preserve existing values when editing
        if (!isInitialLoad && isBodyweightExercise(text)) {
            setWeight((currentWeight) => {
                // Only auto-set if weight is empty
                if (!currentWeight || currentWeight.trim() === "") {
                    return "0";
                }
                return currentWeight;
            });
        }
    }, [isBodyweightExercise, isInitialLoad]);

    // Mark initial load as complete after modal opens
    useEffect(() => {
        if (visible && isInitialLoad) {
            // Use setTimeout to mark initial load complete after state is set
            const timer = setTimeout(() => {
                setIsInitialLoad(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [visible, isInitialLoad]);

    useEffect(() => {
        if (!visible) {
            setShowUnitDropdown(false);
            setErrorMessage("");
        }
    }, [visible]);

    const handleSave = () => {
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
        const u = (unit || "lb").trim();
        onSubmit({ exerciseName: name, weight: w, reps: r, sets: s, unit: u });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
                    <View style={{
                        backgroundColor: colors.background.card || "white",
                        borderRadius: MODAL_LAYOUT.borderRadius,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 10,
                        maxHeight: "80%",
                    }}>
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
                                    <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text.primary }}>Edit Set</Text>
                                    <ModalCloseButton onPress={onClose} disabled={isSubmitting || isDeleting} size={20} />
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
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Exercise</Text>
                                <TextInput
                                    editable={!isSubmitting && !isDeleting}
                                    value={exerciseName}
                                    onChangeText={handleExerciseNameChange}
                                    placeholder="e.g., Bench Press"
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

                            {/* Weight, Reps, Sets, Unit Row */}
                            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Weight</Text>
                                    <TextInput
                                        editable={!isSubmitting && !isDeleting}
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
                                        editable={!isSubmitting && !isDeleting}
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
                                        editable={!isSubmitting && !isDeleting}
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
                                        onPress={() => !isSubmitting && !isDeleting && setShowUnitDropdown(true)}
                                        disabled={isSubmitting || isDeleting}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: "#E5E7EB",
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                            paddingVertical: 14,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            opacity: (isSubmitting || isDeleting) ? 0.6 : 1,
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

                            {/* Action Buttons */}
                            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                                <TouchableOpacity
                                    onPress={onDelete}
                                    disabled={isDeleting || isSubmitting}
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        paddingVertical: 16,
                                        paddingHorizontal: 16,
                                        borderRadius: 12,
                                        backgroundColor: colors.background.card || "#F9FAFB",
                                        borderWidth: 1,
                                        borderColor: "#E5E7EB",
                                        opacity: (isDeleting || isSubmitting) ? 0.6 : 1,
                                    }}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator color={colors.status.error} size="small" />
                                    ) : (
                                        <>
                                            <Trash2 size={18} color={colors.status.error} />
                                            <Text style={{ marginLeft: 8, color: colors.status.error, fontWeight: "600", fontSize: 16 }}>Delete</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    disabled={isSubmitting || isDeleting}
                                    style={{ 
                                        flex: 1,
                                        backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600], 
                                        borderRadius: 12, 
                                        paddingVertical: 16, 
                                        alignItems: "center", 
                                        shadowColor: colors.shadow?.colored || (isDarkMode ? colors.primary[200] : colors.primary[600]),
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 4,
                                        opacity: (isSubmitting || isDeleting) ? 0.7 : 1,
                                    }}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
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
                                        borderBottomColor: "#F3F4F6",
                                        backgroundColor: unit === unitOption.value ? "#F0F9FF" : "transparent",
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


