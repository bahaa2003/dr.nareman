"use client";
/* eslint-disable @next/next/no-img-element -- Backend media URLs are runtime-configured. */

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Eye, EyeOff, ImagePlus, Images, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/components/admin/AdminSessionContext";
import {
  createAdminTestimonial,
  deleteAdminTestimonial,
  getAdminTestimonials,
  replaceAdminTestimonialImage,
  updateAdminTestimonial
} from "@/lib/admin-api/testimonials";
import { ApiError, resolveBackendAssetUrl } from "@/lib/admin-api/client";
import type { AdminTestimonial, AdminTestimonialListResponse } from "@/types/admin";

import styles from "./AdminTestimonialsManager.module.css";

const pageSize = 20;
const maxUploadBytes = 5 * 1024 * 1024;
const maxAltLength = 160;
const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type VisibilityFilter = "all" | "visible" | "hidden";
type PendingAction = "create" | "alt" | "order" | "visibility" | "replace" | "delete" | null;

function messageFor(error: unknown, action: "load" | "save" | "upload" = "save"): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return error.message || "تحقق من البيانات المدخلة ثم حاول مرة أخرى.";
    if (error.status === 401) return "انتهت جلسة الإدارة. يرجى تسجيل الدخول مجددًا.";
    if (error.status === 403) return "غير مسموح بتنفيذ هذا الطلب.";
    if (error.status === 404) return "لقطة الرأي لم تعد موجودة. حدّث القائمة وحاول مرة أخرى.";
    if (error.status === 413) return "حجم الصورة أكبر من الحد المسموح وهو 5 ميجابايت.";
    if (error.status === 415) return "صيغة الصورة غير مدعومة أو أن الملف ليس صورة صالحة. استخدم JPEG أو PNG أو WebP.";
  }
  return action === "load" ? "تعذر تحميل لقطات الآراء الآن. حاول مرة أخرى." : "تعذر إكمال الطلب الآن. حاول مرة أخرى.";
}

function fileError(file: File | undefined): string | null {
  if (!file) return "اختر صورة أولًا.";
  if (!acceptedImageTypes.has(file.type)) return "استخدم صورة بصيغة JPEG أو PNG أو WebP.";
  if (file.size > maxUploadBytes) return "حجم الصورة أكبر من الحد المسموح وهو 5 ميجابايت.";
  return null;
}

function validAlt(alt: string): string | null {
  if (!alt.trim()) return "النص الوصفي للصورة مطلوب.";
  if (alt.trim().length > maxAltLength) return `الحد الأقصى للنص الوصفي هو ${maxAltLength} حرفًا.`;
  return null;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(date);
}

function VisibilityBadge({ isVisible }: { isVisible: boolean }) {
  return <span className={`${styles.badge} ${isVisible ? styles.visible : styles.hidden}`}>{isVisible ? "ظاهر للعامة" : "مخفي عن العامة"}</span>;
}

function ConfirmationFields({ privacyConfirmed, publicationApproved, onPrivacyChange, onPublicationChange, prefix, disabled }: {
  privacyConfirmed: boolean;
  publicationApproved: boolean;
  onPrivacyChange: (value: boolean) => void;
  onPublicationChange: (value: boolean) => void;
  prefix: string;
  disabled: boolean;
}) {
  return <div className={styles.confirmations}>
    <label className={styles.checkLabel} htmlFor={`${prefix}-privacy`}>
      <input id={`${prefix}-privacy`} type="checkbox" checked={privacyConfirmed} disabled={disabled} onChange={(event) => onPrivacyChange(event.target.checked)} />
      <span><strong>أؤكد مراجعة الخصوصية</strong><small>أؤكد أن التفاصيل المعرِّفة أو الشخصية أُزيلت أو حُجبت بالشكل المناسب.</small></span>
    </label>
    <label className={styles.checkLabel} htmlFor={`${prefix}-approval`}>
      <input id={`${prefix}-approval`} type="checkbox" checked={publicationApproved} disabled={disabled} onChange={(event) => onPublicationChange(event.target.checked)} />
      <span><strong>أؤكد الموافقة على النشر</strong><small>أؤكد أن نسخة الصورة هذه مسموح ومعتمد نشرها للعامة.</small></span>
    </label>
  </div>;
}

