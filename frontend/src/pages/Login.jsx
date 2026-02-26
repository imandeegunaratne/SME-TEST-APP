import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [dark] = useState(true); // Defaulted for this example
  const theme = dark ? darkTheme : lightTheme;

  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
        });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Login failed.");

      localStorage.setItem("username", data.username); 

      navigate("/evaluator-home"); 
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      

      <div style={styles.centerWrap}>
        <div style={{ ...styles.card, background: theme.card, border: `1px solid ${theme.border}` }} className="login-card">
          <h2 style={styles.h2}>Login</h2>
          <p style={{ ...styles.sub, color: theme.mutedText }}>
            Evaluators login here.
          </p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <label style={styles.label}>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="Your username"
              style={{ ...styles.input, border: `1px solid ${theme.border}`, color: theme.text, background: theme.bg }}
              required
            />

            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Your password"
              style={{ ...styles.input, border: `1px solid ${theme.border}`, color: theme.text, background: theme.bg }}
              required
            />

            <button disabled={loading} style={{ ...styles.primaryBtn, background: theme.primary }}>
              {loading ? "Signing in..." : "Login"}
            </button>
            <button onClick={() => navigate("/")} style={styles.link}>
              Back to Home
            </button>

            {err && <div style={{ color: "#ef4444", marginTop: 6 }}>{err}</div>}

            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{ ...styles.linkBtn, color: theme.text }}
            >
              New evaluator? Create an account →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const lightTheme = {
  bg: "#f7fbff",
  text: "#0b1220",
  card: "#ffffff",
  border: "rgba(11, 18, 32, 0.12)",
  primary: "#1f9cc6",
  mutedText: "rgba(11, 18, 32, 0.70)",
};

const darkTheme = {
  bg: "#071423",
  text: "#ffffff",
  card: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.14)",
  primary: "#1f9cc6",
  mutedText: "rgba(255,255,255,0.72)",
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between", // Pushes content to edges
    padding: "16px 5%",
    alignItems: "center",
    width: "100%", // Necessary to fill the screen
    boxSizing: "border-box",
  },
  brand: { display: "flex", alignItems: "center", cursor: "pointer" },
  logoImg: { width: 44, height: 44, objectFit: "contain" },
  ghostBtn: { padding: "8px 18px", borderRadius: 10, cursor: "pointer", background: "transparent", fontWeight: 700 },

  centerWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center", // Vertically center the card
    justifyContent: "center", // Horizontally center the card
    padding: "24px 5%",
  },

  card: {
    width: "min(480px, 100%)",
    borderRadius: 18,
    padding: "32px 24px",
    boxShadow: "0 18px 45px rgba(0,0,0,0.15)",
  },

  h2: { margin: 0, fontSize: 26 },
  sub: { marginTop: 6, marginBottom: 0 },
  label: { fontSize: 13, fontWeight: 800, marginTop: 6 },
  input: { padding: 12, borderRadius: 12, outline: "none", width: "100%", boxSizing: "border-box" },
  primaryBtn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    border: "none",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  linkBtn: {
    marginTop: 12,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: 700,
    opacity: 0.8,
  },
  link: {
    marginTop: 10,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    opacity: 0.85,
  },
};
