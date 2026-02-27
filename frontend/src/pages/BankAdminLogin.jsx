// src/pages/BankAdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function BankAdminLogin() {
  const navigate = useNavigate();
  const [dark] = useState(true); // change if you want theme toggle
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
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // server returned an error message
        throw new Error(data.detail || "Login failed. Check credentials.");
      }

      // Save auth details to localStorage
      // (store only what backend returns — don't store sensitive extras)
      localStorage.setItem("token", data.token || "");
      localStorage.setItem("username", data.username || "");
      localStorage.setItem("role", data.role || "");
      if (data.bank_name) localStorage.setItem("bank_name", data.bank_name);
      if (data.bank_code) localStorage.setItem("bank_code", data.bank_code);

      // Role guard — only bank admins should use this login page
      if (data.role !== "BANK_ADMIN") {
        // keep consistent state: clear token and other values we just set
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("bank_name");
        localStorage.removeItem("bank_code");

        throw new Error("This account is not a bank admin.");
      }

      // Redirect to admin dashboard
      navigate("/bank-admin-dashboard");
    } catch (err2) {
      // show a user-friendly message
      setErr(err2.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <div style={styles.centerWrap}>
        <div
          style={{ ...styles.card, background: theme.card, border: `1px solid ${theme.border}` }}
          className="login-card"
        >
          <img src={logo} alt="logo" style={{ width: 64, height: 46, marginBottom: 12 }} />

          <h2 style={styles.h2}>Bank Admin Login</h2>
          <p style={{ ...styles.sub, color: theme.mutedText }}>
            Sign in with your bank admin account.
          </p>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <label style={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="Admin username"
              style={{ ...styles.input, border: `1px solid ${theme.border}`, color: theme.text, background: theme.bg }}
              required
              autoComplete="username"
            />

            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password"
              style={{ ...styles.input, border: `1px solid ${theme.border}`, color: theme.text, background: theme.bg }}
              required
              autoComplete="current-password"
            />

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              style={{ ...styles.primaryBtn, background: theme.primary }}
            >
              {loading ? "Signing in..." : "Login"}
            </button>

            <button type="button" onClick={() => navigate("/")} style={styles.link}>
              Back to Home
            </button>

            {err && <div style={{ color: "#ef4444", marginTop: 6 }}>{err}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}

/* ================= THEME & STYLES ================= */

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
  centerWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  link: {
    marginTop: 10,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    opacity: 0.85,
    textAlign: "left",
  },
};