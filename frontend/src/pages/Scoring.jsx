// frontend/src/pages/Scoring.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.png";

/* =========================
   Bands + Rubric
========================= */
const bands = [
  { key: "1–2", label: "1–2 Very weak", min: 1, max: 2 },
  { key: "3–4", label: "3–4 Weak", min: 3, max: 4 },
  { key: "5–6", label: "5–6 Moderate", min: 5, max: 6 },
  { key: "7–8", label: "7–8 Strong", min: 7, max: 8 },
  { key: "9–10", label: "9–10 Very strong", min: 9, max: 10 },
];

const rubric = [
  {
    code: "C1",
    title: "Business opportunity gap",
    desc: {
      "1–2": "No clear opportunity gap or customer demand",
      "3–4": "Opportunity gap described but unclear; weak demand signs",
      "5–6": "Opportunity and customer demand are clear",
      "7–8": "Clear opportunity gap with real validation",
      "9–10": "Clear opportunity gap, proven demand with growth potential",
    },
  },
  {
    code: "C2",
    title: "Customer pains and gains",
    desc: {
      "1–2": "No clear identification of customer pains and gains, very similar to others",
      "3–4": "Some identification; little differentiation",
      "5–6": "Clear identification; some differentiation",
      "7–8": "Clear pains/gains and good differentiations",
      "9–10": "Strong, unique value proposition",
    },
  },
  {
    code: "C3",
    title: "Interest to take risk",
    desc: {
      "1–2": "Poor risk taker",
      "3–4": "Somewhat risk taker",
      "5–6": "Moderate risk taker",
      "7–8": "Effective risk taker",
      "9–10": "Takes advantage of risk always",
    },
  },
  {
    code: "C4",
    title: "Stakeholder Engagement & Support",
    desc: {
      "1–2": "Weak or unstable relationships",
      "3–4": "Basic relationships; limited support",
      "5–6": "Stable relationships with key stakeholders",
      "7–8": "Strong, supportive relationships",
      "9–10": "Long-term, trust-based stakeholder support",
    },
  },
  {
    code: "C5",
    title: "Competitive Position",
    desc: {
      "1–2": "Unaware of competition",
      "3–4": "Knows competitors but reacts late",
      "5–6": "Understands competition at a basic level",
      "7–8": "Actively monitors and responds",
      "9–10": "Strong positioning with managed competitive risk",
    },
  },
  {
    code: "C6",
    title: "Management & Workforce Capability",
    desc: {
      "1–2": "Poor management, role confusion",
      "3–4": "Basic management; skill gaps",
      "5–6": "Adequate skills and role clarity",
      "7–8": "Capable management and motivated staff",
      "9–10": "Strong leadership and high-performing team",
    },
  },
  {
    code: "C7",
    title: "Streams of Revenue",
    desc: {
      "1–2": "Unstable or irregular income",
      "3–4": "Some stability but highly dependent",
      "5–6": "Reasonably stable income",
      "7–8": "Stable and diversified revenue",
      "9–10": "Strong, growing, and predictable revenue",
    },
  },
  {
    code: "C8",
    title: "Cost Control & Efficiency",
    desc: {
      "1–2": "Costs unclear; poor control",
      "3–4": "Basic cost tracking",
      "5–6": "Costs known and generally controlled",
      "7–8": "Efficient cost management",
      "9–10": "Optimized costs with strong margins",
    },
  },
  {
    code: "C9",
    title: "Taking advantage of state assistance",
    desc: {
      "1–2": "No engagement of state",
      "3–4": "Some engagement of state",
      "5–6": "Some use of state support programs",
      "7–8": "Active use of state institutions/networks",
      "9–10": "Uses state as strategic institutional leverage",
    },
  },
  {
    code: "C10",
    title: "Operational Readiness",
    desc: {
      "1–2": "Lacks basic facilities or equipment; frequent disruptions",
      "3–4": "Basic resources but often inadequate",
      "5–6": "Adequate resources with minor issues",
      "7–8": "Smooth operations with basic backups",
      "9–10": "Strong resources; reliable operations with backups",
    },
  },
];

function bandKeyFromScore(score) {
  if (score <= 2) return "1–2";
  if (score <= 4) return "3–4";
  if (score <= 6) return "5–6";
  if (score <= 8) return "7–8";
  return "9–10";
}

