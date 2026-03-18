import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native"
import { Save, User, Ruler, Weight, Calendar, Users, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Heart, ChevronDown } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useThemedColors } from "../../hooks/useThemedColors"
import { useTheme } from "../../contexts/ThemeContext"
import { useRouter } from "expo-router"
import { upsertProfile, getCurrentUser, getProfile } from "../../lib/database"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useAppStore } from "../../stores/useAppStore"
import AnimatedSlideIn from "../../components/AnimatedSlideIn"

export default function EditProfileScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const scrollRef = useRef(null);

  // Use Zustand store for profile data
  const { profile: storeProfile, setProfile, user: storeUser } = useAppStore();

  const [formData, setFormData] = useState({
    username: "",
    height_cm: "",
    weight_kg: "",
    date_of_birth: null,
    gender: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [showHeightUnitPicker, setShowHeightUnitPicker] = useState(false)
  const [showWeightUnitPicker, setShowWeightUnitPicker] = useState(false)
  const [heightUnit, setHeightUnit] = useState("cm")  // cm, ft, in
  const [weightUnit, setWeightUnit] = useState("kg")  // kg, lb, st
  const [isSaved, setIsSaved] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [focusTrigger, setFocusTrigger] = useState(0)

  useEffect(() => {
    loadProfile();
    setFocusTrigger(t => t + 1);
  }, []);

  const loadProfile = async () => {
    try {
      setIsInitialLoading(true);
      setLoadError(null);

      // Use cached profile if available
      let profile = storeProfile;

      if (!profile) {
        const user = storeUser || await getCurrentUser();
        if (!user) {
          setLoadError("User not found. Please sign in again.");
          setIsInitialLoading(false);
          return;
        }
        profile = await getProfile(user.id);
        if (profile) {
          setProfile(profile);
        }
      }

      if (profile) {
        setFormData({
          username: profile.username || profile.full_name || "",
          height_cm: profile.height_cm?.toString() || "",
          weight_kg: profile.weight_kg?.toString() || "",
          date_of_birth: profile.date_of_birth ? new Date(profile.date_of_birth) : null,
          gender: profile.gender || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setLoadError("Failed to load your profile. Please try again.");
    } finally {
      setIsInitialLoading(false);
    }
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer_not_to_say", label: "Prefer not to say" },
  ]

  const heightUnits = [
    { value: "cm", label: "Centimeters (cm)" },
    { value: "ft", label: "Feet & Inches (ft)" },
    { value: "in", label: "Inches (in)" },
  ];

  const weightUnits = [
    { value: "kg", label: "Kilograms (kg)" },
    { value: "lb", label: "Pounds (lb)" },
    { value: "st", label: "Stone (st)" },
  ];

  // Conversion helpers — always store internally as cm / kg
  const convertHeightToCm = (val, unit) => {
    const v = Number.parseFloat(val);
    if (isNaN(v)) return "";
    if (unit === "cm") return val;
    if (unit === "ft") return String(Math.round(v * 30.48));
    if (unit === "in") return String(Math.round(v * 2.54));
    return val;
  };

  const convertHeightFromCm = (cmVal, unit) => {
    const v = Number.parseFloat(cmVal);
    if (isNaN(v)) return "";
    if (unit === "cm") return cmVal;
    if (unit === "ft") return (v / 30.48).toFixed(2);
    if (unit === "in") return (v / 2.54).toFixed(1);
    return cmVal;
  };

  const convertWeightToKg = (val, unit) => {
    const v = Number.parseFloat(val);
    if (isNaN(v)) return "";
    if (unit === "kg") return val;
    if (unit === "lb") return (v * 0.453592).toFixed(1);
    if (unit === "st") return (v * 6.35029).toFixed(1);
    return val;
  };

  const convertWeightFromKg = (kgVal, unit) => {
    const v = Number.parseFloat(kgVal);
    if (isNaN(v)) return "";
    if (unit === "kg") return kgVal;
    if (unit === "lb") return (v / 0.453592).toFixed(1);
    if (unit === "st") return (v / 6.35029).toFixed(2);
    return kgVal;
  };

  // Displayed values in current unit
  const displayHeight = formData.height_cm ? convertHeightFromCm(formData.height_cm, heightUnit) : "";
  const displayWeight = formData.weight_kg ? convertWeightFromKg(formData.weight_kg, weightUnit) : "";

  const handleHeightChange = (value) => {
    // Store as cm internally
    const cmValue = convertHeightToCm(value, heightUnit);
    setFormData(prev => ({ ...prev, height_cm: cmValue }));
  };

  const handleWeightChange = (value) => {
    // Store as kg internally
    const kgValue = convertWeightToKg(value, weightUnit);
    setFormData(prev => ({ ...prev, weight_kg: kgValue }));
  };

  const handleHeightUnitChange = (newUnit) => {
    setHeightUnit(newUnit);
    setShowHeightUnitPicker(false);
  };

  const handleWeightUnitChange = (newUnit) => {
    setWeightUnit(newUnit);
    setShowWeightUnitPicker(false);
  };

  const getHeightPlaceholder = () => {
    if (heightUnit === "cm") return "e.g., 175";
    if (heightUnit === "ft") return "e.g., 5.74";
    if (heightUnit === "in") return "e.g., 68.9";
    return "Enter height";
  };

  const getWeightPlaceholder = () => {
    if (weightUnit === "kg") return "e.g., 70.5";
    if (weightUnit === "lb") return "e.g., 155.4";
    if (weightUnit === "st") return "e.g., 11.1";
    return "Enter weight";
  };

  const getHeightHelper = () => {
    if (heightUnit === "cm") return "e.g., 175 for 1.75m";
    if (heightUnit === "ft") return "e.g., 5.74 for 5ft 9in";
    if (heightUnit === "in") return "e.g., 68.9 for 5ft 9in";
    return "";
  };

  const getWeightHelper = () => {
    if (weightUnit === "kg") return "e.g., 70.5 for 70.5kg";
    if (weightUnit === "lb") return "e.g., 155.4 for 70.5kg";
    if (weightUnit === "st") return "e.g., 11.1 for 70.5kg";
    return "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFormData((prev) => ({
        ...prev,
        date_of_birth: selectedDate,
      }))
    }
  }

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  }

  const formatDate = (date) => {
    if (!date) return "Select date"
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setErrorMessage("Username cannot be empty.");
      return false
    }

    if (
      formData.height_cm &&
      (isNaN(formData.height_cm) ||
        Number.parseInt(formData.height_cm) < 50 ||
        Number.parseInt(formData.height_cm) > 300)
    ) {
      setErrorMessage("Height must be between 50 and 300 cm.");
      return false
    }

    if (
      formData.weight_kg &&
      (isNaN(formData.weight_kg) ||
        Number.parseFloat(formData.weight_kg) < 20 ||
        Number.parseFloat(formData.weight_kg) > 500)
    ) {
      setErrorMessage("Weight must be between 20 and 500 kg.");
      return false
    }

    if (formData.date_of_birth) {
      const age = calculateAge(formData.date_of_birth)
      if (age < 1 || age > 120) {
        setErrorMessage("Age must be between 13 and 120 years.");
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const user = storeUser || await getCurrentUser()
      if (!user) {
        setErrorMessage("User not found. Please sign in again.");
        setIsLoading(false);
        return
      }

      const updates = {
        full_name: formData.username.trim(),
        height_cm: formData.height_cm ? Number.parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? Number.parseFloat(formData.weight_kg) : null,
        date_of_birth: formData.date_of_birth ? formData.date_of_birth.toISOString().split("T")[0] : null,
        gender: formData.gender || null,
        email: user.email
      }

      const updatedProfile = await upsertProfile(user.id, updates)

      // Update Zustand store with new profile data
      setProfile(updatedProfile)

      setSuccessMessage("Profile updated successfully!");
      setIsSaved(true);
      scrollRef.current?.scrollTo({ y: 0, animated: true });

      setTimeout(() => {
        setSuccessMessage("");
        setIsSaved(false);
      }, 5000);
    } catch (error) {
      console.error("Error updating profile:", error)
      setErrorMessage("Failed to update profile. Please try again.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsLoading(false)
    }
  }

  // Computed: form completion
  const filledFields = [
    formData.username.trim(),
    formData.height_cm.trim(),
    formData.weight_kg.trim(),
    formData.date_of_birth,
    formData.gender,
  ].filter(Boolean).length;
  const totalFields = 5;

  // BMI calculation
  const getBMI = () => {
    const height = Number.parseFloat(formData.height_cm);
    const weight = Number.parseFloat(formData.weight_kg);
    if (!height || !weight || height <= 0 || weight <= 0) return null;
    const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1);
    let category = "Normal";
    let color = colors.status.success;
    if (bmi < 18.5) { category = "Underweight"; color = colors.status.warning; }
    else if (bmi >= 25 && bmi < 30) { category = "Overweight"; color = colors.status.warning; }
    else if (bmi >= 30) { category = "Obese"; color = colors.status.error; }
    return { bmi, category, color };
  };

  const bmiData = getBMI();

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    header: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "ios" ? 64 : 44,
      paddingBottom: 28,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 120,
      paddingHorizontal: 20,
    },
    completionBar: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      marginBottom: 24,
    },
    completionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    sectionCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border.light,
      marginBottom: 20,
      shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 18,
    },
    sectionIconBadge: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.primary[600] + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.input,
      borderWidth: 1.5,
      borderColor: colors.border.light,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    inputField: {
      flex: 1,
      fontSize: 16,
      color: colors.text.primary,
      paddingVertical: Platform.OS === "ios" ? 14 : 12,
      paddingHorizontal: 0,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.text.secondary,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    helperText: {
      fontSize: 12,
      color: colors.text.tertiary,
      marginTop: 6,
      marginLeft: 2,
      fontWeight: "500",
    },
  });

  // Initial loading state
  if (isInitialLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <View style={{
          width: 56, height: 56, borderRadius: 28,
          backgroundColor: colors.primary[600] + "12",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <ActivityIndicator size="small" color={colors.primary[600]} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text.primary, marginBottom: 4 }}>
          Loading Profile
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.tertiary }}>
          Fetching your details...
        </Text>
      </View>
    );
  }

  // Load error state
  if (loadError) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center", paddingHorizontal: 40 }]}>
        <View style={{
          width: 60, height: 60, borderRadius: 30,
          backgroundColor: colors.status.error + "12",
          alignItems: "center", justifyContent: "center",
          marginBottom: 16,
        }}>
          <AlertCircle size={28} color={colors.status.error} />
        </View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text.primary, marginBottom: 6, textAlign: "center" }}>
          Something went wrong
        </Text>
        <Text style={{ fontSize: 14, color: colors.text.tertiary, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
          {loadError}
        </Text>
        <TouchableOpacity
          onPress={() => loadProfile()}
          style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: colors.primary[600] + "12",
            paddingHorizontal: 24, paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <RefreshCw size={18} color={colors.primary[600]} />
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.primary[600] }}>
            Retry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, paddingVertical: 8 }}
        >
          <Text style={{ fontSize: 14, color: colors.text.tertiary, fontWeight: "500" }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const genderLabel = genderOptions.find(o => o.value === formData.gender)?.label || "Select gender";

  return (
    <View style={styles.container}>
      {/* Premium Gradient Header */}
      <AnimatedSlideIn index={0} trigger={focusTrigger}>
        <LinearGradient
          colors={isDarkMode
            ? [colors.primary[50], colors.background.primary]
            : [colors.primary[100], colors.primary[50], colors.background.primary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={{ padding: 8, alignSelf: "flex-start", marginBottom: 16 }}
            onPress={() => router.push('/profile')}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={{
            width: 56, height: 56, borderRadius: 16,
            backgroundColor: colors.primary[600] + "20",
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <User size={28} color={colors.primary[600]} />
          </View>

          <Text style={{
            fontSize: 28, fontWeight: "800",
            color: colors.text.primary, letterSpacing: -0.5,
            marginBottom: 6,
          }}>
            Edit Profile
          </Text>
          <Text style={{
            fontSize: 15, color: colors.text.secondary,
            fontWeight: "500", lineHeight: 20,
          }}>
            Keep your details up to date
          </Text>
        </LinearGradient>
      </AnimatedSlideIn>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success Banner */}
          {successMessage ? (
            <AnimatedSlideIn index={0} trigger={focusTrigger}>
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                backgroundColor: colors.status.successLight,
                borderWidth: 1, borderColor: colors.status.success + "30",
                borderRadius: 12, padding: 14, marginBottom: 20,
              }}>
                <CheckCircle2 size={20} color={colors.status.success} />
                <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.status.success }}>
                  {successMessage}
                </Text>
              </View>
            </AnimatedSlideIn>
          ) : null}

          {/* Error Banner */}
          {errorMessage ? (
            <AnimatedSlideIn index={0} trigger={focusTrigger}>
              <View style={{
                flexDirection: "row", alignItems: "center", gap: 10,
                backgroundColor: colors.status.errorLight || colors.status.error + "10",
                borderWidth: 1, borderColor: colors.status.error + "30",
                borderRadius: 12, padding: 14, marginBottom: 20,
              }}>
                <AlertCircle size={20} color={colors.status.error} />
                <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: colors.status.error }}>
                  {errorMessage}
                </Text>
              </View>
            </AnimatedSlideIn>
          ) : null}

          {/* Completion Dots */}
          <AnimatedSlideIn index={1} trigger={focusTrigger}>
            <View style={styles.completionBar}>
              {[...Array(totalFields)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.completionDot,
                    {
                      backgroundColor: i < filledFields
                        ? colors.primary[600]
                        : isDarkMode ? colors.neutral[200] + "30" : colors.neutral[200],
                    },
                  ]}
                />
              ))}
              <Text style={{
                fontSize: 12, fontWeight: "600", marginLeft: 6,
                color: filledFields === totalFields ? colors.primary[600] : colors.text.tertiary,
              }}>
                {filledFields}/{totalFields} fields
              </Text>
            </View>
          </AnimatedSlideIn>

          {/* Card 1: Personal Info */}
          <AnimatedSlideIn index={2} trigger={focusTrigger}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <User size={20} color={colors.primary[600]} />
                </View>
                <Text style={styles.sectionTitle}>Personal Info</Text>
              </View>

              {/* Username */}
              <Text style={styles.inputLabel}>Username</Text>
              <View style={[styles.inputWrapper, { marginBottom: 16 }]}>
                <User size={18} color={colors.text.tertiary} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.inputField}
                  value={formData.username}
                  onChangeText={(value) => handleInputChange("username", value)}
                  placeholder="Enter username"
                  placeholderTextColor={colors.text.tertiary}
                  maxLength={30}
                />
              </View>

              {/* Gender */}
              <Text style={styles.inputLabel}>Gender</Text>
              <TouchableOpacity
                onPress={() => setShowGenderPicker(true)}
                style={[styles.inputWrapper, { paddingVertical: Platform.OS === "ios" ? 14 : 12 }]}
              >
                <Users size={18} color={colors.text.tertiary} style={{ marginRight: 10 }} />
                <Text style={{
                  flex: 1, fontSize: 16,
                  color: formData.gender ? colors.text.primary : colors.text.tertiary,
                }}>
                  {genderLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedSlideIn>

          {/* Card 2: Body Measurements */}
          <AnimatedSlideIn index={3} trigger={focusTrigger}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <Ruler size={20} color={colors.primary[600]} />
                </View>
                <Text style={styles.sectionTitle}>Body Measurements</Text>
              </View>

              {/* Height */}
              <Text style={styles.inputLabel}>Height</Text>
              <View style={[styles.inputWrapper, { marginBottom: 4 }]}>
                <Ruler size={18} color={colors.text.tertiary} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.inputField}
                  value={displayHeight}
                  onChangeText={handleHeightChange}
                  placeholder={getHeightPlaceholder()}
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="numeric"
                  maxLength={6}
                />
                <TouchableOpacity
                  onPress={() => setShowHeightUnitPicker(true)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 4,
                    backgroundColor: colors.primary[600] + "10",
                    paddingHorizontal: 10, paddingVertical: 6,
                    borderRadius: 8, marginLeft: 4,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary[600] }}>
                    {heightUnit}
                  </Text>
                  <ChevronDown size={14} color={colors.primary[600]} />
                </TouchableOpacity>
              </View>
              <Text style={styles.helperText}>{getHeightHelper()}</Text>

              {/* Weight */}
              <View style={{ marginTop: 16 }}>
                <Text style={styles.inputLabel}>Weight</Text>
                <View style={[styles.inputWrapper, { marginBottom: 4 }]}>
                  <Weight size={18} color={colors.text.tertiary} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.inputField}
                    value={displayWeight}
                    onChangeText={handleWeightChange}
                    placeholder={getWeightPlaceholder()}
                    placeholderTextColor={colors.text.tertiary}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    onPress={() => setShowWeightUnitPicker(true)}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 4,
                      backgroundColor: colors.primary[600] + "10",
                      paddingHorizontal: 10, paddingVertical: 6,
                      borderRadius: 8, marginLeft: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary[600] }}>
                      {weightUnit}
                    </Text>
                    <ChevronDown size={14} color={colors.primary[600]} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.helperText}>{getWeightHelper()}</Text>
              </View>

              {/* BMI Card */}
              {bmiData && (
                <View style={{
                  marginTop: 16,
                  backgroundColor: bmiData.color + "10",
                  borderRadius: 12,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: bmiData.color + "25",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: bmiData.color + "18",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Heart size={18} color={bmiData.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text.secondary, marginBottom: 2 }}>
                      Body Mass Index
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
                      <Text style={{ fontSize: 22, fontWeight: "800", color: bmiData.color }}>
                        {bmiData.bmi}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: bmiData.color }}>
                        {bmiData.category}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </AnimatedSlideIn>

          {/* Card 3: Date of Birth */}
          <AnimatedSlideIn index={4} trigger={focusTrigger}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBadge}>
                  <Calendar size={20} color={colors.primary[600]} />
                </View>
                <Text style={styles.sectionTitle}>Date of Birth</Text>
              </View>

              <Text style={styles.inputLabel}>Birthday</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.inputWrapper, { paddingVertical: Platform.OS === "ios" ? 14 : 12 }]}
              >
                <Calendar size={18} color={colors.text.tertiary} style={{ marginRight: 10 }} />
                <Text style={{
                  flex: 1, fontSize: 16,
                  color: formData.date_of_birth ? colors.text.primary : colors.text.tertiary,
                }}>
                  {formatDate(formData.date_of_birth)}
                </Text>
              </TouchableOpacity>

              {formData.date_of_birth && (
                <View style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <View style={{
                    backgroundColor: colors.primary[600] + "12",
                    paddingHorizontal: 12, paddingVertical: 6,
                    borderRadius: 10,
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: colors.primary[600] }}>
                      {calculateAge(formData.date_of_birth)} years old
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </AnimatedSlideIn>

          {/* Save Button */}
          <AnimatedSlideIn index={5} trigger={focusTrigger}>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isSaved
                  ? [colors.status.success, colors.status.success]
                  : isLoading
                    ? [colors.primary[400], colors.primary[500]]
                    : [colors.primary[500], colors.primary[700]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 14,
                  paddingVertical: 18,
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "row",
                  gap: 10,
                  shadowColor: isSaved ? colors.status.success : colors.primary[600],
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 6,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : isSaved ? (
                  <CheckCircle2 size={22} color="#FFFFFF" />
                ) : (
                  <Save size={22} color="#FFFFFF" />
                )}
                <Text style={{
                  fontSize: 17, fontWeight: "700",
                  color: "#FFFFFF", letterSpacing: 0.3,
                }}>
                  {isLoading ? "Saving..." : isSaved ? "Profile Saved" : "Save Changes"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Cancel Link */}
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              disabled={isLoading}
              style={{ alignItems: "center", marginTop: 16, paddingVertical: 8 }}
            >
              <Text style={{
                fontSize: 15, fontWeight: "600",
                color: colors.text.tertiary,
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </AnimatedSlideIn>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Picker Bottom Sheet */}
      <Modal
        transparent
        visible={showGenderPicker}
        animationType="slide"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowGenderPicker(false)}
            style={{ flex: 1 }}
          />
          <View style={{
            backgroundColor: colors.background.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: Platform.OS === "ios" ? 34 : 24,
          }}>
            {/* Drag Handle */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
              <View style={{
                width: 40, height: 4, borderRadius: 2,
                backgroundColor: colors.border.light,
              }} />
            </View>

            <Text style={{
              fontSize: 18, fontWeight: "700",
              color: colors.text.primary,
              paddingHorizontal: 20, paddingBottom: 12,
            }}>
              Select Gender
            </Text>

            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  handleInputChange("gender", option.value);
                  setShowGenderPicker(false);
                }}
                style={{
                  flexDirection: "row", alignItems: "center",
                  paddingVertical: 16, paddingHorizontal: 20,
                  backgroundColor: formData.gender === option.value
                    ? colors.primary[600] + "10"
                    : "transparent",
                }}
              >
                <Text style={{
                  flex: 1, fontSize: 16,
                  fontWeight: formData.gender === option.value ? "600" : "400",
                  color: formData.gender === option.value ? colors.primary[600] : colors.text.primary,
                }}>
                  {option.label}
                </Text>
                {formData.gender === option.value && (
                  <CheckCircle2 size={20} color={colors.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Height Unit Picker Bottom Sheet */}
      <Modal
        transparent
        visible={showHeightUnitPicker}
        animationType="slide"
        onRequestClose={() => setShowHeightUnitPicker(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowHeightUnitPicker(false)}
            style={{ flex: 1 }}
          />
          <View style={{
            backgroundColor: colors.background.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: Platform.OS === "ios" ? 34 : 24,
          }}>
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
              <View style={{
                width: 40, height: 4, borderRadius: 2,
                backgroundColor: colors.border.light,
              }} />
            </View>
            <Text style={{
              fontSize: 18, fontWeight: "700",
              color: colors.text.primary,
              paddingHorizontal: 20, paddingBottom: 12,
            }}>
              Select Height Unit
            </Text>
            {heightUnits.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleHeightUnitChange(option.value)}
                style={{
                  flexDirection: "row", alignItems: "center",
                  paddingVertical: 16, paddingHorizontal: 20,
                  backgroundColor: heightUnit === option.value
                    ? colors.primary[600] + "10"
                    : "transparent",
                }}
              >
                <Text style={{
                  flex: 1, fontSize: 16,
                  fontWeight: heightUnit === option.value ? "600" : "400",
                  color: heightUnit === option.value ? colors.primary[600] : colors.text.primary,
                }}>
                  {option.label}
                </Text>
                {heightUnit === option.value && (
                  <CheckCircle2 size={20} color={colors.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Weight Unit Picker Bottom Sheet */}
      <Modal
        transparent
        visible={showWeightUnitPicker}
        animationType="slide"
        onRequestClose={() => setShowWeightUnitPicker(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setShowWeightUnitPicker(false)}
            style={{ flex: 1 }}
          />
          <View style={{
            backgroundColor: colors.background.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: Platform.OS === "ios" ? 34 : 24,
          }}>
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
              <View style={{
                width: 40, height: 4, borderRadius: 2,
                backgroundColor: colors.border.light,
              }} />
            </View>
            <Text style={{
              fontSize: 18, fontWeight: "700",
              color: colors.text.primary,
              paddingHorizontal: 20, paddingBottom: 12,
            }}>
              Select Weight Unit
            </Text>
            {weightUnits.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleWeightUnitChange(option.value)}
                style={{
                  flexDirection: "row", alignItems: "center",
                  paddingVertical: 16, paddingHorizontal: 20,
                  backgroundColor: weightUnit === option.value
                    ? colors.primary[600] + "10"
                    : "transparent",
                }}
              >
                <Text style={{
                  flex: 1, fontSize: 16,
                  fontWeight: weightUnit === option.value ? "600" : "400",
                  color: weightUnit === option.value ? colors.primary[600] : colors.text.primary,
                }}>
                  {option.label}
                </Text>
                {weightUnit === option.value && (
                  <CheckCircle2 size={20} color={colors.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Date Picker - iOS Modal */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          transparent
          visible={showDatePicker}
          animationType="slide"
          onRequestClose={handleDatePickerDone}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleDatePickerDone}
              style={{ flex: 1 }}
            />
            <View style={{
              backgroundColor: colors.background.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: Platform.OS === "ios" ? 34 : 24,
            }}>
              {/* Drag Handle */}
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 8 }}>
                <View style={{
                  width: 40, height: 4, borderRadius: 2,
                  backgroundColor: colors.border.light,
                }} />
              </View>

              <View style={{
                flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12,
              }}>
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>
                  Date of Birth
                </Text>
                <TouchableOpacity onPress={handleDatePickerDone}>
                  <Text style={{ color: colors.primary[600], fontSize: 16, fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={formData.date_of_birth || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                textColor={colors.text.primary}
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Date Picker - Android */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={formData.date_of_birth || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  )
}
