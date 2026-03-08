import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const BRAND = "#2F96B4";
const SUCCESS = "#22c55e";
const DANGER = "#ef4444";
const WARNING = "#f59e0b";

export default function BankAdminDashboard() {
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const theme = dark ? darkTheme : lightTheme;

  const [pending, setPending] = useState([]);
  const [smes, setSmes] = useState([]);

  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingSmes, setLoadingSmes] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    fetchPending();
    fetchSMEs();
  }, []);

  async function fetchPending() {
    try {
      setError("");
      setLoadingPending(true);

      const token = localStorage.getItem("token");

      const res = await fetch("/api/bank-admin/pending-evaluators/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.detail || "Failed to fetch pending evaluators.");

      setPending(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading evaluators.");
    } finally {
      setLoadingPending(false);
    }
  }

  async function fetchSMEs() {
    try {
      setError("");
      setLoadingSmes(true);

      const token = localStorage.getItem("token");

      // change this endpoint if your backend uses a different one
      const res = await fetch("/api/smes/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) throw new Error(data.detail || "Failed to fetch SMEs.");

      setSmes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong while loading SME data.");
    } finally {
      setLoadingSmes(false);
    }
  }

  async function approve(profileId) {
    try {
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch(`/api/bank-admin/approve-evaluator/${profileId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Approval failed.");

      fetchPending();
    } catch (err) {
      setError(err.message || "Approval error.");
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  const analytics = useMemo(() => {
    const total = smes.length;

    const scored = smes.filter(
      (s) => s.total_score !== null && s.total_score !== undefined
    );

    const pendingScoring = smes.filter(
      (s) => s.total_score === null || s.total_score === undefined
    );

    const avgScore =
      scored.length > 0
        ? (
            scored.reduce((sum, s) => sum + Number(s.total_score || 0), 0) /
            scored.length
          ).toFixed(2)
        : "0.00";

    const sortedScored = [...scored].sort(
      (a, b) => Number(b.total_score || 0) - Number(a.total_score || 0)
    );

    const topSME = sortedScored[0] || null;
    const lowestSME = sortedScored[sortedScored.length - 1] || null;

    const industryMap = {};
    for (const s of smes) {
      const industry = s.industry || "Unknown";
      if (!industryMap[industry]) {
        industryMap[industry] = {
          name: industry,
          total: 0,
          scored: 0,
          totalScore: 0,
        };
      }

      industryMap[industry].total += 1;

      if (s.total_score !== null && s.total_score !== undefined) {
        industryMap[industry].scored += 1;
        industryMap[industry].totalScore += Number(s.total_score || 0);
      }
    }

    const industryStats = Object.values(industryMap).map((item) => ({
      ...item,
      avgScore: item.scored > 0 ? item.totalScore / item.scored : 0,
    }));

    const industryByCount = [...industryStats].sort((a, b) => b.total - a.total);
    const industryByAvg = [...industryStats]
      .filter((x) => x.scored > 0)
      .sort((a, b) => b.avgScore - a.avgScore);

    const topIndustry = industryByAvg[0] || null;
    const weakIndustry = industryByAvg[industryByAvg.length - 1] || null;

    const recentScored = [...scored]
      .sort((a, b) => {
        const ad = new Date(a.updated_at || a.created_at || 0).getTime();
        const bd = new Date(b.updated_at || b.created_at || 0).getTime();
        return bd - ad;
      })
      .slice(0, 5);

    return {
      total,
      scoredCount: scored.length,
      pendingCount: pendingScoring.length,
      avgScore,
      topSME,
      lowestSME,
      industryStats,
      industryByCount,
      topIndustry,
      weakIndustry,
      recentScored,
    };
  }, [smes]);

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>Bank Admin Dashboard</h2>
          <p style={{ marginTop: 6, color: theme.muted }}>
            Evaluator approvals and SME performance analytics
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setDark(!dark)}
            style={{ ...styles.smallBtn, background: theme.card, color: theme.text, border: `1px solid ${theme.border}` }}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            onClick={logout}
            style={{ ...styles.smallBtn, background: BRAND, color: "#fff" }}
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            background: "rgba(239,68,68,0.12)",
            color: DANGER,
            border: `1px solid rgba(239,68,68,0.25)`,
          }}
        >
          {error}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div style={styles.statsGrid}>
        <StatCard
          theme={theme}
          title="Total SMEs"
          value={loadingSmes ? "..." : analytics.total}
        />
        <StatCard
          theme={theme}
          title="Scored SMEs"
          value={loadingSmes ? "..." : analytics.scoredCount}
        />
        <StatCard
          theme={theme}
          title="Pending Scoring"
          value={loadingSmes ? "..." : analytics.pendingCount}
        />
        <StatCard
          theme={theme}
          title="Average Score"
          value={loadingSmes ? "..." : analytics.avgScore}
        />
      </div>

      {/* TOP INSIGHTS */}
      <div style={styles.sectionGrid}>
        <div style={{ ...styles.panel, background: theme.card, border: `1px solid ${theme.border}` }}>
          <h3 style={styles.panelTitle}>Key Insights</h3>

          {loadingSmes ? (
            <p>Loading analytics...</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              <InsightRow
                label="Top Scoring SME"
                value={
                  analytics.topSME
                    ? `${analytics.topSME.name} (${analytics.topSME.total_score})`
                    : "No scored SMEs yet"
                }
              />
              <InsightRow
                label="Lowest Scoring SME"
                value={
                  analytics.lowestSME
                    ? `${analytics.lowestSME.name} (${analytics.lowestSME.total_score})`
                    : "No scored SMEs yet"
                }
              />
              <InsightRow
                label="Top Performing Industry"
                value={
                  analytics.topIndustry
                    ? `${analytics.topIndustry.name} (${analytics.topIndustry.avgScore.toFixed(2)})`
                    : "Not enough data"
                }
              />
              <InsightRow
                label="Weakest Industry"
                value={
                  analytics.weakIndustry
                    ? `${analytics.weakIndustry.name} (${analytics.weakIndustry.avgScore.toFixed(2)})`
                    : "Not enough data"
                }
              />
              <InsightRow
                label="Pending Evaluator Approvals"
                value={loadingPending ? "..." : pending.length}
              />
            </div>
          )}
        </div>

        <div style={{ ...styles.panel, background: theme.card, border: `1px solid ${theme.border}` }}>
          <h3 style={styles.panelTitle}>Evaluator Approval</h3>

          {loadingPending ? (
            <p>Loading pending evaluators...</p>
          ) : pending.length === 0 ? (
            <p style={{ opacity: 0.75 }}>No pending approvals.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {pending.map((p) => (
                <div
                  key={p.profile_id}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    border: `1px solid ${theme.border}`,
                    background: theme.softCard,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>{p.username}</div>
                    <div style={{ fontSize: 13, color: theme.muted }}>
                      Awaiting approval
                    </div>
                  </div>

                  <button
                    onClick={() => approve(p.profile_id)}
                    style={styles.approveBtn}
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INDUSTRY ANALYSIS */}
      <div
        style={{
          ...styles.panel,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          marginTop: 24,
        }}
      >
        <h3 style={styles.panelTitle}>Industry Level SME Analysis</h3>

        {loadingSmes ? (
          <p>Loading industry analysis...</p>
        ) : analytics.industryStats.length === 0 ? (
          <p style={{ opacity: 0.75 }}>No SME data available.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, color: theme.text }}>Industry</th>
                  <th style={{ ...styles.th, color: theme.text }}>Total SMEs</th>
                  <th style={{ ...styles.th, color: theme.text }}>Scored SMEs</th>
                  <th style={{ ...styles.th, color: theme.text }}>Avg Score</th>
                  <th style={{ ...styles.th, color: theme.text }}>Insight</th>
                </tr>
              </thead>
              <tbody>
                {analytics.industryByCount.map((item) => (
                  <tr key={item.name}>
                    <td style={{ ...styles.td, color: theme.text }}>{item.name}</td>
                    <td style={{ ...styles.td, color: theme.text }}>{item.total}</td>
                    <td style={{ ...styles.td, color: theme.text }}>{item.scored}</td>
                    <td style={{ ...styles.td, color: theme.text }}>
                      {item.scored > 0 ? item.avgScore.toFixed(2) : "N/A"}
                    </td>
                    <td style={{ ...styles.td, color: theme.text }}>
                      {item.scored === 0
                        ? "No scoring yet"
                        : item.avgScore >= 75
                        ? "Strong performing industry"
                        : item.avgScore >= 50
                        ? "Moderate performing industry"
                        : "Needs improvement"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENTLY SCORED SMEs */}
      <div
        style={{
          ...styles.panel,
          background: theme.card,
          border: `1px solid ${theme.border}`,
          marginTop: 24,
        }}
      >
        <h3 style={styles.panelTitle}>Recently Scored SMEs</h3>

        {loadingSmes ? (
          <p>Loading recent scored SMEs...</p>
        ) : analytics.recentScored.length === 0 ? (
          <p style={{ opacity: 0.75 }}>No scored SMEs yet.</p>
        ) : (
          <div style={styles.cardGrid}>
            {analytics.recentScored.map((sme) => (
              <div
                key={sme.id}
                style={{
                  ...styles.card,
                  background: theme.softCard,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <h4 style={{ margin: 0 }}>{sme.name}</h4>
                <p style={{ margin: "8px 0 4px", color: theme.muted }}>
                  BR No: {sme.br_number}
                </p>
                <p style={{ margin: "4px 0", color: theme.muted }}>
                  Industry: {sme.industry || "Unknown"}
                </p>
                <div style={{ marginTop: 10, fontWeight: 800, color: BRAND }}>
                  Score: {sme.total_score}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, theme }) {
  return (
    <div
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: 18,
      }}
    >
      <div style={{ fontSize: 13, color: theme.muted }}>{title}</div>
      <div style={{ marginTop: 8, fontSize: 28, fontWeight: 900 }}>{value}</div>
    </div>
  );
}

function InsightRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>{label}</div>
      <div style={{ fontWeight: 800, marginTop: 4 }}>{value}</div>
    </div>
  );
}

const lightTheme = {
  bg: "#f4f9ff",
  text: "#0b1220",
  muted: "rgba(11,18,32,0.7)",
  card: "#ffffff",
  softCard: "#f8fbff",
  border: "rgba(11,18,32,0.12)",
};

const darkTheme = {
  bg: "#071423",
  text: "#ffffff",
  muted: "rgba(255,255,255,0.72)",
  card: "rgba(255,255,255,0.06)",
  softCard: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.15)",
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 6%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    flexWrap: "wrap",
  },
  smallBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginTop: 24,
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: 24,
    marginTop: 24,
  },
  panel: {
    borderRadius: 18,
    padding: 20,
  },
  panelTitle: {
    marginTop: 0,
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 900,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
    marginTop: 12,
  },
  card: {
    padding: 18,
    borderRadius: 14,
  },
  approveBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: SUCCESS,
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 760,
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    fontSize: 14,
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    fontSize: 14,
  },
};