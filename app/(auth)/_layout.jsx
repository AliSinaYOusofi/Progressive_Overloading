import { Tabs } from "expo-router";
import { LogInIcon, UserPlus, KeyRound } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";
import { Platform, View } from "react-native";

function TabIcon({ Icon, color, size, focused, activeColor }) {
    return (
        <View style={{
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 36,
            borderRadius: 18,
            backgroundColor: focused ? activeColor + "18" : "transparent",
        }}>
            <Icon size={focused ? size + 2 : size} color={color} strokeWidth={focused ? 2.5 : 2} />
        </View>
    );
}

export default function AuthLayout() {
    const colors = useThemedColors();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background.card,
                    borderTopWidth: 0,
                    paddingBottom: Platform.OS === "ios" ? 12 : 24,
                    paddingTop: 12,
                    height: Platform.OS === "ios" ? 88 : 100,
                    position: "absolute",
                    bottom: 0,
                    left: 8,
                    right: 8,
                    marginBottom: 0,
                    borderRadius: 24,
                    elevation: 0,
                    shadowColor: "transparent",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    borderWidth: 1,
                    borderColor: colors.neutral[200],
                },
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.neutral[500],
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginTop: 4,
                    letterSpacing: 0.3,
                },
                tabBarIconStyle: {
                    marginBottom: -2,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
            }}
        >
            <Tabs.Screen
                name="signin"
                options={{
                    title: "Sign In",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon Icon={LogInIcon} color={color} size={size} focused={focused} activeColor={colors.primary[600]} />
                    ),
                }}
            />
            <Tabs.Screen
                name="signup"
                options={{
                    title: "Sign Up",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon Icon={UserPlus} color={color} size={size} focused={focused} activeColor={colors.primary[600]} />
                    ),
                }}
            />
            <Tabs.Screen
                name="forgot-password"
                options={{
                    title: "Forgot Password",
                    tabBarIcon: ({ color, size, focused }) => (
                        <TabIcon Icon={KeyRound} color={color} size={size} focused={focused} activeColor={colors.primary[600]} />
                    ),
                }}
            />
        </Tabs>
    );
}
