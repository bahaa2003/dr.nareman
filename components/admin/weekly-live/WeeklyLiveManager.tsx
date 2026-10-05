"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarDays, ExternalLink, EyeOff, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/components/admin/AdminSessionContext";
import { createWeeklyLive, deleteWeeklyLiveQuestion, getWeeklyLive, getWeeklyLiveQuestion, listWeeklyLiveQuestions, listWeeklyLives, updateWeeklyLive, updateWeeklyLiveQuestion } from "@/lib/admin-api/weekly-live";
import { ApiError } from "@/lib/admin-api/client";
import { formatRiyadhDateTime, isoToRiyadhLocalInput, riyadhLocalInputToIso } from "@/lib/riyadh-datetime";
import type { AdminWeeklyLiveInput, AdminWeeklyLiveQuestionFilters, WeeklyLive, WeeklyLiveQuestion, WeeklyLiveQuestionStatus } from "@/types/admin";

import styles from "./WeeklyLiveManager.module.css";

const pageSize = 20;
const questionStatusLabels: Record<WeeklyLiveQuestionStatus, string> = { new: "جديد", selected: "تم اختياره", answered: "تمت الإجابة", archived: "مؤرشف" };

function messageFor(error: unknown, action: "load" | "save" | "question" = "load"): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return "غير مسموح بتنفيذ هذا الطلب.";
    if (error.status === 404) return action === "question" ? "السؤال غير موجود." : "اللقاء غير موجود.";
    if (error.status === 400) return "تحقق من البيانات المدخلة ثم حاول مرة أخرى.";
    if (error.status === 409) return error.message;
  }
  return action === "load" ? "تعذر تحميل البيانات الآن. حاول مرة أخرى." : "تعذر إتمام الطلب الآن. حاول مرة أخرى.";
}

function useUnauthorizedRedirect() {
  const router = useRouter();
  const { handleUnauthorized } = useAdminSession();
  return useCallback((error: unknown): boolean => {
    if (error instanceof ApiError && error.status === 401) {
      handleUnauthorized();
      router.replace("/admin/login");
      return true;
    }
    return false;
  }, [handleUnauthorized, router]);
}

function VisibilityBadge({ visible }: { visible: boolean }) { return <span className={`${styles.badge} ${visible ? styles.visible : styles.hidden}`}>{visible ? "ظاهر في الموقع" : "مخفي"}</span>; }
function QuestionsBadge({ open }: { open: boolean }) { return <span className={`${styles.badge} ${open ? styles.open : styles.closed}`}>{open ? "استقبال الأسئلة مفتوح" : "استقبال الأسئلة مغلق"}</span>; }
function QuestionStatusBadge({ status }: { status: WeeklyLiveQuestionStatus }) { return <span className={`${styles.badge} ${styles[`status${status}`]}`}>{questionStatusLabels[status]}</span>; }

export function WeeklyLiveList() {
  const router = useRouter();
  const handleUnauthorized = useUnauthorizedRedirect();
  const [result, setResult] = useState<{ items: WeeklyLive[]; pagination: { page: number; limit: number; total: number; totalPages: number } } | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    const controller = new AbortController(); const id = ++requestId.current;
    void listWeeklyLives(page, pageSize, controller.signal).then((response) => {
      if (id === requestId.current) { setResult(response); setError(null); }
    }).catch((caught) => {
      if (controller.signal.aborted || id !== requestId.current || handleUnauthorized(caught)) return;
      setError(messageFor(caught));
    });
    return () => controller.abort();
  }, [handleUnauthorized, page, retry]);

  return <section className={styles.page} aria-labelledby="weekly-live-title">
    <header className={styles.header}><div><p className={styles.eyebrow}>اللقاءات</p><h1 id="weekly-live-title">اللقاءات الأسبوعية</h1><p>إدارة اللقاءات العامة والأسئلة الواردة بأمان.</p></div><Link className={styles.primaryButton} href="/admin/weekly-live/new"><Plus size={18} aria-hidden="true" />لقاء جديد</Link></header>
    {!result && !error ? <section className={styles.state} aria-live="polite">جارٍ تحميل اللقاءات…</section> : null}
    {error ? <section className={styles.error} role="alert"><p>{error}</p><button className={styles.primaryButton} onClick={() => setRetry((value) => value + 1)}>إعادة المحاولة</button></section> : null}
    {result?.items.length === 0 ? <section className={styles.state}><CalendarDays size={30} aria-hidden="true" /><h2>لا توجد لقاءات أسبوعية بعد.</h2><Link className={styles.primaryButton} href="/admin/weekly-live/new">إنشاء أول لقاء</Link></section> : null}
    {result && result.items.length > 0 ? <><div className={styles.liveList} role="list">{result.items.map((live) => <article key={live.id} className={styles.liveCard} role="listitem"><div><h2>{live.title}</h2><p>{formatRiyadhDateTime(live.scheduledAt)}</p><div className={styles.badges}><VisibilityBadge visible={live.isVisible} /><QuestionsBadge open={live.acceptingQuestions} /></div></div><div className={styles.liveMeta}><span>{live.questionCount} سؤال</span><span>آخر تحديث: {formatRiyadhDateTime(live.updatedAt)}</span><button className={styles.secondaryButton} onClick={() => router.push(`/admin/weekly-live/${encodeURIComponent(live.id)}`)}>إدارة اللقاء</button></div></article>)}</div><Pagination pagination={result.pagination} onPage={setPage} label="ترقيم صفحات اللقاءات" /></> : null}
  </section>;
}

