import React from "react";
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from "react-native-svg";

export default function ProgressiveOverloadIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad6" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </LinearGradient>
            </Defs>
            {/* Target circles */}
            <Circle cx="24" cy="24" r="18" stroke={color} strokeWidth="2" fill="none" opacity="0.3" />
            <Circle cx="24" cy="24" r="12" stroke={color} strokeWidth="2" fill="none" opacity="0.5" />
            <Circle cx="24" cy="24" r="6" fill="url(#grad6)" />
            {/* Arrow pointing up */}
            <Path
                d="M24 8 L20 14 L24 12 L28 14 Z"
                fill={color}
            />
            <Path
                d="M24 12 L24 20"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </Svg>
    );
}

