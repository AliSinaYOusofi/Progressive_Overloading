// Exercise matching utility to match database exercises with exercises.json
// and extract muscle group information

let cachedExerciseDatabase = null;

/**
 * Load and cache the exercise database from exercises.json
 * @returns {Promise<Array>} Array of exercise objects
 */
export const loadExerciseDatabase = async () => {
  if (cachedExerciseDatabase) {
    return cachedExerciseDatabase;
  }
  
  try {
    // Import the local exercises.json file
    const exercisesData = require('./exercises.json');
    cachedExerciseDatabase = exercisesData;
    return exercisesData;
  } catch (error) {
    console.error('Error loading exercise database:', error);
    return [];
  }
};

/**
 * Normalize exercise name for matching (lowercase, trim, remove special chars)
 * @param {string} name - Exercise name
 * @returns {string} Normalized name
 */
const normalizeExerciseName = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

/**
 * Calculate similarity between two strings (simple Levenshtein-like)
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Similarity score (0-1, higher is more similar)
 */
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Exact match
  if (str1 === str2) return 1.0;
  
  // Contains match
  if (longer.includes(shorter)) return 0.8;
  
  // Word-based matching
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w));
  if (commonWords.length > 0 && commonWords.length === Math.min(words1.length, words2.length)) {
    return 0.7;
  }
  
  // Calculate edit distance
  const editDistance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (editDistance / maxLength);
};

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} Edit distance
 */
const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

/**
 * Score a match quality - higher score = better match
 * Prefers standard variants (Barbell, no special modifiers, shorter names, expected primary muscles)
 */
const scoreMatchQuality = (exercise, normalizedInput) => {
  let score = 0;
  const normalizedName = normalizeExerciseName(exercise.name);
  const name = exercise.name;
  
  // Exact match gets highest score
  if (normalizedName === normalizedInput) {
    score += 1000;
  }
  
  // Prefer Barbell variants (standard equipment)
  if (/^barbell\s+/i.test(name)) {
    score += 100;
  }
  
  // Penalize special modifiers (prefer simpler variants)
  const specialModifiers = [
    /powerlifting/i,
    /with bands/i,
    /with chains/i,
    /close-grip/i,
    /wide-grip/i,
    /machine/i,
    /cable/i,
    /smith/i,
    /kettlebell/i,
    /dumbbell/i,
    /decline/i,
    /guillotine/i,
  ];
  
  let modifierPenalty = 0;
  specialModifiers.forEach(pattern => {
    if (pattern.test(name)) {
      modifierPenalty += 20;
    }
  });
  score -= modifierPenalty;
  
  // Prefer shorter names (fewer words = simpler)
  const wordCount = name.split(/\s+/).length;
  score += (10 - Math.min(wordCount, 10)) * 2;
  
  // For Bench Press, prefer chest as primary muscle
  if (normalizedInput.includes('bench') && normalizedInput.includes('press')) {
    const primaryMuscles = (exercise.primaryMuscles || []).map(m => normalizeExerciseName(String(m)));
    if (primaryMuscles.some(m => m === 'chest' || m.includes('chest'))) {
      score += 50;
    }
  }
  
  // For Squat, prefer quads/glutes as primary
  if (normalizedInput.includes('squat')) {
    const primaryMuscles = (exercise.primaryMuscles || []).map(m => normalizeExerciseName(String(m)));
    const preferredMuscles = ['quadriceps', 'glutes', 'glute', 'quad'];
    if (primaryMuscles.some(m => preferredMuscles.some(pm => m.includes(pm) || pm.includes(m)))) {
      score += 50;
    }
  }
  
  // For Deadlift, prefer back/hamstrings as primary
  if (normalizedInput.includes('deadlift')) {
    const primaryMuscles = (exercise.primaryMuscles || []).map(m => normalizeExerciseName(String(m)));
    const preferredMuscles = ['quadriceps', 'hamstrings', 'glutes', 'lower back', 'back'];
    if (primaryMuscles.some(m => preferredMuscles.some(pm => m.includes(pm) || pm.includes(m)))) {
      score += 50;
    }
  }
  
  // Prefer names that start with the input (better prefix match)
  if (normalizedName.startsWith(normalizedInput)) {
    score += 30;
  }
  
  // Penalize names with parentheses (usually less standard)
  if (name.includes('(') || name.includes(')')) {
    score -= 10;
  }
  
  return score;
};

/**
 * Match an exercise name against the exercises.json database
 * @param {string} exerciseName - Exercise name from database
 * @returns {Promise<Object|null>} Matched exercise object or null
 */
export const matchExercise = async (exerciseName) => {
  if (!exerciseName || !exerciseName.trim()) {
    return null;
  }
  
  const exercises = await loadExerciseDatabase();
  if (!exercises || exercises.length === 0) {
    return null;
  }
  
  const normalizedInput = normalizeExerciseName(exerciseName);
  
  // First, try exact match (case-insensitive)
  let match = exercises.find(ex => 
    normalizeExerciseName(ex.name) === normalizedInput
  );
  
  if (match) {
    return match;
  }
  
  // Try contains match - collect ALL matches instead of returning first
  const containsMatches = exercises.filter(ex => {
    const normalizedEx = normalizeExerciseName(ex.name);
    return normalizedEx.includes(normalizedInput) || normalizedInput.includes(normalizedEx);
  });
  
  if (containsMatches.length > 0) {
    // Score all matches and return the best one
    const scoredMatches = containsMatches.map(ex => ({
      exercise: ex,
      score: scoreMatchQuality(ex, normalizedInput)
    }));
    
    // Sort by score (descending) and return the best match
    scoredMatches.sort((a, b) => b.score - a.score);
    return scoredMatches[0].exercise;
  }
  
  // Try fuzzy matching with similarity threshold
  let bestMatch = null;
  let bestScore = 0;
  const threshold = 0.6; // Minimum similarity score
  
  for (const ex of exercises) {
    const normalizedEx = normalizeExerciseName(ex.name);
    const similarity = calculateSimilarity(normalizedInput, normalizedEx);
    
    if (similarity > bestScore && similarity >= threshold) {
      bestScore = similarity;
      bestMatch = ex;
    }
  }
  
  return bestMatch;
};

/**
 * Extract muscle groups from a matched exercise
 * @param {Object} exercise - Matched exercise object from exercises.json
 * @returns {Object|null} Object with primary and secondary muscle arrays, or null
 */
export const extractMuscleGroups = (exercise) => {
  if (!exercise) {
    return null;
  }
  
  return {
    primary: exercise.primaryMuscles || [],
    secondary: exercise.secondaryMuscles || []
  };
};

/**
 * Match exercise and extract muscle groups in one call
 * @param {string} exerciseName - Exercise name from database
 * @returns {Promise<Object|null>} Object with primary and secondary muscle arrays, or null
 */
export const getMuscleGroupsForExercise = async (exerciseName) => {
  const matchedExercise = await matchExercise(exerciseName);
  if (!matchedExercise) {
    return null;
  }
  
  return extractMuscleGroups(matchedExercise);
};

