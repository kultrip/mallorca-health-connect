# 🌿 MALLORCA HOLÍSTICA · MASTER DEVELOPMENT ALIGNMENT & SYSTEM SPECIFICATION PLAYBOOK

> **Target File Designation:** `PLAN.md` / `AI_AGENTS_INSTRUCTIONS.md`  
> **System Context:** High-fidelity implementation, audit, and extension blueprint targeting the existing baseline at [mallorcaholistica.com](https://mallorcaholistica.com).

---

## 1. EXECUTIVE SYSTEM OBJECTIVE & EXISTING BASELINE GUARDRAILS

### 1.1 Core Mission

The primary objective of this playbook is to provide absolute structural alignment and technical specifications for AI Development Agents to execute code modifications, build new interface flows, and audit the existing deployment of **Mallorca Holística**. The platform functions as a verified ecosystem for complementary and integrative health practitioners, centers, and event organizers within Mallorca.

### 1.2 Baseline Guardrails & Contextual Awareness

- **Preserve and Audit:** A live v1.0 deployment exists at `https://mallorcaholistica.com`. All AI actions must cross-examine existing features against this specification. Do not destroy operational user databases or break route structures unless explicitly refactoring.
- **MVP Priorities:** Prioritize absolute form simplicity, verified manual validation hooks, linear layout patterns, robust validation, and deep compliance with local geographical and therapy taxonomies.
- **Language Consistency:** User-facing labels, categories, and buttons must adhere strictly to the Spanish copy outlined below, while backend variables and database architecture should follow English naming conventions.

---

## 2. SYSTEM WORKFLOWS & ROUTING STATE MACHINE

The application operates under three distinct subscription tiers and a separate authenticated role for end consumers (_Usuarios Particulares_). AI agents must enforce the exact routing sequences and structural rules defined below.

```
[Visitor] ──> Selects Plan ──> [Detail Page] ──> [Invitation / Open Routing] ──> [Register Account] ──> [Multi-Step Profile Wizard] ──> [Stripe SetupIntent (If Paid)] ──> [Manual Review Queue]
```

### 2.1 Plan Tier Topography

#### Tier 1: Plan Presencia (FREE)

- **Access Level:** Open signup from launch. No payment configuration requested.
- **Limitations:** Maximum 3 Specialties/Therapies; maximum 5 Areas of Specialization; single physical location; occasional activity/event posting subject to manual administrative review.
- **Call-to-Action (CTA) Label:** `Quiero formar parte`

#### Tier 2: Plan Profesional Verificado (€25/month incl. VAT)

- **Access Level (Beta Phase):** Restricted exclusively to the **Comunidad Fundadora** via manual verification link or waitlist collection. 40 total founder slots.
- **Founder Incentives:** 6 months entirely free from global launch date; locked lifetime promotional pricing of **€15/month** while subscription remains active.
- **Limitations:** Extended rich profile description; verified badge application; clickable contact methods; reviews enabled; gallery up to 5 images; up to 3 activities/events published monthly.
- **CTA Label:** `Quiero mi perfil verificado`

#### Tier 3: Plan Centros & Organizadores (€50/month incl. VAT)

- **Access Level (Beta Phase):** Restricted exclusively to the **Comunidad Fundadora** via manual verification link or waitlist collection. 10 total founder slots.
- **Founder Incentives:** 6 months entirely free from global launch date; locked lifetime promotional pricing of **€35/month** while subscription remains active.
- **Limitations:** Full organizational details; team/practitioner listing; multi-location capabilities; gallery up to 15 images; infinite activity/event publishing.
- **CTA Label:** `Quiero impulsar mi organización`

---

### 2.2 Functional Flow Definitions

#### Workflow A: Plan Presencia Sequence

1. **Plan Detail View:** Renders detailed copy, feature checklist, requirements, and a free price identifier.
2. **Account Provisioning:** User inputs Email, Password, and optional Mobile Number. Includes checkbox option: `[ ] Deseo recibir comunicaciones relacionadas con mi solicitud y mi participación en Mallorca Holística a través de WhatsApp.`
3. **Private Profile Wizard:** Direct entry to the 6-step Presencia registration form.
4. **State Transition (Pending Review):** User profile visibility flag set to `pending_verification`. Renders a confirmation notice: `"Tu solicitud ha sido recibida."`
5. **Admin Approval Hook:** Manual toggle flips profile status to `verified_public`.

#### Workflow B: Plan Profesional Verificado & Centros Sequences (Founder Invite-Only Beta)

1. **Public vs. Private Screen Discrimination:**
   - **Public Route (`/planes/profesional-verificado` or `/planes/centros`):** Renders beta Phase notification, explanation of the founding cohort, list of incentives, and two interaction choices: `👉 He recibido una invitación` or `👉 Quiero unirme a la lista de espera`.
   - **Private Link Route (`/invitacion/[unique-token]`):** Validates token lifecycle (active for 15 days from generation). Displays personalized welcoming screen: `🌱 Bienvenido a la Comunidad Fundadora`, details slot preservation terms, and displays the direct conversion button: `👉 Crear mi cuenta y continuar`.
2. **Account Provisioning:** Enforces authentication registration identical to Workflow A.
3. **Waitlist Fallback:** If public visitors click `👉 Quiero unirme a la lista de espera`, redirect to a unified collection form capturing: Name, Email, Mobile (Optional), and Profession/Organization. Saves record to `waitlist_registry`.
4. **Multi-Step Profile Wizard:** Captures rich tier form fields, file uploads, and specific regulatory checkboxes.
5. **Stripe SetupIntent Execution:** Initiates Stripe Customer object creation and executes a `SetupIntent` webhook pipeline to securely capture and tokenize payment methods without processing charges.
6. **State Transition (Under Review):** Sets account state status variable to `🟡 Solicitud pendiente`.

---

## 3. MULTI-STEP PROFILE DATA CAPTURE SCHEMAS

AI Agents must enforce exact schema compliance across all input vectors. The registration process must utilize step-by-step linear wizards.

### 3.1 Step-by-Step Step Mapping Matrices

| Step Number | Step Name (UI String)           | Presencia Form Fields                                                                                     | Profesional Verificado Fields                                                                                                                                                 | Centros & Organizadores Fields                                                                                                                                       |
| :---------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Paso 1**  | `👤 Información General`        | First/Last Name, Prof. Name (opt), Municipality, Island, Email, Phone, WA, Main Profile Image             | First/Last Name, Prof. Name (opt), Municipality, Island, Email, Phone, WA, Profile Image, Gallery (Max 3), Brand Logo (opt)                                                   | Org Name, Legal Entity Name, Org Type Selector, Municipality, Island, Email, Phone, WA, Logo Upload, Main Banner Image, Gallery (Max 9)                              |
| **Paso 2**  | `🌿 Actividad Profesional`      | Specialties (Max 3), Areas of Specialization (Max 5), Target Audience Selectors, Accompaniment Modalities | Specialties (Infinite + Sortable), Areas (Infinite + Sortable), Target Audience Selectors, Accompaniment Modalities                                                           | Rich Services List (Infinite + Sortable), Areas (Infinite + Sortable), Target Audience Selectors, Organized Activity Matrix                                          |
| **Paso 3**  | `📍 Consultas y Modalidades`    | Consultation Type Selectors, Single Primary Location Subform                                              | Consultation Type Selectors, Multi-Location Addition Subform                                                                                                                  | Multi-Location Addition Subform, Physical Facility Checklist, Dedicated Space Gallery (Max 15)                                                                       |
| **Paso 4**  | `🌟 Experiencia y Perfil`       | Tagline (Max 120 char), Short Bio (Max 500 char)                                                          | Tagline (Max 120 char), Full Presentation Text (Max 3000), Methodological Focus (Max 2000), Differentiators (Max 1000), Education/Training Repeatable Block, Languages Spoken | Tagline (Max 120 char), Who We Are (Max 3000), Mission Statement (Max 2000), Differentiators (Max 1000), Languages, Team Member Repeatable Array (Name, Role, Photo) |
| **Paso 5**  | `🌐 Redes y Enlaces`            | Website URL, Instagram Handle, WA Visibility Option, Email Visibility Option                              | Web URL, Instagram, Facebook, LinkedIn, YouTube, Calendly, Fresha, WA Business, Visibility Options                                                                            | Web URL, Instagram, Facebook, LinkedIn, YouTube, Booking Integration Anchors                                                                                         |
| **Paso 6**  | `🛡️ Verificación y Compromisos` | Deontological Code Acceptance, Statement of Truth, Consent Array                                          | Professional Liability Insurance Declaration, Diploma Upload (Min 1, Max 5), Deontological Acceptance, Statement of Truth, Consent Array                                      | Authorized Entity Declaration, Statement of Truth, Deontological Acceptance, Digital Signature Text Validation, Consent Array                                        |
| **Paso 7**  | `💳 Suscripción y Pago`         | _Bypassed_                                                                                                | Founder Stripe Gateway Capture Panel + SetupIntent Consent Form                                                                                                               | Founder Stripe Gateway Capture Panel + SetupIntent Consent Form                                                                                                      |

---

## 4. SYSTEM-WIDE STANDARDIZED TAXONOMIES

AI agents must inject these precise literal strings into drop-downs, select-menus, search indexing schemas, and relational database lookup structures.

### 4.1 Master Geographic Taxonomy: Municipios de Mallorca

All location forms must select strictly from the following 53 valid municipalities (sorted alphabetically):
`Alaró`, `Alcúdia`, `Algaida`, `Andratx`, `Ariany`, `Artà`, `Banyalbufar`, `Binissalem`, `Búger`, `Bunyola`, `Calvià`, `Campanet`, `Campos`, `Capdepera`, `Consell`, `Costitx`, `Deià`, `Escorca`, `Esporles`, `Estellencs`, `Felanitx`, `Fornalutx`, `Inca`, `Lloret de Vistalegre`, `Lloseta`, `Llubí`, `Llucmajor`, `Manacor`, `Mancor de la Vall`, `Maria de la Salut`, `Marratxí`, `Montuïri`, `Muro`, `Palma`, `Petra`, `Pollença`, `Porreres`, `Puigpunyent`, `Sa Pobla`, `Sant Joan`, `Sant Llorenç des Cardassar`, `Santa Eugènia`, `Santa Margalida`, `Santa Maria del Camí`, `Santanyí`, `Selva`, `Sencelles`, `Ses Salines`, `Sineu`, `Sóller`, `Son Servera`, `Valldemossa`, `Vilafranca de Bonany`.

### 4.2 Specializations & Therapies Taxonomy (_Especialidades y Terapias_)

- **Salud Integrativa y Bienestar:** `Alimentación Consciente`, `Dentista Holístico`, `Ginecología Holística`, `Ginecología Integrativa`, `Medicina Funcional`, `Medicina Integrativa`, `Medicina Ortomolecular`, `Medicina Tradicional China`, `Naturopatía`, `Nutrición Consciente`, `Nutrición Integrativa`, `Oftalmología Integrativa`, `Optometría Holística`, `Psicología Integrativa`, `Salud Bucodental`
- **Terapias Corporales y Manuales:** `Acupresión`, `Acupuntura`, `Drenaje Linfático Manual`, `Fasciaterapia`, `Feldenkrais`, `Kinesiología`, `Masaje Relajante`, `Masaje Terapéutico`, `Osteopatía`, `Pilates Terapéutico`, `Quiromasaje`, `Reflexología`, `Rolfing`, `Shiatsu`, `Técnica Alexander`, `Terapia Craneosacral`
- **Terapias Energéticas:** `Cromoterapia`, `Equilibrio Energético`, `Reiki`, `Sanación Energética`, `Sonoterapia`
- **Terapias Naturales:** `Aromaterapia`, `Ayurveda`, `Biomagnetismo`, `Fitoterapia`, `Flores de Bach`, `Homeopatía`, `Iridología`
- **Psicología, Emociones y Desarrollo Personal:** `Biodescodificación`, `Coaching Emocional`, `Coaching de Vida`, `EFT (Liberación Emocional)`, `EMDR`, `Eneagrama`, `Gestalt`, `Hipnosis`, `PNL (Programación Neurolingüística)`, `Terapia Emocional`, `Terapia Transpersonal`
- **Terapias Sistémicas y Relacionales:** `Constelaciones Familiares`, `Terapia de Pareja`, `Terapia Familiar`
- **Conciencia, Espiritualidad y Crecimiento Interior:** `Astrología Evolutiva`, `Astrología Terapéutica`, `Chi Kung (Qi Gong)`, `Meditación`, `Mindfulness`, `Registros Akáshicos`, `Relajación Guiada`, `Respiración Consciente`, `Yoga`, `Yoga Terapéutico`
- **Arte, Expresión y Movimiento:** `Arteterapia`, `Danzaterapia`
- **Animales:** `Comunicación Animal`, `Equinoterapia`
- **Espacios y Entorno:** `Feng Shui`
- **Otros:** `Otra especialidad o terapia (especificar)`

### 4.3 Health Issues & Focus Areas Taxonomy (_Áreas de Especialización_)

- **Bienestar Emocional y Desarrollo Personal:** `Adicciones`, `Ansiedad`, `Autoestima`, `Autoconocimiento`, `Burnout`, `Crecimiento Personal`, `Depresión`, `Duelo`, `Estrés`, `Fobias`, `Gestión Emocional`, `Propósito de Vida`, `Trauma`
- **Relaciones y Sexualidad:** `Fertilidad`, `Maternidad`, `Pareja`, `Rupturas`, `Sexualidad`
- **Salud Femenina y Hormonal:** `Ciclo Menstrual`, `Equilibrio Hormonal`, `Menopausia`, `Salud Femenina`
- **Sueño y Energía:** `Fatiga`, `Insomnio`, `Vitalidad`
- **Alimentación y Digestión:** `Alimentación`, `Digestión`, `Intolerancias`, `Microbiota Intestinal`, `Pérdida de Peso`
- **Dolor y Sistema Musculoesquelético:** `Dolor Articular`, `Dolor Cervical`, `Dolor Crónico`, `Dolor de Cabeza`, `Dolor de Espalda`, `Dolor Muscular`
- **Salud Física:** `Alergias`, `Cardiovascular`, `Circulación`, `Inmunidad`, `Inflamación Crónica`, `Piel`, `Respiratorio`, `Salud Bucodental`, `Urinario`, `Visión`
- **Neurodiversidad:** `Altas Capacidades`, `Autismo (TEA)`, `Discalculia`, `Dislexia`, `Hipersensibilidad`, `Procesamiento Sensorial`, `TDAH`, `Trastornos del Aprendizaje`
- **Infancia y Adolescencia:** `Adolescencia`, `Crianza`, `Infancia`
- **Salud Cognitiva y Neurológica:** `Alzheimer`, `Deterioro Cognitivo`, `Estimulación Cognitiva`, `Memoria`, `Parkinson`, `Salud Neurológica`
- **Procesos de Salud Complejos:** `Cáncer y Procesos Oncológicos`, `Enfermedades Autoinmunes`, `Fatiga Crónica`, `Fibromialgia`
- **Rendimiento y Hábitos:** `Hábitos Saludables`, `Preparación Mental`, `Rendimiento Deportivo`
- **Espiritualidad y Conciencia:** `Desarrollo Espiritual`, `Espiritualidad`, `Expansión de Conciencia`, `Meditación`
- **Animales y Comportamiento:** `Bienestar Animal`, `Comportamiento Animal`
- **Espacios y Entorno:** `Feng Shui`, `Hogar y Espacios`
- **Otros:** `Otro (especificar)`

---

## 5. TECHNICAL SYSTEM INTEGRATIONS & EDGE-CASE ENGINEERING

### 5.1 Stripe Payment Setup Pipeline

1. Upon form submission for paid tiers, the frontend freezes and sends data payload validation tokens to backend controllers.
2. The backend creates a Stripe Customer object if none exists for the authenticated ID.
3. Generate a Stripe `SetupIntent` instance passing parameters to allow subsequent off-session recurring usage.
4. Render Stripe Elements secure fields container onto Step 7 UI context.
5. On customer verification success, save the generated Stripe PaymentMethod ID string anchor token directly to the internal user metadata attributes file.
6. **Zero-Charge Rule:** No charge must be processed immediately. Set up a deferred billing structure matching the global configure parameters (`global_official_launch_date`). The free 6-month promotional trial period starts from that specific future deployment parameter.

### 5.2 Session Lifecycle & Authentication Security Patch

To resolve critical security exceptions found on traditional web applications (such as unhandled blade routing variable exceptions where state authentication is lost but routes keep rendering), implement an explicit session checkpoint script:

- **Automatic Eviction Rule:** Track active state. If a user completely exits the application context domain or closes tab instances, configure strict session token purging or short-duration JWT validation lifecycles.
- **Error Prevention:** Enforce validation layers ensuring that if runtime variable evaluations (such as `authorized` or `user_profile` vectors) are blank, the engine forces a redirection loop break directly back to the root gateway login component page with session errors cleanly caught.
- **UI Features:** Include an explicit input show/hide mechanism ("ojito") directly mapped onto password inputs for user utility across all interfaces.

### 5.3 Double-Sided Role Provisioning: End Consumers (_Usuarios Particulares_)

The architecture must implement a distinct option during registration or a clear separation panel:

- **Separation Matrix:** Create a distinct login/registration switcher tab: `[ Thérapeute / Professional ]` vs. `[ Particulier / Client Context ]`.
- **Private Review Controls:** Authenticated _Usuarios Particulares_ gain access to post qualitative reviews on paid member profiles.
- **Review Guardrails:** Review subforms collect structural metric vectors: `Prise de contact`, `Ponctualité`, `Qualité de l'accueil`, `Qualité de la séance` using a 1-5 scalar system alongside a raw comment text area field restricted to a maximum of 650 characters.

### 5.4 Operational Messaging & Notification Engine

#### Primary Channel: Email Delivery Service (Transactional Trigger Scenarios)

- Successful Account Creation Core Setup token verification link.
- Confirmation message stating application submission package is received.
- Dynamic notice requests for supplementary form artifacts or missing training diplomas.
- Verification approval validation notice or formal rejection context letters.
- Payment structure update receipts linked directly via Stripe webhooks.

#### Supplementary Channel: Manual WhatsApp Notification Playbook

- Initial Founder Cohort invitations containing unique alphanumeric tracking tokens.
- Automated reminder checks at exactly **Day 10** for incomplete slots.
- Ultimate hard ultimatum alerts at exactly **Day 14** before unlocking slots back to the public pool.

### 5.5 Activity and Event Publishing Guardrails

- **Form Requirements:** Captures Title, Description, Date, Time, Location/Address, Category, Feature Image asset, and external booking URL anchor link.
- **Publishing Volume Threshold Matrix:**
  - **Plan Presencia:** Occasional visibility entries, deactivated default, requiring custom administrative review unlock actions.
  - **Plan Profesional Verificado:** Strict capped limit of up to 3 activities published within a single month timeframe window.
  - **Plan Centros & Organizadores:**Capped at infinite volume allocations.

---

## 6. ADMINISTRATIVE CONTROL MANAGEMENT PANELS

The admin layout configuration module remains independent and handles structural validation queues:

1. **User Request Management Subsystem:** Renders filter grids separating user registration application bundles into explicit columns: `Solicitudes Pendientes`, `Aprobadas`, and `Rechazadas`.
2. **Activity Processing Queue:** Validation section for events posted by members before they are injected into live public query spaces.
3. **Founder Tracker Monitor Dashboard:** Track and manage the founding cohort slots:
   - `Invitación enviada` -> Tracking token life span parameters.
   - `Cuenta creada` -> Basic credentials created.
   - `Solicitud recibida` -> Completed registration data submitted.
   - `Fundador aprobado` -> Final verified active slot status.
   - `Plaza liberada` -> Token expired or slot rejected.
4. **Unified Configuration Constants Module:** Renders an environment configuration variables panel mapping fields like `global_official_launch_date` (e.g., `2026-08-01`). This parameter drives all billing calculation offsets and free-trial end dates across the platform.

---

## 7. AI AGENT IMPLEMENTATION CHECKLIST

AI development agents must complete the following deployment checks sequentially:

- [ ] Verify that all user-facing front-end components render exactly matching Spanish text requirements.
- [ ] Ensure that selecting a municipality pulls strictly from the 53 validated Mallorcan names list.
- [ ] Enforce the proper maximum caps on tags when processing Plan Presencia submissions (3 therapies, 5 areas max).
- [ ] Confirm that Stripe gateway SetupIntents run under free tokenization actions and that initial subscription offsets pull from the central launch calendar target date parameter.
- [ ] Audit application layouts to ensure password visibility toggles exist on all custom secure inputs.
- [ ] Verify that unauthenticated route exceptions are caught before rendering variables inside views.
