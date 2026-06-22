# Admin Data Management Design

## Goal

Give Mallorca Holística admins one practical backoffice for operating the MVP without editing Supabase manually.

## Scope

This pass extends the existing admin dashboard into an operations console.

It covers:

- professional review and management
- therapy guide data management
- help area and keyword management
- activity management
- plan/subscription overview
- admin email center for professional communication

This pass does not build a full CMS, CRM, internal inbox, newsletter product, or advanced automation system.

## Current Starting Point

Existing admin routes:

- `/dashboard/admin`: pending professional approval/rejection
- `/dashboard/admin/analytics`: platform analytics

Existing dashboard capabilities:

- professional profile editor at `/dashboard`
- subscription/billing at `/dashboard/billing`
- admin role detection in `src/routes/dashboard.tsx`
- Resend email utilities for verification flow
- Supabase service functions for professional approval/rejection

## Information Architecture

Keep admin work inside `/dashboard/admin` as a tabbed operations console.

Admin tabs:

1. `Solicitudes`
   - pending professional verification requests
   - keeps the current approval/rejection workflow

2. `Profesionales`
   - list/search/filter professionals
   - open an edit form for one professional
   - update public/admin profile fields
   - inspect subscription and verification state

3. `Terapias`
   - list/create/edit therapy guide entries

4. `Necesidades`
   - list/create/edit help areas and keywords used by conversational search

5. `Actividades`
   - list/create/edit activities
   - admin can create/edit activities regardless of professional subscription

6. `Planes`
   - read-only plan and subscription overview for MVP
   - Stripe/webhook remains the source of truth for paid benefits

7. `Emails`
   - send individual or bulk emails to professionals
   - choose recipients, write subject/message, confirm, send, log

`/dashboard/admin/analytics` remains a separate admin analytics page linked from the dashboard sidebar.

## Editing Pattern

Use table/list plus edit form.

Do not use inline table editing for complex records in this MVP.

Reasons:

- professionals and therapies have many fields
- mistakes are easier to avoid in a focused form
- existing UI already uses form-based dashboard editing
- forms can show validation and save state clearly

The UI should feel operational and dense enough for repeated admin use. Avoid landing-page sections, oversized hero treatments, nested cards, or decorative UI.

## Admin Access

All admin screens require:

- authenticated Supabase user
- `user_roles.role = admin`

Client-side route guards are useful for UX, but admin mutations must be enforced server-side with `requireSupabaseAuth` plus an admin role check.

RLS policies may allow admin reads/writes where already configured, but sensitive writes should use TanStack server functions with `supabaseAdmin`.

## Professionals Management

Admin can:

- search by name, email, specialty, city/location
- filter by status:
  - draft
  - pending
  - published
  - suspended
- filter by verification:
  - verified
  - not verified
- filter by plan/subscription:
  - free/no active subscription
  - profesional
  - centros
  - pending paid plan
- open/edit one professional

Editable fields for MVP:

- full name
- headline
- phrase/frase clave
- specialty/especialidad
- subespecialidades
- about/sobre mí
- experience
- training
- languages
- modalities
- public email
- phone
- WhatsApp
- website
- reservation link
- public address
- city/municipality
- `lat`
- `lng`
- status
- verified flag
- therapy links
- help area links

Read-only/inspect fields:

- user id
- Stripe customer id
- Stripe subscription id
- subscription status
- plan
- pending plan
- verification document names/paths
- created/updated timestamps

Admin should not manually fake a paid subscription in this pass. Public paid benefits continue to depend on Stripe webhook-confirmed state.

## Therapy Management

Admin can list/create/edit therapies.

Editable fields:

- name
- slug
- category
- short description
- description
- benefits
- session description
- medical disclaimer
- empty professionals message
- detail sections

`detail_sections` may be edited as simple repeatable title/body blocks in the UI. If that is too large for the first implementation slice, a structured JSON textarea is acceptable for MVP as long as validation protects against invalid JSON.

## Help Area Management

Admin can list/create/edit help areas.

Editable fields:

- name
- slug
- description
- keywords

Keywords should be edited as one item per line or comma-separated text and saved as `text[]`.

Help areas are used by:

- professional dashboard matching links
- conversational `symptom-search`
- admin/professional analytics

## Activity Management

Admin can list/create/edit activities.

