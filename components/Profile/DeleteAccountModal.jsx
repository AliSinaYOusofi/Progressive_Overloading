import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Modal, TouchableOpacity, Dimensions, ActivityIndicator, TextInput } from "react-native";
import { AlertTriangle, AlertCircle, Trash2 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { LinearGradient } from "expo-linear-gradient";
import { MODAL_LAYOUT } from "../../constants/modal";
import { deleteUserAccount } from "../../lib/database";
import { signOut, getUser } from "../../lib/auth";

const CONFIRM_TEXT = "DELETE";

export default function DeleteAccountModal({ visible, onClose }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2;
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [confirmInput, setConfirmInput] = useState("");

    const isConfirmed = confirmInput.trim().toUpperCase() === CONFIRM_TEXT;
    const isBusy = isDeleting;

    const handleClose = useCallback(() => {
        if (isBusy) return;
        onClose();
    }, [onClose, isBusy]);

    const handleDelete = async () => {
        if (!isConfirmed || isBusy) return;
        setError(null);
        setIsDeleting(true);
        try {
            const user = await getUser();
            if (!user) {
                setError("Could not verify your identity. Please try again.");
                setIsDeleting(false);
                return;
            }
            await deleteUserAccount(user.id);
            await signOut();
            // Auth state listener handles redirect
        } catch (err) {
            console.log("Delete account error:", err);
            setError("Failed to delete account. Please try again.");
            setIsDeleting(false);
        }
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (isBusy) return;
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (isBusy) return;
            if (event.translationY > SWIPE_THRESHOLD) {
                translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
                    'worklet';
                    scheduleOnRN(handleClose);
                });
            } else {
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const dragHandleAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            translateY.value,
            [0, 50, 100],
            [colors.border.light, colors.text.tertiary, colors.text.secondary]
        );
        return { backgroundColor };
    });

    useEffect(() => {
        if (visible) {
            translateY.value = 0;
            setError(null);
            setIsDeleting(false);
            setConfirmInput("");
        }
    }, [visible, translateY]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                    <TouchableOpacity activeOpacity={1} onPress={handleClose} disabled={isBusy} style={{ flex: 1 }} />
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[
                            {
                                backgroundColor: colors.background.card,
                                borderRadius: MODAL_LAYOUT.borderRadius,
                                overflow: 'hidden',
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: -2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 10,
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
                                    marginBottom: 16,
                                },
                                dragHandleAnimatedStyle
                            ]} />

                            <View style={{ paddingHorizontal: 24, paddingBottom: 32 }}>
                                {/* Header */}
                                <View style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 24,
                                }}>
                                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
                                        <View style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: colors.status.error + "15",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 12,
                                        }}>
                                            <AlertTriangle size={22} color={colors.status.error} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                                                Delete Account
                                            </Text>
                                            <Text style={{ fontSize: 14, color: colors.status.error, marginTop: 2, fontWeight: "500" }}>
                                                This action cannot be undone
                                            </Text>
                                        </View>
                                    </View>
                                    <ModalCloseButton onPress={handleClose} disabled={isBusy} />
                                </View>

                                {/* Warning Description */}
                                <View style={{
                                    backgroundColor: colors.status.error + "10",
                                    borderRadius: 14,
                                    padding: 16,
                                    marginBottom: 20,
                                    borderWidth: 1,
                                    borderColor: colors.status.error + "20",
                                }}>
                                    <Text style={{
                                        fontSize: 15,
                                        color: colors.text.secondary,
                                        lineHeight: 22,
                                    }}>
                                        Deleting your account will permanently remove all your workout data, goals, progress, and personal records. This action cannot be undone.
                                    </Text>
                                </View>

                                {/* Confirmation Input */}
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: "600",
                                        color: colors.text.secondary,
                                        marginBottom: 10,
                                    }}>
                                        Type <Text style={{ fontWeight: "800", color: colors.status.error }}>{CONFIRM_TEXT}</Text> to confirm
                                    </Text>
                                    <TextInput
                                        value={confirmInput}
                                        onChangeText={setConfirmInput}
                                        editable={!isBusy}
                                        placeholder={CONFIRM_TEXT}
                                        placeholderTextColor={colors.text.placeholder}
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                        style={{
                                            backgroundColor: colors.background.input,
                                            borderWidth: 1.5,
                                            borderColor: isConfirmed ? colors.status.error + "60" : colors.border.light,
                                            borderRadius: 12,
                                            paddingHorizontal: 16,
                                            paddingVertical: 14,
                                            fontSize: 16,
                                            fontWeight: "600",
                                            color: colors.text.primary,
                                            textAlign: "center",
                                            letterSpacing: 2,
                                        }}
                                    />
                                </View>

                                {/* Error Message */}
                                {error && (
                                    <View style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: colors.status.error + "15",
                                        borderRadius: 12,
                                        padding: 14,
                                        marginBottom: 20,
                                        borderWidth: 1,
                                        borderColor: colors.status.error + "30",
                                    }}>
                                        <AlertCircle size={18} color={colors.status.error} style={{ marginRight: 10 }} />
                                        <Text style={{ fontSize: 14, color: colors.status.error, fontWeight: "600", flex: 1 }}>
                                            {error}
                                        </Text>
                                    </View>
                                )}

                                {/* Delete Button */}
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    disabled={!isConfirmed || isBusy}
                                    activeOpacity={0.85}
                                    style={{
                                        opacity: !isConfirmed || isBusy ? 0.5 : 1,
                                        marginBottom: 12,
                                    }}
                                >
                                    <LinearGradient
                                        colors={["#EF4444", "#DC2626"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            borderRadius: 14,
                                            paddingVertical: 16,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexDirection: "row",
                                            gap: 8,
                                        }}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <ActivityIndicator color="#fff" size="small" />
                                                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                                                    Deleting Account...
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 size={18} color="#fff" />
                                                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                                                    Delete Account
                                                </Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    onPress={handleClose}
                                    disabled={isBusy}
                                    activeOpacity={0.7}
                                    style={{
                                        paddingVertical: 14,
                                        alignItems: "center",
                                        borderRadius: 14,
                                        backgroundColor: colors.background.primary,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                        opacity: isBusy ? 0.5 : 1,
                                    }}
                                >
                                    <Text style={{ color: colors.text.secondary, fontWeight: "600", fontSize: 15 }}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}
