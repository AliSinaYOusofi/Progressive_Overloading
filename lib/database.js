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
      .select('created_at, weight_kg, reps')
      .eq('user_id', userId)
      .gte('created_at', startOfWeek.toISOString())
      .order('created_at');

    if (error) throw error;

    // Create weekly progress array based on sets data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProgress = days.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      
      // Check if there are any sets logged on this day
      const daySets = data?.filter(set => {
        const setDate = new Date(set.created_at);
        return setDate.toDateString() === dayDate.toDateString();
      }) || [];

      const hasSets = daySets.length > 0;
      const totalWeight = daySets.reduce((sum, set) => sum + (set.weight_kg || 0), 0);

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

    // Get exercise sets data directly from the table we're actually using
    const { data: setsData, error: setsError } = await supabase
      .from('exercise_sets')
      .select(`
        id,
        weight_kg,
        reps,
        set_number,
        created_at,
        workout_exercises!inner(
          exercises!inner(name, category)
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (setsError) throw setsError;

    // Group by exercise and calculate 1RM for each set
    const computeOneRM = (weight, reps) => {
      const w = Number(weight) || 0;
      const r = Number(reps) || 1;
      return w * (1 + r / 30);
    };

    const grouped = setsData?.reduce((acc, set) => {
      const exerciseName = set.workout_exercises?.exercises?.name || 'Unknown';
      if (!acc[exerciseName]) {
        acc[exerciseName] = [];
      }
      acc[exerciseName].push({
        id: set.id,
        weight: set.weight_kg,
        reps: set.reps,
        oneRM: computeOneRM(set.weight_kg, set.reps),
        date: set.created_at
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
        weight_kg,
        reps,
        set_number,
        created_at,
        workout_exercises!inner(
          exercises!inner(name)
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date and calculate daily volume
    const dailyVolume = data?.reduce((acc, set) => {
      const date = new Date(set.created_at).toISOString().split('T')[0];
      const volume = (set.weight_kg || 0) * (set.reps || 0) * (set.set_number || 1);
      
      if (!acc[date]) {
        acc[date] = { date, totalVolume: 0, exerciseCount: 0, exercises: new Set() };
      }
      
      acc[date].totalVolume += volume;
      acc[date].exerciseCount += 1;
      acc[date].exercises.add(set.workout_exercises?.exercises?.name || 'Unknown');
      
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
        weight_kg,
        reps,
        workout_exercises!inner(
          exercises!inner(name)
        )
      `)
      .eq('user_id', userId)
      .in('workout_exercises.exercises.name', ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const computeOneRM = (weight, reps) => {
      const w = Number(weight) || 0;
      const r = Number(reps) || 1;
      return w * (1 + r / 30);
    };

    const standards = data?.reduce((acc, set) => {
      const exerciseName = set.workout_exercises?.exercises?.name;
      if (!exerciseName) return acc;

      const oneRM = computeOneRM(set.weight_kg, set.reps);
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

    // Get exercise sets data instead of workout sessions
    const { data, error } = await supabase
      .from('exercise_sets')
      .select(`
        created_at,
        weight_kg,
        reps,
        workout_exercises!inner(
          exercises!inner(name)
        )
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by month and calculate stats based on sets
    const monthlyData = data?.reduce((acc, set) => {
      const month = new Date(set.created_at).toISOString().substring(0, 7); // YYYY-MM
      
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
      acc[month].totalVolume += (set.weight_kg || 0) * (set.reps || 0);
      acc[month].uniqueExercises.add(set.workout_exercises?.exercises?.name || 'Unknown');
      
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
        weight_kg,
        reps,
        set_number,
        created_at,
        workout_exercises!inner(
          exercises!inner(name, category)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    const computeOneRM = (weight, reps) => {
      const w = Number(weight) || 0;
      const r = Number(reps) || 1;
      return w * (1 + r / 30);
    };

    // Group by exercise and find best 1RM
    const records = data?.reduce((acc, set) => {
      const exerciseName = set.workout_exercises?.exercises?.name || 'Unknown';
      const oneRM = computeOneRM(set.weight_kg, set.reps);
      
      if (!acc[exerciseName] || oneRM > acc[exerciseName].oneRM) {
        acc[exerciseName] = {
          exercise: exerciseName,
          weight: set.weight_kg,
          reps: set.reps,
          oneRM: oneRM,
          date: set.created_at,
          category: set.workout_exercises?.exercises?.category
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