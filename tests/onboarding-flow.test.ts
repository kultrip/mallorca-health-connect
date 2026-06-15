import assert from "node:assert/strict";
import { test } from "node:test";

import { getOnboardingPlanConfig, resolveOnboardingPlan } from "../src/lib/onboarding-flow.ts";

test("resolveOnboardingPlan defaults to presencia", () => {
  assert.equal(resolveOnboardingPlan({}), "presencia");
});

test("resolveOnboardingPlan prefers the selected plan from search", () => {
  assert.equal(resolveOnboardingPlan({ searchPlan: "profesional" }), "profesional");
});

test("resolveOnboardingPlan treats centers as a professional flow", () => {
  assert.equal(resolveOnboardingPlan({ profilePlanSlug: "centros-organizadores" }), "profesional");
});

test("professional plan removes therapy and help area caps", () => {
  const config = getOnboardingPlanConfig("profesional");

  assert.equal(config.isProfessional, true);
  assert.equal(config.therapyCap, null);
  assert.equal(config.helpAreaCap, null);
  assert.equal(config.logoEnabled, true);
});
