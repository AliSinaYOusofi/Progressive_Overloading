import "react-native-get-random-values";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_PUBLIC_KEY = process.env.EXPO_PUBLIC_SUPBASE_ANON;

const SUPABASE_MISCONFIGURED = !SUPABASE_URL || !SUPABASE_ANON_PUBLIC_KEY;

if (SUPABASE_MISCONFIGURED) {
    console.error(
        "[supabase] EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPBASE_ANON must be set. " +
        "The app will not be able to connect to the backend."
    );
}

export const supabaseMisconfigured = SUPABASE_MISCONFIGURED;

export const supabase = SUPABASE_MISCONFIGURED
    ? null
    : createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY, {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    });
