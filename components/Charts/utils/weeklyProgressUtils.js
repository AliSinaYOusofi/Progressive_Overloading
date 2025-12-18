/**
 * Utility functions for weekly progress data processing
 */

/**
 * Prepares comparison data between two weeks
 * @param {Array} weeklyStats - Array of weekly stat objects
 * @param {string} week1 - First week (YYYY-MM-DD format, start of week)
 * @param {string} week2 - Second week (YYYY-MM-DD format, start of week)
 * @returns {Array} Comparison data with exercise volumes for both weeks
 */
export const prepareWeeklyComparisonData = (weeklyStats, week1, week2) => {
    if (!weeklyStats || !Array.isArray(weeklyStats) || !week1 || !week2) {
        return [];
    }

    // Normalize week strings
    const normalizeWeek = (weekStr) => {
        if (!weekStr) return null;
        if (typeof weekStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(weekStr)) {
            return weekStr;
        }
        // If it's a Date object or other format, try to extract YYYY-MM-DD
        try {
            const date = new Date(weekStr);
            if (isNaN(date.getTime())) return null;
            // Set to start of week (Sunday)
            date.setDate(date.getDate() - date.getDay());
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return null;
        }
    };

    const normalizedWeek1 = normalizeWeek(week1);
    const normalizedWeek2 = normalizeWeek(week2);

    if (!normalizedWeek1 || !normalizedWeek2) {
        return [];
    }

    // Find entries for both weeks
    const entry1 = weeklyStats.find(week => {
        if (!week || !week.week) return false;
        const weekDate = normalizeWeek(week.week);
        return weekDate === normalizedWeek1;
    });

    const entry2 = weeklyStats.find(week => {
        if (!week || !week.week) return false;
        const weekDate = normalizeWeek(week.week);
        return weekDate === normalizedWeek2;
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
            week1Volume: normalizedMap1[normalizedExercise] || 0,
            week2Volume: normalizedMap2[normalizedExercise] || 0,
        };
    });

    // Sort by total volume (descending)
    comparisonData.sort((a, b) => {
        const totalA = a.week1Volume + a.week2Volume;
        const totalB = b.week1Volume + b.week2Volume;
        return totalB - totalA;
    });

    return comparisonData;
};

