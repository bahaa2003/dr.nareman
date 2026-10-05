"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { CalendarDays, RefreshCw, ShieldCheck } from "lucide-react";

import { getCalculatorAttributionFromLocation, hasMarketingAttribution } from "@/lib/marketing-attribution";
import { trackMarketingEvent } from "@/lib/marketing-events";
import {
  formatArabicGregorianDate,
  getLocalToday,
  toIsoCalendarDate,
  validateRegularCycleInput,
  type RegularCycleInputErrors,
  type OvulationEstimate
} from "@/lib/ovulation-calculator";
import { PublicLeadApiError, createCalculatorLead } from "@/lib/public-api/leads";

import styles from "./OvulationCalculator.module.css";

type Regularity = "" | "regular" | "irregular";
type Stage = "input" | "lead" | "result";
type HealthFieldName = "regularity" | "lastPeriod" | "cycleLength";
type LeadFieldName = "name" | "phone" | "email" | "privacyNotice";
type HealthErrors = Partial<Record<HealthFieldName, string>>;
type LeadErrors = Partial<Record<LeadFieldName, string>>;

const emptyHealthErrors: HealthErrors = {};
const emptyLeadErrors: LeadErrors = {};

function subscribeToLocalDate() {
  return () => {};
}

function getLocalDateSnapshot() {
  return toIsoCalendarDate(getLocalToday());
}

function getServerDateSnapshot() {
  return "";
}

function toHealthErrors(errors: RegularCycleInputErrors): HealthErrors {
  const lastPeriodMessages = {
    missing: "أدخلي اليوم الأول من آخر دورة.",
    invalid: "أدخلي تاريخًا صحيحًا.",
    future: "لا يمكن أن يكون تاريخ آخر دورة في المستقبل.",
    stale: "أدخلي بداية آخر دورة حديثة للحصول على تقدير قريب."
  } as const;
  const cycleLengthMessages = {
    missing: "اختاري متوسط طول الدورة.",
    integer: "أدخلي عدد أيام صحيحًا دون كسور.",
    range: "هذه الأداة مخصصة لتقدير الدورات المنتظمة غالبًا بين 21 و35 يومًا."
  } as const;

  return {
    ...(errors.lastPeriod ? { lastPeriod: lastPeriodMessages[errors.lastPeriod] } : {}),
    ...(errors.cycleLength ? { cycleLength: cycleLengthMessages[errors.cycleLength] } : {})
  };
}

function isLikelyEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value);
}

function leadSubmissionMessage(error: unknown): string {
  if (error instanceof PublicLeadApiError) {
    if (error.status === 400) return "تحققي من بيانات التواصل ثم حاولي مرة أخرى.";
    if (error.status === 429) return "تم إرسال عدة محاولات خلال وقت قصير. حاولي مرة أخرى بعد قليل.";
  }

  return "تعذر حفظ بيانات التواصل الآن. تحققي من الاتصال وحاولي مرة أخرى.";
}

