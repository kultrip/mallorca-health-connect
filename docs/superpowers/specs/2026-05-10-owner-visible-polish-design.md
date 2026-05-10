# Owner-Visible Polish Design

## Goal

Make the current public Spanish MVP feel materially closer to Nadège's latest comments in `comentarios-nadege`, without taking on the larger route rename, registration/dashboard, payment, or full content-library work.

## Source Of Truth

For this pass, the latest owner comments in `comentarios-nadege` override older architecture notes when there is a conflict.

Key decisions:
- Mallorca Holística is not an internal booking marketplace in the MVP.
- The public experience should feel human, calm, clear, professional, and warm.
- Visitors do not have accounts in the MVP.
- Therapist contact is plan-aware: direct contact/reservation is a visible conversion feature for paid plans, while free profiles keep a lighter presence unless the owner confirms otherwise.
- English route names are deferred to a later pass.

## Scope

### Hero

Use Nadège's preferred branch/plant image, `retouched_H1A6720.jpg`, as the homepage hero image. The hero remains the top visual signal, while the rest of the page stays clean and light.

### Conversational Search

Keep the current conversational search entry point, but simplify the result tone. The result page should avoid a technical or diagnostic voice and use a short warm intro such as:

> Gracias por compartirlo. Aquí tienes personas y propuestas que pueden acompañarte.

Therapist recommendations should be visually foregrounded.

### Therapist Profile

Rework the public therapist profile page around the product document structure:

1. Header with photo, name, specialty, location, modalities, verification, and years of experience.
2. Static reviews placeholder: five stars and `Opiniones verificadas próximamente`.
3. Key phrase from `frase_clave`.
4. Action block:
   - Show `Solicitar sesión` only when `link_reserva` exists and the therapist's plan supports direct contact/reservation.
   - Show WhatsApp contact only when `whatsapp` exists and the therapist's plan supports direct contact.
   - WhatsApp opens `https://wa.me/...` with a prefilled message:
     `Hola {nombre}, te he encontrado en Mallorca Holística. Me gustaría saber cómo puedes ayudarme y consultar tu disponibilidad. Gracias`
   - Use supportive copy: `Consulta disponibilidad directamente con {nombre}`.
   - For free/presence profiles, keep the profile useful and human, but avoid presenting a paid-plan direct conversion block until the plan rules are confirmed.
5. `Sobre mí`.
6. `Te acompaño en` tags from help areas.
7. Optional sessions block only if session data exists.
8. Collapsible or clearly separated formation and trajectory content.
9. Optional map area only if coordinates exist.

The profile should feel personal and spacious, with contact actions easy to find.

### Plan-Aware Contact Interpretation

The subscription materials conflict slightly:

- Older MVP scope/mock data says `Contacto directo` is available in Free/Pro/Premium.
- The newer plan architecture says `Botón directo de contacto / reserva` belongs to `Profesional`, and `Centros & Organizadores` includes everything in `Profesional`.
- Meeting notes explicitly question whether direct email/phone contact should exist for Free.

For this implementation pass, treat the latest plan architecture as stronger than the older mock data:

- `Presencia` / free: profile, search presence, location, specialties, and basic information; no prominent direct contact/reservation block unless explicitly approved later.
- `Profesional`: direct contact/reservation block, richer profile presentation, highlighted tags, basic stats later.
- `Centros & Organizadores`: same direct contact/reservation capability as Profesional, plus activity/agenda emphasis later.

### Testimonials

Reduce the homepage testimonials to two or three natural testimonials from the Canva comments. Avoid decorative oversized quotation marks and keep the cards quiet, left-aligned, and human.

### Branding Cleanup

Replace remaining generated Lovable metadata with Mallorca Holística metadata.

## Tracking

The docs request profile view, external reservation click, and WhatsApp click tracking. The current schema does not contain a dedicated analytics table. This pass should not write analytics into an unrelated table.

If a clean dedicated table is small and low risk, add it in a migration and wire best-effort inserts. If that would expand the pass too much, leave clearly named handlers and defer persistent tracking to a dedicated analytics pass.

## Out Of Scope

- Route rename to `/professionals`, `/therapies`, and `/activities`.
- Therapy A-Z and therapy detail pages.
- Activity listing/detail pages.
- Professional registration flow.
- Professional/admin dashboard.
- Payment and Stripe.
- Internal booking calendar.
- Visitor accounts.
- Reviews backend.
- Full multilingual i18n.

## Verification

Run the available lint/build checks after implementation. Visually check the homepage and therapist profile at desktop and mobile sizes if the app can run locally.
