import { supabase } from './supabase';
import NetInfo from '@react-native-community/netinfo';

/**
 * Check if device has network connectivity
 * @returns {Promise<boolean>} True if connected, false otherwise
 */
const checkNetworkConnection = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  } catch (error) {
    console.error('Error checking network connection:', error);
    // Default to true to avoid blocking operations if check fails
    return true;
  }
};

/**
 * Wrapper for database operations that checks network before executing
 * @param {Function} operation - The database operation to execute
 * @param {string} operationName - Name of the operation for error messages
 * @returns {Promise} Result of the operation
 */
const withNetworkCheck = async (operation, operationName = 'operation') => {
  const isConnected = await checkNetworkConnection();
  if (!isConnected) {
    const error = new Error('No internet connection. Please check your network and try again.');
    error.code = 'NETWORK_ERROR';
    throw error;
  }
  return operation();
};

// Profile operations
export const getProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Upsert profile (insert if doesn't exist, update if exists)
export const upsertProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        ...profileData 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
};

// Workout category operations
export const getWorkoutCategories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('workout_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching workout categories:', error);
    return [];
  }
};

export const createWorkoutCategory = async (categoryData) => {
  try {
    const { data, error } = await supabase
      .from('workout_categories')
      .insert(categoryData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating workout category:', error);
    throw error;
  }
};

export const updateWorkoutCategory = async (categoryId, updates) => {
  try {
    const { data, error } = await supabase
      .from('workout_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating workout category:', error);
    throw error;
  }
};

export const deleteWorkoutCategory = async (categoryId) => {
  try {
    const { error } = await supabase
      .from('workout_categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting workout category:', error);
    throw error;
  }
};

// Workout template operations
export const getWorkoutTemplates = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .select(`
        *,
        workout_categories(name, color, icon),
        workout_template_exercises(
          id,
          order_index,
          sets,
          reps,
          weight_kg,
          duration_seconds,
          rest_seconds,
          notes,
          exercises(name, description, category, muscle_groups)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching workout templates:', error);
    return [];
  }
};

export const createWorkoutTemplate = async (templateData) => {
  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .insert(templateData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating workout template:', error);
    throw error;
  }
};

export const updateWorkoutTemplate = async (templateId, updates) => {
  try {
    const { data, error } = await supabase
      .from('workout_templates')
      .update(updates)
      .eq('id', templateId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating workout template:', error);
    throw error;
  }
};

export const deleteWorkoutTemplate = async (templateId) => {
  try {
    const { error } = await supabase
      .from('workout_templates')
      .delete()
      .eq('id', templateId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting workout template:', error);
    throw error;
  }
};

// Goals management
export const updateFitnessGoal = async (goalId, updates) => {
  return withNetworkCheck(async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .update(updates)
        .eq('id', goalId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating fitness goal:', error);
      throw error;
    }
  }, 'updateFitnessGoal');
};

export const deleteFitnessGoal = async (goalId) => {
  return withNetworkCheck(async () => {
    try {
      const { error } = await supabase
        .from('fitness_goals')
        .delete()
        .eq('id', goalId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting fitness goal:', error);
      throw error;
    }
  }, 'deleteFitnessGoal');
};

// Exercise operations
export const createExercise = async (exerciseData) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exerciseData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

export const getExercises = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return [];
  }
};

// Find or create exercise by case-insensitive name for a user
export const findOrCreateExercise = async (userId, name) => {
  try {
    const lower = name.trim().toLowerCase();
    // Try find
    const { data: found, error: findError } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', lower)
      .limit(1)
      .single();
    if (!findError && found) {
      // If found but doesn't have muscle_groups, try to match and update
      if (!found.muscle_groups || (Array.isArray(found.muscle_groups) && found.muscle_groups.length === 0)) {
        try {
          const { getMuscleGroupsForExercise } = await import('../utils/exerciseMatcher');
          const muscleGroups = await getMuscleGroupsForExercise(name);
          if (muscleGroups) {
            // Update exercise with muscle groups
            await supabase
              .from('exercises')
              .update({ muscle_groups: muscleGroups })
              .eq('id', found.id);
            found.muscle_groups = muscleGroups;
          }
        } catch (err) {
          console.error('Error matching exercise for muscle groups:', err);
        }
      }
      return found;
    }
  } catch (_) {}
  
  // Create new exercise - try to match against exercises.json for muscle groups
  let muscleGroups = null;
  try {
    const { getMuscleGroupsForExercise } = await import('../utils/exerciseMatcher');
    muscleGroups = await getMuscleGroupsForExercise(name);
  } catch (err) {
    console.error('Error matching exercise for muscle groups:', err);
  }
  
  const insertData = {
    user_id: userId,
    name: name.trim()
  };
  
  if (muscleGroups) {
    insertData.muscle_groups = muscleGroups;
  }
  
  const { data, error } = await supabase
    .from('exercises')
    .insert(insertData)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Exercise sets operations
export const createExerciseSet = async (setData) => {
  return withNetworkCheck(async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_sets')
        .insert(setData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating exercise set:', error);
      throw error;
    }
  }, 'createExerciseSet');
};

export const getExerciseSetsByUser = async (userId, limit = 500) => {
  try {
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`*, exercises(name)`) 
      .eq('user_id', userId)
      .order('performed_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching exercise sets:', error);
    return [];
  }
};

// Get exercise sets for a specific date
export const getExerciseSetsByDate = async (userId, date) => {
  try {
    // Create start and end of day in UTC
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`*, exercises(name)`) 
      .eq('user_id', userId)
      .gte('performed_at', startOfDay.toISOString())
      .lte('performed_at', endOfDay.toISOString())
      .order('performed_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching exercise sets by date:', error);
    return [];
  }
};

export const updateExerciseSet = async (setId, updates) => {
  return withNetworkCheck(async () => {
    try {
      const { data, error } = await supabase
        .from('exercise_sets')
        .update(updates)
        .eq('id', setId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating exercise set:', error);
      throw error;
    }
  }, 'updateExerciseSet');
};

export const deleteExerciseSet = async (setId) => {
  return withNetworkCheck(async () => {
    try {
      const { error } = await supabase
        .from('exercise_sets')
        .delete()
        .eq('id', setId);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting exercise set:', error);
      throw error;
    }
  }, 'deleteExerciseSet');
};

export const getExerciseProgressRows = async (userId, limit = 1000) => {
  // Returns rows suitable for Home progress: exerciseName, first1RM, best1RM, delta
  try {
    const sets = await getExerciseSetsByUser(userId, limit);
    if (!sets || sets.length === 0) return [];
    const computeOneRM = (w, r) => {
      const weight = Number(w) || 0;
      const reps = Number(r) || 1;
      return weight * (1 + reps / 30);
    };
    const grouped = sets.reduce((acc, s) => {
      const key = s.workout_exercises?.exercises?.name || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {});
    const rows = Object.values(grouped).map(list => {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      const first = list[0];
      const best = list.reduce((m, x) => {
        const m1 = computeOneRM(m.weight_kg, m.reps);
        const x1 = computeOneRM(x.weight_kg, x.reps);
        return x1 > m1 ? x : m;
      }, list[0]);
      const first1RM = computeOneRM(first.weight_kg, first.reps);
      const best1RM = computeOneRM(best.weight_kg, best.reps);
      return {
        exerciseName: best.workout_exercises?.exercises?.name || 'Exercise',
        first1RM,
        best1RM,
        delta: best1RM - first1RM,
        bestAt: best.created_at,
      };
    });
    rows.sort((a, b) => b.delta - a.delta);
    return rows;
  } catch (error) {
    console.error('Error building exercise progress rows:', error);
    return [];
  }
};

// Workout template exercise operations
export const createWorkoutTemplateExercise = async (templateExerciseData) => {
  try {
    const { data, error } = await supabase
      .from('workout_template_exercises')
      .insert(templateExerciseData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating workout template exercise:', error);
    throw error;
  }
};

// Workout session operations
export const getRecentWorkoutSessions = async (userId, limit = 7) => {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        workout_templates(name, workout_categories(name, color))
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent workout sessions:', error);
    return [];
  }
};

export const createWorkoutSession = async (sessionData) => {
  try {
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert(sessionData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating workout session:', error);
    throw error;
  }
};

// Personal records operations

// Fitness goals operations
export const getFitnessGoals = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching fitness goals:', error);
    return [];
  }
};

export const createFitnessGoal = async (goalData) => {
  return withNetworkCheck(async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_goals')
        .insert(goalData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating fitness goal:', error);
      throw error;
    }
  }, 'createFitnessGoal');
};

// Get goal analytics data
export const getGoalAnalytics = async (userId, days = 365) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Fetch goals that were either created OR completed within the timeframe
    // This ensures goals completed today (even if created earlier) are included
    // We need to fetch a broader range and filter in JavaScript, or use PostgREST's or() filter
    // For now, let's fetch goals created in timeframe OR completed in timeframe
    const { data: allGoals, error } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Filter goals that were either created or completed within the timeframe
    const goals = (allGoals || []).filter(goal => {
      const createdDate = new Date(goal.created_at);
      const completedDate = goal.completed_at ? new Date(goal.completed_at) : null;
      
      // Include if created within timeframe
      const createdInRange = createdDate >= startDate && createdDate <= endDate;
      // Include if completed within timeframe
      const completedInRange = completedDate && completedDate >= startDate && completedDate <= endDate;
      
      return createdInRange || completedInRange;
    });

    if (!goals || goals.length === 0) {
      return {
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate status breakdown
    const activeGoals = goals.filter(g => !g.is_completed && (!g.target_date || new Date(g.target_date) >= today));
    const completedGoals = goals.filter(g => g.is_completed);
    const expiredGoals = goals.filter(g => !g.is_completed && g.target_date && new Date(g.target_date) < today);

    // Calculate average completion time (in days)
    const completedGoalsWithTime = completedGoals.filter(g => g.completed_at && g.created_at);
    let averageCompletionTime = 0;
    if (completedGoalsWithTime.length > 0) {
      const totalDays = completedGoalsWithTime.reduce((sum, g) => {
        const created = new Date(g.created_at);
        const completed = new Date(g.completed_at);
        const daysDiff = Math.ceil((completed - created) / (1000 * 60 * 60 * 24));
        return sum + daysDiff;
      }, 0);
      averageCompletionTime = Math.round(totalDays / completedGoalsWithTime.length);
    }

    // Group by month for time series data
    const monthlyData = {};
    const todayStr = today.toISOString().split('T')[0];

    goals.forEach(goal => {
      const createdDate = new Date(goal.created_at);
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          date: monthKey,
          goalsCreated: 0,
          goalsCompleted: 0,
          totalGoals: 0,
          totalProgress: 0,
          progressCount: 0,
        };
      }
      
      monthlyData[monthKey].goalsCreated += 1;
      monthlyData[monthKey].totalGoals += 1;

      // Check if goal was completed in this month
      if (goal.is_completed && goal.completed_at) {
        const completedDate = new Date(goal.completed_at);
        const completedMonthKey = `${completedDate.getFullYear()}-${String(completedDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[completedMonthKey]) {
          monthlyData[completedMonthKey] = {
            date: completedMonthKey,
            goalsCreated: 0,
            goalsCompleted: 0,
            totalGoals: 0,
            totalProgress: 0,
            progressCount: 0,
          };
        }
        
        monthlyData[completedMonthKey].goalsCompleted += 1;
      }

      // Calculate progress for this goal
      if (goal.target_value > 0) {
        const progress = (goal.current_value / goal.target_value) * 100;
        monthlyData[monthKey].totalProgress += progress;
        monthlyData[monthKey].progressCount += 1;
      }
    });

    // Convert to arrays and calculate metrics
    const completionRateOverTime = [];
    const goalsCreatedOverTime = [];
    const averageProgressOverTime = [];

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();

    // Track cumulative goals for completion rate calculation
    let cumulativeTotal = 0;
    let cumulativeCompleted = 0;

    sortedMonths.forEach(monthKey => {
      const monthData = monthlyData[monthKey];
      cumulativeTotal += monthData.goalsCreated;
      cumulativeCompleted += monthData.goalsCompleted;

      // Completion rate: completed goals / total goals created up to this point
      const completionRate = cumulativeTotal > 0 
        ? Math.round((cumulativeCompleted / cumulativeTotal) * 100)
        : 0;

      completionRateOverTime.push({
        date: monthKey,
        completionRate,
      });

      goalsCreatedOverTime.push({
        date: monthKey,
        count: monthData.goalsCreated,
      });

      // Average progress for goals created in this month
      const avgProgress = monthData.progressCount > 0
        ? Math.round(monthData.totalProgress / monthData.progressCount)
        : 0;

      averageProgressOverTime.push({
        date: monthKey,
        avgProgress,
      });
    });

    return {
      completionRateOverTime,
      goalsCreatedOverTime,
      statusBreakdown: {
        active: activeGoals.length,
        completed: completedGoals.length,
        expired: expiredGoals.length,
      },
      averageProgressOverTime,
      averageCompletionTime,
      totalGoals: goals.length,
      completedGoals: completedGoals.length,
      activeGoals: activeGoals.length,
      expiredGoals: expiredGoals.length,
    };
  } catch (error) {
    console.error('Error fetching goal analytics:', error);
    return {
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
};

// Analytics and statistics
export const getWeeklyProgress = async (userId, days = null) => {
  try {
    const endDate = new Date();
    let startDate = new Date();
    
    // If days is provided, use that timeframe, otherwise use current week
    if (days !== null) {
      startDate.setDate(startDate.getDate() - days);
    } else {
      // Default to current week
      startDate.setDate(startDate.getDate() - startDate.getDay());
    }
    startDate.setHours(0, 0, 0, 0);

    // Get exercise sets data for the timeframe
    let query = supabase
      .from('exercise_sets')
      .select('performed_at, weight, reps, sets')
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at');

    const { data, error } = await query;

    if (error) throw error;

    // Always return daily breakdown for the current week
    // The timeframe filter affects which data is included, but format is always 7-day daily
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Create weekly progress array based on sets data
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProgress = dayNames.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      
      // Check if there are any sets logged on this day within the filtered timeframe
      const daySets = data?.filter(set => {
        const setDate = new Date(set.performed_at);
        return setDate.toDateString() === dayDate.toDateString();
      }) || [];

      const hasSets = daySets.length > 0;
      const totalWeight = daySets.reduce((sum, set) => sum + (set.weight || 0) * (set.reps || 0) * (set.sets || 1), 0);

      return {
        day,
        completed: hasSets,
        weight: totalWeight
      };
    });

    return weeklyProgress;
  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    return [];
  }
};

