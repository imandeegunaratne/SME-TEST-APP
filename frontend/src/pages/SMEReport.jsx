// frontend/src/pages/SMEReport.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

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

        if (!res.ok) {
          throw new Error(j.detail || "Failed to load report.");
        }

        setData(j);
      } catch (e) {
        setErr(e.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token, navigate]);

  function formatScore(value) {
    if (value === null || value === undefined || value === "") return "—";
    return Number(value).toFixed(2);
  }

  async function downloadPDF() {
  try {
    const res = await fetch(`/api/smes/${id}/report/pdf/`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.detail || "Failed to download PDF.");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `SME_Report_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert(e.message || "Failed to download PDF.");
  }
}

  if (loading) {
    return (
      <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
        <Navbar
          theme={theme}
          username={username}
          onLogoClick={() => navigate("/evaluator-home")}
          onDownloadPDF={downloadPDF}
        />
        <div style={styles.wrapper}>
          <div style={styles.messageBox}>Loading report...</div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
        <Navbar
          theme={theme}
          username={username}
          onLogoClick={() => navigate("/evaluator-home")}
          onDownloadPDF={downloadPDF}
        />
        <div style={styles.wrapper}>
          <div
            style={{
              ...styles.messageBox,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            Error: {err}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const criteria = Array.isArray(data.criteria) ? data.criteria : [];
  const overallEvidence =
    data.additional_details ||
    data.evidence ||
    data.notes ||
    data.overall_notes ||
    "";

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <Navbar
        theme={theme}
        username={username}
        onLogoClick={() => navigate("/evaluator-home")}
        onDownloadPDF={downloadPDF}
      />

      <div style={styles.wrapper}>
        <div
          style={{
            ...styles.reportSheet,
            background: theme.card,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
        >
          <div style={styles.reportHeader}>
            <div>
              <div style={styles.reportTitle}>SME Evaluation Report</div>
              <div style={styles.reportSubtitle}>Decision Support Platform</div>
            </div>

            <div style={styles.scoreBox}>
              <div style={styles.scoreBoxLabel}>Score</div>
              <div style={styles.scoreBoxValue}>
                {formatScore(data.capability_score)}
              </div>
            </div>
          </div>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>SME Information</h3>
            <div style={styles.infoTable}>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>SME Name</div>
                <div style={styles.infoValue}>{data.name || "—"}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>BR Number</div>
                <div style={styles.infoValue}>{data.br_number || "—"}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Industry</div>
                <div style={styles.infoValue}>{data.industry || "—"}</div>
              </div>
              <div style={styles.infoRow}>
                <div style={styles.infoLabel}>Scored By</div>
                <div style={styles.infoValue}>{data.scored_by || username || "—"}</div>
              </div>
            </div>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Criteria Scores</h3>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Code</th>
                    <th style={styles.th}>Criterion</th>
                    <th style={styles.thRight}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {criteria.length === 0 ? (
                    <tr>
                      <td style={styles.td} colSpan={3}>
                        No criteria scores available.
                      </td>
                    </tr>
                  ) : (
                    criteria.map((item, index) => {
                      const code =
                        item.code ||
                        item.criterion_code ||
                        item.criterion ||
                        `C${index + 1}`;

                      const title =
                        item.label ||
                        item.name ||
                        item.title ||
                        `Criterion ${index + 1}`;

                      const score =
                        item.score ??
                        item.raw_score ??
                        item.value ??
                        null;

                      return (
                        <tr key={`${code}-${index}`}>
                          <td style={styles.td}>{code}</td>
                          <td style={styles.td}>{title}</td>
                          <td style={styles.tdRight}>{formatScore(score)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionTitle}>Overall Evidence / Additional Details</h3>
            <div style={styles.textBlock}>
              {overallEvidence && String(overallEvidence).trim()
                ? overallEvidence
                : "No additional details provided."}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Navbar({ theme, username, onLogoClick, onDownloadPDF }) {
  return (
    <header
      style={{
        ...styles.navbar,
        background: theme.navBg,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div style={styles.navInner}>
        <button onClick={onLogoClick} style={styles.logoButton}>
          <img src={logo} alt="SME Scoring" style={styles.logoImg} />
          <div style={styles.logoTextWrap}>
            <div style={{ ...styles.logoTitle, color: theme.text }}>SME Scoring</div>
            <div style={{ ...styles.logoSubtitle, color: theme.muted }}>
              Decision Support Platform
            </div>
          </div>
        </button>

        <div style={styles.navActions}>
          <button
            type="button"
            onClick={onDownloadPDF}
            style={{
              ...styles.downloadBtn,
              background: theme.button,
              color: "#FFFFFF",
            }}
          >
            Download PDF
          </button>

          <div
            style={{
              ...styles.avatar,
              background: theme.avatarBg,
              color: theme.text,
              border: `1px solid ${theme.border}`,
            }}
          >
            {(username || "U").charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#0B1220",
  card: "#172033",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.72)",
  border: "rgba(255,255,255,0.10)",
  button: BRAND,
  navBg: "#FFFFFF",
  avatarBg: "rgba(255,255,255,0.06)",
};

const lightTheme = {
  bg: "#F6F8FB",
  card: "#FFFFFF",
  text: "#0F172A",
  muted: "rgba(15,23,42,0.68)",
  border: "rgba(15,23,42,0.10)",
  button: BRAND,
  navBg: "#FFFFFF",
  avatarBg: "#F1F5F9",
};

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    width: "100%",
  },
  navInner: {
    width: "min(1280px, 96%)",
    margin: "0 auto",
    minHeight: 92,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    padding: "14px 0",
  },
  logoButton: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
  },
  logoImg: {
    width: 120,
    height: "auto",
    objectFit: "contain",
  },
  logoTextWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  logoSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  downloadBtn: {
    border: "none",
    borderRadius: 10,
    padding: "12px 18px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 28,
  },
  wrapper: {
    width: "min(1180px, 95%)",
    margin: "0 auto",
    padding: "28px 0 40px",
  },
  messageBox: {
    maxWidth: 520,
    margin: "120px auto",
    padding: 24,
    borderRadius: 16,
    textAlign: "center",
    fontSize: 18,
  },
  reportSheet: {
    borderRadius: 20,
    padding: 34,
    boxShadow: "0 10px 28px rgba(0,0,0,0.06)",
  },
  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    borderBottom: "1px solid rgba(127,127,127,0.18)",
    paddingBottom: 22,
    marginBottom: 28,
    flexWrap: "wrap",
  },
  reportTitle: {
    fontSize: 30,
    fontWeight: 800,
    marginBottom: 6,
  },
  reportSubtitle: {
    fontSize: 14,
    opacity: 0.75,
  },
  scoreBox: {
    minWidth: 170,
    padding: 18,
    borderRadius: 14,
    background: "rgba(47,150,180,0.08)",
    textAlign: "center",
  },
  scoreBoxLabel: {
    fontSize: 13,
    opacity: 0.75,
    marginBottom: 8,
  },
  scoreBoxValue: {
    fontSize: 30,
    fontWeight: 800,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: 800,
    margin: "0 0 16px 0",
  },
  infoTable: {
    border: "1px solid rgba(127,127,127,0.18)",
    borderRadius: 14,
    overflow: "hidden",
  },
  infoRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    borderBottom: "1px solid rgba(127,127,127,0.12)",
  },
  infoLabel: {
    padding: "14px 16px",
    fontWeight: 700,
    background: "rgba(127,127,127,0.06)",
  },
  infoValue: {
    padding: "14px 16px",
  },
  tableWrap: {
    overflowX: "auto",
    border: "1px solid rgba(127,127,127,0.18)",
    borderRadius: 14,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 16px",
    fontSize: 14,
    background: "rgba(127,127,127,0.08)",
    borderBottom: "1px solid rgba(127,127,127,0.18)",
  },
  thRight: {
    textAlign: "right",
    padding: "14px 16px",
    fontSize: 14,
    background: "rgba(127,127,127,0.08)",
    borderBottom: "1px solid rgba(127,127,127,0.18)",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(127,127,127,0.10)",
    fontSize: 15,
  },
  tdRight: {
    padding: "14px 16px",
    borderBottom: "1px solid rgba(127,127,127,0.10)",
    fontSize: 15,
    textAlign: "right",
    fontWeight: 700,
  },
  textBlock: {
    border: "1px solid rgba(127,127,127,0.18)",
    borderRadius: 14,
    padding: 18,
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    background: "rgba(127,127,127,0.04)",
    fontSize: 15,
  },
};