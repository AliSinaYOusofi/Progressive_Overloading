// colors.js - Progressive Overloading App Color System

const lightColors = {
    // Primary Colors (Darker Emerald - Energy & Growth)
    primary: {
        50: "#ECFDF5", // emerald-50
        100: "#D1FAE5", // emerald-100 - light backgrounds, badges
        200: "#A7F3D0", // emerald-200
        300: "#6EE7B7", // emerald-300
        400: "#34D399", // emerald-400
        500: "#047857", // emerald-700 - secondary actions (darker)
        600: "#065F46", // emerald-800 - primary buttons, headers (darker)
        700: "#064E3B", // emerald-900
        800: "#043827", // even darker
        900: "#022818", // darkest
    },

    // Neutral Colors (Gray Scale)
    neutral: {
        50: "#F8FAFC", // slate-50 - main background
        100: "#F1F5F9", // gray-100 - card borders, dividers
        200: "#E2E8F0", // gray-200 - cancel buttons, disabled states
        300: "#CBD5E1", // gray-300
        400: "#94A3B8", // gray-400
        500: "#64748B", // gray-500
        600: "#475569", // gray-600 - secondary text, placeholders
        700: "#334155", // gray-700 - primary text, labels
        800: "#1E293B", // gray-800
        900: "#0F172A", // gray-900 - headings, important text
    },

    // Background Colors
    background: {
        primary: "#F8FAFC", // slate-50 - main app background
        card: "#FFFFFF", // white - card backgrounds
        input: "#F9FAFB", // gray-50 - input field backgrounds
        disabled: "#E2E8F0", // gray-200 - disabled button background
    },

    // Text Colors
    text: {
        primary: "#0F172A", // gray-900 - main headings
        secondary: "#334155", // gray-700 - body text, labels
        tertiary: "#475569", // gray-600 - secondary text
        placeholder: "#9CA3AF", // gray-400 - placeholder text
        white: "#FFFFFF", // white text on dark backgrounds
        light: "#D1D5DB", // gray-300 - light text on dark backgrounds
    },

    // Action Colors
    action: {
        primary: "#065F46", // emerald-800 - primary buttons (darker)
        primaryHover: "#064E3B", // emerald-900 - primary button hover (darker)
        secondary: "#047857", // emerald-700 - secondary actions (darker)
        cancel: "#E2E8F0", // gray-200 - cancel buttons
        cancelText: "#334155", // gray-700 - cancel button text
    },

    // Status Colors
    status: {
        success: "#047857", // emerald-700 - success states (darker)
        successLight: "#D1FAE5", // emerald-100 - success backgrounds
        error: "#DC2626", // red-600 - error states, delete actions (darker)
        errorLight: "#FEE2E2", // red-100 - error backgrounds
        warning: "#D97706", // amber-600 - warning states (darker)
        warningLight: "#FEF3C7", // amber-100 - warning backgrounds
        info: "#2563EB", // blue-600 - info states (darker)
        infoLight: "#DBEAFE", // blue-100 - info backgrounds
    },

    // Border Colors
    border: {
        light: "#F1F5F9", // gray-100 - card borders
        medium: "#E2E8F0", // gray-200 - dividers
        focus: "#059669", // emerald-600 - focused input borders
        error: "#EF4444", // red-500 - error input borders
    },

    // Shadow Colors (for elevation)
    shadow: {
        light: "rgba(0, 0, 0, 0.05)", // light card shadows
        medium: "rgba(0, 0, 0, 0.1)", // medium shadows
        dark: "rgba(0, 0, 0, 0.15)", // dark shadows
        colored: "rgba(5, 150, 105, 0.3)", // emerald shadow for primary buttons
    },

    // Icon Colors
    icon: {
        primary: "#475569", // gray-600 - default icon color
        secondary: "#9CA3AF", // gray-400 - secondary icons
        accent: "#065F46", // emerald-800 - accent icons (darker)
        white: "#FFFFFF", // white icons on dark backgrounds
        error: "#DC2626", // red-600 - error/delete icons (darker)
    },
};

