import { Stack } from "expo-router";
import { useTheme } from "../../contexts/ThemeContext";
import { getColors } from "../../constants/ui_colors";

export default function ProfileStackLayout() {
    const { isDarkMode } = useTheme();
    const colors = getColors(isDarkMode);

    return (
        <Stack
            screenOptions={{
                headerShown: false, // Hide default header as we have custom headers
                contentStyle: {
                    backgroundColor: colors.background.primary,
                },
                presentation: "card",
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="edit-profile" />
        </Stack>
    );
}

