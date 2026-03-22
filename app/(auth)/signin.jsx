import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    ScrollView,
    KeyboardAvoidingView,
    ActivityIndicator,
} from "react-native";
import { Eye, EyeOff, Mail, Lock, ArrowRight, X, AlertCircle, LogIn } from "lucide-react-native";
import { validateEmail, validatePassword } from "./signup";
import { useLocalSearchParams, router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { signIn } from "../../lib/auth";
import AnimatedSlideIn from "../../components/AnimatedSlideIn";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { LAYOUT } from "../../constants/layout";
import AppleSignInButton from "../../components/AppleSignInButton";

const SignInScreen = () => {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState("");
    const { email: fromSignupEmail, password: fromSignupPassword } = useLocalSearchParams();
    const [focusTrigger, setFocusTrigger] = useState(0);

    useFocusEffect(useCallback(() => {
        setFocusTrigger((t) => t + 1);
    }, []));

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (fromSignupEmail && fromSignupPassword) {
            setEmail(fromSignupEmail);
            setPassword(fromSignupPassword);
        }
    }, [fromSignupEmail, fromSignupPassword]);

    const clearAuthError = () => setAuthError("");

    const handleSignIn = async () => {
        setIsLoading(true);
        clearAuthError();

        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        setEmailError(eErr);
        setPasswordError(pErr);
        if (eErr || pErr) {
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await signIn(email, password);
            if (error) {
                if (error.message.includes("Invalid login credentials")) {
                    setAuthError("Invalid email or password. Please try again.");
                } else if (error.message.includes("Email not confirmed")) {
                    setAuthError("Please verify your email before signing in.");
                } else {
                    setAuthError("Sign in failed. Please try again.");
                }
                return;
            }
        } catch (error) {
            setAuthError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = !validateEmail(email) && !validatePassword(password);

    // Form completion tracking
    const filledFields = [
        !validateEmail(email),
        !validatePassword(password),
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
                        <LogIn size={20} color={colors.primary[600]} />
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 28, fontWeight: "800",
                                color: colors.text.primary, letterSpacing: -0.5,
                                marginBottom: 6,
                            }}>
                                Welcome Back
                            </Text>
                            <Text style={{
                                fontSize: 15, color: colors.text.secondary,
                                fontWeight: "500", lineHeight: 20,
                            }}>
                                Sign in to continue your fitness journey
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
                        paddingBottom: 120,
                        paddingHorizontal: 20,
                    }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Error Banner */}
                    {authError ? (
                        <AnimatedSlideIn index={1} trigger={focusTrigger}>
                            <View style={{
                                marginBottom: 16,
                                backgroundColor: colors.status.error + "12",
                                padding: 16,
                                borderRadius: 14,
                                borderWidth: 1,
                                borderColor: colors.status.error + "25",
                                flexDirection: "row",
                                alignItems: "center",
                            }}>
                                <View style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    backgroundColor: colors.status.error + "18",
                                    alignItems: "center", justifyContent: "center",
                                    marginRight: 12,
                                }}>
                                    <AlertCircle size={16} color={colors.status.error} />
                                </View>
                                <Text style={{
                                    color: colors.status.error, fontSize: 14,
                                    fontWeight: "600", flex: 1, lineHeight: 19,
                                }}>
                                    {authError}
                                </Text>
                                <TouchableOpacity onPress={clearAuthError} style={{
                                    marginLeft: 8, padding: 4,
                                }}>
                                    <X size={16} color={colors.status.error} />
                                </TouchableOpacity>
                            </View>
                        </AnimatedSlideIn>
                    ) : null}

                    {/* Credentials Card */}
                    <AnimatedSlideIn index={2} trigger={focusTrigger}>
                        <View style={{
                            backgroundColor: colors.background.card,
                            borderRadius: 16, padding: 20,
                            borderWidth: 1, borderColor: colors.border.light,
                            marginBottom: 20,
                            shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 1, shadowRadius: 8, elevation: 2,
                            marginTop: 20
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
                                        Credentials
                                    </Text>
                                    <Text style={{
                                        fontSize: 12, color: colors.text.tertiary,
                                        fontWeight: "500",
                                    }}>
                                        Enter your account details
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
                                Email Address
                            </Text>
                            <View style={{
                                flexDirection: "row", alignItems: "center",
                                backgroundColor: colors.background.input,
                                borderWidth: 1.5,
                                borderColor: emailError ? colors.status.error : colors.border.light,
                                borderRadius: 12, paddingHorizontal: 14,
                                marginBottom: emailError ? 4 : 20,
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
                                    onChangeText={(v) => { setEmail(v); setEmailError(validateEmail(v)); }}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>
                            {!!emailError && (
                                <Text style={{
                                    fontSize: 12, color: colors.status.error,
                                    marginBottom: 16, marginLeft: 4,
                                }}>
                                    {emailError}
                                </Text>
                            )}

                            {/* Password Input */}
                            <Text style={{
                                fontSize: 13, fontWeight: "600",
                                color: colors.text.secondary,
                                marginBottom: 8, textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}>
                                Password
                            </Text>
                            <View style={{
                                flexDirection: "row", alignItems: "center",
                                backgroundColor: colors.background.input,
                                borderWidth: 1.5,
                                borderColor: passwordError ? colors.status.error : colors.border.light,
                                borderRadius: 12, paddingHorizontal: 14,
                            }}>
                                <Lock size={18} color={colors.text.tertiary} style={{ marginRight: 10 }} />
                                <TextInput
                                    editable={!isLoading}
                                    style={{
                                        flex: 1, fontSize: 16,
                                        color: colors.text.primary,
                                        paddingVertical: Platform.OS === "ios" ? 14 : 12,
                                        paddingRight: 40,
                                    }}
                                    placeholder="Enter your password"
                                    placeholderTextColor={colors.text.placeholder}
                                    value={password}
                                    onChangeText={(v) => { setPassword(v); setPasswordError(validatePassword(v)); }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: 16, padding: 4 }}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} color={colors.text.tertiary} />
                                    ) : (
                                        <Eye size={20} color={colors.text.tertiary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                            {!!passwordError && (
                                <Text style={{
                                    fontSize: 12, color: colors.status.error,
                                    marginTop: 4, marginLeft: 4,
                                }}>
                                    {passwordError}
                                </Text>
                            )}
                        </View>
                    </AnimatedSlideIn>

                    {/* Forgot Password */}
                    <AnimatedSlideIn index={3} trigger={focusTrigger}>
                        <TouchableOpacity
                            style={{ alignSelf: "flex-end", marginBottom: 24 }}
                            onPress={() => router.push("/(auth)/forgot-password")}
                            disabled={isLoading}
                        >
                            <Text style={{
                                fontSize: 14, color: colors.primary[600],
                                fontWeight: "600",
                            }}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </AnimatedSlideIn>

                    {/* Sign In CTA */}
                    <AnimatedSlideIn index={4} trigger={focusTrigger}>
                        <TouchableOpacity
                            onPress={handleSignIn}
                            disabled={!isFormValid || isLoading}
                            activeOpacity={0.85}
                            style={{
                                opacity: (!isFormValid && !isLoading) ? 0.5 : (isLoading ? 0.7 : 1),
                                shadowColor: colors.shadow?.colored || "rgba(5,150,105,0.3)",
                                ...LAYOUT.ctaShadow,
                            }}
                        >
                            <LinearGradient
                                colors={colors.ctaGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={LAYOUT.ctaButton}
                            >
                                {isLoading ? (
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                        <Text style={LAYOUT.ctaText}>
                                            Signing In...
                                        </Text>
                                    </View>
                                ) : (
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <Text style={LAYOUT.ctaText}>
                                            Sign In
                                        </Text>
                                        <ArrowRight size={18} color="#FFFFFF" />
                                    </View>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </AnimatedSlideIn>

                    {/* Divider */}
                    <AnimatedSlideIn index={5} trigger={focusTrigger}>
                        <View style={{
                            flexDirection: "row", alignItems: "center",
                            marginVertical: 20,
                        }}>
                            <View style={{ flex: 1, height: 1, backgroundColor: colors.border.light }} />
                            <Text style={{
                                marginHorizontal: 16, fontSize: 13,
                                color: colors.text.tertiary, fontWeight: "500",
                            }}>
                                or
                            </Text>
                            <View style={{ flex: 1, height: 1, backgroundColor: colors.border.light }} />
                        </View>
                    </AnimatedSlideIn>

                    {/* Apple Sign In */}
                    <AnimatedSlideIn index={6} trigger={focusTrigger}>
                        <AppleSignInButton disabled={isLoading} />
                    </AnimatedSlideIn>

                    {/* Footer */}
                    <AnimatedSlideIn index={7} trigger={focusTrigger}>
                        <View style={{
                            flexDirection: "row", justifyContent: "center",
                            alignItems: "center", marginTop: 24,
                        }}>
                            <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                                Don't have an account?{" "}
                            </Text>
                            <TouchableOpacity onPress={() => router.push("/(auth)/signup")} disabled={isLoading}>
                                <Text style={{
                                    fontSize: 14, color: colors.primary[600],
                                    fontWeight: "600",
                                }}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </AnimatedSlideIn>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignInScreen;
