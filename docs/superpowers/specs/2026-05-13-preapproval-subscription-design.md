# Preapproval Subscription Design

## Decision

Mallorca Holistica will let professionals choose a paid plan before admin verification, but it will not create an active Stripe subscription or charge money until the professional is approved.

The implementation will use Stripe Checkout in `setup` mode for unverified professionals. This collects and saves a payment method for future off-session billing. After an admin approves the professional, the server creates the Stripe subscription using the saved payment method. Paid benefits unlock only after Stripe webhook events confirm the subscription is active.

## Why This Model

Stripe manual capture is designed for short-lived payment holds. Online card authorizations usually expire after a few days, which is too fragile for an admin review process. A setup-mode Checkout session gives the intended user experience without risking expired holds or captured payments for rejected professionals.

## User Flow

1. A professional creates or opens their dashboard.
2. The professional may choose Free, Profesional, or Centros.
3. If they choose Free, no Stripe flow is required.
4. If they choose Profesional or Centros before verification, Stripe Checkout collects the payment method only.
5. The dashboard shows the paid plan as pending approval.
6. The admin reviews the professional request.
7. If approved, the app creates the Stripe subscription for the pending paid plan.
8. Stripe webhook updates the therapist subscription fields and `plan_id`.
9. Public paid benefits are available only when the profile is verified/published and the subscription is active.
10. If rejected, no subscription is created and no charge is made.

## Data Model

Add pending plan fields to `therapists`:

- `pending_plan_id`: selected paid plan waiting for verification.
- `pending_plan_slug`: convenience snapshot for UI/status.
- `stripe_setup_intent_id`: latest setup intent completed from Checkout.
- `stripe_payment_method_id`: saved default payment method to use after approval.
- `stripe_pending_checkout_session_id`: latest setup-mode Checkout session.
- `subscription_activation_error`: admin-visible message if subscription creation fails after approval.

Existing active subscription fields remain the source of truth for benefits:

- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_price_id`
- `subscription_status`
- `plan_id`

## Backend Changes

`createCheckoutSession` will branch by verification status:

- Verified and published professionals choosing a paid plan use existing subscription Checkout.
- Unverified/pending professionals choosing a paid plan use setup-mode Checkout.
- Unsupported/free plan slugs are rejected by this function; Free remains a local/database choice.

The Stripe webhook will handle:

- `checkout.session.completed` for `mode = setup`:
  - store `stripe_customer_id`
  - store `stripe_setup_intent_id`
  - retrieve and store the setup intent payment method
  - store `pending_plan_id` and `pending_plan_slug`
  - set the Stripe Customer default payment method
- existing subscription events:
  - continue updating active subscription state and active `plan_id`

`approveProfessionalRequest` will:

- mark the professional verified/published as it does now
- if a paid pending plan and saved payment method exist, create a Stripe subscription
- clear `subscription_activation_error` on success
- store a readable `subscription_activation_error` if Stripe subscription creation fails
- leave verification approval successful even if billing activation fails, so the admin can retry or contact the professional

## Dashboard Changes

`/dashboard/billing` will no longer block paid plan selection for unverified professionals.

Unverified paid-plan state:

- Buttons say “Elegir y dejar preparado”.
- Success copy says the payment method is saved and the subscription starts after approval.
- Current plan area shows “Pendiente de aprobación” when `pending_plan_id` exists and no active subscription exists.

Verified paid-plan state:

- Existing active subscription and portal behavior remains.
- If no active subscription exists, checkout can create a subscription immediately.

## Benefit Rules

No public paid feature changes:

- Direct contact still requires `verified = true`.
- Direct contact still requires `status = 'published'`.
- Direct contact still requires `subscription_status = 'active'`.
- Direct contact still requires a paid plan slug.

This prevents saved payment methods or pending plans from unlocking public benefits.

## Error Handling

If setup-mode checkout completes but webhook processing fails, the dashboard can offer retry by creating another setup session.

If admin approval succeeds but Stripe subscription creation fails, the profile remains approved. The error is stored in `subscription_activation_error`, and the professional can return to billing to retry payment setup or the admin can follow up.

## Documentation Updates

Update `README.md`, `CONTEXT.md`, `PLAN.md`, and `SKILL.md` so future agents understand:

- Paid plan selection can happen before verification.
- Preapproval paid plans collect a payment method, not a charge.
- Active paid benefits still come only from webhook-confirmed active subscriptions.

## Self-Review

- No contradiction with the existing verification rule: admin verification still controls legitimacy and public profile approval.
- No contradiction with subscription benefits: pending paid plans do not unlock benefits.
- Stripe behavior is explicit: setup mode before approval, subscription mode after approval.
- Scope is focused on subscription timing and does not include the professional profile editor or admin analytics.
