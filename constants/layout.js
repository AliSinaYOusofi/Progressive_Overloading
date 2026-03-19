/**
 * Global layout tokens for consistent spacing and button styling.
 * Import LAYOUT from this file instead of hardcoding values.
 */
export const LAYOUT = {
  // Screen-level horizontal padding
  screenPadding: 20,
  headerPadding: 24,

  // Primary CTA button (LinearGradient inner style)
  ctaButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  // Primary CTA button text
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Shadow for primary CTA wrapper (TouchableOpacity)
  ctaShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 4,
  },
};
