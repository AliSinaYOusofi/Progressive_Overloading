import React, { useEffect, useCallback } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { Shield, Lock, Eye, FileText, Mail } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { MODAL_LAYOUT } from "../../constants/modal";

const SECTION_ICONS = [FileText, Eye, Lock, Shield, Eye, Lock, Shield, Lock, Shield, FileText, Mail];

export default function PrivacyPolicyModal({ visible, onClose }) {
    const colors = useThemedColors();
    const screenHeight = Dimensions.get("window").height;
    const translateY = useSharedValue(0);
    const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > SWIPE_THRESHOLD) {
                translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
                    "worklet";
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
            [colors.border.light, colors.primary[400], colors.primary[600]]
        );
        return { backgroundColor };
    });

    useEffect(() => {
        if (visible) {
            translateY.value = 0;
        }
    }, [visible, translateY]);

    const sections = [
        {
            title: "Introduction",
            content:
                "Progressive Overloading ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.",
        },
        {
            title: "Information We Collect",
            content:
                "We collect the following types of information:\n\n• Account Information: Email address, password (encrypted), and profile details\n• Fitness Data: Exercise sets, weights, reps, goals, and progress tracking\n• Usage Data: App usage patterns and preferences\n• Device Information: Device type and operating system version",
        },
        {
            title: "How We Use Your Information",
            content:
                "We use your information to:\n\n• Provide and improve our services\n• Track your fitness progress and generate analytics\n• Personalize your experience\n• Send you important updates about the app\n• Ensure app security and prevent fraud",
        },
        {
            title: "Data Storage",
            content:
                "Your data is securely stored in Supabase, a cloud database service. All data is encrypted in transit and at rest. We implement industry-standard security measures to protect your information.",
        },
        {
            title: "Data Sharing",
            content:
                "We do not sell, trade, or rent your personal information to third parties. Your data is only used to provide and improve our services. We may share anonymized, aggregated data for analytics purposes.",
        },
        {
            title: "Your Rights",
            content:
                "You have the right to:\n\n• Access your personal data\n• Correct inaccurate information\n• Delete your account and all associated data\n• Export your data\n• Opt out of certain data collection\n\nTo exercise these rights, please contact us using the information below.",
        },
        {
            title: "Data Retention",
            content:
                "We retain your data for as long as your account is active or as needed to provide our services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law.",
        },
        {
            title: "Security",
            content:
                "We implement appropriate technical and organizational measures to protect your data, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.",
        },
        {
            title: "Children's Privacy",
            content:
                "Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.",
        },
        {
            title: "Changes to This Policy",
            content:
                "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date.",
        },
        {
            title: "Contact Us",
            content:
                "If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:\n\nEmail: senayousofiali@gmail.com\n\nLast Updated: January 2026",
        },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
                    <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
                    <GestureDetector gesture={panGesture}>
                        <Animated.View
                            style={[
                                {
                                    backgroundColor: colors.background.card,
                                    borderRadius: MODAL_LAYOUT.borderRadius,
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: -2 },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 10,
                                    maxHeight: "85%",
                                },
                                animatedStyle,
                            ]}
                        >
                            {/* Drag Handle */}
                            <Animated.View
                                style={[
                                    {
                                        width: 48,
                                        height: 4,
                                        borderRadius: 2,
                                        alignSelf: "center",
                                        marginTop: 12,
                                        marginBottom: 16,
                                    },
                                    dragHandleAnimatedStyle,
                                ]}
                            />

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
                                        <View
                                            style={{
                                                width: 64,
                                                height: 64,
                                                borderRadius: 32,
                                                backgroundColor: colors.primary[50],
                                                alignItems: "center",
                                                justifyContent: "center",
                                                marginBottom: 16,
                                                borderWidth: 2,
                                                borderColor: colors.primary[200],
                                            }}
                                        >
                                            <Shield size={32} color={colors.primary[600]} />
                                        </View>
                                        <Text
                                            style={{
                                                fontSize: 24,
                                                fontWeight: "bold",
                                                color: colors.text.primary,
                                                marginBottom: 8,
                                            }}
                                        >
                                            Privacy Policy
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                color: colors.text.secondary,
                                                textAlign: "center",
                                                lineHeight: 22,
                                            }}
                                        >
                                            How we collect, use, and protect your information
                                        </Text>
                                    </View>

                                    {/* Sections */}
                                    <View style={{ gap: 20 }}>
                                        {sections.map((section, index) => {
                                            const IconComponent = SECTION_ICONS[index] || FileText;
                                            return (
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
                                                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                                                        <View
                                                            style={{
                                                                width: 36,
                                                                height: 36,
                                                                borderRadius: 18,
                                                                backgroundColor: colors.primary[50],
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                marginRight: 12,
                                                            }}
                                                        >
                                                            <IconComponent size={18} color={colors.primary[600]} />
                                                        </View>
                                                        <Text
                                                            style={{
                                                                fontSize: 17,
                                                                fontWeight: "600",
                                                                color: colors.text.primary,
                                                                flex: 1,
                                                            }}
                                                        >
                                                            {section.title}
                                                        </Text>
                                                    </View>
                                                    <Text
                                                        style={{
                                                            fontSize: 15,
                                                            color: colors.text.secondary,
                                                            lineHeight: 24,
                                                            marginLeft: 48,
                                                        }}
                                                    >
                                                        {section.content}
                                                    </Text>
                                                </View>
                                            );
                                        })}
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
