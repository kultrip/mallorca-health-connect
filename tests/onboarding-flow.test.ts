import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getOnboardingPlanConfig,
  resolveOnboardingPlan,
  resolveOnboardingPlanSlug,
} from "../src/lib/onboarding-flow.ts";

test("resolveOnboardingPlan defaults to profesional", () => {
  assert.equal(resolveOnboardingPlan({}), "profesional");
});

test("resolveOnboardingPlan prefers the selected plan from search", () => {
  assert.equal(resolveOnboardingPlan({ searchPlan: "profesional" }), "profesional");
});

test("resolveOnboardingPlan routes centers to the organisation flow", () => {
  assert.equal(resolveOnboardingPlan({ profilePlanSlug: "centros-organizadores" }), "centro");
});

test("professional plan removes therapy and help area caps", () => {
  const config = getOnboardingPlanConfig("profesional");

  assert.equal(config.isProfessional, true);
  assert.equal(config.therapyCap, null);
  assert.equal(config.helpAreaCap, null);
  assert.equal(config.logoEnabled, true);
});

test("organisation plan enables logo and gallery support", () => {
  const config = getOnboardingPlanConfig("centro");

  assert.equal(config.isOrganisation, true);
  assert.equal(config.logoRequired, true);
  assert.equal(config.galleryMaxFiles, 15);
  assert.equal(config.locationLimit, null);
});

test("resolveOnboardingPlanSlug keeps the original paid plan slug", () => {
  assert.equal(
    resolveOnboardingPlanSlug({ pendingPlanSlug: "centros-organizadores" }),
    "centros-organizadores",
  );
});
