# Mallorca Holística — MVP Plan

A platform that connects users in Mallorca with verified holistic professionals. Two ways to discover: by therapy + location, or by describing how you feel ("estoy ansioso", "no duermo bien") via a conversational AI search. No internal booking — contact via WhatsApp or the therapist's external link (Calendly, etc.).

---

## 1. Visual & frontend direction

### Aesthetic

- **Tone**: human, warm, calm, editorial. Think Doctoralia's clarity but more authentic, closer to tahona-santana.com.
- **Backgrounds**: pure white across the entire platform; only the home hero uses the uploaded branch photo (`retouched_H1A6720.jpg`) — no black border.
- **Titles are static**. No motion on headings anywhere. Only ultra-subtle fades on lists / cards on scroll.
- **Spacing**: very generous. Editorial whitespace, never dense.

### Color tokens (oklch in `src/styles.css`)

- `--background`: warm off-white `oklch(0.985 0.005 80)`
- `--foreground`: deep ink `oklch(0.22 0.02 60)`
- `--muted`: warm beige `oklch(0.94 0.01 75)`
- `--muted-foreground`: `oklch(0.5 0.02 60)`
- `--primary`: deep sage / olive `oklch(0.42 0.04 145)`
- `--primary-foreground`: `oklch(0.985 0.005 80)`
- `--accent`: warm terracotta `oklch(0.66 0.12 40)` (used very sparingly, e.g. verified badge, tag highlight)
- `--secondary`: soft sand `oklch(0.92 0.02 75)`
- `--border`: `oklch(0.9 0.01 75)`
- `--ring`: matches primary
- Dark mode included but the product is light-first.

### Typography

- **Display / titles**: a refined humanist serif (e.g. Cormorant Garamond or Fraunces) — thin to medium weight, large sizes, tight tracking.
- **Body / UI**: a quiet humanist sans (Inter Tight or Söhne-style fallback), 15–16px.
- Hierarchy: H1 ~56px serif thin, H2 ~36px serif, body 16/1.7. All in Spanish first.
- Loaded via `@import` in `styles.css`; usage governed by tokens (`font-display`, `font-sans`).

### Layout primitives

- Max content width ~1180px, comfortable gutters (24/40/64).
- Cards: 1px border `--border`, 16px radius, no heavy shadows; on hover a subtle background lift (`bg-muted/40`).
- Buttons (extend shadcn variants):
  - `default` — sage primary, pill 9999px radius, height 44.
  - `outline` — border + foreground, same pill shape.
  - `ghost`, `link` — quiet underlines.
  - `whatsapp` — green tinted variant for the WhatsApp CTA only.
- Iconography: lucide, 1.25 stroke. Used sparingly.

### Reusable frontend components (`src/components/`)

