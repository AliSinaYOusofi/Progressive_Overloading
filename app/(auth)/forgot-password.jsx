import React, { useCallback, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { Mail, ArrowRight, X, AlertCircle, KeyRound, Check } from "lucide-react-native";
import { validateEmail } from "./signup";
import { router } from "expo-router";
import { resetPassword } from "../../lib/auth";
import { useFocusEffect } from "@react-navigation/native";
import AnimatedSlideIn from "../../components/AnimatedSlideIn";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { LAYOUT } from "../../constants/layout";

const ForgotPasswordScreen = () => {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusTrigger, setFocusTrigger] = useState(0);

    useFocusEffect(useCallback(() => {
        setFocusTrigger((t) => t + 1);
    }, []));

    const clearResponseMessage = () => {
        setResponseMessage("");
        setIsSuccess(false);
    };

    const handleResetPassword = async () => {
        clearResponseMessage();

        const emailErr = validateEmail(email);
        setEmailError(emailErr);

        if (emailErr) return;

        setIsLoading(true);

        try {
            const { success, message } = await resetPassword(email);
            setResponseMessage(message);
            setIsSuccess(success);

            if (success) {
                setTimeout(() => {
                    setEmail("");
                }, 2000);
            }
        } catch (error) {
            console.error("Error in handleResetPassword:", error);
            setResponseMessage("An unexpected error occurred. Please try again.");
            setIsSuccess(false);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = !validateEmail(email);

    // Form completion tracking
    const filledFields = [
        !validateEmail(email),
    ];

    return (
        <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
            {/* Hero Header with Gradient */}
            <AnimatedSlideIn index={0} trigger={focusTrigger}>
                <LinearGradient
                    colors={isDarkMode
                        ? [colors.primary[50], colors.background.primary]
                        : [colors.primary[100], colors.primary[50], colors.background.primary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.3, y: 1 }}
                    style={{
                        paddingHorizontal: 24,
                        paddingTop: Platform.OS === "ios" ? 64 : 44,
                        paddingBottom: 28,
                    }}
                >
                    <View style={{
                        width: 40, height: 40, borderRadius: 12,
                        backgroundColor: colors.primary[600] + "20",
                        alignItems: "center", justifyContent: "center",
                        marginBottom: 14,
                    }}>
                        <KeyRound size={20} color={colors.primary[600]} />
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 28, fontWeight: "800",
                                color: colors.text.primary, letterSpacing: -0.5,
                                marginBottom: 6,
                            }}>
                                Reset Password
                            </Text>
                            <Text style={{
                                fontSize: 15, color: colors.text.secondary,
                                fontWeight: "500", lineHeight: 20,
                            }}>
                                We'll send you a link to reset your password
                            </Text>
                        </View>

                        {/* Form Completion Dots */}
                        <View style={{ flexDirection: "row", gap: 6, marginLeft: 16 }}>
                            {filledFields.map((filled, i) => (
                                <View key={i} style={{
                                    width: 8, height: 8, borderRadius: 4,
                                    backgroundColor: filled
                                        ? colors.primary[600]
                                        : colors.primary[600] + "25",
                                }} />
                            ))}
                        </View>
                    </View>
                </LinearGradient>
            </AnimatedSlideIn>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        paddingBottom: 60,
                        paddingHorizontal: 20,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Response Banner */}
                    {responseMessage ? (
                        <AnimatedSlideIn index={1} trigger={focusTrigger}>
                            <View style={{
                                marginBottom: 16,
                                backgroundColor: (isSuccess ? colors.status.success : colors.status.error) + "12",
                                padding: 16,
                                borderRadius: 14,
                                borderWidth: 1,
                                borderColor: (isSuccess ? colors.status.success : colors.status.error) + "25",
                                flexDirection: "row",
                                alignItems: "center",
                            }}>
                                <View style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    backgroundColor: (isSuccess ? colors.status.success : colors.status.error) + "18",
                                    alignItems: "center", justifyContent: "center",
                                    marginRight: 12,
                                }}>
                                    {isSuccess ? (
                                        <Check size={16} color={colors.status.success} />
                                    ) : (
                                        <AlertCircle size={16} color={colors.status.error} />
                                    )}
                                </View>
                                <Text style={{
                                    color: isSuccess ? colors.status.success : colors.status.error,
                                    fontSize: 14,
                                    fontWeight: "600", flex: 1, lineHeight: 19,
                                }}>
                                    {responseMessage}
                                </Text>
                                <TouchableOpacity onPress={clearResponseMessage} style={{
                                    marginLeft: 8, padding: 4,
                                }}>
                                    <X size={16} color={isSuccess ? colors.status.success : colors.status.error} />
                                </TouchableOpacity>
                            </View>
                        </AnimatedSlideIn>
                    ) : null}

                    {/* Email Card */}
                    <AnimatedSlideIn index={2} trigger={focusTrigger}>
                        <View style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 16, padding: 20,
                            borderWidth: 1, borderColor: colors.border.light,
                            marginBottom: 24,
                            shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1, shadowRadius: 8, elevation: 2,
                        }}>
                            {/* Section Header */}
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }}>
                                <View style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    backgroundColor: colors.primary[600] + "15",
                                    alignItems: "center", justifyContent: "center",
                                }}>
                                    <Mail size={18} color={colors.primary[600]} />
                                </View>
                                <View>
                                    <Text style={{
                                        fontSize: 16, fontWeight: "700",
                                        color: colors.text.primary,
                                    }}>
                                        Email Address
                                    </Text>
                                    <Text style={{
                                        fontSize: 12, color: colors.text.tertiary,
                                        fontWeight: "500",
                                    }}>
                                        Enter your account email
                                    </Text>
                                </View>
                            </View>

                            {/* Email Input */}
                            <Text style={{
                                fontSize: 13, fontWeight: "600",
                                color: colors.text.secondary,
                                marginBottom: 8, textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}>
                                Email
                            </Text>
                            <View style={{
                                flexDirection: "row", alignItems: "center",
                                backgroundColor: colors.background.input,
                                borderWidth: 1.5,
                                borderColor: emailError ? colors.status.error : colors.border.light,
                                borderRadius: 12, paddingHorizontal: 14,
                            }}>
                                <Mail size={18} color={colors.text.tertiary} style={{ marginRight: 10 }} />
                                <TextInput
                                    editable={!isLoading}
                                    style={{
                                        flex: 1, fontSize: 16,
                                        color: colors.text.primary,
                                        paddingVertical: Platform.OS === "ios" ? 14 : 12,
                                    }}
                                    placeholder="e.g., user@example.com"
                                    placeholderTextColor={colors.text.placeholder}
                                    value={email}
                                    onChangeText={(v) => {
                                        setEmail(v);
                                        setEmailError(validateEmail(v));
                                        clearResponseMessage();
                                    }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            {!!emailError && (
                                <Text style={{
                                    fontSize: 12, color: colors.status.error,
                                    marginTop: 4, marginLeft: 4,
                                }}>
                                    {emailError}
                                </Text>
                            )}
                        </View>
                    </AnimatedSlideIn>

                    {/* Send Reset Link CTA */}
                    <AnimatedSlideIn index={3} trigger={focusTrigger}>
                        <TouchableOpacity
                            onPress={handleResetPassword}
                            disabled={!isFormValid || isLoading}
                            activeOpacity={0.85}
                            style={{
                                opacity: (!isFormValid && !isLoading) ? 0.5 : (isLoading ? 0.7 : 1),
                                shadowColor: colors.shadow?.colored || "rgba(5,150,105,0.3)",
                                ...LAYOUT.ctaShadow,
                            }}
                        >
                            <LinearGradient
                                colors={isDarkMode
                                    ? [colors.primary[400], colors.primary[300]]
                                    : [colors.primary[500], colors.primary[600]]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={LAYOUT.ctaButton}
                            >
                                {isLoading ? (
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={LAYOUT.ctaText}>
                                            Sending...
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <Text style={LAYOUT.ctaText}>
                                            Send Reset Link
                                        </Text>
                                        <ArrowRight size={18} color="#FFFFFF" />
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </AnimatedSlideIn>

                    {/* Footer */}
                    <AnimatedSlideIn index={4} trigger={focusTrigger}>
                        <View style={{
                            flexDirection: "row", justifyContent: "center",
                            alignItems: "center", marginTop: 24,
                        }}>
                            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                                Remember your password?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/signin")} disabled={isLoading}>
                                <Text style={{
                                    fontSize: 14, color: colors.primary[600],
                                    fontWeight: "600",
                                }}>
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedSlideIn>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ForgotPasswordScreen;
