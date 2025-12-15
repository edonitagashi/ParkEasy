
export const colors = {
  // Core brand (matching current app visuals exactly)
  primary: "#2E7D6A",
  primaryDark: "#245E52",
  secondary: "#5C8374",
  accent: "#8FD3C8",

  // Surfaces
  background: "#FFFFFF", // keep plain white to avoid hue shifts
  surface: "#FFFFFF",

  // Text
  text: "#333", 
  textStrong: "#000",
  textMuted: "#555",
  // Text on brand surfaces
  textOnPrimary: "#FFFFFF",

  // Borders
  border: "#CCCCCC", // default input/card border
  borderSoft: "#CDEDE7", // subtle green accent border for cards
  borderStrong: "#AAAAAA", // stronger neutral border for emphasis
  divider: "#EAEAEA", // separators and list dividers
  outline: "#2E7D6A33", // focus ring/outline on interactive elements

  // State
  success: "#2E7D6A",
  danger: "#b02a37", // matches existing reject/delete buttons
  warning: "#F59E0B",

  // Overlays
  backdrop: "rgba(0,0,0,0.35)", // matches FadeModal default
  pickerBackdrop: "rgba(0,0,0,0.45)",

  // Chips
  chipBg: "#E6FFFB",
  chipText: "#0F766E",

  // Picker (iOS spinner) specific
  pickerHeader: "#0F172A",
  pickerDoneBg: "#2E7D6A",
  pickerDoneText: "#FFFFFF",
  pickerWheelText: "#0F172A",
};

// -------------------- SPACING --------------------
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// -------------------- RADII --------------------
export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

// -------------------- TYPOGRAPHY --------------------
export const typography = {
  fontFamily: "System",
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
};

// -------------------- SHADOWS --------------------
export const shadows = {
  card: {
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
};

// -------------------- OPACITY --------------------
export const opacity = {
  disabled: 0.5,
  pressed: 0.7,
  muted: 0.8,
};

// -------------------- ANIMATION --------------------
export const animation = {
  fast: 120,
  normal: 200,
  slow: 300,
};

// -------------------- Z-INDEX --------------------
export const zIndex = {
  base: 0,
  header: 10,
  overlay: 50,
  modal: 100,
  toast: 200,
};

// -------------------- BORDERS --------------------
export const borders = {
  thin: 1,
  thick: 2,
};

// -------------------- THEME EXPORT --------------------
export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  opacity,
  animation,
  zIndex,
  borders,
};

export default theme;
