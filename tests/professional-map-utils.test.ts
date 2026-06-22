import assert from "node:assert/strict";
import { test } from "node:test";

import { getProfessionalMapPins } from "../src/components/therapists/professional-map-utils.ts";

test("map pins prefer the professional city label over municipality fallback", () => {
  const pins = getProfessionalMapPins([
    {
      id: "therapist-1",
      slug: "ana",
      full_name: "Ana",
      city: "Palma",
      lat: null,
      lng: null,
      municipalities: {
        name: "Calvia",
        slug: "calvia",
        lat: 39.5657,
        lng: 2.5062,
      },
    },
  ]);

  assert.equal(pins[0]?.locationLabel, "Palma");
  assert.equal(pins[0]?.source, "municipality");
});
