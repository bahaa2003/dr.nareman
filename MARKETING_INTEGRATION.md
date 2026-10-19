# Marketing integration boundary

`lib/marketing-events.ts` is an internal, privacy-safe event stream. It has no
vendor transport or subscriber, so event dispatch is a no-op. The public site
loads the approved GTM container separately in `components/analytics/PublicGtm.tsx`;
that loader does not subscribe to this stream or push application events/data to
`dataLayer`, and it is not rendered for `/admin` routes.

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

## Vendor boundary

Do not connect GTM, GA4, Meta, Google Ads, TikTok, or any other vendor adapter
to this stream without a separately reviewed privacy and consent decision. It
must not require changes to calculator, Weekly Live, booking, or Lead code.

Marketing consent is preserved with Lead creation; it is not a substitute for
future external-tracking consent policy.
