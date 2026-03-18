import React, { useEffect, useCallback, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { Dumbbell, Clock, Repeat, Layers, Calendar } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import ModalCloseButton from "../ModalCloseButton";
import LoadMoreButton from "../HomeScreen/LoadMoreButton";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { formatShortNumber } from "../../utils/numberUtils";
import WeeklyDayDetailModal from "./WeeklyDayDetailModal";
import { useAppStore } from "../../stores/useAppStore";
import { MODAL_LAYOUT } from "../../constants/modal";

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 10;

/**
 * Format muscle group name for display
 * @param {string} muscleGroup - Muscle group name (e.g., "abdominals")
 * @returns {string} Formatted name (e.g., "Abdominals")
 */
const formatMuscleGroupName = (muscleGroup) => {
  if (!muscleGroup) return "";
  return muscleGroup
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


export default function MuscleGroupExerciseModal({ visible, onClose, muscleGroup, exercises = [], stats = {}, timeframe = 30 }) {
  const colors = useThemedColors();
  const screenHeight = Dimensions.get("window").height;
  const translateY = useSharedValue(0);
  const SWIPE_THRESHOLD = screenHeight * 0.2;
  const [displayLimit, setDisplayLimit] = useState(INITIAL_DISPLAY_COUNT);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  
  // Use Zustand store for muscle group exercise data
  const user = useAppStore(state => state.user);
  const loadMuscleGroupExerciseData = useAppStore(state => state.loadMuscleGroupExerciseData);
  
  // Get cached data for this muscle group and timeframe
  const muscleGroupData = useAppStore(state => {
    if (!muscleGroup || !timeframe) return null;
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `muscleGroup_${muscleGroup.toLowerCase()}_${timeframeValue}`;
    return state.muscleGroupExerciseData[cacheKey] || null;
  });
  
  // Extract sets and groupedSets from cached data
  const sets = muscleGroupData?.sets || [];
  const groupedSets = muscleGroupData?.groupedSets || [];
  const isLoading = !muscleGroupData && user !== null;

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
      [colors.border.light, colors.text.tertiary, colors.text.secondary]
    );
    return {
      backgroundColor,
    };
  });

  // Reset translateY and display limit when modal becomes visible
  useEffect(() => {
    if (visible) {
      translateY.value = 0;
      setDisplayLimit(INITIAL_DISPLAY_COUNT);
    }
  }, [visible, translateY]);

  // Load muscle group exercise data when modal opens (only if not cached)
  useEffect(() => {
    const loadData = async () => {
      if (!visible || !muscleGroup || !user) return;
      
      try {
        await loadMuscleGroupExerciseData(muscleGroup, timeframe, false);
      } catch (error) {
        console.error('Error loading muscle group exercise data:', error);
      }
    };

    loadData();
  }, [visible, muscleGroup, user, timeframe, loadMuscleGroupExerciseData]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    if (dateOnly.getTime() === today.getTime()) {
      return 'Today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateOnly.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  };

  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
  };

  const renderEmptyState = () => {
    return (
      <View style={{ 
        alignItems: "center", 
        justifyContent: "center", 
        paddingVertical: 60 
      }}>
        <Dumbbell size={48} color={colors.text.tertiary} />
        <Text style={{ 
          fontSize: 16, 
          color: colors.text.secondary,
          marginTop: 16,
          textAlign: 'center',
        }}>
          No sets found
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: colors.text.tertiary,
          marginTop: 8,
          textAlign: 'center',
        }}>
          No sets have been logged for this muscle group
        </Text>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
          <TouchableOpacity activeOpacity={1} onPress={onClose} style={{ flex: 1 }} />
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[
              { 
                backgroundColor: colors.background.card, 
                borderRadius: MODAL_LAYOUT.borderRadius,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 10,
                maxHeight: "90%",
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

              {/* Header */}
              <View style={{ 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "space-between", 
                paddingHorizontal: 24, 
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border.light,
              }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1, marginRight: 12 }}>
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: colors.border.light,
                  }}>
                    <Dumbbell size={20} color={colors.text.tertiary} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }} numberOfLines={1}>
                      {formatMuscleGroupName(muscleGroup)}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text.secondary, marginTop: 2 }} numberOfLines={1}>
                      {groupedSets.length} {groupedSets.length === 1 ? 'day' : 'days'} • {groupedSets.reduce((sum, day) => sum + day.exercises.length, 0)} {groupedSets.reduce((sum, day) => sum + day.exercises.length, 0) === 1 ? 'exercise' : 'exercises'}
                    </Text>
                  </View>
                </View>
                <View style={{ marginLeft: 8 }}>
                  <ModalCloseButton onPress={onClose} />
                </View>
              </View>

              {/* Stats Bar */}
              {stats && (stats.volume || stats.sets) && (
                <View style={{
                  flexDirection: 'row',
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  backgroundColor: colors.background.primary,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border.light,
                  gap: 16,
                }}>
                  {stats.volume > 0 && (
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                        Total Volume
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                        {formatShortNumber(stats.volume)} kg
                      </Text>
                    </View>
                  )}
                  {stats.sets > 0 && (
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: colors.text.tertiary }}>
                        Total Sets
                      </Text>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary }}>
                        {stats.sets}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Sets List */}
              <ScrollView 
                style={{ backgroundColor: colors.background.card }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
              >
                {isLoading ? (
                  <View style={{ 
                    alignItems: "center", 
                    justifyContent: "center", 
                    paddingVertical: 60 
                  }}>
                    <ActivityIndicator size="large" color={colors.text.tertiary} />
                  </View>
                ) : groupedSets.length > 0 ? (
                  <View>
                    {groupedSets.slice(0, displayLimit).map((dayGroup, dayIndex) => (
                      <TouchableOpacity
                        key={dayGroup.dateKey}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSelectedDayDate(dayGroup.date);
                          setShowDayDetailModal(true);
                        }}
                        style={{
                          backgroundColor: colors.background.card,
                          borderRadius: 12,
                          padding: 16,
                          marginBottom: 20,
                          borderWidth: 1,
                          borderColor: colors.border.light,
                        }}
                      >
                        {/* Date Header */}
                        <View style={{ 
                          flexDirection: "row", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          marginBottom: 16,
                          paddingBottom: 14,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border.light,
                        }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                            <View style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 1,
                              borderColor: colors.border.light,
                              backgroundColor: colors.background.primary,
                            }}>
                              <Calendar size={20} color={colors.text.tertiary} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ 
                                fontSize: 18, 
                                fontWeight: "800", 
                                color: colors.text.primary,
                                marginBottom: 2,
                              }}>
                                {formatDate(dayGroup.date)}
                              </Text>
                              <Text style={{ 
                                fontSize: 12, 
                                color: colors.text.tertiary,
                                fontWeight: "500",
                              }}>
                                {dayGroup.exercises.length} {dayGroup.exercises.length === 1 ? 'exercise' : 'exercises'} • {dayGroup.totalSets} {dayGroup.totalSets === 1 ? 'set' : 'sets'}
                              </Text>
                            </View>
                          </View>
                          <View style={{ 
                            alignItems: "flex-end",
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border.light,
                            backgroundColor: colors.background.primary,
                          }}>
                            <Text style={{ 
                              fontSize: 18, 
                              fontWeight: "800", 
                              color: colors.text.primary,
                              lineHeight: 22,
                            }}>
                              {formatShortNumber(dayGroup.totalVolume)}
                            </Text>
                            <Text style={{ 
                              fontSize: 11, 
                              color: colors.text.tertiary,
                              fontWeight: "600",
                              marginTop: 2,
                            }}>
                              kg total
                            </Text>
                          </View>
                        </View>

                        {/* Exercises List */}
                        <View style={{ gap: 12 }}>
                          {dayGroup.exercises.map((exerciseGroup, exerciseIndex) => (
                            <View
                              key={`${dayGroup.dateKey}_${exerciseGroup.exerciseName}`}
                              style={{
                                backgroundColor: colors.background.neutral,
                                borderRadius: 12,
                                padding: 14,
                                borderWidth: 1,
                                borderColor: colors.border.light,
                              }}
                            >
                              {/* Exercise Header */}
                              <View style={{ 
                                flexDirection: "row", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                marginBottom: 12,
                              }}>
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                                  <View style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 8,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: 1,
                                    borderColor: colors.border.light,
                                  }}>
                                    <Dumbbell size={16} color={colors.text.tertiary} />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ 
                                      fontSize: 16, 
                                      fontWeight: "700", 
                                      color: colors.text.primary,
                                    }}>
                                      {exerciseGroup.exerciseName}
                                    </Text>
                                    <Text style={{ 
                                      fontSize: 11, 
                                      color: colors.text.tertiary,
                                      fontWeight: "500",
                                      marginTop: 2,
                                    }}>
                                      {exerciseGroup.totalSets} {exerciseGroup.totalSets === 1 ? 'set' : 'sets'}
                                    </Text>
                                  </View>
                                </View>
                                <View style={{ alignItems: "flex-end" }}>
                                  <Text style={{ 
                                    fontSize: 16, 
                                    fontWeight: "700", 
                                    color: colors.text.primary,
                                  }}>
                                    {formatShortNumber(exerciseGroup.totalVolume)}
                                  </Text>
                                  <Text style={{ 
                                    fontSize: 10, 
                                    color: colors.text.tertiary,
                                    marginTop: 2,
                                  }}>
                                    kg
                                  </Text>
                                </View>
                              </View>

                              {/* Distinct Sets List */}
                              <View style={{ gap: 8, marginTop: 8 }}>
                                {exerciseGroup.sets.map((set, setIndex) => {
                                  const setVolume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
                                  
                                  return (
                                    <View
                                      key={set.id || `${dayGroup.dateKey}_${exerciseGroup.exerciseName}_${setIndex}`}
                                      style={{
                                        backgroundColor: colors.background.card,
                                        borderRadius: 8,
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: colors.border.light,
                                      }}
                                    >
                                      <View style={{ 
                                        flexDirection: "row", 
                                        alignItems: "center", 
                                        justifyContent: "space-between",
                                        marginBottom: 8,
                                      }}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                            <Layers size={14} color={colors.text.tertiary} />
                                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                              {set.sets || 1}
                                            </Text>
                                          </View>
                                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                            <Repeat size={14} color={colors.text.tertiary} />
                                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                              {set.reps || 0}
                                            </Text>
                                          </View>
                                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                            <Dumbbell size={14} color={colors.text.tertiary} />
                                            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text.primary }}>
                                              {set.weight || 0} kg
                                            </Text>
                                          </View>
                                        </View>
                                        <View style={{ alignItems: "flex-end" }}>
                                          <Text style={{ 
                                            fontSize: 14, 
                                            fontWeight: "700", 
                                            color: colors.text.primary,
                                          }}>
                                            {formatShortNumber(setVolume)} kg
                                          </Text>
                                        </View>
                                      </View>
                                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                        <Clock size={12} color={colors.text.tertiary} />
                                        <Text style={{ 
                                          fontSize: 10, 
                                          color: colors.text.tertiary,
                                          fontWeight: "500",
                                        }}>
                                          {formatTime(set.performed_at)}
                                        </Text>
                                      </View>
                                    </View>
                                  );
                                })}
                              </View>
                            </View>
                          ))}
                        </View>
                      </TouchableOpacity>
                    ))}
                    {groupedSets.length > displayLimit && (
                      <LoadMoreButton
                        remaining={groupedSets.length - displayLimit}
                        onLoadMore={() => setDisplayLimit(prev => Math.min(prev + LOAD_MORE_COUNT, groupedSets.length))}
                        fullWidth={true}
                      />
                    )}
                  </View>
                ) : (
                  renderEmptyState()
                )}
              </ScrollView>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
      
      {/* Day Detail Modal - Reuses WeeklyDayDetailModal with caching */}
      {selectedDayDate && (
        <WeeklyDayDetailModal
          visible={showDayDetailModal}
          onClose={() => {
            setShowDayDetailModal(false);
            setSelectedDayDate(null);
          }}
          dayDate={selectedDayDate}
          userId={user?.id}
        />
      )}
    </Modal>
  );
}

