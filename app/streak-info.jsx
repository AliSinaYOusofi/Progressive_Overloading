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
import { Flame, ChevronDown, Check, ArrowLeft, Dumbbell, Layers, Activity } from "lucide-react-native"
import { useThemedColors } from '../hooks/useThemedColors'
import { useTheme } from '../contexts/ThemeContext'
import { useAppStore } from '../stores/useAppStore'
import ActivityGraph from '../components/HomeScreen/ActivityGraph'
import StreakStatsCards from '../components/HomeScreen/StreakStatsCards'
import StreakTips from '../components/HomeScreen/StreakTips'
import { getAvailableYears, filterStreakDataByYear } from '../utils/dateUtils'
import { formatShortNumber } from '../utils/numberUtils'

export default function StreakInfoScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const streakData = useAppStore(state => state.streakAnalytics);
  const loading = useAppStore(state => state.streakAnalyticsLoading);
  const loadStreakAnalytics = useAppStore(state => state.loadStreakAnalytics);
  const user = useAppStore(state => state.user);
  const userId = user?.id;
  
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
        const { getExerciseSetsByDate } = await import('../lib/database');
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
  
  // Load streak analytics when screen mounts
  useEffect(() => {
    if (userId) {
      loadStreakAnalytics(false); // Use cached data if available
    }
  }, [userId, loadStreakAnalytics]);
  
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
  
  // Filter streak data by selected year
  const filteredStreakData = useMemo(() => {
    if (!streakData || selectedYear === null) return streakData;
    return filterStreakDataByYear(streakData, selectedYear);
  }, [streakData, selectedYear]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Header */}
      <View 
        style={{ 
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
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 8,
            marginRight: 12,
          }}
        >
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>
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
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text.primary }}>
            Your Workout Streak
          </Text>
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
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
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
                  padding: 20,
                  marginBottom: 20,
                  marginTop: 20,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                {loadingDateData ? (
                  <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                    <ActivityIndicator size="small" color={colors.primary[600]} />
                    <Text style={{ marginTop: 12, fontSize: 14, color: colors.text.secondary }}>
                      Loading workout details...
                    </Text>
                  </View>
                ) : (
                  <View>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text.primary, marginBottom: 6 }}>
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
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: colors.text.tertiary,
                                  fontWeight: '600',
                                  marginLeft: 6,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                }}
                              >
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
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: colors.text.tertiary,
                                  fontWeight: '600',
                                  marginLeft: 6,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                }}
                              >
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
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: colors.text.tertiary,
                                  fontWeight: '600',
                                  marginLeft: 6,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                }}
                              >
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
                            fontSize: 16, 
                            fontWeight: '700', 
                            color: colors.text.primary, 
                            marginBottom: 16 
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
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: colors.background.input,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    borderWidth: 1,
                                    borderColor: colors.border.light
                                  }}>
                                    <Text style={{ 
                                      fontSize: 14, 
                                      fontWeight: '700', 
                                      color: colors.text.primary 
                                    }}>
                                      {index + 1}
                                    </Text>
                                  </View>
                                  <View style={{ flex: 1 }}>
                                    <Text style={{ 
                                      fontSize: 16, 
                                      fontWeight: '700', 
                                      color: colors.text.primary,
                                      marginBottom: 2
                                    }}>
                                      {exerciseGroup.exerciseName}
                                    </Text>
                                    <Text style={{ 
                                      fontSize: 12, 
                                      color: colors.text.secondary 
                                    }}>
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
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        backgroundColor: colors.neutral[100],
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12
                                      }}>
                                        <Text style={{ 
                                          fontSize: 11, 
                                          fontWeight: '600', 
                                          color: colors.text.secondary 
                                        }}>
                                          {setIndex + 1}
                                        </Text>
                                      </View>
                                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <View style={{ flex: 1 }}>
                                          <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 2 }}>
                                            Weight
                                          </Text>
                                          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary }}>
                                            {set.weight}{set.unit || 'kg'}
                                          </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                          <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 2 }}>
                                            Reps
                                          </Text>
                                          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text.primary }}>
                                            {set.reps}
                                          </Text>
                                        </View>
                                        {set.sets && set.sets > 1 && (
                                          <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 11, color: colors.text.tertiary, marginBottom: 2 }}>
                                              Sets
                                            </Text>
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
                      <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                        <Text style={{ fontSize: 15, color: colors.text.secondary, textAlign: 'center' }}>
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
      </View>
  )
}
