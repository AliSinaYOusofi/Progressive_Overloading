import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { useTheme } from "../../contexts/ThemeContext";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolate,
} from "react-native-reanimated";

const AnimatedView = Animated.createAnimatedComponent(View);

export default function CollapsibleSection({
    title,
    subtitle,
    children,
    defaultExpanded = false,
    icon: Icon,
    accent,
}) {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const sectionAccent = accent || colors.primary[600];

    const rotation = useSharedValue(defaultExpanded ? 180 : 0);
    const contentOpacity = useSharedValue(defaultExpanded ? 1 : 0);

    const chevronAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const contentAnimatedStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const toggle = () => {
        const nextExpanded = !isExpanded;
        setIsExpanded(nextExpanded);
        rotation.value = withSpring(nextExpanded ? 180 : 0, { damping: 15, stiffness: 300 });
        contentOpacity.value = withTiming(nextExpanded ? 1 : 0, { duration: 250 });
    };

    return (
        <View style={{ marginBottom: 14 }}>
            <TouchableOpacity
                onPress={toggle}
                activeOpacity={0.92}
                style={{
                    backgroundColor: colors.background.card,
                    borderRadius: 22,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: isExpanded
                        ? (isDarkMode ? `${sectionAccent}40` : `${sectionAccent}25`)
                        : (isDarkMode ? `${sectionAccent}25` : `${sectionAccent}15`),
                    shadowColor: sectionAccent,
                    shadowOffset: { width: 0, height: isDarkMode ? 8 : 6 },
                    shadowOpacity: isDarkMode ? 0.25 : 0.12,
                    shadowRadius: isDarkMode ? 20 : 16,
                    elevation: isDarkMode ? 6 : 4,
                }}
            >
                {/* Background accent glow */}
                <View
                    style={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 120,
                        height: 120,
                        borderRadius: 60,
                        backgroundColor: sectionAccent,
                        opacity: isExpanded
                            ? (isDarkMode ? 0.10 : 0.07)
                            : (isDarkMode ? 0.06 : 0.04),
                    }}
                />

                <View style={{ padding: 18 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {/* Icon — glassy with accent border */}
                        {Icon && (
                            <View style={{
                                width: 52,
                                height: 52,
                                borderRadius: 16,
                                backgroundColor: isDarkMode
                                    ? `${sectionAccent}20`
                                    : `${sectionAccent}12`,
                                borderWidth: 1,
                                borderColor: isDarkMode
                                    ? `${sectionAccent}30`
                                    : `${sectionAccent}18`,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 14,
                            }}>
                                <Icon size={24} color={sectionAccent} />
                            </View>
                        )}

                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontSize: 16.5,
                                    fontWeight: "700",
                                    letterSpacing: -0.4,
                                    color: colors.text.primary,
                                    marginBottom: subtitle ? 5 : 0,
                                }}
                            >
                                {title}
                            </Text>
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
                                backgroundColor: sectionAccent,
                                opacity: isDarkMode ? 0.4 : 0.25,
                                marginTop: 8,
                            }} />
                        </View>

                        {/* Chevron — rotates 180° */}
                        <AnimatedView
                            style={[
                                {
                                    marginLeft: 12,
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    backgroundColor: isDarkMode
                                        ? `${sectionAccent}18`
                                        : `${sectionAccent}10`,
                                    borderWidth: 1,
                                    borderColor: isDarkMode
                                        ? `${sectionAccent}28`
                                        : `${sectionAccent}15`,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                },
                                chevronAnimatedStyle,
                            ]}
                        >
                            <ChevronDown
                                size={16}
                                color={sectionAccent}
                                strokeWidth={2.5}
                            />
                        </AnimatedView>
                    </View>
                </View>
            </TouchableOpacity>

            {isExpanded && (
                <AnimatedView style={[{ marginTop: 12, paddingHorizontal: 4 }, contentAnimatedStyle]}>
                    {children}
                </AnimatedView>
            )}
        </View>
    );
}
