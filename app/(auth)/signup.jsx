import React, { useCallback, useEffect, useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { Modal } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check, AlertCircle, UserPlus, Shield } from "lucide-react-native"
import { signUp } from "../../lib/auth"
import { router } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import AnimatedSlideIn from "../../components/AnimatedSlideIn"
import { useThemedColors } from "../../hooks/useThemedColors"
import { useTheme } from "../../contexts/ThemeContext"
import { LinearGradient } from "expo-linear-gradient"
import { LAYOUT } from "../../constants/layout"
import AppleSignInButton from "../../components/AppleSignInButton"

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
  const colors = useThemedColors()
  const { isDarkMode } = useTheme()
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
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(email, password)
      if (error) {
        setErrorMessage(error.message || "Something went wrong while sending the confirmation email. Please try again.")
        setShowErrorModal(true)
        return
      }
      setShowVerificationModal(true)
    } catch (error) {
      setErrorMessage(error.message || "Something went wrong while sending the confirmation email. Please try again.")
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    !validateEmail(email) &&
    !validatePassword(password) &&
    acceptTerms

  // Form completion tracking
  const filledFields = [
    !validateEmail(email),
    !validatePassword(password),
    acceptTerms,
  ]

  const handleModalClose = () => {
    setShowVerificationModal(false)
    router.push({
      pathname: "/(auth)/signin",
      params: { email, password },
    })
  }

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
            <UserPlus size={20} color={colors.primary[600]} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 28, fontWeight: "800",
                color: colors.text.primary, letterSpacing: -0.5,
                marginBottom: 6,
              }}>
                Create Account
              </Text>
              <Text style={{
                fontSize: 15, color: colors.text.secondary,
                fontWeight: "500", lineHeight: 20,
              }}>
                Start your progressive overloading journey
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

      {/* Verification Success Modal */}
      <Modal
        visible={showVerificationModal}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <Animated.View style={[{
          flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center", justifyContent: "center",
          paddingHorizontal: 24,
        }, verificationOverlayStyle]}>
          <Animated.View style={[{
            width: "100%",
            backgroundColor: colors.background.card,
            borderRadius: 20, padding: 24,
            shadowColor: colors.shadow?.dark || "rgba(0,0,0,0.25)",
            shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
          }, verificationCardStyle]}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: colors.status.success + "15",
                alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <Check size={28} color={colors.status.success} />
              </View>
              <Text style={{
                fontSize: 20, fontWeight: "700",
                color: colors.text.primary, marginBottom: 8,
              }}>
                Verify Your Email
              </Text>
              <Text style={{
                fontSize: 14, color: colors.text.secondary,
                lineHeight: 20, textAlign: "center",
              }}>
                We just sent a verification link to
              </Text>
              <Text style={{
                fontSize: 15, fontWeight: "700",
                color: colors.primary[600], marginTop: 8,
              }}>
                {email}
              </Text>
              <Text style={{
                fontSize: 13, color: colors.text.tertiary,
                lineHeight: 18, textAlign: "center",
                marginTop: 12,
              }}>
                Please check your inbox (and spam) to activate your account.
              </Text>
            </View>

            <TouchableOpacity onPress={handleModalClose} activeOpacity={0.85}>
              <LinearGradient
                colors={isDarkMode
                  ? [colors.primary[400], colors.primary[300]]
                  : [colors.primary[500], colors.primary[600]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={LAYOUT.ctaButton}
              >
                <Text style={LAYOUT.ctaText}>
                  Got it
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <View style={{
          flex: 1, backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center", justifyContent: "center",
          paddingHorizontal: 24,
        }}>
          <View style={{
            width: "100%",
            backgroundColor: colors.background.card,
            borderRadius: 20, padding: 24,
            shadowColor: colors.shadow?.dark || "rgba(0,0,0,0.25)",
            shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
          }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: colors.status.error + "15",
                alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <AlertCircle size={28} color={colors.status.error} />
              </View>
              <Text style={{
                fontSize: 20, fontWeight: "700",
                color: colors.text.primary, marginBottom: 8,
              }}>
                Unable to Send Email
              </Text>
              <Text style={{
                fontSize: 14, color: colors.text.secondary,
                lineHeight: 20, textAlign: "center",
              }}>
                {errorMessage}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowErrorModal(false)}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.background.primary,
                borderWidth: 1.5, borderColor: colors.border.light,
                borderRadius: LAYOUT.ctaButton.borderRadius,
                paddingVertical: LAYOUT.ctaButton.paddingVertical,
                alignItems: "center",
              }}
            >
              <Text style={{
                fontSize: 16, fontWeight: "600",
                color: colors.text.primary,
              }}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 120,
            paddingHorizontal: 20,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Credentials Card */}
          <AnimatedSlideIn index={1} trigger={focusTrigger}>
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
                    Account Details
                  </Text>
                  <Text style={{
                    fontSize: 12, color: colors.text.tertiary,
                    fontWeight: "500",
                  }}>
                    Your email and password
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
                  onChangeText={(v) => { setEmail(v); setEmailError(validateEmail(v)) }}
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
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.text.placeholder}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setPasswordError(validatePassword(v)) }}
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

          {/* Terms Card */}
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
              

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "flex-start" }}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 22, height: 22, borderRadius: 6,
                  borderWidth: 2,
                  borderColor: acceptTerms ? colors.primary[600] : colors.border.light,
                  backgroundColor: acceptTerms ? colors.primary[600] : "transparent",
                  alignItems: "center", justifyContent: "center",
                  marginRight: 12, marginTop: 1,
                }}>
                  {acceptTerms && <Check size={14} color="#FFFFFF" />}
                </View>
                <Text style={{
                  flex: 1, fontSize: 11,
                  color: colors.text.secondary,
                  lineHeight: 21,
                }}>
                  I agree to the{" "}
                  <Text style={{ color: colors.primary[600], fontWeight: "600" }}>
                    Terms of Service
                  </Text>
                  {" "}and{" "}
                  <Text style={{ color: colors.primary[600], fontWeight: "600" }}>
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedSlideIn>

          {/* Create Account CTA */}
          <AnimatedSlideIn index={3} trigger={focusTrigger}>
            <TouchableOpacity
              onPress={handleSignUp}
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
                      Creating Account...
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={LAYOUT.ctaText}>
                      Create Account
                    </Text>
                    <ArrowRight size={18} color="#FFFFFF" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </AnimatedSlideIn>

          {/* Divider */}
          <AnimatedSlideIn index={4} trigger={focusTrigger}>
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
          <AnimatedSlideIn index={5} trigger={focusTrigger}>
            <AppleSignInButton disabled={isLoading} />
          </AnimatedSlideIn>

          {/* Footer */}
          <AnimatedSlideIn index={6} trigger={focusTrigger}>
            <View style={{
              flexDirection: "row", justifyContent: "center",
              alignItems: "center", marginTop: 24,
            }}>
              <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                Already have an account?{" "}
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

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default SignUpScreen
