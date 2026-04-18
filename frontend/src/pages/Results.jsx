// frontend/src/pages/CapabilityResult.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import logo from "../assets/logo.png";
import { createAppTheme } from "../styles/appTheme";

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

export default function CapabilityResult() {
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

  const theme = createAppTheme(dark, dark ? darkTheme : lightTheme);

  const token = localStorage.getItem("token") || "";
  useEffect(() => {
    if (!token) navigate("/login", { replace: true });
  }, [token, navigate]);

  const report = useMemo(() => {
    try {
      const raw = localStorage.getItem(`final_report_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [id]);

  const capability = report?.capability ?? null;
  const rows = report?.rows ?? [];
  const weaknesses = report?.weaknesses ?? [];

  function downloadHtmlReport() {
    const capTxt =
      capability == null
        ? "—"
        : `${capability.toFixed(2)} (${Math.round(capability * 100)}%)`;

    const weaknessList = weaknesses.slice(0, 5).map(
      (w) =>
        `<li><b>#${w.rank}</b> ${w.title} — Gap: ${(w.gap ?? 0).toFixed(4)}</li>`
    );

    const tableRows = rows
      .map(
        (r) => `
      <tr>
        <td>${r.code}</td>
        <td>${r.title}</td>
        <td>${Number(r.weight).toFixed(6)}</td>
        <td>${r.score ?? ""}</td>
        <td>${r.normalized == null ? "" : r.normalized.toFixed(2)}</td>
        <td>${r.weighted == null ? "" : r.weighted.toFixed(4)}</td>
        <td>${r.gap == null ? "" : r.gap.toFixed(4)}</td>
      </tr>
    `
      )
      .join("");

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>SME Capability Report - ${id}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; }
    h1 { margin: 0 0 6px; }
    .muted { color: #555; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 14px; margin: 14px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; vertical-align: top; }
    th { background: #f5f5f5; text-align: left; }
  </style>
</head>
<body>
  <h1>SME Capability Report</h1>
  <div class="muted">SME ID: ${id}</div>

  <div class="card">
    <h2>Capability Score</h2>
    <div><b>${capTxt}</b></div>
    <div class="muted">Calculated using FAHP weights × normalized scores (Excel logic)</div>
  </div>

  <div class="card">
    <h2>Weakness Criteria Explorer (Top 5)</h2>
    <ol>${weaknessList.join("")}</ol>
  </div>

  <div class="card">
    <h2>Details</h2>
    <table>
      <thead>
        <tr>
          <th>Code</th><th>Criteria</th><th>Weight</th><th>Score</th><th>Norm</th><th>Weighted</th><th>Gap</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SME_Capability_Report_${id}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printToPdf() {
    // user can "Save as PDF" from print dialog
    window.print();
  }

  if (!report) {
    return (
      <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text }}>
        <div style={{ padding: 24 }}>
          <div style={{ fontWeight: 950, fontSize: 18 }}>No report found</div>
          <div style={{ color: theme.muted, marginTop: 8 }}>
            Please submit final scoring first.
          </div>
          <button
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.borderStrong}`,
              background: theme.card,
              color: theme.text,
              cursor: "pointer",
              fontWeight: 900,
            }}
            onClick={() => navigate(`/smes/${id}/score`)}
          >
            Back to scoring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: theme.bg, color: theme.text }}>
      {/* Navbar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          display: "flex",
          justifyContent: "space-between",
          padding: "14px 5%",
          alignItems: "center",
          flexWrap: "wrap",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${theme.border}`,
          background: theme.navBg,
          fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="SME logo" style={{ width: 92, height: 62, objectFit: "contain" }} />
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontWeight: 950, fontSize: 20 }}>SME Scoring</div>
            <div style={{ fontSize: 12, color: theme.muted }}>Decision Support Platform</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.borderStrong}`,
              background: theme.card,
              color: theme.text,
              cursor: "pointer",
              fontWeight: 800,
            }}
            onClick={() => setDark((v) => !v)}
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>

          <button
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.borderStrong}`,
              background: "transparent",
              color: theme.text,
              cursor: "pointer",
              fontWeight: 800,
            }}
            onClick={() => navigate("/evaluator-home")}
          >
            My Profile
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ width: "min(1100px, 100%)", margin: "0 auto", padding: "22px 5% 30px" }}>
        <div
          style={{
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            background: theme.card,
            padding: 16,
            boxShadow: dark ? "0 20px 45px rgba(0,0,0,0.22)" : "0 20px 45px rgba(0,0,0,0.10)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, color: theme.muted, textTransform: "uppercase" }}>
            Capability Result
          </div>

          <div style={{ marginTop: 6, fontSize: 22, fontWeight: 950 }}>
            Capability Score: {capability.toFixed(2)}{" "}
            <span style={{ fontSize: 14, color: theme.muted }}>
              ({Math.round(capability * 100)}%)
            </span>
          </div>

          <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate(`/smes/${id}/score`)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.borderStrong}`,
                background: theme.card,
                color: theme.text,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Back to scoring
            </button>

            <button
              onClick={downloadHtmlReport}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${theme.borderStrong}`,
                background: theme.card,
                color: theme.text,
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Download report (HTML)
            </button>

            <button
              onClick={printToPdf}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "none",
                background: theme.button,
                color: theme.buttonText,
                cursor: "pointer",
                fontWeight: 950,
              }}
            >
              Print / Save as PDF
            </button>
          </div>
        </div>

        {/* Weakness Explorer */}
        <div
          style={{
            marginTop: 16,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            background: theme.card,
            padding: 16,
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 16 }}>Weakness criteria explorer</div>
          <div style={{ color: theme.muted, fontSize: 13, marginTop: 6 }}>
            Ranked by GAP = weight × (1 − normalized score). Higher gap = bigger weakness.
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {weaknesses.slice(0, 6).map((w) => (
              <div
                key={w.code}
                style={{
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: dark ? "rgba(47,150,180,0.08)" : "rgba(47,150,180,0.06)",
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 950 }}>
                    #{w.rank} — {w.title}
                  </div>
                  <div style={{ color: theme.muted, fontWeight: 900 }}>
                    Gap: {(w.gap ?? 0).toFixed(4)} • Weight: {Number(w.weight).toFixed(4)} • Score: {w.score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details table */}
        <div
          style={{
            marginTop: 16,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            background: theme.card,
            padding: 16,
            overflowX: "auto",
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 16 }}>Calculation details</div>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: 13 }}>
            <thead>
              <tr>
                {["Code", "Criteria", "Weight", "Score", "Norm", "Weighted", "Gap"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: 10,
                      borderBottom: `1px solid ${theme.border}`,
                      color: theme.muted,
                      fontWeight: 950,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.code}>
                  <td style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>{r.code}</td>
                  <td style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>{r.title}</td>
                  <td style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>{Number(r.weight).toFixed(6)}</td>
                  <td style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>{r.score ?? ""}</td>
                  <td style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>
                    {r.normalized == null ? "" : r.normalized.toFixed(2)}
                  </td>
                  <td style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>
                    {r.weighted == null ? "" : r.weighted.toFixed(4)}
                  </td>
                  <td style={{ padding: 10, borderBottom: `1px solid ${theme.border}` }}>
                    {r.gap == null ? "" : r.gap.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
