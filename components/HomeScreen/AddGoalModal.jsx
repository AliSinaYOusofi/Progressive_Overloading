import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from "react-native";
import { Target, Calendar, CheckCircle2, RotateCcw, Trash2, ChevronDown, AlertCircle, Clock } from "lucide-react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, formatDistanceToNow, differenceInDays, differenceInYears, differenceInMonths, startOfDay } from 'date-fns';
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import ModalCloseButton from "../ModalCloseButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export default function AddGoalModal({
  visible,
  onClose,
  onSubmit,
  initialValues = { 
    title: "", 
    description: "", 
    target_value: "",
    current_value: "",
    unit: "",
    target_date: ""
  },
  isEditing = false,
  isLoading = false,
  // Optional edit actions (shown only when isEditing is true)
  onToggleComplete,
  onDelete,
  isCompleted = false,
  completeLoading = false,
  deleteLoading = false
}) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const screenHeight = Dimensions.get("window").height;
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = screenHeight * 0.2; // 20% of screen height

  // Define close function in RN Runtime scope (required for scheduleOnRN)
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow downward swipes (positive translationY)
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SWIPE_THRESHOLD) {
        // Swipe exceeded threshold, animate out then close modal
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
          'worklet';
          scheduleOnRN(handleClose);
        });
      } else {
        // Snap back to original position
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // Animated style for drag handle that changes color when swiping
  const dragHandleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateY.value,
      [0, 50, 100],
      [colors.border.light, colors.primary[400], colors.primary[600]]
    );
    return {
      backgroundColor,
    };
  });

  const [formState, setFormState] = useState(initialValues);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [targetDate, setTargetDate] = useState(null);
  const [tempSelectedDate, setTempSelectedDate] = useState(null); // For real-time preview in date picker

  // Weight units only for goals (same as LogSetModal)
  const weightUnits = [
    { label: "lb", value: "lb" },
    { label: "kg", value: "kg" },
    { label: "oz", value: "oz" },
    { label: "g", value: "g" },
  ];

  useEffect(() => {
    if (visible) {
      // Set default unit to "lb" if not provided or empty
      const defaultUnit = initialValues.unit && initialValues.unit.trim() !== "" ? initialValues.unit : "lb";
      // Parse target_date if it exists
      const parsedDate = initialValues.target_date 
        ? (initialValues.target_date instanceof Date 
            ? initialValues.target_date 
            : new Date(initialValues.target_date))
        : null;
      setFormState({ ...initialValues, unit: defaultUnit });
      setTargetDate(parsedDate);
    }
  }, [visible, initialValues]);

  // Reset translateY when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  const handleSubmit = () => {
    if (!formState.title.trim()) {
      Alert.alert("Title required", "Please enter a goal title.");
      return;
    }

    if (!formState.target_value.trim()) {
      Alert.alert("Target value required", "Please enter a target value.");
      return;
    }

    if (!formState.current_value.trim()) {
      Alert.alert("Current value required", "Please enter a current value.");
      return;
    }

    const currentValue = parseFloat(formState.current_value);
    const targetValue = parseFloat(formState.target_value);

    if (isNaN(currentValue) || isNaN(targetValue)) {
      Alert.alert("Invalid values", "Please enter valid numbers for current and target values.");
      return;
    }

    if (currentValue > targetValue) {
      Alert.alert("Invalid values", "Current value cannot be greater than target value. The target should be your goal to achieve.");
      return;
    }
    console.log(currentValue, targetValue, currentValue > targetValue)
    const goalData = {
      ...formState,
      target_value: parseFloat(formState.target_value) || 0,
      current_value: formState.current_value !== undefined && formState.current_value !== null && `${formState.current_value}`.trim() !== "" 
        ? parseFloat(formState.current_value) || 0 
        : 0,
      unit: formState.unit || "lb", // Default to "lb" if no unit is selected
      target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null
    };

    onSubmit(goalData);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && selectedDate) {
        setTargetDate(selectedDate);
        setTempSelectedDate(null);
      } else if (event.type === 'dismissed') {
        // User cancelled on Android
        setTargetDate(null);
        setTempSelectedDate(null);
      }
    } else {
      // iOS - update date but keep picker open for real-time preview
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
    
    // Normalize dates to start of day to avoid timezone/time issues
    const today = startOfDay(new Date());
    const target = startOfDay(date);
    const days = differenceInDays(target, today);
    
    // Format the time text
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
      // For longer periods, use months and years
      const months = differenceInMonths(target, today);
      const years = differenceInYears(target, today);
      
      // If we have at least 12 months, show in years
      if (months >= 12) {
        const remainingMonths = months - (years * 12);
        if (remainingMonths === 0) {
          timeText = `${years} year${years !== 1 ? 's' : ''}`;
        } else {
          timeText = `${years} year${years !== 1 ? 's' : ''} and ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
        }
      } else {
        // Less than 12 months, show months and days
        const remainingDays = days % 30;
        if (remainingDays === 0) {
          timeText = `${months} month${months !== 1 ? 's' : ''}`;
        } else {
          timeText = `${months} month${months !== 1 ? 's' : ''} and ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
        }
      }
    }
    
    // Determine urgency level and colors based on days remaining
    if (days < 0) {
      // Overdue
      return {
        text: timeText,
        backgroundColor: colors.status.errorLight || colors.background.input,
        borderColor: colors.status.error + '30' || colors.border.light,
        textColor: colors.status.error,
        iconColor: colors.status.error,
        icon: AlertCircle
      };
    } else if (days === 0) {
      // Due today
      return {
        text: timeText,
        backgroundColor: colors.status.warningLight || colors.background.input,
        borderColor: colors.status.warning + '30' || colors.border.light,
        textColor: colors.status.warning,
        iconColor: colors.status.warning,
        icon: AlertCircle
      };
    } else if (days <= 3) {
      // Very close (1-3 days)
      return {
        text: timeText,
        backgroundColor: colors.status.warningLight || colors.background.input,
        borderColor: colors.status.warning + '30' || colors.border.light,
        textColor: colors.status.warning,
        iconColor: colors.status.warning,
        icon: AlertCircle
      };
    } else if (days <= 7) {
      // Close (4-7 days)
      return {
        text: timeText,
        backgroundColor: colors.status.warningLight || colors.background.input,
        borderColor: colors.status.warning + '30' || colors.border.light,
        textColor: colors.status.warning,
        iconColor: colors.status.warning,
        icon: AlertCircle
      };
    } else if (days <= 30) {
      // Normal (8-30 days)
      return {
        text: timeText,
        backgroundColor: colors.background.input,
        borderColor: colors.border.light,
        textColor: colors.text.secondary,
        iconColor: colors.text.tertiary,
        icon: Clock
      };
    } else if (days <= 60) {
      // Far (31-60 days)
      return {
        text: timeText,
        backgroundColor: colors.primary[100] || colors.background.input,
        borderColor: colors.primary[600] + '30' || colors.border.light,
        textColor: colors.primary[600],
        iconColor: colors.primary[600],
        icon: Clock
      };
    } else {
      // Very far (> 60 days)
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

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={isLoading ? undefined : onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose} 
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          >
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[
                { 
                  backgroundColor: colors.background.card, 
                  borderTopLeftRadius: 24, 
                  borderTopRightRadius: 24, 
                  maxHeight: '80%' 
                },
                animatedStyle
              ]}>
                {/* Drag Handle */}
                <Animated.View style={[
                  { 
                    width: 48, 
                    height: 4, 
                    borderRadius: 2, 
                    alignSelf: "center", 
                    marginTop: 12, 
                    marginBottom: 16 
                  },
                  dragHandleAnimatedStyle
                ]} />
                
                <ScrollView 
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24 }}
            >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold' }}>
                {isEditing ? "Edit Goal" : "Add Fitness Goal"}
              </Text>
              <ModalCloseButton onPress={onClose} disabled={isLoading} size={18} />
            </View>

            {/* Edit actions row (Complete/Reopen, Delete) */}
            {isEditing && (onToggleComplete || onDelete) ? (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 }}>
                {onToggleComplete ? (
                  <TouchableOpacity
                    onPress={onToggleComplete}
                    disabled={isLoading || completeLoading}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      paddingHorizontal: 12, 
                      paddingVertical: 8, 
                      borderRadius: 12, 
                      marginRight: 8,
                      backgroundColor: colors.background.primary, 
                      opacity: isLoading || completeLoading ? 0.6 : 1 
                    }}
                  >
                    {completeLoading ? (
                      <ActivityIndicator size="small" color={colors.primary[600]} />
                    ) : isCompleted ? (
                      <RotateCcw size={18} color={colors.primary[600]} />
                    ) : (
                      <CheckCircle2 size={18} color={colors.primary[600]} />
                    )}
                    <Text style={{ marginLeft: 8, fontWeight: '600', color: colors.primary[600] }}>
                      {isCompleted ? "Reopen" : "Complete"}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {onDelete ? (
                  <TouchableOpacity
                    onPress={onDelete}
                    disabled={isLoading || deleteLoading}
                    style={{ 
                      flexDirection: 'row', 
                      alignItems: 'center', 
                      paddingHorizontal: 12, 
                      paddingVertical: 8, 
                      borderRadius: 12,
                      backgroundColor: colors.status.errorLight, 
                      opacity: isLoading || deleteLoading ? 0.6 : 1 
                    }}
                  >
                    {deleteLoading ? (
                      <ActivityIndicator size="small" color={colors.status.error} />
                    ) : (
                      <Trash2 size={18} color={colors.status.error} />
                    )}
                    <Text style={{ marginLeft: 8, fontWeight: '600', color: colors.status.error }}>
                      Delete
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}

            {/* Goal Title */}
            <View style={{ marginBottom: 16 }}>
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
                  backgroundColor: colors.background.input
                }}
                placeholderTextColor={colors.text.tertiary}
                editable={!isLoading}
              />
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
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
                  backgroundColor: colors.background.input
                }}
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                editable={!isLoading}
              />
            </View>

            {/* Current Value / Target Value / Unit */}
            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
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
                    backgroundColor: colors.background.input
                  }}
                  placeholderTextColor={colors.text.tertiary}
                  editable={!isLoading}
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
                    backgroundColor: colors.background.input
                  }}
                  placeholderTextColor={colors.text.tertiary}
                  editable={!isLoading}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ color: colors.text.secondary, marginBottom: 8, fontWeight: '500' }}>Unit</Text>
                <TouchableOpacity
                  onPress={() => !isLoading && setShowUnitDropdown(true)}
                  disabled={isLoading}
                  style={{ 
                    borderWidth: 1, 
                    borderColor: colors.border.light, 
                    borderRadius: 12, 
                    paddingHorizontal: 16, 
                    paddingVertical: 12, 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    backgroundColor: colors.background.input,
                    opacity: isLoading ? 0.6 : 1 
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
                  if (!isLoading) {
                    setTempSelectedDate(targetDate);
                    setShowDatePicker(true);
                  }
                }}
                disabled={isLoading}
                style={{ 
                  borderWidth: 1, 
                  borderColor: colors.border.light, 
                  borderRadius: 12, 
                  paddingHorizontal: 16, 
                  paddingVertical: 12, 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  backgroundColor: colors.background.input,
                  opacity: isLoading ? 0.6 : 1 
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
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity 
                onPress={onClose} 
                disabled={isLoading}
                style={{ 
                  flex: 1, 
                  backgroundColor: colors.action.cancel, 
                  borderRadius: 12, 
                  paddingVertical: 16, 
                  marginRight: 8, 
                  alignItems: 'center',
                  opacity: isLoading ? 0.5 : 1 
                }}
              >
                <Text style={{ color: colors.action.cancelText, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit} 
                disabled={isLoading}
                style={{ 
                  flex: 1, 
                  backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600], 
                  borderRadius: 12, 
                  paddingVertical: 16, 
                  marginLeft: 8, 
                  alignItems: 'center',
                  opacity: isLoading ? 0.7 : 1 
                }}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.text.white} />
                ) : (
                  <Text style={{ color: colors.text.white, fontWeight: '600' }}>
                    {isEditing ? "Save Changes" : "Add Goal"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            </ScrollView>
              </Animated.View>
            </GestureDetector>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>

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
    </Modal>
  );
}
