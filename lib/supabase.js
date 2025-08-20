// lib/supabase.js
import "react-native-url-polyfill/auto"; // MUST be first
import "react-native-get-random-values"; // sometimes required for UUIDs
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform, AppState } from "react-native";
import { createClient, processLock } from "@supabase/supabase-js";

// Replace with your values (store these in env or app config)
const SUPABASE_URL =
    process.env.SUPABASE_URL || "https://xyzcompany.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "public-anon-key";

// create supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        // use AsyncStorage on native so sessions persist
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        lock: processLock,
    },
});

// Keep session tokens fresh while app is active (recommended by Supabase docs)
if (Platform.OS !== "web") {
    AppState.addEventListener("change", (state) => {
        if (state === "active") supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
    });
}
