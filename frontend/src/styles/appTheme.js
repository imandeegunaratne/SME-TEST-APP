export const APP_FONT_FAMILY = "Inter, Arial, sans-serif";
export const APP_TEXT_COLOR = "#0F172A";
export const APP_MUTED_COLOR = "#475569";
export const APP_PRIMARY_COLOR = "#2F96B4";

export function createAppTheme(mode, overrides = {}) {
  const isDark = mode === true || mode === "dark";

  const baseTheme = isDark
    ? {
        bg: "#0B1220",
        navBg: "rgba(16,24,38,0.92)",
        card: "#172033",
        text: "#FFFFFF",
        muted: "rgba(255,255,255,0.72)",
        subText: "rgba(255,255,255,0.72)",
        border: "rgba(255,255,255,0.10)",
        borderStrong: "rgba(255,255,255,0.18)",
        inputBg: "#0f172a",
        button: APP_PRIMARY_COLOR,
        buttonText: "#FFFFFF",
        errorBg: "rgba(220,38,38,0.10)",
        errorText: "#fecaca",
        errorBorder: "rgba(220,38,38,0.30)",
      }
    : {
        bg: "#F4F7FB",
        navBg: "rgba(255,255,255,0.92)",
        card: "#FFFFFF",
        text: APP_TEXT_COLOR,
        muted: APP_MUTED_COLOR,
        subText: APP_MUTED_COLOR,
        border: "rgba(15,23,42,0.10)",
        borderStrong: "rgba(15,23,42,0.18)",
        inputBg: "#FFFFFF",
        button: APP_PRIMARY_COLOR,
        buttonText: "#FFFFFF",
        errorBg: "#FEF2F2",
        errorText: "#B91C1C",
        errorBorder: "#FECACA",
      };

  return { ...baseTheme, ...overrides };
}

export const appShellStyles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    minWidth: 0,
    fontFamily: APP_FONT_FAMILY,
    overflowX: "hidden",
  },
};

export const appNavbarStyles = {
  shell: {
    minHeight: 72,
    padding: "clamp(10px, 2.5vw, 14px) clamp(14px, 4vw, 28px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(10px)",
    boxSizing: "border-box",
  },
  gridShell: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  flexShell: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(10px, 2vw, 14px)",
    cursor: "pointer",
    minWidth: 0,
  },
  brandTextWrap: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: 1.1,
  },
  logoImg: {
    width: "clamp(78px, 18vw, 108px)",
    height: "clamp(44px, 10vw, 58px)",
    objectFit: "contain",
    display: "block",
  },
  brandTitle: {
    fontSize: "clamp(18px, 4vw, 24px)",
    fontWeight: 800,
    letterSpacing: 0,
    marginBottom: 3,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: 500,
    marginTop: 4,
  },
  tabWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexWrap: "wrap",
    minWidth: 0,
  },
  rightWrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    minWidth: 0,
  },
  iconBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    border: "none",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabBtn: {
    padding: "11px 20px",
    borderRadius: 999,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    transition: "all 0.2s ease",
  },
  backBtn: {
    border: "none",
    borderRadius: 12,
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
  navInner: {
    width: "min(1280px, 96%)",
    margin: "0 auto",
    minHeight: 78,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  logoButton: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    color: "inherit",
    fontFamily: APP_FONT_FAMILY,
    minWidth: 0,
  },
};
