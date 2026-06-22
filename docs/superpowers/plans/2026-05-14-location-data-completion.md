# Location Data Completion Plan

Date: 2026-05-14

## Steps

1. Add a Supabase migration for `therapists.city`.
2. Update generated Supabase TypeScript types locally.
3. Add a focused utility test for city-first map labels with municipality coordinate fallback.
4. Thread `city` through professional card data, professional list queries, therapy-related queries, and conversational search results.
5. Update professional onboarding and dashboard profile editing to collect city/area, address, map zone, and optional coordinates.
6. Update admin professional management to edit and search by city/area.
7. Update public profile location display and map fallback behavior.
8. Update handoff docs to record that location completion is in MVP and activities are deferred.
9. Verify with Node test, TypeScript, targeted ESLint, and build.

## Verification

```bash
node --test --experimental-strip-types tests/professional-map-utils.test.ts
npx tsc --noEmit
npx eslint tests/professional-map-utils.test.ts src/components/therapists/professional-map-utils.ts src/components/therapists/TherapistCard.tsx src/features/professionals/ProfessionalsPage.tsx src/features/professionals/ProfessionalProfilePage.tsx src/features/therapies/TherapyDetailPage.tsx src/routes/dashboard/index.tsx src/routes/dashboard/admin.tsx src/routes/onboarding.tsx src/components/admin/AdminProfessionalsPanel.tsx src/components/admin/admin-types.ts src/lib/professional-profile-editor.ts src/lib/admin-data-management.ts
npm run build
```
