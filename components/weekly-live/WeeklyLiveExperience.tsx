"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { getWeeklyLiveAttributionFromLocation, hasMarketingAttribution } from "@/lib/marketing-attribution";
import { trackMarketingEvent } from "@/lib/marketing-events";
import { getCurrentWeeklyLive, PublicWeeklyLiveApiError, submitWeeklyLiveQuestion } from "@/lib/public-api/weekly-live";
import { formatRiyadhDateTime } from "@/lib/riyadh-datetime";
import type { PublicWeeklyLive, PublicWeeklyLiveQuestionInput, PublicWeeklyLiveSubmissionResponse } from "@/types/public-weekly-live";

import styles from "./WeeklyLiveExperience.module.css";

type FormValues = {
  contactName: string;
  phone: string;
  email: string;
  displayName: string;
  age: string;
  region: string;
  city: string;
  question: string;
  consent: boolean;
  privacyNoticeAccepted: boolean;
  marketingConsent: boolean;
};
type FieldName = keyof FormValues;
type FieldErrors = Partial<Record<FieldName, string>>;

const emptyValues: FormValues = {
  contactName: "", phone: "", email: "", displayName: "", age: "", region: "", city: "", question: "",
  consent: false, privacyNoticeAccepted: false, marketingConsent: false
};

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

function validate(values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const contactName = values.contactName.trim();
  const displayName = values.displayName.trim();
  const region = values.region.trim();
  const city = values.city.trim();
  const question = values.question.trim();
  const age = Number(values.age);

  if (!contactName || contactName.length > 100) errors.contactName = "أدخلي اسم التواصل.";
  if (!values.phone.trim()) errors.phone = "أدخلي رقم الهاتف.";
  if (values.email.trim() && !isLikelyEmail(values.email.trim())) errors.email = "أدخلي بريدًا إلكترونيًا صحيحًا أو اتركيه فارغًا.";
  if (displayName.length < 2 || displayName.length > 80) errors.displayName = "أدخلي اسمًا أولًا أو اسمًا مستعارًا من حرفين إلى 80 حرفًا.";
  if (!/^\d+$/u.test(values.age) || !Number.isInteger(age) || age < 18 || age > 100) errors.age = "أدخلي عمرًا صحيحًا من 18 إلى 100.";
  if (!region || region.length > 80) errors.region = "أدخلي المنطقة.";
  if (!city || city.length > 100) errors.city = "أدخلي المدينة.";
  if (question.length < 10 || question.length > 2_000) errors.question = "اكتبي سؤالًا من 10 إلى 2000 حرف.";
  if (!values.consent) errors.consent = "الموافقة الخاصة بالسؤال مطلوبة لإرسال السؤال.";
  if (!values.privacyNoticeAccepted) errors.privacyNoticeAccepted = "يلزم تأكيد إشعار الخصوصية للمتابعة.";
  return errors;
}

function submissionMessage(error: unknown): { message: string; refresh: boolean } {
  if (error instanceof PublicWeeklyLiveApiError) {
    if (error.status === 404) return { message: "هذا اللقاء لم يعد متاحًا حاليًا.", refresh: true };
    if (error.status === 409) return { message: "تم إغلاق استقبال الأسئلة لهذا اللقاء.", refresh: true };
    if (error.status === 429) return { message: "تم إرسال عدد كبير من المحاولات خلال وقت قصير. يرجى المحاولة لاحقًا.", refresh: false };
    if (error.status === 400) return { message: "تحققي من البيانات المدخلة ثم حاولي مرة أخرى.", refresh: false };
  }
  return { message: "تعذر إرسال السؤال الآن. يرجى المحاولة مرة أخرى.", refresh: false };
}

