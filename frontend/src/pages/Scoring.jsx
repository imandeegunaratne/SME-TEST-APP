// frontend/src/pages/Scoring.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.png";

/* =========================
   Bands + Rubric (per-criteria)
========================= */
const bands = [
  { key: "1–2", label: "1–2 Very weak", min: 1, max: 2 },
  { key: "3–4", label: "3–4 Weak", min: 3, max: 4 },
  { key: "5–6", label: "5–6 Moderate", min: 5, max: 6 },
  { key: "7–8", label: "7–8 Strong", min: 7, max: 8 },
  { key: "9–10", label: "9–10 Very strong", min: 9, max: 10 },
];

// ✅ Make sure EACH item has a code (C1..C10)
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

  const token = localStorage.getItem("token") || "";

  // Persist theme
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

  // ✅ one criterion at a time
  const [activeIndex, setActiveIndex] = useState(0);

  // scores state
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
    // small UX: scroll to top of card area
    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  // =========================
  // Load SME + load saved criterion scores from backend
  // =========================
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function loadAll() {
      setLoading(true);
      setError("");

      try {
        // 1) SME report data (you already have this endpoint)
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

        // 2) load saved criterion scores (NEW endpoint)
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

  // =========================
  // Save draft to backend
  // =========================
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

  // =========================
  // Submit final -> backend computes Excel logic -> go capability page
  // =========================
  async function submitFinal() {
    if (progress.scored !== progress.total) {
      setError("Please score all criteria before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // (1) ensure draft saved
      await saveDraftToBackend();

      // (2) submit capability
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

      // (3) go to result page
      navigate(`/smes/${id}/capability`);
    } catch (e) {
      setError(e.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  }

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
        {/* Brand */}
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

        {/* Right buttons */}
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

          {/* ✅ Evaluator profile button (change path if your profile page route differs) */}
          <button
            style={{
              ...styles.ghostBtn,
              background: "transparent",
              color: theme.text,
              border: `1px solid ${theme.borderStrong}`,
            }}
            onClick={() => navigate("/evaluator-home")}
          >
            Evaluator Profile
          </button>
        </div>
      </nav>

      {/* Header */}
      <section style={styles.header}>
        <div style={{ ...styles.heroGlow, background: theme.heroGlow }} />
        <div style={styles.headerInner}>
          <div>
            <div style={{ ...styles.kicker, color: theme.muted }}>
              SME Scoring
            </div>
            <div style={{ ...styles.headerTitle, color: theme.text }}>
              SME: {loading ? "Loading…" : sme?.name || "—"} • ID #{id}
            </div>
            <div style={{ ...styles.headerSub, color: theme.muted }}>
              Select the best matching band description. Use Next/Previous to move.
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
                opacity: savingDraft ? 0.7 : 1,
              }}
              onClick={saveDraftToBackend}
              disabled={savingDraft}
            >
              {savingDraft ? "Saving…" : "Save draft"}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              ...styles.alert,
              border: `1px solid ${
                dark ? "rgba(255,90,90,0.35)" : "#FECACA"
              }`,
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
        {/* Sidebar: criteria navigation */}
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
                const activeNav = idx === activeIndex;

                return (
                  <button
                    key={r.code}
                    onClick={() => goToIndex(idx)}
                    style={{
                      ...styles.criteriaBtn,
                      background: activeNav
                        ? (dark ? "rgba(47,150,180,0.16)" : "rgba(47,150,180,0.12)")
                        : done
                        ? (dark ? "rgba(47,150,180,0.10)" : "rgba(47,150,180,0.08)")
                        : theme.bg,
                      border: `1px solid ${activeNav ? theme.button : theme.border}`,
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
                  {activeCriterion.code} • {activeIndex + 1}/{rubric.length}
                </div>
                <div style={{ ...styles.cardTitle, color: theme.text }}>
                  {activeCriterion.title}
                </div>
                <div style={{ ...styles.helper, color: theme.muted }}>
                  Click one band description to set score automatically.
                </div>
              </div>

              {/* Fine tune */}
              <div style={styles.fineTune}>
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
                  style={{ width: 220 }}
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
                  {selectedBandKey ? `Selected: ${selectedBandKey}` : "Not selected yet"}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                {bands.map((b) => {
                  const activeBand = selectedBandKey === b.key;

                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setBand(activeCriterion.code, b)}
                      style={{
                        ...styles.bandCard,
                        background: activeBand
                          ? (dark
                              ? "rgba(47,150,180,0.12)"
                              : "rgba(47,150,180,0.10)")
                          : theme.bg,
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
                            background: theme.iconBg,
                            color: theme.text,
                            border: `1px solid ${theme.border}`,
                          }}
                        >
                          {activeBand ? "✓" : "＋"}
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

            {/* Notes */}
            <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
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
                <span style={{ fontSize: 13, color: theme.muted }}>
                  Need follow-up info
                </span>
              </label>
            </div>

            {/* Navigation buttons */}
            <div style={styles.navRow}>
              <button
                style={{
                  ...styles.ghostBtn,
                  background: theme.card,
                  color: theme.text,
                  border: `1px solid ${theme.borderStrong}`,
                  opacity: activeIndex === 0 ? 0.55 : 1,
                }}
                disabled={activeIndex === 0}
                onClick={() => goToIndex(activeIndex - 1)}
              >
                ← Previous
              </button>

              {activeIndex < rubric.length - 1 ? (
                <button
                  style={{
                    ...styles.primaryBtn,
                    background: theme.button,
                    color: theme.buttonText,
                    opacity: 1,
                  }}
                  onClick={() => goToIndex(activeIndex + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  style={{
                    ...styles.primaryBtn,
                    background: theme.button,
                    color: theme.buttonText,
                    opacity:
                      progress.scored === progress.total && !submitting ? 1 : 0.65,
                  }}
                  disabled={progress.scored !== progress.total || submitting}
                  onClick={submitFinal}
                >
                  {submitting ? "Submitting…" : "Submit Final"}
                </button>
              )}
            </div>
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
  cards: { display: "grid", gap: 16, alignContent: "start" },
  card: { borderRadius: 16, padding: 18 },
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
  fineTune: { display: "flex", alignItems: "center", gap: 10 },
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
    marginTop: 18,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
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