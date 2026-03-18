import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { getCurrentUser, updateProfile } from "../../lib/database";
import { MODAL_LAYOUT } from "../../constants/modal";

export default function SetDefaultsModal({ visible, onClose, currentDefaults }) {
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

    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [unit, setUnit] = useState("lb");
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Weight units
    const weightUnits = [
        { label: "lb", value: "lb" },
        { label: "kg", value: "kg" },
        { label: "oz", value: "oz" },
        { label: "g", value: "g" },
    ];

    // Load defaults when modal opens or when currentDefaults changes
    useEffect(() => {
        if (visible && currentDefaults) {
            setSets(currentDefaults.default_sets ? String(currentDefaults.default_sets) : "");
            setReps(currentDefaults.default_reps ? String(currentDefaults.default_reps) : "");
            setUnit(currentDefaults.default_weight_unit || "lb");
        }
    }, [visible, currentDefaults]);

    // Reset form when modal closes
    useEffect(() => {
        if (!visible) {
            setSets("");
            setReps("");
            setUnit("lb");
            setShowUnitDropdown(false);
        }
    }, [visible]);

    // Reset translateY when modal becomes visible
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
        }
    }, [visible, translateY]);

    const handleSave = async () => {
        // Validate inputs
        const s = sets.trim() ? parseInt(sets, 10) : null;
        const r = reps.trim() ? parseInt(reps, 10) : null;

        if (s !== null && (isNaN(s) || s <= 0 || s > 30)) {
            Alert.alert("Invalid sets", "Sets must be between 1 and 30.");
            return;
        }

        if (r !== null && (isNaN(r) || r <= 0 || r > 100)) {
            Alert.alert("Invalid reps", "Reps must be between 1 and 100.");
            return;
        }

        const u = (unit || "lb").trim();

        try {
            setIsSaving(true);
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                Alert.alert("Error", "User not found. Please try again.");
                return;
            }

            // Update profile with defaults
            await updateProfile(currentUser.id, {
                default_sets: s,
                default_reps: r,
                default_weight_unit: u,
            });

            Alert.alert("Success", "Workout defaults saved successfully!", [
                { text: "OK", onPress: onClose }
            ]);
        } catch (error) {
            console.error("Error saving defaults:", error);
            Alert.alert("Error", "Failed to save defaults. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }} 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                        <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
                        <GestureDetector gesture={panGesture}>
                            <Animated.View style={[
                                {
                                    backgroundColor: colors.background.card || "white",
                                    borderRadius: MODAL_LAYOUT.borderRadius,
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
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                                <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text.primary }}>Workout Defaults</Text>
                                <ModalCloseButton onPress={onClose} disabled={isSaving} size={20} />
                            </View>

                            <Text style={{ fontSize: 14, color: colors.text.secondary, marginBottom: 24, lineHeight: 20 }}>
                                Set your default values for sets, reps, and weight unit. These will be pre-filled when logging new sets.
                            </Text>

                            {/* Sets, Reps, Unit Row */}
                            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Sets</Text>
                                    <TextInput
                                        editable={!isSaving}
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
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Reps</Text>
                                    <TextInput
                                        editable={!isSaving}
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
                                <View style={{ width: 90 }}>
                                    <Text style={{ color: colors.text.secondary, marginBottom: 8, fontSize: 14, fontWeight: "500" }}>Unit</Text>
                                    <TouchableOpacity
                                        onPress={() => !isSaving && setShowUnitDropdown(true)}
                                        disabled={isSaving}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: "#E5E7EB",
                                            borderRadius: 12,
                                            paddingHorizontal: 12,
                                            paddingVertical: 14,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            opacity: isSaving ? 0.6 : 1,
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

                            {/* Save Button */}
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={isSaving}
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
                                    opacity: isSaving ? 0.7 : 1,
                                }}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Save Defaults</Text>
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