type LiveFormValues = { title: string; scheduledAt: string; meetingUrl: string; isVisible: boolean; acceptingQuestions: boolean };
const emptyLiveForm: LiveFormValues = { title: "", scheduledAt: "", meetingUrl: "", isVisible: false, acceptingQuestions: false };
function liveToForm(live: WeeklyLive): LiveFormValues { return { title: live.title, scheduledAt: isoToRiyadhLocalInput(live.scheduledAt), meetingUrl: live.meetingUrl, isVisible: live.isVisible, acceptingQuestions: live.acceptingQuestions }; }
function buildInput(values: LiveFormValues): { input?: AdminWeeklyLiveInput; error?: string } {
  const title = values.title.trim(); const meetingUrl = values.meetingUrl.trim(); const scheduledAt = riyadhLocalInputToIso(values.scheduledAt);
  if (!title || !meetingUrl || !scheduledAt) return { error: "أكمل عنوان اللقاء وموعده ورابطه." };
  if (title.length > 120) return { error: "عنوان اللقاء طويل جدًا." };
  try { if (new URL(meetingUrl).protocol !== "https:") return { error: "رابط اللقاء يجب أن يبدأ بـ https://" }; } catch { return { error: "أدخل رابط لقاء صالحًا." }; }
  return { input: { title, scheduledAt, meetingUrl, isVisible: values.isVisible, acceptingQuestions: values.acceptingQuestions } };
}

function LiveForm({ initial, onSave, saving, success }: { initial: LiveFormValues; onSave: (values: LiveFormValues) => Promise<string | null>; saving: boolean; success: string | null }) {
  const [values, setValues] = useState(initial); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(null); const next = await onSave(values); if (next) setError(next); };
  return <form className={styles.form} onSubmit={(event) => void submit(event)}>
    <label>عنوان اللقاء<input value={values.title} maxLength={120} required onChange={(event) => setValues({ ...values, title: event.target.value })} /></label>
    <label>موعد اللقاء <span>بتوقيت الرياض</span><input type="datetime-local" value={values.scheduledAt} required onChange={(event) => setValues({ ...values, scheduledAt: event.target.value })} /></label>
    <label>رابط اللقاء<input type="url" inputMode="url" placeholder="https://…" value={values.meetingUrl} maxLength={2048} required onChange={(event) => setValues({ ...values, meetingUrl: event.target.value })} /></label>
    <label className={styles.toggle}><input type="checkbox" checked={values.isVisible} onChange={(event) => setValues({ ...values, isVisible: event.target.checked })} /><span><strong>إظهار اللقاء في الموقع</strong><small>عند إظهار هذا اللقاء، سيصبح هو اللقاء الظاهر للزوار بدلًا من أي لقاء ظاهر حاليًا.</small></span></label>
    <label className={styles.toggle}><input type="checkbox" checked={values.acceptingQuestions} onChange={(event) => setValues({ ...values, acceptingQuestions: event.target.checked })} /><span><strong>استقبال الأسئلة</strong><small>يمكن فتح أو إغلاق الاستقبال دون تغيير ظهور اللقاء.</small></span></label>
    {error ? <p className={styles.formError} role="alert">{error}</p> : null}{success ? <p className={styles.success} aria-live="polite">{success}</p> : null}<button className={styles.primaryButton} disabled={saving} aria-busy={saving}>{saving ? "جارٍ الحفظ…" : "حفظ اللقاء"}</button>
  </form>;
}

