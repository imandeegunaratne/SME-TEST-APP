import assert from "node:assert/strict";
import test from "node:test";

import {
  bandKeyFromScore,
  bands,
  clampScore,
  createEmptyScores,
  rubric,
  scoreForBand,
} from "../../src/pages/ScoringPage/constants.js";

test("scoring rubric exposes one empty score record for each criterion", () => {
  const scores = createEmptyScores();

  assert.equal(Object.keys(scores).length, rubric.length);
  assert.deepEqual(scores.C1, { score: null, notes: "", followup: false });
});

test("score values are clamped into the valid 1 to 10 range", () => {
  assert.equal(clampScore(Number.NaN), null);
  assert.equal(clampScore(-3), 1);
  assert.equal(clampScore(7), 7);
  assert.equal(clampScore(20), 10);
});

test("score bands map scores to the expected rubric labels", () => {
  assert.equal(bandKeyFromScore(1), "1-2");
  assert.equal(bandKeyFromScore(4), "3-4");
  assert.equal(bandKeyFromScore(6), "5-6");
  assert.equal(bandKeyFromScore(8), "7-8");
  assert.equal(bandKeyFromScore(10), "9-10");
});

test("band midpoint scoring remains stable", () => {
  assert.equal(scoreForBand(bands[0]), 2);
  assert.equal(scoreForBand(bands.at(-1)), 10);
});
