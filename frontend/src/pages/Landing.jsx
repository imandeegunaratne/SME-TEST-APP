import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

export default function Landing() {
  const navigate = useNavigate();

  // Persist theme
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.body.style.margin = "0";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const theme = dark ? darkTheme : lightTheme;

  return (
    <div
      style={{
        ...styles.page,
        background: theme.bg,
        color: theme.text,
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          ...styles.navbar,
          borderBottom: `1px solid ${theme.border}`,
          background: theme.navBg,
        }}
      >
        {/* Brand */}
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

        {/* Right buttons */}
        <div style={styles.navRight}>
          {/* Theme Toggle */}
          <button
            style={{
              ...styles.ghostBtn,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => setDark((v) => !v)}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            style={{
              ...styles.ghostBtn,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => navigate("/login")}
          >
            Evaluator Login
          </button>

          <button
            style={{
              ...styles.primaryBtn,
              background: theme.button,
              color: theme.buttonText,
            }}
            onClick={() => navigate("/signup")}
          >
            Evaluator Signup
          </button>
          <button
            style={{
              ...styles.ghostBtn,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => navigate("/help")}
          >
            Help 
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={{ ...styles.heroGlow, background: theme.heroGlow }} />

        <h1 style={{ ...styles.title, color: theme.text }}>
          Intelligent SME Loan Evaluation Platform
        </h1>

        <p style={{ ...styles.subtitle, color: theme.muted }}>
          Evaluate SME capability using structured business model analysis, expert
          scoring, and intelligent decision support.
        </p>

        <div style={styles.heroActions}>
          <button
            style={{
              ...styles.primaryBtn,
              ...styles.getStartedBtn,
              background: theme.button,
              color: theme.buttonText,
            }}
            onClick={() => navigate("/signup")}
          >
            Get Started
          </button>

          
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div
          style={{
            ...styles.featureCard,
            background: theme.card,
            borderColor: theme.border,
          }}
        >
          
          <h3 style={{ margin: "12px 0 6px 0" }}>Multi-Bank Secure Architecture</h3>
          <p style={{ margin: 0, color: theme.muted }}>
            Each bank operates in complete isolation with secure data protection.
          </p>
        </div>

        <div
          style={{
            ...styles.featureCard,
            background: theme.card,
            borderColor: theme.border,
          }}
        >
          
          <h3 style={{ margin: "12px 0 6px 0" }}>Evaluator-Driven SME Analysis</h3>
          <p style={{ margin: 0, color: theme.muted }}>
            Structured SME scoring using expert-based decision frameworks.
          </p>
        </div>

        <div
          style={{
            ...styles.featureCard,
            background: theme.card,
            borderColor: theme.border,
          }}
        >
          
          <h3 style={{ margin: "12px 0 6px 0" }}>Decision Intelligence Dashboard</h3>
          <p style={{ margin: 0, color: theme.muted }}>
            Visual analytics and scoring insights for loan decisions.
          </p>
        </div>
      </section>

      
          

      {/* Footer */}
      <footer style={{ ...styles.footer, color: theme.muted, borderTop: `1px solid ${theme.border}` }}>
        <div>© {new Date().getFullYear()} SME Scoring Platform</div>
        
      </footer>
    </div>
  );
}

/* ✅ Brand palette from your SME logo */
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
  iconBg: "rgba(47,150,180,0.12)",
  heroGlow: "radial-gradient(900px 420px at 50% 10%, rgba(47,150,180,0.25), transparent 65%)",
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
  iconBg: "rgba(47,150,180,0.10)",
  heroGlow: "radial-gradient(900px 420px at 50% 10%, rgba(47,150,180,0.20), transparent 65%)",
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 5%",
    alignItems: "center",
    flexWrap: "wrap",
    backdropFilter: "blur(10px)",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 220,
  },

  logoImg: {
    width: 92,
    height: 62,
    objectFit: "contain",
  },

  brandTitle: {
    fontWeight: 950,
    letterSpacing: 0.2,
    fontSize: 20,
  },

  brandSub: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },

  navRight: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  ghostBtn: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "1px solid",
    cursor: "pointer",
    background: "transparent",
    fontWeight: 800,
  },

  primaryBtn: {
    padding: "9px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
  },

  hero: {
    position: "relative",
    textAlign: "center",
    padding: "clamp(48px, 10vh, 90px) 5% 30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  heroGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  title: {
    fontSize: "clamp(28px, 5vw, 54px)",
    marginBottom: 14,
    letterSpacing: -0.6,
    lineHeight: 1.06,
    maxWidth: 980,
    zIndex: 1,
  },

  subtitle: {
    fontSize: "clamp(16px, 2vw, 20px)",
    opacity: 0.95,
    marginBottom: 24,
    maxWidth: 860,
    lineHeight: 1.5,
    zIndex: 1,
  },

  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
    zIndex: 1,
  },

  getStartedBtn: {
    padding: "10px 18px",
    fontSize: 16,
    minWidth: 160,
  },

  heroStats: {
    marginTop: 26,
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 0,
    border: "1px solid",
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 1,
  },

  statItem: {
    padding: "14px 18px",
    minWidth: 220,
    textAlign: "left",
  },

  statNumber: {
    fontWeight: 950,
    fontSize: 16,
  },

  statLabel: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.95,
  },

  statDivider: (theme) => ({
    width: 1,
    background: theme.border,
  }),

  features: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    padding: "26px 5% 10px",
  },

  featureCard: {
    padding: 22,
    borderRadius: 16,
    width: "min(340px, 94%)",
    border: "1px solid",
    boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontSize: 20,
    fontWeight: 900,
  },

  support: {
    padding: "24px 5% 30px",
    display: "flex",
    justifyContent: "center",
  },

  supportCard: {
    width: "min(1040px, 100%)",
    border: "1px solid",
    borderRadius: 16,
    padding: "18px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },

  footer: {
    marginTop: "auto",
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },

  footerLink: {
    cursor: "pointer",
    fontWeight: 800,
    textDecoration: "underline",
    textUnderlineOffset: 4,
  },
};
