import React from "react";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

export default function RPEAnalysisIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad7" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </LinearGradient>
            </Defs>
            {/* Gauge/speedometer */}
            <Path
                d="M8 32 C8 20.9543 16.9543 12 28 12 C39.0457 12 48 20.9543 48 32"
                stroke={color}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.3"
            />
            {/* Active gauge arc */}
            <Path
                d="M8 32 C8 20.9543 16.9543 12 28 12"
                stroke="url(#grad7)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
            />
            {/* Needle */}
            <Path
                d="M28 32 L24 20"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
            {/* Center dot */}
            <Circle cx="28" cy="32" r="3" fill={color} />
            {/* Intensity markers */}
            <Circle cx="12" cy="28" r="1.5" fill={color} opacity="0.6" />
            <Circle cx="20" cy="22" r="1.5" fill={color} opacity="0.8" />
            <Circle cx="24" cy="20" r="2" fill={color} />
        </Svg>
    );
}

