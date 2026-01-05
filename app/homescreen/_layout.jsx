import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { getColors } from "../../constants/ui_colors";

export default function HomeScreenLayout() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                presentation: "card",
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="streak-info"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="day-detail"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="goal-day-detail"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
}