function CreateTestimonial({ onCreated, onUnauthorized }: { onCreated: () => void; onUnauthorized: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [publicationApproved, setPublicationApproved] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const validation = fileError(file ?? undefined) ?? validAlt(alt);
    if (validation) return setError(validation);
    if (!privacyConfirmed || !publicationApproved) return setError("يلزم تأكيد مراجعة الخصوصية والموافقة على النشر قبل الرفع.");
    setPending(true); setError(null);
    try {
      await createAdminTestimonial(file as File, alt.trim());
      setFile(null); setAlt(""); setPrivacyConfirmed(false); setPublicationApproved(false);
      if (inputRef.current) inputRef.current.value = "";
      onCreated();
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) onUnauthorized(); else setError(messageFor(caught, "upload"));
    } finally { setPending(false); }
  };

  return <section className={styles.createPanel} aria-labelledby="testimonial-create-title">
    <header><p className={styles.eyebrow}>إضافة لقطة جديدة</p><h2 id="testimonial-create-title">أضف رأيًا بصورة آمنة للنشر</h2></header>
    <p className={styles.privacyNotice}><EyeOff size={18} aria-hidden="true" />ارفع فقط نسخة مُعَدّة وآمنة للنشر. لا ترفع لقطة خاصة أصلية بهدف إخفاء بياناتها لاحقًا؛ لا توجد مراجعة أو طمس تلقائي داخل النظام.</p>
    <form className={styles.createForm} onSubmit={(event) => void submit(event)}>
      <label className={styles.field}>الصورة <span>JPEG أو PNG أو WebP، حتى 5 ميجابايت</span><input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={(event: ChangeEvent<HTMLInputElement>) => { setFile(event.target.files?.[0] ?? null); setError(null); }} required /></label>
      <label className={styles.field}>النص الوصفي <span className={styles.counter}>{alt.length}/{maxAltLength}</span><input value={alt} maxLength={maxAltLength} required disabled={pending} onChange={(event) => { setAlt(event.target.value); setError(null); }} aria-describedby="testimonial-alt-help" /><small id="testimonial-alt-help">وصف قصير لما يظهر في الصورة لأغراض الوصول. لا تذكر اسمًا أو رقمًا أو تشخيصًا أو أي بيانات تعريفية.</small></label>
      <ConfirmationFields prefix="testimonial-create" privacyConfirmed={privacyConfirmed} publicationApproved={publicationApproved} onPrivacyChange={setPrivacyConfirmed} onPublicationChange={setPublicationApproved} disabled={pending} />
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button className={styles.primaryButton} type="submit" disabled={pending} aria-busy={pending}>{pending ? "جارٍ الرفع…" : "رفع لقطة مخفية"}</button>
    </form>
  </section>;
}

