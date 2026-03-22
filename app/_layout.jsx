import { Slot, useRouter, useSegments } from "expo-router"
import { getColors } from '../constants/ui_colors'
import { View, Text, ActivityIndicator } from "react-native"
import React, { useEffect, useState } from "react"
import { supabase, supabaseMisconfigured } from "../lib/supabase"
import { useAppStore } from "../stores/useAppStore"
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

    // No need for getInitialSession() — the INITIAL_SESSION event from
    // onAuthStateChange handles it and properly loads user data first.

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session)
      if (event === 'SIGNED_OUT') {
        // IMPORTANT ORDER: Unmount tab tree FIRST, then reset store.
        // 1. setIsAuthenticated(false) swaps to auth <Slot/>, unmounting tabs
        // 2. resetStore() clears data — safe because tab screens are already gone,
        //    so no Zustand subscribers will re-render with null data → no Fabric SIGSEGV
        // NOTE: resetStore must be synchronous (no setTimeout) to avoid racing with
        //    a fast re-sign-in where SIGNED_IN fires before the delayed reset.
        setIsAuthenticated(false)
        setIsLoading(false)
        useAppStore.getState().resetStore()
      } else if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        // Clear signing-out flag before initializing
        useAppStore.setState({ _signingOut: false })
        // Only initialize if the store doesn't already have this user loaded
        const currentStoreUser = useAppStore.getState().user
        if (!currentStoreUser || currentStoreUser.id !== session.user.id) {
          await useAppStore.getState().initializeUserData()
        }
        // Delay tree swap to next frame to avoid Fabric use-after-free crash
        setTimeout(() => {
          setIsAuthenticated(true)
          setIsLoading(false)
        }, 0)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Token refresh — session is still valid, just update auth state
        setIsAuthenticated(true)
        setIsLoading(false)
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session — user is not logged in
        setIsAuthenticated(false)
        setIsLoading(false)
      }
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
    <View style={{ flex: 1 }}>
      <AppTabs colors={colors} isDarkMode={isDarkMode} />
      <NetworkStatusBanner />
      <ThemedAlertComponent />
    </View>
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