// Get detailed streak analytics including activity graph data
export const getStreakAnalytics = async (userId, days = 365) => {
  try {
    // Get all exercise sets for the period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('exercise_sets')
      .select('created_at, performed_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;
    

    // Get unique workout dates
    const workoutDates = new Set();
    if (data && data.length > 0) {
      data.forEach(set => {
        // Use UTC date to avoid timezone issues
        const date = new Date(set.created_at || set.performed_at);
        const dateStr = date.toISOString().split('T')[0]; // This gives us YYYY-MM-DD in UTC
        workoutDates.add(dateStr);
      });
    }
    

    // Create activity map for last 365 days (from oldest to newest)
    const activityMap = {};
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // Get today in UTC
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap[dateStr] = workoutDates.has(dateStr);
    }
    
    // Ensure today is included in the activity map
    activityMap[todayStr] = workoutDates.has(todayStr);
    

    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = Array.from(workoutDates).sort().reverse();
    
    // Start checking from today or yesterday if no workout today
    let checkDateStr = todayStr;
    if (!workoutDates.has(todayStr)) {
      // Start from yesterday
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      checkDateStr = yesterday.toISOString().split('T')[0];
    }
    
    for (const dateStr of sortedDates) {
      // Check if this date matches the date we're looking for
      if (dateStr === checkDateStr) {
        currentStreak++;
        // Move to the previous day
        const checkDate = new Date(checkDateStr + 'T00:00:00Z');
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        checkDateStr = checkDate.toISOString().split('T')[0];
      } else if (dateStr < checkDateStr) {
        // If we encounter a date that's before our check date (gap in streak), stop
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const allDates = Array.from(workoutDates).sort();
    
    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(allDates[i - 1]);
        const currDate = new Date(allDates[i]);
        const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate total workout days
    const totalWorkoutDays = workoutDates.size;

    // Calculate this week's workouts
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    let thisWeekWorkouts = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      if (workoutDates.has(dateStr)) {
        thisWeekWorkouts++;
      }
    }

    return {
      currentStreak,
      longestStreak,
      totalWorkoutDays,
      thisWeekWorkouts,
      activityMap,
      workoutDates: Array.from(workoutDates).sort()
    };
  } catch (error) {
    console.error('Error fetching streak analytics:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalWorkoutDays: 0,
      thisWeekWorkouts: 0,
      activityMap: {},
      workoutDates: []
    };
  }
};

export const getCurrentStreak = async (userId) => {
  try {
    // Get unique days when sets were logged
    const { data, error } = await supabase
      .from('exercise_sets')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    // Get unique dates when sets were logged using local timezone
    const uniqueDates = [...new Set(data.map(set => {
      const date = new Date(set.created_at);
      // Format as YYYY-MM-DD in local timezone
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }))].sort().reverse();

    let streak = 0;
    const today = new Date();
    // Get today's date in local timezone
    const todayYear = today.getFullYear();
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    // Check if today has sets, if not start from yesterday
    let checkDateStr = todayStr;
    if (!uniqueDates.includes(todayStr)) {
      // Start from yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yYear = yesterday.getFullYear();
      const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
      const yDay = String(yesterday.getDate()).padStart(2, '0');
      checkDateStr = `${yYear}-${yMonth}-${yDay}`;
    }
    
    for (const dateStr of uniqueDates) {
      // Check if this date matches the date we're looking for
      if (dateStr === checkDateStr) {
        streak++;
        // Move to the previous day
        const [year, month, day] = checkDateStr.split('-').map(Number);
        const checkDate = new Date(year, month - 1, day);
        checkDate.setDate(checkDate.getDate() - 1);
        const cYear = checkDate.getFullYear();
        const cMonth = String(checkDate.getMonth() + 1).padStart(2, '0');
        const cDay = String(checkDate.getDate()).padStart(2, '0');
        checkDateStr = `${cYear}-${cMonth}-${cDay}`;
      } else if (dateStr < checkDateStr) {
        // If we encounter a date that's before our check date (gap in streak), stop
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating current streak:', error);
    return 0;
  }
};

// Helper function to get user's current session
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// User statistics and achievements
export const getUserStats = async (userId, days = null) => {
  try {
    const endDate = new Date();
    let query = supabase
      .from('exercise_sets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // If days is provided, filter by date range
    if (days !== null) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query
        .gte('performed_at', startDate.toISOString())
        .lte('performed_at', endDate.toISOString());
    }
    
    const { count: setsCount, error: setsError } = await query;
    
    if (setsError) throw setsError;

    // Get current streak (based on sets) - always all-time for streak
    const currentStreak = await getCurrentStreak(userId);

    // Get personal records count (from sets data) - filtered by timeframe
    const personalRecords = await getPersonalRecords(userId, 100, days);
    const prCount = personalRecords.length;

    // Get fitness goals progress
    const { data: goals, error: goalsError } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId);
    
    if (goalsError) throw goalsError;

    const completedGoals = goals?.filter(goal => goal.is_completed) || [];
    const goalProgress = goals && goals.length > 0 
      ? Math.round((completedGoals.length / goals.length) * 100) 
      : 0;

    return {
      workoutCount: setsCount || 0, // Use sets count as "workout" count
      currentStreak,
      personalRecordsCount: prCount,
      goalProgress
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      workoutCount: 0,
      currentStreak: 0,
      personalRecordsCount: 0,
      goalProgress: 0
    };
  }
};

export const getUserAchievements = async (userId) => {
  try {
    const achievements = [];

    // Get workout count for achievements
    const { count: workoutCount, error: workoutError } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (!workoutError && workoutCount > 0) {
      achievements.push({
        name: "First Workout",
        description: "Completed your first workout",
        date: "Recently",
        type: "workout"
      });
    }

    if (!workoutError && workoutCount >= 7) {
      achievements.push({
        name: "Week Warrior",
        description: "Worked out 7 days in a row",
        date: "Recently",
        type: "streak"
      });
    }

    // Get personal records for achievements
    const { data: personalRecords, error: prError } = await supabase
      .from('personal_records')
      .select('*, exercises(name)')
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })
      .limit(3);
    
    if (!prError && personalRecords && personalRecords.length > 0) {
      achievements.push({
        name: "Strength Master",
        description: `Set ${personalRecords.length} personal records`,
        date: "Recently",
        type: "strength"
      });
    }

    // Get current streak for achievements
    const currentStreak = await getCurrentStreak(userId);
    if (currentStreak >= 5) {
      achievements.push({
        name: "Consistency King",
        description: `Maintained a ${currentStreak}-day workout streak`,
        date: "Recently",
        type: "streak"
      });
    }

    return achievements;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
};

// insert id to profile table with the user id
export const insertProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profile')
      .insert({ user_id: userId, ...profileData })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error inserting profile:', error);
    throw error;
  }
};

