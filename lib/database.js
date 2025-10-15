import { supabase } from './supabase';

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
};

export const deleteFitnessGoal = async (goalId) => {
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
    if (!findError && found) return found;
  } catch (_) {}
  // Create
  const { data, error } = await supabase
    .from('exercises')
    .insert({ user_id: userId, name: name.trim() })
    .select()
    .single();
  if (error) throw error;
  return data;
};

// Exercise sets operations
export const createExerciseSet = async (setData) => {
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

export const updateExerciseSet = async (setId, updates) => {
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
};

export const deleteExerciseSet = async (setId) => {
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
};

// Analytics and statistics
export const getWeeklyProgress = async (userId) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Get exercise sets data for the current week
    const { data, error } = await supabase
      .from('exercise_sets')
      .select('performed_at, weight, reps, sets')
      .eq('user_id', userId)
      .gte('performed_at', startOfWeek.toISOString())
      .order('performed_at');

    if (error) throw error;

    // Create weekly progress array based on sets data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProgress = days.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      
      // Check if there are any sets logged on this day
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
        const date = new Date(set.created_at || set.performed_at);
        date.setHours(0, 0, 0, 0);
        workoutDates.add(date.toISOString().split('T')[0]);
      });
    }

    // Create activity map for last 365 days (from oldest to newest)
    const activityMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap[dateStr] = workoutDates.has(dateStr);
    }

    // Calculate current streak
    let currentStreak = 0;
    const sortedDates = Array.from(workoutDates).sort().reverse();
    const todayStr = today.toISOString().split('T')[0];
    
    let currentDate = workoutDates.has(todayStr) ? today : new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    for (const dateStr of sortedDates) {
      const setDate = new Date(dateStr);
      setDate.setHours(0, 0, 0, 0);
      
      if (setDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (setDate < currentDate) {
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

    // Get unique dates when sets were logged
    const uniqueDates = [...new Set(data.map(set => {
      const date = new Date(set.created_at);
      date.setHours(0, 0, 0, 0);
      return date.toISOString().split('T')[0];
    }))].sort().reverse();

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Check if today has sets, if not start from yesterday
    let currentDate = uniqueDates.includes(todayStr) ? today : new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    for (const dateStr of uniqueDates) {
      const setDate = new Date(dateStr);
      setDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate - setDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else if (daysDiff > streak + 1) {
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
export const getUserStats = async (userId) => {
  try {
    // Get total sets count
    const { count: setsCount, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (setsError) throw setsError;

    // Get current streak (based on sets)
    const currentStreak = await getCurrentStreak(userId);

    // Get personal records count (from sets data)
    const personalRecords = await getPersonalRecords(userId, 100);
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
      
      
      if (!acc[date]) {
        acc[date] = { date, totalVolume: 0, exerciseCount: 0, exercises: new Set() };
      }
      
      acc[date].totalVolume += volume;
      acc[date].exerciseCount += 1;
      acc[date].exercises.add(set.exercises?.name || 'Unknown');
      
      return acc;
    }, {}) || {};

    return Object.values(dailyVolume).map(day => ({
      ...day,
      exerciseCount: day.exercises.size,
      exercises: Array.from(day.exercises)
    }));
  } catch (error) {
    console.error('Error fetching volume progression data:', error);
    return [];
  }
};

export const getStrengthStandards = async (userId) => {
  try {
    const { data: profile } = await getProfile(userId);
    if (!profile?.weight_kg) return [];

    const bodyWeight = profile.weight_kg;
    
    // Get recent 1RM data for major lifts from exercise_sets
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .in('exercises.name', ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press'])
      .order('performed_at', { ascending: false })
      .limit(100);

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

export const getMonthlyStats = async (userId, months = 6) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

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
    const monthlyData = data?.reduce((acc, set) => {
      const month = new Date(set.performed_at).toISOString().substring(0, 7); // YYYY-MM
      
      if (!acc[month]) {
        acc[month] = {
          month,
          totalSets: 0,
          totalVolume: 0,
          uniqueExercises: new Set(),
          avgWeight: 0
        };
      }
      
      acc[month].totalSets += 1;
      acc[month].totalVolume += (set.weight || 0) * (set.reps || 0) * (set.sets || 1);
      acc[month].uniqueExercises.add(set.exercises?.name || 'Unknown');
      
      return acc;
    }, {}) || {};

    return Object.values(monthlyData).map(month => ({
      month: month.month,
      workouts: month.uniqueExercises.size, // Use unique exercises as "workouts"
      completedWorkouts: month.uniqueExercises.size, // All sets are "completed"
      totalSets: month.totalSets,
      totalVolume: month.totalVolume,
      avgWeight: month.totalSets > 0 ? month.totalVolume / month.totalSets : 0,
      completionRate: 100 // All logged sets are "completed"
    }));
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return [];
  }
};

export const getPersonalRecords = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        weight,
        reps,
        performed_at,
        unit,
        exercises!inner(name)
      `)
      .eq('user_id', userId)
      .order('performed_at', { ascending: false })
      .limit(1000);

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
        return;
      }

      // Sort by date
      exercise.sets.sort((a, b) => new Date(a.date) - new Date(b.date));
      
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
    });

    return Object.values(progression);
  } catch (error) {
    console.error('Error fetching progressive overload insights:', error);
    return [];
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
      allTimeStats: null // Will be populated separately if needed
    };
  } catch (error) {
    console.error('Error fetching exercise detailed analytics:', error);
    return null;
  }
};