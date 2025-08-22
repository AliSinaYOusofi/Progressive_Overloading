// colors.js - Progressive Overloading App Color System

export const colors = {
    // Primary Colors (Emerald - Energy & Growth)
    primary: {
        50: "#ECFDF5", // emerald-50
        100: "#D1FAE5", // emerald-100 - light backgrounds, badges
        200: "#A7F3D0", // emerald-200
        300: "#6EE7B7", // emerald-300
        400: "#34D399", // emerald-400
        500: "#10B981", // emerald-500 - secondary actions
        600: "#059669", // emerald-600 - primary buttons, headers
        700: "#047857", // emerald-700
        800: "#065F46", // emerald-800
        900: "#064E3B", // emerald-900
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
        primary: "#059669", // emerald-600 - primary buttons
        primaryHover: "#047857", // emerald-700 - primary button hover
        secondary: "#10B981", // emerald-500 - secondary actions
        cancel: "#E2E8F0", // gray-200 - cancel buttons
        cancelText: "#334155", // gray-700 - cancel button text
    },

    // Status Colors
    status: {
        success: "#059669", // emerald-600 - success states
        successLight: "#D1FAE5", // emerald-100 - success backgrounds
        error: "#EF4444", // red-500 - error states, delete actions
        errorLight: "#FEE2E2", // red-100 - error backgrounds
        warning: "#F59E0B", // amber-500 - warning states
        warningLight: "#FEF3C7", // amber-100 - warning backgrounds
        info: "#3B82F6", // blue-500 - info states
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
        accent: "#059669", // emerald-600 - accent icons
        white: "#FFFFFF", // white icons on dark backgrounds
        error: "#EF4444", // red-500 - error/delete icons
    },
};

// Semantic Color Aliases for easier usage
export const semanticColors = {
    // Backgrounds
    appBackground: colors.background.primary,
    cardBackground: colors.background.card,
    inputBackground: colors.background.input,

    // Primary Actions
    primaryButton: colors.primary[600],
    primaryButtonHover: colors.primary[700],
    primaryButtonText: colors.text.white,

    // Secondary Actions
    secondaryButton: colors.primary[100],
    secondaryButtonText: colors.primary[700],

    // Text
    headingText: colors.text.primary,
    bodyText: colors.text.secondary,
    captionText: colors.text.tertiary,
    placeholderText: colors.text.placeholder,

    // States
    successColor: colors.status.success,
    errorColor: colors.status.error,
    warningColor: colors.status.warning,

    // Borders
    defaultBorder: colors.border.light,
    focusBorder: colors.border.focus,
    errorBorder: colors.border.error,
};

export default colors;
