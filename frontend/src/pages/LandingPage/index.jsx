import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { createAppTheme } from "../../styles/appTheme";
import FeatureCarousel from "./FeatureCarousel";
import { styles } from "./styles";
import { darkTheme, lightTheme } from "./theme";

const features = [
  { title: "Business model assessment" },
  { title: "SME scoring consistency" },
  { title: "Reporting for lending decisions" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.background = dark ? darkTheme.bg : lightTheme.bg;
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((previous) => (previous + 1) % features.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const theme = useMemo(() => createAppTheme(dark, dark ? darkTheme : lightTheme), [dark]);

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <nav
        style={{
          ...styles.navbar,
          background: theme.navBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div style={styles.brand} onClick={() => navigate("/")}>
          <img src={logo} alt="SME logo" style={styles.logoImg} />
          <div>
            <div style={{ ...styles.brandTitle, color: theme.text }}>SME Scoring</div>
            <div style={{ ...styles.brandSub, color: theme.muted }}>Decision Support Platform</div>
          </div>
        </div>

        <div style={styles.navActions}>
          <button
            style={{
              ...styles.ghostBtn,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => setDark((value) => !value)}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            style={{
              ...styles.ghostBtn,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => navigate("/help")}
          >
            Help
          </button>

          <button
            style={{
              ...styles.ghostBtn,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            style={{
              ...styles.primaryBtn,
              background: theme.button,
              color: theme.buttonText,
            }}
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      <section style={styles.hero}>
        <div style={{ ...styles.heroGlow, background: theme.heroGlow }} />
        <div style={{ ...styles.heroGlowTwo, background: theme.heroGlowTwo }} />

        <div style={styles.heroContent}>
          <div style={styles.left}>
            <h1 style={{ ...styles.title, color: theme.text }}>SME evaluation for better lending decisions</h1>
            <p style={{ ...styles.subtitle, color: theme.muted }}>
              A professional platform for SME scoring, evaluator workflows, and decision support analytics.
            </p>

            <div style={styles.actions}>
              <button
                style={{
                  ...styles.primaryLargeBtn,
                  background: theme.button,
                  color: theme.buttonText,
                }}
                onClick={() => navigate("/signup")}
              >
                Get Started
              </button>
            </div>
          </div>

          <div style={styles.right}>
            <FeatureCarousel theme={theme} styles={styles} features={features} activeFeature={activeFeature} />
          </div>
        </div>
      </section>

      <footer
        style={{
          ...styles.footer,
          borderTop: `1px solid ${theme.border}`,
          color: theme.muted,
        }}
      >
        Copyright {new Date().getFullYear()} SME Scoring Platform
      </footer>
    </div>
  );
}
