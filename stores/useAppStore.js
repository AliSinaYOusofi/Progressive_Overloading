import { create } from 'zustand';
import {
  getCurrentUser,
  getProfile,
  getCurrentStreak,
  getFitnessGoals,
  getExerciseProgressRows,
  getExerciseSetsByUser,
  getExerciseSetsByDate,
  getExerciseSetsByMuscleGroup,
  getUserStats,
  getExerciseProgressionData,
  getVolumeProgressionData,
  getStrengthStandards,
  getMonthlyStats,
  getPersonalRecords,
  getWeeklyProgress,
  getRPEAnalysis,
  getProgressiveOverloadInsights,
  getMuscleGroupHeatmapData,
  getGoalAnalytics,
  getStreakAnalytics,
} from '../lib/database';

const DASHBOARD_TIMEFRAME = 30;

/**
 * Zustand store for managing homescreen data
 * Provides centralized state management for user, goals, sets, and progress
 */
export const useAppStore = create((set, get) => ({
  // State
  user: null,
  profile: null,
  currentStreak: 0,
  fitnessGoals: [],
  progressByExercise: [],
  recentSets: [],
  
  // Loading states
  isLoading: true,
  isRefreshing: false,
  
  // Charts data state - store data per timeframe using nested structures
  chartsData: {
    userStats: null, // No timeframe filtering
    exerciseProgression: {}, // { [timeframeValue]: data }
    volumeProgression: {}, // { [timeframeValue]: data }
    strengthStandards: [], // No timeframe filtering (used in index)
    monthlyStats: {}, // { [timeframeValue]: data }
    personalRecords: {}, // { [timeframeValue]: data }
    weeklyProgress: {}, // { [timeframeValue]: data }
    rpeAnalysis: {}, // { [timeframeValue]: data }
    progressiveOverloadInsights: {}, // { [timeframeValue]: data }
    muscleGroupHeatmap: {}, // { [timeframeValue]: data }
    goalAnalytics: {}, // { [timeframeValue]: data }
  },
  
  // Charts loading states
  chartsLoading: false,
  chartsRefreshing: false,
  chartsError: null, // Error message for charts loading
  
  // Charts cache with timestamps (key format: chartType_timeframe)
  chartsCache: {},
  
  // Day detail data cache - stores sets by date
  dayDetailData: {}, // { [dateKey]: { sets: [], groupedSets: [], timestamp: number } }
  
  // Day detail cache with timestamps (key format: dayDetail_dateKey)
  dayDetailCache: {},
  
  // Muscle group exercise data cache - stores sets by muscle group and timeframe
  muscleGroupExerciseData: {}, // { [cacheKey]: { sets: [], groupedSets: [], timestamp: number } }
  
  // Muscle group exercise cache with timestamps (key format: muscleGroup_${muscleGroup}_${timeframe})
  muscleGroupExerciseCache: {},
  
  // Streak analytics data and cache
  streakAnalytics: null, // { currentStreak, longestStreak, totalWorkoutDays, thisWeekWorkouts, activityMap, workoutDates }
  streakAnalyticsCache: null, // timestamp
  streakAnalyticsLoading: false,
  streakAnalyticsError: null,
  
  // Cache duration (5 minutes)
  cacheDuration: 5 * 60 * 1000,
  
  // Helper to get date key from date object/string
  getDateKey: (date) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // "YYYY-MM-DD"
  },
  
  // Actions for goals
  addFitnessGoal: (goal) => {
    set((state) => {
      // Check if goal already exists to avoid duplicates
      const exists = state.fitnessGoals.find(g => String(g.id) === String(goal.id));
      if (exists) {
        return {
          fitnessGoals: state.fitnessGoals.map(g => 
            String(g.id) === String(goal.id) ? goal : g
          ),
        };
      }
      return {
        fitnessGoals: [...state.fitnessGoals, goal],
      };
    });
  },
  
  updateFitnessGoal: (goalId, updates) => {
    set((state) => ({
      fitnessGoals: state.fitnessGoals.map((g) =>
        String(g.id) === String(goalId) ? { ...g, ...updates } : g
      ),
    }));
    // Invalidate goal analytics cache when goal is updated (e.g., marked as completed)
    get().invalidateChartsCache();
  },
  
  removeFitnessGoal: (goalId) => {
    set((state) => ({
      fitnessGoals: state.fitnessGoals.filter((g) => String(g.id) !== String(goalId)),
    }));
    // Invalidate goal analytics cache when goal is deleted
    get().invalidateChartsCache();
  },
  
  setFitnessGoals: (goals) => {
    set({ fitnessGoals: goals || [] });
  },
  
  // Actions for sets
  addExerciseSet: (exerciseSet) => {
    set((state) => {
      // Check if set already exists to avoid duplicates
      const exists = state.recentSets.find(s => String(s.id) === String(exerciseSet.id));
      if (exists) {
        return {
          recentSets: state.recentSets.map(s => 
            String(s.id) === String(exerciseSet.id) ? exerciseSet : s
          ),
        };
      }
      // Invalidate streak analytics cache when new set is added
      state.invalidateStreakAnalyticsCache();
      // Add to beginning of array (most recent first)
      return {
        recentSets: [exerciseSet, ...state.recentSets],
      };
    });
    
    // Invalidate charts cache when new set is added
    get().invalidateChartsCache();
    
    // Invalidate day detail cache for the set's date
    if (exerciseSet.performed_at) {
      const dateKey = get().getDateKey(exerciseSet.performed_at);
      get().invalidateDayDetailCache(dateKey);
    }
    
    // Invalidate muscle group exercise cache (invalidate all since we don't know which muscle groups are affected)
    get().invalidateMuscleGroupExerciseCache();
    
    // Invalidate goal analytics cache when goals change
    get().invalidateChartsCache();
  },
  
  setRecentSets: (sets) => {
    set({ recentSets: sets || [] });
  },
  
  // Actions for progress
  setProgressByExercise: (progress) => {
    set({ progressByExercise: progress || [] });
  },
  
  // Fetch functions
  loadRecentSets: async (userId) => {
    try {
      const sets = await getExerciseSetsByUser(userId, 500, DASHBOARD_TIMEFRAME);
      set({ recentSets: sets || [] });
      return sets;
    } catch (error) {
      console.error('Error loading recent sets:', error);
      return [];
    }
  },

  loadProgressFromSets: async (userId) => {
    try {
      const rows = await getExerciseProgressRows(userId, 1000, DASHBOARD_TIMEFRAME);
      set({ progressByExercise: rows || [] });
      return rows;
    } catch (error) {
      console.error('Error loading progress from sets:', error);
      return [];
    }
  },
  
  refreshRecentSets: async () => {
    const state = get();
    if (!state.user) return;
    const result = await state.loadRecentSets(state.user.id);
    // Invalidate charts cache after refresh
    state.invalidateChartsCache();
    // Invalidate all day detail caches since sets may have changed
    state.invalidateDayDetailCache();
    // Invalidate all muscle group exercise caches since sets may have changed
    state.invalidateMuscleGroupExerciseCache();
    // Invalidate streak analytics cache since sets may have changed
    state.invalidateStreakAnalyticsCache();
    return result;
  },
  
  refreshProgress: async () => {
    const state = get();
    if (!state.user) return;
    const result = await state.loadProgressFromSets(state.user.id);
    // Invalidate charts cache after refresh
    state.invalidateChartsCache();
    // Invalidate all day detail caches since sets may have changed
    state.invalidateDayDetailCache();
    // Invalidate all muscle group exercise caches since sets may have changed
    state.invalidateMuscleGroupExerciseCache();
    // Invalidate streak analytics cache since sets may have changed
    state.invalidateStreakAnalyticsCache();
    return result;
  },
  
  // Charts cache management
  invalidateChartsCache: () => {
    set({ chartsCache: {} });
  },
  
  // Day detail cache management
  invalidateDayDetailCache: (dateKey) => {
    if (dateKey) {
      // Invalidate specific date
      const state = get();
      const newDayDetailData = { ...state.dayDetailData };
      const newDayDetailCache = { ...state.dayDetailCache };
      delete newDayDetailData[dateKey];
      delete newDayDetailCache[`dayDetail_${dateKey}`];
      set({ dayDetailData: newDayDetailData, dayDetailCache: newDayDetailCache });
    } else {
      // Invalidate all day detail caches
      set({ dayDetailData: {}, dayDetailCache: {} });
    }
  },
  
  // Helper to check if cache is valid
  isCacheValid: (cacheKey) => {
    const state = get();
    // Handle streak analytics cache
    if (cacheKey === 'streakAnalytics') {
      if (!state.streakAnalyticsCache) return false;
      const now = Date.now();
      return (now - state.streakAnalyticsCache) < state.cacheDuration;
    }
    // Handle other caches
    if (!state.chartsCache[cacheKey]) return false;
    const now = Date.now();
    const cached = state.chartsCache[cacheKey];
    return (now - cached) < state.cacheDuration;
  },
  
  // Helper to check if day detail cache is valid
  isDayDetailCacheValid: (cacheKey) => {
    const state = get();
    if (!state.dayDetailCache[cacheKey]) return false;
    const now = Date.now();
    const cached = state.dayDetailCache[cacheKey];
    return (now - cached) < state.cacheDuration;
  },
  
  // Load day detail data with caching
  loadDayDetailData: async (date, forceRefresh = false) => {
    const state = get();
    if (!state.user || !date) return { sets: [], groupedSets: [] };
    
    const dateKey = state.getDateKey(date);
    const cacheKey = `dayDetail_${dateKey}`;
    
    // Check cache
    if (!forceRefresh && state.isDayDetailCacheValid(cacheKey)) {
      return state.dayDetailData[dateKey] || { sets: [], groupedSets: [] };
    }
    
    try {
      const sets = await getExerciseSetsByDate(state.user.id, date);
      
      // Get distinct sets based on exercise + weight + reps + sets
      const getSetKey = (set) => {
        const exerciseName = set.exercises?.name || 'Unknown';
        return `${exerciseName}_${set.weight || 0}_${set.reps || 0}_${set.sets || 1}`;
      };
      
      const distinctSetsMap = new Map();
      sets.forEach(set => {
        const key = getSetKey(set);
        if (!distinctSetsMap.has(key)) {
          distinctSetsMap.set(key, set);
        }
      });
      
      const distinctSets = Array.from(distinctSetsMap.values());
      
      // Group distinct sets by exercise
      const grouped = distinctSets.reduce((acc, set) => {
        const exerciseName = set.exercises?.name || 'Unknown';
        if (!acc[exerciseName]) {
          acc[exerciseName] = [];
        }
        acc[exerciseName].push(set);
        return acc;
      }, {});
      
      // Convert to array and sort by total volume
      const groupedSets = Object.entries(grouped)
        .map(([exerciseName, exerciseSets]) => ({
          exerciseName,
          sets: exerciseSets.sort((a, b) => 
            new Date(a.performed_at) - new Date(b.performed_at)
          ),
          totalVolume: exerciseSets.reduce((sum, s) => 
            sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0
          ),
          totalSets: exerciseSets.reduce((sum, s) => sum + (s.sets || 1), 0),
        }))
        .sort((a, b) => b.totalVolume - a.totalVolume);
      
      const dayDetail = {
        sets,
        groupedSets,
      };
      
      const now = Date.now();
      set((currentState) => ({
        dayDetailData: {
          ...currentState.dayDetailData,
          [dateKey]: dayDetail
        },
        dayDetailCache: {
          ...currentState.dayDetailCache,
          [cacheKey]: now
        }
      }));
      
      return dayDetail;
    } catch (error) {
      console.error('Error loading day detail data:', error);
      return state.dayDetailData[dateKey] || { sets: [], groupedSets: [] };
    }
  },
  
  // Helper to check if muscle group exercise cache is valid
  isMuscleGroupExerciseCacheValid: (cacheKey) => {
    const state = get();
    if (!state.muscleGroupExerciseCache[cacheKey]) return false;
    const now = Date.now();
    const cached = state.muscleGroupExerciseCache[cacheKey];
    return (now - cached) < state.cacheDuration;
  },
  
  // Load muscle group exercise data with caching
  loadMuscleGroupExerciseData: async (muscleGroup, timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user || !muscleGroup) return { sets: [], groupedSets: [] };
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `muscleGroup_${muscleGroup.toLowerCase()}_${timeframeValue}`;
    
    // Check cache
    if (!forceRefresh && state.isMuscleGroupExerciseCacheValid(cacheKey)) {
      return state.muscleGroupExerciseData[cacheKey] || { sets: [], groupedSets: [] };
    }
    
    try {
      const sets = await getExerciseSetsByMuscleGroup(state.user.id, muscleGroup, timeframeValue);
      
      // Get distinct sets based on date + exercise + weight + reps + sets
      const getSetKey = (set) => {
        const date = new Date(set.performed_at);
        date.setHours(0, 0, 0, 0);
        const exerciseName = set.exercises?.name || 'Unknown';
        return `${date.toISOString()}_${exerciseName}_${set.weight || 0}_${set.reps || 0}_${set.sets || 1}`;
      };
      
      const distinctSetsMap = new Map();
      sets.forEach(set => {
        const key = getSetKey(set);
        if (!distinctSetsMap.has(key)) {
          distinctSetsMap.set(key, set);
        }
      });
      
      const distinctSets = Array.from(distinctSetsMap.values());
      
      // Group distinct sets by date, then by exercise
      const groupedByDate = {};
      
      distinctSets.forEach(set => {
        const date = new Date(set.performed_at);
        date.setHours(0, 0, 0, 0);
        const dateKey = date.toISOString();
        const exerciseName = set.exercises?.name || 'Unknown';
        
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = {};
        }
        
        if (!groupedByDate[dateKey][exerciseName]) {
          groupedByDate[dateKey][exerciseName] = [];
        }
        
        groupedByDate[dateKey][exerciseName].push(set);
      });
      
      // Convert to array format, sorted by date (most recent first)
      const groupedSets = Object.entries(groupedByDate)
        .map(([dateKey, exercises]) => {
          const date = new Date(dateKey);
          const exerciseEntries = Object.entries(exercises).map(([exerciseName, exerciseSets]) => ({
            exerciseName,
            sets: exerciseSets.sort((a, b) => 
              new Date(b.performed_at) - new Date(a.performed_at)
            ),
            totalVolume: exerciseSets.reduce((sum, s) => 
              sum + (s.weight || 0) * (s.reps || 0) * (s.sets || 1), 0
            ),
            totalSets: exerciseSets.reduce((sum, s) => sum + (s.sets || 1), 0),
          })).sort((a, b) => b.totalVolume - a.totalVolume);
          
          const dayTotalVolume = exerciseEntries.reduce((sum, ex) => sum + ex.totalVolume, 0);
          const dayTotalSets = exerciseEntries.reduce((sum, ex) => sum + ex.totalSets, 0);
          
          return {
            date: date,
            dateKey: dateKey,
            exercises: exerciseEntries,
            totalVolume: dayTotalVolume,
            totalSets: dayTotalSets,
          };
        })
        .sort((a, b) => new Date(b.dateKey) - new Date(a.dateKey));
      
      const muscleGroupData = {
        sets,
        groupedSets,
      };
      
      const now = Date.now();
      set((currentState) => ({
        muscleGroupExerciseData: {
          ...currentState.muscleGroupExerciseData,
          [cacheKey]: muscleGroupData
        },
        muscleGroupExerciseCache: {
          ...currentState.muscleGroupExerciseCache,
          [cacheKey]: now
        }
      }));
      
      return muscleGroupData;
    } catch (error) {
      console.error('Error loading muscle group exercise data:', error);
      return state.muscleGroupExerciseData[cacheKey] || { sets: [], groupedSets: [] };
    }
  },
  
  // Invalidate muscle group exercise cache
  invalidateMuscleGroupExerciseCache: (muscleGroup = null, timeframe = null) => {
    const state = get();
    if (muscleGroup && timeframe) {
      // Invalidate specific muscle group and timeframe
      const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
      const cacheKey = `muscleGroup_${muscleGroup.toLowerCase()}_${timeframeValue}`;
      const newMuscleGroupExerciseData = { ...state.muscleGroupExerciseData };
      const newMuscleGroupExerciseCache = { ...state.muscleGroupExerciseCache };
      delete newMuscleGroupExerciseData[cacheKey];
      delete newMuscleGroupExerciseCache[cacheKey];
      set({ muscleGroupExerciseData: newMuscleGroupExerciseData, muscleGroupExerciseCache: newMuscleGroupExerciseCache });
    } else {
      // Invalidate all muscle group exercise caches
      set({ muscleGroupExerciseData: {}, muscleGroupExerciseCache: {} });
    }
  },
  
  // Individual chart loaders with caching
  loadExerciseProgression: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return {};
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `exerciseProgression_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.exerciseProgression[timeframeValue] || {};
    }
    
    try {
      const data = await getExerciseProgressionData(state.user.id, null, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          exerciseProgression: {
            ...currentState.chartsData.exerciseProgression,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading exercise progression:', error);
      return state.chartsData.exerciseProgression[timeframeValue] || {};
    }
  },
  
  loadVolumeProgression: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return [];
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `volumeProgression_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.volumeProgression[timeframeValue] || [];
    }
    
    try {
      const data = await getVolumeProgressionData(state.user.id, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          volumeProgression: {
            ...currentState.chartsData.volumeProgression,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading volume progression:', error);
      return state.chartsData.volumeProgression[timeframeValue] || [];
    }
  },
  
  loadPersonalRecords: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return [];
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `personalRecords_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.personalRecords[timeframeValue] || [];
    }
    
    try {
      const data = await getPersonalRecords(state.user.id, 100, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          personalRecords: {
            ...currentState.chartsData.personalRecords,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading personal records:', error);
      return state.chartsData.personalRecords[timeframeValue] || [];
    }
  },
  
  loadWeeklyProgress: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return [];
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `weeklyProgress_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.weeklyProgress[timeframeValue] || [];
    }
    
    try {
      const data = await getWeeklyProgress(state.user.id, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          weeklyProgress: {
            ...currentState.chartsData.weeklyProgress,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading weekly progress:', error);
      return state.chartsData.weeklyProgress[timeframeValue] || [];
    }
  },
  
  loadMonthlyStats: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return [];
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `monthlyStats_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.monthlyStats[timeframeValue] || [];
    }
    
    try {
      const data = await getMonthlyStats(state.user.id, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          monthlyStats: {
            ...currentState.chartsData.monthlyStats,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading monthly stats:', error);
      return state.chartsData.monthlyStats[timeframeValue] || [];
    }
  },
  
  loadRPEAnalysis: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return [];
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `rpeAnalysis_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.rpeAnalysis[timeframeValue] || [];
    }
    
    try {
      const data = await getRPEAnalysis(state.user.id, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          rpeAnalysis: {
            ...currentState.chartsData.rpeAnalysis,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading RPE analysis:', error);
      return state.chartsData.rpeAnalysis[timeframeValue] || [];
    }
  },
  
  loadProgressiveOverloadInsights: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return [];
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `progressiveOverloadInsights_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.progressiveOverloadInsights[timeframeValue] || [];
    }
    
    try {
      const data = await getProgressiveOverloadInsights(state.user.id, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          progressiveOverloadInsights: {
            ...currentState.chartsData.progressiveOverloadInsights,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading progressive overload insights:', error);
      return state.chartsData.progressiveOverloadInsights[timeframeValue] || [];
    }
  },
  
  loadMuscleGroupHeatmap: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return [];
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `muscleGroupHeatmap_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.muscleGroupHeatmap[timeframeValue] || [];
    }
    
    try {
      const data = await getMuscleGroupHeatmapData(state.user.id, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          muscleGroupHeatmap: {
            ...currentState.chartsData.muscleGroupHeatmap,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading muscle group heatmap:', error);
      return state.chartsData.muscleGroupHeatmap[timeframeValue] || [];
    }
  },
  
  loadGoalAnalytics: async (timeframe = 30, forceRefresh = false) => {
    const state = get();
    if (!state.user) return {
      completionRateOverTime: [],
      goalsCreatedOverTime: [],
      statusBreakdown: { active: 0, completed: 0, expired: 0 },
      averageProgressOverTime: [],
      averageCompletionTime: 0,
      totalGoals: 0,
      completedGoals: 0,
      activeGoals: 0,
      expiredGoals: 0,
    };
    
    const timeframeValue = timeframe === 'all' ? 36500 : timeframe;
    const cacheKey = `goalAnalytics_${timeframeValue}`;
    
    // Check cache - return timeframe-specific data
    if (!forceRefresh && state.isCacheValid(cacheKey)) {
      return state.chartsData.goalAnalytics[timeframeValue] || {
        completionRateOverTime: [],
        goalsCreatedOverTime: [],
        statusBreakdown: { active: 0, completed: 0, expired: 0 },
        averageProgressOverTime: [],
        averageCompletionTime: 0,
        totalGoals: 0,
        completedGoals: 0,
        activeGoals: 0,
        expiredGoals: 0,
      };
    }
    
    try {
      const data = await getGoalAnalytics(state.user.id, timeframeValue);
      const now = Date.now();
      set((currentState) => ({
        chartsData: {
          ...currentState.chartsData,
          goalAnalytics: {
            ...currentState.chartsData.goalAnalytics,
            [timeframeValue]: data
          }
        },
        chartsCache: { ...currentState.chartsCache, [cacheKey]: now },
      }));
      return data;
    } catch (error) {
      console.error('Error loading goal analytics:', error);
      return state.chartsData.goalAnalytics[timeframeValue] || {
        completionRateOverTime: [],
        goalsCreatedOverTime: [],
        statusBreakdown: { active: 0, completed: 0, expired: 0 },
        averageProgressOverTime: [],
        averageCompletionTime: 0,
        totalGoals: 0,
        completedGoals: 0,
        activeGoals: 0,
        expiredGoals: 0,
      };
    }
  },
  
  // Bulk loader for charts index screen
  loadChartsData: async (forceRefresh = false) => {
    const state = get();
    if (!state.user) return;
    
    set({ chartsLoading: true, chartsError: null });
    try {
      const allTimeValue = 36500;
      const now = Date.now();
      
      // Helper to check if we should fetch
      const shouldFetch = (cacheKey) => {
        if (forceRefresh) return true;
        return !state.isCacheValid(cacheKey);
      };
      
      const promises = [];
      const updates = {};
      const cacheUpdates = {};
      
      // Load each chart type if cache is invalid
      if (shouldFetch('userStats_all')) {
        promises.push(
          getUserStats(state.user.id, allTimeValue).then(data => {
            updates.userStats = data;
            cacheUpdates['userStats_all'] = now;
          })
        );
      }
      
      if (shouldFetch('exerciseProgression_all')) {
        promises.push(
          getExerciseProgressionData(state.user.id, null, allTimeValue).then(data => {
            updates.exerciseProgression = { [allTimeValue]: data };
            cacheUpdates['exerciseProgression_all'] = now;
          })
        );
      }
      
      if (shouldFetch('volumeProgression_all')) {
        promises.push(
          getVolumeProgressionData(state.user.id, allTimeValue).then(data => {
            updates.volumeProgression = { [allTimeValue]: data };
            cacheUpdates['volumeProgression_all'] = now;
          })
        );
      }
      
      if (shouldFetch('strengthStandards_all')) {
        promises.push(
          getStrengthStandards(state.user.id, allTimeValue).then(data => {
            updates.strengthStandards = data;
            cacheUpdates['strengthStandards_all'] = now;
          })
        );
      }
      
      if (shouldFetch('monthlyStats_all')) {
        promises.push(
          getMonthlyStats(state.user.id, allTimeValue).then(data => {
            updates.monthlyStats = { [allTimeValue]: data };
            cacheUpdates['monthlyStats_all'] = now;
          })
        );
      }
      
      if (shouldFetch('personalRecords_all')) {
        promises.push(
          getPersonalRecords(state.user.id, 100, allTimeValue).then(data => {
            updates.personalRecords = { [allTimeValue]: data };
            cacheUpdates['personalRecords_all'] = now;
          })
        );
      }
      
      if (shouldFetch('weeklyProgress_all')) {
        promises.push(
          getWeeklyProgress(state.user.id, allTimeValue).then(data => {
            updates.weeklyProgress = { [allTimeValue]: data };
            cacheUpdates['weeklyProgress_all'] = now;
          })
        );
      }
      
      if (shouldFetch('rpeAnalysis_all')) {
        promises.push(
          getRPEAnalysis(state.user.id, allTimeValue).then(data => {
            updates.rpeAnalysis = { [allTimeValue]: data };
            cacheUpdates['rpeAnalysis_all'] = now;
          })
        );
      }
      
      if (shouldFetch('progressiveOverloadInsights_all')) {
        promises.push(
          getProgressiveOverloadInsights(state.user.id, allTimeValue).then(data => {
            updates.progressiveOverloadInsights = data;
            cacheUpdates['progressiveOverloadInsights_all'] = now;
          })
        );
      }
      
      if (shouldFetch('muscleGroupHeatmap_all')) {
        promises.push(
          getMuscleGroupHeatmapData(state.user.id, allTimeValue).then(data => {
            updates.muscleGroupHeatmap = data;
            cacheUpdates['muscleGroupHeatmap_all'] = now;
          })
        );
      }
      
      if (shouldFetch('goalAnalytics_all')) {
        promises.push(
          getGoalAnalytics(state.user.id, allTimeValue).then(data => {
            updates.goalAnalytics = { [allTimeValue]: data };
            cacheUpdates['goalAnalytics_all'] = now;
          })
        );
      }
      
      // Wait for all promises
      await Promise.all(promises);
      
      // Update state with all fetched data - merge nested structures properly
      if (Object.keys(updates).length > 0) {
        set((currentState) => {
          const mergedChartsData = { ...currentState.chartsData };

          // Merge nested timeframe data structures
          if (updates.exerciseProgression) {
            mergedChartsData.exerciseProgression = {
              ...mergedChartsData.exerciseProgression,
              ...updates.exerciseProgression
            };
          }
          if (updates.volumeProgression) {
            mergedChartsData.volumeProgression = {
              ...mergedChartsData.volumeProgression,
              ...updates.volumeProgression
            };
          }
          if (updates.monthlyStats) {
            mergedChartsData.monthlyStats = {
              ...mergedChartsData.monthlyStats,
              ...updates.monthlyStats
            };
          }
          if (updates.personalRecords) {
            mergedChartsData.personalRecords = {
              ...mergedChartsData.personalRecords,
              ...updates.personalRecords
            };
          }
          if (updates.weeklyProgress) {
            mergedChartsData.weeklyProgress = {
              ...mergedChartsData.weeklyProgress,
              ...updates.weeklyProgress
            };
          }
          if (updates.progressiveOverloadInsights) {
            mergedChartsData.progressiveOverloadInsights = {
              ...mergedChartsData.progressiveOverloadInsights,
              ...updates.progressiveOverloadInsights
            };
          }
          if (updates.muscleGroupHeatmap) {
            mergedChartsData.muscleGroupHeatmap = {
              ...mergedChartsData.muscleGroupHeatmap,
              ...updates.muscleGroupHeatmap
            };
          }
          if (updates.goalAnalytics) {
            mergedChartsData.goalAnalytics = {
              ...mergedChartsData.goalAnalytics,
              ...updates.goalAnalytics
            };
          }

          // Direct updates for non-nested data
          if (updates.userStats !== undefined) {
            mergedChartsData.userStats = updates.userStats;
          }
          if (updates.strengthStandards !== undefined) {
            mergedChartsData.strengthStandards = updates.strengthStandards;
          }
          if (updates.rpeAnalysis !== undefined) {
            mergedChartsData.rpeAnalysis = {
              ...currentState.chartsData.rpeAnalysis,
              ...updates.rpeAnalysis
            };
          }

          return {
            chartsData: mergedChartsData,
            chartsCache: { ...currentState.chartsCache, ...cacheUpdates },
          };
        });
      }
    } catch (error) {
      console.error('Error loading charts data:', error);
      const { getUserFriendlyError, isNetworkError } = await import('../utils/errorHandler');
      const errorMessage = getUserFriendlyError(error, "Failed to load insights. Please try again.");
      set({ 
        chartsLoading: false,
        chartsError: errorMessage,
      });
    } finally {
      set({ chartsLoading: false });
    }
  },
  
  // Refresh all charts data
  refreshChartsData: async () => {
    set({ chartsRefreshing: true, chartsError: null });
    await get().loadChartsData(true);
    set({ chartsRefreshing: false });
  },
  
  // Initialize user data
  initializeUserData: async () => {
    set({ isLoading: true });
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        set({ isLoading: false });
        return;
      }
      
      set({ user: currentUser });
      
      const [profileData, streakData, goalsData, progressRows] = await Promise.all([
        getProfile(currentUser.id),
        getCurrentStreak(currentUser.id),
        getFitnessGoals(currentUser.id),
        getExerciseProgressRows(currentUser.id, 1000, DASHBOARD_TIMEFRAME),
      ]);

      const sets = await getExerciseSetsByUser(currentUser.id, 500, DASHBOARD_TIMEFRAME);
      
      set({
        profile: profileData || null,
        currentStreak: streakData || 0,
        fitnessGoals: goalsData || [],
        progressByExercise: progressRows || [],
        recentSets: sets || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error initializing user data:', error);
      set({ isLoading: false });
    }
  },
  
  // Refresh all data
  refreshAll: async () => {
    set({ isRefreshing: true });
    await get().initializeUserData();
    set({ isRefreshing: false });
  },
  
  // Set user
  setUser: (user) => set({ user }),
  
  // Set profile
  setProfile: (profile) => set({ profile }),
  
  // Set current streak
  setCurrentStreak: (streak) => set({ currentStreak: streak }),
  
  // Load streak analytics with caching
  loadStreakAnalytics: async (forceRefresh = false) => {
    const state = get();
    if (!state.user) {
      console.log('[Store] loadStreakAnalytics: no user, returning null');
      return null;
    }

    const cacheKey = 'streakAnalytics';

    // Check cache
    if (!forceRefresh && state.streakAnalyticsCache && state.isCacheValid(cacheKey)) {
      console.log('[Store] loadStreakAnalytics: using cache');
      return state.streakAnalytics;
    }

    console.log('[Store] loadStreakAnalytics: fetching fresh data for user', state.user.id);
    set({ streakAnalyticsLoading: true, streakAnalyticsError: null });

    try {
      const data = await getStreakAnalytics(state.user.id, 365);
      console.log('[Store] loadStreakAnalytics: got data', {
        currentStreak: data?.currentStreak,
        totalWorkoutDays: data?.totalWorkoutDays,
        workoutDatesCount: data?.workoutDates?.length,
        activityMapKeys: data?.activityMap ? Object.keys(data.activityMap).filter(k => data.activityMap[k]).length : 0,
      });
      const now = Date.now();
      set({
        streakAnalytics: data,
        streakAnalyticsCache: now,
        streakAnalyticsLoading: false,
      });
      return data;
    } catch (error) {
      console.error('Error loading streak analytics:', error);
      const { getUserFriendlyError } = await import('../utils/errorHandler');
      const errorMessage = getUserFriendlyError(error, "Failed to load streak analytics. Please try again.");
      set({
        streakAnalyticsLoading: false,
        streakAnalyticsError: errorMessage,
      });
      return state.streakAnalytics; // Return cached data if available
    }
  },
  
  // Invalidate streak analytics cache
  invalidateStreakAnalyticsCache: () => {
    set({ streakAnalyticsCache: null });
  },
}));

