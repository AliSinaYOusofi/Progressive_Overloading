/**
 * Utility functions for volume progression data processing
 */

/**
 * Calculates the volume trend (up, down, or stable)
 * @param {Array} volumeData - Array of volume data points
 * @returns {string|null} Trend: 'up', 'down', 'stable', or null if not enough data
 */
export const calculateVolumeTrend = (volumeData) => {
    if (!volumeData || !Array.isArray(volumeData) || volumeData.length < 2) return null;
    
    const recent = volumeData.slice(-7);
    const previous = volumeData.slice(-14, -7);
    if (recent.length === 0 || previous.length === 0) return null;

    const recentAvg = recent.reduce((sum, d) => sum + (d?.totalVolume || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + (d?.totalVolume || 0), 0) / previous.length;

    if (recentAvg > previousAvg) return 'up';
    if (recentAvg < previousAvg) return 'down';
    return 'stable';
};

/**
 * Formats volume progression data into a list of daily volume entries
 * @param {Array} volumeProgression - Array of daily volume data
 * @returns {Array} List of volume entries with date, totalVolume, exerciseCount, and exercises (unsorted)
 */
export const getVolumeList = (volumeProgression) => {
    if (!volumeProgression || !Array.isArray(volumeProgression)) return [];
    
    return volumeProgression
        .filter(day => day && day.date && day.totalVolume > 0)
        .map(day => ({
            date: day.date,
            totalVolume: day.totalVolume || 0,
            exerciseCount: day.exerciseCount || 0,
            exercises: day.exercises || [],
            exerciseVolumes: day.exerciseVolumes || {}, // Preserve exercise volumes
        }));
};

/**
 * Formats data for trend visualization (normalized to 0-100)
 * @param {Array} volumeData - Array of volume data points
 * @returns {Array} Normalized data points for visualization
 */
export const formatVolumeTrendData = (volumeData) => {
    if (!volumeData || !Array.isArray(volumeData) || volumeData.length === 0) return [];
    
    // Take last 15 points or all if less
    const points = volumeData.slice(-15);
    const values = points.map(p => p?.totalVolume || 0);
    
    if (values.length === 0) return [];
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1; // Avoid division by zero
    
    // Normalize values to 0-100 for trend display
    return values.map((value) => ({
        value: range > 0 ? ((value - minValue) / range) * 100 : 50,
    }));
};

/**
 * Sorts volume list based on sortBy and sortOrder
 * @param {Array} volumeList - Array of volume entry objects
 * @param {string} sortBy - Sort field ('date', 'totalVolume', 'exerciseCount')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted volume list
 */
export const sortVolumeList = (volumeList, sortBy = 'date', sortOrder = 'desc') => {
    if (!volumeList || !Array.isArray(volumeList)) return [];
    
    const sorted = [...volumeList].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'date':
                comparison = new Date(a.date) - new Date(b.date);
                break;
            case 'totalVolume':
                comparison = a.totalVolume - b.totalVolume;
                break;
            case 'exerciseCount':
                comparison = a.exerciseCount - b.exerciseCount;
                break;
            default:
                comparison = new Date(b.date) - new Date(a.date); // Default: newest first
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
};

/**
 * Prepares comparison data for two selected dates
 * @param {Array} volumeProgression - Array of daily volume data
 * @param {string} date1 - First date (ISO string format)
 * @param {string} date2 - Second date (ISO string format)
 * @returns {Array} Array of comparison objects with exercise, date1Volume, date2Volume
 */
export const prepareComparisonData = (volumeProgression, date1, date2) => {
    if (!volumeProgression || !Array.isArray(volumeProgression) || !date1 || !date2) {
        return [];
    }

    // Normalize dates to ISO string format (YYYY-MM-DD)
    // Handle both YYYY-MM-DD strings and Date objects
    const normalizeDate = (dateStr) => {
        if (!dateStr) return null;
        // If already in YYYY-MM-DD format, return as-is
        if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        // Otherwise, parse and convert to YYYY-MM-DD
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        // Use local date components to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const normalizedDate1 = normalizeDate(date1);
    const normalizedDate2 = normalizeDate(date2);

    if (!normalizedDate1 || !normalizedDate2) {
        return [];
    }

    // Find volume entries for both dates
    const entry1 = volumeProgression.find(day => {
        if (!day || !day.date) return false;
        const dayDate = normalizeDate(day.date);
        return dayDate === normalizedDate1;
    });

    const entry2 = volumeProgression.find(day => {
        if (!day || !day.date) return false;
        const dayDate = normalizeDate(day.date);
        return dayDate === normalizedDate2;
    });

    if (!entry1 || !entry2) {
        console.log('Volume comparison: Entries not found', {
            date1: normalizedDate1,
            date2: normalizedDate2,
            foundEntry1: !!entry1,
            foundEntry2: !!entry2,
            availableDates: volumeProgression.map(d => normalizeDate(d.date))
        });
        return [];
    }

    // Get exercise volumes from both dates
    const exerciseVolumes1 = entry1.exerciseVolumes || {};
    const exerciseVolumes2 = entry2.exerciseVolumes || {};

    // Normalize exercise names (case-insensitive, trimmed)
    const normalizeExerciseName = (name) => {
        return (name || '').trim().toLowerCase();
    };

    // Create normalized maps for comparison
    const normalizedMap1 = {};
    const normalizedMap2 = {};
    const originalNameMap = {}; // Map normalized -> original name from date1

    // Build normalized map for date1
    Object.keys(exerciseVolumes1).forEach(exercise => {
        const normalized = normalizeExerciseName(exercise);
        normalizedMap1[normalized] = exerciseVolumes1[exercise];
        originalNameMap[normalized] = exercise; // Store original name
    });

    // Build normalized map for date2
    Object.keys(exerciseVolumes2).forEach(exercise => {
        const normalized = normalizeExerciseName(exercise);
        normalizedMap2[normalized] = exerciseVolumes2[exercise];
    });

    // Find common exercises using normalized names
    const commonExercisesNormalized = Object.keys(normalizedMap1).filter(exercise => 
        normalizedMap2.hasOwnProperty(exercise)
    );

    if (commonExercisesNormalized.length === 0) {
        console.log('Volume comparison: No common exercises found', {
            date1: normalizedDate1,
            date2: normalizedDate2,
            exercises1: Object.keys(exerciseVolumes1),
            exercises2: Object.keys(exerciseVolumes2),
            normalized1: Object.keys(normalizedMap1),
            normalized2: Object.keys(normalizedMap2)
        });
        return [];
    }

    // Prepare comparison data using original exercise names from date1
    const comparisonData = commonExercisesNormalized.map(normalizedExercise => {
        const originalName = originalNameMap[normalizedExercise];
        return {
            exercise: originalName,
            date1Volume: normalizedMap1[normalizedExercise] || 0,
            date2Volume: normalizedMap2[normalizedExercise] || 0,
        };
    });

    // Sort by total volume (date1 + date2) descending
    comparisonData.sort((a, b) => {
        const totalA = a.date1Volume + a.date2Volume;
        const totalB = b.date1Volume + b.date2Volume;
        return totalB - totalA;
    });

    return comparisonData;
};
