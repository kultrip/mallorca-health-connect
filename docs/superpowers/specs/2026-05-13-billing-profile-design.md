# Billing Profile Design

## Decision

Professionals can start paid Stripe flows without fiscal invoice details. Mallorca Holistica should support both formal juridic/professional billing identities and more informal professionals.

Billing/tax details are optional and should be requested only when the professional wants invoices/facturas with tax-identifying data.

## Optional Billing Fields

Collect these fields when the professional wants invoice/tax data on Stripe invoices:

- legal billing name
- tax ID type: NIF, NIE, CIF, or other
- tax ID value
- billing address line 1
- billing address line 2, optional
- billing city
- billing postal code
- billing country, default Spain

The professional profile location remains separate:

- public professional address
- public professional city
- optional `lat`/`lng`

Billing address is for invoices/facturas and Stripe customer data. Public profile address is for visitors and maps.

## Data Model

Create a dedicated `billing_profiles` table instead of adding more columns to `therapists`.

Fields:

- `id`
- `user_id`, unique, references auth user
- `therapist_id`, optional reference to therapists
- `legal_name`
- `tax_id_type`
- `tax_id_value`
- `address_line1`
- `address_line2`
- `city`
- `postal_code`
- `country`
- `stripe_customer_id`
- `created_at`
- `updated_at`

RLS:

- owner can select/insert/update their own row
- admin can select/update all rows
- no public access

## Stripe Sync

Before creating Checkout:

1. Load the authenticated professional.
2. Load their `billing_profiles` row, if it exists.
3. Create or reuse the Stripe customer.
4. If billing profile details are complete enough for fiscal invoice data, update the Stripe customer with:
   - `name`
   - `address`
   - metadata: user id, therapist id, tax id type, tax id value
5. Try to create/update Stripe tax ID where supported.
6. Continue to setup-mode checkout or subscription checkout.

If no billing profile exists, continue Checkout with the professional name/email already used on the Stripe customer.

If Stripe tax ID creation is rejected because the value/type is not accepted by Stripe, keep the local billing profile and store the tax ID in metadata. Do not block checkout on Stripe tax ID support unless customer creation itself fails.

## UI

Use `/dashboard/billing` as the billing home.

Add a billing profile card above the plan cards:

- shows whether invoice/fiscal details are present
- editable form for the required fields
- save button
- clear copy: “Estos datos se usan para facturas si necesitas datos fiscales. No se muestran en tu perfil público.”

Paid plan buttons are not disabled by missing billing/tax details.

If billing details are empty, show a quiet note:

> Puedes añadir datos fiscales si necesitas facturas con NIF/CIF/NIE.

## Invoice Access

Invoices/facturas come from Stripe, not from a custom PDF generator in the MVP.

Professionals with a Stripe customer can use the existing “Gestionar facturación” Customer Portal button to download invoices once Stripe has invoices available.

## Validation

Client and server validation only applies when the professional saves the optional billing profile:

- if any fiscal field is filled, legal name is required
- tax ID type and tax ID value must be saved together
- address line 1, city, postal code, and country should be saved together for invoice address completeness

Do not implement Spanish tax ID checksum validation in this pass. Keep the field flexible enough for NIF/NIE/CIF and non-Spanish billing identities.

## Success Criteria

- A professional can save optional billing/tax details from `/dashboard/billing`.
- Paid checkout works even when billing details are empty.
- If billing details exist, Stripe customer receives billing name/address metadata before Checkout.
- Public profile location remains separate from billing address.
- Free plan behavior is unchanged.

## Self-Review

- No contradiction with preapproval subscriptions: setup-mode checkout works with or without optional fiscal invoice details.
- No contradiction with invoices: Stripe remains the invoice source.
- Scope is focused on billing/tax profile and checkout gating, not full admin billing dashboards.
