import { View, Text, ActivityIndicator } from "react-native";
import { colors } from "../constants/ui_colors";

export default function Index() {
    return (
        <View style={{ 
            flex: 1, 
            justifyContent: "center", 
            alignItems: "center",
            backgroundColor: colors.background.primary
        }}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Text style={{ 
                marginTop: 16, 
                color: colors.text.secondary,
                fontSize: 16
            }}>
                Loading...
            </Text>
        </View>
    );
}
