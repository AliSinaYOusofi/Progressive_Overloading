import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { upsertProfile } from "../lib/database";
import { useThemedColors } from "../hooks/useThemedColors";

export default function AppleSignInButton({ disabled }) {
    const colors = useThemedColors();
    const [isLoading, setIsLoading] = useState(false);

    if (Platform.OS !== "ios") return null;

    const handleAppleSignIn = async () => {
        setIsLoading(true);
        try {
            const rawNonce = Crypto.randomUUID();
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                rawNonce
            );

            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            if (!credential.identityToken) {
                throw new Error("No identity token returned from Apple.");
            }

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: "apple",
                token: credential.identityToken,
                nonce: rawNonce,
            });

            if (error) throw error;

            // Ensure a profile row exists for this user
            if (data?.user) {
                const email = data.user.email || credential.email || "";
                const fullName = credential.fullName;
                const displayName = fullName
                    ? [fullName.givenName, fullName.familyName].filter(Boolean).join(" ")
                    : "";

                await upsertProfile(data.user.id, {
                    email,
                    ...(displayName ? { full_name: displayName } : {}),
                }).catch((err) => console.warn("Profile upsert after Apple Sign In:", err));
            }
        } catch (error) {
            if (error.code === "ERR_REQUEST_CANCELED") {
                // User cancelled, do nothing
            } else {
                console.error("Apple Sign In error:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity
            onPress={handleAppleSignIn}
            disabled={disabled || isLoading}
            activeOpacity={0.85}
            style={{
                backgroundColor: colors.background.card,
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "row",
                gap: 10,
                opacity: isLoading ? 0.7 : 1,
                borderWidth: 1,
                borderColor: colors.border.light,
            }}
        >
            {isLoading ? (
                <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
                <>
                    <Ionicons name="logo-apple" size={20} color={colors.text.primary} />
                    <Text style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: colors.text.primary,
                        letterSpacing: 0.3,
                    }}>
                        Continue with Apple
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
