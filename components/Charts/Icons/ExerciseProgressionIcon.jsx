import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";

export default function ExerciseProgressionIcon({ size = 48, color = "#065F46" }) {
    return (
        <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
            <Defs>
                <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor={color} stopOpacity="1" />
                    <Stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </LinearGradient>
            </Defs>
            {/* Trending line chart */}
            <Path
                d="M8 32 L14 26 L20 28 L26 20 L32 22 L38 14"
                stroke="url(#grad1)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
            {/* Data points */}
            <Path
                d="M8 32 C8 33.1046 8.89543 34 10 34 C11.1046 34 12 33.1046 12 32 C12 30.8954 11.1046 30 10 30 C8.89543 30 8 30.8954 8 32 Z"
                fill={color}
            />
            <Path
                d="M14 26 C14 27.1046 14.8954 28 16 28 C17.1046 28 18 27.1046 18 26 C18 24.8954 17.1046 24 16 24 C14.8954 24 14 24.8954 14 26 Z"
                fill={color}
            />
            <Path
                d="M20 28 C20 29.1046 20.8954 30 22 30 C23.1046 30 24 29.1046 24 28 C24 26.8954 23.1046 26 22 26 C20.8954 26 20 26.8954 20 28 Z"
                fill={color}
            />
            <Path
                d="M26 20 C26 21.1046 26.8954 22 28 22 C29.1046 22 30 21.1046 30 20 C30 18.8954 29.1046 18 28 18 C26.8954 18 26 18.8954 26 20 Z"
                fill={color}
            />
            <Path
                d="M32 22 C32 23.1046 32.8954 24 34 24 C35.1046 24 36 23.1046 36 22 C36 20.8954 35.1046 20 34 20 C32.8954 20 32 20.8954 32 22 Z"
                fill={color}
            />
            <Path
                d="M38 14 C38 15.1046 38.8954 16 40 16 C41.1046 16 42 15.1046 42 14 C42 12.8954 41.1046 12 40 12 C38.8954 12 38 12.8954 38 14 Z"
                fill={color}
            />
        </Svg>
    );
}

