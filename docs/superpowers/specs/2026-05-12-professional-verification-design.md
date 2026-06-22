# Professional Verification MVP Design

**Date:** 2026-05-12

**Product:** Mallorca Holística

**Scope:** First version of the professional registration and verification pipeline.

---

## Goal

Allow a person to register as a professional, complete a professional profile, upload proof of professional legitimacy, submit the application for review, and let a Mallorca Holística admin approve or reject that request from the platform.

This first version focuses on **individual professionals only**. Centers, organizers, activity publishing, and advanced subscription permissions remain later phases.

---

## Core Decision

Professional verification and paid subscriptions are two separate pipelines:

1. **Verification pipeline**
   - Answers: is this person a legitimate professional?
   - Controlled by Mallorca Holística admins.
   - Required before a professional appears publicly.

2. **Subscription pipeline**
   - Answers: which paid benefits does this verified professional unlock?
   - Controlled by Stripe subscription status.
   - Changes permissions automatically after payment.

A professional can be verified and still be on the Free plan. Payment should unlock benefits, but payment should never replace admin verification.

---

## MVP User Flow

1. User registers.
2. User lands in professional onboarding.
3. User starts as a Free professional profile.
4. User fills required professional details:
   - public name
   - headline or short description
   - specialty/category
   - therapies or techniques offered
   - problems or needs they help with
   - municipality/location
   - modalities
   - languages
   - bio/about text
   - contact details
   - profile photo
5. User uploads verification documentation.
6. User submits the application.
7. Profile enters `pending` status.
8. Admin receives an email saying a new verification request was submitted.
9. Admin reviews the request in the admin backoffice.
10. Admin approves or rejects the request.
11. If approved:
    - profile becomes verified
    - profile becomes public
    - user receives a confirmation email
    - email invites user to subscribe for paid benefits
12. If rejected:
    - profile does not become public
    - user receives an email explaining the result or asking for changes

---

## Documentation Upload Decision

For MVP, verification documents should be simple and flexible:

1. **One required upload field**
   - Label: professional documentation
   - Purpose: diploma, certificate, proof of training, professional accreditation, or equivalent evidence.

2. **One optional extra upload field**
   - Purpose: any supporting document the professional wants to include.

Reasoning: holistic professionals may have very different types of proof. A rigid document checklist could block legitimate applicants too early.

---

## Status Model

The existing status model can support the MVP:

- `draft`
  - profile is being edited
  - not visible publicly

- `pending`
  - user submitted application
  - waiting for admin review
  - not visible publicly

- `published`
  - admin approved the profile
  - visible publicly

- `suspended`
  - profile removed from public visibility by admin

The existing `verified` boolean should be used alongside status:

- `verified = false` while draft or pending
- `verified = true` after admin approval

---

## Admin Flow

The admin backoffice should show pending professional requests with:

- professional name
- email or account identity
- specialty/category
- location
- submitted date
- profile photo
- profile fields
- uploaded verification documents
- approve action
- reject/request changes action

Approval should:

- set `therapists.status = published`
- set `therapists.verified = true`
- trigger a confirmation email to the professional

Rejection should:

- keep the profile private
- ideally return it to `draft` with a review note
- trigger an email to the professional

---

## Email Notifications

Transactional email provider decision:

- Use Resend for MVP transactional emails.
- Store the API key only in environment/secrets as `RESEND_API_KEY`.
- Do not expose the key to frontend code.
- Temporary testing sender address: `charles.santana@kultrip.com`.
- Temporary testing admin notification recipient: `charles.santana@kultrip.com`.
- Intended production sender address: `hola@mallorcaholistica.com`.
- Intended production admin notification recipient: `hola@mallorcaholistica.com`.
- Resend must verify the Mallorca Holística domain/address before production emails are switched to `hola@mallorcaholistica.com`.

### Professional Verification Email Environment

Local testing:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL=charles.santana@kultrip.com`
- `ADMIN_EMAIL=charles.santana@kultrip.com`

Production target after domain verification:

- `RESEND_FROM_EMAIL=hola@mallorcaholistica.com`
- `ADMIN_EMAIL=hola@mallorcaholistica.com`

The MVP needs two email events:

1. **Admin notification**
   - Trigger: professional submits verification request
   - Recipient: Mallorca Holística admin
   - Message: a new professional verification request is waiting for review
   - CTA: go to admin dashboard

2. **Professional approval notification**
   - Trigger: admin approves professional
   - Recipient: professional user
   - Message: welcome/confirmation that they are now part of Mallorca Holística
   - CTA: choose a subscription plan to unlock paid benefits

Optional but recommended:

3. **Professional rejection/request-changes notification**
   - Trigger: admin rejects or asks for changes
   - Recipient: professional user
   - Message: explain that the request was not approved yet and invite them to update information

---

## Subscription Decisions For Later Phase

Once verified, the professional starts as Free.

The paid subscription should not control whether the professional is legitimate. It controls benefits.

Known plan benefits:

- Free professional:
  - can have a public verified profile after approval
  - direct contact may remain limited

- Profesional subscription:
  - can show direct contact actions on their profile
  - main direct contact benefits are WhatsApp and/or Calendly/reservation link

- Centros / Organizadores subscription:
  - includes professional benefits
  - can create and publish activities such as courses, workshops, and events

Stripe should update permissions automatically through the webhook after payment or cancellation.

---

## Existing Repo Fit

The current repo already has useful foundations:

- `therapists.status`
- `therapists.verified`
- `plans`
- `verification-docs` private storage bucket
- `/onboarding`
- `/dashboard`
- `/dashboard/admin`
- `/dashboard/billing`
- Stripe fields on `therapists`
- Stripe webhook stub

The MVP should build on these instead of introducing a parallel registration system.

---

## Open Decisions

These do not block the Professional Verification MVP design, but should be decided before implementation:

1. Should rejection use a fixed message, an admin-written note, or both?
2. Should the profile be visible immediately after approval even if the user has no paid subscription?
   - Current decision: yes, as a Free verified profile.
3. Should contact fields be collected during onboarding even if hidden on Free profiles?
   - Recommended: yes, collect them early and reveal them only when permissions allow.

---

## Recommended First Implementation Slice

Build the Professional Verification MVP in this order:

1. Improve onboarding form fields and validation.
2. Store uploaded verification documents reliably.
3. Submit profile as `pending`.
4. Notify admin by email.
5. Build admin review queue.
6. Add approve/reject actions.
7. Send professional approval/rejection emails.
8. Keep subscription checkout as the next separate phase.
