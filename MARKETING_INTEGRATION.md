# Marketing integration boundary

`lib/marketing-events.ts` is an internal, privacy-safe event stream. It has no
vendor ID, script loader, network transport, cookie, browser storage, or global
`dataLayer`. With no registered subscriber, event dispatch is a no-op.

## Event catalog

| Event | Allowed payload |
| --- | --- |
| `ovulation_calculator_view` | `placement: "dedicated_page"` |
| `ovulation_calculation_ready` | `source: "ovulation_calculator"` |
| `ovulation_lead_started` | `source`, `hasAttribution` |
| `ovulation_lead_submitted` | `source`, `marketingConsent`, `hasAttribution` |
| `ovulation_result_viewed` | `source: "ovulation_calculator"` |
| `weekly_live_spotlight_view` | `placement: "homepage"`, `questionsOpen` |
| `weekly_live_opened` | `placement: "dedicated_page"`, `questionsOpen` |
| `weekly_live_lead_started` | `source`, `hasAttribution` |
| `weekly_live_question_submitted` | `source`, `marketingConsent`, `hasAttribution` |
| `weekly_live_join_available` | `source: "weekly_live"` |
| `booking_cta_clicked` | `placement: "homepage_finale"` |

`hasAttribution` is a boolean only. UTM values, referrer host, and click IDs
remain part of the Lead submission path and must not be copied into events.

## Privacy rules

Never add contact details, age, city/region, menstrual dates, cycle length,
calculation results, question text, medical information, Lead IDs, session/user
identifiers, raw referrers, click IDs, meeting URLs, or join URLs to an event
payload. The type map is deliberately closed so feature code cannot pass an
arbitrary object.

## Future vendor adapter

A future GTM, GA4, Meta, Google Ads, or TikTok integration can call
`subscribeMarketingEvents` once in a dedicated client-only adapter and map these
internal events to that vendor's contract. That adapter is the only place for
vendor IDs/configuration (for example, a GTM container ID, GA4 measurement ID,
or pixel ID) and must make its own consent/policy decision before transmitting.
It must not require changes to calculator, Weekly Live, booking, or Lead code.

When a vendor is approved, keep its public identifier in deployment-managed
`NEXT_PUBLIC_*` configuration read only by that dedicated adapter; do not add a
required placeholder variable now and never place an identifier in an event
payload.

No external adapter is active today. Marketing consent is preserved with Lead
creation; it is not a substitute for future external-tracking consent policy.
