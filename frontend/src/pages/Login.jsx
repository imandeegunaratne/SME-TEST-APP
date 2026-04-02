import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
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

      localStorage.setItem("token", data.token || "");
      localStorage.setItem("role", data.role || "");
      localStorage.setItem("username", data.username || "");
      localStorage.setItem("bank_name", data.bank_name || "");
      localStorage.setItem("bank_code", data.bank_code || "");

      if (data.role === "BANK_ADMIN") {
        navigate("/bank-admin-dashboard");
      } else {
        navigate("/evaluator-home");
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      localStorage.removeItem("bank_name");
      localStorage.removeItem("bank_code");
      setErr(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...styles.page, background: theme.bg }}>
      <div
        style={{
          ...styles.card,
          background: theme.card,
          border: `1px solid ${theme.border}`,
        }}
      >
        <h1 style={{ ...styles.title, color: theme.text }}>Evaluator Login</h1>
        <p style={{ ...styles.subtitle, color: theme.muted }}>
          Sign in with your evaluator account.
        </p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={onChange}
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
            required
          />

          <button disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Login"}
          </button>

          {err && <div style={styles.error}>{err}</div>}

          <button type="button" onClick={() => navigate("/")} style={styles.link}>
            Back to Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={styles.link}
          >
            New evaluator? Create an account
          </button>
        </form>
      </div>
    </div>
  );
}

const lightTheme = {
  bg: "#F4F8FB",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  inputBg: "#FFFFFF",
};

const darkTheme = {
  bg: "#071423",
  card: "rgba(255,255,255,0.06)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",
  border: "rgba(255,255,255,0.14)",
  inputBg: "rgba(255,255,255,0.04)",
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 30,
    borderRadius: 16,
    boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    marginBottom: 20,
    fontSize: 14,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    outline: "none",
  },
  button: {
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#2F96B4",
    color: "white",
    fontWeight: 700,
    cursor: "pointer",
  },
  link: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#2F96B4",
    fontSize: 14,
  },
  error: {
    color: "#DC2626",
    fontSize: 14,
  },
};
