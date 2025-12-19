import React from "react";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

export default function MuscleGroupIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad8" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </LinearGradient>
            </Defs>
            {/* Simplified body silhouette */}
            {/* Head */}
            <Circle cx="24" cy="8" r="4" fill="url(#grad8)" />
            {/* Torso */}
            <Path
                d="M20 12 L20 28 L28 28 L28 12 Z"
                fill={color}
                opacity="0.8"
            />
            {/* Arms */}
            <Path
                d="M16 14 L12 20 L16 22 Z"
                fill={color}
                opacity="0.7"
            />
            <Path
                d="M32 14 L36 20 L32 22 Z"
                fill={color}
                opacity="0.7"
            />
            {/* Legs */}
            <Path
                d="M20 28 L18 38 L22 38 Z"
                fill={color}
                opacity="0.7"
            />
            <Path
                d="M28 28 L30 38 L26 38 Z"
                fill={color}
                opacity="0.7"
            />
            {/* Muscle highlight points */}
            <Circle cx="20" cy="18" r="2" fill={color} />
            <Circle cx="28" cy="18" r="2" fill={color} />
            <Circle cx="24" cy="22" r="2" fill={color} />
        </Svg>
    );
}

