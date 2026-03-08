// src/pages/BankAdminLogin.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function BankAdminLogin() {
  const navigate = useNavigate();

  const dark = localStorage.getItem("theme") === "dark";
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
        throw new Error(data.detail || "Login failed. Check credentials.");
      }

      localStorage.setItem("token", data.token || "");
      localStorage.setItem("username", data.username || "");
      localStorage.setItem("role", data.role || "");
      if (data.bank_name) localStorage.setItem("bank_name", data.bank_name);
      if (data.bank_code) localStorage.setItem("bank_code", data.bank_code);

      if (data.role !== "BANK_ADMIN") {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("bank_name");
        localStorage.removeItem("bank_code");
        throw new Error("This account is not a bank admin.");
      }

      navigate("/bank-admin-dashboard");
    } catch (err2) {
      setErr(err2.message || "Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <div style={styles.centerWrap}>
        <div
          style={{
            ...styles.card,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}
        >
          

          <h2 style={{ ...styles.h2, color: theme.text }}>Bank Admin Login</h2>
          <p style={{ ...styles.sub, color: theme.mutedText }}>
            Sign in with your bank admin account.
          </p>

          <form onSubmit={onSubmit} style={styles.form}>
            <label style={{ ...styles.label, color: theme.text }} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="Admin username"
              style={{
                ...styles.input,
                border: `1px solid ${theme.border}`,
                color: theme.text,
                background: theme.inputBg,
              }}
              required
              autoComplete="username"
            />

            <label style={{ ...styles.label, color: theme.text }} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Password"
              style={{
                ...styles.input,
                border: `1px solid ${theme.border}`,
                color: theme.text,
                background: theme.inputBg,
              }}
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

            <button
              type="button"
              onClick={() => navigate("/")}
              style={{ ...styles.link, color: theme.link }}
            >
              Back to Home
            </button>

            {err && (
              <div
                style={{
                  ...styles.errorBox,
                  background: theme.errorBg,
                  border: `1px solid ${theme.errorBorder}`,
                  color: theme.errorText,
                }}
              >
                {err}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

const lightTheme = {
  bg: "#F4F8FB",
  text: "#0F172A",
  card: "#FFFFFF",
  border: "#E2E8F0",
  primary: "#2F96B4",
  mutedText: "rgba(15,23,42,0.68)",
  inputBg: "#FFFFFF",
  link: "#2F96B4",
  shadow: "0 16px 32px rgba(15,23,42,0.08)",
  errorBg: "rgba(239,68,68,0.08)",
  errorBorder: "rgba(239,68,68,0.20)",
  errorText: "#B91C1C",
};

const darkTheme = {
  bg: "#0B1220",
  text: "#FFFFFF",
  card: "#172033",
  border: "rgba(255,255,255,0.10)",
  primary: "#2F96B4",
  mutedText: "rgba(255,255,255,0.78)",
  inputBg: "rgba(255,255,255,0.03)",
  link: "#7DD3FC",
  shadow: "0 16px 32px rgba(0,0,0,0.18)",
  errorBg: "rgba(239,68,68,0.10)",
  errorBorder: "rgba(239,68,68,0.24)",
  errorText: "#FCA5A5",
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },

  centerWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 5%",
  },

  card: {
    width: "min(460px, 100%)",
    borderRadius: 20,
    padding: "28px 24px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },

  logo: {
    width: 55,
    height: 55,
    objectFit: "contain",
  },

  brandTitle: {
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: -0.3,
    lineHeight: 1.1,
  },

  brandSub: {
    fontSize: 12,
    marginTop: 3,
  },

  h2: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    letterSpacing: -0.3,
  },

  sub: {
    marginTop: 8,
    marginBottom: 0,
    fontSize: 14,
    lineHeight: 1.6,
  },

  form: {
    display: "grid",
    gap: 10,
    marginTop: 16,
  },

  label: {
    fontSize: 13,
    fontWeight: 800,
    marginTop: 6,
  },

  input: {
    padding: 12,
    borderRadius: 12,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    fontSize: 14,
  },

  primaryBtn: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: "none",
    color: "white",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },

  link: {
    marginTop: 10,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    textAlign: "left",
    padding: 0,
  },

  errorBox: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 12,
    fontSize: 14,
    lineHeight: 1.5,
  },
};