function clampScore(n) {
  if (Number.isNaN(n)) return null;
  if (n < 1) return 1;
  if (n > 10) return 10;
  return n;
}

function scoreForBand(b) {
  return Math.round((b.min + b.max) / 2);
}

const BRAND = "#2F96B4";

const darkTheme = {
  bg: "#0B1220",
  navBg: "rgba(16,24,38,0.92)",
  card: "#172033",
  resultBg: "#111827",
  inputBg: "#0f172a",
  text: "#ffffff",
  subText: "rgba(255,255,255,0.72)",
  button: BRAND,
  buttonText: "#FFFFFF",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  iconBg1: "rgba(59,130,246,0.16)",
  iconBg2: "rgba(16,185,129,0.16)",
  iconBg3: "rgba(245,158,11,0.16)",
  errorBg: "rgba(220,38,38,0.10)",
  errorText: "#fecaca",
  errorBorder: "rgba(220,38,38,0.30)",
  tabActiveBg: "rgba(47,150,180,0.12)",
  tabActiveBorder: "rgba(47,150,180,0.24)",
  heroGlow:
    "radial-gradient(900px 420px at 50% 10%, rgba(47,150,180,0.18), transparent 65%)",
};

const lightTheme = {
  bg: "#F4F7FB",
  navBg: "rgba(255,255,255,0.92)",
  card: "#ffffff",
  resultBg: "#F8FAFC",
  inputBg: "#ffffff",
  text: "#0F172A",
  subText: "#475569",
  button: BRAND,
  buttonText: "#FFFFFF",
  border: "rgba(15,23,42,0.10)",
  borderStrong: "rgba(15,23,42,0.18)",
  iconBg1: "rgba(59,130,246,0.12)",
  iconBg2: "rgba(16,185,129,0.12)",
  iconBg3: "rgba(245,158,11,0.14)",
  errorBg: "#FEF2F2",
  errorText: "#B91C1C",
  errorBorder: "#FECACA",
  tabActiveBg: "rgba(47,150,180,0.08)",
  tabActiveBorder: "rgba(47,150,180,0.18)",
  heroGlow:
    "radial-gradient(900px 420px at 50% 10%, rgba(47,150,180,0.14), transparent 65%)",
};