Editable fields:

- title
- slug
- description
- starts at
- ends at
- location
- municipality
- price
- reservation link
- image URL
- status
- therapist/center association when available

Admin can create and publish activities regardless of subscription plan.

Professional self-service activity creation remains a later Activities MVP pass, except where existing structures already support it.

## Plan Overview

Admin can inspect:

- available plans
- Stripe price/product ids
- billing enabled flag
- number of professionals currently on each plan
- professionals with active, pending, canceled, or errored subscription state

Admin cannot manually set active paid benefits from this screen in MVP.

If manual override is ever needed later, it should be designed as a separate, audited emergency action.

## Admin Email Center

Admins can send emails to professionals from the admin dashboard.

No email type taxonomy is needed.

### Individual Email

From a professional detail panel/form, admin can open an email composer prefilled with that professional as the only recipient.

Admin writes:

- subject
- message body

Then sends.

### Bulk Email

From the `Emails` tab, admin can select recipients using filters and/or checkboxes.

Recipient filters:

- all professionals with email
- pending professionals
- verified professionals
- published professionals
- by plan/free/profesional/centros
- by location/municipality when available

Admin writes:

- subject
- message body

Before sending, the UI shows:

- recipient count
- recipient preview
- confirmation action

The email should not send until admin confirms.

### Email Logging

Create `admin_email_logs`.

Fields:

- `id`
- `created_at`
- `sent_by_user_id`
- `therapist_id`
- `recipient_email`
- `recipient_name`
- `subject`
- `message`
- `resend_email_id`
- `status`
- `error_message`

Log one row per recipient.

Statuses:

- `sent`
- `failed`

If a bulk send partially fails, successful recipients remain `sent` and failed recipients are logged as `failed`.

### Email Sending

Use existing Resend configuration:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

Emails should be sent by a server function using `requireSupabaseAuth`, admin role check, and server-side Resend credentials.

The message body can be plain text with simple paragraph conversion to HTML for MVP.

## Server Functions

Create focused admin server functions rather than putting all writes directly in client components.

Suggested module:

`src/lib/admin-data-management.ts`

Functions:

- `assertAdmin(context.userId)`
- `saveAdminTherapist`
- `saveAdminTherapy`
- `saveAdminHelpArea`
- `saveAdminActivity`
- `sendAdminProfessionalEmail`

Read operations can use Supabase client where RLS permits admin reads. Writes and email sending should use server functions.

## Data Model

Add migration for:

- `admin_email_logs`

Optional migration updates may be needed if current RLS does not allow admin writes for therapies, help areas, and activities.

Prefer server functions with service role for admin writes in this pass to avoid broad public RLS changes.

## Validation

Server-side validation is required for admin writes.

Minimum validation:

- required names/titles are non-empty
- slugs are lower-case URL-safe strings
- email subject is non-empty
- email message is non-empty
- bulk email has at least one recipient and a reasonable max recipient count
- `lat` and `lng` stay inside valid numeric ranges
- JSON detail sections are valid if JSON textarea is used

## Error Handling

Admin save errors should show toast messages and keep form data intact.

Email sends should show:

- success count
- failed count
- failed recipient emails when any fail

Admin pages should fail closed:

- unauthenticated users go to `/login`
- non-admin users go back to `/dashboard`

## Verification

Automated checks:

- focused ESLint on new admin components/server functions/routes
- `npx tsc --noEmit`
- `npm run build`
- `npx supabase db push` for migrations

Manual smoke:

- non-admin cannot access admin console
- admin can see tabs
- admin can edit a professional field and see it persist
- admin can edit a therapy/help area
- admin can create/edit an activity
- admin can send one email to a professional
- admin can bulk send to a small selected set and see email logs

## Non-Goals

- full CMS with rich text editor
- internal messaging inbox
- scheduled email campaigns
- email type taxonomy
- marketing opt-in preferences
- unsubscribe handling
- manual paid subscription override
- Stripe customer/subscription mutation from admin screens
- professional self-service activity creation

## Self-Review

- The design includes the agreed email center without email type taxonomy.
- The design keeps Stripe as the source of truth for paid benefits.
- The scope is large but still one MVP admin operations console.
- Complex editing uses forms rather than inline table editing.
- Email sending is server-side and logged per recipient.
