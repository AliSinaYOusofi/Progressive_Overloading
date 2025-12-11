import React, { useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Shield, Eye, Lock, Database, UserX, FileText } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function PrivacySettingsModal({ visible, onClose }) {
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
    const privacyItems = [
        {
            icon: Eye,
            title: "Profile Visibility",
            description: "Control who can see your profile and workout data",
            setting: "Private",
        },
        {
            icon: Database,
            title: "Data Collection",
            description: "We collect minimal data to provide you with the best experience",
            setting: "Essential Only",
        },
        {
            icon: Lock,
            title: "Account Security",
            description: "Your password is encrypted and never shared with third parties",
            setting: "Secured",
        },
        {
            icon: UserX,
            title: "Third-Party Access",
            description: "We do not share your personal information with third parties",
            setting: "Disabled",
        },
        {
            icon: FileText,
            title: "Activity Logs",
            description: "Your workout logs are stored securely and privately",
            setting: "Encrypted",
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
                                    <Shield size={32} color={colors.primary[600]} />
                                </View>
                                <Text style={{ 
                                    fontSize: 24, 
                                    fontWeight: "bold", 
                                    color: colors.text.primary,
                                    marginBottom: 8,
                                }}>
                                    Privacy Settings
                                </Text>
                                <Text style={{ 
                                    fontSize: 15, 
                                    color: colors.text.secondary,
                                    textAlign: "center",
                                    lineHeight: 22,
                                }}>
                                    Your privacy is our priority. Here's how we protect your data.
                                </Text>
                            </View>

                            {/* Privacy Items */}
                            <View style={{ gap: 12 }}>
                                {privacyItems.map((item, index) => (
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
                                        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                                            <View style={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 22,
                                                backgroundColor: colors.primary[50],
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginRight: 12,
                                            }}>
                                                <item.icon size={20} color={colors.primary[600]} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={{ 
                                                    flexDirection: "row", 
                                                    justifyContent: "space-between", 
                                                    alignItems: "center",
                                                    marginBottom: 6,
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
                                                        backgroundColor: colors.primary[50],
                                                        paddingHorizontal: 10,
                                                        paddingVertical: 4,
                                                        borderRadius: 12,
                                                        borderWidth: 1,
                                                        borderColor: colors.primary[200],
                                                    }}>
                                                        <Text style={{
                                                            fontSize: 12,
                                                            fontWeight: "600",
                                                            color: colors.primary[600],
                                                        }}>
                                                            {item.setting}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text style={{
                                                    fontSize: 14,
                                                    color: colors.text.secondary,
                                                    lineHeight: 20,
                                                }}>
                                                    {item.description}
                                                </Text>
                                            </View>
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
                                    fontSize: 13,
                                    color: colors.text.secondary,
                                    textAlign: "center",
                                    lineHeight: 20,
                                }}>
                                    We comply with GDPR and other privacy regulations. You have full control over your data at all times.
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

