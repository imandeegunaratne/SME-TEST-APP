import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const BRAND = "#2F96B4";

const theme = {
  bg: "#0B1220",
  navBg: "rgba(11,18,32,0.78)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.78)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  button: BRAND,
  buttonText: "#FFFFFF",
};

export default function SmeRegister() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    br_number: "",
    industry: "",
  });

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const username = localStorage.getItem("username");

      const res = await fetch("/api/smes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setModal({ type: "error", message: data.detail });
        return;
      }

      if (!res.ok) {
        throw new Error(data.detail || "Failed to register SME.");
      }

      setModal({
        type: "success",
        message: "SME registered successfully!",
      });

      setTimeout(() => {
  navigate("/evaluator-home");
}, 1000);
    } catch (err) {
      setModal({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text }}>
      
      {/* NAVBAR */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          padding: "14px 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: theme.navBg,
          borderBottom: `1px solid ${theme.border}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navigate("/evaluator-home")}
        >
          <img src={logo} alt="logo" style={{ width: 90, height: 60 }} />
          <div>
            <div style={{ fontWeight: 900 }}>SME Scoring</div>
            <div style={{ fontSize: 12, color: theme.muted }}>
              Decision Support Platform
            </div>
          </div>
        </div>

      </header>

      {/* PAGE BODY */}
      <div style={{ width: "min(600px, 92%)", margin: "40px auto" }}>
        <div
          style={{
            background: "#172033",
            padding: 20,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <h2 style={{ fontSize: 22, fontWeight: 900 }}>
            Register New SME
          </h2>

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="SME Name"
              style={inputStyle}
            />

            <input
              name="br_number"
              value={form.br_number}
              onChange={onChange}
              required
              placeholder="BR Number"
              style={inputStyle}
            />

            <input
              name="industry"
              value={form.industry}
              onChange={onChange}
              placeholder="Industry"
              style={inputStyle}
            />

            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? "Saving..." : "Register SME"}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {modal.type === "error" ? "Registration Failed" : "Success"}
            </div>
            <div style={{ marginTop: 10 }}>{modal.message}</div>
            <button
              style={btnStyle}
              onClick={() => setModal(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
};

const btnStyle = {
  padding: 12,
  borderRadius: 10,
  border: "none",
  background: "#2F96B4",
  color: "#fff",
  fontWeight: 900,
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalBox = {
  background: "#172033",
  padding: 20,
  borderRadius: 16,
  width: 350,
  textAlign: "center",
};