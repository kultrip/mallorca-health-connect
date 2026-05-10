# Owner-Visible Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the current Spanish public MVP closer to Nadège's latest owner comments with visible homepage, search-result, therapist-profile, testimonial, and metadata polish.

**Architecture:** Keep the existing TanStack Router/Supabase structure and Spanish routes. Add a tiny plan-access helper so the therapist profile can decide whether to show direct contact actions based on plan metadata. Avoid adding registration, dashboard, payment, reviews backend, route renaming, or full content-library work in this pass.

**Tech Stack:** React 19, TanStack Router/Start, TanStack Query, Supabase JS, Tailwind CSS 4, lucide-react.

---

## File Structure

- Modify `src/assets/hero-branch.jpg`: replace with Nadège's preferred `retouched_H1A6720.jpg` image bytes while keeping the existing import path.
- Modify `src/routes/__root.tsx`: replace generated Lovable metadata with Mallorca Holística defaults.
- Modify `src/routes/buscar.tsx`: simplify conversational result copy and keep therapist cards foregrounded.
- Modify `src/routes/profesionales.$slug.tsx`: rework the therapist profile layout and plan-aware contact actions.
- Modify `src/components/home/Testimonials.tsx`: reduce testimonials to three natural owner-provided quotes and soften card styling.
- Create `src/lib/plan-access.ts`: centralize paid-plan/direct-contact logic.

## Task 1: Hero Image And Metadata

**Files:**
- Modify: `src/assets/hero-branch.jpg`
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Replace the hero image with Nadège's preferred branch image**

Use the zip asset `MallorcaHolistica/comentarios-nadege/retouched_H1A6720.jpg` and replace `src/assets/hero-branch.jpg`.

Run:

```bash
cp /tmp/mallorca-holistica-docs/MallorcaHolistica/comentarios-nadege/retouched_H1A6720.jpg src/assets/hero-branch.jpg
```

Expected: `git status --short` shows `M src/assets/hero-branch.jpg`.

- [ ] **Step 2: Update root metadata**

In `src/routes/__root.tsx`, replace the root `head` metadata with:

```tsx
meta: [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "Mallorca Holística — Profesionales verificados de bienestar" },
  {
    name: "description",
    content:
      "Encuentra terapeutas y profesionales verificados en terapias naturales y complementarias en Mallorca.",
  },
  { name: "author", content: "Mallorca Holística" },
  { property: "og:title", content: "Mallorca Holística" },
  {
    property: "og:description",
    content:
      "Un espacio de confianza para encontrar profesionales verificados de bienestar en Mallorca.",
  },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
],
```

- [ ] **Step 3: Verify**

Run:

```bash
npm run build
```

Expected: build completes without TypeScript or Vite errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/assets/hero-branch.jpg src/routes/__root.tsx
git commit -m "feat: update hero image and site metadata"
```

## Task 2: Plan-Aware Contact Helper

**Files:**
- Create: `src/lib/plan-access.ts`

- [ ] **Step 1: Create helper**

Create `src/lib/plan-access.ts`:

```ts
type PlanLike = {
  slug?: string | null;
  name?: string | null;
  price_monthly_cents?: number | null;
} | null | undefined;

const paidPlanSlugs = new Set([
  "profesional",
  "professional",
  "pro",
  "premium",
  "centros",
  "centros-organizadores",
  "centers",
]);

export function planSupportsDirectContact(plan: PlanLike): boolean {
  if (!plan) return false;
  const slug = plan.slug?.toLowerCase();
  if (slug && paidPlanSlugs.has(slug)) return true;
  if (typeof plan.price_monthly_cents === "number" && plan.price_monthly_cents > 0) {
    return true;
  }
  return false;
}
```

- [ ] **Step 2: Verify**

Run:

```bash
npm run build
```

Expected: build completes without TypeScript errors.

- [ ] **Step 3: Commit**

Run:

```bash
git add src/lib/plan-access.ts
git commit -m "feat: add plan-aware contact helper"
```

## Task 3: Therapist Profile MVP Layout

**Files:**
- Modify: `src/routes/profesionales.$slug.tsx`

- [ ] **Step 1: Extend Supabase select**

In `src/routes/profesionales.$slug.tsx`, import `Info`, `Star`, and `ChevronDown` as needed from `lucide-react`, import `planSupportsDirectContact`, and extend the therapist query select to include plan data:

```ts
.select(
  "*, municipalities(name,slug), plans(slug,name,price_monthly_cents), therapist_therapies(therapies(slug,name)), therapist_help_areas(help_areas(slug,name))"
)
```

- [ ] **Step 2: Add profile helpers inside the file**

Add helpers near the bottom of `src/routes/profesionales.$slug.tsx`:

```tsx
function firstName(fullName?: string | null) {
  return fullName?.split(" ")[0] ?? "este profesional";
}

