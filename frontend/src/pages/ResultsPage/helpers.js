export function buildReportHtml({ capability, weaknesses, rows, id }) {
  const capTxt = capability == null ? "â€”" : `${capability.toFixed(2)} (${Math.round(capability * 100)}%)`;
  const weaknessList = weaknesses.slice(0, 5).map((w) => `<li><b>#${w.rank}</b> ${w.title} â€” Gap: ${(w.gap ?? 0).toFixed(4)}</li>`).join("");
  const tableRows = rows.map((r) => `
    <tr>
      <td>${r.code}</td><td>${r.title}</td><td>${Number(r.weight).toFixed(6)}</td>
      <td>${r.score ?? ""}</td><td>${r.normalized == null ? "" : r.normalized.toFixed(2)}</td>
      <td>${r.weighted == null ? "" : r.weighted.toFixed(4)}</td><td>${r.gap == null ? "" : r.gap.toFixed(4)}</td>
    </tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"/><title>SME Capability Report - ${id}</title><style>
    body { font-family: Arial, sans-serif; padding: 24px; } h1 { margin: 0 0 6px; } .muted { color: #555; }
    .card { border: 1px solid #ddd; border-radius: 12px; padding: 14px; margin: 14px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; } th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; vertical-align: top; }
    th { background: #f5f5f5; text-align: left; }
  </style></head><body>
    <h1>SME Capability Report</h1><div class="muted">SME ID: ${id}</div>
    <div class="card"><h2>Capability Score</h2><div><b>${capTxt}</b></div><div class="muted">Calculated using FAHP weights Ã— normalized scores (Excel logic)</div></div>
    <div class="card"><h2>Weakness Criteria Explorer (Top 5)</h2><ol>${weaknessList}</ol></div>
    <div class="card"><h2>Details</h2><table><thead><tr><th>Code</th><th>Criteria</th><th>Weight</th><th>Score</th><th>Norm</th><th>Weighted</th><th>Gap</th></tr></thead><tbody>${tableRows}</tbody></table></div>
  </body></html>`;
}
