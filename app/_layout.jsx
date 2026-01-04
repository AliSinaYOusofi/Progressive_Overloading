import { Tabs, Slot, useRouter, useSegments } from "expo-router"
import { Home, Settings, BarChart3, User } from "lucide-react-native"
import { getColors } from '../constants/ui_colors'
import { Platform, View, Text, ActivityIndicator, TouchableOpacity } from "react-native"
import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { ThemeProvider, useTheme } from "../contexts/ThemeContext"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import ThemedAlertComponent from "../components/ThemedAlert"
import NetworkStatusBanner from "../components/NetworkStatusBanner"
import "../assets/css/global.css"

function RootLayoutContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()
  const firstSegment = segments?.[0]
  const { isDarkMode } = useTheme()
  const colors = getColors(isDarkMode)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.log("Initial auth check error:", error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session)
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

    // Cleanup subscription
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (isLoading) return

    const inAuthGroup = firstSegment === "(auth)"
    const onIndexPage = segments.length === 0 || firstSegment === "index"

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/signin")
    } else if (isAuthenticated && (inAuthGroup || onIndexPage)) {
      router.replace("/homescreen")
    }
  }, [segments, firstSegment, isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background.primary,
        }}
      >
        <View
          style={{
            backgroundColor: colors.primary[50],
            padding: 32,
            borderRadius: 24,
            alignItems: "center",
            shadowColor: colors.primary[500],
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Text
            style={{
              marginTop: 20,
              color: colors.primary[700],
              fontSize: 18,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            Loading...
          </Text>
          <Text
            style={{
              marginTop: 8,
              color: colors.neutral[600],
              fontSize: 14,
              textAlign: "center",
            }}
          >
            Preparing your fitness journey
          </Text>
        </View>
      </View>
    )
  }

  // If not authenticated, show auth screens
  if (!isAuthenticated) {
    return <Slot />
  }

  // If authenticated, show main app with tabs
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.background.card,
            borderTopWidth: 0, // Remove default border
            paddingBottom: Platform.OS === "ios" ? 12 : 24,
            paddingTop: 12,
            height: Platform.OS === "ios" ? 88 : 100,
            position: "absolute",
            bottom: 0,
            left: 8,
            right: 8,
            marginBottom: Platform.OS === "ios" ? 0 : 0,
            borderRadius: 24,
            elevation: 0,
            shadowColor: 'transparent',
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
          name="homescreen"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <Home size={focused ? size + 2 : size} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="charts"
          options={{
            title: "Insights",
            tabBarIcon: ({ color, size, focused }) => (
              <BarChart3 size={focused ? size + 2 : size} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <User size={focused ? size + 2 : size} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size, focused }) => (
              <Settings size={focused ? size + 2 : size} color={color} strokeWidth={focused ? 2.5 : 2} />
            ),
          }}
        />
        <Tabs.Screen name="(auth)" options={{ href: null }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="day-detail" options={{ href: null }} />
        <Tabs.Screen name="goal-day-detail" options={{ href: null }} />
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="log-set" options={{ href: null }} />
        <Tabs.Screen name="edit-set" options={{ href: null }} />
        <Tabs.Screen name="add-goal" options={{ href: null }} />
        <Tabs.Screen name="edit-goal" options={{ href: null }} />
        <Tabs.Screen name="privacy-policy" options={{ href: null }} />
        <Tabs.Screen name="streak-info" options={{ href: null }} />
      </Tabs>
      <NetworkStatusBanner />
      <ThemedAlertComponent />
    </>
  )
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}
