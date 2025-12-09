import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";

export default function LogSetModal({ visible, onClose, onSubmit, isSubmitting }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [exerciseName, setExerciseName] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("lb");
    const [sets, setSets] = useState("");
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    // Weight units only for logging sets
    const weightUnits = [
        { label: "lb", value: "lb" },
        { label: "kg", value: "kg" },
        { label: "oz", value: "oz" },
        { label: "g", value: "g" },
    ];

    useEffect(() => {
        if (!visible) {
            setExerciseName("");
            setWeight("");
            setReps("");
            setUnit("lb");
            setSets("");
            setShowUnitDropdown(false);
        }
    }, [visible]);

    const handleSubmit = () => {
        const name = exerciseName.trim();
        if (!name) {
            Alert.alert("Exercise required", "Please enter an exercise name.");
            return;
        }
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (isNaN(w) || w < 0) {
            Alert.alert("Invalid weight", "Please enter a valid weight.");
            return;
        }
        if (isNaN(r) || r <= 0 || r > 100) {
            Alert.alert("Invalid reps", "Reps must be between 1 and 100.");
            return;
        }
        const s = parseInt(sets, 10);
        if (isNaN(s) || s <= 0 || s > 30) {
            Alert.alert("Invalid sets", "Sets must be between 1 and 30.");
            return;
        }
        const u = (unit || "lb").trim(); // Default to "lb" if no unit is selected
        onSubmit({ exerciseName: name, weight: w, reps: r, sets: s, unit: u });
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
                    <View style={{ 
                        backgroundColor: colors.background.card || "white", 
                        borderTopLeftRadius: 24, 
                        borderTopRightRadius: 24,
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
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text.primary }}>Log Set</Text>
                                <ModalCloseButton onPress={onClose} disabled={isSubmitting} size={20} />
                            </View>

                            {/* Exercise Input */}
                            <View style={{ marginBottom: 20 }}>
                                <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Exercise</Text>
                                <TextInput
                                    editable={!isSubmitting}
                                    value={exerciseName}
                                    onChangeText={setExerciseName}
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
                                        editable={!isSubmitting}
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        placeholder="0"
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