// totally delete the user from the system even the authenticated ones including the profile table
// it will cascade delete to all other tables
export const deleteUserAccount = async (userId) => {
  try {
    const { error } = await supabase.rpc('delete_user_account', {p_user_id: userId})
    if (error) throw error;
    return true;
  }
  catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
}

// Charts and Analytics Functions
export const getExerciseProgressionData = async (userId, exerciseId = null, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get exercise sets data with exercise names
    const { data: setsData, error: setsError } = await supabase
      .from('exercise_sets')
      .select(`
        id,
        weight,
        reps,
        performed_at,
        rpe,
        notes,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (setsError) throw setsError;

    // Group by exercise and calculate 1RM for each set
    const computeOneRM = (weight, reps) => {
      const w = Number(weight) || 0;
      const r = Number(reps) || 1;
      return w * (1 + r / 30);
    };

    const grouped = setsData?.reduce((acc, set) => {
      const exerciseName = set.exercises?.name || 'Unknown';
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push({
        id: set.id,
        weight: set.weight,
        reps: set.reps,
        oneRM: computeOneRM(set.weight, set.reps),
        date: set.performed_at,
        rpe: set.rpe,
        notes: set.notes
      });
      return acc;
    }, {}) || {};

    return grouped;
  } catch (error) {
    console.error('Error fetching exercise progression data:', error);
    return {};
  }
};

export const getVolumeProgressionData = async (userId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        sets,
        performed_at,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (error) throw error;

    // Group by date and calculate daily volume
    const dailyVolume = data?.reduce((acc, set) => {
      const date = new Date(set.performed_at).toISOString().split('T')[0];
      // Volume calculation: 
      // If each row represents one individual set, use: weight * reps
      // If each row represents multiple sets, use: weight * reps * sets
      // For now, assuming each row is one set (most common structure)
      const volume = (set.weight || 0) * (set.reps || 0);
      
      // Alternative calculation if your DB stores multiple sets per row:
      // const volume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
      
      const exerciseName = set.exercises?.name || 'Unknown';
      
      if (!acc[date]) {
        acc[date] = { 
          date, 
          totalVolume: 0, 
          exerciseCount: 0, 
          exercises: new Set(),
          exerciseVolumes: {} // Track volume per exercise
        };
      }
      
      acc[date].totalVolume += volume;
      acc[date].exerciseCount += 1;
      acc[date].exercises.add(exerciseName);
      
      // Accumulate volume per exercise
      if (!acc[date].exerciseVolumes[exerciseName]) {
        acc[date].exerciseVolumes[exerciseName] = 0;
      }
      acc[date].exerciseVolumes[exerciseName] += volume;
      
      return acc;
    }, {}) || {};

    return Object.values(dailyVolume).map(day => ({
      ...day,
      exerciseCount: day.exercises.size,
      exercises: Array.from(day.exercises),
      exerciseVolumes: day.exerciseVolumes || {} // Include exercise volumes
    }));
  } catch (error) {
    console.error('Error fetching volume progression data:', error);
    return [];
  }
};

export const getStrengthStandards = async (userId, days = null) => {
  try {
    const { data: profile } = await getProfile(userId);
    if (!profile?.weight_kg) return [];

    const bodyWeight = profile.weight_kg;
    
    const endDate = new Date();
    let query = supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        performed_at,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .in('exercises.name', ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press']);
    
    // If days is provided, filter by date range
    if (days !== null) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query
        .gte('performed_at', startDate.toISOString())
        .lte('performed_at', endDate.toISOString());
    }
    
    query = query
      .order('performed_at', { ascending: false })
      .limit(1000); // Increase limit to get all relevant data within timeframe

    const { data, error } = await query;

    if (error) throw error;

    const computeOneRM = (weight, reps) => {
      const w = Number(weight) || 0;
      const r = Number(reps) || 1;
      return w * (1 + r / 30);
    };

    const standards = data?.reduce((acc, set) => {
      const exerciseName = set.exercises?.name;
      if (!exerciseName) return acc;

      const oneRM = computeOneRM(set.weight, set.reps);
      const relativeStrength = oneRM / bodyWeight;

      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          exercise: exerciseName,
          oneRM: oneRM,
          relativeStrength: relativeStrength,
          bodyWeight: bodyWeight
        };
      } else if (oneRM > acc[exerciseName].oneRM) {
        acc[exerciseName] = {
          exercise: exerciseName,
          oneRM: oneRM,
          relativeStrength: relativeStrength,
          bodyWeight: bodyWeight
        };
      }

      return acc;
    }, {}) || {};

    return Object.values(standards);
  } catch (error) {
    console.error('Error fetching strength standards:', error);
    return [];
  }
};

export const getMonthlyStats = async (userId, days = null) => {
  try {
    const endDate = new Date();
    let startDate = new Date();
    
    // Convert days to months if days is provided, otherwise use default 6 months
    let months = 6;
    if (days !== null) {
      if (days >= 36500) {
        // All time - find the first set date
        const { data: firstSet, error: firstSetError } = await supabase
          .from('exercise_sets')
          .select('performed_at')
          .eq('user_id', userId)
          .order('performed_at', { ascending: true })
          .limit(1);
        
        if (firstSetError) throw firstSetError;
        
        if (firstSet && firstSet.length > 0) {
          startDate = new Date(firstSet[0].performed_at);
          // Set to first day of the first month
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
        } else {
          // No sets found, return empty array
          return [];
        }
      } else {
        // Convert days to approximate months (30 days per month)
        months = Math.ceil(days / 30);
        startDate.setMonth(startDate.getMonth() - months);
        // Set to first day of the start month
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
      }
    } else {
      startDate.setMonth(startDate.getMonth() - months);
      // Set to first day of the start month
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }
    
    // Set to last day of the current month
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    // Generate all months in the range (including current month)
    const allMonths = [];
    const currentMonth = new Date(startDate);
    while (currentMonth <= endDate) {
      const monthKey = currentMonth.toISOString().substring(0, 7); // YYYY-MM
      allMonths.push({
        month: monthKey,
        totalSets: 0,
        totalVolume: 0,
        uniqueExercises: new Set(),
        avgWeight: 0
      });
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    // Get exercise sets data
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        performed_at,
        weight,
        reps,
        sets,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (error) throw error;

    // Group by month and calculate stats based on sets
    const monthlyDataMap = new Map();
    allMonths.forEach(m => {
      monthlyDataMap.set(m.month, {
        ...m,
        exerciseVolumes: {} // Track volume per exercise
      });
    });

    data?.forEach(set => {
      const month = new Date(set.performed_at).toISOString().substring(0, 7); // YYYY-MM
      const monthData = monthlyDataMap.get(month);
      
      if (monthData) {
        const volume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
        const exerciseName = set.exercises?.name || 'Unknown';
        
        monthData.totalSets += 1;
        monthData.totalVolume += volume;
        monthData.uniqueExercises.add(exerciseName);
        
        // Accumulate volume per exercise
        if (!monthData.exerciseVolumes[exerciseName]) {
          monthData.exerciseVolumes[exerciseName] = 0;
        }
        monthData.exerciseVolumes[exerciseName] += volume;
      }
    });

    return Array.from(monthlyDataMap.values()).map(month => ({
      month: month.month,
      workouts: month.uniqueExercises.size, // Use unique exercises as "workouts"
      completedWorkouts: month.uniqueExercises.size, // All sets are "completed"
      totalSets: month.totalSets,
      totalVolume: month.totalVolume,
      avgWeight: month.totalSets > 0 ? month.totalVolume / month.totalSets : 0,
      completionRate: 100, // All logged sets are "completed"
      exerciseVolumes: month.exerciseVolumes || {} // Include exercise volumes
    }));
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return [];
  }
};

export const getWeeklyStats = async (userId, days = null) => {
  try {
    const endDate = new Date();
    let startDate = new Date();
    
    // Convert days to weeks if days is provided, otherwise use default 12 weeks
    let weeks = 12;
    if (days !== null) {
      if (days >= 36500) {
        // All time - find the first set date
        const { data: firstSet, error: firstSetError } = await supabase
          .from('exercise_sets')
          .select('performed_at')
          .eq('user_id', userId)
          .order('performed_at', { ascending: true })
          .limit(1);
        
        if (firstSetError) throw firstSetError;
        
        if (firstSet && firstSet.length > 0) {
          startDate = new Date(firstSet[0].performed_at);
          // Set to start of week (Sunday)
          startDate.setDate(startDate.getDate() - startDate.getDay());
          startDate.setHours(0, 0, 0, 0);
        } else {
          // No sets found, return empty array
          return [];
        }
      } else {
        // Convert days to approximate weeks (7 days per week)
        weeks = Math.ceil(days / 7);
        startDate.setDate(startDate.getDate() - (weeks * 7));
        // Set to start of week (Sunday)
        startDate.setDate(startDate.getDate() - startDate.getDay());
        startDate.setHours(0, 0, 0, 0);
      }
    } else {
      startDate.setDate(startDate.getDate() - (weeks * 7));
      // Set to start of week (Sunday)
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
    }
    
    // Set end date to end of current week (Saturday)
    const endOfWeek = new Date(endDate);
    endOfWeek.setDate(endDate.getDate() + (6 - endDate.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // Generate all weeks in the range
    const allWeeks = [];
    const currentWeek = new Date(startDate);
    while (currentWeek <= endOfWeek) {
      const weekKey = currentWeek.toISOString().substring(0, 10); // YYYY-MM-DD format
      allWeeks.push({
        week: weekKey,
        totalSets: 0,
        totalVolume: 0,
        uniqueExercises: new Set(),
        exerciseVolumes: {}
      });
      currentWeek.setDate(currentWeek.getDate() + 7); // Move to next week
    }

    // Get exercise sets data
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        performed_at,
        weight,
        reps,
        sets,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endOfWeek.toISOString())
      .order('performed_at', { ascending: true });

    if (error) throw error;

    // Group by week and calculate stats
    const weeklyDataMap = new Map();
    allWeeks.forEach(w => {
      weeklyDataMap.set(w.week, {
        ...w,
        exerciseVolumes: {}
      });
    });

    data?.forEach(set => {
      const setDate = new Date(set.performed_at);
      // Find which week this set belongs to (week starts on Sunday)
      const weekStart = new Date(setDate);
      weekStart.setDate(setDate.getDate() - setDate.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekKey = weekStart.toISOString().substring(0, 10);
      
      const weekData = weeklyDataMap.get(weekKey);
      
      if (weekData) {
        const volume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
        const exerciseName = set.exercises?.name || 'Unknown';
        
        weekData.totalSets += 1;
        weekData.totalVolume += volume;
        weekData.uniqueExercises.add(exerciseName);
        
        // Accumulate volume per exercise
        if (!weekData.exerciseVolumes[exerciseName]) {
          weekData.exerciseVolumes[exerciseName] = 0;
        }
        weekData.exerciseVolumes[exerciseName] += volume;
      }
    });

    return Array.from(weeklyDataMap.values()).map(week => ({
      week: week.week,
      workouts: week.uniqueExercises.size,
      completedWorkouts: week.uniqueExercises.size,
      totalSets: week.totalSets,
      totalVolume: week.totalVolume,
      avgWeight: week.totalSets > 0 ? week.totalVolume / week.totalSets : 0,
      completionRate: 100,
      exerciseVolumes: week.exerciseVolumes || {}
    }));
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    return [];
  }
};

export const getMonthlyDetailData = async (userId, month) => {
  try {
    // month format: "YYYY-MM"
    // Calculate start and end of the specified month
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(year, monthNum, 0); // Last day of the month
    endDate.setHours(23, 59, 59, 999);

    // Get exercise sets data for the month
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        performed_at,
        weight,
        reps,
        sets,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        month,
        summary: {
          totalVolume: 0,
          totalSets: 0,
          uniqueExercises: 0,
          workoutDays: 0,
          avgVolumePerDay: 0,
          avgSetsPerDay: 0,
        },
        dailyBreakdown: [],
        exerciseBreakdown: [],
      };
    }

    // Group by day and by exercise
    const dailyData = {};
    const exerciseData = {};
    const uniqueExercises = new Set();
    const workoutDays = new Set();

    data.forEach(set => {
      const date = new Date(set.performed_at);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const exerciseName = set.exercises?.name || 'Unknown';
      
      const volume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
      const setsCount = set.sets || 1;
      const reps = set.reps || 0;

      // Daily breakdown
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          totalVolume: 0,
          totalSets: 0,
          exercises: new Set(),
          exerciseVolumes: {},
        };
      }
      dailyData[dateKey].totalVolume += volume;
      dailyData[dateKey].totalSets += setsCount;
      dailyData[dateKey].exercises.add(exerciseName);
      workoutDays.add(dateKey);
      
      if (!dailyData[dateKey].exerciseVolumes[exerciseName]) {
        dailyData[dateKey].exerciseVolumes[exerciseName] = 0;
      }
      dailyData[dateKey].exerciseVolumes[exerciseName] += volume;

      // Exercise breakdown
      if (!exerciseData[exerciseName]) {
        exerciseData[exerciseName] = {
          exercise: exerciseName,
          totalVolume: 0,
          totalSets: 0,
          totalReps: 0,
          workoutDays: new Set(),
        };
      }
      exerciseData[exerciseName].totalVolume += volume;
      exerciseData[exerciseName].totalSets += setsCount;
      exerciseData[exerciseName].totalReps += reps * setsCount;
      exerciseData[exerciseName].workoutDays.add(dateKey);
      uniqueExercises.add(exerciseName);
    });

    // Convert daily data to array and sort by date
    const dailyBreakdown = Object.values(dailyData)
      .map(day => ({
        date: day.date,
        totalVolume: day.totalVolume,
        totalSets: day.totalSets,
        exerciseCount: day.exercises.size,
        exercises: Array.from(day.exercises),
        exerciseVolumes: day.exerciseVolumes,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Convert exercise data to array and sort by volume (descending)
    const exerciseBreakdown = Object.values(exerciseData)
      .map(ex => ({
        exercise: ex.exercise,
        totalVolume: ex.totalVolume,
        totalSets: ex.totalSets,
        totalReps: ex.totalReps,
        workoutDays: ex.workoutDays.size,
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume);

    // Calculate summary statistics
    const totalVolume = dailyBreakdown.reduce((sum, day) => sum + day.totalVolume, 0);
    const totalSets = dailyBreakdown.reduce((sum, day) => sum + day.totalSets, 0);
    const totalReps = exerciseBreakdown.reduce((sum, ex) => sum + ex.totalReps, 0);
    const workoutDaysCount = workoutDays.size;
    const avgVolumePerDay = workoutDaysCount > 0 ? totalVolume / workoutDaysCount : 0;
    const avgSetsPerDay = workoutDaysCount > 0 ? totalSets / workoutDaysCount : 0;
    const avgWeightPerSet = totalSets > 0 ? totalVolume / totalReps : 0;
    const avgRepsPerSet = totalSets > 0 ? totalReps / totalSets : 0;

    // Find best day (highest volume)
    const bestDay = dailyBreakdown.length > 0 
      ? dailyBreakdown.reduce((best, current) => 
          current.totalVolume > best.totalVolume ? current : best
        )
      : null;

    // Weekly breakdown
    const weeklyData = {};
    dailyBreakdown.forEach(day => {
      const date = new Date(day.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: weekKey,
          totalVolume: 0,
          totalSets: 0,
          workoutDays: 0,
        };
      }
      weeklyData[weekKey].totalVolume += day.totalVolume;
      weeklyData[weekKey].totalSets += day.totalSets;
      weeklyData[weekKey].workoutDays += 1;
    });
    const weeklyBreakdown = Object.values(weeklyData)
      .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

    // Days of week analysis
    const daysOfWeek = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // Sunday = 0
    dailyBreakdown.forEach(day => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();
      daysOfWeek[dayOfWeek] += 1;
    });
    const mostActiveDay = Object.entries(daysOfWeek)
      .reduce((max, [day, count]) => count > max.count ? { day: parseInt(day), count } : max, { day: 0, count: 0 });
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Volume trend (comparing first half vs second half of month)
    let volumeTrend = 'stable';
    if (dailyBreakdown.length >= 4) {
      const midpoint = Math.floor(dailyBreakdown.length / 2);
      const firstHalf = dailyBreakdown.slice(0, midpoint).reduce((sum, day) => sum + day.totalVolume, 0);
      const secondHalf = dailyBreakdown.slice(midpoint).reduce((sum, day) => sum + day.totalVolume, 0);
      const firstHalfAvg = firstHalf / midpoint;
      const secondHalfAvg = secondHalf / (dailyBreakdown.length - midpoint);
      
      if (secondHalfAvg > firstHalfAvg * 1.1) {
        volumeTrend = 'increasing';
      } else if (secondHalfAvg < firstHalfAvg * 0.9) {
        volumeTrend = 'decreasing';
      }
    }

    return {
      month,
      summary: {
        totalVolume,
        totalSets,
        totalReps,
        uniqueExercises: uniqueExercises.size,
        workoutDays: workoutDaysCount,
        avgVolumePerDay,
        avgSetsPerDay,
        avgWeightPerSet,
        avgRepsPerSet,
        volumeTrend,
        mostActiveDay: mostActiveDay.count > 0 ? dayNames[mostActiveDay.day] : null,
        bestDay: bestDay ? {
          date: bestDay.date,
          totalVolume: bestDay.totalVolume,
          totalSets: bestDay.totalSets,
        } : null,
      },
      dailyBreakdown,
      exerciseBreakdown,
      weeklyBreakdown,
      daysOfWeek: Object.entries(daysOfWeek).map(([day, count]) => ({
        day: parseInt(day),
        dayName: dayNames[parseInt(day)],
        count,
      })),
    };
  } catch (error) {
    console.error('Error fetching monthly detail data:', error);
    return {
      month,
      summary: {
        totalVolume: 0,
        totalSets: 0,
        uniqueExercises: 0,
        workoutDays: 0,
        avgVolumePerDay: 0,
        avgSetsPerDay: 0,
      },
      dailyBreakdown: [],
      exerciseBreakdown: [],
    };
  }
};

export const getPersonalRecords = async (userId, limit = 10, days = null) => {
  try {
    const endDate = new Date();
    let query = supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        performed_at,
        unit,
        exercises!inner(name)
      `)
      .eq('user_id', userId);
    
    // If days is provided, filter by date range
    if (days !== null) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      query = query
        .gte('performed_at', startDate.toISOString())
        .lte('performed_at', endDate.toISOString());
    }
    
    query = query
      .order('performed_at', { ascending: false })
      .limit(1000);

    const { data, error } = await query;

    if (error) throw error;

    const computeOneRM = (weight, reps) => {
      const w = Number(weight) || 0;
      const r = Number(reps) || 1;
      return w * (1 + r / 30);
    };

    // Group by exercise and find best 1RM
    const records = data?.reduce((acc, set) => {
      const exerciseName = set.exercises?.name || 'Unknown';
      const oneRM = computeOneRM(set.weight, set.reps);
      
      if (!acc[exerciseName] || oneRM > acc[exerciseName].oneRM) {
        acc[exerciseName] = {
          exercise: exerciseName,
          weight: set.weight,
          reps: set.reps,
          oneRM: oneRM,
          date: set.performed_at,
          unit: set.unit || 'kg'
        };
      }
      
      return acc;
    }, {}) || {};

    return Object.values(records)
      .sort((a, b) => b.oneRM - a.oneRM)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching personal records:', error);
    return [];
  }
};

