import assert from "node:assert/strict";
import { test } from "node:test";

import { therapistCanShowReviews } from "../src/lib/plan-access.ts";

test("paid published profiles can show reviews", () => {
  assert.equal(
    therapistCanShowReviews(
      { status: "published", subscription_status: "active" },
      { slug: "profesional" },
    ),
    true,
  );
});

test("free profiles cannot show reviews", () => {
  assert.equal(
    therapistCanShowReviews(
      { status: "published", subscription_status: null },
      { slug: "presencia" },
    ),
    false,
  );
});