export function CreateWeeklyLive() {
  const router = useRouter(); const handleUnauthorized = useUnauthorizedRedirect(); const [saving, setSaving] = useState(false);
  const save = async (values: LiveFormValues) => { const parsed = buildInput(values); if (!parsed.input) return parsed.error ?? "تعذر حفظ اللقاء."; setSaving(true); try { const response = await createWeeklyLive(parsed.input); router.replace(`/admin/weekly-live/${encodeURIComponent(response.live.id)}`); return null; } catch (error) { if (!handleUnauthorized(error)) return messageFor(error, "save"); return "انتهت جلسة الإدارة."; } finally { setSaving(false); } };
  return <section className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>اللقاءات</p><h1>لقاء أسبوعي جديد</h1><p>يُحفظ الموعد كوقت السعودية، ويظل الرابط محميًا داخل لوحة الإدارة.</p></div><Link className={styles.textLink} href="/admin/weekly-live">العودة إلى اللقاءات</Link></header><LiveForm initial={emptyLiveForm} saving={saving} success={null} onSave={save} /></section>;
}

export function WeeklyLiveWorkspace({ liveId }: { liveId: string }) {
  const router = useRouter(); const handleUnauthorized = useUnauthorizedRedirect(); const [live, setLive] = useState<WeeklyLive | null>(null); const [error, setError] = useState<string | null>(null); const [retry, setRetry] = useState(0); const [saving, setSaving] = useState(false); const [success, setSuccess] = useState<string | null>(null);
  useEffect(() => { const controller = new AbortController(); void getWeeklyLive(liveId, controller.signal).then((response) => { setLive(response.live); setError(null); }).catch((caught) => { if (controller.signal.aborted || handleUnauthorized(caught)) return; setError(messageFor(caught)); }); return () => controller.abort(); }, [handleUnauthorized, liveId, retry]);
  const save = async (values: LiveFormValues) => { if (!live) return "تعذر تحميل اللقاء."; const parsed = buildInput(values); if (!parsed.input) return parsed.error ?? "تعذر حفظ اللقاء."; const update = Object.fromEntries(Object.entries(parsed.input).filter(([key, value]) => value !== (key === "scheduledAt" ? live.scheduledAt : live[key as keyof WeeklyLive]))) as Partial<AdminWeeklyLiveInput>; if (!Object.keys(update).length) { setSuccess("لا توجد تغييرات للحفظ."); return null; } setSaving(true); try { const response = await updateWeeklyLive(live.id, update); setLive(response.live); setSuccess("تم حفظ إعدادات اللقاء."); return null; } catch (caught) { if (!handleUnauthorized(caught)) return messageFor(caught, "save"); return "انتهت جلسة الإدارة."; } finally { setSaving(false); } };
  if (!live && !error) return <section className={styles.state} aria-live="polite">جارٍ تحميل اللقاء…</section>;
  if (error) return <section className={styles.state} role="alert"><h1>تعذر فتح اللقاء</h1><p>{error}</p><button className={styles.primaryButton} onClick={() => setRetry((value) => value + 1)}>إعادة المحاولة</button><Link className={styles.textLink} href="/admin/weekly-live">العودة إلى اللقاءات</Link></section>;
  if (!live) return null;
  return <section className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>إدارة اللقاء</p><h1>{live.title}</h1><p>{formatRiyadhDateTime(live.scheduledAt)}</p></div><a className={styles.secondaryButton} href={live.meetingUrl} target="_blank" rel="noreferrer noopener"><ExternalLink size={16} aria-hidden="true" />فتح رابط اللقاء</a></header><section className={styles.panel}><h2>إعدادات اللقاء</h2><LiveForm key={live.updatedAt} initial={liveToForm(live)} saving={saving} success={success} onSave={save} /></section><QuestionsWorkspace live={live} onUnauthorized={() => router.replace("/admin/login")} /></section>;
}

type QuestionFilters = Omit<AdminWeeklyLiveQuestionFilters, "page" | "limit">;
const emptyFilters: QuestionFilters = {};