function whatsappHref(phone: string, name: string) {
  const number = phone.replace(/[^0-9]/g, "");
  const message = `Hola ${name}, te he encontrado en Mallorca Holística. Me gustaría saber cómo puedes ayudarme y consultar tu disponibilidad. Gracias`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
```

- [ ] **Step 3: Compute visibility and optional content**

Inside `Page`, after `helpAreas`, compute:

```tsx
const name = data.full_name ?? "";
const contactName = firstName(name);
const canShowDirectContact = planSupportsDirectContact(data.plans);
const hasContactActions = canShowDirectContact && (data.whatsapp || data.link_reserva);
const hasMap = data.lat != null && data.lng != null;
```

- [ ] **Step 4: Replace the article body**

Rework the rendered article to include:

- left photo column with static star review placeholder below photo
- right info column with specialty, name, verified tooltip-like `details`, location, modalities, years, phrase
- action block only when `hasContactActions`
- fallback muted note for non-paid/free profiles: `Este perfil forma parte del ecosistema Mallorca Holística. Pronto habrá más formas de contacto visibles según el plan del profesional.`
- `Sobre mí`
- `Te acompaño en` tags from help areas
- optional sessions block only if a future `sessions` array exists on `data`
- `Formación y trayectoria` in a simple `details` element when `formacion` or `experiencia` exists
- map placeholder only when `hasMap`

Use existing `Button`, `BadgeCheck`, `MapPin`, `MessageCircle`, `Calendar`, and `Globe` patterns. Do not add an internal calendar or reviews backend.

- [ ] **Step 5: Verify**

Run:

```bash
npm run build
```

Expected: build completes. No route or Supabase type errors.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/routes/profesionales.$slug.tsx
git commit -m "feat: polish therapist profile page"
```

## Task 4: Conversational Search Tone

**Files:**
- Modify: `src/routes/buscar.tsx`

- [ ] **Step 1: Simplify the AI result intro display**

In `src/routes/buscar.tsx`, replace the direct display of `data.intro` with a warm owner-approved lead that falls back cleanly:

```tsx
const warmIntro =
  data?.intro?.trim() ||
  "Gracias por compartirlo. Aquí tienes personas y propuestas que pueden acompañarte.";
```

Render `warmIntro` in the intro area when `data` exists. Keep the query text visible above it.

- [ ] **Step 2: Update empty state copy**

Use:

```tsx
Aún no tenemos profesionales que encajen con esto.
```

and:

```tsx
Estamos ampliando nuestra red con mucho cuidado. Prueba a explorar el directorio completo de profesionales.
```

- [ ] **Step 3: Verify**

Run:

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/routes/buscar.tsx
git commit -m "feat: soften conversational search results"
```

## Task 5: Testimonials

**Files:**
- Modify: `src/components/home/Testimonials.tsx`

- [ ] **Step 1: Replace testimonial data with three owner-provided quotes**

Use:

```ts
const testimonials = [
  {
    quote:
      "No conocía mucho este tipo de terapias y me daba un poco de respeto. La web me ayudó a entender mejor y elegir sin sentirme perdida.",
    name: "Elena",
    place: "Inca",
  },
  {
    quote:
      "Miré varias opciones antes de decidirme, y agradecí poder hacerlo con calma. Al final contacté con una terapeuta que encajaba mucho conmigo.",
    name: "Ana",
    place: "Binissalem",
  },
  {
    quote:
      "Me gustó poder ver quién estaba detrás de cada perfil. Eso me dio confianza para decidirme.",
    name: "Joana",
    place: "Palma",
  },
];
```

- [ ] **Step 2: Soften the card styling**

Use a responsive three-card grid:

```tsx
<div className="grid gap-8 md:grid-cols-3">
```

Use a quieter quote style:

```tsx
<blockquote className="text-sm leading-relaxed text-foreground/80">
  {t.quote}
</blockquote>
```

- [ ] **Step 3: Verify**

Run:

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/components/home/Testimonials.tsx
git commit -m "feat: refine homepage testimonials"
```

## Task 6: Final Verification

**Files:**
- No new files unless fixes are needed.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: lint completes without errors.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: build completes without errors.

- [ ] **Step 3: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite/TanStack dev server starts and prints a local URL.

- [ ] **Step 4: Browser check**

Open the local URL and check:

- Homepage uses the branch/plant hero.
- Homepage metadata no longer says Lovable.
- Conversational search results use short, warm copy.
- Therapist profile shows the new human layout.
- Paid plan therapists show contact actions when data exists.
- Free/presence therapists do not show the prominent direct contact block.
- Testimonials show three quiet, natural cards.

- [ ] **Step 5: Final status**

Run:

```bash
git status --short
```

Expected: only intended files changed, with `.superpowers/` still untracked unless deliberately ignored.