export function WeeklyLiveExperience({ initialLive, initialError = false }: { initialLive: PublicWeeklyLive | null; initialError?: boolean }) {
  const [live, setLive] = useState(initialLive);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(initialError);
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submissionError, setSubmissionError] = useState<{ message: string; refresh: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<PublicWeeklyLiveSubmissionResponse | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const displayNameRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);
  const regionRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const questionConsentRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const weeklyLiveOpenedTracked = useRef(false);
  const leadStartedTracked = useRef(false);

  useEffect(() => {
    if (live && !weeklyLiveOpenedTracked.current) {
      weeklyLiveOpenedTracked.current = true;
      trackMarketingEvent("weekly_live_opened", { placement: "dedicated_page", questionsOpen: live.acceptingQuestions });
    }
  }, [live]);

  useEffect(() => {
    if (success) successRef.current?.focus();
    else if (submissionError) errorRef.current?.focus();
  }, [submissionError, success]);

  const refresh = async () => {
    setLoading(true);
    setLoadError(false);
    setSubmissionError(null);
    try {
      const response = await getCurrentWeeklyLive();
      setLive(response.live);
      setSuccess(null);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const focusFirstInvalid = (nextErrors: FieldErrors) => {
    if (nextErrors.contactName) return contactNameRef.current?.focus();
    if (nextErrors.phone) return phoneRef.current?.focus();
    if (nextErrors.email) return emailRef.current?.focus();
    if (nextErrors.displayName) return displayNameRef.current?.focus();
    if (nextErrors.age) return ageRef.current?.focus();
    if (nextErrors.region) return regionRef.current?.focus();
    if (nextErrors.city) return cityRef.current?.focus();
    if (nextErrors.question) return questionRef.current?.focus();
    if (nextErrors.consent) return questionConsentRef.current?.focus();
    if (nextErrors.privacyNoticeAccepted) privacyRef.current?.focus();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!live || submitting) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setSubmissionError(null);
    if (Object.keys(nextErrors).length > 0) {
      focusFirstInvalid(nextErrors);
      return;
    }

    const attribution = getWeeklyLiveAttributionFromLocation();
    const payload: PublicWeeklyLiveQuestionInput = {
      contactName: values.contactName.trim(),
      phone: values.phone.trim(),
      ...(values.email.trim() ? { email: values.email.trim() } : {}),
      displayName: values.displayName.trim(),
      age: Number(values.age),
      region: values.region.trim(),
      city: values.city.trim(),
      question: values.question.trim(),
      consent: true,
      privacyNoticeAccepted: true,
      marketingConsent: values.marketingConsent,
      attribution
    };

    setSubmitting(true);
    try {
      const response = await submitWeeklyLiveQuestion(live.id, payload);
      trackMarketingEvent("weekly_live_question_submitted", {
        source: "weekly_live",
        marketingConsent: values.marketingConsent,
        hasAttribution: hasMarketingAttribution(attribution)
      });
      trackMarketingEvent("weekly_live_join_available", { source: "weekly_live" });
      setSuccess(response);
    } catch (error) {
      setSubmissionError(submissionMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: FieldName, value: string | boolean) => {
    if (!leadStartedTracked.current) {
      leadStartedTracked.current = true;
      trackMarketingEvent("weekly_live_lead_started", {
        source: "weekly_live",
        hasAttribution: hasMarketingAttribution(getWeeklyLiveAttributionFromLocation())
      });
    }
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmissionError(null);
  };

  if (loading) return <section className={styles.state} aria-live="polite">جارٍ تحديث تفاصيل اللقاء…</section>;
  if (loadError) return <section className={styles.state} role="alert"><h1>تعذر تحميل اللقاء الأسبوعي</h1><p>يرجى المحاولة مرة أخرى بعد قليل.</p><button className={styles.secondaryButton} type="button" onClick={() => void refresh()}><RefreshCw aria-hidden="true" size={17} />إعادة المحاولة</button></section>;
  if (!live) return <section className={styles.state}><CalendarDays aria-hidden="true" size={33} /><h1>لا يوجد لقاء أسبوعي معلن حاليًا.</h1><p>سيتم الإعلان عن موعد اللقاء القادم هنا عند تحديده.</p><Link className={styles.secondaryButton} href="/"><ArrowRight aria-hidden="true" size={17} />العودة إلى الصفحة الرئيسية</Link></section>;
  if (success) return <section className={styles.successState} ref={successRef} tabIndex={-1}><CheckCircle2 aria-hidden="true" size={42} /><p className={styles.eyebrow}>تم الاستلام</p><h1>تم استلام سؤالك بنجاح</h1><p>شكرًا لمشاركتك. يمكنك الآن الاحتفاظ بموعد اللقاء أو الدخول من الرابط التالي في موعده.</p><div className={styles.successEvent}><strong>{success.event.title}</strong><span>{formatRiyadhDateTime(success.event.scheduledAt, "بتوقيت السعودية")}</span></div><a className={styles.joinButton} href={success.joinUrl} target="_blank" rel="noopener noreferrer"><ExternalLink aria-hidden="true" size={19} />الدخول إلى اللقاء</a></section>;

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>لقاء تثقيفي أسبوعي</p>
        <h1>اللقاء الأسبوعي مع د. ناريمان</h1>
        <p>مساحة أسبوعية للإجابة عن الأسئلة العامة المتعلقة بالصحة الإنجابية وعلاج تأخر الحمل.</p>
        <div className={styles.event}><strong>{live.title}</strong><span><CalendarDays aria-hidden="true" size={18} />{formatRiyadhDateTime(live.scheduledAt, "بتوقيت السعودية")}</span></div>
      </header>

      <section className={styles.notice} aria-labelledby="privacy-title">
        <ShieldCheck aria-hidden="true" size={25} />
        <div><h2 id="privacy-title">كيف نستخدم سؤالك؟</h2><p>تُستخدم بيانات السؤال لتنظيم اللقاء ومراجعة السؤال، بينما تبقى بيانات التواصل منفصلة لإدارة طلبك والتواصل وفق اختياراتك.</p><ul><li>يمكنك استخدام الاسم الأول أو اسم مستعار للسؤال؛ لا حاجة لكتابة الاسم الكامل.</li><li>يرجى عدم كتابة رقم الهوية، رقم الملف الطبي أو أي معلومات شخصية غير ضرورية داخل السؤال.</li><li>قد تتم إعادة صياغة السؤال لإخفاء التفاصيل الشخصية قبل عرضه.</li></ul></div>
      </section>

      {live.acceptingQuestions ? (
        <form className={styles.form} onSubmit={(event) => void submit(event)} noValidate aria-busy={submitting}>
          <h2>شارك سؤالك</h2>
          <p className={styles.formLead}>أدخلي بيانات التواصل ثم السؤال العام الذي ترغبين في مشاركته.</p>
          <fieldset className={styles.formGroup}>
            <legend>بيانات التواصل</legend>
            <Field label="الاسم للتواصل" error={errors.contactName} id="contact-name"><input ref={contactNameRef} id="contact-name" autoComplete="name" maxLength={100} value={values.contactName} aria-invalid={Boolean(errors.contactName)} aria-describedby={errors.contactName ? "contact-name-error" : undefined} onChange={(event) => update("contactName", event.target.value)} /></Field>
            <div className={styles.twoColumns}>
              <Field label="رقم الهاتف" error={errors.phone} id="contact-phone"><input ref={phoneRef} id="contact-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={60} value={values.phone} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "contact-phone-error" : undefined} onChange={(event) => update("phone", event.target.value)} /></Field>
              <Field label="البريد الإلكتروني (اختياري)" error={errors.email} id="contact-email"><input ref={emailRef} id="contact-email" type="email" inputMode="email" autoComplete="email" maxLength={254} value={values.email} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} onChange={(event) => update("email", event.target.value)} /></Field>
            </div>
          </fieldset>
          <fieldset className={styles.formGroup}>
            <legend>بيانات السؤال</legend>
            <Field label="الاسم أو الاسم المستعار للسؤال" error={errors.displayName} id="display-name" hint="لا حاجة لاستخدام اسم التواصل هنا."><input ref={displayNameRef} id="display-name" maxLength={80} value={values.displayName} aria-invalid={Boolean(errors.displayName)} aria-describedby={errors.displayName ? "display-name-error" : undefined} onChange={(event) => update("displayName", event.target.value)} /></Field>
            <div className={styles.twoColumns}>
              <Field label="العمر" error={errors.age} id="age"><input ref={ageRef} id="age" type="number" min="18" max="100" inputMode="numeric" value={values.age} aria-invalid={Boolean(errors.age)} aria-describedby={errors.age ? "age-error" : undefined} onChange={(event) => update("age", event.target.value)} /></Field>
              <Field label="المنطقة" error={errors.region} id="region"><input ref={regionRef} id="region" maxLength={80} placeholder="مثال: الرياض" value={values.region} aria-invalid={Boolean(errors.region)} aria-describedby={errors.region ? "region-error" : undefined} onChange={(event) => update("region", event.target.value)} /></Field>
            </div>
            <Field label="المدينة" error={errors.city} id="city"><input ref={cityRef} id="city" maxLength={100} placeholder="مثال: مدينة الرياض" value={values.city} aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? "city-error" : undefined} onChange={(event) => update("city", event.target.value)} /></Field>
            <Field label="السؤال" error={errors.question} id="question" hint={values.question.length + "/2000"}><textarea ref={questionRef} id="question" minLength={10} maxLength={2000} value={values.question} aria-invalid={Boolean(errors.question)} aria-describedby={errors.question ? "question-error" : undefined} onChange={(event) => update("question", event.target.value)} /></Field>
          </fieldset>
          <fieldset className={styles.formGroup}>
            <legend>الموافقات</legend>
            <label className={styles.consent} htmlFor="question-consent"><input ref={questionConsentRef} id="question-consent" type="checkbox" checked={values.consent} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? "question-consent-error" : undefined} onChange={(event) => update("consent", event.target.checked)} /><span>أوافق على استخدام البيانات الخاصة بالسؤال لتنظيم اللقاء ومراجعته، وأفهم أن اللقاء توعوي وليس استشارة طبية خاصة.</span></label>
            {errors.consent ? <p className={styles.fieldError} id="question-consent-error">{errors.consent}</p> : null}
            <label className={styles.consent} htmlFor="lead-privacy"><input ref={privacyRef} id="lead-privacy" type="checkbox" checked={values.privacyNoticeAccepted} aria-invalid={Boolean(errors.privacyNoticeAccepted)} aria-describedby={errors.privacyNoticeAccepted ? "lead-privacy-error" : undefined} onChange={(event) => update("privacyNoticeAccepted", event.target.checked)} /><span>قرأت إشعار الخصوصية وأوافق على معالجة بيانات التواصل اللازمة لإتمام طلبي والانضمام للقاء.</span></label>
            {errors.privacyNoticeAccepted ? <p className={styles.fieldError} id="lead-privacy-error">{errors.privacyNoticeAccepted}</p> : null}
            <label className={styles.consent} htmlFor="marketing-consent"><input id="marketing-consent" type="checkbox" checked={values.marketingConsent} onChange={(event) => update("marketingConsent", event.target.checked)} /><span>أوافق على التواصل معي لاحقًا بخصوص خدمات ومحتوى د. ناريمان. هذا الخيار اختياري.</span></label>
          </fieldset>
          <p className={styles.medicalNotice}>إرسال السؤال لا يُعد استشارة طبية خاصة أو تشخيصًا، واللقاء مخصص للتوعية والإجابة العامة.</p>
          {submissionError ? <div className={styles.submitError} ref={errorRef} tabIndex={-1} role="alert"><p>{submissionError.message}</p>{submissionError.refresh ? <button className={styles.textButton} type="button" onClick={() => void refresh()}>تحديث حالة اللقاء</button> : null}</div> : null}
          <button className={styles.submitButton} disabled={submitting} aria-busy={submitting}>{submitting ? "جارٍ إرسال السؤال…" : "إرسال السؤال والانضمام للقاء"}</button>
        </form>
      ) : <section className={styles.closed}><h2>استقبال الأسئلة لهذا اللقاء مغلق حاليًا.</h2><p>يمكنك متابعة تفاصيل اللقاء والعودة هنا عند إعلان جلسة جديدة.</p></section>}
    </section>
  );
}

function Field({ label, id, hint, error, children }: { label: string; id: string; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className={styles.field} htmlFor={id}><span>{label}</span>{children}{hint ? <small>{hint}</small> : null}{error ? <small className={styles.fieldError} id={id + "-error"}>{error}</small> : null}</label>;
}
