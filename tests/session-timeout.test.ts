import assert from "node:assert/strict";
import { test } from "node:test";

import {
  getRememberSessionPreference,
  shouldAutoSignOutOnVisibilityHidden,
} from "../src/lib/session-timeout.ts";

test("remember-session preference defaults to false", () => {
  assert.equal(getRememberSessionPreference(null), false);
  assert.equal(getRememberSessionPreference(undefined), false);
  assert.equal(getRememberSessionPreference("false"), false);
});

test("visibility hidden should sign out when remember-session is off", () => {
  assert.equal(shouldAutoSignOutOnVisibilityHidden(false), true);
  assert.equal(shouldAutoSignOutOnVisibilityHidden(true), false);
});