function selectedCycleLength(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function OvulationCalculator() {
  const [regularity, setRegularity] = useState<Regularity>("");
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState<number | null>(null);
  const [healthErrors, setHealthErrors] = useState<HealthErrors>(emptyHealthErrors);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [preparedEstimate, setPreparedEstimate] = useState<OvulationEstimate | null>(null);
  const [stage, setStage] = useState<Stage>("input");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [privacyNoticeAccepted, setPrivacyNoticeAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [leadErrors, setLeadErrors] = useState<LeadErrors>(emptyLeadErrors);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [submittingLead, setSubmittingLead] = useState(false);
  const todayIso = useSyncExternalStore(subscribeToLocalDate, getLocalDateSnapshot, getServerDateSnapshot);
  const regularityRef = useRef<HTMLInputElement>(null);
  const lastPeriodRef = useRef<HTMLInputElement>(null);
  const cycleLengthRef = useRef<HTMLSelectElement>(null);
  const leadHeadingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const privacyRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const calculatorViewTracked = useRef(false);
  const leadStageTracked = useRef(false);

  useEffect(() => {
    if (!calculatorViewTracked.current) {
      calculatorViewTracked.current = true;
      trackMarketingEvent("ovulation_calculator_view", { placement: "dedicated_page" });
    }
  }, []);

  useEffect(() => {
    if (stage === "lead") leadHeadingRef.current?.focus();
    if (stage === "result") resultHeadingRef.current?.focus();

    if (stage === "lead" && !leadStageTracked.current) {
      leadStageTracked.current = true;
      trackMarketingEvent("ovulation_lead_started", {
        source: "ovulation_calculator",
        hasAttribution: hasMarketingAttribution(getCalculatorAttributionFromLocation())
      });
    }

    if (stage === "result") {
      trackMarketingEvent("ovulation_result_viewed", { source: "ovulation_calculator" });
    }
  }, [stage]);

  const invalidatePreparedEstimate = () => {
    setPreparedEstimate(null);
    setStage("input");
    setLeadError(null);
    setLeadErrors(emptyLeadErrors);
    setCalculationError(null);
  };

  const selectRegularity = (nextRegularity: Regularity) => {
    setRegularity(nextRegularity);
    setHealthErrors((current) => ({ ...current, regularity: undefined }));
    invalidatePreparedEstimate();

    if (nextRegularity === "irregular") {
      setLastPeriod("");
      setCycleLength(null);
      setHealthErrors(emptyHealthErrors);
    }
  };

  const focusFirstHealthInvalid = (nextErrors: HealthErrors) => {
    if (nextErrors.regularity) return regularityRef.current?.focus();
    if (nextErrors.lastPeriod) return lastPeriodRef.current?.focus();
    if (nextErrors.cycleLength) cycleLengthRef.current?.focus();
  };

  const focusFirstLeadInvalid = (nextErrors: LeadErrors) => {
    if (nextErrors.name) return nameRef.current?.focus();
    if (nextErrors.phone) return phoneRef.current?.focus();
    if (nextErrors.email) return emailRef.current?.focus();
    if (nextErrors.privacyNotice) privacyRef.current?.focus();
  };

  const calculate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: HealthErrors = {};
    const formData = new FormData(event.currentTarget);
    const submittedRegularity = formData.get("cycle-regularity");
    const submittedLastPeriod = formData.get("last-period");
    const submittedCycleLength = selectedCycleLength(formData.get("cycle-length"));
    setCalculationError(null);

    if (submittedRegularity !== "regular" && submittedRegularity !== "irregular") {
      nextErrors.regularity = "اختاري ما إذا كانت دورتك منتظمة عادةً.";
      setPreparedEstimate(null);
      setHealthErrors(nextErrors);
      focusFirstHealthInvalid(nextErrors);
      return;
    }

    if (submittedRegularity === "irregular") {
      setPreparedEstimate(null);
      setStage("input");
      setHealthErrors(emptyHealthErrors);
      return;
    }

    try {
      const validation = validateRegularCycleInput(
        typeof submittedLastPeriod === "string" ? submittedLastPeriod : "",
        submittedCycleLength,
        getLocalToday()
      );
      Object.assign(nextErrors, toHealthErrors(validation.errors));

      if (Object.keys(nextErrors).length > 0) {
        setPreparedEstimate(null);
        setStage("input");
        setHealthErrors(nextErrors);
        focusFirstHealthInvalid(nextErrors);
        return;
      }

      if (!validation.estimate) {
        setPreparedEstimate(null);
        setStage("input");
        setCalculationError("تعذر احتساب التقدير الآن. تحققي من البيانات وحاولي مرة أخرى.");
        return;
      }

      setHealthErrors(emptyHealthErrors);
      setLeadError(null);
      setPreparedEstimate(validation.estimate);
      leadStageTracked.current = false;
      setStage("lead");
      trackMarketingEvent("ovulation_calculation_ready", { source: "ovulation_calculator" });
    } catch {
      setPreparedEstimate(null);
      setStage("input");
      setCalculationError("تعذر احتساب التقدير الآن. تحققي من البيانات وحاولي مرة أخرى.");
    }
  };

  const submitLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!preparedEstimate || submittingLead) return;

    const nextErrors: LeadErrors = {};
    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName) nextErrors.name = "أدخلي الاسم.";
    else if (normalizedName.length > 100) nextErrors.name = "الاسم طويل جدًا.";
    if (!normalizedPhone) nextErrors.phone = "أدخلي رقم الهاتف.";
    if (normalizedEmail && !isLikelyEmail(normalizedEmail)) nextErrors.email = "أدخلي بريدًا إلكترونيًا صحيحًا أو اتركيه فارغًا.";
    if (!privacyNoticeAccepted) nextErrors.privacyNotice = "يلزم تأكيد الاطلاع على إشعار الخصوصية للمتابعة.";

    if (Object.keys(nextErrors).length > 0) {
      setLeadErrors(nextErrors);
      setLeadError(null);
      focusFirstLeadInvalid(nextErrors);
      return;
    }

    setLeadErrors(emptyLeadErrors);
    setLeadError(null);
    setSubmittingLead(true);

    try {
      const attribution = getCalculatorAttributionFromLocation();
      await createCalculatorLead({
        name: normalizedName,
        phone: normalizedPhone,
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        source: "ovulation_calculator",
        privacyNoticeAccepted: true,
        marketingConsent,
        attribution
      });
      trackMarketingEvent("ovulation_lead_submitted", {
        source: "ovulation_calculator",
        marketingConsent,
        hasAttribution: hasMarketingAttribution(attribution)
      });
      setStage("result");
    } catch (error) {
      setLeadError(leadSubmissionMessage(error));
    } finally {
      setSubmittingLead(false);
    }
  };

  const reset = () => {
    setRegularity("");
    setLastPeriod("");
    setCycleLength(null);
    setHealthErrors(emptyHealthErrors);
    setCalculationError(null);
    setPreparedEstimate(null);
    setStage("input");
    setName("");
    setPhone("");
    setEmail("");
    setPrivacyNoticeAccepted(false);
    setMarketingConsent(false);
    setLeadErrors(emptyLeadErrors);
    setLeadError(null);
    setSubmittingLead(false);
    regularityRef.current?.focus();
  };

  const isRegular = regularity === "regular";

  return (
    <section className={styles.section} aria-labelledby="ovulation-calculator-title">
      <div className={styles.shell}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>تخطيط تقويمي مبسط</p>
          <h1 id="ovulation-calculator-title">حاسبة التبويض التقديرية</h1>
          <p>تساعدكِ هذه الحاسبة على تقدير نافذة الخصوبة وموعد التبويض والدورة التالية عند انتظام الدورة غالبًا.</p>
        </header>

        <ol className={styles.steps} aria-label="مراحل استخدام الحاسبة">
          <li className={stage === "input" ? styles.stepActive : undefined}><span>١</span>بيانات الدورة</li>
          <li className={stage === "lead" ? styles.stepActive : undefined}><span>٢</span>بيانات التواصل</li>
          <li className={stage === "result" ? styles.stepActive : undefined}><span>٣</span>النتيجة</li>
        </ol>

        <div className={styles.contentGrid}>
          {stage === "input" ? (
            <form className={styles.form} onSubmit={calculate} noValidate>
              <fieldset className={styles.regularity} aria-describedby={healthErrors.regularity ? "regularity-error" : undefined}>
                <legend>هل دورتك منتظمة عادةً؟</legend>
                <p className={styles.fieldHint}>أي أنها متقاربة المدة من شهر لآخر.</p>
                <div className={styles.radioGroup}>
                  <label><input ref={regularityRef} type="radio" name="cycle-regularity" value="regular" checked={regularity === "regular"} onChange={() => selectRegularity("regular")} /><span>نعم، غالبًا</span></label>
                  <label><input type="radio" name="cycle-regularity" value="irregular" checked={regularity === "irregular"} onChange={() => selectRegularity("irregular")} /><span>لا، تختلف من شهر لآخر</span></label>
                </div>
                {healthErrors.regularity ? <p className={styles.fieldError} id="regularity-error">{healthErrors.regularity}</p> : null}
              </fieldset>

              {isRegular ? <div className={styles.regularFields}>
                <label className={styles.field} htmlFor="last-period">
                  <span>اليوم الأول من آخر دورة</span>
                  <input ref={lastPeriodRef} id="last-period" name="last-period" className={styles.dateInput} type="date" max={todayIso || undefined} value={lastPeriod} aria-invalid={Boolean(healthErrors.lastPeriod)} aria-describedby={healthErrors.lastPeriod ? "last-period-error" : undefined} onChange={(event) => { setLastPeriod(event.target.value); setHealthErrors((current) => ({ ...current, lastPeriod: undefined })); invalidatePreparedEstimate(); }} />
                  {healthErrors.lastPeriod ? <small className={styles.fieldError} id="last-period-error">{healthErrors.lastPeriod}</small> : null}
                </label>
                <label className={styles.field} htmlFor="cycle-length">
                  <span>متوسط طول الدورة بالأيام</span>
                  <select ref={cycleLengthRef} id="cycle-length" name="cycle-length" value={cycleLength ?? ""} aria-invalid={Boolean(healthErrors.cycleLength)} aria-describedby={healthErrors.cycleLength ? "cycle-length-hint cycle-length-error" : "cycle-length-hint"} onChange={(event) => { const selectedDays = Number(event.target.value); setCycleLength(Number.isSafeInteger(selectedDays) ? selectedDays : null); setHealthErrors((current) => ({ ...current, cycleLength: undefined })); invalidatePreparedEstimate(); }}>
                    <option value="" disabled>اختاري متوسط طول الدورة</option>
                    {Array.from({ length: 15 }, (_, index) => 21 + index).map((days) => <option key={days} value={String(days)}>{days} يومًا</option>)}
                  </select>
                  <small id="cycle-length-hint">للدورات المنتظمة غالبًا بين 21 و35 يومًا.</small>
                  {healthErrors.cycleLength ? <small className={styles.fieldError} id="cycle-length-error">{healthErrors.cycleLength}</small> : null}
                </label>
              </div> : null}

              <div className={styles.actions}>
                {calculationError ? <p className={styles.submitError} role="alert">{calculationError}</p> : null}
                <button className={styles.calculateButton} type="submit"><CalendarDays aria-hidden="true" size={19} />احسبي التقدير</button>
                <button className={styles.resetButton} type="button" onClick={reset}><RefreshCw aria-hidden="true" size={17} />بدء حساب جديد</button>
              </div>
            </form>
          ) : stage === "lead" ? (
            <form className={styles.form} onSubmit={(event) => void submitLead(event)} noValidate aria-busy={submittingLead}>
              <div className={styles.leadHeader}>
                <p className={styles.eyebrow}>بيانات التواصل</p>
                <h2 ref={leadHeadingRef} tabIndex={-1}>نتيجتك جاهزة</h2>
                <p>أدخلي بيانات التواصل لعرض التقدير. لن يتم إرسال بيانات الدورة ضمن بيانات التواصل.</p>
              </div>
              <label className={styles.field} htmlFor="lead-name"><span>الاسم</span><input ref={nameRef} id="lead-name" autoComplete="name" maxLength={100} value={name} aria-invalid={Boolean(leadErrors.name)} aria-describedby={leadErrors.name ? "lead-name-error" : undefined} onChange={(event) => { setName(event.target.value); setLeadErrors((current) => ({ ...current, name: undefined })); }} />{leadErrors.name ? <small className={styles.fieldError} id="lead-name-error">{leadErrors.name}</small> : null}</label>
              <label className={styles.field} htmlFor="lead-phone"><span>رقم الهاتف</span><input ref={phoneRef} id="lead-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={60} value={phone} aria-invalid={Boolean(leadErrors.phone)} aria-describedby={leadErrors.phone ? "lead-phone-error" : undefined} onChange={(event) => { setPhone(event.target.value); setLeadErrors((current) => ({ ...current, phone: undefined })); }} />{leadErrors.phone ? <small className={styles.fieldError} id="lead-phone-error">{leadErrors.phone}</small> : null}</label>
              <label className={styles.field} htmlFor="lead-email"><span>البريد الإلكتروني (اختياري)</span><input ref={emailRef} id="lead-email" type="email" inputMode="email" autoComplete="email" maxLength={254} value={email} aria-invalid={Boolean(leadErrors.email)} aria-describedby={leadErrors.email ? "lead-email-error" : undefined} onChange={(event) => { setEmail(event.target.value); setLeadErrors((current) => ({ ...current, email: undefined })); }} />{leadErrors.email ? <small className={styles.fieldError} id="lead-email-error">{leadErrors.email}</small> : null}</label>
              <label className={styles.consent} htmlFor="lead-privacy-notice"><input ref={privacyRef} id="lead-privacy-notice" type="checkbox" checked={privacyNoticeAccepted} aria-invalid={Boolean(leadErrors.privacyNotice)} aria-describedby={leadErrors.privacyNotice ? "lead-privacy-error" : undefined} onChange={(event) => { setPrivacyNoticeAccepted(event.target.checked); setLeadErrors((current) => ({ ...current, privacyNotice: undefined })); }} /><span>قرأت إشعار الخصوصية وأوافق على معالجة بيانات التواصل اللازمة لإتمام طلبي وعرض النتيجة.</span></label>
              {leadErrors.privacyNotice ? <p className={styles.fieldError} id="lead-privacy-error">{leadErrors.privacyNotice}</p> : null}
              <label className={styles.consent} htmlFor="lead-marketing-consent"><input id="lead-marketing-consent" type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} /><span>أوافق على التواصل معي بخصوص خدمات ومحتوى د. ناريمان. هذا الخيار اختياري.</span></label>
              {leadError ? <p className={styles.submitError} role="alert">{leadError}</p> : null}
              <div className={styles.actions}>
                <button className={styles.calculateButton} type="submit" disabled={submittingLead} aria-busy={submittingLead}>{submittingLead ? "جارٍ عرض النتيجة…" : "عرض النتيجة"}</button>
                <button className={styles.resetButton} type="button" disabled={submittingLead} onClick={invalidatePreparedEstimate}>تعديل بيانات الدورة</button>
              </div>
            </form>
          ) : (
            <section className={styles.completed} aria-label="اكتمل الحساب"><ShieldCheck aria-hidden="true" size={27} /><h2>تم عرض تقديرك</h2><p>هذه المعلومات تقديرية، ويمكنكِ بدء حساب جديد في أي وقت.</p><button className={styles.resetButton} type="button" onClick={reset}><RefreshCw aria-hidden="true" size={17} />بدء حساب جديد</button></section>
          )}

          <div className={styles.outputColumn}>
            {regularity === "irregular" ? <section className={styles.limitation} aria-labelledby="irregular-cycle-title" role="status"><ShieldCheck aria-hidden="true" size={27} /><div><h2 id="irregular-cycle-title">الدورة غير المنتظمة</h2><p>إذا كانت دورتك غير منتظمة أو تتغير مدتها، فلا يمكن لهذه الحاسبة التقويمية تقديم تقدير موثوق لموعد التبويض.</p><p>يمكنكِ التحدث إلى مختص عند وجود قلق بشأن الدورة أو الخصوبة.</p></div></section> : null}
            {stage === "lead" && preparedEstimate ? <section className={styles.prepared} role="status" aria-live="polite"><ShieldCheck aria-hidden="true" size={26} /><div><h2>نتيجتك جاهزة</h2><p>أكملي بيانات التواصل لعرض التقدير التقويمي. لن تظهر تواريخ النتيجة قبل نجاح الإرسال.</p></div></section> : null}
            {stage === "result" && preparedEstimate ? <section className={styles.results} aria-labelledby="estimate-title">
              <p className={styles.liveMessage} aria-live="polite" aria-atomic="true">تم احتساب التقديرات التقويمية.</p>
              <h2 id="estimate-title" ref={resultHeadingRef} tabIndex={-1}>تقدير الدورة القادمة</h2>
              <div className={styles.resultCards}>
                <article className={styles.primaryResult + " " + styles.resultCard}><p>نافذة الخصوبة التقديرية</p><strong>{formatArabicGregorianDate(preparedEstimate.fertileWindowStart)}</strong><span>إلى {formatArabicGregorianDate(preparedEstimate.fertileWindowEnd)}</span></article>
                <article className={styles.resultCard}><p>يوم التبويض التقديري</p><strong>{formatArabicGregorianDate(preparedEstimate.estimatedOvulation)}</strong></article>
                <article className={styles.resultCard}><p>موعد الدورة التالية المتوقع</p><strong>{formatArabicGregorianDate(preparedEstimate.estimatedNextPeriod)}</strong></article>
              </div>
              <p className={styles.windowNote}>قد تظل إمكانية الحمل قائمة لفترة قصيرة بعد التبويض؛ إذ قد تبقى البويضة قابلة للحياة لنحو 12–24 ساعة.</p>
            </section> : null}
          </div>
        </div>

        <aside className={styles.disclaimer} aria-label="تنبيه طبي مهم"><ShieldCheck aria-hidden="true" size={23} /><div><p>هذه التواريخ تقديرات تقويمية مبنية على تاريخ الدورة وطولها، وقد يختلف وقت التبويض من دورة إلى أخرى.</p><p>لا تؤكد هذه الحاسبة حدوث التبويض، ولا تُعد تشخيصًا أو اختبار خصوبة أو بديلًا عن التقييم الطبي.</p><p>لا تستخدمي هذه النتائج وحدها لمنع الحمل أو كوسيلة لمنع الحمل.</p></div></aside>
      </div>
    </section>
  );
}