- `layout/SiteHeader.tsx` — small wordmark "Mallorca Holística" left, nav: Inicio · Profesionales · Actividades · Terapias · Soy profesional · (Login). Transparent on home over the hero, white + bottom border elsewhere.
- `layout/SiteFooter.tsx` — quiet 3-column footer with disclaimer "Orientación informativa. No sustituye diagnóstico médico."
- `home/Hero.tsx` — full-bleed branch photo background (top section only), serif title "Encuentra tu bienestar en Mallorca", subtitle "Profesionales verificados en terapias naturales y complementarias", and the dual `SearchBar` floating on a white card.
- `search/SearchBar.tsx` — two combined inputs (Therapy/symptom autocomplete + Municipality dropdown with "Cerca de mí" + "Toda Mallorca") and a primary "Ver profesionales" button. Two modes: classic (form) and conversational (textarea + chips).
- `search/SymptomPrompt.tsx` — "Cuéntanos cómo te sientes…" textarea with example chips (Me duele la espalda, Tengo ansiedad, Estoy pasando por un duelo, Necesito parar, Dolores crónicos, Equilibrio emocional, Me siento deprimido).
- `home/StartHere.tsx` — three large editorial cards: Profesionales / Actividades / Descubrir terapias.
- `home/TrustBlock.tsx` — "Profesionales en los que puedes confiar" with three icons.
- `home/Testimonials.tsx` — quiet quote carousel, neutral initials avatars, generous gaps.
- `therapist/TherapistCard.tsx` — photo, name, especialidad, location, modality, top 3–5 help-area tags, "Ver perfil" link. Used in lists.
- `therapist/TherapistProfile.tsx` — full profile: header (photo, name, verified badge with hover tooltip "Perfil verificado por Mallorca Holística…", years exp), 5 static stars + "Opiniones verificadas próximamente", frase clave, action block ("Solicitar sesión" if `link_reserva`, "Hablar con {nombre}" → WhatsApp prefilled message), Sobre mí, Te acompaño en (tag pills), Sesiones (optional), "Ver formación y trayectoria" expandable, MAP via leaflet.
- `therapist/VerifiedTooltip.tsx`.
- `therapy/TherapyList.tsx` — alphabetical A–Z anchored list, no images.
- `therapy/TherapyPage.tsx` — sections: Qué es / Cómo funciona / En qué puede ayudar / Cómo es una sesión / Nota importante / CTA "Ver profesionales de X" (or fallback message).
- `activities/ActivityCard.tsx` — date chip (05 ABR), image, title, location, price, "Más información".
- `dashboard/*` — sidebar shell, stat tiles ("Tu perfil ha aparecido en 84 búsquedas este mes"), profile editor, activity manager, plan card, verification status.
- `ai/EmpatheticIntro.tsx` — renders the AI's opening line above results ("Gracias por compartirlo. Aquí tienes personas y propuestas que pueden acompañarte.").
- `ui/MapPreview.tsx` — leaflet wrapper, lazy client-only.
- `ui/PlanBadge.tsx`, `ui/Tag.tsx`.

### Routes (TanStack Start, file-based) — every public route gets unique `head()` SEO

Public:

- `/` Home — hero + dual search + symptom chips + Empieza por aquí + trust + testimonials.
- `/profesionales` — filterable list. Filters: therapy, municipality (Cerca de mí / Toda Mallorca / alphabetical), modality (presencial/online), sort.
- `/profesionales/$slug` — therapist profile.
- `/buscar` — conversational search results (`?q=...`); shows AI intro line + ranked cards.
- `/terapias` — A–Z guide.
- `/terapias/$slug` — therapy page.
- `/actividades` — agenda by date.
- `/actividades/$id` — activity detail.
- `/confianza` — verification explanation.
- `/planes` — Presencia / Profesional / Centros + Founding Members.
- `/soy-profesional` — landing for pros + signup CTA.
- `/login`, `/registro`.

Authenticated `_authenticated/`:

- `/dashboard` (overview), `/dashboard/perfil`, `/dashboard/actividades`, `/dashboard/verificacion`, `/dashboard/plan`.

Admin `_authenticated/_admin/`:

- `/admin/verificaciones`, `/admin/terapias`, `/admin/profesionales`, `/admin/actividades`.

API public routes (`src/routes/api/public/`):

- `POST /api/public/track` — analytics events (`view_profile`, `click_reserva`, `click_whatsapp`).

### Responsive

- Mobile-first (the user often previews at ~1000px). Hero collapses to stacked, dual search stacks vertically, header turns into a sheet menu, profile becomes one column with sticky bottom action bar (Solicitar sesión / WhatsApp).

### Accessibility & SEO

- Semantic HTML, single H1 per page, aria-labels on icon buttons, focus rings via `--ring`, color contrast AA.
- Per-route `head()` with title <60 chars and meta description <160 chars; OG tags; JSON-LD `LocalBusiness`/`MedicalBusiness` for therapist pages; canonical tags.
- Lazy-load images, `aspect-ratio` to prevent CLS.

### Frontend libraries to add

- `react-leaflet` + `leaflet` (map, free, no key).
- `@tanstack/react-query` (already installed) for data fetching.
- `framer-motion` only for ultra-subtle list/card fades (NOT titles).
- `react-markdown` for therapy guide content.
- Google Fonts via `<link>` in root head.

---

## 2. Conversational symptom search (the differentiator)

