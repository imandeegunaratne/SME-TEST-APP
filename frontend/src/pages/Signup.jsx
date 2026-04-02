import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const dark = localStorage.getItem("theme") === "dark";
  const theme = dark ? darkTheme : lightTheme;

  const [form, setForm] = useState({
    bank_code: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function extractErrorMessage(data) {
    if (!data) return "Signup failed.";
    if (typeof data.detail === "string") return data.detail;

    if (typeof data === "object") {
      for (const value of Object.values(data)) {
        if (Array.isArray(value) && value.length > 0) return String(value[0]);
        if (typeof value === "string") return value;
      }
    }

    return "Signup failed.";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!form.bank_code.trim()) {
      setErr("Bank code is required.");
      return;
    }

    if (!form.username.trim()) {
      setErr("Username is required.");
      return;
    }

    if (form.password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }

    if (form.password !== form.confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/signup/evaluator/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_code: form.bank_code.trim(),
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(extractErrorMessage(data));
      }

      setMsg("Account created successfully. Wait for bank admin approval before login.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      setErr(error.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <div
        style={{
          ...styles.card,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
        }}
      >
        <h1 style={{ ...styles.title, color: theme.text }}>Evaluator Signup</h1>
        <p style={{ ...styles.note, color: theme.muted }}>
          Enter the correct bank code. Your account will be created as pending until
          the bank admin approves it.
        </p>

        <form onSubmit={onSubmit} style={styles.form}>
          <input
            name="bank_code"
            value={form.bank_code}
            onChange={onChange}
            placeholder="Bank code"
            required
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          />

          <input
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="Username"
            required
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password (min 8 characters)"
            required
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          />

          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={onChange}
            placeholder="Confirm password"
            required
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          />

          <button disabled={loading} style={styles.button}>
            {loading ? "Creating account..." : "Create account"}
          </button>

          {msg && <div style={styles.success}>{msg}</div>}
          {err && <div style={styles.error}>{err}</div>}

          <button type="button" onClick={() => navigate("/login")} style={styles.link}>
            Already have an account? Login
          </button>
          <button type="button" onClick={() => navigate("/")} style={styles.link}>
            Back to Home
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
  shadow: "0 16px 32px rgba(15,23,42,0.08)",
};

const darkTheme = {
  bg: "#071423",
  card: "#172033",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.75)",
  border: "rgba(255,255,255,0.14)",
  inputBg: "rgba(255,255,255,0.04)",
  shadow: "0 16px 32px rgba(0,0,0,0.18)",
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
    maxWidth: 460,
    padding: 30,
    borderRadius: 18,
  },
  title: {
    marginBottom: 10,
    fontSize: 32,
    fontWeight: 700,
  },
  note: {
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 1.6,
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
    textAlign: "left",
    padding: 0,
    fontSize: 18,
  },
  error: {
    color: "#DC2626",
    fontSize: 18,
  },
  success: {
    color: "#059669",
    fontSize: 18,
  },
};
