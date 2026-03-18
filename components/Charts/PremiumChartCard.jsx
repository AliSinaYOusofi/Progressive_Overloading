import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate
} from "react-native-reanimated";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function PremiumChartCard({
    icon: IconComponent,
    title,
    subtitle,
    onPress,
    badge,
    accent,
    disabled = false
}) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();

    const cardAccent = accent || colors.primary[600];

    const pressProgress = useSharedValue(0);

    // Card: scale + subtle push-down
    const cardAnimatedStyle = useAnimatedStyle(() => {
        const scale = interpolate(pressProgress.value, [0, 1], [1, 0.97], Extrapolate.CLAMP);
        const translateY = interpolate(pressProgress.value, [0, 1], [0, 1.5], Extrapolate.CLAMP);
        return { transform: [{ scale }, { translateY }] };
    });

    // Background glow pulses brighter on press
    const glowAnimatedStyle = useAnimatedStyle(() => {
        const base = isDarkMode ? 0.06 : 0.04;
        const pressed = isDarkMode ? 0.14 : 0.09;
        const opacity = interpolate(pressProgress.value, [0, 1], [base, pressed], Extrapolate.CLAMP);
        return { opacity };
    });

    // Chevron: slide right + scale up
    const chevronAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: interpolate(pressProgress.value, [0, 1], [0, 4], Extrapolate.CLAMP) },
            { scale: interpolate(pressProgress.value, [0, 1], [1, 1.1], Extrapolate.CLAMP) },
        ],
    }));

    const handlePressIn = () => {
        pressProgress.value = withSpring(1, { damping: 15, stiffness: 300, mass: 0.8 });
    };

    const handlePressOut = () => {
        pressProgress.value = withSpring(0, { damping: 18, stiffness: 300, mass: 0.8 });
    };

    const getBadgeColors = () => {
        if (badge === 'PRO' || badge === 'PREMIUM') {
            return {
                bg: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(168, 85, 247, 0.1)',
                text: isDarkMode ? '#C4B5FD' : '#7C3AED'
            };
        }
        if (badge === 'NEW') {
            return {
                bg: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                text: isDarkMode ? '#86EFAC' : '#16A34A'
            };
        }
        if (badge === 'BETA' || badge === 'beta') {
            return {
                bg: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)',
                text: isDarkMode ? '#FED7AA' : '#EA580C'
            };
        }
        if (badge && !isNaN(badge)) {
            return {
                bg: isDarkMode ? `${cardAccent}20` : `${cardAccent}12`,
                text: cardAccent,
            };
        }
        return {
            bg: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)',
            text: isDarkMode ? '#A5B4FC' : '#4F46E5'
        };
    };

    const badgeColors = getBadgeColors();

    return (
        <AnimatedTouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                {
                    borderRadius: 22,
                    marginBottom: 14,
                    overflow: 'hidden',
                    opacity: disabled ? 0.5 : 1,
                    shadowColor: isDarkMode ? cardAccent : cardAccent,
                    shadowOffset: { width: 0, height: isDarkMode ? 8 : 6 },
                    shadowOpacity: disabled ? 0 : (isDarkMode ? 0.25 : 0.12),
                    shadowRadius: isDarkMode ? 20 : 16,
                    elevation: isDarkMode ? 6 : 4,
                },
                cardAnimatedStyle,
            ]}
        >
            <View
                style={{
                    backgroundColor: colors.background.card,
                    borderWidth: 1,
                    borderColor: isDarkMode
                        ? `${cardAccent}25`
                        : `${cardAccent}15`,
                    borderRadius: 22,
                    overflow: 'hidden',
                }}
            >
                {/* Background accent glow — top-right corner */}
                <AnimatedView
                    style={[
                        {
                            position: 'absolute',
                            top: -30,
                            right: -30,
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            backgroundColor: cardAccent,
                        },
                        glowAnimatedStyle,
                    ]}
                />

                <View style={{ padding: 18 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                        {/* Icon Container — glassy with accent border */}
                        {IconComponent && (
                            <View
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 16,
                                    backgroundColor: isDarkMode
                                        ? `${cardAccent}20`
                                        : `${cardAccent}12`,
                                    borderWidth: 1,
                                    borderColor: isDarkMode
                                        ? `${cardAccent}30`
                                        : `${cardAccent}18`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 14,
                                }}
                            >
                                <IconComponent size={24} color={cardAccent} />
                            </View>
                        )}

                        {/* Content */}
                        <View style={{ flex: 1 }}>
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: subtitle ? 5 : 0,
                            }}>
                                <Text
                                    style={{
                                        fontSize: 16.5,
                                        fontWeight: "700",
                                        letterSpacing: -0.4,
                                        color: colors.text.primary,
                                    }}
                                    numberOfLines={1}
                                >
                                    {title}
                                </Text>

                                {badge && (
                                    <View
                                        style={{
                                            paddingHorizontal: 8,
                                            paddingVertical: 3,
                                            borderRadius: 8,
                                            backgroundColor: badgeColors.bg,
                                            borderWidth: 1,
                                            borderColor: `${badgeColors.text}20`,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 10,
                                            fontWeight: "700",
                                            color: badgeColors.text,
                                            letterSpacing: 0.3,
                                        }}>
                                            {badge}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {subtitle && (
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: "500",
                                        lineHeight: 18,
                                        color: colors.text.tertiary,
                                        letterSpacing: -0.1,
                                    }}
                                    numberOfLines={2}
                                >
                                    {subtitle}
                                </Text>
                            )}

                            {/* Accent brand line */}
                            <View style={{
                                width: 24,
                                height: 2.5,
                                borderRadius: 2,
                                backgroundColor: cardAccent,
                                opacity: isDarkMode ? 0.4 : 0.25,
                                marginTop: 8,
                            }} />
                        </View>

                        {/* Chevron — glassy with accent border */}
                        <AnimatedView
                            style={[
                                {
                                    marginLeft: 12,
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    backgroundColor: isDarkMode
                                        ? `${cardAccent}18`
                                        : `${cardAccent}10`,
                                    borderWidth: 1,
                                    borderColor: isDarkMode
                                        ? `${cardAccent}28`
                                        : `${cardAccent}15`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                                chevronAnimatedStyle,
                            ]}
                        >
                            <ChevronRight
                                size={16}
                                color={cardAccent}
                                strokeWidth={2.5}
                            />
                        </AnimatedView>
                    </View>
                </View>
            </View>
        </AnimatedTouchableOpacity>
    );
}
