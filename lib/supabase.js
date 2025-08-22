import "react-native-url-polyfill/auto";
import "react-native-get-random-values";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_PUBLIC_KEY = process.env.EXPO_PUBLIC_SUPBASE_ANON;

if (!SUPABASE_URL || !SUPABASE_ANON_PUBLIC_KEY) {
    throw new Error("Supabase URL and Anon Key must be defined in environment variables");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_PUBLIC_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
