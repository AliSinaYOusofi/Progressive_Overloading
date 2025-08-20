import React from "react";
import SignUpScreen from "../components/Signup/Signup";
import { router } from "expo-router";
import { signUp } from "../lib/auth";
export default function signup() {
    
    return <SignUpScreen onNavigateToSignIn={() => router.navigate("/signin")} />;
}
