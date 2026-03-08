import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

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
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    setErr("");

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
      const res = await fetch("/api/auth/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bank_code: form.bank_code.trim(),
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Signup failed.");

      setMsg("Account created. You can login now.");
      setTimeout(() => navigate("/login"), 800);
    } catch (e2) {
      setErr(e2.message);
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
        <h3 style={{ ...styles.title2}}>
          Enter your bank code to join the correct bank.
        </h3>

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

          <button disabled={loading} style={styles.btn}>
            {loading ? "Creating..." : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{ ...styles.link, color: theme.link }}
          >
            Back to Home
          </button>

          {msg && <div style={{ color: theme.success }}>{msg}</div>}
          {err && <div style={{ color: theme.error }}>{err}</div>}
        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{ ...styles.bottomLink, color: theme.link }}
        >
          Already have an account? Login
        </button>
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
  link: "#2F96B4",
  success: "green",
  error: "crimson",
  shadow: "0 20px 40px rgba(0,0,0,0.10)",
};

const darkTheme = {
  bg: "#071423",
  card: "rgba(255,255,255,0.06)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.7)",
  border: "rgba(255,255,255,0.14)",
  inputBg: "transparent",
  link: "#7DD3FC",
  success: "#86EFAC",
  error: "#FCA5A5",
  shadow: "0 20px 40px rgba(0,0,0,0.20)",
};

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    boxSizing: "border-box",
    fontFamily: "system-ui",
  },

  card: {
    width: "min(520px, 100%)",
    borderRadius: 18,
    padding: 22,
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  logo: {
    width: 55,
    height: 55,
    objectFit: "contain",
  },

  brandTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  brandSub: {
    fontSize: 12,
  },

  title: {
    marginBottom: 18,
    fontSize: 24,
    fontWeight: "bold",
  },
  title2:{
    marginBottom: 18,
    fontSize: 16,
    
  },
  sub: {
    marginTop: 0,
    marginBottom: 14,
  },

  form: {
    display: "grid",
    gap: 10,
  },

  input: {
    padding: 12,
    borderRadius: 12,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  btn: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "#2F96B4",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
  },

  link: {
    marginTop: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 700,
    width: "100%",
    boxSizing: "border-box",
  },

  bottomLink: {
    marginTop: 14,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 700,
    width: "100%",
    boxSizing: "border-box",
  },
};