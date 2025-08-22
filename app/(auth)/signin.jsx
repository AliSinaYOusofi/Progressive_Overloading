import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Eye, EyeOff, Mail, Lock, ArrowRight, X } from "lucide-react-native";
import { validateEmail, validatePassword } from "./signup";
import { colors } from "../../constants/ui_colors";
import { useLocalSearchParams, router } from "expo-router";
import { signIn } from "../../lib/auth";

const SignInScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState("");
    const { email : fromSignupEmail, password : fromSignupPassword } = useLocalSearchParams();

    // Validation error states
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (fromSignupEmail && fromSignupPassword) {
            setEmail(fromSignupEmail)
            setPassword(fromSignupPassword)
        }
    }, [fromSignupEmail, fromSignupPassword])

    const clearAuthError = () => {
        setAuthError("");
    };

    const handleSignIn = async () => {
        setIsLoading(true);
        // Clear any previous auth errors
        clearAuthError();
        
        // Validate on press as well
        const eErr = validateEmail(email);
        const pErr = validatePassword(password);
        setEmailError(eErr);
        setPasswordError(pErr);
        if (eErr || pErr) {
            setIsLoading(false);
            return;
        }

        
        try {
            const { data, error } = await signIn(email, password)
            if (error) {
                console.log(error)
                // Set auth error message
                if (error.message.includes("Invalid login credentials")) {
                    setAuthError("Invalid email or password. Please try again.");
                } else if (error.message.includes("Email not confirmed")) {
                    setAuthError("Please verify your email before signing in.");
                } else {
                    setAuthError("Sign in failed. Please try again.");
                }
                return
            }
            // Successful sign in - the auth state listener will handle the redirect automatically
        } catch (error) {
            console.log(error)
            setAuthError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false)
        }
    };

    const isFormValid = !validateEmail(email) && !validatePassword(password);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Sign in to continue your fitness journey
                    </Text>
                </View>

                {/* Auth Error View */}
                {authError ? (
                    <View style={styles.errorContainer}>
                        <View style={styles.errorContent}>
                            <Text style={styles.errorMessage}>{authError}</Text>
                            <TouchableOpacity
                                style={styles.errorCloseButton}
                                onPress={clearAuthError}
                            >
                                <X size={16} color={colors.status.error} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : null}

                {/* Form */}
                <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, !!emailError && styles.errorInput]}>
                            <Mail
                                size={20}
                                color={colors.text.placeholder}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Email address"
                                placeholderTextColor={colors.text.placeholder}
                                value={email}
                                onChangeText={(v) => { setEmail(v); setEmailError(validateEmail(v)); }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, !!passwordError && styles.errorInput]}>
                            <Lock
                                size={20}
                                color={colors.text.placeholder}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Password"
                                placeholderTextColor={colors.text.placeholder}
                                value={password}
                                onChangeText={(v) => { setPassword(v); setPasswordError(validatePassword(v)); }}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.text.placeholder} />
                                ) : (
                                    <Eye size={20} color={colors.text.placeholder} />
                                )}
                            </TouchableOpacity>
                        </View>
                        {!!passwordError && (
                            <Text style={styles.errorText}>{passwordError}</Text>
                        )}
                    </View>

                                         {/* Forgot Password - Placeholder for future implementation */}
                     <TouchableOpacity
                         style={styles.forgotPassword}
                         onPress={() => {
                             // TODO: Implement forgot password functionality
                             console.log("Forgot password pressed");
                         }}
                     >
                         <Text style={styles.forgotPasswordText}>
                             Forgot Password?
                         </Text>
                     </TouchableOpacity>

                    {/* Sign In Button */}
                    <TouchableOpacity
                        style={[
                            styles.signInButton,
                            !isFormValid && styles.disabledButton,
                        ]}
                        onPress={handleSignIn}
                        disabled={!isFormValid || isLoading}
                    >
                        <Text
                            style={[
                                styles.signInButtonText,
                                !isFormValid && styles.disabledButtonText,
                            ]}
                        >
                            {isLoading ? "Signing In..." : "Sign In"}
                        </Text>
                        {!isLoading && <ArrowRight size={20} color={colors.text.white} />}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?{" "}
                    </Text>
                                         <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                         <Text style={styles.signUpLink}>Sign Up</Text>
                     </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: "center",
    },
    form: {
        width: "100%",
        marginBottom: 40,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background.card,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 5,
        shadowColor: colors.shadow.light,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    errorInput: {
        borderWidth: 1,
        borderColor: colors.status.error,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text.primary,
    },
    passwordInput: {
        paddingRight: 40,
    },
    eyeIcon: {
        position: "absolute",
        right: 16,
        padding: 4,
    },
    errorText: {
        fontSize: 12,
        color: colors.status.error,
        marginTop: 4,
        marginLeft: 4,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginBottom: 30,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: colors.primary[600],
        fontWeight: "500",
    },
    signInButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary[600],
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: colors.shadow.colored,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: colors.neutral[300],
        shadowOpacity: 0,
        elevation: 0,
    },
    signInButtonText: {
        color: colors.text.white,
        fontSize: 16,
        fontWeight: "600",
        marginRight: 8,
    },
    disabledButtonText: {
        color: colors.text.placeholder,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    footerText: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    signUpLink: {
        fontSize: 14,
        color: colors.primary[600],
        fontWeight: "600",
    },
    errorContainer: {
        backgroundColor: colors.status.errorLight,
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.status.error,
    },
    errorContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
    },
    errorMessage: {
        fontSize: 14,
        color: colors.status.error,
        flex: 1,
        lineHeight: 20,
    },
    errorCloseButton: {
        marginLeft: 8,
    },
});

export default SignInScreen;
