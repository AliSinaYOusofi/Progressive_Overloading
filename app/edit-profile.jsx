import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native"
import { Save, User, Ruler, Weight, Calendar, Users, ArrowLeft } from "lucide-react-native"
import { useThemedColors } from "../hooks/useThemedColors"
import { useRouter } from "expo-router"
import { upsertProfile, getCurrentUser, getProfile } from "../lib/database"
import DateTimePicker from "@react-native-community/datetimepicker"

export default function EditProfileScreen() {
  const colors = useThemedColors();
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    height_cm: "",
    weight_kg: "",
    date_of_birth: null,
    gender: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsInitialLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert("Error", "User not found");
        router.back();
        return;
      }

      const profile = await getProfile(user.id);
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
      Alert.alert("Error", "Failed to load profile");
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
    return date.toLocaleDateString()
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
      Alert.alert("Error", "Username cannot be empty")
      return false
    }

    if (
      formData.height_cm &&
      (isNaN(formData.height_cm) ||
        Number.parseInt(formData.height_cm) < 50 ||
        Number.parseInt(formData.height_cm) > 300)
    ) {
      Alert.alert("Error", "Height must be between 50 and 300 cm")
      return false
    }

    if (
      formData.weight_kg &&
      (isNaN(formData.weight_kg) ||
        Number.parseFloat(formData.weight_kg) < 20 ||
        Number.parseFloat(formData.weight_kg) > 500)
    ) {
      Alert.alert("Error", "Weight must be between 20 and 500 kg")
      return false
    }

    if (formData.date_of_birth) {
      const age = calculateAge(formData.date_of_birth)
      if (age < 1 || age > 120) {
        Alert.alert("Error", "Age must be between 13 and 120 years")
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        Alert.alert("Error", "User not found")
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
      
      await upsertProfile(user.id, updates)
      
      Alert.alert("Success", "Profile updated successfully!", [
        {
          text: "OK",
          onPress: () => router.push('/profile')
        }
      ])
    } catch (error) {
      console.error("Error updating profile:", error)
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
      position: 'relative',
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.card,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    title: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
      flex: 1,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 24,
      paddingBottom: 24,
      paddingHorizontal: 24,
    },
    profileSummary: {
      backgroundColor: colors.primary[50],
      marginBottom: 24,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary[200],
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.primary[700],
      marginBottom: 12,
      textAlign: "center",
    },
    summaryItems: {
      gap: 8,
    },
    summaryItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: "500",
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "600",
    },
    summaryValueCompleted: {
      color: colors.status.success,
    },
    summaryValueEmpty: {
      color: colors.text.tertiary,
      fontStyle: "italic",
    },
    inputGroup: {
      marginBottom: 24,
    },
    inputLabel: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
      gap: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.primary,
    },
    helperText: {
      fontSize: 12,
      color: colors.text.tertiary,
      marginTop: 4,
      marginLeft: 4,
    },
    bmiPreview: {
      backgroundColor: colors.background.card,
      padding: 8,
      borderRadius: 6,
      marginTop: 8,
      marginLeft: 4,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    bmiPreviewText: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.primary,
    },
    dateButton: {
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.background.primary,
    },
    dateButtonText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    genderOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    genderOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.background.primary,
    },
    genderOptionSelected: {
      backgroundColor: colors.primary[600],
      borderColor: colors.primary[600],
    },
    genderOptionText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    genderOptionTextSelected: {
      color: colors.background.primary,
      fontWeight: "500",
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      padding: 24,
      paddingTop: 16,
      paddingBottom: Platform.OS === "ios" ? 34 : 24,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
      backgroundColor: colors.background.card,
      marginTop: 24,
    },
    button: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      borderRadius: 8,
      gap: 8,
    },
    cancelButton: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    saveButton: {
      backgroundColor: colors.primary[600],
    },
    saveButtonDisabled: {
      backgroundColor: colors.primary[400],
      opacity: 0.7,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  })

  if (isInitialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/profile')}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
        {/* Profile Summary */}
        <View style={styles.profileSummary}>
          <Text style={styles.summaryTitle}>Profile Completion</Text>
          <View style={styles.summaryItems}>
            {[
              { field: "username", label: "Username", value: formData.username },
              { field: "height_cm", label: "Height", value: formData.height_cm, unit: "cm" },
              { field: "weight_kg", label: "Weight", value: formData.weight_kg, unit: "kg" },
              { field: "date_of_birth", label: "Date of Birth", value: formData.date_of_birth },
              { field: "gender", label: "Gender", value: formData.gender },
            ].map((item) => (
              <View key={item.field} style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{item.label}</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    item.value ? styles.summaryValueCompleted : styles.summaryValueEmpty,
                  ]}
                >
                  {item.value
                    ? item.field === "date_of_birth"
                      ? formatDate(item.value)
                      : `${item.value}${item.unit || ""}`
                    : "Not set"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Username */}
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <User size={20} color={colors.primary[600]} />
            <Text style={styles.label}>Username</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(value) => handleInputChange("username", value)}
            placeholder="Enter username"
            placeholderTextColor={colors.text.tertiary}
            maxLength={30}
          />
        </View>

        {/* Height */}
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Ruler size={20} color={colors.primary[600]} />
            <Text style={styles.label}>Height (cm)</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.height_cm}
            onChangeText={(value) => handleInputChange("height_cm", value)}
            placeholder="Enter height in cm"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.helperText}>e.g., 175 for 1.75m</Text>
        </View>

        {/* Weight */}
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Weight size={20} color={colors.primary[600]} />
            <Text style={styles.label}>Weight (kg)</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.weight_kg}
            onChangeText={(value) => handleInputChange("weight_kg", value)}
            placeholder="Enter weight in kg"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            maxLength={5}
          />
          <Text style={styles.helperText}>e.g., 70.5 for 70.5kg</Text>

          {/* BMI Preview */}
          {formData.height_cm &&
            formData.weight_kg &&
            (() => {
              const height = Number.parseFloat(formData.height_cm)
              const weight = Number.parseFloat(formData.weight_kg)
              if (height > 0 && weight > 0) {
                const bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)
                let bmiCategory = "Normal"
                let bmiColor = colors.status.success

                if (bmi < 18.5) {
                  bmiCategory = "Underweight"
                  bmiColor = colors.status.warning
                } else if (bmi >= 25 && bmi < 30) {
                  bmiCategory = "Overweight"
                  bmiColor = colors.status.warning
                } else if (bmi >= 30) {
                  bmiCategory = "Obese"
                  bmiColor = colors.status.error
                }

                return (
                  <View style={styles.bmiPreview}>
                    <Text style={styles.bmiPreviewText}>
                      BMI: <Text style={{ color: bmiColor, fontWeight: "600" }}>{bmi}</Text> ({bmiCategory})
                    </Text>
                  </View>
                )
              }
              return null
            })()}
        </View>

        {/* Date of Birth */}
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Calendar size={20} color={colors.primary[600]} />
            <Text style={styles.label}>Date of Birth</Text>
          </View>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text
              style={[
                styles.dateButtonText,
                { color: formData.date_of_birth ? colors.text.primary : colors.text.tertiary },
              ]}
            >
              {formatDate(formData.date_of_birth)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <View style={styles.inputLabel}>
            <Users size={20} color={colors.primary[600]} />
            <Text style={styles.label}>Gender</Text>
          </View>
          <View style={styles.genderOptions}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.genderOption, formData.gender === option.value && styles.genderOptionSelected]}
                onPress={() => handleInputChange("gender", option.value)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    formData.gender === option.value && styles.genderOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => router.push('/profile')}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.background.primary} />
            ) : (
              <Save size={20} color={colors.background.primary} />
            )}
            <Text style={styles.saveButtonText}>{isLoading ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
              padding: 20
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>Select Date of Birth</Text>
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

