import { Tabs } from "expo-router";
import { LogInIcon, LogOutIcon } from "lucide-react-native";
import { colors } from "../../constants/ui_colors";
import { Platform } from "react-native";

export default function AuthLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.text.tertiary,
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background.card,
                    borderTopWidth: 1,
                    borderTopColor: colors.border.light,
                    paddingBottom: Platform.OS === "ios" ? 8 : 20, // Extra padding for Android
                    height: Platform.OS === "ios" ? 60 : 100, // Taller for Android to avoid navigation buttons
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 8, // Android shadow
                    shadowColor: colors.shadow.dark,
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.text.tertiary,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "500",
                },
            }}
        >
            <Tabs.Screen
                name="signin"
                options={{
                    title: "Sign In",
                    tabBarIcon: ({ color, size }) => (
                        <LogInIcon size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="signup"
                options={{
                    title: "Sign Up",
                    tabBarIcon: ({ color, size }) => (
                        <LogOutIcon size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
