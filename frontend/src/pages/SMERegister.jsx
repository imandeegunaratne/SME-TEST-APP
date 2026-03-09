import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#0B1220",
  navBg: "rgba(16,24,38,0.92)",
  card: "#172033",
  dropdownBg: "#10192b",
  inputBg: "#0f172a",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  button: BRAND,
  buttonText: "#FFFFFF",
  shadow: "0 14px 34px rgba(15,23,42,0.18)",
};

const lightTheme = {
  bg: "#F4F7FB",
  navBg: "rgba(255,255,255,0.92)",
  card: "#FFFFFF",
  dropdownBg: "#FFFFFF",
  inputBg: "#FFFFFF",
  text: "#0F172A",
  muted: "#475569",
  border: "rgba(15,23,42,0.10)",
  borderStrong: "rgba(15,23,42,0.16)",
  button: BRAND,
  buttonText: "#FFFFFF",
  shadow: "0 14px 34px rgba(15,23,42,0.08)",
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

  const [themeMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const theme = useMemo(
    () => (themeMode === "dark" ? darkTheme : lightTheme),
    [themeMode]
  );

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
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <header
        style={{
          ...styles.navbar,
          background: theme.navBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div
          style={styles.brand}
          onClick={() => navigate("/evaluator-home")}
        >
          <img src={logo} alt="logo" style={styles.logoImg} />
          <div>
            <div style={{ ...styles.brandTitle, color: theme.text }}>
              SME Scoring
            </div>
            <div style={{ ...styles.brandSub, color: theme.muted }}>
              Evaluator Workspace
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <div
          style={{
            ...styles.card,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            boxShadow: theme.shadow,
          }}
        >
          <h2 style={{ ...styles.title, color: theme.text }}>
            Register New SME
          </h2>
          <p style={{ ...styles.subText, color: theme.muted }}>
            Add SME details before starting the evaluation process.
          </p>

          <form onSubmit={onSubmit} style={styles.form}>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="SME Name"
              style={{
                ...styles.input,
                background: theme.inputBg,
                color: theme.text,
                border: `1px solid ${theme.borderStrong}`,
              }}
            />

            <input
              name="br_number"
              value={form.br_number}
              onChange={onChange}
              required
              placeholder="BR Number"
              style={{
                ...styles.input,
                background: theme.inputBg,
                color: theme.text,
                border: `1px solid ${theme.borderStrong}`,
              }}
            />

            <div style={{ position: "relative" }} ref={dropdownRef}>
              <div
                onClick={() => setIndustryOpen((s) => !s)}
                style={{
                  ...styles.input,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  minHeight: 48,
                  background: theme.inputBg,
                  color: theme.text,
                  border: `1px solid ${theme.borderStrong}`,
                }}
              >
                <span style={{ color: form.industry ? theme.text : theme.muted }}>
                  {form.industry || "Select Industry"}
                </span>
                <span style={{ fontSize: 12, color: theme.muted }}>▼</span>
              </div>

              {industryOpen && (
                <div
                  style={{
                    ...styles.dropdownMenu,
                    background: theme.dropdownBg,
                    border: `1px solid ${theme.borderStrong}`,
                    boxShadow: theme.shadow,
                  }}
                >
                  <input
                    type="text"
                    placeholder="Search industry..."
                    value={industrySearch}
                    onChange={(e) => setIndustrySearch(e.target.value)}
                    style={{
                      ...styles.input,
                      marginBottom: 10,
                      background: theme.inputBg,
                      color: theme.text,
                      border: `1px solid ${theme.borderStrong}`,
                    }}
                  />

                  <div style={styles.optionsList}>
                    {filteredIndustries.length > 0 ? (
                      filteredIndustries.map((item) => (
                        <div
                          key={item}
                          onClick={() => selectIndustry(item)}
                          style={{
                            ...styles.optionStyle,
                            color: theme.text,
                          }}
                        >
                          {item}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: 10, color: theme.muted }}>
                        No industry found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                ...styles.btn,
                background: theme.button,
                color: theme.buttonText,
              }}
              disabled={loading}
            >
              {loading ? "Saving..." : "Register SME"}
            </button>
          </form>
        </div>
      </main>

      {modal && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalBox,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
          >
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {modal.type === "error" ? "Registration Failed" : "Success"}
            </div>
            <div style={{ marginTop: 10, color: theme.muted }}>
              {modal.message}
            </div>
            <button
              style={{
                ...styles.btn,
                marginTop: 16,
                background: theme.button,
                color: theme.buttonText,
              }}
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

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Inter, Arial, sans-serif",
  },

  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    padding: "14px 5%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backdropFilter: "blur(10px)",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
  },

  logoImg: {
    width: 90,
    height: 60,
    objectFit: "contain",
  },

  brandTitle: {
    fontSize: 20,
    fontWeight: 800,
  },

  brandSub: {
    fontSize: 12,
    marginTop: 2,
  },

  main: {
    width: "min(600px, 92%)",
    margin: "40px auto",
  },

  card: {
    padding: 24,
    borderRadius: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 800,
    margin: 0,
  },

  subText: {
    marginTop: 8,
    marginBottom: 18,
    fontSize: 14,
  },

  form: {
    display: "grid",
    gap: 12,
  },

  input: {
    padding: 12,
    borderRadius: 12,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    fontSize: 14,
  },

  btn: {
    padding: 12,
    borderRadius: 12,
    border: "none",
    fontWeight: 800,
    cursor: "pointer",
  },

  dropdownMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    borderRadius: 12,
    padding: 10,
    zIndex: 20,
  },

  optionsList: {
    maxHeight: 220,
    overflowY: "auto",
    borderRadius: 8,
  },

  optionStyle: {
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },

  modalBox: {
    padding: 20,
    borderRadius: 16,
    width: 350,
    textAlign: "center",
  },
};