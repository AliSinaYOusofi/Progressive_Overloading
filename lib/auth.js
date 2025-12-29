// lib/auth.js
import { supabase } from "./supabase";

export async function signUp(email, password) {
    return await supabase.auth.signUp({ email, password }, {
        
    });
}

export async function signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
    return await supabase.auth.signOut();
}

export async function getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session; // may be null
}

export async function getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
}

/**
 * Check if email exists in the profiles table
 * @param {string} email - Email address to check
 * @returns {Promise<{exists: boolean, error: Error|null}>}
 */
export async function checkEmailExists(email) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('email')
            .eq('email', email.toLowerCase().trim())
            .maybeSingle();
        
        if (error) {
            // Database error occurred
            return { exists: false, error };
        }
        
        // If data exists, email is found
        return { exists: !!data, error: null };
    } catch (error) {
        console.error('Error checking email existence:', error);
        return { exists: false, error };
    }
}

/**
 * Reset password for email - checks if email exists in profiles first
 * @param {string} email - Email address to send reset link to
 * @returns {Promise<{success: boolean, message: string, error: Error|null}>}
 */
export async function resetPassword(email) {
    try {
        // First check if email exists in profiles
        const { exists, error: checkError } = await checkEmailExists(email);
        
        if (checkError) {
            return {
                success: false,
                message: "Network error. Please check your connection.",
                error: checkError
            };
        }
        
        if (!exists) {
            return {
                success: false,
                message: "No account found with this email address.",
                error: null
            };
        }
        
        // Email exists, send password reset email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
            email.toLowerCase().trim(),
            {
                redirectTo: undefined // We'll handle this in the app
            }
        );
        
        if (resetError) {
            return {
                success: false,
                message: resetError.message || "Failed to send password reset email. Please try again.",
                error: resetError
            };
        }
        
        return {
            success: true,
            message: "Password reset email sent. Please check your inbox.",
            error: null
        };
    } catch (error) {
        console.error('Error resetting password:', error);
        return {
            success: false,
            message: "An unexpected error occurred. Please try again.",
            error
        };
    }
}
