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
export const getPersonalRecords = async (userId, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('personal_records')
      .select(`
        *,
        exercises(name, category)
      `)
      .eq('user_id', userId)
      .order('achieved_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching personal records:', error);
    return [];
  }
};

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

    const { data, error } = await supabase
      .from('workout_sessions')
      .select('started_at, completed_at')
      .eq('user_id', userId)
      .gte('started_at', startOfWeek.toISOString())
      .order('started_at');

    if (error) throw error;

    // Create weekly progress array
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyProgress = days.map((day, index) => {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + index);
      
      const hasWorkout = data?.some(session => {
        const sessionDate = new Date(session.started_at);
        return sessionDate.toDateString() === dayDate.toDateString();
      });

      return {
        day,
        completed: hasWorkout,
        weight: hasWorkout ? Math.floor(Math.random() * 100) + 150 : 0 // Placeholder weight
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
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < data.length; i++) {
      const workoutDate = new Date(data[i].started_at);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
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
    // Get workout count
    const { count: workoutCount, error: workoutError } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (workoutError) throw workoutError;

    // Get current streak
    const currentStreak = await getCurrentStreak(userId);

    // Get personal records count
    const { count: prCount, error: prError } = await supabase
      .from('personal_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    if (prError) throw prError;

    // Get fitness goals progress
    const { data: goals, error: goalsError } = await supabase
      .from('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);
    
    if (goalsError) throw goalsError;

    const completedGoals = goals?.filter(goal => goal.is_completed) || [];
    const goalProgress = goals && goals.length > 0 
      ? Math.round((completedGoals.length / goals.length) * 100) 
      : 0;

    return {
      workoutCount: workoutCount || 0,
      currentStreak,
      personalRecordsCount: prCount || 0,
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