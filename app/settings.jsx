import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { 
    Settings, 
    Bell, 
    Shield, 
    Palette, 
    Globe, 
    HelpCircle, 
    Info, 
    ChevronRight,
    Moon,
    Sun,
    Volume2,
    Eye,
    Lock,
    Smartphone,
    LogOut
} from "lucide-react-native";
import { getColors } from "../constants/ui_colors";
import { signOut } from "../lib/auth";
import { useTheme } from "../contexts/ThemeContext";
import PrivacySettingsModal from "../components/Profile/PrivacySettingsModal";
import DataSharingModal from "../components/Profile/DataSharingModal";
import AppVersionModal from "../components/Profile/AppVersionModal";

export default function SettingsScreen() {
    const { isDarkMode, toggleTheme } = useTheme();
    const colors = getColors(isDarkMode);
    
    const [notifications, setNotifications] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [biometricAuth, setBiometricAuth] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showDataSharingModal, setShowDataSharingModal] = useState(false);
    const [showAppVersionModal, setShowAppVersionModal] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await signOut();
                            // The auth state listener will handle the redirect automatically
                        } catch (error) {
                            console.log("Logout error:", error);
                            Alert.alert("Error", "Failed to sign out. Please try again.");
                        }
                    },
                },
            ]
        );
        setLoggingOut(false);
    };

    const settingSections = [
        {
            title: "Preferences",
            items: [
                // {
                //     icon: Bell,
                //     title: "Push Notifications",
                //     subtitle: "Get notified about workouts and achievements",
                //     type: "switch",
                //     value: notifications,
                //     onValueChange: setNotifications,
                // },
                {
                    icon: isDarkMode ? Sun : Moon,
                    title: "Dark Mode",
                    subtitle: "Switch between light and dark themes",
                    type: "switch",
                    value: isDarkMode,
                    onValueChange: toggleTheme,
                },
                // {
                //     icon: Volume2,
                //     title: "Sound Effects",
                //     subtitle: "Play sounds for app interactions",
                //     type: "switch",
                //     value: soundEnabled,
                //     onValueChange: setSoundEnabled,
                // },
            ],
        },
        {
            title: "Security & Privacy",
            items: [
                // {
                //     icon: Lock,
                //     title: "Biometric Authentication",
                //     subtitle: "Use fingerprint or face ID to sign in",
                //     type: "switch",
                //     value: biometricAuth,
                //     onValueChange: setBiometricAuth,
                // },
                {
                    icon: Shield,
                    title: "Privacy Settings",
                    subtitle: "Manage your data and privacy",
                    type: "navigate",
                },
                {
                    icon: Eye,
                    title: "Data Sharing",
                    subtitle: "Control how your data is shared",
                    type: "navigate",
                },
            ],
        },
        // {
        //     title: "App Settings",
        //     items: [
        //         {
        //             icon: Palette,
        //             title: "Appearance",
        //             subtitle: "Customize colors and themes",
        //             type: "navigate",
        //         },
        //         {
        //             icon: Globe,
        //             title: "Language",
        //             subtitle: "English (US)",
        //             type: "navigate",
        //         },
        //         {
        //             icon: Smartphone,
        //             title: "Device Settings",
        //             subtitle: "Manage device-specific options",
        //             type: "navigate",
        //         },
        //     ],
        // },
        {
            title: "Support",
            items: [
                {
                    icon: HelpCircle,
                    title: "Help & Support",
                    subtitle: "Get help and contact support",
                    type: "navigate",
                },
                {
                    icon: Info,
                    title: "About",
                    subtitle: "App version and information",
                    type: "navigate",
                },
            ],
        },
        {
            title: "Account",
            items: [
                {
                    icon: LogOut,
                    title: "Sign Out",
                    subtitle: "Sign out of your account",
                    type: "logout",
                },
            ],
        },
    ];

    const renderSettingItem = (item, index) => {
        const handlePress = () => {
            if (item.type === "logout") {
                handleLogout();
            } else if (item.title === "Privacy Settings") {
                setShowPrivacyModal(true);
            } else if (item.title === "Data Sharing") {
                setShowDataSharingModal(true);
            } else if (item.title === "About") {
                setShowAppVersionModal(true);
            }
            // Add other navigation handlers here if needed
        };

        return (
            <TouchableOpacity key={index} style={styles.settingItem} onPress={handlePress}>
                <View style={styles.settingIcon}>
                    <item.icon size={20} color={colors.primary[600]} />
                </View>
                <View style={styles.settingContent}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                {item.type === "switch" ? (
                    <Switch
                        value={item.value}
                        onValueChange={item.onValueChange}
                        trackColor={{ false: colors.neutral[300], true: colors.primary[200] }}
                        thumbColor={item.value ? colors.primary[600] : colors.neutral[400]}
                    />
                ) : (
                    <ChevronRight size={20} color={colors.text.tertiary} />
                )}
            </TouchableOpacity>
        );
    };

    const styles = getStyles(colors);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIcon}>
                        <Settings size={32} color={colors.primary[600]} />
                    </View>
                    <Text style={styles.title}>Settings</Text>
                    <Text style={styles.subtitle}>Customize your app experience</Text>
                </View>

                {/* Settings Sections */}
                {settingSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => 
                                renderSettingItem(item, itemIndex)
                            )}
                        </View>
                    </View>
                ))}

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Progressive Overloading v1.0.0</Text>
                    <Text style={styles.buildText}>Build 2024.01.15</Text>
                </View>
            </ScrollView>
            
            {/* Modals */}
            <PrivacySettingsModal 
                visible={showPrivacyModal} 
                onClose={() => setShowPrivacyModal(false)} 
            />
            <DataSharingModal 
                visible={showDataSharingModal} 
                onClose={() => setShowDataSharingModal(false)} 
            />
            <AppVersionModal 
                visible={showAppVersionModal} 
                onClose={() => setShowAppVersionModal(false)} 
            />
        </View>
    );
}

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background.primary,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 150, // Add bottom padding to avoid tab bar
    },
    header: {
        alignItems: "center",
        marginBottom: 40,
    },
    headerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        borderWidth: 2,
        borderColor: colors.primary[200],
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: colors.text.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: "center",
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: colors.text.primary,
        marginBottom: 16,
        marginLeft: 4,
    },
    sectionContent: {
        backgroundColor: colors.background.card,
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: colors.shadow.light,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    settingItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border.light,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary[50],
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.primary,
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 14,
        color: colors.text.tertiary,
        lineHeight: 18,
    },
    versionContainer: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 100,
        paddingVertical: 20,
    },
    versionText: {
        fontSize: 16,
        fontWeight: "500",
        color: colors.text.primary,
        marginBottom: 4,
    },
    buildText: {
        fontSize: 14,
        color: colors.text.tertiary,
    },
});
