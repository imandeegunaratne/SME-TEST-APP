import { APP_FONT_FAMILY } from "./appTheme";

const baseLightTheme = {
  bg: "#F4F8FB",
  card: "#FFFFFF",
  text: "#0F172A",
  border: "#E2E8F0",
  inputBg: "#FFFFFF",
  primary: "#2F96B4",
  link: "#2F96B4",
  errorText: "#DC2626",
};

const baseDarkTheme = {
  bg: "#071423",
  card: "rgba(255,255,255,0.06)",
  text: "#FFFFFF",
  border: "rgba(255,255,255,0.14)",
  inputBg: "rgba(255,255,255,0.04)",
  primary: "#2F96B4",
  link: "#7DD3FC",
  errorText: "#FCA5A5",
};

export const authPageStyles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(14px, 4vw, 24px)",
    boxSizing: "border-box",
    fontFamily: APP_FONT_FAMILY,
  },
  card: {
    width: "100%",
    maxWidth: "100%",
    padding: "clamp(18px, 5vw, 30px)",
    borderRadius: 18,
    boxSizing: "border-box",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    outline: "none",
    fontSize: 15,
    minHeight: 44,
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    color: "#FFFFFF",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 15,
    minHeight: 44,
  },
  link: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    fontSize: 14,
    textAlign: "left",
  },
  error: {
    fontSize: 14,
  },
  success: {
    color: "#059669",
    fontSize: 14,
  },
};

export function getAuthTheme(isDark, overrides = {}) {
  const baseTheme = isDark ? baseDarkTheme : baseLightTheme;
  return { ...baseTheme, ...overrides };
}
