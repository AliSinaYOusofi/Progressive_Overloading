import React from "react";
import SignInScreen from "../components/Signin/SignIn";
import { router } from "expo-router";
export default function signin() {
    return (
        <SignInScreen onSignIn={() => router.replace("/homescreen")} onNavigateToSignUp={() => router.navigate("/signup")} />
    );
}
