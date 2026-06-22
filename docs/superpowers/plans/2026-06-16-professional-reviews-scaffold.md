# Professional Reviews Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a paid-only reviews data layer and a public/admin placeholder flow for moderated professional reviews.

**Architecture:** The feature stays deliberately small: one Supabase table with RLS for reviews, one paid-profile section on the public profile page with an inline review form, and one admin tab for moderating pending reviews. Public visibility is driven from the existing plan-access helper so FREE profiles do not show reviews at all, while paid profiles can collect and display only published reviews.

**Tech Stack:** Supabase migrations, RLS policies, TanStack React pages, existing admin dashboard tabs, existing `plan-access` helper, existing `supabase` client.

---

### Task 1: Add the reviews table and policies

**Files:**
- Create: `supabase/migrations/20260616000000_add_professional_reviews.sql`
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Write the failing test**

```sql
-- The table should exist with RLS enabled and the required columns.
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'professional_reviews'
order by ordinal_position;
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx supabase db push
```
Expected: fail because the migration file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```sql
create table if not exists public.professional_reviews (
  id uuid primary key default gen_random_uuid(),
  therapist_id uuid references public.therapists(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  rating integer check (rating between 1 and 5),
  comment text,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.professional_reviews enable row level security;

create policy "professional_reviews_public_insert"
  on public.professional_reviews
  for insert
  with check (true);

create policy "professional_reviews_public_select_published"
  on public.professional_reviews
  for select
  using (is_published = true);

create policy "professional_reviews_admin_update"
  on public.professional_reviews
  for update
  using (public.has_role(auth.uid(), 'admin'));
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx supabase db push
```
Expected: migration applies successfully and the table is present.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260616000000_add_professional_reviews.sql src/integrations/supabase/types.ts
git commit -m "Add professional reviews table"
```

### Task 2: Show reviews on paid public profiles

**Files:**
- Modify: `src/features/professionals/ProfessionalProfilePage.tsx`
- Modify: `src/lib/plan-access.ts`
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
node --test tests/professional-reviews.test.ts -v
```
Expected: fail because `therapistCanShowReviews` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function therapistCanShowReviews(therapist: TherapistAccessLike, plan: PlanLike) {
  return therapistHasPremiumPublicAccess(therapist, plan);
}
```

In `ProfessionalProfilePage.tsx`, add a reviews section that:
```tsx
{showReviewsSection && (
  <section className="mt-10 rounded-3xl border border-border bg-card p-6">
    <h2 className="font-display text-2xl">Opiniones</h2>
    {reviews.length === 0 ? (
      <p className="mt-3 text-sm text-muted-foreground">
        Aún no hay opiniones. Sé el primero en compartir tu experiencia.
      </p>
    ) : (
      <div className="mt-4 space-y-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <strong>{review.reviewer_name.split(" ")[0]}</strong>
              <span>{Array.from({ length: review.rating ?? 0 }).map(() => "★").join("")}</span>
            </div>
            {review.comment && <p className="mt-2 text-sm text-foreground/80">{review.comment}</p>}
          </article>
        ))}
      </div>
    )}
    <button type="button">Dejar una opinión</button>
  </section>
)}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm run build
```
Expected: build passes and the profile page renders the paid-only reviews section.

- [ ] **Step 5: Commit**

```bash
git add src/features/professionals/ProfessionalProfilePage.tsx src/lib/plan-access.ts src/integrations/supabase/types.ts tests/professional-reviews.test.ts
git commit -m "Show reviews on paid profiles"
```

### Task 3: Add admin moderation for pending reviews

**Files:**
- Modify: `src/routes/dashboard/admin.tsx`
- Modify: `src/components/admin/AdminRequestsPanel.tsx`
- Create: `src/components/admin/AdminReviewsPanel.tsx`
- Modify: `src/integrations/supabase/types.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { canModerateReview } from "../src/lib/plan-access.ts";

test("admins can moderate reviews", () => {
  assert.equal(canModerateReview(true), true);
  assert.equal(canModerateReview(false), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
node --test tests/review-moderation.test.ts -v
```
Expected: fail because `canModerateReview` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export function canModerateReview(isAdmin: boolean) {
  return isAdmin;
}
```

Add a new admin tab:
```tsx
<TabsTrigger value="opiniones">Opiniones</TabsTrigger>
<TabsContent value="opiniones">
  <AdminReviewsPanel onReload={loadAdminData} />
</TabsContent>
```

The new panel should:
```tsx
// load pending reviews from professional_reviews where is_published = false
// render therapist name, reviewer_name, rating, comment
// call a small admin helper to approve or reject
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npm run build
```
Expected: build passes and the dashboard shows the new moderation tab.

- [ ] **Step 5: Commit**

```bash
git add src/routes/dashboard/admin.tsx src/components/admin/AdminReviewsPanel.tsx src/components/admin/AdminRequestsPanel.tsx src/lib/plan-access.ts src/integrations/supabase/types.ts tests/review-moderation.test.ts
git commit -m "Add reviews moderation tab"
```

### Task 4: Final verification

**Files:**
- All touched files above

- [ ] **Step 1: Run the full verification set**

Run:
```bash
npx eslint src/features/professionals/ProfessionalProfilePage.tsx src/lib/plan-access.ts src/routes/dashboard/admin.tsx src/components/admin/AdminReviewsPanel.tsx src/components/admin/AdminRequestsPanel.tsx
npm run build
```
Expected: ESLint passes and the build exits 0.

- [ ] **Step 2: Smoke the public profile and admin review flow**

Run:
```bash
npm run dev
```
Then verify:
1. FREE profile pages do not show a reviews section.
2. Paid profile pages show the placeholder or published reviews.
3. `/dashboard/admin` includes the `Opiniones` tab.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "Ship reviews scaffold"
```