function QuestionFiltersForm({ filters, onApply, onReset }: { filters: QuestionFilters; onApply: (filters: QuestionFilters) => void; onReset: () => void }) {
  const [values, setValues] = useState({ status: filters.status ?? "", region: filters.region ?? "", city: filters.city ?? "", minAge: filters.minAge?.toString() ?? "", maxAge: filters.maxAge?.toString() ?? "", dateFrom: filters.dateFrom?.slice(0, 10) ?? "", dateTo: filters.dateTo?.slice(0, 10) ?? "", search: filters.search ?? "" });
  const apply = (event: FormEvent) => { event.preventDefault(); const minAge = values.minAge ? Number(values.minAge) : undefined; const maxAge = values.maxAge ? Number(values.maxAge) : undefined; if ((minAge !== undefined && (!Number.isInteger(minAge) || minAge < 18 || minAge > 100)) || (maxAge !== undefined && (!Number.isInteger(maxAge) || maxAge < 18 || maxAge > 100)) || (minAge !== undefined && maxAge !== undefined && minAge > maxAge) || (values.dateFrom && values.dateTo && values.dateFrom > values.dateTo)) return; onApply({ ...(values.status ? { status: values.status as WeeklyLiveQuestionStatus } : {}), ...(values.region.trim() ? { region: values.region.trim() } : {}), ...(values.city.trim() ? { city: values.city.trim() } : {}), ...(minAge !== undefined ? { minAge } : {}), ...(maxAge !== undefined ? { maxAge } : {}), ...(values.dateFrom ? { dateFrom: new Date(`${values.dateFrom}T00:00:00.000Z`).toISOString() } : {}), ...(values.dateTo ? { dateTo: new Date(`${values.dateTo}T23:59:59.999Z`).toISOString() } : {}), ...(values.search.trim() ? { search: values.search.trim() } : {}) }); };
  return <form className={styles.filters} onSubmit={apply}><label>الحالة<select value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value })}><option value="">الكل</option>{(Object.keys(questionStatusLabels) as WeeklyLiveQuestionStatus[]).map((status) => <option key={status} value={status}>{questionStatusLabels[status]}</option>)}</select></label><label>المنطقة<input value={values.region} maxLength={80} onChange={(event) => setValues({ ...values, region: event.target.value })} /></label><label>المدينة<input value={values.city} maxLength={100} onChange={(event) => setValues({ ...values, city: event.target.value })} /></label><label>العمر من<input type="number" min="18" max="100" value={values.minAge} onChange={(event) => setValues({ ...values, minAge: event.target.value })} /></label><label>العمر إلى<input type="number" min="18" max="100" value={values.maxAge} onChange={(event) => setValues({ ...values, maxAge: event.target.value })} /></label><label>من تاريخ<input type="date" value={values.dateFrom} onChange={(event) => setValues({ ...values, dateFrom: event.target.value })} /></label><label>إلى تاريخ<input type="date" value={values.dateTo} onChange={(event) => setValues({ ...values, dateTo: event.target.value })} /></label><label className={styles.filterSearch}>بحث في الأسئلة<input type="search" value={values.search} maxLength={100} onChange={(event) => setValues({ ...values, search: event.target.value })} /></label><div className={styles.filterActions}><button className={styles.secondaryButton}>تطبيق</button>{Object.keys(filters).length ? <button type="button" className={styles.textButton} onClick={onReset}>إعادة ضبط الفلاتر</button> : null}</div></form>;
}

