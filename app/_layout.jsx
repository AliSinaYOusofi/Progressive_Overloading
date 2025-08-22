import { Tabs, Stack } from "expo-router";
import { Home, Settings, BarChart3, User, Dumbbell } from "lucide-react-native";
import { colors } from "../constants/ui_colors";
import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../assets/css/global.css";

export default function RootLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getInitialSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setIsAuthenticated(!!session);
            } catch (error) {
                console.log("Initial auth check error:", error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth state changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth state changed:", event, !!session);
            setIsAuthenticated(!!session);
            setIsLoading(false);
        });

        // Cleanup subscription
        return () => subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return null; // Let the index handle loading
    }

    // If not authenticated, show auth screens
    if (!isAuthenticated) {
        return (
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
            </Stack>
        );
    }

    // If authenticated, show main app with tabs
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
                name="homescreen"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <Home size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="workouts"
                options={{
                    title: "Workouts",
                    tabBarIcon: ({ color, size }) => (
                        <Dumbbell size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="charts"
                options={{
                    title: "Charts",
                    tabBarIcon: ({ color, size }) => (
                        <BarChart3 size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <User size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => (
                        <Settings size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(auth)"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="index"
                options={{ href: null }}
            />
        </Tabs>
    );
}