// New functions for enhanced progressive overload insights
export const getRPEAnalysis = async (userId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        rpe,
        performed_at,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .not('rpe', 'is', null)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (error) throw error;

    // Analyze RPE trends
    const rpeAnalysis = data?.reduce((acc, set) => {
      const exerciseName = set.exercises?.name || 'Unknown';
      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          exercise: exerciseName,
          avgRPE: 0,
          rpeTrend: [],
          totalSets: 0,
          intensity: 'moderate'
        };
      }
      
      acc[exerciseName].rpeTrend.push({
        rpe: set.rpe,
        date: set.performed_at,
        weight: set.weight,
        reps: set.reps
      });
      acc[exerciseName].totalSets += 1;
      
      return acc;
    }, {}) || {};

    // Calculate average RPE and trends
    Object.values(rpeAnalysis).forEach(exercise => {
      const rpeValues = exercise.rpeTrend.map(t => t.rpe);
      exercise.avgRPE = rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length;
      
      // Determine intensity level
      if (exercise.avgRPE >= 8.5) exercise.intensity = 'high';
      else if (exercise.avgRPE >= 6.5) exercise.intensity = 'moderate';
      else exercise.intensity = 'low';
    });

    return Object.values(rpeAnalysis);
  } catch (error) {
    console.error('Error fetching RPE analysis:', error);
    return [];
  }
};