function QuestionsWorkspace({ live, onUnauthorized }: { live: WeeklyLive; onUnauthorized: () => void }) {
  const handleUnauthorized = useUnauthorizedRedirect(); const [filters, setFilters] = useState<QuestionFilters>(emptyFilters); const [page, setPage] = useState(1); const [result, setResult] = useState<{ items: WeeklyLiveQuestion[]; pagination: { page: number; limit: number; total: number; totalPages: number } } | null>(null); const [error, setError] = useState<string | null>(null); const [selected, setSelected] = useState<WeeklyLiveQuestion | null>(null); const [retry, setRetry] = useState(0); const requestId = useRef(0);
  const load = () => setRetry((value) => value + 1);
  useEffect(() => { const controller = new AbortController(); const id = ++requestId.current; void listWeeklyLiveQuestions(live.id, { ...filters, page, limit: pageSize }, controller.signal).then((response) => { if (id === requestId.current) { setResult(response); setError(null); } }).catch((caught) => { if (controller.signal.aborted || id !== requestId.current) return; if (handleUnauthorized(caught)) { onUnauthorized(); return; } setError(messageFor(caught, "question")); }); return () => controller.abort(); }, [filters, handleUnauthorized, live.id, onUnauthorized, page, retry]);
  const chooseFilters = (next: QuestionFilters) => { setFilters(next); setPage(1); setSelected(null); };
  const deleted = () => { setSelected(null); if (result?.items.length === 1 && page > 1) setPage(page - 1); else load(); };
  return <section className={styles.questions}><header className={styles.sectionHeader}><div><p className={styles.eyebrow}>الأسئلة الواردة</p><h2>الأسئلة الواردة</h2></div><span>{live.questionCount} سؤال</span></header><p className={styles.sensitiveNotice}><EyeOff size={17} aria-hidden="true" />هذه الأسئلة قد تحتوي على معلومات صحية خاصة. استخدمها فقط لتنظيم اللقاء، ولا تشارك بيانات المرسل أو تقرأها علنًا.</p><QuestionFiltersForm key={JSON.stringify(filters)} filters={filters} onApply={chooseFilters} onReset={() => chooseFilters(emptyFilters)} />{!result && !error ? <div className={styles.inlineState} aria-live="polite">جارٍ تحميل الأسئلة…</div> : null}{error ? <div className={styles.error} role="alert"><p>{error}</p><button className={styles.secondaryButton} onClick={load}>إعادة المحاولة</button></div> : null}{result?.items.length === 0 ? <div className={styles.inlineState}>{Object.keys(filters).length ? <><p>لا توجد نتائج مطابقة للفلاتر الحالية.</p><button className={styles.textButton} onClick={() => chooseFilters(emptyFilters)}>إعادة ضبط الفلاتر</button></> : "لم تصل أسئلة لهذا اللقاء حتى الآن."}</div> : null}{result && result.items.length > 0 ? <><QuestionRows questions={result.items} onSelect={setSelected} /><Pagination pagination={result.pagination} onPage={setPage} label="ترقيم صفحات الأسئلة" /></> : null}{selected ? <QuestionDetail question={selected} onClose={() => setSelected(null)} onChanged={(question) => { setSelected(question); load(); }} onDeleted={deleted} onUnauthorized={onUnauthorized} /> : null}</section>;
}

function QuestionRows({ questions, onSelect }: { questions: WeeklyLiveQuestion[]; onSelect: (question: WeeklyLiveQuestion) => void }) { return <div className={styles.questionList} role="table" aria-label="قائمة الأسئلة الواردة"><div className={`${styles.questionRow} ${styles.questionHeader}`} role="row"><span role="columnheader">الاسم</span><span role="columnheader">العمر</span><span role="columnheader">الموقع</span><span role="columnheader">الحالة</span><span role="columnheader">السؤال</span><span role="columnheader">إجراء</span></div>{questions.map((question) => <article className={styles.questionRow} role="row" key={question.id}><p role="cell"><b className={styles.mobileLabel}>الاسم</b>{question.displayName}</p><p role="cell"><b className={styles.mobileLabel}>العمر</b>{question.age}</p><p role="cell"><b className={styles.mobileLabel}>الموقع</b>{question.region} · {question.city}<small>{formatRiyadhDateTime(question.createdAt)}</small></p><div role="cell"><b className={styles.mobileLabel}>الحالة</b><QuestionStatusBadge status={question.status} /></div><p className={styles.preview} role="cell"><b className={styles.mobileLabel}>السؤال</b>{question.question}</p><div role="cell"><button className={styles.textButton} onClick={() => onSelect(question)}>عرض السؤال</button></div></article>)}</div>; }

