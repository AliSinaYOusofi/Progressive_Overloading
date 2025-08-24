import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { X, Save } from 'lucide-react-native';
import { colors } from '../../constants/ui_colors';
import { updateProfile, getCurrentUser } from '../../lib/database';

export default function EditUsernameModal({ visible, onClose, currentUsername, onUsernameUpdate }) {
    const [newUsername, setNewUsername] = useState(currentUsername || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!newUsername.trim()) {
            Alert.alert('Error', 'Username cannot be empty');
            return;
        }

        if (newUsername.trim() === currentUsername) {
            onClose();
            return;
        }

        setIsLoading(true);
        try {
            // Get current user
            const user = await getCurrentUser();
            
            if (!user) {
                Alert.alert('Error', 'User not found');
                return;
            }

            // Update profile
            await updateProfile(user.id, { username: newUsername.trim() });
            
            // Call the callback to update the parent component
            onUsernameUpdate(newUsername.trim());
            
            Alert.alert('Success', 'Username updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error updating username:', error);
            Alert.alert('Error', 'Failed to update username. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setNewUsername(currentUsername || '');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Username</Text>
                        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                            <X size={24} color={colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.label}>New Username</Text>
                        <TextInput
                            style={styles.input}
                            value={newUsername}
                            onChangeText={setNewUsername}
                            placeholder="Enter new username"
                            placeholderTextColor={colors.text.tertiary}
                            autoFocus={true}
                            maxLength={30}
                        />
                    </View>

                    <View style={styles.actions}>
                        <TouchableOpacity 
                            style={[styles.button, styles.cancelButton]} 
                            onPress={handleCancel}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.saveButton, isLoading && styles.saveButtonDisabled]} 
                            onPress={handleSave}
                            disabled={isLoading || !newUsername.trim()}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.background.primary} />
                            ) : (
                                <Save size={20} color={colors.background.primary} />
                            )}
                            <Text style={styles.saveButtonText}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modal: {
        backgroundColor: colors.background.card,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: colors.shadow.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.text.primary,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        marginBottom: 24,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text.primary,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border.light,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text.primary,
        backgroundColor: colors.background.primary,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    cancelButton: {
        backgroundColor: colors.background.primary,
        borderWidth: 1,
        borderColor: colors.border.light,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text.secondary,
    },
    saveButton: {
        backgroundColor: colors.primary[600],
    },
    saveButtonDisabled: {
        backgroundColor: colors.primary[400],
        opacity: 0.7,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.background.primary,
    },
});
