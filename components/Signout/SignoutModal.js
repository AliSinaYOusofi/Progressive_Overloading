import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { colors } from "../../constants/ui_colors";

const LogoutModal = ({ visible, onClose, onConfirm, isLoading }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Sign Out</Text>
                        <Text style={styles.message}>
                            Are you sure you want to sign out of your account?
                        </Text>

                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator
                                    size="large"
                                    color={colors.emerald[500]}
                                />
                                <Text style={styles.loadingText}>
                                    Signing Out...
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onClose}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        styles.confirmButton,
                                    ]}
                                    onPress={onConfirm}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.confirmButtonText}>
                                        Sign Out
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        width: "100%",
        maxWidth: 340,
        shadowColor: colors.black,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: colors.gray[900],
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        fontSize: 16,
        color: colors.gray[600],
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 24,
    },
    loadingContainer: {
        alignItems: "center",
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 16,
        color: colors.emerald[600],
        marginTop: 12,
        fontWeight: "500",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: colors.gray[100],
        borderWidth: 1,
        borderColor: colors.gray[300],
    },
    confirmButton: {
        backgroundColor: colors.red[500],
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.gray[700],
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: colors.white,
    },
});

export default LogoutModal;
