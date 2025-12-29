import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { Mail, ArrowRight, X } from "lucide-react-native";
import { validateEmail } from "./signup";
import { colors } from "../../constants/ui_colors";
import { router } from "expo-router";
import { resetPassword } from "../../lib/auth";

const ForgotPasswordScreen = () => {
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const clearResponseMessage = () => {
        setResponseMessage("");
        setIsSuccess(false);
    };

    const handleResetPassword = async () => {
        // Clear previous messages
        clearResponseMessage();
        
        // Validate email
        const emailErr = validateEmail(email);
        setEmailError(emailErr);
        
        if (emailErr) {
            return;
        }

        setIsLoading(true);
        
        try {
            const { success, message } = await resetPassword(email);
            setResponseMessage(message);
            setIsSuccess(success);
            
            // If successful, clear email after a moment
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
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you a link to reset your password
                    </Text>
                </View>

                {/* Response Message */}
                {responseMessage ? (
                    <View style={[
                        styles.messageContainer,
                        isSuccess ? styles.successContainer : styles.errorContainer
                    ]}>
                        <View style={styles.messageContent}>
                            <Text style={[
                                styles.messageText,
                                isSuccess ? styles.successText : styles.messageErrorText
                            ]}>
                                {responseMessage}
                            </Text>
                            <TouchableOpacity
                                style={styles.messageCloseButton}
                                onPress={clearResponseMessage}
                            >
                                <X size={16} color={isSuccess ? colors.status.success : colors.status.error} />
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
                                onChangeText={(v) => {
                                    setEmail(v);
                                    setEmailError(validateEmail(v));
                                    clearResponseMessage();
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>
                        {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
                    </View>

                    {/* Reset Password Button */}
                    <TouchableOpacity
                        style={[
                            styles.resetButton,
                            (!isFormValid || isLoading) && styles.disabledButton,
                        ]}
                        onPress={handleResetPassword}
                        disabled={!isFormValid || isLoading}
                    >
                        <Text
                            style={[
                                styles.resetButtonText,
                                (!isFormValid || isLoading) && styles.disabledButtonText,
                            ]}
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </Text>
                        {!isLoading && <ArrowRight size={20} color={colors.text.white} />}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Remember your password?{" "}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
                        <Text style={styles.signInLink}>Sign In</Text>
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
        lineHeight: 22,
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
        paddingVertical: Platform.OS === "ios" ? 14 : 5,
        minHeight: Platform.OS === "ios" ? 50 : undefined,
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
    errorText: {
        fontSize: 12,
        color: colors.status.error,
        marginTop: 4,
        marginLeft: 4,
    },
    resetButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary[600],
        paddingVertical: 16,
        borderRadius: 12,
        marginTop: 10,
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
    resetButtonText: {
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
    signInLink: {
        fontSize: 14,
        color: colors.primary[600],
        fontWeight: "600",
    },
    messageContainer: {
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    successContainer: {
        backgroundColor: colors.status.successLight,
        borderColor: colors.status.success,
    },
    errorContainer: {
        backgroundColor: colors.status.errorLight,
        borderColor: colors.status.error,
    },
    messageContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
    },
    messageText: {
        fontSize: 14,
        flex: 1,
        lineHeight: 20,
    },
    successText: {
        color: colors.status.success,
    },
    messageErrorText: {
        color: colors.status.error,
    },
    messageCloseButton: {
        marginLeft: 8,
    },
});

export default ForgotPasswordScreen;

