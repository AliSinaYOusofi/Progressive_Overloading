import React from "react";
import Svg, { Path, Rect, Defs, LinearGradient, Stop } from "react-native-svg";

export default function WeeklyProgressIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </LinearGradient>
            </Defs>
            {/* Calendar grid - 7 days */}
            <Rect x="8" y="12" width="6" height="6" rx="1" fill="url(#grad4)" />
            <Rect x="16" y="12" width="6" height="6" rx="1" fill="url(#grad4)" />
            <Rect x="24" y="12" width="6" height="6" rx="1" fill={color} />
            <Rect x="32" y="12" width="6" height="6" rx="1" fill="url(#grad4)" />
            <Rect x="8" y="20" width="6" height="6" rx="1" fill={color} />
            <Rect x="16" y="20" width="6" height="6" rx="1" fill={color} />
            <Rect x="24" y="20" width="6" height="6" rx="1" fill="url(#grad4)" />
            <Rect x="32" y="20" width="6" height="6" rx="1" fill="url(#grad4)" />
            <Rect x="8" y="28" width="6" height="6" rx="1" fill={color} />
            <Rect x="16" y="28" width="6" height="6" rx="1" fill="url(#grad4)" />
            <Rect x="24" y="28" width="6" height="6" rx="1" fill={color} />
            <Rect x="32" y="28" width="6" height="6" rx="1" fill="url(#grad4)" />
            {/* Calendar header */}
            <Path
                d="M8 10 L40 10"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Week indicator line */}
            <Path
                d="M8 36 L40 36"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="2 2"
            />
        </Svg>
    );
}