function TestimonialCard({ testimonial, onChanged, onDeleted, onUnauthorized }: {
  testimonial: AdminTestimonial;
  onChanged: (testimonial: AdminTestimonial, message: string) => void;
  onDeleted: () => void;
  onUnauthorized: () => void;
}) {
  const [alt, setAlt] = useState(testimonial.image.alt);
  const [sortOrder, setSortOrder] = useState(String(testimonial.sortOrder));
  const [replacementFile, setReplacementFile] = useState<File | null>(null);
  const [replacementAlt, setReplacementAlt] = useState(testimonial.image.alt);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [publicationApproved, setPublicationApproved] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmVisibility, setConfirmVisibility] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const replacementInputRef = useRef<HTMLInputElement>(null);
  const isPending = pending !== null;

  const update = async (input: { alt?: string; sortOrder?: number; isVisible?: boolean }, action: Exclude<PendingAction, null>, success: string) => {
    if (isPending) return;
    setPending(action); setError(null); setMessage(null);
    try { onChanged(await updateAdminTestimonial(testimonial.id, input), success); }
    catch (caught) { if (caught instanceof ApiError && caught.status === 401) onUnauthorized(); else setError(messageFor(caught)); }
    finally { setPending(null); }
  };
  const saveAlt = () => { const validation = validAlt(alt); if (validation) return setError(validation); if (alt.trim() === testimonial.image.alt) return setMessage("لا توجد تغييرات للنص الوصفي."); void update({ alt: alt.trim() }, "alt", "تم تحديث النص الوصفي."); };
  const saveOrder = () => { const value = Number(sortOrder); if (!Number.isInteger(value) || value < 0 || value > 1_000_000) return setError("أدخل رقم ترتيب صحيحًا بين 0 و1000000."); if (value === testimonial.sortOrder) return setMessage("لا توجد تغييرات للترتيب."); void update({ sortOrder: value }, "order", "تم تحديث الترتيب."); };
  const replace = async () => {
    const validation = fileError(replacementFile ?? undefined) ?? validAlt(replacementAlt);
    if (validation) return setError(validation);
    if (!privacyConfirmed || !publicationApproved) return setError("يلزم تأكيد الخصوصية والموافقة على النشر مجددًا للصورة البديلة.");
    setPending("replace"); setError(null); setMessage(null);
    try {
      const updated = await replaceAdminTestimonialImage(testimonial.id, replacementFile as File, replacementAlt.trim());
      setReplacementFile(null); setPrivacyConfirmed(false); setPublicationApproved(false);
      if (replacementInputRef.current) replacementInputRef.current.value = "";
      onChanged(updated, "تم استبدال الصورة وتسجيل تأكيدات جديدة.");
    } catch (caught) { if (caught instanceof ApiError && caught.status === 401) onUnauthorized(); else setError(messageFor(caught, "upload")); }
    finally { setPending(null); }
  };
  const remove = async () => {
    setPending("delete"); setError(null);
    try { await deleteAdminTestimonial(testimonial.id); setConfirmDelete(false); onDeleted(); }
    catch (caught) { if (caught instanceof ApiError && caught.status === 401) onUnauthorized(); else { setConfirmDelete(false); setError(messageFor(caught)); } }
    finally { setPending(null); }
  };

  return <article className={styles.card}>
    <div className={styles.preview}><img src={resolveBackendAssetUrl(testimonial.image.url)} alt={testimonial.image.alt} /><a href={resolveBackendAssetUrl(testimonial.image.url)} target="_blank" rel="noreferrer">فتح معاينة كاملة</a></div>
    <div className={styles.cardBody}>
      <div className={styles.cardHeader}><div><VisibilityBadge isVisible={testimonial.isVisible} /><p>الترتيب: {testimonial.sortOrder}</p></div><div className={styles.cardActions}><button type="button" className={styles.secondaryButton} disabled={isPending} onClick={() => { setError(null); setConfirmVisibility(true); }}>{testimonial.isVisible ? <><EyeOff size={16} aria-hidden="true" />إخفاء</> : <><Eye size={16} aria-hidden="true" />إظهار للعامة</>}</button><button type="button" className={styles.dangerButton} disabled={isPending} onClick={() => { setError(null); setConfirmDelete(true); }}><Trash2 size={16} aria-hidden="true" />حذف</button></div></div>
      <dl className={styles.meta}><div><dt>تأكيد الخصوصية</dt><dd>{formatDate(testimonial.privacyConfirmedAt)}</dd></div><div><dt>اعتماد النشر</dt><dd>{formatDate(testimonial.publicationApprovedAt)}</dd></div></dl>
      <div className={styles.editGrid}>
        <label className={styles.field}>النص الوصفي <span className={styles.counter}>{alt.length}/{maxAltLength}</span><input value={alt} maxLength={maxAltLength} disabled={isPending} onChange={(event) => { setAlt(event.target.value); setError(null); }} /></label>
        <button type="button" className={styles.secondaryButton} disabled={isPending} aria-busy={pending === "alt"} onClick={saveAlt}><Pencil size={16} aria-hidden="true" />{pending === "alt" ? "جارٍ الحفظ…" : "حفظ الوصف"}</button>
        <label className={styles.field}>ترتيب الظهور<input type="number" min="0" max="1000000" step="1" inputMode="numeric" value={sortOrder} disabled={isPending} onChange={(event) => { setSortOrder(event.target.value); setError(null); }} /></label>
        <button type="button" className={styles.secondaryButton} disabled={isPending} aria-busy={pending === "order"} onClick={saveOrder}>حفظ الترتيب</button>
      </div>
      <details className={styles.replace}><summary><ImagePlus size={17} aria-hidden="true" />استبدال الصورة</summary><p>{testimonial.isVisible ? "هذه اللقطة ظاهرة للعامة حاليًا. بعد الاستبدال الناجح، يحتفظ الخادم بظهورها لأنك ستؤكد النسخة الجديدة أدناه." : "تتطلب الصورة البديلة تأكيدَي الخصوصية والموافقة من جديد."}</p><div className={styles.replaceForm}><label className={styles.field}>الصورة البديلة<input ref={replacementInputRef} type="file" accept="image/jpeg,image/png,image/webp" disabled={isPending} onChange={(event) => { setReplacementFile(event.target.files?.[0] ?? null); setError(null); }} /></label><label className={styles.field}>النص الوصفي للصورة البديلة <span className={styles.counter}>{replacementAlt.length}/{maxAltLength}</span><input value={replacementAlt} maxLength={maxAltLength} disabled={isPending} onChange={(event) => { setReplacementAlt(event.target.value); setError(null); }} /></label><ConfirmationFields prefix={`replace-${testimonial.id}`} privacyConfirmed={privacyConfirmed} publicationApproved={publicationApproved} onPrivacyChange={setPrivacyConfirmed} onPublicationChange={setPublicationApproved} disabled={isPending} /><button type="button" className={styles.primaryButton} disabled={isPending} aria-busy={pending === "replace"} onClick={() => void replace()}>{pending === "replace" ? "جارٍ الاستبدال…" : "استبدال الصورة"}</button></div></details>
      {message ? <p className={styles.success} role="status">{message}</p> : null}{error ? <p className={styles.error} role="alert">{error}</p> : null}
    </div>
    <ConfirmDialog isOpen={confirmVisibility} title={testimonial.isVisible ? "إخفاء لقطة الرأي؟" : "إظهار لقطة الرأي للعامة؟"} description={testimonial.isVisible ? "لن تظهر هذه اللقطة في الموقع العام بعد الإخفاء." : "قد تظهر هذه اللقطة في الموقع العام. تأكد من مراجعة الخصوصية واعتماد النشر قبل المتابعة."} confirmLabel={testimonial.isVisible ? "إخفاء اللقطة" : "إظهار للعامة"} isSubmitting={pending === "visibility"} onConfirm={() => { setConfirmVisibility(false); void update({ isVisible: !testimonial.isVisible }, "visibility", testimonial.isVisible ? "تم إخفاء لقطة الرأي." : "أصبحت لقطة الرأي ظاهرة للعامة."); }} onClose={() => setConfirmVisibility(false)} />
    <ConfirmDialog isOpen={confirmDelete} title="حذف لقطة الرأي نهائيًا؟" description="سيحذف الخادم السجل ويحاول تنظيف ملف الصورة المُدار. لا يمكن التراجع عن هذه العملية." confirmLabel="حذف اللقطة" destructive isSubmitting={pending === "delete"} onConfirm={() => void remove()} onClose={() => setConfirmDelete(false)} />
  </article>;
}