function QuestionDetail({ question: listQuestion, onClose, onChanged, onDeleted, onUnauthorized }: { question: WeeklyLiveQuestion; onClose: () => void; onChanged: (question: WeeklyLiveQuestion) => void; onDeleted: () => void; onUnauthorized: () => void }) {
  const handleUnauthorized = useUnauthorizedRedirect(); const [question, setQuestion] = useState<WeeklyLiveQuestion>(listQuestion); const [status, setStatus] = useState(listQuestion.status); const [moderated, setModerated] = useState(listQuestion.moderatedQuestion ?? ""); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null); const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { const controller = new AbortController(); void getWeeklyLiveQuestion(listQuestion.id, controller.signal).then((response) => { setQuestion(response.question); setStatus(response.question.status); setModerated(response.question.moderatedQuestion ?? ""); setLoading(false); }).catch((caught) => { if (controller.signal.aborted) return; if (handleUnauthorized(caught)) { onUnauthorized(); return; } setError(messageFor(caught, "question")); setLoading(false); }); return () => controller.abort(); }, [handleUnauthorized, listQuestion.id, onUnauthorized]);
  const save = async () => { const update = { ...(status !== question.status ? { status } : {}), ...(moderated.trim() !== (question.moderatedQuestion ?? "") ? { moderatedQuestion: moderated.trim() || null } : {}) }; if (!Object.keys(update).length) return; setSaving(true); setError(null); try { const response = await updateWeeklyLiveQuestion(question.id, update); setQuestion(response.question); setStatus(response.question.status); setModerated(response.question.moderatedQuestion ?? ""); onChanged(response.question); } catch (caught) { if (!handleUnauthorized(caught)) setError(messageFor(caught, "question")); else onUnauthorized(); } finally { setSaving(false); } };
  const remove = async () => { setSaving(true); try { await deleteWeeklyLiveQuestion(question.id); setConfirmDelete(false); onDeleted(); } catch (caught) { if (!handleUnauthorized(caught)) setError(messageFor(caught, "question")); else onUnauthorized(); } finally { setSaving(false); } };
  return <aside className={styles.detail} aria-label="تفاصيل السؤال"><div className={styles.detailHeader}><h3>بيانات السؤال</h3><button className={styles.textButton} onClick={onClose}>إغلاق</button></div>{loading ? <p aria-live="polite">جارٍ تحميل السؤال…</p> : null}{error ? <p className={styles.formError} role="alert">{error}</p> : null}{!loading ? <><dl className={styles.detailMeta}><div><dt>الاسم الأول / الاسم المستعار</dt><dd>{question.displayName}</dd></div><div><dt>العمر</dt><dd>{question.age}</dd></div><div><dt>المنطقة والمدينة</dt><dd>{question.region} · {question.city}</dd></div><div><dt>تاريخ الإرسال</dt><dd>{formatRiyadhDateTime(question.createdAt)}</dd></div></dl><h4>السؤال الأصلي</h4><p className={styles.originalQuestion}>{question.question}</p><p className={styles.readOnly}>هذا النص للقراءة فقط ولا يمكن تعديله.</p><label>الحالة<select value={status} onChange={(event) => setStatus(event.target.value as WeeklyLiveQuestionStatus)}>{(Object.keys(questionStatusLabels) as WeeklyLiveQuestionStatus[]).map((value) => <option key={value} value={value}>{questionStatusLabels[value]}</option>)}</select></label><label>الصياغة المعدلة للعرض<textarea value={moderated} maxLength={2000} onChange={(event) => setModerated(event.target.value)} placeholder="يمكن إعادة صياغة السؤال لإخفاء التفاصيل الشخصية قبل قراءته في اللقاء، دون تغيير السؤال الأصلي." /></label><p className={styles.audit}>تم تسجيل الموافقة · {question.privacyNoticeVersion}</p><div className={styles.detailActions}><button className={styles.primaryButton} disabled={saving} onClick={() => void save()}>حفظ التعديل</button><button className={styles.dangerButton} disabled={saving} onClick={() => setConfirmDelete(true)}><Trash2 size={16} aria-hidden="true" />حذف السؤال</button></div></> : null}<ConfirmDialog isOpen={confirmDelete} title="حذف السؤال؟" description="سيُحذف هذا السؤال نهائيًا ولا يمكن التراجع عن الحذف." confirmLabel="حذف نهائي" destructive isSubmitting={saving} onConfirm={() => void remove()} onClose={() => setConfirmDelete(false)} /></aside>;
}

function Pagination({ pagination, onPage, label }: { pagination: { page: number; totalPages: number; total: number }; onPage: (page: number) => void; label: string }) { return <nav className={styles.pagination} aria-label={label}><button className={styles.secondaryButton} disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)}>السابق</button><p>صفحة {pagination.page} من {pagination.totalPages} · {pagination.total} سجل</p><button className={styles.secondaryButton} disabled={pagination.page >= pagination.totalPages} onClick={() => onPage(pagination.page + 1)}>التالي</button></nav>; }
