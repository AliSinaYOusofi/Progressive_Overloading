import React from "react";
import { TouchableOpacity, View } from "react-native";
import { X } from "lucide-react-native";
import { useThemedColors } from "../hooks/useThemedColors";

export default function ModalCloseButton({ onPress, disabled = false, size = 18 }) {
    const colors = useThemedColors();
    
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            style={{ 
                opacity: disabled ? 0.5 : 1,
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <View style={{ 
                backgroundColor: colors.background.primary, 
                padding: 8, 
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.border.light,
            }}>
                <X size={size} color={colors.text.secondary} />
            </View>
        </TouchableOpacity>
    );
}
