import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform
} from "react-native"
import { useRouter } from "expo-router"
import { Flame, ChevronDown, Check, ArrowLeft, Dumbbell, Layers, Activity, AlertCircle, RefreshCw } from "lucide-react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useThemedColors } from '../../hooks/useThemedColors'
import { useTheme } from '../../contexts/ThemeContext'
import { useAppStore } from '../../stores/useAppStore'
import ActivityGraph from '../../components/HomeScreen/ActivityGraph'
import StreakStatsCards from '../../components/HomeScreen/StreakStatsCards'
import StreakTips from '../../components/HomeScreen/StreakTips'
import AnimatedSlideIn from '../../components/AnimatedSlideIn'
import { getAvailableYears, filterStreakDataByYear } from '../../utils/dateUtils'
import { formatShortNumber } from '../../utils/numberUtils'

export default function StreakInfoScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const streakData = useAppStore(state => state.streakAnalytics);
  const loading = useAppStore(state => state.streakAnalyticsLoading);
  const loadStreakAnalytics = useAppStore(state => state.loadStreakAnalytics);
  const user = useAppStore(state => state.user);
  const userId = user?.id;
  const [focusTrigger, setFocusTrigger] = useState(0);

  // Year selection state
  const [selectedYear, setSelectedYear] = useState(null);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Selected date from contribution graph
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateData, setSelectedDateData] = useState(null);
  const [loadingDateData, setLoadingDateData] = useState(false);
  const [dateDataError, setDateDataError] = useState(null);

  // Trigger animations on focus
  useEffect(() => {
    setFocusTrigger(t => t + 1);
  }, []);

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
      setDateDataError(null);
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
        setDateDataError('Unable to load workout details. Please try again.');
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

  // Load streak analytics when screen mounts
  useEffect(() => {
    if (userId) {
      loadStreakAnalytics(true); // Always fetch fresh data for accurate streak stats
    }
  }, [userId, loadStreakAnalytics]);

  // Extract available years and set default selected year
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearsFromData = streakData && streakData.workoutDates
      ? getAvailableYears(streakData.workoutDates)
      : [];

    if (!yearsFromData.includes(currentYear)) {
      return [currentYear, ...yearsFromData].sort((a, b) => b - a);
    }

    return yearsFromData;
  }, [streakData]);

  // Set default year when data loads
  useEffect(() => {
    if (availableYears.length > 0) {
      if (selectedYear === null) {
        const currentYear = new Date().getFullYear();
        if (availableYears.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(availableYears[0]);
        }
      } else if (!availableYears.includes(selectedYear)) {
        const currentYear = new Date().getFullYear();
        if (availableYears.includes(currentYear)) {
          setSelectedYear(currentYear);
        } else {
          setSelectedYear(availableYears[0]);
        }
      }
    }
  }, [availableYears, selectedYear]);

  // Reset selected date when year changes
  useEffect(() => {
    setSelectedDate(null);
    setSelectedDateData(null);
  }, [selectedYear]);

  // Filter streak data by selected year
  const filteredStreakData = useMemo(() => {
    if (!streakData || selectedYear === null) return streakData;
    return filterStreakDataByYear(streakData, selectedYear);
  }, [streakData, selectedYear]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Hero Header with Gradient */}
      <AnimatedSlideIn index={0} trigger={focusTrigger}>
        <LinearGradient
          colors={isDarkMode
            ? [colors.primary[50], colors.background.primary]
            : [colors.primary[100], colors.primary[50], colors.background.primary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={{
            paddingHorizontal: 24,
            paddingTop: Platform.OS === "ios" ? 64 : 44,
            paddingBottom: 28,
          }}
        >
          <TouchableOpacity
            style={{ padding: 8, alignSelf: "flex-start", marginBottom: 16 }}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={{
            width: 56, height: 56, borderRadius: 16,
            backgroundColor: colors.primary[600] + "20",
            alignItems: "center", justifyContent: "center",
            marginBottom: 16,
          }}>
            <Flame size={28} color={colors.primary[600]} />
          </View>

          <Text style={{
            fontSize: 28, fontWeight: "800",
            color: colors.text.primary, letterSpacing: -0.5,
            marginBottom: 6,
          }}>
            Your Workout Streak
          </Text>
          <Text style={{
            fontSize: 15, color: colors.text.secondary,
            fontWeight: "500", lineHeight: 20,
          }}>
            Track your consistency and build momentum
          </Text>
        </LinearGradient>
      </AnimatedSlideIn>

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
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
        >
          {/* Year Filter */}
          {availableYears.length > 0 && (
            <AnimatedSlideIn index={1} trigger={focusTrigger}>
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 13, fontWeight: "600", color: colors.text.secondary,
                  marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5,
                }}>
                  Year
                </Text>
                <TouchableOpacity
                  onPress={() => setShowYearDropdown(true)}
                  style={{
                    backgroundColor: colors.background.input,
                    borderWidth: 1.5,
                    borderColor: colors.border.light,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: Platform.OS === "ios" ? 14 : 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
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
                  <ChevronDown size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </AnimatedSlideIn>
          )}

          {/* Stats Cards */}
          <AnimatedSlideIn index={2} trigger={focusTrigger}>
            <StreakStatsCards streakData={filteredStreakData || streakData} />
          </AnimatedSlideIn>

          {/* Date Detail Card */}
          {selectedDate && (
            <AnimatedSlideIn index={3} trigger={focusTrigger}>
              <View style={{
                backgroundColor: colors.background.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: dateDataError ? colors.status.error + '40' : colors.border.light,
                shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 8,
                elevation: 2,
              }}>
                {/* Card Header — always visible */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: loadingDateData ? 0 : 20 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 6 }}>
                      {loadingDateData
                        ? 'Loading...'
                        : dateDataError
                          ? 'Something went wrong'
                          : selectedDateData?.hasActivity
                            ? 'Workout Summary'
                            : 'No Workout'}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text.secondary }}>
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => { setSelectedDate(null); setDateDataError(null); }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.background.input,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 12
                    }}
                  >
                    <Text style={{ fontSize: 20, color: colors.text.secondary, fontWeight: '500' }}>×</Text>
                  </TouchableOpacity>
                </View>

                {/* Loading State */}
                {loadingDateData && (
                  <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                    <View style={{
                      width: 48, height: 48, borderRadius: 24,
                      backgroundColor: colors.primary[600] + '12',
                      alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <ActivityIndicator size="small" color={colors.primary[600]} />
                    </View>
                    <Text style={{ fontSize: 14, color: colors.text.secondary, fontWeight: '500' }}>
                      Fetching workout details...
                    </Text>
                  </View>
                )}

                {/* Error State */}
                {!loadingDateData && dateDataError && (
                  <View style={{ alignItems: 'center', paddingVertical: 28 }}>
                    <View style={{
                      width: 52, height: 52, borderRadius: 26,
                      backgroundColor: colors.status.error + '12',
                      alignItems: 'center', justifyContent: 'center',
                      marginBottom: 14,
                    }}>
                      <AlertCircle size={24} color={colors.status.error} />
                    </View>
                    <Text style={{
                      fontSize: 15, color: colors.text.primary, fontWeight: '600',
                      textAlign: 'center', marginBottom: 6,
                    }}>
                      {dateDataError}
                    </Text>
                    <Text style={{
                      fontSize: 13, color: colors.text.tertiary,
                      textAlign: 'center', marginBottom: 18, lineHeight: 18,
                    }}>
                      Check your connection and try again
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setDateDataError(null);
                        setSelectedDateData(null);
                        // Re-trigger fetch by toggling selectedDate
                        const date = selectedDate;
                        setSelectedDate(null);
                        setTimeout(() => setSelectedDate(date), 50);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.primary[600] + '12',
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 10,
                        gap: 8,
                      }}
                    >
                      <RefreshCw size={16} color={colors.primary[600]} />
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary[600] }}>
                        Retry
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Data Loaded State */}
                {!loadingDateData && !dateDataError && selectedDateData && (
                  <View>
                    {selectedDateData.hasActivity ? (
                      <>
                        {/* Stats Row */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
                          {/* Exercises Card */}
                          <View style={{
                            flex: 1,
                            minWidth: '47%',
                            backgroundColor: colors.background.primary,
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border.light
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                              <Activity size={18} color={colors.text.secondary} />
                              <Text style={{
                                fontSize: 12, color: colors.text.tertiary, fontWeight: '600',
                                marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5,
                              }}>
                                Exercises
                              </Text>
                            </View>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 2 }}>
                              {selectedDateData.groupedSets.length}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                              {selectedDateData.groupedSets.length === 1 ? 'exercise' : 'exercises'}
                            </Text>
                          </View>

                          {/* Total Sets Card */}
                          <View style={{
                            flex: 1,
                            minWidth: '47%',
                            backgroundColor: colors.background.primary,
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border.light
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                              <Layers size={18} color={colors.text.secondary} />
                              <Text style={{
                                fontSize: 12, color: colors.text.tertiary, fontWeight: '600',
                                marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5,
                              }}>
                                Total Sets
                              </Text>
                            </View>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 2 }}>
                              {selectedDateData.sets.reduce((sum, s) => sum + (s.sets || 1), 0)}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.text.secondary }}>sets</Text>
                          </View>

                          {/* Volume Card */}
                          <View style={{
                            flex: 1,
                            minWidth: '47%',
                            backgroundColor: colors.background.primary,
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: colors.border.light
                          }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                              <Dumbbell size={18} color={colors.text.secondary} />
                              <Text style={{
                                fontSize: 12, color: colors.text.tertiary, fontWeight: '600',
                                marginLeft: 6, textTransform: 'uppercase', letterSpacing: 0.5,
                              }}>
                                Total Volume
                              </Text>
                            </View>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 2 }}>
                              {formatShortNumber(selectedDateData.sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0))}
                            </Text>
                            <Text style={{ fontSize: 12, color: colors.text.secondary }}>kg</Text>
                          </View>
                        </View>

                        {/* Exercise List Section */}
                        <View style={{
                          paddingTop: 20,
                          borderTopWidth: 1,
                          borderTopColor: colors.border.light
                        }}>
                          <Text style={{
                            fontSize: 16, fontWeight: '700',
                            color: colors.text.primary, marginBottom: 16
                          }}>
                            Exercises
                          </Text>
                          <ScrollView style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
                            {selectedDateData.groupedSets.map((exerciseGroup, index) => (
                              <View
                                key={exerciseGroup.exerciseName}
                                style={{
                                  backgroundColor: colors.background.primary,
                                  borderRadius: 12,
                                  padding: 16,
                                  marginBottom: 12,
                                  borderWidth: 1,
                                  borderColor: colors.border.light
                                }}
                              >
                                {/* Exercise Header */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                  <View style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    backgroundColor: colors.primary[600] + "15",
                                    alignItems: 'center', justifyContent: 'center',
                                    marginRight: 12,
                                  }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary[600] }}>
                                      {index + 1}
                                    </Text>
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, marginBottom: 2 }}>
                                      {exerciseGroup.exerciseName}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>
                                      {exerciseGroup.totalSets} {exerciseGroup.totalSets === 1 ? 'set' : 'sets'} • {formatShortNumber(exerciseGroup.sets.reduce((sum, s) => sum + (s.reps || 0) * (s.sets || 1), 0))} {exerciseGroup.sets.reduce((sum, s) => sum + (s.reps || 0) * (s.sets || 1), 0) === 1 ? 'rep' : 'reps'}
                                    </Text>
                                  </View>
                                </View>

                                {/* Sets List */}
                                <View style={{ gap: 8 }}>
                                  {exerciseGroup.sets.map((set, setIndex) => (
                                    <View
                                      key={setIndex}
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: colors.background.card,
                                        padding: 12,
                                        borderRadius: 8,
                                        borderWidth: 1,
                                        borderColor: colors.border.light
                                      }}
                                    >
                                      <View style={{
                                        width: 24, height: 24, borderRadius: 12,
                                        backgroundColor: colors.neutral[100],
                                        alignItems: 'center', justifyContent: 'center',
                                        marginRight: 12
                                      }}>
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.text.secondary }}>
                                          {setIndex + 1}
                                        </Text>
                                      </View>
                                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={{ flex: 1 }}>
                                          <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 2 }}>Weight</Text>
                                          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary }}>
                                            {set.weight}{set.unit || 'kg'}
                                          </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                          <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 2 }}>Reps</Text>
                                          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary }}>
                                            {set.reps}
                                          </Text>
                                        </View>
                                        {set.sets && set.sets > 1 && (
                                          <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 2 }}>Sets</Text>
                                            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary }}>
                                              {set.sets}
                                            </Text>
                                          </View>
                                        )}
                                      </View>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            ))}
                          </ScrollView>
                        </View>
                      </>
                    ) : (
                      <View style={{ paddingVertical: 28, alignItems: 'center' }}>
                        <View style={{
                          width: 48, height: 48, borderRadius: 24,
                          backgroundColor: colors.neutral[200] + '40',
                          alignItems: 'center', justifyContent: 'center',
                          marginBottom: 14,
                        }}>
                          <Dumbbell size={22} color={colors.text.tertiary} />
                        </View>
                        <Text style={{
                          fontSize: 15, fontWeight: '600', color: colors.text.primary,
                          textAlign: 'center', marginBottom: 4,
                        }}>
                          Rest Day
                        </Text>
                        <Text style={{
                          fontSize: 13, color: colors.text.tertiary,
                          textAlign: 'center',
                        }}>
                          No workouts logged on this date
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </AnimatedSlideIn>
          )}

          {/* Activity Graph Card */}
          <AnimatedSlideIn index={4} trigger={focusTrigger}>
            <View style={{
              backgroundColor: colors.background.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: colors.border.light,
              shadowColor: colors.shadow?.light || "rgba(0,0,0,0.05)",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 2,
            }}>
              <ActivityGraph
                streakData={filteredStreakData || streakData}
                selectedYear={selectedYear}
                userJoiningDate={userJoiningDate}
                onDatePress={handleDatePress}
                selectedDate={selectedDate}
              />
            </View>
          </AnimatedSlideIn>

          {/* Tips */}
          <AnimatedSlideIn index={5} trigger={focusTrigger}>
            <StreakTips />
          </AnimatedSlideIn>
        </ScrollView>
      )}

      {/* Year Dropdown Modal - Bottom Sheet */}
      <Modal
        transparent
        visible={showYearDropdown}
        animationType="slide"
        onRequestClose={() => setShowYearDropdown(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowYearDropdown(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
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
              <Text style={{ color: colors.text.primary, fontSize: 20, fontWeight: '700' }}>Select Year</Text>
            </View>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {availableYears.map((year) => {
                const isSelected = selectedYear === year;
                return (
                  <TouchableOpacity
                    key={year}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border.light,
                      backgroundColor: isSelected ? colors.primary[600] + "08" : "transparent",
                    }}
                  >
                    <Text style={{
                      fontSize: 17,
                      color: isSelected ? colors.primary[600] : colors.text.primary,
                      fontWeight: isSelected ? "700" : "400",
                    }}>
                      {year}
                    </Text>
                    {isSelected && (
                      <Check size={20} color={colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}
