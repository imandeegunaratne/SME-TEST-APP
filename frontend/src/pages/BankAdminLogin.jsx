import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BankAdminLogin() {
  const navigate = useNavigate();

  const dark = localStorage.getItem("theme") === "dark";
  const theme = dark ? darkTheme : lightTheme;

  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    localStorage.removeItem("bank_name");
    localStorage.removeItem("bank_code");

    try {
      const res = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.detail || "Login failed.");
      }

      if (data.role !== "BANK_ADMIN") {
        throw new Error("This account is not a bank admin account.");
      }

      localStorage.setItem("token", data.token || "");
      localStorage.setItem("role", data.role || "");
      localStorage.setItem("username", data.username || "");
      localStorage.setItem("bank_name", data.bank_name || "");
      localStorage.setItem("bank_code", data.bank_code || "");

      navigate("/bank-admin-dashboard");
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("bank_name");
      localStorage.removeItem("bank_code");
      setErr(error.message || "Unable to login.");
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
  h2: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
  },
  sub: {
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 1.6,
  },
  form: {
    display: "grid",
    gap: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: 600,
    marginTop: 2,
  },
  input: {
    height: 46,
    borderRadius: 12,
    padding: "0 14px",
    outline: "none",
    fontSize: 14,
  },
  primaryBtn: {
    marginTop: 8,
    height: 46,
    border: "none",
    borderRadius: 12,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  link: {
    marginTop: 6,
    border: "none",
    background: "transparent",
    padding: 0,
    textAlign: "left",
    fontWeight: 600,
    cursor: "pointer",
  },
  errorBox: {
    marginTop: 6,
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
  },
};
