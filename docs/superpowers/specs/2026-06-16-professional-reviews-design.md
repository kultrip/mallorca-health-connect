# Professional Reviews Design

**Goal:** Add a paid-only reviews scaffold for professionals, with public submission, public display for paid profiles only, and admin moderation.

**Architecture:** Store reviews in a single `professional_reviews` table with RLS. Public visitors can insert reviews without auth for now, public pages can only read published reviews, and admins moderate publication in the dashboard. Paid profile pages render the reviews section; FREE profiles do not.

**Rules:**
- FREE / Presencia: no reviews section.
- Profesional / Centros: show a reviews section.
- If no reviews exist, show a calm placeholder.
- Visitors can submit a simple inline review form with name, optional email, rating, and comment.
- Admins can approve or reject pending reviews.
- Public visibility only applies to profiles that are both published and in a paid plan.

**Scope limits:**
- No visitor accounts.
- No review replies.
- No review analytics.
- No ratings aggregation or sorting beyond the basic list display.
