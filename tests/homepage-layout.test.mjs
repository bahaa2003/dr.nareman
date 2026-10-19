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

test("retains RTL document direction and responsive testimonial rules", () => {
  assert.match(source("app/layout.tsx"), /<html lang="ar" dir="rtl"/u);
  const styles = source("components/testimonials/TestimonialsSection.module.css");
  assert.match(styles, /@media \(max-width: 520px\)/u);
  assert.match(styles, /grid-auto-columns: minmax\(min\(78vw, 286px\), 340px\)/u);
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
