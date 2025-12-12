import React from "react";
import { View, Text } from "react-native";
import { BarChart3 } from "lucide-react-native";
import { useThemedColors } from "../../hooks/useThemedColors";

/**
 * Empty state component when there's no volume progression data
 */
export default function VolumeProgressionEmptyState() {
    const colors = useThemedColors();

    return (
        <View style={{
            backgroundColor: colors.background.card,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            shadowColor: colors.shadow.light,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 3,
        }}>
            <View
                style={{
                    backgroundColor: colors.background.secondary,
                    borderRadius: 32,
                    padding: 16,
                    marginBottom: 16,
                }}
            >
                <BarChart3 size={48} color={colors.text.tertiary} />
            </View>
            <Text style={{ 
                fontSize: 18, 
                fontWeight: "600", 
                color: colors.text.primary, 
                marginBottom: 8 
            }}>
                No Volume Data Yet
            </Text>
            <Text style={{ 
                fontSize: 14, 
                color: colors.text.secondary, 
                textAlign: "center", 
                lineHeight: 20 
            }}>
                Start tracking your workouts to see your volume progression over time
            </Text>
        </View>
    );
}
