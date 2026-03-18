import { Slot, useRouter, useSegments } from "expo-router"
import { getColors } from '../constants/ui_colors'
import { View, Text, ActivityIndicator } from "react-native"
import React, { useEffect, useState } from "react"
import { supabase, supabaseMisconfigured } from "../lib/supabase"
import { ThemeProvider, useTheme } from "../contexts/ThemeContext"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import ThemedAlertComponent from "../components/ThemedAlert"
import NetworkStatusBanner from "../components/NetworkStatusBanner"
import AppTabs from "../components/AppTabs"
import "../assets/css/global.css"

if (global.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler()
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error(`[GlobalErrorHandler] ${isFatal ? "FATAL" : "non-fatal"}:`, error)
    if (defaultHandler) defaultHandler(error, isFatal)
  })
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32, backgroundColor: "#fff" }}>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#DC2626", marginBottom: 12 }}>
            Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: "#6B7280", textAlign: "center", lineHeight: 20 }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </Text>
        </View>
      )
    }
    return this.props.children
  }
}

function RootLayoutContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()
  const firstSegment = segments?.[0]
  const { isDarkMode } = useTheme()
  const colors = getColors(isDarkMode)

  useEffect(() => {
    if (supabaseMisconfigured) {
      setIsLoading(false)
      return
    }

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session)
      setIsAuthenticated(!!session)
      setIsLoading(false)
    })

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
      <AppTabs colors={colors} isDarkMode={isDarkMode} />
      <NetworkStatusBanner />
      <ThemedAlertComponent />
    </>
  )
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <RootLayoutContent />
        </ThemeProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}
