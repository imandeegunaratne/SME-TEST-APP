// frontend/src/pages/Scoring.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.png";

/* =========================
   Bands
========================= */
const bands = [
  { key: "1–2", label: "1–2 Very weak", min: 1, max: 2 },
  { key: "3–4", label: "3–4 Weak", min: 3, max: 4 },
  { key: "5–6", label: "5–6 Moderate", min: 5, max: 6 },
  { key: "7–8", label: "7–8 Strong", min: 7, max: 8 },
  { key: "9–10", label: "9–10 Very strong", min: 9, max: 10 },
];

/* =========================
   Rubric + Excel Weights (from your uploaded Excel "Scoring" sheet column C)
   Normalized = score/10
   Weighted = weight * normalized
   Gap = weight * (1 - normalized)
========================= */
const rubric = [
  {
    code: "C1",
    title: "Business opportunity gap",
    weight: 0.0780563516111449,
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
    weight: 0.07915268875862755,
    desc: {
      "1–2":
        "No clear identification of customer pains and gains, very similar to others",
      "3–4":
        "Some clear identification of customer pains and gains, little differentiation",
      "5–6":
        "Clear identification of customer pains and gains, some differentiation",
      "7–8": "Clearly identification of pains and gains and differentiations",
      "9–10": "Strong, unique value proposition",
    },
  },
  {
    code: "C3",
    title: "Intrest to take risk",
    weight: 0.07717695554997973,
    desc: {
      "1–2": "Poor risk taker",
      "3–4": "Somewhat risk taker",
      "5–6": "Moderate risk taker",
      "7–8": "Effective risk taker",
      "9–10": "Take advantage of risk always",
    },
  },
  {
    code: "C4",
    title: "Stakeholder Engagement & Support",
    weight: 0.0503581556946596,
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
    weight: 0.12541568085659088,
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
    weight: 0.042985571513489466,
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
    weight: 0.18314870314095424,
    desc: {
      "1–2": "Unstable or irregular income",
      "3–4": "Some income stability but highly dependent",
      "5–6": "Reasonably stable income",
      "7–8": "Stable and diversified revenue",
      "9–10": "Strong, growing, and predictable revenue",
    },
  },
  {
    code: "C8",
    title: "Cost Control & Efficiency",
    weight: 0.16476744163849816,
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
    weight: 0.09499841137039716,
    desc: {
      "1–2": "No engagement of state",
      "3–4": "Some engagement of state",
      "5–6": "Some use of state support programs",
      "7–8": "Active use of state institutions/networks",
      "9–10": "Use state as strategic institutional leverage",
    },
  },
  {
    code: "C10",
    title: "Operational Readiness",
    weight: 0.1039400398656582,
    desc: {
      "1–2":
        "Lacks basic facilities or equipment; frequent operational disruptions",
      "3–4":
        "Basic resources exist but often inadequate; disruptions occur",
      "5–6": "Adequate resources to run daily operations with minor issues",
      "7–8": "Sufficient resources; operations run smoothly with basic backups",
      "9–10":
        "Strong operational resources; smooth, reliable operations with adequate backups",
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
  // midpoint (recommended)
  return Math.round((b.min + b.max) / 2);
}

function computeExcelOutputs(scoresByCode) {
  // Excel logic:
  // normalized = score/10
  // weighted = weight * normalized
  // gap = weight * (1 - normalized)
  const rows = rubric.map((r) => {
    const rawScore = scoresByCode[r.code]?.score;
    const score = typeof rawScore === "number" ? rawScore : null;
    const normalized = score == null ? null : score / 10;
    const weighted = normalized == null ? null : r.weight * normalized;
    const gap = normalized == null ? null : r.weight * (1 - normalized);

    return {
      code: r.code,
      title: r.title,
      weight: r.weight,
      score,
      normalized,
      weighted,
      gap,
    };
  });

  const weightedSum = rows.reduce((acc, row) => acc + (row.weighted ?? 0), 0);
  const capability = Math.round(weightedSum * 100) / 100; // ROUND(...,2) like Excel

  // Weakness explorer: rank by GAP desc (highest gap = biggest weakness)
  const weaknesses = rows
    .filter((r) => typeof r.gap === "number" && r.gap > 0)
    .slice()
    .sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0))
    .map((r, idx) => ({ ...r, rank: idx + 1 }));

  return { rows, capability, weaknesses };
}

