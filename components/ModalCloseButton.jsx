import React from "react";
import { TouchableOpacity } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "../constants/ui_colors";

export default function ModalCloseButton({ onPress, disabled = false, size = 18 }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            className="bg-gray-100 p-2 rounded-full"
            style={{ 
                opacity: disabled ? 0.5 : 1,
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <X size={size} color={colors.text.secondary} />
        </TouchableOpacity>
    );
}
