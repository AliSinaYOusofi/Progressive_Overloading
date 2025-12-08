import { useTheme } from '../contexts/ThemeContext';
import { getColors, getSemanticColors } from '../constants/ui_colors';

/**
 * Custom hook to get themed colors based on current theme mode
 * @returns {Object} colors - The color palette for current theme
 */
export const useThemedColors = () => {
  const { isDarkMode } = useTheme();
  return getColors(isDarkMode);
};

/**
 * Custom hook to get semantic colors based on current theme mode
 * @returns {Object} semanticColors - The semantic color aliases for current theme
 */
export const useSemanticColors = () => {
  const { isDarkMode } = useTheme();
  return getSemanticColors(isDarkMode);
};

export default useThemedColors;

