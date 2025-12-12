/**
 * Utility functions for progressive overload insights data processing
 */

/**
 * Sorts progressive overload insights based on sortBy and sortOrder
 * @param {Array} insights - Array of insight objects
 * @param {string} sortBy - Sort field ('exercise', 'totalGain', 'weeklyGain', 'progression')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted insights
 */
export const sortProgressiveOverloadInsights = (insights, sortBy = 'totalGain', sortOrder = 'desc') => {
    if (!insights || !Array.isArray(insights)) return [];
    
    const sorted = [...insights].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'exercise':
                comparison = (a.exercise || '').localeCompare(b.exercise || '');
                break;
            case 'totalGain':
                comparison = (a.totalGain || 0) - (b.totalGain || 0);
                break;
            case 'weeklyGain':
                comparison = (a.weeklyGain || 0) - (b.weeklyGain || 0);
                break;
            case 'progression':
                // Order: excellent > good > stable > declining
                const progressionOrder = { 'excellent': 4, 'good': 3, 'stable': 2, 'declining': 1 };
                comparison = (progressionOrder[a.progression] || 0) - (progressionOrder[b.progression] || 0);
                break;
            case 'workoutCount':
                comparison = (a.workoutCount || 0) - (b.workoutCount || 0);
                break;
            default:
                comparison = (b.totalGain || 0) - (a.totalGain || 0);
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
};
