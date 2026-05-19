// Settings.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";
import { appNavbarStyles, appShellStyles, createAppTheme } from "../styles/appTheme";

export default function Settings() {
  const navigate = useNavigate();

  const [themeMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  const theme = useMemo(
    () =>
      createAppTheme(themeMode, themeMode === "dark" ? darkTheme : lightTheme),
    [themeMode]
  );

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <div
        style={{
          ...styles.topbar,
          borderBottom: `1px solid ${theme.border}`,
          background: theme.navBg,
        }}
      >
        <div
          style={{ ...styles.brand, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="SME logo" style={styles.logoImg} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ ...styles.brandTitle, color: theme.text }}>
              SME Scoring
            </div>
            <div style={{ ...styles.brandSub, color: theme.muted }}>
              Decision Support Platform
            </div>
          </div>
        </div>

        
      </div>

      <main style={styles.main}>
        <div style={styles.container}>
          <div
            style={{
              ...styles.card,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
            }}
          >
            <h2 style={{ ...styles.heading, color: theme.text }}>
              Bank Administration
            </h2>
            <p style={{ ...styles.text, color: theme.muted }}>
              Bank admins can manage evaluators and view bank-level SME scoring
              insights.
            </p>

            <div style={styles.row}>
              <button
                style={{
                  ...styles.primaryBtn,
                  background: theme.button,
                  color: theme.buttonText,
                }}
                onClick={() => navigate("/admin-login")}
              >
                Bank Admin Login
              </button>
            </div>

            <div
              style={{
                ...styles.note,
                border: `1px solid ${theme.borderStrong}`,
                color: theme.muted,
                background: theme.noteBg,
              }}
            >
              Tip: Evaluators should use the normal login page. Bank admins use
              the admin login page.
            </div>
          </div>

          <div
            style={{
              ...styles.card,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: theme.shadow,
            }}
          >
            <h2 style={{ ...styles.heading, color: theme.text }}>Support</h2>
            <p style={{ ...styles.text, color: theme.muted }}>
              If you have issues with access or bank codes, contact the system
              owner.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#0B1220",
  navBg: "rgba(11,18,32,0.75)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.78)",
  card: "#172033",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  button: BRAND,
  buttonText: "#FFFFFF",
  noteBg: "rgba(255,255,255,0.03)",
  shadow: "0 16px 32px rgba(0,0,0,0.18)",
};

const lightTheme = {
  bg: "#F4F8FB",
  navBg: "rgba(244,248,251,0.75)",
  text: "#0F172A",
  muted: "rgba(15,23,42,0.70)",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "rgba(15,23,42,0.18)",
  button: BRAND,
  buttonText: "#FFFFFF",
  noteBg: "#F8FBFE",
  shadow: "0 16px 32px rgba(15,23,42,0.08)",
};

const styles = {
  page: {
    ...appShellStyles.page,
    minWidth: 0,
    width: "100%",
    overflowX: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  topbar: {
    ...appNavbarStyles.shell,
    ...appNavbarStyles.flexShell,
    zIndex: 20,
    gap: 12,
  },

  brand: {
    ...appNavbarStyles.brand,
    flexWrap: "wrap",
  },

  logoImg: appNavbarStyles.logoImg,

  brandTitle: {
    ...appNavbarStyles.brandTitle,
    lineHeight: 1.1,
  },

  brandSub: appNavbarStyles.brandSub,

  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "clamp(18px, 5vw, 28px) 16px 44px",
  },

  container: {
    width: "min(980px, 100%)",
    display: "grid",
    gap: 16,
  },

  card: {
    width: "min(980px, 100%)",
    maxWidth: "100%",
    borderRadius: 20,
    padding: 22,
    boxSizing: "border-box",
    margin: "0 auto",
  },

  heading: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: 0,
  },

  text: {
    marginTop: 10,
    lineHeight: 1.6,
    fontSize: 15,
  },

  row: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 18,
    alignItems: "center",
  },

  ghostBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  primaryBtn: {
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    border: "none",
    fontWeight: 800,
    width: "fit-content",
    minWidth: 180,
    fontSize: 14,
  },

  note: {
    marginTop: 16,
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 13,
    lineHeight: 1.5,
  },
};
