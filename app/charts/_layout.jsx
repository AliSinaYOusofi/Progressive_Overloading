import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { getColors } from "../../constants/ui_colors";
import { Platform } from "react-native";

export default function ChartsLayout() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background.card,
                },
                headerTintColor: colors.text.primary,
                headerTitleStyle: {
                    fontWeight: "bold",
                    fontSize: 18,
                },
                headerShadowVisible: true,
                headerBackTitleVisible: false,
                headerBackTitle: "",
                presentation: "card",
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: "",
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="exercise-progression"
                options={{
                    title: "Exercise Progression",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="volume-progression"
                options={{
                    title: "Volume Progression",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="weekly-progress"
                options={{
                    title: "Weekly Progress",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="personal-records"
                options={{
                    title: "Personal Records",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="monthly-trends"
                options={{
                    title: "Monthly Trends",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="monthly-trends-detail"
                options={{
                    title: "Monthly Breakdown",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="progressive-overload"
                options={{
                    title: "Progressive Overload Insights",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="muscle-groups-heatmap"
                options={{
                    title: "Muscle Group",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="goal-analytics"
                options={{
                    title: "Goal Analytics",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
            <Stack.Screen
                name="training-intensity"
                options={{
                    title: "Training Intensity",
                    headerStyle: {
                        backgroundColor: colors.background.card,
                    },
                    headerTintColor: colors.text.primary,
                    headerBackTitleVisible: false,
                    headerBackTitle: "",
                }}
            />
        </Stack>
    );
}