export default function RubricScoringPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const token = localStorage.getItem("token") || "";

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.body.style.margin = "0";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const theme = dark ? darkTheme : lightTheme;

  const [sme, setSme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const [scores, setScores] = useState(() =>
    Object.fromEntries(
      rubric.map((r) => [r.code, { score: null, notes: "", followup: false }])
    )
  );

  const progress = useMemo(() => {
    const scored = Object.values(scores).filter(
      (v) => typeof v.score === "number"
    ).length;
    return { scored, total: rubric.length };
  }, [scores]);

  const cardRef = useRef(null);

  const activeCriterion = rubric[activeIndex];
  const active = scores[activeCriterion.code];
  const activeScore = active?.score;
  const selectedBandKey =
    typeof activeScore === "number" ? bandKeyFromScore(activeScore) : null;

  const setScore = (code, newScore) => {
    setScores((prev) => ({
      ...prev,
      [code]: { ...prev[code], score: newScore },
    }));
  };

  const setBand = (code, band) => setScore(code, scoreForBand(band));

  const goToIndex = (idx) => {
    const safe = Math.max(0, Math.min(rubric.length - 1, idx));
    setActiveIndex(safe);
    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function loadAll() {
      setLoading(true);
      setError("");

      try {
        const smeRes = await fetch(`/api/smes/${id}/report/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const smeData = await smeRes.json().catch(() => ({}));

        if (smeRes.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        if (!smeRes.ok) throw new Error(smeData.detail || "Failed to load SME.");
        setSme(smeData);

        const csRes = await fetch(`/api/smes/${id}/criterion-scores/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (csRes.ok) {
          const csData = await csRes.json().catch(() => ({}));
          if (csData?.scores?.length) {
            setScores((prev) => {
              const next = { ...prev };
              for (const row of csData.scores) {
                if (!row?.code) continue;
                if (!(row.code in next)) continue;
                next[row.code] = {
                  score: typeof row.score === "number" ? row.score : row.score ?? null,
                  notes: row.notes ?? "",
                  followup: !!row.followup,
                };
              }
              return next;
            });
          }
        }
      } catch (e) {
        setError(e.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
  }, [id, token, navigate]);

  async function saveDraftToBackend() {
    if (!token) return;

    setSavingDraft(true);
    setError("");

    try {
      const payload = rubric.map((r) => ({
        code: r.code,
        score: scores[r.code]?.score ?? null,
        notes: scores[r.code]?.notes ?? "",
        followup: !!scores[r.code]?.followup,
      }));

      const res = await fetch(`/api/smes/${id}/criterion-scores/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ scores: payload }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) throw new Error(data.detail || "Failed to save draft.");
    } catch (e) {
      setError(e.message || "Failed to save draft.");
    } finally {
      setSavingDraft(false);
    }
  }
  async function submitFinal() {
  if (progress.scored !== progress.total) {
    setError("Please score all criteria before submitting.");
    return;
  }

  setSubmitting(true);
  setError("");

  try {
    await saveDraftToBackend();

    const res = await fetch(`/api/smes/${id}/submit-capability/`, {
      method: "POST",
      headers: { Authorization: `Token ${token}` },
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }

    if (!res.ok) throw new Error(data.detail || "Submit failed.");

    navigate("/evaluator-home", { state: { activeTab: "scoring" } });
  } catch (e) {
    setError(e.message || "Submit failed.");
  } finally {
    setSubmitting(false);
  }
}
  
  

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      <header
        style={{
          ...styles.navbar,
          background: theme.navBg,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <div style={styles.brand} onClick={() => navigate("/evaluator-home")}>
          <img src={logo} alt="SME logo" style={styles.logoImg} />
          <div style={styles.brandTextWrap}>
            <div style={{ ...styles.brandTitle, color: theme.text }}>
              SME Scoring
            </div>
            <div style={{ ...styles.brandSub, color: theme.subText }}>
              Evaluator Workspace
            </div>
          </div>
        </div>

        <div style={styles.rightWrap}>
          

          <button
            style={{
              ...styles.profileBtn,
              background: theme.button,
              color: "#fff",
              borderRadius: 14,
              width: "auto",
              padding: "0 16px",
            }}
            onClick={() => navigate("/evaluator-home")}
          >
            Back
          </button>
        </div>
      </header>

      <section style={styles.pageHero}>
        <div style={{ ...styles.heroGlow, background: theme.heroGlow }} />
        <div style={styles.main}>
          <div style={styles.sectionHeader}>
          
            <h1 style={{ ...styles.sectionTitle, color: theme.subText }}>
              {loading ? "Loading SME..." : `BR number:${sme?.br_number || "Br"} `} <br />
              {`SME Name:${sme?.name || "SME"} `}<br />
              { `Industry:${sme?.industry || "industry"} `}
            </h1>
          </div>

          {error && (
            <div
              style={{
                ...styles.alert,
                background: theme.errorBg,
                color: theme.errorText,
                border: `1px solid ${theme.errorBorder}`,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </section>

      <main style={styles.main}>
        

        <div style={styles.scoringLayout}>
          <aside
            style={{
              ...styles.sidebarCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.sectionHeader}>
              <h3 style={{ ...styles.sideTitle, color: theme.text }}>Criteria</h3>
              <p style={{ ...styles.sectionSub, color: theme.subText }}>
                Select a criterion
              </p>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              {rubric.map((r, idx) => {
                const val = scores[r.code]?.score;
                const selected = idx === activeIndex;
                const done = typeof val === "number";

                return (
                  <button
                    key={r.code}
                    onClick={() => goToIndex(idx)}
                    style={{
                      ...styles.criteriaNavBtn,
                      background: selected
                        ? theme.tabActiveBg
                        : theme.resultBg,
                      border: `1px solid ${
                        selected ? theme.tabActiveBorder : theme.border
                      }`,
                      color: theme.text,
                    }}
                  >
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{r.code}</div>
                      <div style={{ fontSize: 13, color: theme.subText, marginTop: 4 }}>
                        {r.title}
                      </div>
                    </div>

                    <div
                      style={{
                        ...styles.criteriaBadge,
                        background: done ? theme.button : theme.card,
                        color: done ? "#fff" : theme.text,
                        border: `1px solid ${done ? theme.button : theme.border}`,
                      }}
                    >
                      {done ? val : "—"}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section
            ref={cardRef}
            style={{
              ...styles.searchCard,
              background: theme.card,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>{activeCriterion.title}</h2>
              <p style={{ ...styles.sectionSub, color: theme.subText }}>
                {activeCriterion.code} • Criterion {activeIndex + 1} of {rubric.length}
              </p>
            </div>

            <div style={styles.rangeRow}>
              <input
                type="range"
                min={1}
                max={10}
                value={typeof activeScore === "number" ? activeScore : 5}
                onChange={(e) =>
                  setScore(
                    activeCriterion.code,
                    clampScore(Number(e.target.value))
                  )
                }
                style={{ width: "100%" }}
              />

              <input
                type="number"
                min={1}
                max={10}
                value={activeScore ?? ""}
                onChange={(e) =>
                  setScore(
                    activeCriterion.code,
                    e.target.value === ""
                      ? null
                      : clampScore(Number(e.target.value))
                  )
                }
                placeholder="—"
                style={{
                  ...styles.scoreInput,
                  background: theme.inputBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              />
            </div>

            <div style={{ marginTop: 18 }}>
  <div style={styles.bandsHeader}>
    <div style={{ fontWeight: 800, color: theme.text }}>Rubric Bands</div>
    <div style={{ fontSize: 12, color: theme.subText }}>
      {selectedBandKey ? `Selected: ${selectedBandKey}` : "Not selected yet"}
    </div>
  </div>

  <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
    {bands.map((b) => {
      const activeBand = selectedBandKey === b.key;

      return (
        <button
          key={b.key}
          type="button"
          onClick={() => setBand(activeCriterion.code, b)}
          style={{
            ...styles.bandCard,
            background: activeBand ? theme.tabActiveBg : theme.resultBg,
            border: `1px solid ${
              activeBand ? theme.button : theme.border
            }`,
            color: theme.text,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div
              style={{
                ...styles.bandIcon,
                background: theme.iconBg1,
                color: theme.text,
                border: `1px solid ${theme.border}`,
              }}
            >
              {activeBand ? "✓" : "＋"}
            </div>

            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{b.label}</div>
              <div
                style={{
                  marginTop: 6,
                  color: theme.subText,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {activeCriterion.desc?.[b.key] ?? "—"}
              </div>
            </div>
          </div>
        </button>
      );
    })}
  </div>
</div>

            <div style={{ marginTop: 20 }}>
              <label style={styles.label}>Notes</label>
              <textarea
                value={active.notes}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [activeCriterion.code]: {
                      ...prev[activeCriterion.code],
                      notes: e.target.value,
                    },
                  }))
                }
                placeholder="Evidence / notes"
                style={{
                  ...styles.textarea,
                  background: theme.inputBg,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                }}
              />

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginTop: 14,
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!active.followup}
                  onChange={(e) =>
                    setScores((prev) => ({
                      ...prev,
                      [activeCriterion.code]: {
                        ...prev[activeCriterion.code],
                        followup: e.target.checked,
                      },
                    }))
                  }
                />
                Need follow-up information
              </label>
            </div>

            <div style={styles.bottomActions}>
              <button
                style={{
                  ...styles.searchBtn,
                  background: theme.card,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  boxShadow: "none",
                  opacity: activeIndex === 0 ? 0.6 : 1,
                }}
                disabled={activeIndex === 0}
                onClick={() => goToIndex(activeIndex - 1)}
              >
                Previous
              </button>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button
                  style={{
                    ...styles.searchBtn,
                    background: theme.resultBg,
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    boxShadow: "none",
                  }}
                  onClick={saveDraftToBackend}
                  disabled={savingDraft}
                >
                  {savingDraft ? "Saving..." : "Save Draft"}
                </button>

                {activeIndex < rubric.length - 1 ? (
                  <button
                    style={{
                      ...styles.searchBtn,
                      background: theme.button,
                    }}
                    onClick={() => goToIndex(activeIndex + 1)}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    style={{
                      ...styles.searchBtn,
                      background: theme.button,
                      opacity:
                        progress.scored === progress.total && !submitting ? 1 : 0.65,
                    }}
                    disabled={progress.scored !== progress.total || submitting}
                    onClick={submitFinal}
                    
                  >
                    {submitting ? "Submitting..." : "Submit Final"}
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer
        style={{
          ...styles.footer,
          color: theme.subText,
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <div>© {new Date().getFullYear()} SME Scoring Platform</div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Inter, Arial, sans-serif",
  },

  navbar: {
    minHeight: 76,
    padding: "14px 28px",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(10px)",
    gap: 16,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
    minWidth: 260,
  },

  brandTextWrap: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    lineHeight: 1.1,
  },

  brandTitle: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.3px",
    marginBottom: 3,
  },

  brandSub: {
    fontSize: 13,
    fontWeight: 500,
  },

  logoImg: {
    width: 108,
    height: 58,
    objectFit: "contain",
    display: "block",
  },

  rightWrap: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  iconBtn: {
    height: 46,
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 14,
    border: "none",
  },

  profileBtn: {
    height: 46,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    border: "none",
  },

  main: {
    width: "min(1180px, 92%)",
    margin: "0 auto",
    paddingBottom: 40,
  },

  pageHero: {
    position: "relative",
    padding: "24px 0 6px",
  },

  heroGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },

  alert: {
    padding: "14px 16px",
    borderRadius: 14,
    marginTop: 16,
    fontWeight: 600,
  },

  sectionBlock: {
    marginTop: 24,
  },

  sectionHeader: {
    marginBottom: 16,
  },

  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
  },

  sectionSub: {
    marginTop: 6,
    fontSize: 14,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 18,
  },

  statCard: {
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
  },

  statIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    marginBottom: 18,
  },

  statLabel: {
    fontSize: 14,
    opacity: 0.78,
    marginBottom: 8,
    fontWeight: 600,
  },

  statValue: {
    fontSize: 34,
    fontWeight: 800,
    lineHeight: 1,
  },

  scoringLayout: {
    marginTop: 30,
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 20,
    alignItems: "start",
  },

  sidebarCard: {
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
    position: "sticky",
    top: 100,
  },

  sideTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 800,
  },

  criteriaNavBtn: {
    width: "100%",
    borderRadius: 18,
    padding: 14,
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },

  criteriaBadge: {
    minWidth: 42,
    height: 34,
    padding: "0 10px",
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  searchCard: {
    borderRadius: 26,
    padding: 26,
    boxShadow: "0 14px 34px rgba(15,23,42,0.05)",
  },

  rangeRow: {
    display: "grid",
    gridTemplateColumns: "1fr 100px",
    gap: 12,
    alignItems: "center",
    marginTop: 6,
  },

  scoreInput: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
    fontWeight: 700,
  },

  resultCard: {
    marginTop: 0,
    padding: 18,
    borderRadius: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },

  resultLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },

  resultTitle: {
    fontSize: 18,
    fontWeight: 800,
  },

  resultSub: {
    fontSize: 14,
    lineHeight: 1.6,
  },

  actionWrap: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },

  searchBtn: {
    border: "none",
    color: "#fff",
    padding: "15px 18px",
    borderRadius: 16,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 10px 22px rgba(47,150,180,0.25)",
  },

  smallPrimaryBtn: {
    border: "none",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  },

  label: {
    display: "block",
    marginBottom: 8,
    marginTop: 14,
    fontWeight: 700,
    fontSize: 14,
  },

  textarea: {
    width: "100%",
    minHeight: 110,
    padding: "13px 14px",
    borderRadius: 14,
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
    resize: "vertical",
  },

  bottomActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 22,
  },

  footer: {
    width: "min(1180px, 92%)",
    margin: "20px auto 0",
    padding: "18px 0 26px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    fontSize: 14,
  },
  bandsHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
},

bandCard: {
  width: "100%",
  borderRadius: 18,
  padding: 16,
  cursor: "pointer",
  textAlign: "left",
  boxSizing: "border-box",
},

bandIcon: {
  width: 46,
  height: 46,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 18,
  fontWeight: 800,
  flexShrink: 0,
},
};