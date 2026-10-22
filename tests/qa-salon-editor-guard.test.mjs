import { test } from "node:test";
import assert from "node:assert/strict";
import { assertQaSalonEditorEnv, assertQaSalonEditorPreflightEnv, APPROVAL, QA_PROJECT } from "../scripts/qa-salon-editor-guard.mjs";

const valid = {
  QA_PROJECT_REF: QA_PROJECT,
  QA_APPROVED_PROJECT_REF: QA_PROJECT,
  QA_SUPABASE_URL: `https://${QA_PROJECT}.supabase.co`,
  QA_SUPABASE_PUBLISHABLE_KEY: "synthetic-public-test-key",
  QA_TEST_MODE: "editorial-write",
  QA_EDITORIAL_WRITES_CONFIRM: APPROVAL,
  QA_EDITOR_EMAIL: "editor@example.invalid",
  QA_EDITOR_PASSWORD: "synthetic-fixture-not-real",
  GITHUB_REF: "refs/heads/qa/tenant-isolation-staging-20261010",
};

test("editor preflight accepts only exact isolated QA project and authorization", () => {
  assert.doesNotThrow(() => assertQaSalonEditorEnv(valid));
});

test("editor write authorization rejects project mismatch, production, unauthorized mode and unapproved branch", () => {
  for (const change of [
    { QA_PROJECT_REF: "mmykyzzkcugxunmekwew" },
    { QA_APPROVED_PROJECT_REF: "mmykyzzkcugxunmekwew" },
    { QA_SUPABASE_URL: "https://mmykyzzkcugxunmekwew.supabase.co" },
    { QA_TEST_MODE: "readonly" },
    { QA_EDITORIAL_WRITES_CONFIRM: "" },
    { QA_EDITORIAL_WRITES_CONFIRM: "AUTHORIZE_ISOLATED_QA_WRITES" },
    { GITHUB_REF: "refs/heads/main" },
  ]) {
    assert.throws(() => assertQaSalonEditorEnv({ ...valid, ...change }), /Refusing/, JSON.stringify(change));
  }
});

test("editor preflight requires secrets but does not inspect them in offline tests", () => {
  for (const key of ["QA_SUPABASE_PUBLISHABLE_KEY", "QA_EDITOR_EMAIL", "QA_EDITOR_PASSWORD"]) {
    assert.throws(() => assertQaSalonEditorEnv({ ...valid, [key]: "" }), /missing/, key);
  }
});

test("read-only editorial Auth preflight accepts its own mode without mutation consent", () => {
  const safe = { ...valid, QA_TEST_MODE: "editorial-preflight", QA_EDITORIAL_WRITES_CONFIRM: "" };
  assert.doesNotThrow(() => assertQaSalonEditorPreflightEnv(safe));
  assert.throws(() => assertQaSalonEditorEnv(safe), /Refusing/);
});

test("preflight never accepts write authorization, unsafe project or production ref", () => {
  const safe = { ...valid, QA_TEST_MODE: "editorial-preflight", QA_EDITORIAL_WRITES_CONFIRM: "" };
  for (const variant of [
    { QA_EDITORIAL_WRITES_CONFIRM: APPROVAL },
    { QA_PROJECT_REF: "mmykyzzkcugxunmekwew" },
    { QA_SUPABASE_URL: "https://mmykyzzkcugxunmekwew.supabase.co" },
    { GITHUB_REF: "refs/heads/main" },
    { QA_TEST_MODE: "editorial-write" },
    { QA_EDITOR_PASSWORD: "" },
  ]) {
    assert.throws(() => assertQaSalonEditorPreflightEnv({ ...safe, ...variant }), undefined, JSON.stringify(variant));
  }
});
