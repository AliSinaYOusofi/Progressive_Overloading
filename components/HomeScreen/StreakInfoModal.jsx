import React, { useState, useEffect, useCallback, useMemo } from "react"
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator
} from "react-native"
import { Flame, ChevronDown, Check } from "lucide-react-native"
import { useThemedColors } from '../../hooks/useThemedColors'
import { useTheme } from '../../contexts/ThemeContext'
import { useAppStore } from '../../stores/useAppStore'
import ActivityGraph from './ActivityGraph'
import StreakStatsCards from './StreakStatsCards'
import StreakTips from './StreakTips'
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from "react-native-reanimated"
import { scheduleOnRN } from "react-native-worklets"
import { getAvailableYears, filterStreakDataByYear } from '../../utils/dateUtils'
import { MODAL_LAYOUT } from "../../constants/modal"

const { height: screenHeight } = Dimensions.get('window')

export default function StreakInfoModal({ visible, onClose, userId }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const streakData = useAppStore(state => state.streakAnalytics);
  const loading = useAppStore(state => state.streakAnalyticsLoading);
  const loadStreakAnalytics = useAppStore(state => state.loadStreakAnalytics);
  const user = useAppStore(state => state.user);
  
  // Year selection state
  const [selectedYear, setSelectedYear] = useState(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  
  // Selected date from contribution graph
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [loadingDateData, setLoadingDateData] = useState(false);
  
  // Get user joining date (account creation date)
  const userJoiningDate = useMemo(() => {
    if (!user || !user.created_at) return null;
    const joiningDate = new Date(user.created_at);
    joiningDate.setHours(0, 0, 0, 0);
    return joiningDate;
  }, [user]);
  
  // Load date detail data when a date is selected
  useEffect(() => {
    const loadDateData = async () => {
      if (!selectedDate || !userId) {
        setSelectedDateData(null);
        return;
      }
      
      setLoadingDateData(true);
      try {
        const { getExerciseSetsByDate } = await import('../../lib/database');
        const sets = await getExerciseSetsByDate(userId, selectedDate);
        
        // Group sets by exercise
        const grouped = sets.reduce((acc, set) => {
          const exerciseName = set.exercises?.name || 'Unknown';
          if (!acc[exerciseName]) {
            acc[exerciseName] = [];
          }
          acc[exerciseName].push(set);
          return acc;
        }, {});
        
        const groupedSets = Object.entries(grouped).map(([exerciseName, exerciseSets]) => ({
          exerciseName,
          sets: exerciseSets,
          totalVolume: exerciseSets.reduce((sum, s) => 
            sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0
          ),
          totalSets: exerciseSets.reduce((sum, s) => sum + (s.sets || 1), 0),
        }));
        
        setSelectedDateData({
          date: selectedDate,
          sets: sets,
          groupedSets: groupedSets,
          hasActivity: sets.length > 0
        });
      } catch (error) {
        console.error('Error loading date data:', error);
        setSelectedDateData(null);
      } finally {
        setLoadingDateData(false);
      }
    };
    
    loadDateData();
  }, [selectedDate, userId]);
  
  // Handle date press from ActivityGraph
  const handleDatePress = useCallback((dateKey, date, hasActivity) => {
    setSelectedDate(dateKey);
  }, []);
  
  // Load streak analytics when modal becomes visible
  useEffect(() => {
    if (visible && userId) {
      loadStreakAnalytics(false); // Use cached data if available
    }
  }, [visible, userId, loadStreakAnalytics]);
  
  // Extract available years and set default selected year
  // Always include current year even if no workouts logged yet
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsFromData = streakData && streakData.workoutDates 
      ? getAvailableYears(streakData.workoutDates) 
      : [];
    
    // Always include current year if not already present
    if (!yearsFromData.includes(currentYear)) {
      return [currentYear, ...yearsFromData].sort((a, b) => b - a);
    }
    
    return yearsFromData;
  }, [streakData]);
  
  // Set default year when data loads (current year if available, otherwise most recent)
  // Also reset if selected year is no longer available (e.g., after data refresh)
  useEffect(() => {
    if (availableYears.length > 0) {
      if (selectedYear === null) {
        // Set initial default
        const currentYear = new Date().getFullYear();
        if (availableYears.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(availableYears[0]); // Most recent year
        }
      } else if (!availableYears.includes(selectedYear)) {
        // Selected year no longer available, reset to default
        const currentYear = new Date().getFullYear();
        if (availableYears.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(availableYears[0]); // Most recent year
        }
      }
    }
  }, [availableYears, selectedYear]);
  
  // Reset selected date when year changes
  useEffect(() => {
    setSelectedDate(null);
    setSelectedDateData(null);
  }, [selectedYear]);
  
  // Reset selected date when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedDate(null);
      setSelectedDateData(null);
    }
  }, [visible]);
  
  // Filter streak data by selected year
  const filteredStreakData = useMemo(() => {
    if (!streakData || selectedYear === null) return streakData;
    return filterStreakDataByYear(streakData, selectedYear);
  }, [streakData, selectedYear]);
  
  const refetch = () => {
    loadStreakAnalytics(true); // Force refresh
  };
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
      [colors.neutral[300], colors.primary[400], colors.primary[600]]
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


  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: MODAL_LAYOUT.horizontalMargin, paddingBottom: MODAL_LAYOUT.bottomPadding }}>
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
                  borderRadius: MODAL_LAYOUT.borderRadius,
                  height: screenHeight * 0.85,
                  shadowColor: "#000",
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
              width: 40, 
              height: 4, 
              borderRadius: 2, 
              alignSelf: "center", 
              marginTop: 12, 
              marginBottom: 8 
            },
            dragHandleAnimatedStyle
          ]} />

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: colors.primary[100],
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12
                  }}
                >
                  <Flame size={24} color={colors.primary[600]} />
                </View>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text.primary }}>
                  Your Workout Streak
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={refetch}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.primary[100],
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Text style={{ fontSize: 16, color: colors.primary[600], fontWeight: "500" }}>↻</Text>
                </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isDarkMode ? colors.neutral[200] : colors.neutral[100],
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Text style={{ fontSize: 20, color: colors.neutral[600], fontWeight: "500" }}>×</Text>
              </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Content */}
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Text style={{ marginTop: 12, color: colors.text.secondary }}>Loading your stats...</Text>
            </View>
          ) : (
            <ScrollView 
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
            >
              {/* Year Filter Dropdown */}
              {availableYears.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 12 }}>
                    Year
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowYearDropdown(true)}
                    style={{
                      backgroundColor: colors.background.card,
                      borderWidth: 1,
                      borderColor: showYearDropdown ? colors.primary[600] : colors.border.light,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <Text style={{ 
                      fontSize: 16, 
                      color: colors.text.primary, 
                      fontWeight: "500",
                      flex: 1,
                    }}>
                      {selectedYear || 'Select year'}
                    </Text>
                    <ChevronDown size={20} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Stats Cards */}
              <StreakStatsCards streakData={filteredStreakData || streakData} />

              {/* Date Detail Card - shows when a date is selected */}
              {selectedDate && selectedDateData && (
                <View 
                  style={{ 
                    backgroundColor: colors.background.card,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  {loadingDateData ? (
                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                      <ActivityIndicator size="small" color={colors.primary[600]} />
                      <Text style={{ marginTop: 8, fontSize: 12, color: colors.text.secondary }}>
                        Loading...
                      </Text>
                    </View>
                  ) : (
                    <View>
                      {/* Header */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, marginBottom: 4 }}>
                            {selectedDateData.hasActivity ? 'Workout Summary' : 'No Workout'}
                          </Text>
                          <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setSelectedDate(null)}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: colors.neutral[100],
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Text style={{ fontSize: 18, color: colors.neutral[600], fontWeight: '500' }}>×</Text>
                        </TouchableOpacity>
                      </View>

                      {selectedDateData.hasActivity ? (
                        <>
                          {/* Stats Row */}
                          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                            <View style={{ flex: 1, backgroundColor: colors.primary[50], padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.primary[200] }}>
                              <Text style={{ fontSize: 12, color: colors.text.secondary, marginBottom: 4 }}>Exercises</Text>
                              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.primary[600] }}>
                                {selectedDateData.groupedSets.length}
                              </Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: colors.status.infoLight, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.status.info + '30' }}>
                              <Text style={{ fontSize: 12, color: colors.text.secondary, marginBottom: 4 }}>Total Sets</Text>
                              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.status.info }}>
                                {selectedDateData.sets.reduce((sum, s) => sum + (s.sets || 1), 0)}
                              </Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: colors.status.successLight, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.status.success + '30' }}>
                              <Text style={{ fontSize: 12, color: colors.text.secondary, marginBottom: 4 }}>Volume</Text>
                              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.status.success }}>
                                {selectedDateData.sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0).toLocaleString()}
                              </Text>
                            </View>
                          </View>

                          {/* Exercise List */}
                          <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                            {selectedDateData.groupedSets.map((exerciseGroup, index) => (
                              <View 
                                key={exerciseGroup.exerciseName}
                                style={{
                                  paddingVertical: 12,
                                  borderBottomWidth: index < selectedDateData.groupedSets.length - 1 ? 1 : 0,
                                  borderBottomColor: colors.border.light
                                }}
                              >
                                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary, marginBottom: 6 }}>
                                  {exerciseGroup.exerciseName}
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                  {exerciseGroup.sets.map((set, setIndex) => (
                                    <View 
                                      key={setIndex}
                                      style={{
                                        backgroundColor: colors.background.input,
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: colors.border.light
                                      }}
                                    >
                                      <Text style={{ fontSize: 12, color: colors.text.primary, fontWeight: '500' }}>
                                        {set.weight}{set.unit || 'kg'} × {set.reps} × {set.sets || 1}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </>
                      ) : (
                        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                          <Text style={{ fontSize: 14, color: colors.text.secondary, textAlign: 'center' }}>
                            No workouts logged on this date
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Activity Graph */}
              <View 
                style={{ 
                  backgroundColor: colors.background.primary,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: colors.border.light
                }}
              >
                <ActivityGraph 
                  streakData={filteredStreakData || streakData} 
                  selectedYear={selectedYear}
                  userJoiningDate={userJoiningDate}
                  onDatePress={handleDatePress}
                  selectedDate={selectedDate}
                />
              </View>

              {/* Tips */}
              <StreakTips />
            </ScrollView>
          )}

          {/* Year Dropdown Modal */}
          <Modal
            transparent
            visible={showYearDropdown}
            animationType="fade"
            onRequestClose={() => setShowYearDropdown(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => setShowYearDropdown(false)}
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
            >
              <View style={{ 
                backgroundColor: colors.background.card, 
                borderRadius: 20, 
                width: "100%", 
                maxWidth: 400,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
              }}>
                <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border.light }}>
                  <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: "700" }}>Select Year</Text>
                </View>
                <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                  {availableYears.map((year, index) => {
                    const isSelected = selectedYear === year;
                    return (
                      <TouchableOpacity
                        key={year}
                        onPress={() => {
                          setSelectedYear(year);
                          setShowYearDropdown(false);
                        }}
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 16,
                          borderBottomWidth: index < availableYears.length - 1 ? 1 : 0,
                          borderBottomColor: colors.border.light,
                          backgroundColor: isSelected ? colors.primary[50] : "transparent",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: isSelected
                              ? colors.primary[600] 
                              : colors.text.primary,
                            fontWeight: isSelected ? "600" : "400",
                          }}
                        >
                          {year}
                        </Text>
                        {isSelected && (
                          <Check size={18} color={colors.primary[600]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Footer Button */}
          <View style={{ 
            paddingHorizontal: 24, 
            paddingTop: 12, 
            paddingBottom: 20, 
            borderTopWidth: 1, 
            borderTopColor: colors.border.light, 
            backgroundColor: colors.background.card 
          }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                paddingVertical: 14,
                borderRadius: 12,
                shadowColor: isDarkMode ? colors.primary[200] : colors.primary[600],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4
              }}
            >
              <Text style={{ 
                textAlign: "center", 
                color: colors.text.white, 
                fontWeight: "700",
                fontSize: 16
              }}>
                Keep it going! 🔥
              </Text>
            </TouchableOpacity>
          </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </GestureHandlerRootView>
    </Modal>
  )
}