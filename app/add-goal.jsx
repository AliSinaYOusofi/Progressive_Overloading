import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StyleSheet,
  Dimensions
} from "react-native";
import {
  Calendar, CheckCircle2, RotateCcw, Trash2, ChevronDown,
  AlertCircle, Clock, ArrowLeft, Target, Type, AlignLeft,
  Crosshair, Check
} from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays, differenceInYears, differenceInMonths, startOfDay } from 'date-fns';
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { useThemedColors } from "../hooks/useThemedColors";
import { useTheme } from "../contexts/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "../stores/useAppStore";
import { createFitnessGoal, updateFitnessGoal, deleteFitnessGoal } from "../lib/database";
import AnimatedSlideIn from "../components/AnimatedSlideIn";

const PROGRESS_RING_SIZE = 100;
const PROGRESS_STROKE_WIDTH = 10;
const PROGRESS_RADIUS = (PROGRESS_RING_SIZE - PROGRESS_STROKE_WIDTH) / 2;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

export default function AddGoalScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, fitnessGoals, setFitnessGoals, addFitnessGoal, updateFitnessGoal: updateGoalInStore } = useAppStore();

  // Get goal data from params if editing
  const goalIdParam = Array.isArray(params.goalId) ? params.goalId[0] : params.goalId;
  const editingGoalId = goalIdParam ? String(goalIdParam).trim() : null;
  const editingGoal = editingGoalId
    ? fitnessGoals?.find(g => String(g.id).trim().toLowerCase() === editingGoalId.toLowerCase())
    : null;
  const isEditing = Boolean(editingGoalId && editingGoal);
  const isCompleted = editingGoal?.is_completed || false;

  const [formState, setFormState] = useState({
    title: "",
    description: "",
    target_value: "",
    current_value: "",
    unit: "",
    target_date: ""
  });
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [targetDate, setTargetDate] = useState(null);
  const [tempSelectedDate, setTempSelectedDate] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingComplete, setIsTogglingComplete] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const scrollRef = useRef(null);

  // Computed values
  const filledFields = [
    formState.title.trim(),
    formState.current_value.trim(),
    formState.target_value.trim(),
  ].filter(Boolean).length;
  const totalRequiredFields = 3;

  const currentVal = parseFloat(formState.current_value) || 0;
  const targetVal = parseFloat(formState.target_value) || 0;
  const liveProgress = targetVal > 0 ? Math.min((currentVal / targetVal) * 100, 100) : 0;
  const showProgressRing = currentVal > 0 && targetVal > 0;
  const progressStrokeDashoffset = PROGRESS_CIRCUMFERENCE - (PROGRESS_CIRCUMFERENCE * liveProgress) / 100;

  useFocusEffect(useCallback(() => {
    setFocusTrigger((t) => t + 1);
  }, []));

  // Weight units only for goals
  const weightUnits = [
    { label: "lb", value: "lb" },
    { label: "kg", value: "kg" },
    { label: "oz", value: "oz" },
    { label: "g", value: "g" },
  ];

  // Fetch user defaults for new goals
  useEffect(() => {
    const fetchUserDefaults = async () => {
      if (isEditing) return; // Skip for editing mode

      try {
        const { getCurrentUser, getProfile } = await import("../lib/database");
        const currentUser = user || await getCurrentUser();
        if (currentUser) {
          const profile = await getProfile(currentUser.id);
          if (profile && profile.default_weight_unit) {
            setFormState(prev => ({ ...prev, unit: profile.default_weight_unit }));
          } else {
            setFormState(prev => ({ ...prev, unit: prev.unit || "lb" }));
          }
        } else {
          setFormState(prev => ({ ...prev, unit: prev.unit || "lb" }));
        }
      } catch (error) {
        console.error('Error fetching user defaults:', error);
        setFormState(prev => ({ ...prev, unit: prev.unit || "lb" }));
      }
    };
    fetchUserDefaults();
  }, [user, isEditing]);

  // Initialize form state from editing goal
  useEffect(() => {
    if (isEditing && editingGoal) {
      const defaultUnit = editingGoal.unit && editingGoal.unit.trim() !== "" ? editingGoal.unit : "lb";
      const parsedDate = editingGoal.target_date
        ? (editingGoal.target_date instanceof Date
            ? editingGoal.target_date
            : new Date(editingGoal.target_date))
        : null;
      setFormState({
        title: editingGoal.title || '',
        description: editingGoal.description || '',
        target_value: editingGoal.target_value?.toString() || '',
        current_value: editingGoal.current_value?.toString() || '',
        unit: defaultUnit,
        target_date: editingGoal.target_date || '',
      });
      setTargetDate(parsedDate);
    }
  }, [isEditing, editingGoal]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!formState.title.trim()) {
      setErrorMessage("Please enter a goal title.");
      return;
    }

    if (!formState.target_value.trim()) {
      setErrorMessage("Please enter a target value.");
      return;
    }

    if (!formState.current_value.trim()) {
      setErrorMessage("Please enter a current value.");
      return;
    }

    const currentValue = parseFloat(formState.current_value);
    const targetValue = parseFloat(formState.target_value);

    if (isNaN(currentValue) || isNaN(targetValue)) {
      setErrorMessage("Please enter valid numbers for current and target values.");
      return;
    }

    if (currentValue > targetValue) {
      setErrorMessage("Current value cannot be greater than target value. The target should be your goal to achieve.");
      return;
    }

    if (!user) {
      setErrorMessage("User not found. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        user_id: user.id,
        title: formState.title.trim(),
        description: formState.description.trim() || null,
        target_value: parseFloat(formState.target_value) || 0,
        current_value: formState.current_value !== undefined && formState.current_value !== null && `${formState.current_value}`.trim() !== ""
          ? parseFloat(formState.current_value) || 0
          : 0,
        unit: formState.unit || "lb",
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null
      };

      if (editingGoalId) {
        await updateFitnessGoal(editingGoalId, payload);
        updateGoalInStore(editingGoalId, payload);
        setSuccessMessage("Goal updated successfully!");
      } else {
        const savedGoal = await createFitnessGoal(payload);
        addFitnessGoal(savedGoal);
        setSuccessMessage("Goal created successfully!");
      }
      setIsSaved(true);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => setIsSaved(false), 5000);
    } catch (error) {
      const { getUserFriendlyError, logError } = await import("../utils/errorHandler");
      logError(error, 'add-goal');
      setErrorMessage(getUserFriendlyError(error, editingGoalId ? "Failed to update goal. Please try again." : "Failed to create goal. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingGoalId) return;

    Alert.alert(
      "Delete Goal",
      "Are you sure you want to delete this goal? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            setErrorMessage("");
            setSuccessMessage("");

            // Optimistic update - remove from state immediately
            const deletedGoal = fitnessGoals.find((goal) => String(goal.id) === editingGoalId);
            setFitnessGoals((prev) => prev.filter((goal) => String(goal.id) !== editingGoalId));

            try {
              await deleteFitnessGoal(editingGoalId);
              setSuccessMessage("Goal deleted successfully!");
            } catch (error) {
              const { getUserFriendlyError, logError } = await import("../utils/errorHandler");
              logError(error, 'delete-goal');
              // Revert optimistic update on error
              if (deletedGoal) {
                setFitnessGoals((prev) => [...prev, deletedGoal]);
              }
              setErrorMessage(getUserFriendlyError(error, "Failed to delete goal. Please try again."));
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleToggleComplete = async () => {
    if (!editingGoal) return;

    setIsTogglingComplete(true);
    setErrorMessage("");
    setSuccessMessage("");

    const updates = editingGoal.is_completed
      ? { is_completed: false, completed_at: null }
      : {
          is_completed: true,
          completed_at: new Date().toISOString(),
        };

    // Optimistic update - update state immediately
    const previousGoal = editingGoal;
    setFitnessGoals((prev) =>
      prev.map((g) => (g.id === editingGoal.id ? { ...g, ...updates } : g))
    );

    try {
      await updateFitnessGoal(editingGoal.id, updates);
      setSuccessMessage(editingGoal.is_completed ? "Goal reopened successfully!" : "Goal completed successfully!");
    } catch (error) {
      console.error('Error updating goal state:', error);
      // Revert optimistic update on error
      setFitnessGoals((prev) =>
        prev.map((g) => (g.id === editingGoal.id ? { ...g, ...previousGoal } : g))
      );
      setErrorMessage(error.message || "Failed to update goal. Please try again.");
    } finally {
      setIsTogglingComplete(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setTargetDate(selectedDate);
        setTempSelectedDate(null);
      } else if (event.type === 'dismissed') {
        setTargetDate(null);
        setTempSelectedDate(null);
      }
    } else {
      if (selectedDate) {
        setTempSelectedDate(selectedDate);
      }
    }
  };

  const handleDatePickerDone = () => {
    if (tempSelectedDate) {
      setTargetDate(tempSelectedDate);
    }
    setTempSelectedDate(null);
    setShowDatePicker(false);
  };

  const formatDateDisplay = (date) => {
    if (!date) return null;
    return format(date, 'MMM dd, yyyy');
  };

  // Calculate and format time until target date with color info
  const getTimeUntilDateInfo = (date) => {
    if (!date) return null;

    const today = startOfDay(new Date());
    const target = startOfDay(date);
    const days = differenceInDays(target, today);

    let timeText = "";
    if (days < 0) {
      timeText = `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`;
    } else if (days === 0) {
      timeText = "today";
    } else if (days === 1) {
      timeText = "tomorrow";
    } else if (days < 30) {
      timeText = `${days} day${days !== 1 ? 's' : ''}`;
    } else {
      const months = differenceInMonths(target, today);
      const years = differenceInYears(target, today);

      if (months >= 12) {
        const remainingMonths = months - (years * 12);
        if (remainingMonths === 0) {
          timeText = `${years} year${years !== 1 ? 's' : ''}`;
        } else {
          timeText = `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        }
      } else {
        const remainingDays = days % 30;
        if (remainingDays === 0) {
          timeText = `${months} month${months !== 1 ? 's' : ''}`;
        } else {
          timeText = `${months} month${months !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
        }
      }
    }

    if (days < 0) {
      return {
        text: timeText,
        backgroundColor: colors.status.errorLight || colors.background.input,
        borderColor: colors.status.error + '30' || colors.border.light,
        textColor: colors.status.error,
        iconColor: colors.status.error,
        icon: AlertCircle
      };
    } else if (days === 0) {
      return {
        text: timeText,
        backgroundColor: colors.status.warningLight || colors.background.input,
        borderColor: colors.status.warning + '30' || colors.border.light,
        textColor: colors.status.warning,
        iconColor: colors.status.warning,
        icon: AlertCircle
      };
    } else if (days <= 3) {
      return {
        text: timeText,
        backgroundColor: colors.status.warningLight || colors.background.input,
        borderColor: colors.status.warning + '30' || colors.border.light,
        textColor: colors.status.warning,
        iconColor: colors.status.warning,
        icon: AlertCircle
      };
    } else if (days <= 7) {
      return {
        text: timeText,
        backgroundColor: colors.status.warningLight || colors.background.input,
        borderColor: colors.status.warning + '30' || colors.border.light,
        textColor: colors.status.warning,
        iconColor: colors.status.warning,
        icon: AlertCircle
      };
    } else if (days <= 30) {
      return {
        text: timeText,
        backgroundColor: colors.background.input,
        borderColor: colors.border.light,
        textColor: colors.text.secondary,
        iconColor: colors.text.tertiary,
        icon: Clock
      };
    } else if (days <= 60) {
      return {
        text: timeText,
        backgroundColor: colors.primary[100] || colors.background.input,
        borderColor: colors.primary[600] + '30' || colors.border.light,
        textColor: colors.primary[600],
        iconColor: colors.primary[600],
        icon: Clock
      };
    } else {
      return {
        text: timeText,
        backgroundColor: colors.status.infoLight || colors.background.input,
        borderColor: colors.status.info + '30' || colors.border.light,
        textColor: colors.status.info,
        iconColor: colors.status.info,
        icon: Clock
      };
    }
  };

  const getProgressRingColor = () => {
    if (liveProgress >= 75) return colors.status.success;
    if (liveProgress >= 40) return colors.primary[600];
    return colors.status.warning;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "ios" ? 64 : 44,
      paddingBottom: 28,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 120,
    },
    // Form completion dots
    completionBar: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      marginBottom: 24,
    },
    completionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    // Section card
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
    // Premium inputs
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.input,
      borderWidth: 1.5,
      borderColor: colors.border.light,
      borderRadius: 12,
      paddingHorizontal: 14,
    },
    inputIcon: {
      marginRight: 10,
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
    // Progress bar
    miniProgressBar: {
      height: 6,
      backgroundColor: colors.border.light,
      borderRadius: 3,
      overflow: "hidden",
    },
    miniProgressFill: {
      height: "100%",
      backgroundColor: colors.primary[600],
      borderRadius: 3,
    },
    // CTA
    ctaButton: {
      borderRadius: 14,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    ctaButtonText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    cancelLink: {
      alignItems: "center",
      paddingVertical: 14,
      marginTop: 8,
    },
    cancelLinkText: {
      color: colors.text.tertiary,
      fontSize: 15,
      fontWeight: "600",
    },
    // Edit mode
    editActionCard: {
      backgroundColor: colors.background.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
      marginBottom: 20,
      flexDirection: "row",
      gap: 12,
    },
    editActionButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Hero Header with Gradient */}
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
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={{
            width: 56, height: 56, borderRadius: 16,
            backgroundColor: colors.primary[600] + "20",
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <Target size={28} color={colors.primary[600]} />
          </View>

          <Text style={{
            fontSize: 28, fontWeight: "800",
            color: colors.text.primary, letterSpacing: -0.5,
            marginBottom: 6,
          }}>
            {isEditing ? "Edit Goal" : "New Fitness Goal"}
          </Text>
          <Text style={{
            fontSize: 15, color: colors.text.secondary,
            fontWeight: "500", lineHeight: 20,
          }}>
            {isEditing
              ? "Update your goal details and track progress"
              : "Define your target and start tracking today"}
          </Text>
        </LinearGradient>
      </AnimatedSlideIn>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Form Completion Indicator */}
        <AnimatedSlideIn index={1} trigger={focusTrigger}>
          <View style={styles.completionBar}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[
                styles.completionDot,
                { backgroundColor: i < filledFields ? colors.primary[600] : colors.border.light },
              ]} />
            ))}
            <Text style={{
              fontSize: 12, fontWeight: "600",
              color: filledFields === totalRequiredFields ? colors.status.success : colors.text.tertiary,
              marginLeft: 4,
            }}>
              {filledFields}/{totalRequiredFields} required
            </Text>
          </View>
        </AnimatedSlideIn>

        {/* Success Message */}
        {successMessage ? (
          <View style={{
            marginBottom: 16,
            backgroundColor: colors.status.success + '20',
            padding: 12,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: colors.status.success,
            flexDirection: "row",
            alignItems: "center",
          }}>
            <CheckCircle2 size={16} color={colors.status.success} style={{ marginRight: 8 }} />
            <Text style={{
              color: colors.status.success,
              fontSize: 14,
              fontWeight: "600",
              flex: 1,
            }}>
              {successMessage}
            </Text>
          </View>
        ) : null}

        {/* Error Message */}
        {errorMessage ? (
          <View style={{
            marginBottom: 16,
            backgroundColor: colors.status.error + '20',
            padding: 12,
            borderRadius: 12,
            borderLeftWidth: 4,
            borderLeftColor: colors.status.error,
            flexDirection: "row",
            alignItems: "center",
          }}>
            <AlertCircle size={16} color={colors.status.error} style={{ marginRight: 8 }} />
            <Text style={{
              color: colors.status.error,
              fontSize: 14,
              fontWeight: "600",
              flex: 1,
            }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Edit Mode Actions */}
        {isEditing ? (
          <AnimatedSlideIn index={2} trigger={focusTrigger}>
            <View style={styles.editActionCard}>
              <TouchableOpacity
                onPress={handleToggleComplete}
                disabled={isSubmitting || isDeleting || isTogglingComplete}
                style={[styles.editActionButton, {
                  backgroundColor: colors.primary[600] + "12",
                  opacity: (isSubmitting || isDeleting || isTogglingComplete) ? 0.6 : 1,
                }]}
              >
                {isTogglingComplete ? (
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                ) : isCompleted ? (
                  <RotateCcw size={18} color={colors.primary[600]} />
                ) : (
                  <CheckCircle2 size={18} color={colors.primary[600]} />
                )}
                <Text style={{ fontWeight: "700", color: colors.primary[600], fontSize: 14 }}>
                  {isCompleted ? "Reopen" : "Complete"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={isSubmitting || isDeleting || isTogglingComplete}
                style={[styles.editActionButton, {
                  backgroundColor: colors.status.error + "12",
                  opacity: (isSubmitting || isDeleting || isTogglingComplete) ? 0.6 : 1,
                }]}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.status.error} />
                ) : (
                  <Trash2 size={18} color={colors.status.error} />
                )}
                <Text style={{ fontWeight: "700", color: colors.status.error, fontSize: 14 }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </AnimatedSlideIn>
        ) : null}

        {/* ===== CARD 1: Goal Details ===== */}
        <AnimatedSlideIn index={3} trigger={focusTrigger}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Type size={20} color={colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Goal Details</Text>
            </View>

            <Text style={styles.inputLabel}>Title *</Text>
            <View style={styles.inputWrapper}>
              <Target size={18} color={colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Bench Press 225 lbs"
                value={formState.title}
                onChangeText={text => setFormState(prev => ({ ...prev, title: text }))}
                placeholderTextColor={colors.text.placeholder}
                editable={!isSubmitting}
              />
            </View>

            <View style={{ height: 16 }} />

            <Text style={styles.inputLabel}>Description</Text>
            <View style={[styles.inputWrapper, { alignItems: "flex-start" }]}>
              <AlignLeft size={18} color={colors.text.tertiary} style={[styles.inputIcon, { marginTop: 2 }]} />
              <TextInput
                style={[styles.inputField, { minHeight: 72, textAlignVertical: "top" }]}
                placeholder="Describe your goal in detail"
                value={formState.description}
                onChangeText={text => setFormState(prev => ({ ...prev, description: text }))}
                placeholderTextColor={colors.text.placeholder}
                multiline
                numberOfLines={3}
                editable={!isSubmitting}
              />
            </View>
          </View>
        </AnimatedSlideIn>

        {/* ===== CARD 2: Progress Tracking ===== */}
        <AnimatedSlideIn index={4} trigger={focusTrigger}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Crosshair size={20} color={colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Progress Tracking</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              {/* Current Value */}
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Current *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.inputField, { textAlign: "center" }]}
                    keyboardType="numeric"
                    placeholder="180"
                    value={formState.current_value}
                    onChangeText={text => setFormState(prev => ({ ...prev, current_value: text }))}
                    placeholderTextColor={colors.text.placeholder}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* Target Value */}
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Target *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.inputField, { textAlign: "center" }]}
                    keyboardType="numeric"
                    placeholder="225"
                    value={formState.target_value}
                    onChangeText={text => setFormState(prev => ({ ...prev, target_value: text }))}
                    placeholderTextColor={colors.text.placeholder}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              {/* Unit Selector */}
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TouchableOpacity
                  onPress={() => !isSubmitting && setShowUnitDropdown(true)}
                  disabled={isSubmitting}
                  style={[styles.inputWrapper, { justifyContent: "center", opacity: isSubmitting ? 0.6 : 1, paddingVertical: Platform.OS === "ios" ? 14 : 12 }]}
                >
                  <Text style={{
                    fontSize: 16, flex: 1, textAlign: "center",
                    color: formState.unit ? colors.text.primary : colors.text.placeholder,
                  }}>
                    {formState.unit || "lb"}
                  </Text>
                  <ChevronDown size={16} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Progress Visualization */}
            {showProgressRing && (
              <View style={{ marginTop: 20 }}>
                {/* Mini progress bar */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary, fontWeight: "500" }}>
                    {currentVal} {formState.unit}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.text.tertiary, fontWeight: "500" }}>
                    {targetVal} {formState.unit}
                  </Text>
                </View>
                <View style={styles.miniProgressBar}>
                  <View style={[styles.miniProgressFill, { width: `${liveProgress}%` }]} />
                </View>

                {/* SVG Progress Ring */}
                <View style={{ alignItems: "center", marginTop: 20 }}>
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Svg width={PROGRESS_RING_SIZE} height={PROGRESS_RING_SIZE}>
                      <Circle
                        cx={PROGRESS_RING_SIZE / 2}
                        cy={PROGRESS_RING_SIZE / 2}
                        r={PROGRESS_RADIUS}
                        stroke={colors.border.light}
                        strokeWidth={PROGRESS_STROKE_WIDTH}
                        fill="none"
                      />
                      <Circle
                        cx={PROGRESS_RING_SIZE / 2}
                        cy={PROGRESS_RING_SIZE / 2}
                        r={PROGRESS_RADIUS}
                        stroke={getProgressRingColor()}
                        strokeWidth={PROGRESS_STROKE_WIDTH}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={PROGRESS_CIRCUMFERENCE}
                        strokeDashoffset={progressStrokeDashoffset}
                        rotation="-90"
                        origin={`${PROGRESS_RING_SIZE / 2}, ${PROGRESS_RING_SIZE / 2}`}
                      />
                    </Svg>
                    <View style={{ position: "absolute", alignItems: "center" }}>
                      <Text style={{
                        fontSize: 22, fontWeight: "800",
                        color: colors.text.primary, letterSpacing: -0.5,
                      }}>
                        {Math.round(liveProgress)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={{
                    fontSize: 13, fontWeight: "600",
                    color: getProgressRingColor(), marginTop: 8,
                  }}>
                    {Math.round(liveProgress)}% of goal
                  </Text>
                </View>
              </View>
            )}
          </View>
        </AnimatedSlideIn>

        {/* ===== CARD 3: Timeline ===== */}
        <AnimatedSlideIn index={5} trigger={focusTrigger}>
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBadge}>
                <Calendar size={20} color={colors.primary[600]} />
              </View>
              <Text style={styles.sectionTitle}>Timeline</Text>
            </View>

            <Text style={styles.inputLabel}>Target Date</Text>
            <TouchableOpacity
              onPress={() => {
                if (!isSubmitting) {
                  setTempSelectedDate(targetDate);
                  setShowDatePicker(true);
                }
              }}
              disabled={isSubmitting}
              style={[styles.inputWrapper, { opacity: isSubmitting ? 0.6 : 1, paddingVertical: Platform.OS === "ios" ? 14 : 12 }]}
            >
              <Calendar size={18} color={targetDate ? colors.primary[600] : colors.text.tertiary} style={styles.inputIcon} />
              <Text style={{
                flex: 1, fontSize: 16,
                color: targetDate ? colors.text.primary : colors.text.placeholder,
              }}>
                {targetDate ? formatDateDisplay(targetDate) : "Select target date"}
              </Text>
              {targetDate && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setTargetDate(null);
                  }}
                  style={{ padding: 4 }}
                >
                  <Text style={{ color: colors.status.error, fontSize: 13, fontWeight: "700" }}>Clear</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            {(() => {
              const dateInfo = targetDate ? getTimeUntilDateInfo(targetDate) : null;
              const IconComponent = dateInfo?.icon || Clock;
              return dateInfo ? (
                <View style={{
                  marginTop: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  backgroundColor: dateInfo.backgroundColor,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: dateInfo.borderColor,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
                      Goal must be completed in
                    </Text>
                    <Text style={{ color: dateInfo.textColor, fontSize: 15, fontWeight: '600' }}>
                      {dateInfo.text}
                    </Text>
                  </View>
                  <IconComponent size={22} color={dateInfo.iconColor} />
                </View>
              ) : (
                <Text style={{ color: colors.text.tertiary, fontSize: 13, marginTop: 8 }}>
                  Leave empty for no deadline
                </Text>
              );
            })()}
          </View>
        </AnimatedSlideIn>

        {/* ===== Premium CTA Button ===== */}
        <AnimatedSlideIn index={6} trigger={focusTrigger}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || isSaved}
            activeOpacity={0.85}
            style={{
              opacity: isSubmitting ? 0.7 : 1, marginTop: 4,
              shadowColor: isSaved ? colors.status.success : (colors.shadow?.colored || "rgba(5,150,105,0.3)"),
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: 4,
            }}
          >
            {isSaved ? (
              <View style={[styles.ctaButton, { backgroundColor: colors.status.success, flexDirection: "row", gap: 8 }]}>
                <CheckCircle2 size={20} color="#FFFFFF" />
                <Text style={styles.ctaButtonText}>
                  {isEditing ? "Goal Saved" : "Goal Created"}
                </Text>
              </View>
            ) : (
              <LinearGradient
                colors={isDarkMode
                  ? [colors.primary[400], colors.primary[300]]
                  : [colors.primary[500], colors.primary[600]]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaButton}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.ctaButtonText}>
                    {isEditing ? "Save Changes" : "Create Goal"}
                  </Text>
                )}
              </LinearGradient>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isSubmitting}
            style={[styles.cancelLink, { opacity: isSubmitting ? 0.5 : 1 }]}
          >
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </AnimatedSlideIn>
      </ScrollView>

      {/* Unit Dropdown Modal - Bottom Sheet Style */}
      <Modal
        transparent
        visible={showUnitDropdown}
        animationType="slide"
        onRequestClose={() => setShowUnitDropdown(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowUnitDropdown(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        >
          <View style={{
            backgroundColor: colors.background.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 40,
          }}>
            {/* Drag Handle */}
            <View style={{ alignItems: "center", paddingVertical: 12 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border.medium }} />
            </View>

            <View style={{ paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border.light }}>
              <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>Select Unit</Text>
            </View>

            {weightUnits.map((unit) => (
              <TouchableOpacity
                key={unit.value}
                onPress={() => {
                  setFormState(prev => ({ ...prev, unit: unit.value }));
                  setShowUnitDropdown(false);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border.light,
                  backgroundColor: formState.unit === unit.value ? colors.primary[600] + "08" : "transparent",
                }}
              >
                <Text style={{
                  fontSize: 17,
                  color: formState.unit === unit.value ? colors.primary[600] : colors.text.primary,
                  fontWeight: formState.unit === unit.value ? "700" : "400",
                }}>
                  {unit.label}
                </Text>
                {formState.unit === unit.value && (
                  <Check size={20} color={colors.primary[600]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker - iOS */}
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
              {/* Drag Handle */}
              <View style={{ alignItems: "center", marginBottom: 12 }}>
                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border.medium }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>Select Target Date</Text>
                <TouchableOpacity onPress={handleDatePickerDone}>
                  <Text style={{ color: colors.primary[600], fontSize: 16, fontWeight: '600' }}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempSelectedDate || targetDate || new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
                textColor={colors.text.primary}
                style={{ height: 200 }}
              />
              {(() => {
                const selectedDate = tempSelectedDate || targetDate;
                const dateInfo = selectedDate ? getTimeUntilDateInfo(selectedDate) : null;
                const IconComponent = dateInfo?.icon || Clock;
                return dateInfo ? (
                  <View style={{
                    marginTop: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    backgroundColor: dateInfo.backgroundColor,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: dateInfo.borderColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text.secondary, fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
                        Goal must be completed in
                      </Text>
                      <Text style={{ color: dateInfo.textColor, fontSize: 15, fontWeight: '500' }}>
                        {dateInfo.text}
                      </Text>
                    </View>
                    <IconComponent size={22} color={dateInfo.iconColor} style={{ marginLeft: 12 }} />
                  </View>
                ) : null;
              })()}
            </View>
          </View>
        </Modal>
      )}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={targetDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
          textColor={colors.text.primary}
        />
      )}
    </KeyboardAvoidingView>
  );
}
