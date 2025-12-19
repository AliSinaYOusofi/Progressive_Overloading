import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";

export default function PersonalRecordsIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
                </LinearGradient>
            </Defs>
            {/* Trophy base */}
            <Path
                d="M16 32 L16 28 C16 26.8954 16.8954 26 18 26 L20 26 L20 24 C20 22.8954 20.8954 22 22 22 L26 22 C27.1046 22 28 22.8954 28 24 L28 26 L30 26 C31.1046 26 32 26.8954 32 28 L32 32 L16 32 Z"
                fill="url(#grad3)"
            />
            {/* Trophy cup */}
            <Path
                d="M20 26 L20 18 C20 16.8954 20.8954 16 22 16 L26 16 C27.1046 16 28 16.8954 28 18 L28 26 L20 26 Z"
                fill={color}
            />
            {/* Trophy handles */}
            <Path
                d="M18 20 C16.8954 20 16 19.1046 16 18 C16 16.8954 16.8954 16 18 16"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
            <Path
                d="M30 20 C31.1046 20 32 19.1046 32 18 C32 16.8954 31.1046 16 30 16"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
            {/* Star on trophy */}
            <Path
                d="M24 12 L24.8 14.4 L27.2 14.4 L25.2 16 L26 18.4 L24 16.8 L22 18.4 L22.8 16 L20.8 14.4 L23.2 14.4 Z"
                fill={color}
            />
        </Svg>
    );
}

