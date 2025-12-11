import React, { useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Share2, X, Check, Info } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function DataSharingModal({ visible, onClose }) {
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
    const sharingCategories = [
        {
            title: "Analytics Data",
            description: "Anonymous usage data to improve app performance",
            shared: false,
            details: "We do not collect analytics data to ensure your complete privacy.",
        },
        {
            title: "Crash Reports",
            description: "Technical data to fix bugs and improve stability",
            shared: false,
            details: "Crash reports are kept private and only used internally for debugging.",
        },
        {
            title: "Personal Information",
            description: "Name, email, profile data",
            shared: false,
            details: "Your personal information is never shared with third parties under any circumstances.",
        },
        {
            title: "Workout Data",
            description: "Exercise logs, progress, and statistics",
            shared: false,
            details: "Your workout data remains completely private and encrypted on our secure servers.",
        },
        {
            title: "Marketing Communications",
            description: "Product updates and feature announcements",
            shared: false,
            details: "We respect your inbox. No spam, no marketing emails, no promotions.",
        },
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
                                    width: 64, 
                                    height: 64, 
                                    borderRadius: 32, 
                                    backgroundColor: colors.primary[50],
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginBottom: 16,
                                    borderWidth: 2,
                                    borderColor: colors.primary[200],
                                }}>
                                    <Share2 size={32} color={colors.primary[600]} />
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "bold", 
                                    color: colors.text.primary,
                                    marginBottom: 8,
                                }}>
                                    Data Sharing
                                </Text>
                                <Text style={{ 
                                    fontSize: 15, 
                                    color: colors.text.secondary,
                                    textAlign: "center",
                                    lineHeight: 22,
                                }}>
                                    Transparency in how we handle your data.
                                </Text>
                            </View>

                            {/* Sharing Categories */}
                            <View style={{ gap: 12 }}>
                                {sharingCategories.map((item, index) => (
                                    <View 
                                        key={index}
                                        style={{
                                            backgroundColor: colors.background.primary,
                                            borderRadius: 16,
                                            padding: 16,
                                            borderWidth: 1,
                                            borderColor: colors.border.light,
                                        }}
                                    >
                                        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                                            <View style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 22,
                                                backgroundColor: item.shared ? colors.status.successLight : colors.neutral[100],
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginRight: 12,
                                            }}>
                                                {item.shared ? (
                                                    <Check size={20} color={colors.status.success} />
                                                ) : (
                                                    <X size={20} color={colors.neutral[500]} />
                                                )}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ 
                                                    flexDirection: "row", 
                                                    justifyContent: "space-between", 
                                                    alignItems: "center",
                                                    marginBottom: 4,
                                                }}>
                                                    <Text style={{
                                                        fontSize: 16,
                                                        fontWeight: "600",
                                                        color: colors.text.primary,
                                                        flex: 1,
                                                    }}>
                                                        {item.title}
                                                    </Text>
                                                    <View style={{
                                                        backgroundColor: item.shared ? colors.status.successLight : colors.neutral[100],
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 4,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: item.shared ? colors.status.success : colors.neutral[300],
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 12,
                                                            fontWeight: "600",
                                                            color: item.shared ? colors.status.success : colors.neutral[600],
                                                        }}>
                                                            {item.shared ? "Enabled" : "Disabled"}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={{
                                                    fontSize: 14,
                                                    color: colors.text.secondary,
                                                    lineHeight: 20,
                                                    marginBottom: 8,
                                                }}>
                                                    {item.description}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                        {/* Details */}
                                        <View style={{
                                            backgroundColor: colors.neutral[50],
                                            padding: 12,
                                            borderRadius: 12,
                                            flexDirection: "row",
                                            alignItems: "flex-start",
                                        }}>
                                            <Info size={16} color={colors.primary[600]} style={{ marginRight: 8, marginTop: 2 }} />
                                            <Text style={{
                                                fontSize: 13,
                                                color: colors.text.tertiary,
                                                lineHeight: 18,
                                                flex: 1,
                                            }}>
                                                {item.details}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Footer Note */}
                            <View style={{
                                marginTop: 24,
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
                                    Your Data, Your Control
                                </Text>
                                <Text style={{
                                    fontSize: 13,
                                    color: colors.text.secondary,
                                    textAlign: "center",
                                    lineHeight: 20,
                                }}>
                                    We believe in complete transparency. All data sharing is disabled by default, and you have full control over your information.
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                        </Animated.View>
                    </GestureDetector>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
}

