import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from "react-native-svg";

export default function StrengthStandardsIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad9" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
                </LinearGradient>
            </Defs>
            {/* Award badge shape */}
            <Path
                d="M24 6 L28 14 L36 16 L30 22 L31 30 L24 26 L17 30 L18 22 L12 16 L20 14 Z"
                fill="url(#grad9)"
            />
            {/* Inner star */}
            <Path
                d="M24 12 L25.5 16.5 L30 17.5 L26.5 20.5 L27.5 25 L24 22.5 L20.5 25 L21.5 20.5 L18 17.5 L22.5 16.5 Z"
                fill={color}
                opacity="0.9"
            />
            {/* Center circle */}
            <Circle cx="24" cy="19" r="3" fill={color} />
        </Svg>
    );
}

