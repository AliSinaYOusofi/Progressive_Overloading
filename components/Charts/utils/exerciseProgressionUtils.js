/**
 * Utility functions for exercise progression data processing
 */

/**
 * Calculates the progression rate percentage from first to last 1RM
 * @param {Array} exerciseData - Array of exercise data points
 * @returns {number} Progression rate as a percentage
 */
export const calculateProgressionRate = (exerciseData) => {
    if (!exerciseData || !Array.isArray(exerciseData) || exerciseData.length < 2) return 0;
    const first = exerciseData[0]?.oneRM || 0;
    const last = exerciseData[exerciseData.length - 1]?.oneRM || 0;
    if (first === 0) return last > 0 ? 100 : 0;
    return ((last - first) / first) * 100;
};

/**
 * Formats exercise progression data into a list of exercises with calculated metrics
 * @param {Object} exerciseProgression - Object mapping exercise names to their data arrays
 * @returns {Array} List of exercise objects with name, data, last1RM, and progressionRate (unsorted)
 */
export const getExerciseList = (exerciseProgression) => {
    const exercises = Object.keys(exerciseProgression || {})
        .map(name => {
            const data = exerciseProgression[name] || [];
            if (!data.length) return null;
            
            const last1RM = data[data.length - 1]?.oneRM || 0;
            const progressionRate = calculateProgressionRate(data);
            
            return {
                name,
                data,
                last1RM,
                progressionRate,
            };
        })
        .filter(ex => ex !== null && ex.last1RM > 0);
    
    return exercises;
};

/**
 * Formats exercise data for sparkline visualization (normalized to 0-100)
 * @param {Array} exerciseData - Array of exercise data points
 * @returns {Array} Normalized data points for LineChart
 */
export const formatSparklineData = (exerciseData) => {
    if (!exerciseData || !Array.isArray(exerciseData) || exerciseData.length === 0) return [];
    
    // Take last 15 points or all if less
    const points = exerciseData.slice(-15);
    const values = points.map(p => p?.oneRM || 0);
    
    if (values.length === 0) return [];
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1; // Avoid division by zero
    
    // Normalize values to 0-100 for sparkline display
    return values.map((value, index) => ({
        value: range > 0 ? ((value - minValue) / range) * 100 : 50,
        label: index === values.length - 1 ? '' : '', // Only show label on last point if needed
    }));
};

/**
 * Sorts exercise list based on sortBy and sortOrder
 * @param {Array} exerciseList - Array of exercise objects
 * @param {string} sortBy - Sort field ('name', 'last1RM', 'progression', 'records')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted exercise list
 */
export const sortExerciseList = (exerciseList, sortBy = 'last1RM', sortOrder = 'desc') => {
    if (!exerciseList || !Array.isArray(exerciseList)) return [];
    
    const sorted = [...exerciseList].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'last1RM':
                comparison = a.last1RM - b.last1RM;
                break;
            case 'progression':
                comparison = a.progressionRate - b.progressionRate;
                break;
            case 'records':
                comparison = a.data.length - b.data.length;
                break;
            default:
                comparison = b.last1RM - a.last1RM; // Default: highest 1RM first
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
};
