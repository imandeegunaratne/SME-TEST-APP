import assert from "node:assert/strict";
import test from "node:test";

import { buildReportHtml } from "../../src/pages/ResultsPage/helpers.js";

test("report html includes capability, weakness, and criterion rows", () => {
  const html = buildReportHtml({
    id: 42,
    capability: 0.82,
    weaknesses: [{ rank: 1, title: "Cost Control", gap: 0.125 }],
    rows: [
      {
        code: "C8",
        title: "Cost Control & Efficiency",
        weight: 0.25,
        score: 7,
        normalized: 0.7,
        weighted: 0.175,
        gap: 0.075,
      },
    ],
  });

  assert.match(html, /SME Capability Report/);
  assert.match(html, /0\.82 \(82%\)/);
  assert.match(html, /Cost Control/);
  assert.match(html, /C8/);
});

test("report html renders a fallback when capability is missing", () => {
  const html = buildReportHtml({
    id: 99,
    capability: null,
    weaknesses: [],
    rows: [],
  });

  assert.match(html, /SME ID: 99/);
  assert.match(html, /<b>.*<\/b>/);
});
