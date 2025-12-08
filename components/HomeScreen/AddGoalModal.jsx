import React, { useEffect, useState } from "react";
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
  Platform
} from "react-native";
import { Target, Calendar, CheckCircle2, RotateCcw, Trash2, ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";

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
  const [formState, setFormState] = useState(initialValues);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  // Common weight units for global use
  const weightUnits = [
    { label: "lb", value: "lb" },
    { label: "kg", value: "kg" },
    { label: "reps", value: "reps" },
    { label: "miles", value: "miles" },
    { label: "km", value: "km" },
    { label: "oz", value: "oz" },
    { label: "g", value: "g" },
  ];

  useEffect(() => {
    if (visible) {
      // Set default unit to "lb" if not provided or empty
      const defaultUnit = initialValues.unit && initialValues.unit.trim() !== "" ? initialValues.unit : "lb";
      setFormState({ ...initialValues, unit: defaultUnit });
    }
  }, [visible, initialValues]);

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
      unit: formState.unit || "lb" // Default to "lb" if no unit is selected
    };

    onSubmit(goalData);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={isLoading ? undefined : onClose}>
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
          <View style={{ backgroundColor: colors.background.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' }}>
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
              <TextInput
                placeholder="YYYY-MM-DD"
                value={formState.target_date}
                onChangeText={text => setFormState(prev => ({ ...prev, target_date: text }))}
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
                  backgroundColor: colors.primary[300], 
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
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>

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
    </Modal>
  );
}
