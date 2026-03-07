// frontend/src/pages/SMEReport.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function SMEReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token") || "";
  const username = localStorage.getItem("username") || "";
  const themeMode = localStorage.getItem("theme") === "light" ? "light" : "dark";

  const theme = useMemo(
    () => (themeMode === "dark" ? darkTheme : lightTheme),
    [themeMode]
  );

  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    (async () => {
      setLoading(true);
      setErr("");

      try {
        const res = await fetch(`/api/smes/${id}/report/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        const j = await res.json().catch(() => ({}));

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) throw new Error(j.detail || "Failed to load report.");

        setData(j);
      } catch (e) {
        setErr(e.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, navigate]);

  function getScoreLabel(score) {
    const s = Number(score || 0);

    if (s >= 80) return "Excellent";
    if (s >= 65) return "Good";
    if (s >= 50) return "Average";
    return "Needs Improvement";
  }

  function getScoreColor(score) {
    const s = Number(score || 0);

    if (s >= 80) return "#16A34A";
    if (s >= 65) return "#2563EB";
    if (s >= 50) return "#D97706";
    return "#DC2626";
  }

  if (loading) {
    return (
      <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
        <div style={styles.centerBox}>Loading report...</div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
        <div
          style={{
            ...styles.centerBox,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          Error: {err}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalScore = Number(data.total_score || 0).toFixed(2);
  const scoreLabel = getScoreLabel(data.total_score);
  const scoreColor = getScoreColor(data.total_score);

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <div style={styles.container}>
        {/* top bar */}
        <div style={styles.topActions}>
          <button
            style={{
              ...styles.backBtn,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
            onClick={() => navigate("/evaluator-home")}
          >
            ← Back
          </button>
        </div>

        {/* header card */}
        <section
          style={{
            ...styles.heroCard,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <div style={styles.heroLeft}>
            <div style={styles.reportTag}>SME REPORT</div>
            <h1 style={styles.title}>{data.name}</h1>
            <div style={styles.subGrid}>
              <div style={styles.subItem}>
                <span style={styles.subLabel}>BR Number</span>
                <span style={styles.subValue}>{data.br_number}</span>
              </div>
              <div style={styles.subItem}>
                <span style={styles.subLabel}>Industry</span>
                <span style={styles.subValue}>{data.industry || "—"}</span>
              </div>
              <div style={styles.subItem}>
                <span style={styles.subLabel}>Scored By</span>
                <span style={styles.subValue}>{data.scored_by || username || "—"}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              ...styles.scoreCircleWrap,
              border: `6px solid ${scoreColor}`,
            }}
          >
            <div style={styles.scoreNumber}>{totalScore}</div>
            <div style={{ ...styles.scoreText, color: scoreColor }}>{scoreLabel}</div>
          </div>
        </section>

        {/* summary cards */}
        <section style={styles.statsGrid}>
          <div
            style={{
              ...styles.infoCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.cardLabel}>Report Status</div>
            <div style={styles.cardValue}>Completed</div>
          </div>

          <div
            style={{
              ...styles.infoCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.cardLabel}>Total Score</div>
            <div style={styles.cardValue}>{totalScore}</div>
          </div>

          <div
            style={{
              ...styles.infoCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.cardLabel}>Evaluation Result</div>
            <div style={{ ...styles.cardValue, color: scoreColor }}>{scoreLabel}</div>
          </div>
        </section>

        {/* details */}
        <section
          style={{
            ...styles.detailsCard,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3 style={styles.sectionTitle}>SME Details</h3>

          <div style={styles.detailsGrid}>
            <div style={styles.detailBox}>
              <div style={styles.detailTitle}>Business Name</div>
              <div style={styles.detailText}>{data.name}</div>
            </div>

            <div style={styles.detailBox}>
              <div style={styles.detailTitle}>BR Number</div>
              <div style={styles.detailText}>{data.br_number}</div>
            </div>

            <div style={styles.detailBox}>
              <div style={styles.detailTitle}>Industry</div>
              <div style={styles.detailText}>{data.industry || "—"}</div>
            </div>

            <div style={styles.detailBox}>
              <div style={styles.detailTitle}>Evaluator</div>
              <div style={styles.detailText}>{data.scored_by || "—"}</div>
            </div>
          </div>
        </section>

        {/* actions */}
        <section
          style={{
            ...styles.actionCard,
            background: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h3 style={styles.sectionTitle}>Actions</h3>

          <div style={styles.actionButtons}>
            <button
              style={{ ...styles.primaryBtn, background: theme.button }}
              onClick={() => navigate("/evaluator-home")}
            >
              Go Home
            </button>

            {data.is_editable && (
              <button
                style={{ ...styles.secondaryBtn, border: `1px solid ${theme.border}`, color: theme.text }}
                onClick={() => navigate(`/smes/${id}/score?edit=1`)}
              >
                Edit Report
              </button>
            )}
          </div>

          {!data.is_editable && (
            <div style={styles.noteText}>
              This report can only be edited by the evaluator who created it.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#0B1220",
  card: "#172033",
  text: "#FFFFFF",
  border: "rgba(255,255,255,0.10)",
  button: BRAND,
};

const lightTheme = {
  bg: "#F6F8FB",
  card: "#FFFFFF",
  text: "#0F172A",
  border: "rgba(15,23,42,0.10)",
  button: BRAND,
};

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    width: "min(1100px, 95%)",
    margin: "0 auto",
  },
  centerBox: {
    maxWidth: 500,
    margin: "120px auto",
    padding: 24,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 18,
  },
  topActions: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  backBtn: {
    border: "none",
    padding: "11px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },
  heroCard: {
    borderRadius: 24,
    padding: 28,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
    boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
  },
  heroLeft: {
    flex: 1,
    minWidth: 260,
  },
  reportTag: {
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "1px",
    opacity: 0.7,
    marginBottom: 10,
  },
  title: {
    margin: "0 0 18px 0",
    fontSize: 34,
    lineHeight: 1.2,
  },
  subGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },
  subItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  subLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  subValue: {
    fontSize: 16,
    fontWeight: 700,
  },
  scoreCircleWrap: {
    width: 180,
    height: 180,
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.02)",
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: 800,
  },
  scoreText: {
    marginTop: 8,
    fontWeight: 700,
    fontSize: 15,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginTop: 22,
  },
  infoCard: {
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  cardLabel: {
    fontSize: 14,
    opacity: 0.75,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 800,
  },
  detailsCard: {
    marginTop: 22,
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: 18,
    fontSize: 22,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  detailBox: {
    padding: 18,
    borderRadius: 16,
    background: "rgba(127,127,127,0.06)",
  },
  detailTitle: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 17,
    fontWeight: 700,
  },
  actionCard: {
    marginTop: 22,
    borderRadius: 22,
    padding: 24,
    boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
  },
  actionButtons: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryBtn: {
    border: "none",
    color: "#fff",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
  },
  secondaryBtn: {
    background: "transparent",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
  },
  noteText: {
    marginTop: 14,
    fontSize: 14,
    opacity: 0.8,
  },
};