1. User types a phrase ("estoy ansioso") or taps a chip.
2. `searchBySymptom` server function calls Lovable AI Gateway (Gemini, free promo) with: the phrase + the catalog of `help_areas` and `therapies`. The model returns JSON: `{ intro: string, matched_help_areas: string[], suggested_therapies: string[] }`.
3. Backend queries verified therapists whose `help_areas` overlap; ranks by plan tier (Profesional/Centros boosted), verified status, modality match, then proximity (if location given).
4. `/buscar` renders the AI intro + ranked therapist cards + "También puede ayudarte: [therapy chips]".
5. Fallback: keyword overlap if AI fails. Phrases stored anonymously in `ai_search_queries` to refine the catalog.

---

## 3. Data model (Lovable Cloud / Postgres, RLS on every table)

- `profiles` (user_id, full_name, lang).
- `user_roles` (user_id, role enum: admin/professional/user) + `has_role()` security-definer function.
- `therapists` (slug, full_name, photo_url, headline, especialidad, subespecialidades[], municipality_id, modalities[], years_exp, verified, frase_clave, sobre_mi, formacion, experiencia, link_reserva, whatsapp, lat, lng, plan_id, status).
- `centers` (analogous).
- `therapies` (slug, name, que_es, como_funciona, ayuda_en[], como_es_sesion, nota).
- `therapist_therapies` (m:n).
- `help_areas` catalog (Ansiedad, Estrés, Dolor de espalda, Duelo, Burnout, Insomnio…).
- `therapist_help_areas` (m:n) — drives symptom search.
- `municipalities` — full Mallorca list seeded.
- `sessions` (therapist_id, name, duration, price).
- `activities` (title, date, location, price, description, organizer_id, image_url).
- `plans` (Presencia, Profesional, Centros + Founding variants).
- `subscriptions` (user_id, plan_id, status, founding_member, started_at).
- `verification_documents` (therapist_id, type, file_url, status).
- `analytics_events` (type, target_id, anon_session, created_at).
- `ai_search_queries` (phrase, matched_areas[], created_at).

Storage buckets: `therapist-photos` (public), `verification-docs` (private), `activity-images` (public).

---

## 4. Plans, verification & business rules

- Three plans seeded with feature flags: `priority_search`, `extended_profile`, `unlimited_activities`, `stats_advanced`, `cta_buttons`. Search ranking honors them.
- Founding Members modeled as discounted price variant on the same plan.
- Verification flow: pro uploads docs in dashboard → admin reviews in `/admin/verificaciones` → toggles `verified=true`; the badge + tooltip then appear on the public profile.
- Stripe deferred unless you say otherwise — `/planes` shows pricing + a "Quiero unirme" waitlist form for MVP.

---

## 5. Tech stack & integrations

- TanStack Start v1, React 19, Tailwind v4, shadcn (already wired).
- Lovable Cloud: Postgres + Auth (email + Google) + Storage.
- Lovable AI Gateway (Gemini) for the conversational search.
- Map: `react-leaflet` + OpenStreetMap (no API key).
- Analytics via `/api/public/track`.

---

## 6. Build phases

1. **Foundations** — design tokens, fonts, header/footer, hero with the branch photo, dual search UI, symptom chips, "Empieza por aquí", trust block, testimonials, footer disclaimer. Cloud enabled. Seed therapies, municipalities, help_areas. Sample therapists.
2. **Therapists** — schema + RLS, results page with filters, profile page with map, WhatsApp/Calendly actions, verified tooltip, analytics tracking.
3. **Therapy guide** — `/terapias` A–Z and `/terapias/$slug`.
4. **Conversational AI search** — server function + `/buscar`.
5. **Auth + professional dashboard** — signup, edit profile, upload docs, manage sessions/activities, basic stats.
6. **Admin verification panel**.
7. **Activities agenda** + organizer flow.
8. **Plans page** + subscription state (Stripe optional).
9. **Polish** — SEO meta, JSON-LD, accessibility audit, i18n scaffold (ES default; EN/DE/FR can come later), responsive QA.

---

## 7. Quick confirmations before I start

- Stripe in MVP, or pricing page + waitlist for now?
- Languages at launch: only Spanish, or also EN/DE/FR from day 1?
- OK to default the AI search to Lovable AI (Gemini, free during promo)?

Hero photo is confirmed as `retouched_H1A6720.jpg` (placed on white, no black border, top section only). Once you approve, I'll start with phase 1.
