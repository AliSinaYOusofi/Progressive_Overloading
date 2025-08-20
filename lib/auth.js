// lib/auth.js
import { supabase } from "./supabase";

export async function signUp(email, password) {
    return await supabase.auth.signUp({ email, password });
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