export function AdminTestimonialsManager() {
  const router = useRouter();
  const { handleUnauthorized } = useAdminSession();
  const [result, setResult] = useState<AdminTestimonialListResponse | null>(null);
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const requestId = useRef(0);
  const unauthorized = useCallback(() => { handleUnauthorized(); router.replace("/admin/login"); }, [handleUnauthorized, router]);
  const refresh = useCallback(() => setReload((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController(); const currentId = ++requestId.current;
    void getAdminTestimonials({ page, limit: pageSize, ...(filter === "all" ? {} : { isVisible: filter === "visible" }) }, controller.signal).then((response) => {
      if (currentId === requestId.current) { setResult(response); setError(null); }
    }).catch((caught) => {
      if (controller.signal.aborted || currentId !== requestId.current) return;
      if (caught instanceof ApiError && caught.status === 401) { unauthorized(); return; }
      setError(messageFor(caught, "load"));
    });
    return () => controller.abort();
  }, [filter, page, reload, unauthorized]);

  const changed = (testimonial: AdminTestimonial, message: string) => { setSuccess(message); setResult((current) => current ? { ...current, items: current.items.map((item) => item.id === testimonial.id ? testimonial : item).sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)) } : current); };
  const created = () => { setSuccess("تمت إضافة اللقطة وهي مخفية عن العامة حتى تختار إظهارها صراحةً."); setPage(1); refresh(); };
  const deleted = () => { setSuccess("تم حذف لقطة الرأي."); if (result?.items.length === 1 && page > 1) setPage((value) => value - 1); else refresh(); };

  return <section className={styles.page} aria-labelledby="testimonials-title">
    <header className={styles.header}><div><p className={styles.eyebrow}>الآراء والتجارب</p><h1 id="testimonials-title">إدارة لقطات آراء المراجعات</h1><p>تُدار اللقطات المعدّة للنشر فقط؛ تبقى الإضافات الجديدة مخفية حتى الإظهار الصريح.</p></div></header>
    <CreateTestimonial onCreated={created} onUnauthorized={unauthorized} />
    <section className={styles.listSection} aria-labelledby="testimonials-list-title"><div className={styles.listHeader}><div><h2 id="testimonials-list-title">اللقطات المضافة</h2><p>الترتيب الأصغر يظهر أولًا عند الاستخدام العام لاحقًا.</p></div><label className={styles.filterLabel}>عرض<select value={filter} onChange={(event) => { setFilter(event.target.value as VisibilityFilter); setPage(1); }}><option value="all">الكل</option><option value="visible">الظاهرة للعامة</option><option value="hidden">المخفية</option></select></label></div>
    {success ? <p className={styles.success} role="status">{success}</p> : null}
    {!result && !error ? <div className={styles.state} aria-live="polite">جارٍ تحميل لقطات الآراء…</div> : null}
    {error ? <div className={styles.errorState} role="alert"><p>{error}</p><button type="button" className={styles.primaryButton} onClick={refresh}>إعادة المحاولة</button></div> : null}
    {result?.items.length === 0 ? <div className={styles.state}><Images size={32} aria-hidden="true" /><h2>لا توجد لقطات آراء بعد</h2><p>{filter === "all" ? "ابدأ بإضافة أول لقطة مُعَدّة وآمنة للنشر." : "لا توجد لقطات تطابق هذا العرض."}</p></div> : null}
    {result && result.items.length > 0 ? <><div className={styles.cards}>{result.items.map((testimonial) => <TestimonialCard key={`${testimonial.id}-${testimonial.updatedAt}`} testimonial={testimonial} onChanged={changed} onDeleted={deleted} onUnauthorized={unauthorized} />)}</div><div className={styles.pagination}><button type="button" className={styles.secondaryButton} disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>السابق</button><span>صفحة {result.pagination.page} من {result.pagination.totalPages || 1}</span><button type="button" className={styles.secondaryButton} disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>التالي</button></div></> : null}
    </section>
  </section>;
}
