import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

export default function Landing() {
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
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 2200);

    return () => clearInterval(interval);
  }, []);

  const theme = dark ? darkTheme : lightTheme;

  const features = [
  { title: "Business model assessment" },
  { title: "SME scoring consistency" },
  { title: "Reporting for lending decisions" },
];

  return (
    <div
      style={{
        ...styles.page,
        background: theme.bg,
        color: theme.text,
      }}
    >
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
            <div style={{ ...styles.brandTitle, color: theme.text }}>
              SME Scoring
            </div>
            <div style={{ ...styles.brandSub, color: theme.muted }}>
              Decision Support Platform
            </div>
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
            

            <h1 style={{ ...styles.title, color: theme.text }}>
              Smarter SME evaluation for better lending decisions
            </h1>

            <p style={{ ...styles.subtitle, color: theme.muted }}>
              A professional platform for SME scoring, evaluator workflows, and
              decision support analytics.
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
            <div style={styles.liveUiWrap}>
              <div
                style={{
                  ...styles.liveCardLarge,
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  boxShadow: theme.shadow,
                }}
              >
                <div style={styles.liveHeader}>
                  <div>
                    <div style={{ ...styles.liveTitle, color: theme.text }}>
                      Decision Support Features
                    </div>
                    <div style={{ ...styles.liveSub, color: theme.muted }}>
                      Intelligent functions for your SME scoring platform
                    </div>
                  </div>

                  <div style={styles.liveHeaderDots}>
                    {features.map((_, index) => (
                      <span
                        key={index}
                        style={{
                          ...styles.dot,
                          background:
                            activeFeature === index ? theme.button : theme.dot,
                          transform:
                            activeFeature === index ? "scale(1.15)" : "scale(1)",
                          transition: "all 0.2s ease",
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div style={styles.featureStack}>
                {features.map((item, index) => {
                  const isActive = activeFeature === index;

                  return (
                    <div
                      key={item.title}
                      style={{
                        ...styles.featureLiveCard,
                        background: isActive ? theme.activeCard : theme.subCard,
                        border: `1px solid ${
                          isActive ? theme.activeBorder : theme.border
                        }`,
                        boxShadow: isActive ? theme.activeShadow : "none",
                        transform: isActive
                          ? "translateY(0px) scale(1.02)"
                          : "translateY(0px) scale(0.98)",
                        opacity: isActive ? 1 : 0.75,
                      }}
                    >
                      <div
                        style={{
                          ...styles.featureAccent,
                          background: isActive ? theme.button : theme.buttonSoft,
                        }}
                      />

                      <div style={styles.featureLiveBody}>
                        <div
                          style={{
                            ...styles.featureIndex,
                            background: isActive
                              ? theme.buttonSoftStrong
                              : theme.buttonSoft,
                            color: theme.button,
                          }}
                        >
                          0{index + 1}
                        </div>

                        <div
                          style={{
                            ...styles.featureLiveTitle,
                            color: theme.text,
                          }}
                        >
                          {item.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              </div>

             
                  
            </div>
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
        © {new Date().getFullYear()} SME Scoring Platform
      </footer>
    </div>
  );
}

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#08111F",
  navBg: "rgba(8,17,31,0.82)",
  text: "#F8FAFC",
  muted: "rgba(248,250,252,0.70)",
  card: "rgba(15,27,45,0.88)",
  subCard: "#13233A",
  activeCard: "rgba(18,34,55,0.98)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",
  activeBorder: "rgba(47,150,180,0.34)",
  button: BRAND,
  buttonText: "#FFFFFF",
  buttonSoft: "rgba(47,150,180,0.12)",
  buttonSoftStrong: "rgba(47,150,180,0.20)",
  heroGlow:
    "radial-gradient(700px 340px at 25% 20%, rgba(47,150,180,0.22), transparent 72%)",
  heroGlowTwo:
    "radial-gradient(500px 260px at 80% 60%, rgba(93,183,207,0.12), transparent 72%)",
  shadow: "0 30px 70px rgba(0,0,0,0.35)",
  softShadow: "0 16px 32px rgba(0,0,0,0.22)",
  activeShadow: "0 0 0 1px rgba(47,150,180,0.18), 0 16px 34px rgba(0,0,0,0.18)",
  dot: "rgba(255,255,255,0.22)",
};

const lightTheme = {
  bg: "#F4F8FB",
  navBg: "rgba(244,248,251,0.88)",
  text: "#0F172A",
  muted: "rgba(15,23,42,0.65)",
  card: "rgba(255,255,255,0.92)",
  subCard: "#F8FBFE",
  activeCard: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "rgba(15,23,42,0.14)",
  activeBorder: "rgba(47,150,180,0.24)",
  button: BRAND,
  buttonText: "#FFFFFF",
  buttonSoft: "rgba(47,150,180,0.10)",
  buttonSoftStrong: "rgba(47,150,180,0.16)",
  heroGlow:
    "radial-gradient(700px 340px at 25% 20%, rgba(47,150,180,0.17), transparent 72%)",
  heroGlowTwo:
    "radial-gradient(500px 260px at 80% 60%, rgba(93,183,207,0.10), transparent 72%)",
  shadow: "0 30px 70px rgba(15,23,42,0.12)",
  softShadow: "0 16px 32px rgba(15,23,42,0.08)",
  activeShadow:
    "0 0 0 1px rgba(47,150,180,0.12), 0 16px 34px rgba(15,23,42,0.10)",
  dot: "#D6E2EC",
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 5%",
    backdropFilter: "blur(12px)",
    flexWrap: "wrap",
    gap: 12,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
  },

  logoImg: {
    width: 100,
    height: 72,
    objectFit: "contain",
  },

  brandTitle: {
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.1,
  },

  brandSub: {
    fontSize: 12  ,
    marginTop: 3,
  },

  navActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  ghostBtn: {
    padding: "10px 15px",
    borderRadius: 12,
    border: "1px solid",
    background: "transparent",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },

  primaryBtn: {
    padding: "10px 16px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 14,
  },

  hero: {
    position: "relative",
    padding: "60px 5% 50px",
    flex: 1,
    display: "flex",
    alignItems: "center",
  },

  heroGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  heroGlowTwo: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  heroContent: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 32,
    alignItems: "center",
  },

  left: {
    maxWidth: 620,
  },

  right: {
    display: "flex",
    justifyContent: "center",
  },

  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 18,
  },

  title: {
    fontSize: "clamp(34px, 5vw, 58px)",
    lineHeight: 1.05,
    letterSpacing: -1,
    margin: "0 0 18px 0",
    fontWeight: 850,
  },

  subtitle: {
    fontSize: "clamp(16px, 2vw, 19px)",
    lineHeight: 1.7,
    margin: "0 0 28px 0",
    maxWidth: 560,
  },

  actions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  primaryLargeBtn: {
    padding: "13px 22px",
    borderRadius: 14,
    border: "none",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 15,
  },

  liveUiWrap: {
    width: "100%",
    maxWidth: 560,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  liveCardLarge: {
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    backdropFilter: "blur(12px)",
  },

  liveHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 20,
  },

  liveTitle: {
    fontSize: 18,
    fontWeight: 800,
  },

  liveSub: {
    fontSize: 13,
    marginTop: 4,
  },

  liveHeaderDots: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    display: "inline-block",
  },

  featureStack: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  featureLiveCard: {
    borderRadius: 18,
    padding: 16,
    transition: "all 0.2s ease",
  },

  featureAccent: {
    width: "100%",
    height: 4,
    borderRadius: 999,
    marginBottom: 14,
    transition: "all 0.4s ease",
  },

  featureLiveBody: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },

  featureIndex: {
    minWidth: 42,
    height: 42,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 800,
    flexShrink: 0,
  },

  featureLiveTitle: {
    fontSize: 17,
    fontWeight: 800,
    marginBottom: 5,
  },

  featureLiveText: {
    fontSize: 13,
    lineHeight: 1.65,
  },

  liveBottomRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 14,
  },

  miniCard: {
    borderRadius: 20,
    padding: 18,
    backdropFilter: "blur(10px)",
  },

  miniTop: {
    fontSize: 12,
    marginBottom: 10,
  },

  miniValue: {
    fontSize: 17,
    fontWeight: 800,
    lineHeight: 1.3,
  },

  footer: {
    padding: "18px 5%",
    textAlign: "center",
    fontSize: 14,
  },
};