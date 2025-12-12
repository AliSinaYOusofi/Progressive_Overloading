/**
 * Utility functions for monthly trends data processing
 */

/**
 * Sorts monthly stats based on sortBy and sortOrder
 * @param {Array} monthlyStats - Array of monthly stat objects
 * @param {string} sortBy - Sort field ('date', 'volume', 'sets', 'exercises')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted monthly stats
 */
export const sortMonthlyStats = (monthlyStats, sortBy = 'date', sortOrder = 'desc') => {
    if (!monthlyStats || !Array.isArray(monthlyStats)) return [];
    
    const sorted = [...monthlyStats].filter(m => m && m.month && typeof m.month === 'string').sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'date':
                const dateA = a.month.includes('-') ? a.month + "-01" : a.month;
                const dateB = b.month.includes('-') ? b.month + "-01" : b.month;
                comparison = new Date(dateA).getTime() - new Date(dateB).getTime();
                break;
            case 'volume':
                comparison = (a.totalVolume || 0) - (b.totalVolume || 0);
                break;
            case 'sets':
                comparison = (a.totalSets || 0) - (b.totalSets || 0);
                break;
            case 'exercises':
                comparison = (a.workouts || 0) - (b.workouts || 0);
                break;
            default:
                // Default: sort by date descending
                const defaultDateA = a.month.includes('-') ? a.month + "-01" : a.month;
                const defaultDateB = b.month.includes('-') ? b.month + "-01" : b.month;
                comparison = new Date(defaultDateB).getTime() - new Date(defaultDateA).getTime();
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
};

/**
 * Prepares comparison data between two months
 * @param {Array} monthlyStats - Array of monthly stat objects
 * @param {string} month1 - First month (YYYY-MM format)
 * @param {string} month2 - Second month (YYYY-MM format)
 * @returns {Array} Comparison data with exercise volumes for both months
 */
export const prepareMonthlyComparisonData = (monthlyStats, month1, month2) => {
    if (!monthlyStats || !Array.isArray(monthlyStats) || !month1 || !month2) {
        return [];
    }

    // Normalize month strings
    const normalizeMonth = (monthStr) => {
        if (!monthStr) return null;
        if (typeof monthStr === 'string' && /^\d{4}-\d{2}$/.test(monthStr)) {
            return monthStr;
        }
        // If it's a Date object or other format, try to extract YYYY-MM
        try {
            const date = new Date(monthStr);
            if (isNaN(date.getTime())) return null;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        } catch {
            return null;
        }
    };

    const normalizedMonth1 = normalizeMonth(month1);
    const normalizedMonth2 = normalizeMonth(month2);

    if (!normalizedMonth1 || !normalizedMonth2) {
        return [];
    }

    // Find entries for both months
    const entry1 = monthlyStats.find(month => {
        if (!month || !month.month) return false;
        const monthDate = normalizeMonth(month.month);
        return monthDate === normalizedMonth1;
    });

    const entry2 = monthlyStats.find(month => {
        if (!month || !month.month) return false;
        const monthDate = normalizeMonth(month.month);
        return monthDate === normalizedMonth2;
    });

    if (!entry1 || !entry2) {
        return [];
    }

    const exerciseVolumes1 = entry1.exerciseVolumes || {};
    const exerciseVolumes2 = entry2.exerciseVolumes || {};

    // Normalize exercise names (case-insensitive, trimmed)
    const normalizeExerciseName = (name) => {
        return (name || '').trim().toLowerCase();
    };

    const normalizedMap1 = {};
    const normalizedMap2 = {};
    const originalNameMap = {};

    Object.keys(exerciseVolumes1).forEach(exercise => {
        const normalized = normalizeExerciseName(exercise);
        normalizedMap1[normalized] = exerciseVolumes1[exercise];
        originalNameMap[normalized] = exercise;
    });

    Object.keys(exerciseVolumes2).forEach(exercise => {
        const normalized = normalizeExerciseName(exercise);
        normalizedMap2[normalized] = exerciseVolumes2[exercise];
        if (!originalNameMap[normalized]) {
            originalNameMap[normalized] = exercise;
        }
    });

    // Find common exercises
    const commonExercisesNormalized = Object.keys(normalizedMap1).filter(exercise =>
        normalizedMap2.hasOwnProperty(exercise)
    );

    if (commonExercisesNormalized.length === 0) {
        return [];
    }

    // Create comparison data
    const comparisonData = commonExercisesNormalized.map(normalizedExercise => {
        const originalName = originalNameMap[normalizedExercise];
        return {
            exercise: originalName,
            month1Volume: normalizedMap1[normalizedExercise] || 0,
            month2Volume: normalizedMap2[normalizedExercise] || 0,
        };
    });

    // Sort by total volume (descending)
    comparisonData.sort((a, b) => {
        const totalA = a.month1Volume + a.month2Volume;
        const totalB = b.month1Volume + b.month2Volume;
        return totalB - totalA;
    });

    return comparisonData;
};
