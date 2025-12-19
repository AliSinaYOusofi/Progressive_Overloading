import React from "react";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";

export default function MonthlyTrendsIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad5" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </LinearGradient>
            </Defs>
            {/* Calendar month view */}
            <Path
                d="M10 8 L38 8 L38 40 L10 40 Z"
                stroke={color}
                strokeWidth="2"
                fill="none"
                rx="2"
            />
            {/* Month header */}
            <Path
                d="M10 8 L38 8"
                stroke={color}
                strokeWidth="3"
            />
            {/* Grid lines */}
            <Path
                d="M10 18 L38 18"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.3"
            />
            <Path
                d="M10 28 L38 28"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.3"
            />
            <Path
                d="M19 8 L19 40"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.3"
            />
            <Path
                d="M28 8 L28 40"
                stroke={color}
                strokeWidth="1"
                strokeOpacity="0.3"
            />
            {/* Trend line overlay */}
            <Path
                d="M12 32 L19 28 L26 24 L33 20"
                stroke="url(#grad5)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Data points */}
            <Circle cx="12" cy="32" r="2.5" fill={color} />
            <Circle cx="19" cy="28" r="2.5" fill={color} />
            <Circle cx="26" cy="24" r="2.5" fill={color} />
            <Circle cx="33" cy="20" r="2.5" fill={color} />
        </Svg>
    );
}

