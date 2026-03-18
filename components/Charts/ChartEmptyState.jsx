import React from "react";
import { View, Text } from "react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";

export default function ChartEmptyState({ icon: Icon, title, message, accent }) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const accentColor = accent || colors.primary[600];

    return (
        <View style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 48,
            paddingHorizontal: 24,
            backgroundColor: colors.background.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border.light,
            overflow: "hidden",
        }}>
            {/* Decorative background glow */}
            <View style={{
                position: "absolute",
                top: -40,
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: accentColor,
                opacity: isDarkMode ? 0.06 : 0.04,
            }} />

            {/* Icon — glassy squircle */}
            <View style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: isDarkMode
                    ? `${accentColor}20`
                    : `${accentColor}12`,
                borderWidth: 1,
                borderColor: isDarkMode
                    ? `${accentColor}30`
                    : `${accentColor}18`,
                alignItems: "center",
                justifyContent: "center",
            }}>
                {Icon && <Icon size={26} color={accentColor} />}
            </View>

            {/* Title */}
            <Text style={{
                fontSize: 17,
                fontWeight: "700",
                color: colors.text.primary,
                textAlign: "center",
                marginTop: 20,
            }}>
                {title}
            </Text>

            {/* Message */}
            {message && (
                <Text style={{
                    fontSize: 14,
                    fontWeight: "400",
                    color: colors.text.tertiary,
                    textAlign: "center",
                    lineHeight: 21,
                    marginTop: 8,
                    maxWidth: 280,
                }}>
                    {message}
                </Text>
            )}

            {/* Accent brand line */}
            <View style={{
                width: 32,
                height: 2.5,
                borderRadius: 2,
                backgroundColor: accentColor,
                opacity: isDarkMode ? 0.4 : 0.25,
                marginTop: 16,
            }} />
        </View>
    );
}