export const getProgressiveOverloadInsights = async (userId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        performed_at,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (error) throw error;

    const computeOneRM = (weight, reps) => {
      const w = Number(weight) || 0;
      const r = Number(reps) || 1;
      return w * (1 + r / 30);
    };

    // Group by exercise and analyze progression
    const progression = data?.reduce((acc, set) => {
      const exerciseName = set.exercises?.name || 'Unknown';
      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          exercise: exerciseName,
          sets: [],
          progression: 'stable',
          recommendation: '',
          weeklyGain: 0
        };
      }
      
      acc[exerciseName].sets.push({
        weight: set.weight,
        reps: set.reps,
        oneRM: computeOneRM(set.weight, set.reps),
        date: set.performed_at
      });
      
      return acc;
    }, {}) || {};

    // Analyze progression for each exercise
    Object.values(progression).forEach(exercise => {
      if (exercise.sets.length < 2) {
        exercise.progression = 'stable';
        exercise.recommendation = 'Log more workouts to track progression accurately';
        exercise.weeklyGain = 0;
        exercise.totalGain = 0;
        exercise.timeSeriesData = [];
        exercise.isPlateaued = false;
        return;
      }

      // Sort by date
      exercise.sets.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Create time-series data grouped by date
      const dailyData = {};
      exercise.sets.forEach(set => {
        const date = new Date(set.date).toISOString().split('T')[0];
        if (!dailyData[date]) {
          dailyData[date] = {
            date,
            oneRMs: [],
            weights: [],
            reps: []
          };
        }
        dailyData[date].oneRMs.push(set.oneRM);
        dailyData[date].weights.push(set.weight);
        dailyData[date].reps.push(set.reps);
      });

      // Convert to time-series array with avg and max 1RM per day
      exercise.timeSeriesData = Object.values(dailyData)
        .map(day => ({
          date: day.date,
          avg1RM: day.oneRMs.reduce((sum, val) => sum + val, 0) / day.oneRMs.length,
          max1RM: Math.max(...day.oneRMs),
          avgWeight: day.weights.reduce((sum, val) => sum + Number(val), 0) / day.weights.length,
          avgReps: day.reps.reduce((sum, val) => sum + Number(val), 0) / day.reps.length
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Split into first half and second half
      const midPoint = Math.ceil(exercise.sets.length / 2);
      const firstHalf = exercise.sets.slice(0, midPoint);
      const secondHalf = exercise.sets.slice(-midPoint);
      
      const firstAvg = firstHalf.reduce((sum, set) => sum + set.oneRM, 0) / firstHalf.length;
      const lastAvg = secondHalf.reduce((sum, set) => sum + set.oneRM, 0) / secondHalf.length;
      
      // Calculate total gain over the period
      const totalGain = ((lastAvg - firstAvg) / firstAvg) * 100;
      
      // Calculate actual time span in weeks
      const firstDate = new Date(exercise.sets[0].date);
      const lastDate = new Date(exercise.sets[exercise.sets.length - 1].date);
      const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
      const weeksDiff = Math.max(daysDiff / 7, 1); // At least 1 week to avoid division by zero
      
      // Calculate weekly gain rate
      const weeklyGain = totalGain / weeksDiff;
      
      exercise.totalGain = totalGain;
      exercise.weeklyGain = weeklyGain;
      exercise.timeSpanWeeks = weeksDiff;
      exercise.starting1RM = firstAvg;
      exercise.ending1RM = lastAvg;
      exercise.workoutCount = new Set(exercise.sets.map(s => new Date(s.date).toISOString().split('T')[0])).size;
      exercise.totalSets = exercise.sets.length;

      // Plateau Detection Logic
      let isPlateaued = false;
      let plateauDuration = 0;
      let plateauReason = '';
      let plateauType = 'general';

      if (exercise.timeSeriesData.length >= 3) {
        // Get last 3-4 weeks of data (or last 3-4 data points if less frequent)
        const recentDataPoints = Math.min(4, exercise.timeSeriesData.length);
        const recentData = exercise.timeSeriesData.slice(-recentDataPoints);
        
        // Calculate weekly gains for recent period
        const recentWeeklyGains = [];
        for (let i = 1; i < recentData.length; i++) {
          const prev1RM = recentData[i - 1].avg1RM;
          const curr1RM = recentData[i].avg1RM;
          const dateDiff = (new Date(recentData[i].date) - new Date(recentData[i - 1].date)) / (1000 * 60 * 60 * 24);
          const weeks = Math.max(dateDiff / 7, 0.1);
          const weeklyGain = ((curr1RM - prev1RM) / prev1RM) * 100 / weeks;
          recentWeeklyGains.push(weeklyGain);
        }

        // Check if all recent weekly gains are < 0.1%
        const allLowGains = recentWeeklyGains.length > 0 && recentWeeklyGains.every(gain => Math.abs(gain) < 0.1);
        
        // Check if 1RM variance is < 2% over recent period
        const recent1RMs = recentData.map(d => d.avg1RM);
        const min1RM = Math.min(...recent1RMs);
        const max1RM = Math.max(...recent1RMs);
        const variance = ((max1RM - min1RM) / min1RM) * 100;
        const lowVariance = variance < 2;

        // Calculate days since last significant improvement (>1% gain)
        let daysSinceImprovement = 0;
        let lastSignificantGain = null;
        for (let i = recentData.length - 1; i > 0; i--) {
          const prev1RM = recentData[i - 1].avg1RM;
          const curr1RM = recentData[i].avg1RM;
          const gain = ((curr1RM - prev1RM) / prev1RM) * 100;
          if (gain > 1) {
            lastSignificantGain = new Date(recentData[i].date);
            break;
          }
        }
        
        if (lastSignificantGain) {
          daysSinceImprovement = (new Date() - lastSignificantGain) / (1000 * 60 * 60 * 24);
        } else {
          // No significant gain found in recent data, check if we have older data
          if (exercise.timeSeriesData.length > recentData.length) {
            const olderData = exercise.timeSeriesData.slice(0, -recentData.length);
            for (let i = olderData.length - 1; i > 0; i--) {
              const prev1RM = olderData[i - 1].avg1RM;
              const curr1RM = olderData[i].avg1RM;
              const gain = ((curr1RM - prev1RM) / prev1RM) * 100;
              if (gain > 1) {
                lastSignificantGain = new Date(olderData[i].date);
                daysSinceImprovement = (new Date() - lastSignificantGain) / (1000 * 60 * 60 * 24);
                break;
              }
            }
          }
        }

        // Determine if plateaued
        if ((allLowGains || lowVariance) && daysSinceImprovement >= 14) {
          isPlateaued = true;
          plateauDuration = Math.floor(daysSinceImprovement);
          
          // Determine plateau type based on workout frequency and volume
          const workoutFrequency = exercise.workoutCount / weeksDiff;
          const avgSetsPerWorkout = exercise.totalSets / exercise.workoutCount;
          
          if (workoutFrequency < 1) {
            plateauType = 'frequency';
            plateauReason = 'Low workout frequency may be limiting progress';
          } else if (avgSetsPerWorkout < 3) {
            plateauType = 'volume';
            plateauReason = 'Low training volume may be limiting progress';
          } else if (variance < 1 && recentWeeklyGains.every(g => g < -0.05)) {
            plateauType = 'intensity';
            plateauReason = 'Strength may be declining, consider deload';
          } else {
            plateauType = 'general';
            plateauReason = 'Progress has stalled despite consistent training';
          }
        }
      }

      exercise.isPlateaued = isPlateaued;
      exercise.plateauDuration = plateauDuration;
      exercise.plateauReason = plateauReason;
      exercise.plateauType = plateauType;
      
      // Classify progression based on weekly gain (more accurate thresholds)
      if (weeklyGain > 2) {
        exercise.progression = 'excellent';
        exercise.recommendation = `Amazing ${totalGain.toFixed(1)}% gain! Keep up the momentum`;
      } else if (weeklyGain > 0.5) {
        exercise.progression = 'good';
        exercise.recommendation = `Solid ${totalGain.toFixed(1)}% progress! Stay consistent`;
      } else if (weeklyGain > -0.5) {
        exercise.progression = 'stable';
        exercise.recommendation = 'Maintaining strength. Try increasing weight or volume';
      } else {
        exercise.progression = 'declining';
        exercise.recommendation = 'Strength decreasing. Check recovery and form';
      }

      // Override recommendation if plateaued
      if (isPlateaued) {
        const weeksPlateaued = Math.floor(plateauDuration / 7);
        switch (plateauType) {
          case 'volume':
            exercise.recommendation = `Plateau detected (${weeksPlateaued} weeks). Try increasing sets or reps by 10-15%`;
            break;
          case 'frequency':
            exercise.recommendation = `Plateau detected (${weeksPlateaued} weeks). Increase workout frequency for this exercise`;
            break;
          case 'intensity':
            exercise.recommendation = `Plateau detected (${weeksPlateaued} weeks). Consider deload week, then increase weight by 2.5-5%`;
            break;
          default:
            exercise.recommendation = `Plateau detected (${weeksPlateaued} weeks). Mix up rep ranges or try variation exercises`;
        }
      }
    });

    return Object.values(progression);
  } catch (error) {
    console.error('Error fetching progressive overload insights:', error);
    return [];
  }
};

// Get progressive overload insights with comparison to previous period
export const getProgressiveOverloadComparison = async (userId, currentDays = 30) => {
  try {
    // Get current period insights
    const currentInsights = await getProgressiveOverloadInsights(userId, currentDays);
    
    // Calculate previous period (same duration, shifted back)
    const previousDays = currentDays;
    const endDate = new Date();
    const previousEndDate = new Date();
    previousEndDate.setDate(previousEndDate.getDate() - currentDays);
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - (currentDays * 2));
    
    // Get previous period insights by fetching data for that period
    const previousInsights = await getProgressiveOverloadInsights(userId, currentDays * 2);
    
    // Filter previous insights to only include those in the previous period
    const previousPeriodInsights = previousInsights.map(exercise => {
      // Filter sets to only include those in previous period
      const filteredSets = exercise.sets.filter(set => {
        const setDate = new Date(set.date);
        return setDate >= previousStartDate && setDate < previousEndDate;
      });
      
      if (filteredSets.length < 2) {
        return null;
      }
      
      // Recalculate metrics for previous period only
      filteredSets.sort((a, b) => new Date(a.date) - new Date(b.date));
      const midPoint = Math.ceil(filteredSets.length / 2);
      const firstHalf = filteredSets.slice(0, midPoint);
      const secondHalf = filteredSets.slice(-midPoint);
      
      const firstAvg = firstHalf.reduce((sum, set) => sum + set.oneRM, 0) / firstHalf.length;
      const lastAvg = secondHalf.reduce((sum, set) => sum + set.oneRM, 0) / secondHalf.length;
      
      const firstDate = new Date(filteredSets[0].date);
      const lastDate = new Date(filteredSets[filteredSets.length - 1].date);
      const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
      const weeksDiff = Math.max(daysDiff / 7, 1);
      
      const totalGain = ((lastAvg - firstAvg) / firstAvg) * 100;
      const weeklyGain = totalGain / weeksDiff;
      const workoutCount = new Set(filteredSets.map(s => new Date(s.date).toISOString().split('T')[0])).size;
      
      return {
        exercise: exercise.exercise,
        totalGain,
        weeklyGain,
        workoutCount,
        timeSpanWeeks: weeksDiff,
        totalSets: filteredSets.length
      };
    }).filter(ex => ex !== null);
    
    // Create comparison metrics
    const comparison = {
      current: {
        totalExercises: currentInsights.length,
        avgTotalGain: currentInsights.length > 0 
          ? currentInsights.reduce((sum, i) => sum + (i.totalGain || 0), 0) / currentInsights.length 
          : 0,
        avgWeeklyGain: currentInsights.length > 0
          ? currentInsights.reduce((sum, i) => sum + (i.weeklyGain || 0), 0) / currentInsights.length
          : 0,
        totalWorkouts: currentInsights.reduce((sum, i) => sum + (i.workoutCount || 0), 0),
        avgWorkoutsPerWeek: currentInsights.length > 0
          ? currentInsights.reduce((sum, i) => sum + ((i.workoutCount || 0) / (i.timeSpanWeeks || 1)), 0) / currentInsights.length
          : 0,
        totalVolume: currentInsights.reduce((sum, i) => {
          // Estimate volume from sets (weight * reps * sets)
          return sum + (i.totalSets || 0) * 10; // Rough estimate
        }, 0)
      },
      previous: {
        totalExercises: previousPeriodInsights.length,
        avgTotalGain: previousPeriodInsights.length > 0
          ? previousPeriodInsights.reduce((sum, i) => sum + (i.totalGain || 0), 0) / previousPeriodInsights.length
          : 0,
        avgWeeklyGain: previousPeriodInsights.length > 0
          ? previousPeriodInsights.reduce((sum, i) => sum + (i.weeklyGain || 0), 0) / previousPeriodInsights.length
          : 0,
        totalWorkouts: previousPeriodInsights.reduce((sum, i) => sum + (i.workoutCount || 0), 0),
        avgWorkoutsPerWeek: previousPeriodInsights.length > 0
          ? previousPeriodInsights.reduce((sum, i) => sum + ((i.workoutCount || 0) / (i.timeSpanWeeks || 1)), 0) / previousPeriodInsights.length
          : 0,
        totalVolume: previousPeriodInsights.reduce((sum, i) => {
          return sum + (i.totalSets || 0) * 10; // Rough estimate
        }, 0)
      }
    };
    
    // Calculate changes
    comparison.totalGainChange = comparison.current.avgTotalGain - comparison.previous.avgTotalGain;
    comparison.weeklyGainChange = comparison.current.avgWeeklyGain - comparison.previous.avgWeeklyGain;
    comparison.workoutFrequencyChange = comparison.current.avgWorkoutsPerWeek - comparison.previous.avgWorkoutsPerWeek;
    comparison.volumeChange = comparison.current.totalVolume - comparison.previous.totalVolume;
    comparison.workoutCountChange = comparison.current.totalWorkouts - comparison.previous.totalWorkouts;
    
    return {
      currentInsights,
      comparison
    };
  } catch (error) {
    console.error('Error fetching progressive overload comparison:', error);
    return {
      currentInsights: [],
      comparison: null
    };
  }
};

