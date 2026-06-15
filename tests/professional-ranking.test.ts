import assert from "node:assert/strict";
import { test } from "node:test";

import {
  sortProfessionalsByPriority,
  isPaidPriorityProfessional,
} from "../src/lib/professional-ranking.ts";

test("paid professionals sort above free professionals and alphabetically within each tier", () => {
  const list = sortProfessionalsByPriority([
    {
      id: "free-z",
      full_name: "Zoe Free",
      subscription_status: null,
      plans: { slug: "presencia" },
    },
    {
      id: "paid-b",
      full_name: "Bella Paid",
      subscription_status: "active",
      plans: { slug: "profesional" },
    },
    {
      id: "paid-a",
      full_name: "Ana Paid",
      subscription_status: "active",
      plans: { slug: "centros-organizadores" },
    },
    {
      id: "free-a",
      full_name: "Ana Free",
      subscription_status: "inactive",
      plans: { slug: "presencia" },
    },
  ]);

  assert.deepEqual(list.map((item) => item.id), ["paid-a", "paid-b", "free-a", "free-z"]);
});

test("paid priority only applies to active Profesional or Centros plans", () => {
  assert.equal(
    isPaidPriorityProfessional({
      subscription_status: "active",
      plans: { slug: "profesional" },
    }),
    true,
  );
  assert.equal(
    isPaidPriorityProfessional({
      subscription_status: "active",
      plans: { slug: "presencia" },
    }),
    false,
  );
  assert.equal(
    isPaidPriorityProfessional({
      subscription_status: "trialing",
      plans: { slug: "centros-organizadores" },
    }),
    false,
  );
});

test("paid professionals stay above free ones even when free profiles match more terms", () => {
  const list = sortProfessionalsByPriority(
    [
      {
        id: "free-high-match",
        full_name: "Zoe Free",
        subscription_status: null,
        plans: { slug: "presencia" },
      },
      {
        id: "paid-low-match",
        full_name: "Ana Paid",
        subscription_status: "active",
        plans: { slug: "profesional" },
      },
      {
        id: "paid-high-match",
        full_name: "Bella Paid",
        subscription_status: "active",
        plans: { slug: "centros-organizadores" },
      },
    ],
    {
      matchCounts: new Map([
        ["free-high-match", 5],
        ["paid-low-match", 1],
        ["paid-high-match", 2],
      ]),
    },
  );

  assert.deepEqual(list.map((item) => item.id), [
    "paid-high-match",
    "paid-low-match",
    "free-high-match",
  ]);
});
