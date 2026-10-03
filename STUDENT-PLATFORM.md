# Creator Group Student Journey migration plan

## A. Existing architecture
Next.js 16 / React 19 / TypeScript; locale routes /fa, /en, /tr and a catch-all international service renderer. Hostinger webpack aliases Cloudflare D1/R2 APIs to a Node SQLite/private-file adapter. SQL migrations are applied transactionally and retained in the private data directory. Existing lead forms, private tracking keys, email delivery, tuition documents, official campus tours and currency feeds remain intact. There is no existing student login or admin authentication to preserve.

## B. Database changes
Add university_content for editable records and a university_catalog identity table for foreign keys. Add student accounts and hashed session tokens; saved items; university comparisons; applications/journeys with stages; raw reviews, private verification evidence, student stories and ambassador opt-ins/questions; destination articles, living-cost and property records; assistance requests and provider booking references; audit logs and consented anonymous product events. Published student scores are calculated from approved verified raw reviews, never entered by administrators. No destructive migration of lead data.

## C. Routes
/[lang]/universities, /[lang]/universities/[slug], /[lang]/compare, /[lang]/match, /[lang]/search, /[lang]/saved, /[lang]/journey, /[lang]/hotels, /[lang]/flights, /[lang]/accommodation, /[lang]/airport-transfer, /[lang]/cities/[slug], /[lang]/guides/[country]/[topic], /[lang]/programs/[university]/[id], /[lang]/university-admin. Unprefixed routes redirect to Persian. Existing tuition-detail routes redirect to their university hub.

## D. Components
One UniversityExperience template; accessible lazy campus/media dialog; searchable programme cards; rule-based eligibility; grounded university assistant; contextual journey links; university comparison/match; student login/journey/saved interface; review/story forms and moderated display; destination guides/property results; no-code university and moderation editors.

## E. APIs
Public university catalogue/eligibility/assistant; student signup/login/logout and scoped journey/saved/review/story/ambassador mutations; authenticated admin content/moderation/stage updates; private evidence upload/read; public moderated media; contextual travel assistance. Server validates ownership, permissions, payload sizes and same-origin mutations. Secrets and verification documents never enter public records or source control.

## F. Integrations and environment
CREATOR_ADMIN_PASSWORD: high-entropy admin login password, configured only in Hostinger environment variables. CREATOR_DATA_DIR: persistent private directory already configured. HotelProvider / FlightProvider / RoutingProvider abstractions: unavailable by default; no prices, confirmations or itinerary schedules until a real provider is connected. AI provider optional; grounded knowledge lookup remains available without a paid provider. Existing PHP email delivery continues for lead requests. Accurate campus 360 tours are third-party official university viewers; headset support depends on those viewers. Geo information must have official provenance; unknown coordinates are not invented.

## G. Phases and validation
1. University CMS, reusable hub, real media, source tuition, routes/SEO. Build and validate schemas, no-source fallbacks, eligibility expiry, browser navigation.
2. Student sessions, saved items, application timeline and contextual travel assistance. Test ownership, login, duplicate writes, missing provider and unconfirmed-status rendering.
3. Review verification, aggregate methodology, stories/ambassador moderation. Test exclusion of unverified/rejected reviews, minimum group thresholds, private evidence access and pagination.
4. Destination articles/properties/provider abstractions/admin audit and contextual search. Publish only sourced content. Test source dates, empty data and no fabricated availability. Deploy via existing GitHub/Hostinger flow and verify production endpoints.

## Data methodology
Primary satisfaction: arithmetic mean of each 1–10 rating across published verified student/graduate reviews. Display scores only at >=5 verified reviews. Nationality insights require >=10 reviews per group; living-cost averages require >=10 reports with the same currency. Choose-again percentage uses non-null answers only and shows the denominator. Opinions remain explicitly student reported. Manual verification records admin action, evidence method, time and audit log; a signup is never a verified student.

## Running critical checks
After `CREATOR_HOSTINGER=1 npm run build:hostinger`, run `npm test` and `npm run test:platform`. The integration runner needs Python 3 and creates an isolated temporary SQLite database, random test-only admin password and localhost server; it never writes test reviews or accounts to production. It checks origin protection, student sessions, ownership, duplicate writes, unpublished reviews, verification decisions, score thresholds, eligibility fallbacks and provider-unavailable travel requests.

## Administration and media
Admin: `/fa/university-admin` (also `/en` and `/tr`). Configure `CREATOR_ADMIN_PASSWORD` with at least 16 characters. For managed Hostinger deployments that cannot persist custom process variables, the app can load the same environment variable from the owner-only `$CREATOR_DATA_DIR/creator.env` file using Node's environment loader. This file must have permission 0600 and must never be committed or put in a public directory. All uploads live under the private data directory. Public image URLs serve only administrator campus images or media from moderated verified reviews/stories. Evidence remains owner/admin only. The assistant currently performs verified-data retrieval and does not claim to run a generative AI model. Live booking providers are not configured.

No paid subscriptions, synthetic student reviews or fabricated accommodation records are seeded. University programmes whose source documents are image-only remain available as original PDF schedules until their records are verified. Atlas offer expiry and conflicting Medipol schedules remain visible.