/* =========================
   Theme (match Landing UI)
========================= */
const BRAND = "#2F96B4";
const darkTheme = {
  bg: "#0B1220",
  navBg: "rgba(11,18,32,0.75)",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.78)",
  card: "#172033",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",
  button: BRAND,
  buttonText: "#FFFFFF",
  iconBg: "rgba(47,150,180,0.12)",
  heroGlow:
    "radial-gradient(900px 420px at 50% 10%, rgba(47,150,180,0.25), transparent 65%)",
};
const lightTheme = {
  bg: "#F4F8FB",
  navBg: "rgba(244,248,251,0.75)",
  text: "#0F172A",
  muted: "rgba(15,23,42,0.70)",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "rgba(15,23,42,0.18)",
  button: BRAND,
  buttonText: "#FFFFFF",
  iconBg: "rgba(47,150,180,0.10)",
  heroGlow:
    "radial-gradient(900px 420px at 50% 10%, rgba(47,150,180,0.20), transparent 65%)",
};

export default function RubricScoringPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    document.body.style.margin = "0";
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const theme = dark ? darkTheme : lightTheme;

  const token = localStorage.getItem("token") || "";

  const [sme, setSme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [activeIdx, setActiveIdx] = useState(0);
  const cardRef = useRef(null);

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

  const allDone = progress.scored === progress.total;

  const { capability } = useMemo(() => computeExcelOutputs(scores), [scores]);

  const setScore = (code, newScore) => {
    setScores((prev) => ({
      ...prev,
      [code]: { ...prev[code], score: newScore },
    }));
  };

  const setBand = (code, band) => setScore(code, scoreForBand(band));

  const goToIndex = (idx) => {
    const safe = Math.max(0, Math.min(rubric.length - 1, idx));
    setActiveIdx(safe);
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const goNext = () => goToIndex(activeIdx + 1);
  const goPrev = () => goToIndex(activeIdx - 1);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // Load local draft
    try {
      const raw = localStorage.getItem(`draft_scores_${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setScores(parsed);
      }
    } catch {}

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/smes/${id}/report/`, {
          headers: { Authorization: `Token ${token}` },
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }

        if (!res.ok) throw new Error(data.detail || "Failed to load SME.");
        setSme(data);
      } catch (e) {
        setError(e.message || "Failed to load SME.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, token, navigate]);

  async function submitFinal() {
    if (!allDone) return;

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);
    setError("");

    const computed = computeExcelOutputs(scores);

    try {
      // Save to backend (keeps your existing endpoint)
      // NOTE: Excel capability score is 0..1 (rounded to 2 decimals)
      const res = await fetch(`/api/smes/${id}/score/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          total_score: computed.capability, // capability score (Excel logic)
          // Optional: if your backend accepts extra fields, keep these:
          // details: computed.rows,
          // weakness: computed.weaknesses,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!res.ok) throw new Error(data.detail || "Failed to save score.");

      // Save computed report locally for the result page
      localStorage.setItem(`final_scores_${id}`, JSON.stringify(scores));
      localStorage.setItem(`final_report_${id}`, JSON.stringify(computed));
      localStorage.removeItem(`draft_scores_${id}`);

      // Go to capability result page
      navigate(`/smes/${id}/capability`);
    } catch (e) {
      setError(e.message || "Failed to save score.");
    } finally {
      setSaving(false);
    }
  }

  const activeCriterion = rubric[activeIdx];
  const current = scores[activeCriterion.code];
  const score = current?.score ?? null;
  const selectedBandKey =
    typeof score === "number" ? bandKeyFromScore(score) : null;

  return (
    <div style={{ ...styles.page, background: theme.bg, color: theme.text }}>
      {/* Navbar */}
      <nav
        style={{
          ...styles.navbar,
          borderBottom: `1px solid ${theme.border}`,
          background: theme.navBg,
        }}
      >
        <div
          style={{ ...styles.brand, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="SME logo" style={styles.logoImg} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ ...styles.brandTitle, color: theme.text }}>
              SME Scoring
            </div>
            <div style={{ ...styles.brandSub, color: theme.muted }}>
              Decision Support Platform
            </div>
          </div>
        </div>

        <div style={styles.navRight}>
          <button
            style={{
              ...styles.ghostBtn,
              background: theme.card,
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => setDark((v) => !v)}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          {/* ✅ Evaluator profile button */}
          <button
            style={{
              ...styles.ghostBtn,
              background: "transparent",
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => navigate("/evaluator-home")}
          >
            My Profile
          </button>
        </div>
      </nav>

      {/* Header strip */}
      <section style={styles.header}>
        <div style={{ ...styles.heroGlow, background: theme.heroGlow }} />
        <div style={styles.headerInner}>
          <div>
            <div style={{ ...styles.kicker, color: theme.muted }}>
              Evaluator scoring
            </div>
            <div style={{ ...styles.headerTitle, color: theme.text }}>
              SME: {loading ? "Loading…" : sme?.name || "—"} • ID #{id}
            </div>
            <div style={{ ...styles.headerSub, color: theme.muted }}>
              One criterion at a time. Use Next/Previous or the Criteria list.
            </div>
          </div>

          <div style={styles.headerRight}>
            <div
              style={{
                ...styles.pill,
                border: `1px solid ${theme.borderStrong}`,
                background: theme.card,
                color: theme.text,
              }}
            >
              Progress:{" "}
              <span style={{ fontWeight: 950 }}>
                {progress.scored}/{progress.total}
              </span>
            </div>

            <button
              style={{
                ...styles.ghostBtn,
                background: theme.card,
                color: theme.text,
                border: `1px solid ${theme.borderStrong}`,
              }}
              onClick={() =>
                localStorage.setItem(`draft_scores_${id}`, JSON.stringify(scores))
              }
            >
              Save draft
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              ...styles.alert,
              border: `1px solid ${dark ? "rgba(255,90,90,0.35)" : "#FECACA"}`,
              background: dark ? "rgba(255,90,90,0.10)" : "#FEF2F2",
              color: dark ? "rgba(255,255,255,0.92)" : "#991B1B",
            }}
          >
            {error}
          </div>
        )}
      </section>

      {/* Main layout */}
      <div style={styles.layout}>
        {/* Sidebar navigation */}
        <aside style={styles.sidebarWrap}>
          <div
            style={{
              ...styles.sidebar,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: dark
                ? "0 20px 45px rgba(0,0,0,0.22)"
                : "0 20px 45px rgba(0,0,0,0.10)",
            }}
          >
            <div style={{ ...styles.sidebarTitle, color: theme.text }}>
              Criteria
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {rubric.map((r, idx) => {
                const val = scores[r.code]?.score;
                const done = typeof val === "number";
                const active = idx === activeIdx;

                return (
                  <button
                    key={r.code}
                    onClick={() => goToIndex(idx)}
                    style={{
                      ...styles.criteriaBtn,
                      background: active
                        ? dark
                          ? "rgba(47,150,180,0.14)"
                          : "rgba(47,150,180,0.12)"
                        : done
                        ? dark
                          ? "rgba(47,150,180,0.08)"
                          : "rgba(47,150,180,0.07)"
                        : theme.bg,
                      border: `1px solid ${active ? theme.button : theme.border}`,
                      color: theme.text,
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 950, fontSize: 13 }}>
                        {r.code}
                      </div>
                      <div style={{ fontSize: 12, color: theme.muted }}>
                        {r.title}
                      </div>
                    </div>

                    <span
                      style={{
                        ...styles.badge,
                        border: `1px solid ${theme.border}`,
                        background: theme.card,
                        color: theme.text,
                      }}
                    >
                      {done ? val : "—"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Single criterion card */}
        <main style={styles.cards}>
          <section
            ref={cardRef}
            style={{
              ...styles.card,
              background: theme.card,
              border: `1px solid ${theme.border}`,
              boxShadow: dark
                ? "0 20px 45px rgba(0,0,0,0.22)"
                : "0 20px 45px rgba(0,0,0,0.10)",
            }}
          >
            <div style={styles.cardTop}>
              <div>
                <div style={{ ...styles.code, color: theme.muted }}>
                  {activeCriterion.code} • Criterion {activeIdx + 1}/{rubric.length}
                </div>
                <div style={{ ...styles.cardTitle, color: theme.text }}>
                  {activeCriterion.title}
                </div>
                <div style={{ ...styles.helper, color: theme.muted }}>
                  Click the best matching description below (auto-sets score).
                  Fine-tune if needed.
                </div>
              </div>

              {/* Fine tune */}
              <div style={styles.fineTune}>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={typeof score === "number" ? score : 5}
                  onChange={(e) =>
                    setScore(
                      activeCriterion.code,
                      clampScore(Number(e.target.value))
                    )
                  }
                  style={{ width: 220 }}
                />

                <input
                  type="number"
                  min={1}
                  max={10}
                  value={score ?? ""}
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
                    ...styles.numberInput,
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                    color: theme.text,
                  }}
                />
              </div>
            </div>

            {/* Bands */}
            <div style={{ marginTop: 14 }}>
              <div style={styles.bandsHeader}>
                <div style={{ fontWeight: 950, color: theme.text }}>
                  Rubric bands
                </div>
                <div style={{ fontSize: 12, color: theme.muted }}>
                  {selectedBandKey
                    ? `Selected: ${selectedBandKey}`
                    : "Not selected yet"}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {bands.map((b) => {
                  const active = selectedBandKey === b.key;

                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setBand(activeCriterion.code, b)}
                      style={{
                        ...styles.bandCard,
                        background: active
                          ? dark
                            ? "rgba(47,150,180,0.12)"
                            : "rgba(47,150,180,0.10)"
                          : theme.bg,
                        border: `1px solid ${
                          active ? theme.button : theme.border
                        }`,
                        color: theme.text,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 14,
                          alignItems: "flex-start",
                        }}
                      >
                        <div
                          style={{
                            ...styles.bandIcon,
                            background: theme.iconBg,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {active ? "✓" : "＋"}
                        </div>

                        <div style={{ flex: 1, textAlign: "left" }}>
                          <div style={{ fontWeight: 950, fontSize: 14 }}>
                            {b.label}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              color: theme.muted,
                              fontSize: 13,
                              lineHeight: 1.45,
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

            {/* Notes + followup */}
            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
              <textarea
                value={current?.notes ?? ""}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [activeCriterion.code]: {
                      ...prev[activeCriterion.code],
                      notes: e.target.value,
                    },
                  }))
                }
                placeholder="Evidence / notes (optional but recommended)"
                style={{
                  ...styles.textarea,
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              />

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  color: theme.text,
                }}
              >
                <input
                  type="checkbox"
                  checked={!!current?.followup}
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
                <span style={{ fontSize: 13, color: theme.muted }}>
                  Need follow-up info
                </span>
              </label>
            </div>

            {/* Prev / Next + Submit final INSIDE scoring card */}
            <div style={styles.navRow}>
              <button
                type="button"
                onClick={goPrev}
                disabled={activeIdx === 0}
                style={{
                  ...styles.ghostBtn,
                  background: theme.card,
                  color: theme.text,
                  border: `1px solid ${theme.borderStrong}`,
                  opacity: activeIdx === 0 ? 0.55 : 1,
                  cursor: activeIdx === 0 ? "not-allowed" : "pointer",
                }}
              >
                ← Previous
              </button>

              
              {activeIdx < rubric.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  style={{
                    ...styles.primaryBtn,
                    background: theme.button,
                    color: theme.buttonText,
                  }}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitFinal}
                  disabled={!allDone || saving}
                  style={{
                    ...styles.primaryBtn,
                    background: theme.button,
                    color: theme.buttonText,
                    opacity: !allDone || saving ? 0.65 : 1,
                    cursor: !allDone || saving ? "not-allowed" : "pointer",
                  }}
                >
                  {saving ? "Submitting…" : "Submit final"}
                </button>
              )}
            </div>

            {!allDone && (
              <div style={{ marginTop: 10, fontSize: 12, color: theme.muted }}>
                Fill all criteria to enable “Submit final”.
              </div>
            )}
          </section>
        </main>
      </div>

      <footer
        style={{
          ...styles.footer,
          color: theme.muted,
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        <div>© {new Date().getFullYear()} SME Scoring Platform</div>
      </footer>
    </div>
  );
}

/* =========================
   Styles
========================= */
const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 30,
    display: "flex",
    justifyContent: "space-between",
    padding: "14px 5%",
    alignItems: "center",
    flexWrap: "wrap",
    backdropFilter: "blur(10px)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 220,
  },
  logoImg: {
    width: 92,
    height: 62,
    objectFit: "contain",
  },
  brandTitle: {
    fontWeight: 950,
    letterSpacing: 0.2,
    fontSize: 20,
  },
  brandSub: {
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  navRight: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },
  ghostBtn: {
    padding: "9px 14px",
    borderRadius: 10,
    border: "1px solid",
    cursor: "pointer",
    background: "transparent",
    fontWeight: 800,
  },
  primaryBtn: {
    padding: "9px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 900,
  },
  header: {
    position: "relative",
    padding: "22px 5% 14px",
  },
  heroGlow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  headerInner: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  kicker: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  headerTitle: {
    marginTop: 6,
    fontSize: "clamp(20px, 2.6vw, 30px)",
    fontWeight: 950,
    letterSpacing: -0.4,
    lineHeight: 1.15,
  },
  headerSub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.5,
    maxWidth: 780,
  },
  headerRight: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pill: {
    padding: "9px 12px",
    borderRadius: 12,
    fontWeight: 900,
    fontSize: 13,
  },
  alert: {
    position: "relative",
    zIndex: 1,
    marginTop: 12,
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 800,
    fontSize: 13,
  },
  layout: {
    width: "min(1200px, 100%)",
    margin: "0 auto",
    padding: "14px 5% 24px",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: 16,
  },
  sidebarWrap: { position: "relative" },
  sidebar: {
    position: "sticky",
    top: 92,
    borderRadius: 16,
    padding: 16,
  },
  sidebarTitle: {
    fontWeight: 950,
    marginBottom: 12,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  criteriaBtn: {
    width: "100%",
    borderRadius: 14,
    padding: "10px 12px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    fontSize: 12,
    fontWeight: 950,
    padding: "6px 10px",
    borderRadius: 999,
    whiteSpace: "nowrap",
  },
  cards: {
    display: "grid",
    gap: 16,
    alignContent: "start",
  },
  card: {
    borderRadius: 16,
    padding: 18,
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
  },
  code: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  cardTitle: {
    marginTop: 6,
    fontWeight: 950,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  helper: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 1.45,
    maxWidth: 640,
  },
  fineTune: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  numberInput: {
    width: 72,
    padding: "8px 10px",
    borderRadius: 12,
    outline: "none",
    fontWeight: 900,
  },
  bandsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  bandCard: {
    width: "100%",
    borderRadius: 16,
    padding: 14,
    cursor: "pointer",
    textAlign: "left",
  },
  bandIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontSize: 18,
    fontWeight: 950,
    flexShrink: 0,
  },
  textarea: {
    width: "100%",
    minHeight: 96,
    borderRadius: 14,
    padding: 12,
    outline: "none",
    resize: "vertical",
  },
  navRow: {
    marginTop: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  footer: {
    marginTop: "auto",
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
};