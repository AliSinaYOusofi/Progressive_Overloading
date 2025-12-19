import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert as RNAlert } from "react-native";
import { useThemedColors } from "../hooks/useThemedColors";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Custom theme-aware alert component that matches the app's design system
 * Usage: ThemedAlert.show({ title: "Error", message: "Something went wrong" })
 */
let alertRef = null;

export const ThemedAlert = {
    show: ({ title, message, buttons }) => {
        if (alertRef) {
            alertRef.show({ title, message, buttons: buttons || [{ text: "OK" }] });
        } else {
            // Fallback to native alert if ThemedAlertComponent hasn't mounted yet
            console.warn("ThemedAlert not ready, using native Alert");
            RNAlert.alert(title, message, buttons || [{ text: "OK" }]);
        }
    },
};

export default function ThemedAlertComponent() {
    const colors = useThemedColors();
    const { isDarkMode } = useTheme();
    const [visible, setVisible] = React.useState(false);
    const [alertData, setAlertData] = React.useState({ title: "", message: "", buttons: [] });

    React.useEffect(() => {
        alertRef = {
            show: ({ title, message, buttons }) => {
                setAlertData({ title, message, buttons: buttons || [{ text: "OK" }] });
                setVisible(true);
            },
        };
        return () => {
            alertRef = null;
        };
    }, []);

    const handleButtonPress = (button) => {
        if (button.onPress) {
            button.onPress();
        }
        setVisible(false);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={() => setVisible(false)}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => setVisible(false)}
                style={styles.overlay}
            >
                <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                    <View style={[
                        styles.alertContainer,
                        {
                            backgroundColor: colors.background.card,
                            shadowColor: isDarkMode ? "#000" : "#000",
                        }
                    ]}>
                        {alertData.title ? (
                            <Text style={[styles.title, { color: colors.text.primary }]}>
                                {alertData.title}
                            </Text>
                        ) : null}
                        {alertData.message ? (
                            <Text style={[styles.message, { color: colors.text.secondary }]}>
                                {alertData.message}
                            </Text>
                        ) : null}
                        <View style={styles.buttonContainer}>
                            {alertData.buttons.map((button, index) => {
                                const isDestructive = button.style === "destructive";
                                const isCancel = button.style === "cancel";
                                const isDefault = !isDestructive && !isCancel;
                                
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleButtonPress(button)}
                                        style={[
                                            styles.button,
                                            {
                                                backgroundColor: isDestructive
                                                    ? colors.status.error
                                                    : isCancel
                                                    ? colors.background.input
                                                    : isDarkMode
                                                    ? colors.primary[200]
                                                    : colors.primary[600],
                                                marginLeft: index > 0 ? 12 : 0,
                                            }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                {
                                                    color: isDestructive
                                                        ? "#FFFFFF"
                                                        : isCancel
                                                        ? colors.text.primary
                                                        : "#FFFFFF",
                                                    fontWeight: isDefault ? "600" : "500",
                                                }
                                            ]}
                                        >
                                            {button.text}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    alertContainer: {
        borderRadius: 20,
        padding: 24,
        width: "100%",
        maxWidth: 340,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    message: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 24,
        textAlign: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        minWidth: 80,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "500",
    },
});

