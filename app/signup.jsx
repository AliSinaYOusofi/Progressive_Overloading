import React from "react";
import SignUpScreen from "../components/Signup/Signup";
import { router } from "expo-router";
export default function signup() {
    
    return <SignUpScreen onNavigateToSignIn={() => router.replace("/signin")} />;
}
