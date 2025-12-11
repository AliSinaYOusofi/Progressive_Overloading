import React, { useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Info, Package, Calendar, Code, Smartphone, CheckCircle2 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function AppVersionModal({ visible, onClose }) {
    const colors = useThemedColors();
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

    // Reset translateY when modal becomes visible
    useEffect(() => {
        if (visible) {
            translateY.value = 0;
        }
    }, [visible, translateY]);
    const appInfo = [
        {
            icon: Package,
            title: "Version",
            value: "1.0.0",
            description: "Current app version",
        },
        {
            icon: Calendar,
            title: "Build Date",
            value: "January 15, 2024",
            description: "Latest release date",
        },
        {
            icon: Code,
            title: "Build Number",
            value: "2024.01.15",
            description: "Internal build identifier",
        },
        {
            icon: Smartphone,
            title: "Platform",
            value: "iOS & Android",
            description: "Available on both platforms",
        },
    ];

    const features = [
        "Progressive overload tracking",
        "Advanced analytics and insights",
        "Goal setting and monitoring",
        "Streak tracking system",
        "Exercise progression charts",
        "Volume analysis",
        "RPE (Rate of Perceived Exertion) tracking",
        "Monthly trends visualization",
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
                    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
                    <GestureDetector gesture={panGesture}>
                        <Animated.View style={[
                            { 
                                backgroundColor: colors.background.card, 
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
                        contentContainerStyle={{ paddingBottom: 40 }}
                    >
                        <View style={{ padding: 24 }}>
                            {/* Close Button */}
                            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 12 }}>
                                <ModalCloseButton onPress={onClose} />
                            </View>
                            
                            {/* Header */}
                            <View style={{ alignItems: "center", marginBottom: 24 }}>
                                <View style={{ 
                                    width: 80, 
                                    height: 80, 
                                    borderRadius: 20, 
                                    backgroundColor: colors.primary[50],
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 16,
                                    borderWidth: 3,
                                    borderColor: colors.primary[200],
                                }}>
                                    <Info size={40} color={colors.primary[600]} />
                                </View>
                                <Text style={{ 
                                    fontSize: 28, 
                                    fontWeight: "bold", 
                                    color: colors.text.primary,
                                    marginBottom: 6,
                                }}>
                                    Progressive Overloading
                                </Text>
                                <Text style={{ 
                                    fontSize: 16, 
                                    color: colors.text.secondary,
                                    textAlign: "center",
                                    lineHeight: 22,
                                }}>
                                    Track your strength journey
                                </Text>
                            </View>

                            {/* App Info Cards */}
                            <View style={{ gap: 10, marginBottom: 24 }}>
                                {appInfo.map((item, index) => (
                                    <View 
                                        key={index}
                                        style={{
                                            backgroundColor: colors.background.primary,
                                            borderRadius: 14,
                                            padding: 14,
                                            flexDirection: "row",
                                            alignItems: "center",
                                            borderWidth: 1,
                                            borderColor: colors.border.light,
                                        }}
                                    >
                                        <View style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 21,
                                            backgroundColor: colors.primary[50],
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginRight: 12,
                                        }}>
                                            <item.icon size={20} color={colors.primary[600]} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{
                                                fontSize: 14,
                                                color: colors.text.tertiary,
                                                marginBottom: 2,
                                            }}>
                                                {item.title}
                                            </Text>
                                            <Text style={{
                                                fontSize: 16,
                                                fontWeight: "600",
                                                color: colors.text.primary,
                                            }}>
                                                {item.value}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Features Section */}
                            <View style={{
                                backgroundColor: colors.background.primary,
                                borderRadius: 16,
                                padding: 16,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                                marginBottom: 16,
                            }}>
                                <Text style={{
                                    fontSize: 18,
                                    fontWeight: "600",
                                    color: colors.text.primary,
                                    marginBottom: 12,
                                }}>
                                    Features
                                </Text>
                                <View style={{ gap: 10 }}>
                                    {features.map((feature, index) => (
                                        <View 
                                            key={index}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                            }}
                                        >
                                            <View style={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 10,
                                                backgroundColor: colors.status.successLight,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginRight: 10,
                                            }}>
                                                <CheckCircle2 size={12} color={colors.status.success} />
                                            </View>
                                            <Text style={{
                                                fontSize: 15,
                                                color: colors.text.secondary,
                                                flex: 1,
                                            }}>
                                                {feature}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Footer */}
                            <View style={{
                                padding: 16,
                                backgroundColor: colors.primary[50],
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.primary[200],
                            }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: colors.text.primary,
                                    textAlign: "center",
                                    marginBottom: 6,
                                }}>
                                    Made with 💪 for Fitness Enthusiasts
                                </Text>
                                <Text style={{
                                    fontSize: 13,
                                    color: colors.text.secondary,
                                    textAlign: "center",
                                    lineHeight: 20,
                                }}>
                                    Thank you for choosing Progressive Overloading to track your fitness journey!
                                </Text>
                            </View>

                            {/* Copyright */}
                            <Text style={{
                                fontSize: 12,
                                color: colors.text.tertiary,
                                textAlign: "center",
                                marginTop: 16,
                            }}>
                                © 2024 Progressive Overloading. All rights reserved.
                            </Text>
                        </View>
                    </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

