import React, { useCallback, useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { Modal } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check } from "lucide-react-native"
import { signUp } from "../../lib/auth"
import { supabase } from "../../lib/supabase"
import { colors } from "../../constants/ui_colors"
import { router } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import AnimatedItem from "../../components/AnimatedItem"

export const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return "Enter a valid email address."
    }
    return ""
  }

export const validatePassword = (value) => {
    const passwordRegex = /^[A-Za-z0-9]{6,30}$/
    if (!passwordRegex.test(value)) {
      return "Password must be 6-30 chars, letters or numbers only."
    }
    return ""
  }

const SignUpScreen = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("Something went wrong while sending the confirmation email. Please try again.")

  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const scrollViewRef = useRef(null)
  const [focusTrigger, setFocusTrigger] = useState(0)

  useFocusEffect(useCallback(() => {
    setFocusTrigger((t) => t + 1)
  }, []))

  const verificationOverlayOpacity = useSharedValue(0)
  const verificationCardScale = useSharedValue(0.92)
  const verificationCardOpacity = useSharedValue(0)

  useEffect(() => {
    if (showVerificationModal) {
      verificationOverlayOpacity.value = 0
      verificationCardScale.value = 0.92
      verificationCardOpacity.value = 0
      verificationOverlayOpacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) })
      verificationCardScale.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) })
      verificationCardOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) })
    }
  }, [showVerificationModal])

  const verificationOverlayStyle = useAnimatedStyle(() => ({
    opacity: verificationOverlayOpacity.value,
  }))
  const verificationCardStyle = useAnimatedStyle(() => ({
    opacity: verificationCardOpacity.value,
    transform: [{ scale: verificationCardScale.value }],
  }))

  const handleSignUp = async () => {
    setIsLoading(true)
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)

    setEmailError(emailErr)
    setPasswordError(passwordErr)

    const hasErrors = Boolean(emailErr || passwordErr)
    if (hasErrors || !acceptTerms) {
      if (emailErr) scrollToInput(200)
      else if (passwordErr) scrollToInput(280)
      return
    }
    
    try {
      const { data, error } = await signUp(email, password)
      if (error) {
        console.log(error)
        setErrorMessage(error.message || "Something went wrong while sending the confirmation email. Please try again.")
        setShowErrorModal(true)
        return
      }
      setShowVerificationModal(true)
    } catch (error) {
      console.log(error, " *(***********")
      setErrorMessage(error.message || "Something went wrong while sending the confirmation email. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToInput = (inputY) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        y: inputY - 100,
        animated: true,
      })
    }
  }

  const isFormValid =
    !validateEmail(email) &&
    !validatePassword(password) &&
    acceptTerms

  const handleModalClose = () => {
    setShowVerificationModal(false)
    router.push({
      pathname: "/(auth)/signin",
      params: {
        email,
        password,
      },
    })
  }
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <Animated.View style={[styles.modalOverlay, verificationOverlayStyle]}>
          <Animated.View style={[styles.modalCard, verificationCardStyle]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconCircle}>
                <Check size={24} color={colors.text.white} />
              </View>
              <Text style={styles.modalTitle}>Verify your email</Text>
            </View>
            <Text style={styles.modalBody}>
              We just sent a verification link to
              {"\n"}
              <Text style={styles.modalEmail}>{email}</Text>
              {"\n"}
              {"\n"}
              <Text >Please check your inbox (and spam) to activate your account.</Text>
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleModalClose}
              >
                <Text style={styles.modalPrimaryButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconCircle, { backgroundColor: colors.status.error }]}>
                <Text style={{ color: colors.text.white, fontWeight: "700", fontSize: 18 }}>!</Text>
              </View>
              <Text style={styles.modalTitle}>Unable to send email</Text>
            </View>
            <Text style={styles.modalBody}>
              {errorMessage}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.modalPrimaryButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <AnimatedItem index={0} trigger={focusTrigger}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Start your progressive overloading journey</Text>
          </View>
        </AnimatedItem>

        {/* Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <AnimatedItem index={1} trigger={focusTrigger}>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, !!emailError && styles.errorInput]}>
                <Mail size={20} color={colors.neutral[500]} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={colors.neutral[400]}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setEmailError(validateEmail(v)) }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => scrollToInput(200)}
                />
              </View>
              {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}
            </View>
          </AnimatedItem>

          {/* Password Input */}
          <AnimatedItem index={2} trigger={focusTrigger}>
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, !!passwordError && styles.errorInput]}>
                <Lock size={20} color={colors.neutral[500]} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password (min. 6 characters)"
                  placeholderTextColor={colors.neutral[400]}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setPasswordError(validatePassword(v)) }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => scrollToInput(280)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.neutral[500]} />
                  ) : (
                    <Eye size={20} color={colors.neutral[500]} />
                  )}
                </TouchableOpacity>
              </View>
              {!!passwordError && <Text style={styles.errorText}>{passwordError}</Text>}
            </View>
          </AnimatedItem>

          {/* Terms and Conditions */}
          <AnimatedItem index={3} trigger={focusTrigger}>
            <TouchableOpacity 
              style={styles.termsContainer}
              onPress={() => setAcceptTerms(!acceptTerms)}
            >
              <View style={[styles.checkbox, acceptTerms && styles.checkedBox]}>
                {acceptTerms && <Check size={16} color={colors.text.white} />}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </AnimatedItem>

          {/* Sign Up Button */}
          <AnimatedItem index={4} trigger={focusTrigger}>
            <TouchableOpacity
              style={[styles.signUpButton, !isFormValid && styles.disabledButton]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              <Text style={[styles.signUpButtonText, !isFormValid && styles.disabledButtonText]}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Text>
              {!isLoading && <ArrowRight size={20} color={colors.text.white} />}
            </TouchableOpacity>
          </AnimatedItem>
        </View>

        {/* Footer */}
        <AnimatedItem index={5} trigger={focusTrigger}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signin")}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </AnimatedItem>

        {/* <CHANGE> Added extra padding at bottom to ensure content is scrollable above keyboard */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: colors.background.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow.dark,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.status.success,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  modalBody: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalEmail: {
    color: colors.primary[700],
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalPrimaryButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  modalPrimaryButtonText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: "600",
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkedBox: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary[600],
    fontWeight: "500",
  },
  signUpButton: {
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
  signUpButtonText: {
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
  bottomPadding: {
    height: 60,
  },
})

export default SignUpScreen