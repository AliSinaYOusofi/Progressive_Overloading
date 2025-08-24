import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Alert 
} from "react-native";
import { X, Palette, Tag } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";
import { 
  Dumbbell,
  Target,
  Flame,
  Zap,
  Star,
  Heart,
  Trophy,
  Award,
  Medal,
  Crown,
  Bolt,
} from "lucide-react-native";
const CATEGORY_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', 
  '#f97316', '#eab308', '#84cc16', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6'
];

const CATEGORY_ICONS = [
  Dumbbell, Target, Flame, Zap, Star, Heart, Trophy, 
  Award, Medal, Crown, Bolt,
];

export default function AddCategoryModal({
  visible,
  onClose,
  onSubmit,
  initialValues = { 
    name: "", 
    description: "", 
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0]
  },
  isEditing = false
}) {
  const [formState, setFormState] = useState(initialValues);
  const [selectedColor, setSelectedColor] = useState(initialValues.color);
  const [selectedIcon, setSelectedIcon] = useState(initialValues.icon);

  useEffect(() => {
    if (visible) {
      setFormState(initialValues);
      setSelectedColor(initialValues.color);
      setSelectedIcon(initialValues.icon);
    }
  }, [visible, initialValues]);

  const handleSubmit = () => {
    if (!formState.name.trim()) {
      Alert.alert("Name required", "Please enter a category name.");
      return;
    }

    const categoryData = {
      ...formState,
      color: selectedColor,
      icon: selectedIcon
    };

    onSubmit(categoryData);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                {isEditing ? "Edit Category" : "Add Workout Category"}
              </Text>
              <TouchableOpacity onPress={onClose} className="p-2 rounded-lg bg-gray-100">
                <X size={18} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {/* Category Name */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Category Name</Text>
              <TextInput
                placeholder="e.g. Push Day, Pull Day, Leg Day"
                value={formState.name}
                onChangeText={text => setFormState(prev => ({ ...prev, name: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Description (Optional)</Text>
              <TextInput
                placeholder="Describe this workout category"
                value={formState.description}
                onChangeText={text => setFormState(prev => ({ ...prev, description: text }))}
                className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Color Selection */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Category Color</Text>
              <View className="flex-row flex-wrap">
                {CATEGORY_COLORS.map((color, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedColor(color)}
                    className={`w-12 h-12 rounded-full mr-3 mb-3 border-2 ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>

            {/* Icon Selection */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Category Icon</Text>
              <View className="flex-row flex-wrap">
                {CATEGORY_ICONS.map((Icon, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedIcon(Icon)}
                    className={`w-12 h-12 rounded-lg mr-3 mb-3 border-2 items-center justify-center ${
                      selectedIcon === Icon ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                    }`}
                  >

                    <Icon size={20} color={selectedIcon === Icon ? colors.primary[600] : colors.text.tertiary} />
                    
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row">
              <TouchableOpacity 
                onPress={onClose} 
                className="flex-1 bg-gray-100 rounded-xl py-4 mr-2 items-center"
              >
                <Text className="text-gray-700 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSubmit} 
                className="flex-1 bg-emerald-600 rounded-xl py-4 ml-2 items-center"
              >
                <Text className="text-white font-semibold">
                  {isEditing ? "Save Changes" : "Add Category"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
