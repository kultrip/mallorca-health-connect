# 🌿 Mallorca Holística — Plan de Desarrollo

## 🎯 Current Stage & Milestone

The core administrative, onboarding, subscription, and directory workflows are complete. We have successfully set up the **Comunidad Fundadora (Founder Member Tier)** pricing structure, Stripe checkout trials, and direct communication features, as well as updating the core administrative destination email to route all platform requests to your chosen mailbox.

- **Platform Admin Email**: `mallorcaholistica11@gmail.com` (All notifications regarding new users, registrations, and verification requests default here).

---

## 📋 Roadmap & Feature Checklist

### 1. Comunidad Fundadora & Pricing

- [x] Create database schema migrations to add `is_founder`, `founder_price_monthly_cents`, and `founder_stripe_price_id` to plans/therapists.
- [x] Configure locked-in lifetime pricing forever (instead of 24 months limit):
  - **Professional Founder**: €15/month (normally €25/month).
  - **Center Founder**: €35/month (normally €50/month).
- [x] Setup Stripe checkout integrations with **6-month free trial (180 days)** at €0 cost for founder checkouts.
- [x] Integrate trial parameter in pre-approval (SetupIntent) checkout for deferred admin verification activation.
- [x] Display a premium "Miembro Fundador" card banner on the billing dashboard with 👑 accents.
- [x] Format pricing cards to highlight founder rates and strike through standard rates with a secure lock 🔒 badge.
- [x] Personalize call-to-action buttons for founding cohort checkouts.
- [x] Update landing page pricing copy to reflect "lifetime" rate guarantees (_para siempre_).

### 2. Free-Plan Profile Visibility

- [x] Grant direct contact phone visibility to Free-Plan ("Presencia") users.
- [x] Render a clean, standalone "Contacto directo" card on the public professional card displaying _only_ the clickable `Llamar` button when a phone is registered.
- [x] Ensure other direct channels (emails, external booking URLs, socials) remain securely locked behind paid tiers.

### 3. Messaging, Registration & Admin Core Updates

- [x] Configure system notification email default fallback to `mallorcaholistica11@gmail.com`.
- [x] Redirect all practitioner registration, onboarding, and manual document review notifications to the admin email.
- [x] Bypass default Supabase automated emails and send custom, fully-branded Mallorca Holística user signup confirmation emails.
- [x] Change onboarding and profile editors to make the WhatsApp field mandatory and the telephone field optional.

### 4. Code Integrity & Compilation

- [x] Validate TypeScript types across database entities.
- [x] Verify project builds and bundles with zero errors.

---

## 🛠️ Verification & Commands

You can run these commands in your workspace to run or check the code:

- **Run Local Dev Server**:
  ```bash
  npm run dev
  ```
- **Compile & Verify Production Build**:
  ```bash
  npm run build
  ```
- **Deploy Worker/Assets to Cloudflare**:
  ```bash
  npx wrangler deploy
  ```
