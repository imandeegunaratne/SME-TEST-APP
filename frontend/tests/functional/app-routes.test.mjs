import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(new URL("../../src/App.jsx", import.meta.url), "utf8");

test("public routes are wired into the application shell", () => {
  for (const path of ["/", "/login", "/signup", "/help", "/admin-login"]) {
    assert.match(appSource, new RegExp(`path="${path.replace("/", "\\/")}"`));
  }
});

test("protected evaluator and admin workflows remain routed", () => {
  for (const path of [
    "/evaluator-home",
    "/sme-register",
    "/smes/:id/report",
    "/smes/:id/score",
    "/smes/:id/results",
    "/bank-admin-dashboard",
    "/super-admin",
  ]) {
    assert.match(appSource, new RegExp(`path="${path.replaceAll("/", "\\/")}"`));
  }

  assert.match(appSource, /allowRoles=\{\["EVALUATOR"\]\}/);
  assert.match(appSource, /allowRoles=\{\["BANK_ADMIN"\]\}/);
  assert.match(appSource, /allowRoles=\{\["SUPER_ADMIN"\]\}/);
});