const darkColors = {
    // Primary Colors (Emerald - Energy & Growth) - Slightly adjusted for dark mode
    primary: {
        50: "#064E3B", // emerald-900 (inverted)
        100: "#065F46", // emerald-800 (inverted)
        200: "#047857", // emerald-700 (inverted)
        300: "#059669", // emerald-600
        400: "#10B981", // emerald-500
        500: "#34D399", // emerald-400
        600: "#6EE7B7", // emerald-300 - primary buttons, headers
        700: "#A7F3D0", // emerald-200
        800: "#D1FAE5", // emerald-100
        900: "#ECFDF5", // emerald-50
    },

    // Neutral Colors (Dark theme optimized)
    neutral: {
        50: "#0F172A", // slate-900 - darkest background
        100: "#1E293B", // slate-800
        200: "#334155", // slate-700
        300: "#475569", // slate-600
        400: "#64748B", // slate-500
        500: "#94A3B8", // slate-400
        600: "#CBD5E1", // slate-300
        700: "#E2E8F0", // slate-200
        800: "#F1F5F9", // slate-100
        900: "#F8FAFC", // slate-50
    },

    // Background Colors
    background: {
        primary: "#0F172A", // slate-900 - main app background
        card: "#1E293B", // slate-800 - card backgrounds
        input: "#334155", // slate-700 - input field backgrounds
        disabled: "#1E293B", // slate-800 - disabled button background
    },

    // Text Colors
    text: {
        primary: "#F8FAFC", // slate-50 - main headings
        secondary: "#E2E8F0", // slate-200 - body text, labels
        tertiary: "#CBD5E1", // slate-300 - secondary text
        placeholder: "#64748B", // slate-500 - placeholder text
        white: "#FFFFFF", // white text
        light: "#94A3B8", // slate-400 - light text
    },

    // Action Colors
    action: {
        primary: "#10B981", // emerald-500 - primary buttons
        primaryHover: "#34D399", // emerald-400 - primary button hover
        secondary: "#059669", // emerald-600 - secondary actions
        cancel: "#334155", // slate-700 - cancel buttons
        cancelText: "#E2E8F0", // slate-200 - cancel button text
    },

    // Status Colors
    status: {
        success: "#10B981", // emerald-500 - success states
        successLight: "#064E3B", // emerald-900 - success backgrounds
        error: "#EF4444", // red-500 - error states, delete actions
        errorLight: "#7F1D1D", // red-900 - error backgrounds
        warning: "#F59E0B", // amber-500 - warning states
        warningLight: "#78350F", // amber-900 - warning backgrounds
        info: "#3B82F6", // blue-500 - info states
        infoLight: "#1E3A8A", // blue-900 - info backgrounds
    },

    // Border Colors
    border: {
        light: "#334155", // slate-700 - card borders
        medium: "#475569", // slate-600 - dividers
        focus: "#10B981", // emerald-500 - focused input borders
        error: "#EF4444", // red-500 - error input borders
    },

    // Shadow Colors (for elevation)
    shadow: {
        light: "rgba(0, 0, 0, 0.3)", // light card shadows
        medium: "rgba(0, 0, 0, 0.5)", // medium shadows
        dark: "rgba(0, 0, 0, 0.7)", // dark shadows
        colored: "rgba(16, 185, 129, 0.4)", // emerald shadow for primary buttons
    },

    // Icon Colors
    icon: {
        primary: "#CBD5E1", // slate-300 - default icon color
        secondary: "#64748B", // slate-500 - secondary icons
        accent: "#10B981", // emerald-500 - accent icons
        white: "#FFFFFF", // white icons
        error: "#EF4444", // red-500 - error/delete icons
    },
};

// Function to get colors based on theme
export const getColors = (isDarkMode = false) => {
    return isDarkMode ? darkColors : lightColors;
};

// Default export for backward compatibility (light mode)
export const colors = lightColors;

// Semantic Color Aliases function
export const getSemanticColors = (isDarkMode = false) => {
    const themeColors = getColors(isDarkMode);
    
    return {
        // Backgrounds
        appBackground: themeColors.background.primary,
        cardBackground: themeColors.background.card,
        inputBackground: themeColors.background.input,

        // Primary Actions
        primaryButton: themeColors.primary[600],
        primaryButtonHover: themeColors.primary[700],
        primaryButtonText: themeColors.text.white,

        // Secondary Actions
        secondaryButton: themeColors.primary[100],
        secondaryButtonText: themeColors.primary[700],

        // Text
        headingText: themeColors.text.primary,
        bodyText: themeColors.text.secondary,
        captionText: themeColors.text.tertiary,
        placeholderText: themeColors.text.placeholder,

        // States
        successColor: themeColors.status.success,
        errorColor: themeColors.status.error,
        warningColor: themeColors.status.warning,

        // Borders
        defaultBorder: themeColors.border.light,
        focusBorder: themeColors.border.focus,
        errorBorder: themeColors.border.error,
    };
};

// Semantic colors for backward compatibility (light mode)
export const semanticColors = getSemanticColors(false);

export default colors;
