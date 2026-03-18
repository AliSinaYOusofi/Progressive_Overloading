import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export const MODAL_LAYOUT = {
    horizontalMargin: isTablet ? 16 : 7,
    bottomPadding: 8,
    borderRadius: 50,
};
