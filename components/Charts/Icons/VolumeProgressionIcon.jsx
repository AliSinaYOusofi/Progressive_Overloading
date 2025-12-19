import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

export default function VolumeProgressionIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </LinearGradient>
            </Defs>
            {/* Bar chart bars */}
            <Path
                d="M10 36 L10 28 L14 28 L14 36 Z"
                fill="url(#grad2)"
            />
            <Path
                d="M16 36 L16 24 L20 24 L20 36 Z"
                fill="url(#grad2)"
            />
            <Path
                d="M22 36 L22 20 L26 20 L26 36 Z"
                fill="url(#grad2)"
            />
            <Path
                d="M28 36 L28 16 L32 16 L32 36 Z"
                fill="url(#grad2)"
            />
            <Path
                d="M34 36 L34 22 L38 22 L38 36 Z"
                fill="url(#grad2)"
            />
            {/* Base line */}
            <Path
                d="M8 36 L40 36"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
        </Svg>
    );
}

