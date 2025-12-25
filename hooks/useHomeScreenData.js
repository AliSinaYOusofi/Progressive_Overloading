import { useState, useEffect } from 'react';
import {
  getCurrentUser,
  getProfile,
  getCurrentStreak,
  getFitnessGoals,
  getExerciseProgressRows,
  getExerciseSetsByUser,
} from '../lib/database';

/**
 * Custom hook for managing home screen data
 */
export const useHomeScreenData = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [progressByExercise, setProgressByExercise] = useState([]);
  const [recentSets, setRecentSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRecentSets = async (userId) => {
    // Increased limit to fetch more days (e.g., last 30-60 days worth of sets)
    // Assuming average of 20-30 sets per day, 500 sets should cover ~20-25 days
    const sets = await getExerciseSetsByUser(userId, 500);
    setRecentSets(sets);
  };

  const loadProgressFromSets = async (userId) => {
    const rows = await getExerciseProgressRows(userId, 1000);
    setProgressByExercise(rows);
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) return;
      setUser(currentUser);

      const [profileData, streakData, goalsData, progressRows] =
        await Promise.all([
          getProfile(currentUser.id),
          getCurrentStreak(currentUser.id),
          getFitnessGoals(currentUser.id),
          getExerciseProgressRows(currentUser.id, 1000),
        ]);

      setProfile(profileData || null);
      setCurrentStreak(streakData || 0);
      setFitnessGoals(goalsData || []);
      setProgressByExercise(progressRows || []);
      await loadRecentSets(currentUser.id);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
    user,
    profile,
    currentStreak,
    fitnessGoals,
    setFitnessGoals,
    progressByExercise,
    recentSets,
    isLoading,
    refreshing,
    onRefresh,
    loadProgressFromSets,
    loadRecentSets,
  };
};

