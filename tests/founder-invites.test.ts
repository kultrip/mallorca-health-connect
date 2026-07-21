import assert from "node:assert/strict";
import { test } from "node:test";

import { normalizeFounderWhatsApp } from "../src/lib/phone-normalization.ts";

test("normalizes Spanish local mobile numbers for founder invite matching", () => {
  assert.equal(normalizeFounderWhatsApp("612 345 678"), "34612345678");
  assert.equal(normalizeFounderWhatsApp("612-345-678"), "34612345678");
});

test("keeps explicit country codes while stripping formatting", () => {
  assert.equal(normalizeFounderWhatsApp("+34 612 345 678"), "34612345678");
  assert.equal(normalizeFounderWhatsApp("0034 612 345 678"), "34612345678");
});

test("returns empty string when no digits are present", () => {
  assert.equal(normalizeFounderWhatsApp("WhatsApp pendiente"), "");
});
