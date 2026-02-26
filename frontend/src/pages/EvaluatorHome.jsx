// src/pages/EvaluatorLanding.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function EvaluatorLanding() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "";

  /* ================= THEME ================= */
  const [themeMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "light" ? "light" : "dark";
  });

  const theme = useMemo(
    () => (themeMode === "dark" ? darkTheme : lightTheme),
    [themeMode]
  );

  /* ================= STATE ================= */
  const [active, setActive] = useState("scoring");

  const [summary, setSummary] = useState({
    total_smes: 0,
    scored_smes: 0,
    pending_smes: 0,
    avg_score: 0,
  });

  const [smes, setSmes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Search by BR
  const [brSearch, setBrSearch] = useState("");
  const [found, setFound] = useState(null);
  const [searchMsg, setSearchMsg] = useState("");

  /* ================= LOAD DATA ================= */
  async function loadData() {
    setLoading(true);
    setErr("");

    try {
      const [s1, s2] = await Promise.all([
        fetch("/api/evaluator/summary/", {
          headers: { "X-Username": username },
        }),
        fetch("/api/evaluator/smes/", {
          headers: { "X-Username": username },
        }),
      ]);

      const sum = await s1.json().catch(() => ({}));
      const list = await s2.json().catch(() => []);

      if (!s1.ok) throw new Error(sum.detail || "Failed to load summary.");
      if (!s2.ok) throw new Error(list.detail || "Failed to load SMEs.");

      setSummary(sum);
      setSmes(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* ================= SEARCH SME ================= */
  async function searchByBR() {
    if (!brSearch.trim()) {
      setSearchMsg("Please enter a BR number.");
      return;
    }

    try {
      const res = await fetch(
        `/api/smes/by-br/?br=${encodeURIComponent(brSearch)}`,
        {
          headers: { "X-Username": username },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.detail || "SME not found.");

      setFound(data);
      setSearchMsg("");
    } catch (e) {
      setFound(null);
      setSearchMsg(e.message);
    }
  }

  /* ================= RENDER ================= */
  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>

      {/* NAVBAR */}
      <header style={{ ...styles.navbar, background: theme.navBg }}>
        <div style={styles.brand} onClick={() => navigate("/")}>
          <img src={logo} alt="logo" style={styles.logoImg} />
          <div>
            <div style={styles.brandTitle}>SME Scoring</div>
            <div style={styles.brandSub}>Decision Support Platform</div>
          </div>
        </div>

        <div style={styles.centerTabs}>
          <button
            style={{
              ...styles.tabBtn,
              background: active === "scoring" ? theme.tabActiveBg : "transparent",
            }}
            onClick={() => setActive("scoring")}
          >
            SME Scoring
          </button>

          <button
            style={{
              ...styles.tabBtn,
              background: active === "dashboard" ? theme.tabActiveBg : "transparent",
            }}
            onClick={() => setActive("dashboard")}
          >
            Dashboard
          </button>
        </div>
      </header>

      <main style={styles.main}>

        {err && <div style={{ color: "red" }}>{err}</div>}

        {/* ================= SCORING TAB ================= */}
        {active === "scoring" && (
          <>
            {/* REGISTER CARD */}
            <section style={{ ...styles.card, background: theme.card }}>
              <h3>Register SME</h3>
              <button
                style={{ ...styles.primaryBtn, background: theme.button }}
                onClick={() => navigate("/sme-register")}
              >
                + Register New SME
              </button>
            </section>

            {/* SEARCH CARD */}
            <section
              style={{
                ...styles.card,
                background: theme.card,
                marginTop: 16,
              }}
            >
              <h3>Search & Score SME</h3>

              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={brSearch}
                  onChange={(e) => setBrSearch(e.target.value)}
                  placeholder="Enter BR number"
                  style={styles.search}
                />

                <button
                  style={{ ...styles.smallBtn, background: theme.button }}
                  onClick={searchByBR}
                >
                  Search
                </button>
              </div>

              {searchMsg && <div style={{ marginTop: 10 }}>{searchMsg}</div>}

              {found && (
                <div style={{ ...styles.row, marginTop: 14 }}>
                  <div>
                    <b>{found.name}</b>
                    <div style={{ fontSize: 12 }}>
                      BR: {found.br_number}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    {!found.is_scored && (
                      <button
                        style={{ ...styles.smallBtn, background: theme.button }}
                        onClick={() =>
                          navigate(`/smes/${found.id}/score`)
                        }
                      >
                        Start Scoring
                      </button>
                    )}

                    {found.is_scored && (
                      <button
                        style={styles.smallBtn}
                        onClick={() =>
                          navigate(`/smes/${found.id}/report`)
                        }
                      >
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ================= DASHBOARD TAB ================= */}
        {active === "dashboard" && (
          <section style={{ ...styles.card, background: theme.card }}>
            <h3>Dashboard</h3>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <div>Total SMEs: {summary.total_smes}</div>
                <div>Scored: {summary.scored_smes}</div>
                <div>Pending: {summary.pending_smes}</div>
                <div>Average Score: {summary.avg_score}</div>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

/* ================= STYLES ================= */

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#0B1220",
  navBg: "#172033",
  card: "#172033",
  text: "#ffffff",
  button: BRAND,
  tabActiveBg: "rgba(255,255,255,0.05)",
};

const lightTheme = {
  bg: "#F4F8FB",
  navBg: "#ffffff",
  card: "#ffffff",
  text: "#0F172A",
  button: BRAND,
  tabActiveBg: "rgba(0,0,0,0.05)",
};

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "system-ui",
  },

  navbar: {
    padding: "14px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },

  logoImg: {
    width: 80,
    height: 50,
  },

  brandTitle: { fontWeight: 900 },
  brandSub: { fontSize: 12 },

  centerTabs: { display: "flex", gap: 10 },

  tabBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },

  main: {
    width: "min(1100px, 92%)",
    margin: "20px auto",
  },

  card: {
    padding: 16,
    borderRadius: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
  },

  search: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ccc",
    flex: 1,
  },

  row: {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    color: "#fff",
  },

  smallBtn: {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    cursor: "pointer",
  },
};