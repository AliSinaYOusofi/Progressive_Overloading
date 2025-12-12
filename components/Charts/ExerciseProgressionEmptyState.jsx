import React from "react";
import { View, Text } from "react-native";
import { Dumbbell } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

/**
 * Empty state component when there's no exercise progression data
 */
export default function ExerciseProgressionEmptyState() {
    const colors = useThemedColors();

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2
        }}>
            <Dumbbell size={48} color={colors.text.tertiary} />
            <Text style={{ 
                fontSize: 16, 
                fontWeight: '600', 
                color: colors.text.primary, 
                marginTop: 12, 
                marginBottom: 4 
            }}>
                No exercise data yet
            </Text>
            <Text style={{ 
                fontSize: 14, 
                color: colors.text.secondary, 
                textAlign: 'center' 
            }}>
                Start logging sets to see your progression!
            </Text>
        </View>
    );
}
