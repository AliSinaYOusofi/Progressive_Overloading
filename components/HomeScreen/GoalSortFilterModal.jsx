import React, { useEffect, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ArrowUpDown, Calendar, Target, ArrowUp, ArrowDown, Type, TrendingUp, AlertCircle } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTheme } from '../../contexts/ThemeContext';
import ModalCloseButton from '../ModalCloseButton';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const SORT_OPTIONS = [
  { 
    id: 'date', 
    label: 'Date', 
    icon: Calendar,
    orders: [
      { id: 'desc', label: 'Newest First', icon: ArrowDown },
      { id: 'asc', label: 'Oldest First', icon: ArrowUp },
    ]
  },
  { 
    id: 'title', 
    label: 'Title', 
    icon: Type,
    orders: [
      { id: 'asc', label: 'A to Z', icon: ArrowUp },
      { id: 'desc', label: 'Z to A', icon: ArrowDown },
    ]
  },
  { 
    id: 'progress', 
    label: 'Progress', 
    icon: TrendingUp,
    orders: [
      { id: 'desc', label: 'Highest First', icon: ArrowDown },
      { id: 'asc', label: 'Lowest First', icon: ArrowUp },
    ]
  },
  { 
    id: 'target', 
    label: 'Target Value', 
    icon: Target,
    orders: [
      { id: 'desc', label: 'Highest First', icon: ArrowDown },
      { id: 'asc', label: 'Lowest First', icon: ArrowUp },
    ]
  },
  { 
    id: 'overdue', 
    label: 'Days Overdue', 
    icon: AlertCircle,
    orders: [
      { id: 'desc', label: 'Most Overdue First', icon: ArrowDown },
      { id: 'asc', label: 'Least Overdue First', icon: ArrowUp },
    ]
  },
];

export default function GoalSortFilterModal({ visible, onClose, sortBy, sortOrder, onSortChange, showOverdueOption = false }) {
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

  // Reset translateY when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
    }
  }, [visible, translateY]);

  const handleSortSelect = (optionId, orderId) => {
    onSortChange(optionId, orderId);
    onClose();
  };

  // Filter sort options based on showOverdueOption
  const availableSortOptions = showOverdueOption 
    ? SORT_OPTIONS 
    : SORT_OPTIONS.filter(opt => opt.id !== 'overdue');

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={onClose}
            style={{ flex: 1 }}
          />
          <GestureDetector gesture={panGesture}>
            <Animated.View 
              style={[
                { 
                  backgroundColor: colors.background.card,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  maxHeight: '70%',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                  elevation: 20
                },
                animatedStyle
              ]}
            >
              {/* Drag Handle */}
              <Animated.View style={[
                { 
                  width: 48, 
                  height: 4, 
                  borderRadius: 2, 
                  alignSelf: 'center', 
                  marginTop: 12, 
                  marginBottom: 8 
                },
                dragHandleAnimatedStyle
              ]} />

          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            paddingHorizontal: 24, 
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ArrowUpDown size={20} color={colors.text.primary} />
              <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: 'bold' }}>
                Sort & Filter
              </Text>
            </View>
            <ModalCloseButton onPress={onClose} />
          </View>

          {/* Sort Options */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 24 }}
          >
            {availableSortOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <View key={option.id} style={{ marginBottom: 24 }}>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    gap: 8, 
                    marginBottom: 12 
                  }}>
                    <IconComponent size={18} color={colors.text.secondary} />
                    <Text style={{ 
                      color: colors.text.secondary, 
                      fontSize: 14, 
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {option.label}
                    </Text>
                  </View>
                  <View style={{ gap: 8 }}>
                    {option.orders.map((order) => {
                      const OrderIcon = order.icon;
                      const isSelected = sortBy === option.id && sortOrder === order.id;
                      return (
                        <TouchableOpacity
                          key={order.id}
                          onPress={() => handleSortSelect(option.id, order.id)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 16,
                            borderRadius: 12,
                            backgroundColor: isSelected 
                              ? (isDarkMode ? colors.primary[200] : colors.primary[600])
                              : colors.background.input,
                            borderWidth: 1,
                            borderColor: isSelected 
                              ? (isDarkMode ? colors.primary[300] : colors.primary[700])
                              : colors.border.light,
                          }}
                        >
                          <OrderIcon 
                            size={18} 
                            color={isSelected 
                              ? (isDarkMode ? colors.primary[800] : '#FFFFFF')
                              : colors.text.tertiary
                            } 
                          />
                          <Text
                            style={{
                              flex: 1,
                              marginLeft: 12,
                              color: isSelected 
                                ? (isDarkMode ? colors.primary[800] : '#FFFFFF')
                                : colors.text.secondary,
                              fontSize: 15,
                              fontWeight: isSelected ? '600' : '500',
                            }}
                          >
                            {order.label}
                          </Text>
                          {isSelected && (
                            <View style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: isDarkMode ? colors.primary[800] : '#FFFFFF',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: isDarkMode ? '#FFFFFF' : colors.primary[600],
                              }} />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