export const getVolumeAnalysis = async (userId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        sets,
        performed_at,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (error) throw error;

    // Calculate daily volume
    const dailyVolume = data?.reduce((acc, set) => {
      const date = new Date(set.performed_at).toISOString().split('T')[0];
      const volume = (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
      
      if (!acc[date]) {
        acc[date] = { date, totalVolume: 0, exerciseCount: 0, exercises: new Set() };
      }
      
      acc[date].totalVolume += volume;
      acc[date].exerciseCount += 1;
      acc[date].exercises.add(set.exercises?.name || 'Unknown');
      
      return acc;
    }, {}) || {};

    const volumeData = Object.values(dailyVolume);
    const totalVolume = volumeData.reduce((sum, day) => sum + day.totalVolume, 0);
    
    // Average per workout day (not per calendar day)
    const avgVolumePerWorkout = totalVolume / Math.max(volumeData.length, 1);
    
    // Average across all days in the timeframe (including rest days)
    const avgDailyVolume = totalVolume / Math.max(days, 1);
    
    const maxVolume = Math.max(...volumeData.map(d => d.totalVolume), 0);
    
    // Calculate trend by comparing first half vs second half
    let trend = 'stable';
    if (volumeData.length >= 4) {
      const midPoint = Math.floor(volumeData.length / 2);
      const firstHalf = volumeData.slice(0, midPoint);
      const secondHalf = volumeData.slice(midPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.totalVolume, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.totalVolume, 0) / secondHalf.length;
      
      const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
      
      if (percentChange > 5) {
        trend = 'increasing';
      } else if (percentChange < -5) {
        trend = 'decreasing';
      }
    } else if (volumeData.length >= 2) {
      // Fallback for small datasets
      trend = volumeData[volumeData.length - 1].totalVolume > volumeData[0].totalVolume ? 'increasing' : 'decreasing';
    }

    return {
      totalVolume,
      avgDailyVolume,
      avgVolumePerWorkout,
      maxVolume,
      dailyData: volumeData,
      workoutDays: volumeData.length,
      trend
    };
  } catch (error) {
    console.error('Error fetching volume analysis:', error);
    return { 
      totalVolume: 0, 
      avgDailyVolume: 0, 
      avgVolumePerWorkout: 0,
      maxVolume: 0, 
      dailyData: [], 
      workoutDays: 0,
      trend: 'stable' 
    };
  }
};

