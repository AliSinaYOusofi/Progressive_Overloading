import React, { useEffect, useState } from "react";
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
  StyleSheet
} from "react-native";
import { Calendar, CheckCircle2, RotateCcw, Trash2, ChevronDown, AlertCircle, Clock, ArrowLeft } from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, differenceInDays, differenceInYears, differenceInMonths, startOfDay } from 'date-fns';
import { useThemedColors } from "../hooks/useThemedColors";
import { useTheme } from "../contexts/ThemeContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAppStore } from "../stores/useAppStore";
import { createFitnessGoal, updateFitnessGoal, deleteFitnessGoal } from "../lib/database";

export default function AddGoalScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, fitnessGoals, addFitnessGoal, updateFitnessGoal: updateGoalInStore } = useAppStore();
  
  // Get goal data from params if editing
  const editingGoalId = params.goalId ? parseInt(params.goalId) : null;
  const editingGoal = editingGoalId ? fitnessGoals?.find(g => g.id === editingGoalId) : null;
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
            // Fallback to "lb" if no default is set
            setFormState(prev => ({ ...prev, unit: prev.unit || "lb" }));
          }
        } else {
          // Fallback to "lb" if no user
          setFormState(prev => ({ ...prev, unit: prev.unit || "lb" }));
        }
      } catch (error) {
        console.error('Error fetching user defaults:', error);
        // Fallback to "lb" on error
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
            const deletedGoal = fitnessGoals.find((goal) => goal.id === editingGoalId);
            setFitnessGoals((prev) => prev.filter((goal) => goal.id !== editingGoalId));
            
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.card,
      shadowColor: colors.shadow?.dark || "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    backButton: {
      padding: 8,
      marginRight: 12,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: "400",
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 120, // Extra padding to account for tab bar
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginBottom: 16,
    },
    actionButton: {
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingHorizontal: 12, 
      paddingVertical: 8, 
      borderRadius: 12, 
      marginLeft: 8,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            {isEditing ? "Edit Goal" : "Add Fitness Goal"}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing ? "Update your fitness goal" : "Set a new fitness goal"}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Description Section */}
        <View style={{ marginTop: 0, marginBottom: 32, alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 28, 
            fontWeight: '700',
            color: colors.text.primary, 
            textAlign: 'center',
            marginBottom: 12,
          }}>
            {isEditing ? "Edit Goal" : "Add Fitness Goal"}
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: colors.text.secondary, 
            textAlign: 'center',
            lineHeight: 22,
          }}>
            {isEditing 
              ? "Update your fitness goal and track your progress" 
              : "Set a new fitness goal and track your progress over time"}
          </Text>
        </View>

        {/* Success Message */}
        {successMessage ? (
          <View style={{ 
            marginBottom: 16,
            backgroundColor: colors.status.success + '20',
            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: colors.status.success,
          }}>
            <Text style={{ 
              color: colors.status.success, 
              fontSize: 14, 
              fontWeight: "600",
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
            borderRadius: 8,
            borderLeftWidth: 4,
            borderLeftColor: colors.status.error,
          }}>
            <Text style={{ 
              color: colors.status.error, 
              fontSize: 14, 
              fontWeight: "600",
            }}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* Edit actions row (Complete/Reopen, Delete) */}
        {isEditing ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleToggleComplete}
              disabled={isSubmitting || isDeleting || isTogglingComplete}
              style={[
                styles.actionButton,
                { 
                  backgroundColor: colors.background.primary, 
                  opacity: isSubmitting || isDeleting || isTogglingComplete ? 0.6 : 1 
                }
              ]}
            >
              {isTogglingComplete ? (
                <ActivityIndicator size="small" color={colors.primary[600]} />
              ) : isCompleted ? (
                <RotateCcw size={18} color={colors.primary[600]} />
              ) : (
                <CheckCircle2 size={18} color={colors.primary[600]} />
              )}
              <Text style={{ marginLeft: 8, fontWeight: '600', color: colors.primary[600] }}>
                {isCompleted ? "Reopen" : "Mark as Complete"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              disabled={isSubmitting || isDeleting || isTogglingComplete}
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.status.errorLight, 
                  opacity: isSubmitting || isDeleting || isTogglingComplete ? 0.6 : 1 
                }
              ]}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.status.error} />
              ) : (
                <Trash2 size={18} color={colors.status.error} />
              )}
              <Text style={{ marginLeft: 8, fontWeight: '600', color: colors.status.error }}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Goal Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text.secondary, marginBottom: 8, fontWeight: '500' }}>Goal Title</Text>
          <TextInput
            placeholder="e.g. Bench Press 225 lbs"
            value={formState.title}
            onChangeText={text => setFormState(prev => ({ ...prev, title: text }))}
            style={{ 
              borderWidth: 1, 
              borderColor: colors.border.light, 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 12, 
              color: colors.text.primary,
              backgroundColor: colors.background.card || "white"
            }}
            placeholderTextColor={colors.text.tertiary}
            editable={!isSubmitting}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text.secondary, marginBottom: 8, fontWeight: '500' }}>Description (Optional)</Text>
          <TextInput
            placeholder="Describe your goal in detail"
            value={formState.description}
            onChangeText={text => setFormState(prev => ({ ...prev, description: text }))}
            style={{ 
              borderWidth: 1, 
              borderColor: colors.border.light, 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 12, 
              color: colors.text.primary,
              backgroundColor: colors.background.card || "white"
            }}
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={3}
            editable={!isSubmitting}
          />
        </View>

        {/* Current Value / Target Value / Unit */}
        <View style={{ flexDirection: 'row', marginBottom: 24 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ color: colors.text.secondary, marginBottom: 8, fontWeight: '500' }}>Current Value</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="e.g. 180"
              value={formState.current_value}
              onChangeText={text => setFormState(prev => ({ ...prev, current_value: text }))}
              style={{ 
                borderWidth: 1, 
                borderColor: colors.border.light, 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                color: colors.text.primary,
                backgroundColor: colors.background.card || "white"
              }}
              placeholderTextColor={colors.text.tertiary}
              editable={!isSubmitting}
            />
          </View>
          <View style={{ flex: 1, marginHorizontal: 4 }}>
            <Text style={{ color: colors.text.secondary, marginBottom: 8, fontWeight: '500' }}>Target Value</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="225"
              value={formState.target_value}
              onChangeText={text => setFormState(prev => ({ ...prev, target_value: text }))}
              style={{ 
                borderWidth: 1, 
                borderColor: colors.border.light, 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                color: colors.text.primary,
                backgroundColor: colors.background.card || "white"
              }}
              placeholderTextColor={colors.text.tertiary}
              editable={!isSubmitting}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ color: colors.text.secondary, marginBottom: 8, fontWeight: '500' }}>Unit</Text>
            <TouchableOpacity
              onPress={() => !isSubmitting && setShowUnitDropdown(true)}
              disabled={isSubmitting}
              style={{ 
                borderWidth: 1, 
                borderColor: colors.border.light, 
                borderRadius: 12, 
                paddingHorizontal: 16, 
                paddingVertical: 12, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                backgroundColor: colors.background.card || "white",
                opacity: isSubmitting ? 0.6 : 1 
              }}
            >
              <Text style={{ color: formState.unit ? colors.text.primary : colors.text.tertiary }}>
                {formState.unit || "Select unit"}
              </Text>
              <ChevronDown size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Target Date */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: colors.text.secondary, marginBottom: 8, fontWeight: '500' }}>Target Date (Optional)</Text>
          <TouchableOpacity
            onPress={() => {
              if (!isSubmitting) {
                setTempSelectedDate(targetDate);
                setShowDatePicker(true);
              }
            }}
            disabled={isSubmitting}
            style={{ 
              borderWidth: 1, 
              borderColor: colors.border.light, 
              borderRadius: 12, 
              paddingHorizontal: 16, 
              paddingVertical: 12, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              backgroundColor: colors.background.card || "white",
              opacity: isSubmitting ? 0.6 : 1 
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Calendar size={18} color={targetDate ? colors.text.primary : colors.text.tertiary} style={{ marginRight: 8 }} />
              <Text style={{ color: targetDate ? colors.text.primary : colors.text.tertiary, fontSize: 16 }}>
                {targetDate ? formatDateDisplay(targetDate) : "Select target date"}
              </Text>
            </View>
            {targetDate && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  setTargetDate(null);
                }}
                style={{ padding: 4, marginLeft: 8 }}
              >
                <Text style={{ color: colors.status.error, fontSize: 14, fontWeight: '600' }}>Clear</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          {(() => {
            const dateInfo = targetDate ? getTimeUntilDateInfo(targetDate) : null;
            const IconComponent = dateInfo?.icon || Clock;
            return dateInfo ? (
              <View style={{ 
                marginTop: 8, 
                paddingHorizontal: 12, 
                paddingVertical: 10, 
                backgroundColor: dateInfo.backgroundColor, 
                borderRadius: 8,
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
                  <Text style={{ color: dateInfo.textColor, fontSize: 14, fontWeight: '500' }}>
                    {dateInfo.text}
                  </Text>
                </View>
                <IconComponent size={20} color={dateInfo.iconColor} style={{ marginLeft: 12 }} />
              </View>
            ) : null;
          })()}
          <Text style={{ color: colors.text.tertiary, fontSize: 14, marginTop: 4 }}>
            Leave empty for no deadline
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            disabled={isSubmitting}
            style={{ 
              flex: 1, 
              backgroundColor: colors.action.cancel, 
              borderRadius: 12, 
              paddingVertical: 16, 
              marginRight: 8, 
              alignItems: 'center',
              opacity: isSubmitting ? 0.5 : 1 
            }}
          >
            <Text style={{ color: colors.action.cancelText, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={isSubmitting}
            style={{ 
              flex: 1, 
              backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600], 
              borderRadius: 12, 
              paddingVertical: 16, 
              marginLeft: 8, 
              alignItems: 'center',
              opacity: isSubmitting ? 0.7 : 1 
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.text.white} />
            ) : (
              <Text style={{ color: colors.text.white, fontWeight: '600' }}>
                {isEditing ? "Save Changes" : "Add Goal"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Unit Dropdown Modal */}
      <Modal
        transparent
        visible={showUnitDropdown}
        animationType="fade"
        onRequestClose={() => setShowUnitDropdown(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowUnitDropdown(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}
        >
          <View style={{ backgroundColor: colors.background.card, borderRadius: 16, width: '100%', maxWidth: 400 }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border.light }}>
              <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: 'bold' }}>Select Unit</Text>
            </View>
            <ScrollView style={{ maxHeight: 256 }}>
              {weightUnits.map((unit) => (
                <TouchableOpacity
                  key={unit.value}
                  onPress={() => {
                    setFormState(prev => ({ ...prev, unit: unit.value }));
                    setShowUnitDropdown(false);
                  }}
                  style={{
                    paddingHorizontal: 16, 
                    paddingVertical: 12, 
                    borderBottomWidth: 1, 
                    borderBottomColor: colors.border.light,
                    backgroundColor: formState.unit === unit.value ? colors.primary[50] : colors.background.card,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: formState.unit === unit.value ? colors.primary[600] : colors.text.primary,
                      fontWeight: formState.unit === unit.value ? "600" : "400",
                    }}
                  >
                    {unit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
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
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700' }}>Select Target Date</Text>
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
                    paddingHorizontal: 12, 
                    paddingVertical: 10, 
                    backgroundColor: dateInfo.backgroundColor, 
                    borderRadius: 8,
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

