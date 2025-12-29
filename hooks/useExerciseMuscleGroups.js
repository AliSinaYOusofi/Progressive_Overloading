import { useState, useEffect, useMemo } from 'react';
import { getMuscleGroupsForExercise } from '../utils/exerciseMatcher';

/**
 * Format muscle group name for display
 * @param {string} muscleGroup - Muscle group name (e.g., "chest")
 * @returns {string} Formatted name (e.g., "Chest")
 */
const formatMuscleGroupName = (muscleGroup) => {
  if (!muscleGroup) return null;
  return muscleGroup
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Hook to fetch and cache muscle groups for exercise names
 * @param {string[]} exerciseNames - Array of exercise names to look up
 * @returns {Object} Map of exercise name -> primary muscle group name (formatted)
 */
export const useExerciseMuscleGroups = (exerciseNames) => {
  const [muscleGroupCache, setMuscleGroupCache] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  // Filter out exercises we've already cached or are currently loading
  const exercisesToFetch = useMemo(() => {
    if (!exerciseNames || exerciseNames.length === 0) return [];
    return exerciseNames.filter(name => 
      !muscleGroupCache[name] && 
      !loadingMap[name] &&
      name && name.trim()
    );
  }, [exerciseNames, muscleGroupCache, loadingMap]);

  // Fetch muscle groups for exercises that aren't cached yet
  useEffect(() => {
    if (exercisesToFetch.length === 0) return;

    const fetchMuscleGroups = async () => {
      // Mark exercises as loading
      setLoadingMap(prev => {
        const newMap = { ...prev };
        exercisesToFetch.forEach(name => {
          newMap[name] = true;
        });
        return newMap;
      });

      // Fetch muscle groups for all exercises in parallel
      const fetchPromises = exercisesToFetch.map(async (exerciseName) => {
        try {
          const muscleGroups = await getMuscleGroupsForExercise(exerciseName);
          if (muscleGroups && muscleGroups.primary && muscleGroups.primary.length > 0) {
            const primaryMuscle = muscleGroups.primary[0];
            return {
              exerciseName,
              muscleGroup: formatMuscleGroupName(primaryMuscle)
            };
          }
          return {
            exerciseName,
            muscleGroup: null
          };
        } catch (error) {
          console.error(`Error fetching muscle group for ${exerciseName}:`, error);
          return {
            exerciseName,
            muscleGroup: null
          };
        }
      });

      const results = await Promise.all(fetchPromises);

      // Update cache with results
      setMuscleGroupCache(prev => {
        const newCache = { ...prev };
        results.forEach(({ exerciseName, muscleGroup }) => {
          newCache[exerciseName] = muscleGroup;
        });
        return newCache;
      });

      // Clear loading state
      setLoadingMap(prev => {
        const newMap = { ...prev };
        exercisesToFetch.forEach(name => {
          delete newMap[name];
        });
        return newMap;
      });
    };

    fetchMuscleGroups();
  }, [exercisesToFetch]);

  // Return a function to get muscle group for an exercise name
  return useMemo(() => {
    return (exerciseName) => {
      if (!exerciseName) return null;
      return muscleGroupCache[exerciseName] || null;
    };
  }, [muscleGroupCache]);
};