// Get muscle group heatmap data aggregated from exercise sets
export const getMuscleGroupHeatmapData = async (userId, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all exercise sets with exercise muscle group data
    const { data: setsData, error } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        sets,
        performed_at,
        exercises!inner(
          name,
          muscle_groups
        )
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString());

    if (error) throw error;

    // Aggregate by muscle group
    const muscleGroupStats = {};
    
    setsData?.forEach(set => {
      const volume = (Number(set.weight) || 0) * (Number(set.reps) || 0) * (Number(set.sets) || 1);
      const muscleGroups = set.exercises?.muscle_groups;
      
      if (!muscleGroups) return;
      
      // Handle both object format { primary: [], secondary: [] } and array format
      let primaryMuscles = [];
      let secondaryMuscles = [];
      
      if (Array.isArray(muscleGroups)) {
        // If it's an array, treat as primary muscles
        primaryMuscles = muscleGroups;
      } else if (typeof muscleGroups === 'object') {
        primaryMuscles = muscleGroups.primary || muscleGroups.primaryMuscles || [];
        secondaryMuscles = muscleGroups.secondary || muscleGroups.secondaryMuscles || [];
      }
      
      // Process primary muscles (100% credit)
      primaryMuscles.forEach(muscle => {
        if (!muscle) return;
        const muscleName = String(muscle).toLowerCase();
        if (!muscleGroupStats[muscleName]) {
          muscleGroupStats[muscleName] = {
            volume: 0,
            sets: 0,
            exercises: new Set(),
            primaryVolume: 0,
            secondaryVolume: 0
          };
        }
        muscleGroupStats[muscleName].volume += volume;
        muscleGroupStats[muscleName].primaryVolume += volume;
        muscleGroupStats[muscleName].sets += (Number(set.sets) || 1);
        muscleGroupStats[muscleName].exercises.add(set.exercises.name);
      });
      
      // Process secondary muscles (30% credit)
      secondaryMuscles.forEach(muscle => {
        if (!muscle) return;
        const muscleName = String(muscle).toLowerCase();
        const secondaryVolume = volume * 0.3;
        if (!muscleGroupStats[muscleName]) {
          muscleGroupStats[muscleName] = {
            volume: 0,
            sets: 0,
            exercises: new Set(),
            primaryVolume: 0,
            secondaryVolume: 0
          };
        }
        muscleGroupStats[muscleName].volume += secondaryVolume;
        muscleGroupStats[muscleName].secondaryVolume += secondaryVolume;
        muscleGroupStats[muscleName].sets += (Number(set.sets) || 1) * 0.3;
        muscleGroupStats[muscleName].exercises.add(set.exercises.name);
      });
    });

    // Convert Sets to arrays and format for return
    const formattedStats = Object.entries(muscleGroupStats).map(([muscleGroup, stats]) => ({
      muscleGroup,
      volume: stats.volume,
      sets: Math.round(stats.sets),
      exerciseCount: stats.exercises.size,
      exercises: Array.from(stats.exercises),
      primaryVolume: stats.primaryVolume,
      secondaryVolume: stats.secondaryVolume
    }));

    // Sort by volume descending
    formattedStats.sort((a, b) => b.volume - a.volume);

    return formattedStats;
  } catch (error) {
    console.error('Error fetching muscle group heatmap data:', error);
    return [];
  }
};

