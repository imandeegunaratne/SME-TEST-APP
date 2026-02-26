// Settings.jsx
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import logo from "../assets/logo.png";

export default function Settings() {
  const navigate = useNavigate();

  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  useEffect(() => {
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  const theme = useMemo(
    () => (themeMode === "dark" ? darkTheme : lightTheme),
    [themeMode]
  );

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      {/* Top bar */}
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
            
          
          </div>
        </div>

        <button
          style={{
            ...styles.ghostBtn,
            color: theme.text,
            border: `1px solid ${theme.borderStrong}`,
          }}
          onClick={() => navigate("/")}
        >
          Back
        </button>
      </div>

      {/* Content */}
      <main style={styles.main}>
        <div style={styles.container}>
          {/* Bank Admin */}
          <div
            style={{
              ...styles.card,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <h2 style={{ margin: 0 }}>Bank Administration</h2>
            <p style={{ marginTop: 8, color: theme.muted, lineHeight: 1.5 }}>
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
                borderColor: theme.borderStrong,
                color: theme.muted,
              }}
            >
              Tip: Evaluators should use the normal login page. Bank admins use
              the admin login page.
            </div>
          </div>

          {/* Support */}
          <div
            style={{
              ...styles.card,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <h2 style={{ margin: 0 }}>Support</h2>
            <p style={{ marginTop: 8, color: theme.muted, lineHeight: 1.5 }}>
              If you have issues with access or bank codes, contact the system
              owner.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/* Brand palette */
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
};

const styles = {
  // ✅ full screen height always
  page: {
    minHeight: "100vh",
    minWidth: 0,
    width: "100vw",
    overflowX: "hidden",
    fontFamily: "system-ui",
    display: "flex",
    flexDirection: "column",
  },

  topbar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 5%",
    backdropFilter: "blur(10px)",
    flexWrap: "wrap",
    gap: 12,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  logoImg: {
    width: 92,
    height: 62,
    objectFit: "contain",
  },

  brandTitle: {
    fontWeight: 950,
    fontSize: 20,
    letterSpacing: 0.2,
  },

  brandSub: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },

  // ✅ gives nice spacing around the content, responsive
  main: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: "24px 16px 44px",
  },

  // ✅ not too wide on big screens, not too small on mobiles
  container: {
    width: "min(980px, 100%)",
    display: "grid",
    gap: 16,
  },
  card: {
    width: "min(980px, 100%)",
    maxWidth: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 18,
    boxSizing: "border-box",
    margin: "0 auto",
  },
  

  row: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
    alignItems: "center",
  },

  ghostBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    cursor: "pointer",
    background: "transparent",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  // ✅ doesn’t become huge; stays nice size
  primaryBtn: {
    padding: "12px 16px",
    borderRadius: 12,
    cursor: "pointer",
    border: "none",
    fontWeight: 900,
    width: "fit-content",
    minWidth: 180,
  },

  note: {
    marginTop: 14,
    border: "1px solid",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
  },
};
