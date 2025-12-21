export const colors = {
  primary: "#2E7D6A",
  primaryDark: "#245E52",
  secondary: "#5C8374",
  accent: "#8FD3C8",

  background: "#FFFFFF",
  surface: "#FFFFFF",
  backgroundAlt: "#E9F8F6",
  surfaceTransparent: "#FFFFFFDD",

  text: "#333333",
  textStrong: "#000000",
  textMuted: "#555555",
  textOnPrimary: "#FFFFFF",

  border: "#CCCCCC",
  borderSoft: "#CDEDE7",
  borderStrong: "#AAAAAA",
  divider: "#EAEAEA",
  outline: "#2E7D6A33",

  success: "#22C55E",
  danger: "#b02a37",
  warning: "#F59E0B",

  backdrop: "rgba(0,0,0,0.35)",
  pickerBackdrop: "rgba(0,0,0,0.45)",

  chipBg: "#E6FFFB",
  chipText: "#0F766E",

  pickerHeader: "#0F172A",
  pickerDoneBg: "#2E7D6A",
  pickerDoneText: "#FFFFFF",
  pickerWheelText: "#0F172A",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
};

export const typography = {
  fontFamily: "System",
  fontWeight: {
    normal: "400",
    medium: "500",
    semiBold: "600",
    bold: "700",
    black: "900",
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 38,
  },
};

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
};


export const opacity = {
  disabled: 0.5,
  pressed: 0.7,
  muted: 0.8,
};

export const animation = {
  fast: 120,
  normal: 200,
  slow: 300,
};


export const zIndex = {
  base: 0,
  header: 10,
  overlay: 50,
  modal: 100,
  toast: 200,
};

export const borders = {
  thin: 1,
  thick: 2,
};

export const flex = {
  justifyContent: {
    start: { justifyContent: "flex-start" },
    end: { justifyContent: "flex-end" },
    center: { justifyContent: "center" },
    between: { justifyContent: "space-between" },
    around: { justifyContent: "space-around" },
    evenly: { justifyContent: "space-evenly" },
  },
  alignItems: {
    start: { alignItems: "flex-start" },
    end: { alignItems: "flex-end" },
    center: { alignItems: "center" },
    stretch: { alignItems: "stretch" },
    baseline: { alignItems: "baseline" },
  },
};

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
  flex,
};

export default theme;
