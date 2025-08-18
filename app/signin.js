import React from "react";
import SignInScreen from "../components/Signin/SignIn";
import { router } from "expo-router";
export default function signin() {
    return (
        <SignInScreen onNavigateToSignUp={() => router.replace("/signup")} />
    );
}
