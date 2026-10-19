import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = (path) => readFileSync(resolve(root, path), "utf8");

test("places testimonials directly after the About Doctor section", () => {
  const homepage = source("app/page.tsx");
  const about = homepage.indexOf("<AboutDoctor />");
  const testimonials = homepage.indexOf("<TestimonialsSection testimonials={testimonials} />");
  const services = homepage.indexOf("<Services />");

  assert.ok(about >= 0 && testimonials > about && services > testimonials);
});

test("retains RTL document direction and responsive testimonial carousel rules", () => {
  assert.match(source("app/layout.tsx"), /<html lang="ar" dir="rtl"/u);
  const styles = source("components/testimonials/TestimonialsSection.module.css");
  assert.match(styles, /@media \(max-width: 600px\)/u);
  assert.match(styles, /lightboxBackdrop/u);
  assert.match(styles, /prefers-reduced-motion/u);
});

test("keeps the urgent public-form UX checkbox-free and the calculator ungated", () => {
  const weeklyLive = source("components/weekly-live/WeeklyLiveExperience.tsx");
  const calculator = source("components/ovulation-calculator/OvulationCalculator.tsx");

  assert.match(weeklyLive, /Field label="البريد الإلكتروني"/u);
  assert.match(weeklyLive, /privacyDisclosure/u);
  assert.doesNotMatch(weeklyLive, /display-name|type="checkbox"|اختياري/u);
  assert.match(calculator, /privacyDisclosure/u);
  assert.doesNotMatch(calculator, /cycle-regularity|type="checkbox"|اختياري/u);
});

test("keeps the requested Weekly Live, calculator, WhatsApp, carousel, and GTM privacy contracts", () => {
  const weeklyLive = source("components/weekly-live/WeeklyLiveExperience.tsx");
  const weeklyStyles = source("components/weekly-live/WeeklyLiveExperience.module.css");
  const calculator = source("components/ovulation-calculator/OvulationCalculator.tsx");
  const homeCalculator = source("components/ovulation-calculator/OvulationCalculatorHomeCta.tsx");
  const testimonials = source("components/testimonials/TestimonialsSection.tsx");
  const adminTestimonials = source("components/admin/testimonials/AdminTestimonialsManager.tsx");
  const gtm = source("components/analytics/PublicGtm.tsx");

  assert.match(weeklyLive, /اسألي د\. ناريمان/u);
  assert.match(weeklyStyles, /calendarGlow/u);
  assert.match(weeklyStyles, /prefers-reduced-motion/u);
  assert.match(calculator, /<h1 id="ovulation-calculator-title">حاسبة التبويض<\/h1>/u);
  assert.match(calculator, /أيام الخصوبة/u);
  assert.match(calculator, /bookingFinale\.links\.whatsapp\.href/u);
  assert.match(calculator, /target="_blank" rel="noopener noreferrer"/u);
  assert.doesNotMatch(`${calculator}\n${homeCalculator}`, /دون حفظ أي بيانات|لا نقوم بحفظ البيانات/u);
  assert.match(testimonials, /setInterval/u);
  assert.match(testimonials, /5_000/u);
  assert.match(testimonials, /aria-roledescription="carousel"/u);
  assert.match(testimonials, /role="dialog"/u);
  assert.match(testimonials, /event\.key === "Escape"/u);
  assert.match(testimonials, /document\.body\.style\.overflow = "hidden"/u);
  assert.doesNotMatch(adminTestimonials, /type="checkbox"|ConfirmationFields|privacyConfirmed.*setPrivacy/u);
  assert.match(gtm, /GTM-TSKRVW47/g);
  assert.match(gtm, /pathname\?\.startsWith\("\/admin"\)/u);
  assert.match(gtm, /gtm\.js/u);
  assert.doesNotMatch(gtm, /trackMarketingEvent|healthContext|meetingUrl|phone|email/u);
});
