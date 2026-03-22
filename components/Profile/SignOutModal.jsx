import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Modal, TouchableOpacity, Dimensions, ActivityIndicator } from "react-native";
import { LogOut, AlertCircle } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { LinearGradient } from "expo-linear-gradient";
import { MODAL_LAYOUT } from "../../constants/modal";
import { signOut } from "../../lib/auth";

export default function SignOutModal({ visible, onClose }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2;
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [error, setError] = useState(null);

    const handleClose = useCallback(() => {
        if (isSigningOut) return;
        onClose();
    }, [onClose, isSigningOut]);

    const handleSignOut = async () => {
        setError(null);
        setIsSigningOut(true);
        try {
            await signOut();
            // Auth state listener handles redirect
        } catch (err) {
            console.log("Sign out error:", err);
            setError("Failed to sign out. Please try again.");
            setIsSigningOut(false);
        }
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (isSigningOut) return;
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (isSigningOut) return;
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
            setIsSigningOut(false);
        }
    }, [visible, translateY]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                    <TouchableOpacity activeOpacity={1} onPress={handleClose} disabled={isSigningOut} style={{ flex: 1 }} />
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
                                            <LogOut size={22} color={colors.status.error} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                                                Sign Out
                                            </Text>
                                            <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }}>
                                                You'll need to sign in again
                                            </Text>
                                        </View>
                                    </View>
                                    <ModalCloseButton onPress={handleClose} disabled={isSigningOut} />
                                </View>

                                {/* Description */}
                                <View style={{
                                    backgroundColor: colors.background.primary,
                                    borderRadius: 14,
                                    padding: 16,
                                    marginBottom: 24,
                                    borderWidth: 1,
                                    borderColor: colors.border.light,
                                }}>
                                    <Text style={{
                                        fontSize: 15,
                                        color: colors.text.secondary,
                                        lineHeight: 22,
                                    }}>
                                        Are you sure you want to sign out? Your data is safely stored and will be available when you sign back in.
                                    </Text>
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

                                {/* Sign Out Button */}
                                <TouchableOpacity
                                    onPress={handleSignOut}
                                    disabled={isSigningOut}
                                    activeOpacity={0.85}
                                    style={{
                                        opacity: isSigningOut ? 0.7 : 1,
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
                                        {isSigningOut ? (
                                            <>
                                                <ActivityIndicator color="#fff" size="small" />
                                                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                                                    Signing Out...
                                                </Text>
                                            </>
                                        ) : (
                                            <>
                                                <LogOut size={18} color="#fff" />
                                                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
                                                    Sign Out
                                                </Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                {/* Cancel Button */}
                                <TouchableOpacity
                                    onPress={handleClose}
                                    disabled={isSigningOut}
                                    activeOpacity={0.7}
                                    style={{
                                        paddingVertical: 14,
                                        alignItems: "center",
                                        borderRadius: 14,
                                        backgroundColor: colors.background.primary,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                        opacity: isSigningOut ? 0.5 : 1,
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
