import { useMemo, useRef, useState, useEffect } from "react";
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

const industries = [
  "Agriculture, Forestry and Fishing",
  "Mining and Quarrying",
  "Manufacturing",
  "Electricity, Gas, Steam and Air Conditioning Supply",
  "Water Supply, Sewerage, Waste Management and Remediation Activities",
  "Construction",
  "Wholesale and Retail Trade; Repair of Motor Vehicles and Motorcycles",
  "Transportation and Storage",
  "Accommodation and Food Service Activities",
  "Information and Communication",
  "Financial and Insurance Activities",
  "Real Estate Activities",
  "Professional, Scientific and Technical Activities",
  "Administrative and Support Service Activities",
  "Public Administration and Defence; Compulsory Social Security",
  "Education",
  "Human Health and Social Work Activities",
  "Arts, Entertainment and Recreation",
  "Other Service Activities",
  "Activities of Households as Employers; Undifferentiated Goods- and Services-Producing Activities of Households",
  "Activities of Extraterritorial Organizations and Bodies",
];

export default function SmeRegister() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    br_number: "",
    industry: "",
  });

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const [industryOpen, setIndustryOpen] = useState(false);
  const [industrySearch, setIndustrySearch] = useState("");

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  const filteredIndustries = useMemo(() => {
    const q = industrySearch.trim().toLowerCase();
    if (!q) return industries;
    return industries.filter((item) => item.toLowerCase().includes(q));
  }, [industrySearch]);

  function selectIndustry(value) {
    setForm((f) => ({ ...f, industry: value }));
    setIndustrySearch("");
    setIndustryOpen(false);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const res = await fetch("/api/smes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIndustryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
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

            {/* SEARCHABLE INDUSTRY DROPDOWN */}
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                onClick={() => setIndustryOpen((s) => !s)}
                style={{
                  ...inputStyle,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  minHeight: 44,
                }}
              >
                <span style={{ color: form.industry ? "#fff" : "rgba(255,255,255,0.55)" }}>
                  {form.industry || "Select Industry"}
                </span>
                <span style={{ fontSize: 12 }}>▼</span>
              </div>

              {industryOpen && (
                <div style={dropdownMenu}>
                  <input
                    type="text"
                    placeholder="Search industry..."
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    style={{
                      ...inputStyle,
                      width: "100%",
                      marginBottom: 10,
                      outline: "none",
                    }}
                  />

                  <div style={optionsList}>
                    {filteredIndustries.length > 0 ? (
                      filteredIndustries.map((item) => (
                        <div
                          key={item}
                          onClick={() => selectIndustry(item)}
                          style={optionStyle}
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: 10, color: "rgba(255,255,255,0.7)" }}>
                        No industry found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

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
            <button style={{ ...btnStyle, marginTop: 16 }} onClick={() => setModal(null)}>
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
  width: "100%",
  boxSizing: "border-box",
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

const dropdownMenu = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  background: "#10192b",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 12,
  padding: 10,
  zIndex: 20,
  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
};

const optionsList = {
  maxHeight: 220,
  overflowY: "auto",
  borderRadius: 8,
};

const optionStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  cursor: "pointer",
  color: "#fff",
  background: "transparent",
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
  border: "1px solid rgba(255,255,255,0.12)",
};