// Get exercise sets by muscle group
export const getExerciseSetsByMuscleGroup = async (userId, muscleGroup, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all exercise sets with exercise muscle group data
    const { data: setsData, error } = await supabase
      .from('exercise_sets')
      .select(`
        id,
        weight,
        reps,
        sets,
        performed_at,
        exercises!inner(
          name,
          muscle_groups
        )
      `)
      .eq('user_id', userId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: false });

    if (error) throw error;

    // Filter sets that target the specified muscle group
    const filteredSets = [];
    const muscleGroupLower = String(muscleGroup).toLowerCase();

    setsData?.forEach(set => {
      const muscleGroups = set.exercises?.muscle_groups;
      if (!muscleGroups) return;

      // Handle both object format { primary: [], secondary: [] } and array format
      let primaryMuscles = [];
      let secondaryMuscles = [];

      if (Array.isArray(muscleGroups)) {
        primaryMuscles = muscleGroups.map(m => String(m).toLowerCase());
      } else if (typeof muscleGroups === 'object') {
        primaryMuscles = (muscleGroups.primary || muscleGroups.primaryMuscles || []).map(m => String(m).toLowerCase());
        secondaryMuscles = (muscleGroups.secondary || muscleGroups.secondaryMuscles || []).map(m => String(m).toLowerCase());
      }

      // Include set if muscle group is in primary or secondary muscles
      if (primaryMuscles.includes(muscleGroupLower) || secondaryMuscles.includes(muscleGroupLower)) {
        filteredSets.push(set);
      }
    });

    return filteredSets;
  } catch (error) {
    console.error('Error fetching exercise sets by muscle group:', error);
    return [];
  }
};

// Get detailed analytics for a specific exercise
export const getExerciseDetailedAnalytics = async (userId, exerciseName, days = 30) => {
  try {
    // If days is null or very large (all time), get all data
    const endDate = new Date();
    const startDate = days ? new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000) : new Date('2000-01-01');

    // First, get the exercise ID by name
    const { data: exerciseData, error: exerciseError } = await supabase
      .from('exercises')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', exerciseName)
      .single();

    if (exerciseError || !exerciseData) {
      console.error('Exercise not found:', exerciseError);
      return null;
    }

    const exerciseId = exerciseData.id;

    // Get all sets for this exercise within the timeframe
    const { data: setsData, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .gte('performed_at', startDate.toISOString())
      .lte('performed_at', endDate.toISOString())
      .order('performed_at', { ascending: true });

    if (setsError) throw setsError;

    if (!setsData || setsData.length === 0) {
      return {
        exerciseName,
        timeSeriesData: [],
        peakWeight: 0,
        peakReps: 0,
        totalVolume: 0,
        avgSetsPerWorkout: 0,
        weightTrend: 'stable',
        weightTrendPercent: 0,
        repsTrend: 'stable',
        repsTrendPercent: 0,
        setsTrend: 'stable',
        setsTrendPercent: 0,
        workoutsPerWeek: 0,
        allTimeStats: null
      };
    }

    // Group data by date for daily aggregations
    const dailyData = setsData.reduce((acc, set) => {
      const date = new Date(set.performed_at).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          weights: [],
          reps: [],
          totalSets: 0,
          totalVolume: 0
        };
      }
      
      acc[date].weights.push(Number(set.weight) || 0);
      acc[date].reps.push(Number(set.reps) || 0);
      acc[date].totalSets += Number(set.sets) || 1;
      acc[date].totalVolume += (Number(set.weight) || 0) * (Number(set.reps) || 0) * (Number(set.sets) || 1);
      
      return acc;
    }, {});

    // Convert to array and calculate averages/maxes for each day
    const timeSeriesData = Object.values(dailyData).map(day => ({
      date: day.date,
      avgWeight: day.weights.reduce((a, b) => a + b, 0) / day.weights.length,
      maxWeight: Math.max(...day.weights),
      avgReps: day.reps.reduce((a, b) => a + b, 0) / day.reps.length,
      maxReps: Math.max(...day.reps),
      totalSets: day.totalSets,
      totalVolume: day.totalVolume
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate overall metrics
    const peakWeight = Math.max(...setsData.map(s => Number(s.weight) || 0));
    const peakReps = Math.max(...setsData.map(s => Number(s.reps) || 0));
    const totalVolume = setsData.reduce((sum, s) => 
      sum + (Number(s.weight) || 0) * (Number(s.reps) || 0) * (Number(s.sets) || 1), 0);
    
    // Count unique workout days
    const uniqueDays = new Set(setsData.map(s => new Date(s.performed_at).toISOString().split('T')[0])).size;
    const totalSets = setsData.reduce((sum, s) => sum + (Number(s.sets) || 1), 0);
    const avgSetsPerWorkout = uniqueDays > 0 ? totalSets / uniqueDays : 0;

    // Calculate trends (first half vs second half)
    const midPoint = Math.floor(timeSeriesData.length / 2);
    if (timeSeriesData.length >= 2) {
      const firstHalf = timeSeriesData.slice(0, midPoint);
      const secondHalf = timeSeriesData.slice(midPoint);
      
      const firstHalfAvgWeight = firstHalf.reduce((sum, d) => sum + d.avgWeight, 0) / firstHalf.length;
      const secondHalfAvgWeight = secondHalf.reduce((sum, d) => sum + d.avgWeight, 0) / secondHalf.length;
      const weightChange = ((secondHalfAvgWeight - firstHalfAvgWeight) / firstHalfAvgWeight) * 100;
      
      const firstHalfAvgReps = firstHalf.reduce((sum, d) => sum + d.avgReps, 0) / firstHalf.length;
      const secondHalfAvgReps = secondHalf.reduce((sum, d) => sum + d.avgReps, 0) / secondHalf.length;
      const repsChange = ((secondHalfAvgReps - firstHalfAvgReps) / firstHalfAvgReps) * 100;

      const firstHalfAvgSets = firstHalf.reduce((sum, d) => sum + d.totalSets, 0) / firstHalf.length;
      const secondHalfAvgSets = secondHalf.reduce((sum, d) => sum + d.totalSets, 0) / secondHalf.length;
      const setsChange = ((secondHalfAvgSets - firstHalfAvgSets) / firstHalfAvgSets) * 100;

      var weightTrend = weightChange > 2 ? 'up' : weightChange < -2 ? 'down' : 'stable';
      var weightTrendPercent = Math.abs(weightChange);
      var repsTrend = repsChange > 2 ? 'up' : repsChange < -2 ? 'down' : 'stable';
      var repsTrendPercent = Math.abs(repsChange);
      var setsTrend = setsChange > 2 ? 'up' : setsChange < -2 ? 'down' : 'stable';
      var setsTrendPercent = Math.abs(setsChange);
    } else {
      var weightTrend = 'stable';
      var weightTrendPercent = 0;
      var repsTrend = 'stable';
      var repsTrendPercent = 0;
      var setsTrend = 'stable';
      var setsTrendPercent = 0;
    }

    // Calculate workouts per week
    const daysDiff = (endDate - new Date(setsData[0].performed_at)) / (1000 * 60 * 60 * 24);
    const workoutsPerWeek = (uniqueDays / Math.max(daysDiff, 1)) * 7;

    // Get top 5 heaviest lifts (by weight)
    const topLifts = [...setsData]
      .map(set => ({
        weight: Number(set.weight) || 0,
        reps: Number(set.reps) || 0,
        sets: Number(set.sets) || 1,
        performed_at: set.performed_at,
        volume: (Number(set.weight) || 0) * (Number(set.reps) || 0) * (Number(set.sets) || 1)
      }))
      .sort((a, b) => {
        // Sort by weight first, then by volume if weights are equal
        if (b.weight !== a.weight) {
          return b.weight - a.weight;
        }
        return b.volume - a.volume;
      })
      .slice(0, 5)
      .map((set, index) => ({
        rank: index + 1,
        weight: set.weight,
        reps: set.reps,
        sets: set.sets,
        date: set.performed_at,
        volume: set.volume
      }));

    return {
      exerciseName,
      timeSeriesData,
      peakWeight,
      peakReps,
      totalVolume,
      avgSetsPerWorkout,
      weightTrend,
      weightTrendPercent,
      repsTrend,
      repsTrendPercent,
      setsTrend,
      setsTrendPercent,
      workoutsPerWeek,
      allTimeStats: null, // Will be populated separately if needed
      topLifts
    };
  } catch (error) {
    console.error('Error fetching exercise detailed analytics:', error);
    return null;
  }
};