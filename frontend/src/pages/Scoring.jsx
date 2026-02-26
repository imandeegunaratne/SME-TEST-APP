import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const bands = [
  { label: "1–2 Very weak", min: 1, max: 2 },
  { label: "3–4 Weak", min: 3, max: 4 },
  { label: "5–6 Moderate", min: 5, max: 6 },
  { label: "7–8 Strong", min: 7, max: 8 },
  { label: "9–10 Very strong", min: 9, max: 10 },
];

// NOTE: Only C1 is filled as an example in your original file.
// You can extend this list to C2–C10 with the same structure.
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
];

function bandKey(score) {
  if (score <= 2) return "1–2";
  if (score <= 4) return "3–4";
  if (score <= 6) return "5–6";
  if (score <= 8) return "7–8";
  return "9–10";
}

export default function RubricScoringPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const username = localStorage.getItem("username") || "";

  const [sme, setSme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [scores, setScores] = useState(() =>
    Object.fromEntries(rubric.map(r => [r.code, { score: null, notes: "", followup: false }]))
  );

  const cardRefs = useRef({});

  const progress = useMemo(() => {
    const scored = Object.values(scores).filter(v => typeof v.score === "number").length;
    return { scored, total: rubric.length };
  }, [scores]);

  const overall = useMemo(() => {
    const vals = Object.values(scores).map(v => v.score).filter(s => typeof s === "number");
    if (!vals.length) return null;
    return Math.round((vals.reduce((a,b)=>a+b,0) / vals.length) * 10) / 10;
  }, [scores]);

  const scrollTo = (code) => {
    const el = cardRefs.current[code];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setScore = (code, newScore) => {
    setScores(prev => ({
      ...prev,
      [code]: { ...prev[code], score: newScore },
    }));
    // TODO: debounce autosave PATCH here
  };

  useEffect(() => {
    // Load any local draft
    try {
      const raw = localStorage.getItem(`draft_scores_${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setScores(parsed);
      }
    } catch {
      // ignore
    }

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/smes/${id}/report/`, {
          headers: { "X-Username": username },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.detail || "Failed to load SME.");
        setSme(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, username]);

  async function submitFinal() {
    if (overall == null) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/smes/${id}/score/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Username": username,
        },
        body: JSON.stringify({ total_score: overall }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to save score.");
      navigate(`/smes/${id}/report`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Evaluator scoring</div>
            <div className="font-semibold">
              SME: {loading ? "Loading…" : sme?.name || "—"} • ID #{id}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Progress: <span className="font-semibold">{progress.scored}/{progress.total}</span>
            </div>
            <button
              className="px-3 py-2 rounded-lg border bg-white"
              onClick={() => localStorage.setItem(`draft_scores_${id}`, JSON.stringify(scores))}
            >
              Save draft
            </button>
            <button
              className={`px-3 py-2 rounded-lg text-white ${progress.scored === progress.total ? "bg-slate-900" : "bg-gray-400 cursor-not-allowed"}`}
              disabled={progress.scored !== progress.total || saving}
              onClick={submitFinal}
            >
              {saving ? "Submitting…" : "Submit final"}
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">
        {error && (
          <div className="col-span-12 bg-red-50 border border-red-200 text-red-700 rounded-xl p-3">
            {error}
          </div>
        )}
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-4 lg:col-span-3">
          <div className="sticky top-20 space-y-3">
            <div className="bg-white border rounded-xl p-4">
              <div className="font-semibold mb-3">Criteria</div>
              <div className="space-y-2">
                {rubric.map(r => {
                  const val = scores[r.code]?.score;
                  const done = typeof val === "number";
                  return (
                    <button
                      key={r.code}
                      onClick={() => scrollTo(r.code)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 border"
                    >
                      <div className="text-left">
                        <div className="text-sm font-semibold">{r.code}</div>
                        <div className="text-xs text-gray-600">{r.title}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${done ? "bg-green-100" : "bg-gray-100"}`}>
                          {done ? val : "—"}
                        </span>
                        <span>{done ? "✅" : "⏳"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <div className="text-sm text-gray-600">Overall</div>
              <div className="text-2xl font-bold">{overall ?? "—"}</div>
              <div className="text-xs text-gray-500 mt-1">Average of scored criteria</div>
            </div>
          </div>
        </aside>

        {/* Cards */}
        <main className="col-span-12 md:col-span-8 lg:col-span-9 space-y-4">
          {rubric.map(r => {
            const current = scores[r.code];
            const score = current.score;
            const key = typeof score === "number" ? bandKey(score) : null;

            return (
              <section
                key={r.code}
                ref={(el) => (cardRefs.current[r.code] = el)}
                className="bg-white border rounded-2xl p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500">{r.code}</div>
                    <div className="text-xl font-semibold">{r.title}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={typeof score === "number" ? score : 5}
                      onChange={(e) => setScore(r.code, Number(e.target.value))}
                      className="w-48"
                    />
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={score ?? ""}
                      onChange={(e) => setScore(r.code, e.target.value === "" ? null : Number(e.target.value))}
                      className="w-20 border rounded-lg px-2 py-1"
                      placeholder="—"
                    />
                  </div>
                </div>

                {/* Band quick select */}
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {bands.map(b => (
                    <button
                      key={b.label}
                      onClick={() => setScore(r.code, b.min)}
                      className={`px-2 py-2 rounded-lg border text-xs ${
                        typeof score === "number" && score >= b.min && score <= b.max ? "bg-black text-white" : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div className="mt-4 p-4 rounded-xl bg-gray-50 border">
                  <div className="text-sm font-semibold mb-1">
                    {key ? `Selected band: ${key}` : "Select a score to see rubric guidance"}
                  </div>
                  <div className="text-sm text-gray-700">
                    {key ? r.desc[key] : "—"}
                  </div>
                </div>

                {/* Notes */}
                <div className="mt-4 grid gap-3">
                  <textarea
                    className="w-full min-h-24 border rounded-xl p-3"
                    placeholder="Evidence / notes (optional but recommended)"
                    value={current.notes}
                    onChange={(e) =>
                      setScores(prev => ({ ...prev, [r.code]: { ...prev[r.code], notes: e.target.value } }))
                    }
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={current.followup}
                      onChange={(e) =>
                        setScores(prev => ({ ...prev, [r.code]: { ...prev[r.code], followup: e.target.checked } }))
                      }
                    />
                    Need follow-up info
                  </label>
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}