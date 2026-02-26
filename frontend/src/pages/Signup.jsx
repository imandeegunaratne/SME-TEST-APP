import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

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

      setMsg("Account created ✅ You can login now.");
      setTimeout(() => navigate("/login"), 800);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="signup-card">
        <h2 style={{ marginTop: 0 }}>Evaluator Signup</h2>
        <p style={{ opacity: 0.75, marginTop: 6 }}>
          Enter your bank code to join the correct bank.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <input
            name="bank_code"
            value={form.bank_code}
            onChange={onChange}
            placeholder="Bank code (e.g., HNB001)"
            required
            style={styles.input}
          />

          <input
            name="username"
            value={form.username}
            onChange={onChange}
            placeholder="Username"
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Password (min 8 characters)"
            required
            style={styles.input}
          />

          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={onChange}
            placeholder="Confirm password"
            required
            style={styles.input}
          />
          
          <button disabled={loading} style={styles.btn}>
            {loading ? "Creating..." : "Create account"}
          </button>
          <button onClick={() => navigate("/")} style={styles.link}>
           Back to Home
          </button>

          {msg && <div style={{ color: "green" }}>{msg}</div>}
          {err && <div style={{ color: "crimson" }}>{err}</div>}
        </form>

        <button onClick={() => navigate("/login")} style={styles.link}>
          Already have an account? Login →
        </button>

        
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    minWidth: 0,
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
    padding: 12,
    fontFamily: "system-ui",
    color: "white",
    boxSizing: "border-box",
  },
  card: {
    width: "min(520px, 100%)",
    maxWidth: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 18,
    padding: 18,
    boxSizing: "border-box",
    margin: "0 auto",
  },
  input: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "transparent",
    color: "white",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    border: "none",
    background: "#1f9cc6",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
  },
  link: {
    marginTop: 14,
    background: "transparent",
    border: "none",
    color: "white",
    cursor: "pointer",
    textAlign: "left",
    opacity: 0.85,
    fontWeight: 700,
    width: "100%",
    boxSizing: "border-box",
  },
};

// Responsive styles for mobile
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @media (max-width: 600px) {
      .signup-card {
        width: 98vw !important;
        max-width: 98vw !important;
        padding: 8px !important;
        border-radius: 10px !important;
        margin: 0 !important;
      }
      body, html {
        padding: 0 !important;
        margin: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}
