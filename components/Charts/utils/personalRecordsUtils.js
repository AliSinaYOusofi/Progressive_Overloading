/**
 * Utility functions for personal records data processing
 */

/**
 * Sorts personal records list based on sortBy and sortOrder
 * @param {Array} records - Array of personal record objects
 * @param {string} sortBy - Sort field ('name', 'oneRM', 'weight', 'date')
 * @param {string} sortOrder - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted records list
 */
export const sortPersonalRecords = (records, sortBy = 'oneRM', sortOrder = 'desc') => {
    if (!records || !Array.isArray(records)) return [];
    
    const sorted = [...records].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'name':
                comparison = (a.exercise || '').localeCompare(b.exercise || '');
                break;
            case 'oneRM':
                comparison = (a.oneRM || 0) - (b.oneRM || 0);
                break;
            case 'weight':
                comparison = (a.weight || 0) - (b.weight || 0);
                break;
            case 'date':
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                comparison = dateA - dateB;
                break;
            default:
                comparison = (b.oneRM || 0) - (a.oneRM || 0); // Default: highest 1RM first
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
};
