"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Download, Eye, Trash2, UsersRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";

import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminSession } from "@/components/admin/AdminSessionContext";
import { deleteAdminLead, exportAdminLeads, getAdminLead, getAdminLeads, updateAdminLeadStatus } from "@/lib/admin-api/leads";
import { ApiError } from "@/lib/admin-api/client";
import type { AdminLead, AdminLeadFilters, AdminLeadListResponse, LeadSource, LeadStatus } from "@/types/admin";

import styles from "./AdminLeadsManager.module.css";

const pageSize = 20;
const leadSources: readonly LeadSource[] = ["ovulation_calculator", "weekly_live"];
const leadStatuses: readonly LeadStatus[] = ["new", "contacted", "qualified", "converted", "not_interested", "do_not_contact"];

interface ListState extends Omit<AdminLeadFilters, "page" | "limit"> { page: number; }

function readPage(value: string | null): number {
  if (!value || !/^[1-9]\d*$/u.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}

function readDate(value: string | null): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/u.test(value) ? value : undefined;
}

function readState(params: URLSearchParams | ReadonlyURLSearchParams): ListState {
  const source = params.get("source");
  const status = params.get("status");
  const consent = params.get("marketingConsent");
  const campaign = params.get("utmCampaign")?.trim();
  return {
    page: readPage(params.get("page")),
    ...(source && leadSources.includes(source as LeadSource) ? { source: source as LeadSource } : {}),
    ...(status && leadStatuses.includes(status as LeadStatus) ? { status: status as LeadStatus } : {}),
    ...(consent === "true" ? { marketingConsent: true } : consent === "false" ? { marketingConsent: false } : {}),
    ...(campaign && campaign.length <= 200 ? { utmCampaign: campaign } : {}),
    ...(readDate(params.get("dateFrom")) ? { dateFrom: readDate(params.get("dateFrom")) } : {}),
    ...(readDate(params.get("dateTo")) ? { dateTo: readDate(params.get("dateTo")) } : {})
  };
}

function sourceLabel(source: string): string {
  return source === "ovulation_calculator" ? "حاسبة التبويض" : source === "weekly_live" ? "اللايف الأسبوعي" : "مصدر غير معروف";
}

function statusLabel(status: string): string {
  const labels: Record<LeadStatus, string> = {
    new: "جديد", contacted: "تم التواصل", qualified: "مؤهل", converted: "تم التحويل", not_interested: "غير مهتم", do_not_contact: "عدم التواصل"
  };
  return status in labels ? labels[status as LeadStatus] : "حالة غير معروفة";
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function messageFor(error: unknown, context: "load" | "save" | "export" = "save"): string {
  if (error instanceof ApiError) {
    if (error.status === 400) return error.message || "تحقق من بيانات التصفية ثم حاول مرة أخرى.";
    if (error.status === 401) return "انتهت جلسة الإدارة. يرجى تسجيل الدخول مجددًا.";
    if (error.status === 403) return "غير مسموح بتنفيذ هذا الطلب.";
    if (error.status === 404) return "العميل المحتمل لم يعد موجودًا. حدّث القائمة وحاول مرة أخرى.";
  }
  return context === "load" ? "تعذر تحميل العملاء المحتملين الآن. حاول مرة أخرى." : context === "export" ? "تعذر تصدير العملاء المحتملين الآن. حاول مرة أخرى." : "تعذر حفظ التغيير الآن. حاول مرة أخرى.";
}

function FilterForm({ initial, onApply, onReset }: { initial: Omit<ListState, "page">; onApply: (filters: Omit<ListState, "page">) => void; onReset: () => void }) {
  const [source, setSource] = useState<LeadSource | "">(initial.source ?? "");
  const [status, setStatus] = useState<LeadStatus | "">(initial.status ?? "");
  const [consent, setConsent] = useState<"" | "true" | "false">(initial.marketingConsent === undefined ? "" : String(initial.marketingConsent) as "true" | "false");
  const [campaign, setCampaign] = useState(initial.utmCampaign ?? "");
  const [dateFrom, setDateFrom] = useState(initial.dateFrom ?? "");
  const [dateTo, setDateTo] = useState(initial.dateTo ?? "");
  const [error, setError] = useState<string | null>(null);
  const hasFilters = Boolean(initial.source || initial.status || initial.marketingConsent !== undefined || initial.utmCampaign || initial.dateFrom || initial.dateTo);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (dateFrom && dateTo && dateFrom > dateTo) return setError("يجب أن يكون تاريخ البداية قبل تاريخ النهاية أو مساويًا له.");
    setError(null);
    onApply({
      ...(source ? { source } : {}), ...(status ? { status } : {}), ...(consent ? { marketingConsent: consent === "true" } : {}),
      ...(campaign.trim() ? { utmCampaign: campaign.trim() } : {}), ...(dateFrom ? { dateFrom } : {}), ...(dateTo ? { dateTo } : {})
    });
  };

  return <form className={styles.filters} onSubmit={submit}>
    <div className={styles.filterField}><label htmlFor="lead-source">المصدر</label><select id="lead-source" value={source} onChange={(event) => setSource(event.target.value as LeadSource | "")}><option value="">الكل</option><option value="ovulation_calculator">حاسبة التبويض</option><option value="weekly_live">اللايف الأسبوعي</option></select></div>
    <div className={styles.filterField}><label htmlFor="lead-status">الحالة</label><select id="lead-status" value={status} onChange={(event) => setStatus(event.target.value as LeadStatus | "")}><option value="">الكل</option>{leadStatuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></div>
    <div className={styles.filterField}><label htmlFor="lead-consent">موافقة التواصل التسويقي</label><select id="lead-consent" value={consent} onChange={(event) => setConsent(event.target.value as "" | "true" | "false")}><option value="">الكل</option><option value="true">وافق على التواصل</option><option value="false">لم يوافق</option></select></div>
    <div className={styles.filterField}><label htmlFor="lead-campaign">UTM Campaign</label><input id="lead-campaign" value={campaign} maxLength={200} onChange={(event) => setCampaign(event.target.value)} placeholder="مطابقة تامة" /></div>
    <div className={styles.filterField}><label htmlFor="lead-date-from">تاريخ الإنشاء من</label><input id="lead-date-from" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></div>
    <div className={styles.filterField}><label htmlFor="lead-date-to">تاريخ الإنشاء إلى</label><input id="lead-date-to" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></div>
    <div className={styles.filterActions}><button className={styles.primaryButton} type="submit">تطبيق الفلاتر</button>{hasFilters ? <button className={styles.secondaryButton} type="button" onClick={onReset}>مسح الفلاتر</button> : null}</div>
    {error ? <p className={styles.filterError} role="alert">{error}</p> : null}
  </form>;
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const className = status === "do_not_contact" ? styles.doNotContact : status === "converted" ? styles.converted : status === "new" ? styles.newStatus : styles.neutralStatus;
  return <span className={`${styles.statusBadge} ${className}`}>{statusLabel(status)}</span>;
}

function ConsentBadge({ consent }: { consent: boolean }) {
  return <span className={`${styles.consentBadge} ${consent ? styles.consentYes : styles.consentNo}`}>{consent ? "وافق على التواصل التسويقي" : "لم يوافق على التواصل التسويقي"}</span>;
}

function LeadDetail({ id, onClose, onChanged, onUnauthorized }: { id: string; onClose: () => void; onChanged: (lead: AdminLead) => void; onUnauthorized: () => void }) {
  const [lead, setLead] = useState<AdminLead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<LeadStatus>("new");
  const [saving, setSaving] = useState(false);
  const [confirmDnc, setConfirmDnc] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    void getAdminLead(id, controller.signal).then((response) => { setLead(response.lead); setStatus(response.lead.status); setLoading(false); }).catch((caught) => {
      if (controller.signal.aborted) return;
      if (caught instanceof ApiError && caught.status === 401) { onUnauthorized(); return; }
      setError(messageFor(caught, "load")); setLoading(false);
    });
    return () => controller.abort();
  }, [id, onUnauthorized]);

  const saveStatus = async () => {
    if (!lead || status === lead.status) return;
    if (status === "do_not_contact") return setConfirmDnc(true);
    await commitStatus();
  };
  const commitStatus = async () => {
    if (!lead) return;
    setSaving(true); setError(null);
    try { const response = await updateAdminLeadStatus(lead.id, { status }); setLead(response.lead); onChanged(response.lead); setConfirmDnc(false); }
    catch (caught) { if (caught instanceof ApiError && caught.status === 401) onUnauthorized(); else setError(messageFor(caught)); }
    finally { setSaving(false); }
  };
  const fields: Array<[string, string | null]> = lead ? [
    ["UTM Source", lead.attribution.utmSource], ["UTM Medium", lead.attribution.utmMedium], ["UTM Campaign", lead.attribution.utmCampaign], ["UTM Content", lead.attribution.utmContent], ["UTM Term", lead.attribution.utmTerm], ["مسار الهبوط", lead.attribution.landingPath], ["المصدر المُحيل", lead.attribution.referrerHost], ["Google Click ID", lead.attribution.clickIds.gclid], ["Meta Click ID", lead.attribution.clickIds.fbclid], ["TikTok Click ID", lead.attribution.clickIds.ttclid], ["Microsoft Click ID", lead.attribution.clickIds.msclkid]
  ] : [];

  return <aside className={styles.detail} aria-labelledby="lead-detail-title">
    <header className={styles.detailHeader}><div><p className={styles.eyebrow}>تفاصيل العميل المحتمل</p><h2 id="lead-detail-title">{lead?.contact.name ?? "جارٍ التحميل"}</h2></div><button className={styles.textButton} type="button" onClick={onClose}>إغلاق</button></header>
    {loading ? <p aria-live="polite">جارٍ تحميل التفاصيل…</p> : null}
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    {lead ? <>
      <section><h3>التواصل</h3><dl className={styles.detailGrid}><div><dt>الاسم</dt><dd>{lead.contact.name}</dd></div><div><dt>الهاتف</dt><dd><a href={`tel:${lead.contact.phone}`}>{lead.contact.phone}</a></dd></div><div><dt>البريد الإلكتروني</dt><dd>{lead.contact.email ? <a href={`mailto:${lead.contact.email}`}>{lead.contact.email}</a> : "—"}</dd></div><div><dt>المنطقة / المدينة</dt><dd>{[lead.location.region, lead.location.city].filter(Boolean).join(" · ") || "—"}</dd></div></dl></section>
      <section><h3>الحالة والمصدر</h3><dl className={styles.detailGrid}><div><dt>المصدر</dt><dd>{sourceLabel(lead.source)}</dd></div><div><dt>الحالة</dt><dd><StatusBadge status={lead.status} /></dd></div><div><dt>تاريخ الإنشاء</dt><dd>{formatDate(lead.createdAt)}</dd></div><div><dt>آخر تحديث</dt><dd>{formatDate(lead.updatedAt)}</dd></div></dl><div className={styles.statusEditor}><label htmlFor="detail-lead-status">تحديث الحالة<select id="detail-lead-status" value={status} disabled={saving} onChange={(event) => setStatus(event.target.value as LeadStatus)}>{leadStatuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></label><button className={styles.primaryButton} type="button" disabled={saving || status === lead.status} onClick={() => void saveStatus()}>{saving ? "جارٍ الحفظ…" : "حفظ الحالة"}</button></div></section>
      <section><h3>الموافقات</h3><dl className={styles.detailGrid}><div><dt>إشعار الخصوصية</dt><dd>{formatDate(lead.privacyNoticeAcceptedAt)}</dd></div><div><dt>موافقة التسويق</dt><dd><ConsentBadge consent={lead.marketingConsent} /></dd></div><div><dt>تاريخ موافقة التسويق</dt><dd>{lead.marketingConsentAt ? formatDate(lead.marketingConsentAt) : "—"}</dd></div></dl></section>
      <section><h3>الإسناد التسويقي</h3><dl className={styles.detailGrid}>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>)}</dl></section>
    </> : null}
    <ConfirmDialog isOpen={confirmDnc} title="تعيين الحالة إلى عدم التواصل؟" description="سيُحتفَظ بسجل الموافقة كما هو، لكن هذه الحالة يجب أن تُحترم في أي متابعة تسويقية لاحقة." confirmLabel="تأكيد عدم التواصل" destructive isSubmitting={saving} onConfirm={() => void commitStatus()} onClose={() => setConfirmDnc(false)} />
  </aside>;
}

function LeadRow({ lead, onDetail, onDeleted, onChanged, onUnauthorized }: { lead: AdminLead; onDetail: (id: string) => void; onDeleted: () => void; onChanged: (lead: AdminLead) => void; onUnauthorized: () => void }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [pending, setPending] = useState<"status" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDnc, setConfirmDnc] = useState(false);
  const saveStatus = async () => {
    if (status === lead.status || pending) return;
    if (status === "do_not_contact") return setConfirmDnc(true);
    await commitStatus();
  };
  const commitStatus = async () => {
    setPending("status"); setError(null);
    try { const response = await updateAdminLeadStatus(lead.id, { status }); onChanged(response.lead); setConfirmDnc(false); }
    catch (caught) { if (caught instanceof ApiError && caught.status === 401) onUnauthorized(); else setError(messageFor(caught)); }
    finally { setPending(null); }
  };
  const remove = async () => {
    setPending("delete"); setError(null);
    try { await deleteAdminLead(lead.id); setConfirmDelete(false); onDeleted(); }
    catch (caught) { if (caught instanceof ApiError && caught.status === 401) onUnauthorized(); else { setConfirmDelete(false); setError(messageFor(caught)); } }
    finally { setPending(null); }
  };
  return <article className={styles.listRow} role="row">
    <div className={styles.contact} role="cell"><h2>{lead.contact.name}</h2><a href={`tel:${lead.contact.phone}`}>{lead.contact.phone}</a>{lead.contact.email ? <a href={`mailto:${lead.contact.email}`}>{lead.contact.email}</a> : null}</div>
    <div role="cell"><span className={styles.mobileLabel}>المصدر</span>{sourceLabel(lead.source)}{lead.attribution.utmCampaign ? <small>الحملة: {lead.attribution.utmCampaign}</small> : null}</div>
    <div role="cell"><span className={styles.mobileLabel}>الموافقة</span><ConsentBadge consent={lead.marketingConsent} /></div>
    <div role="cell"><span className={styles.mobileLabel}>الحالة</span><StatusBadge status={lead.status} /></div>
    <div className={styles.date} role="cell"><span className={styles.mobileLabel}>تاريخ الإنشاء</span>{formatDate(lead.createdAt)}</div>
    <div className={styles.actions} role="cell"><button className={styles.textButton} type="button" onClick={() => onDetail(lead.id)}><Eye size={16} aria-hidden="true" />التفاصيل</button><label className={styles.statusSelect} htmlFor={`lead-status-${lead.id}`}>تحديث الحالة<select id={`lead-status-${lead.id}`} value={status} disabled={pending !== null} onChange={(event) => setStatus(event.target.value as LeadStatus)}>{leadStatuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select></label><button className={styles.secondaryButton} type="button" disabled={pending !== null || status === lead.status} onClick={() => void saveStatus()}>{pending === "status" ? "جارٍ الحفظ…" : "حفظ"}</button><button className={styles.deleteButton} type="button" disabled={pending !== null} onClick={() => setConfirmDelete(true)}><Trash2 size={16} aria-hidden="true" />حذف</button>{error ? <p className={styles.rowError} role="alert">{error}</p> : null}</div>
    <ConfirmDialog isOpen={confirmDelete} title="حذف العميل المحتمل؟" description="سيُحذف سجل العميل المحتمل نهائيًا. لن يؤثر ذلك في أي مقالات أو لقاءات أو آراء." confirmLabel="حذف السجل" destructive isSubmitting={pending === "delete"} onConfirm={() => void remove()} onClose={() => setConfirmDelete(false)} />
    <ConfirmDialog isOpen={confirmDnc} title="تعيين الحالة إلى عدم التواصل؟" description="سيبقى تاريخ الموافقة محفوظًا، لكن حالة عدم التواصل يجب أن تُحترم عند أي متابعة لاحقة." confirmLabel="تأكيد عدم التواصل" destructive isSubmitting={pending === "status"} onConfirm={() => void commitStatus()} onClose={() => setConfirmDnc(false)} />
  </article>;
}

export function AdminLeadsManager() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleUnauthorized } = useAdminSession();
  const state = readState(searchParams);
  const [result, setResult] = useState<{ key: string; value: AdminLeadListResponse } | null>(null);
  const [loadError, setLoadError] = useState<{ key: string; message: string } | null>(null);
  const [retryVersion, setRetryVersion] = useState(0);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const requestId = useRef(0);
  const loadKey = `${state.page}|${state.source ?? ""}|${state.status ?? ""}|${state.marketingConsent ?? ""}|${state.utmCampaign ?? ""}|${state.dateFrom ?? ""}|${state.dateTo ?? ""}|${retryVersion}`;

  const navigate = useCallback((next: ListState) => {
    const query = new URLSearchParams();
    if (next.page > 1) query.set("page", String(next.page));
    if (next.source) query.set("source", next.source);
    if (next.status) query.set("status", next.status);
    if (next.marketingConsent !== undefined) query.set("marketingConsent", String(next.marketingConsent));
    if (next.utmCampaign) query.set("utmCampaign", next.utmCampaign);
    if (next.dateFrom) query.set("dateFrom", next.dateFrom);
    if (next.dateTo) query.set("dateTo", next.dateTo);
    router.push(`${pathname}${query.size ? `?${query.toString()}` : ""}`);
  }, [pathname, router]);

  const unauthorized = useCallback(() => { handleUnauthorized(); router.replace("/admin/login"); }, [handleUnauthorized, router]);

  useEffect(() => {
    const controller = new AbortController();
    const current = ++requestId.current;
    void getAdminLeads({ page: state.page, limit: pageSize, source: state.source, status: state.status, marketingConsent: state.marketingConsent, utmCampaign: state.utmCampaign, dateFrom: state.dateFrom, dateTo: state.dateTo }, controller.signal).then((response) => {
      if (current !== requestId.current) return;
      setResult({ key: loadKey, value: response }); setLoadError(null);
    }).catch((caught) => {
      if (controller.signal.aborted || current !== requestId.current) return;
      if (caught instanceof ApiError && caught.status === 401) { unauthorized(); return; }
      setLoadError({ key: loadKey, message: messageFor(caught, "load") });
    });
    return () => controller.abort();
  }, [loadKey, state.dateFrom, state.dateTo, state.marketingConsent, state.page, state.source, state.status, state.utmCampaign, unauthorized]);

  const hasFilters = Boolean(state.source || state.status || state.marketingConsent !== undefined || state.utmCampaign || state.dateFrom || state.dateTo);
  const activeResult = result?.key === loadKey ? result.value : null;
  const error = loadError?.key === loadKey ? loadError.message : null;
  const onLeadChanged = (lead: AdminLead) => { setResult((current) => current?.key === loadKey ? { ...current, value: { ...current.value, items: current.value.items.map((item) => item.id === lead.id ? lead : item) } } : current); setRetryVersion((value) => value + 1); };
  const afterDelete = () => { if (activeResult?.items.length === 1 && state.page > 1) navigate({ ...state, page: state.page - 1 }); else setRetryVersion((value) => value + 1); if (detailId) setDetailId(null); };
  const exportCsv = async () => {
    setExporting(true); setExportError(null);
    try {
      const { blob, filename } = await exportAdminLeads({
        source: state.source,
        status: state.status,
        marketingConsent: state.marketingConsent,
        utmCampaign: state.utmCampaign,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo
      });
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (caught) { if (caught instanceof ApiError && caught.status === 401) unauthorized(); else setExportError(messageFor(caught, "export")); }
    finally { setExporting(false); }
  };
  const loading = activeResult === null && error === null;

  return <section className={styles.page} aria-labelledby="leads-page-title" aria-busy={loading}>
    <header className={styles.pageHeader}><div><p className={styles.eyebrow}>التسويق</p><h1 id="leads-page-title">العملاء المحتملون</h1><p>تابع مصادر العملاء وحالاتهم وموافقات التواصل التسويقي.</p></div><div className={styles.exportArea}><button className={styles.primaryButton} type="button" disabled={exporting} aria-busy={exporting} onClick={() => void exportCsv()}><Download size={18} aria-hidden="true" />{exporting ? "جارٍ التصدير…" : "تصدير CSV"}</button><small>التصدير بحد أقصى 1000 سجل لكل ملف.</small></div></header>
    <FilterForm key={`${state.source ?? ""}-${state.status ?? ""}-${state.marketingConsent ?? ""}-${state.utmCampaign ?? ""}-${state.dateFrom ?? ""}-${state.dateTo ?? ""}`} initial={state} onApply={(filters) => navigate({ page: 1, ...filters })} onReset={() => navigate({ page: 1 })} />
    {exportError ? <p className={styles.error} role="alert">{exportError}</p> : null}
    {loading ? <section className={styles.loadingState} aria-live="polite">جارٍ تحميل العملاء المحتملين…</section> : null}
    {error ? <section className={styles.errorState} role="alert"><h2>تعذر تحميل العملاء المحتملين</h2><p>{error}</p><button className={styles.primaryButton} type="button" onClick={() => setRetryVersion((value) => value + 1)}>إعادة المحاولة</button></section> : null}
    {activeResult && !error ? <>{activeResult.items.length > 0 ? <div className={styles.list} role="table" aria-label="قائمة العملاء المحتملين"><div className={`${styles.listRow} ${styles.listHeader}`} role="row"><span role="columnheader">العميل</span><span role="columnheader">المصدر والحملة</span><span role="columnheader">الموافقة</span><span role="columnheader">الحالة</span><span role="columnheader">تاريخ الإنشاء</span><span role="columnheader">إجراءات</span></div>{activeResult.items.map((lead) => <LeadRow key={`${lead.id}-${lead.updatedAt}`} lead={lead} onDetail={setDetailId} onChanged={onLeadChanged} onDeleted={afterDelete} onUnauthorized={unauthorized} />)}</div> : <section className={styles.emptyState} aria-live="polite"><UsersRound size={30} aria-hidden="true" /><h2>{hasFilters ? "لا توجد نتائج مطابقة للفلاتر الحالية." : "لا يوجد عملاء محتملون حتى الآن."}</h2><p>{hasFilters ? "جرّب تغيير الفلاتر أو مسحها لعرض سجلات أخرى." : "ستظهر هنا الطلبات الواردة من مصادر التسويق عند توفرها."}</p>{hasFilters ? <button className={styles.secondaryButton} type="button" onClick={() => navigate({ page: 1 })}>مسح الفلاتر</button> : null}</section>}
      {activeResult.items.length > 0 ? <nav className={styles.pagination} aria-label="ترقيم صفحات العملاء المحتملين"><button className={styles.secondaryButton} type="button" disabled={activeResult.pagination.page <= 1} onClick={() => navigate({ ...state, page: activeResult.pagination.page - 1 })}>السابق</button><p>صفحة {activeResult.pagination.page} من {activeResult.pagination.totalPages} · {activeResult.pagination.total} سجل</p><button className={styles.secondaryButton} type="button" disabled={activeResult.pagination.page >= activeResult.pagination.totalPages} onClick={() => navigate({ ...state, page: activeResult.pagination.page + 1 })}>التالي</button></nav> : null}
    </> : null}
    {detailId ? <LeadDetail key={detailId} id={detailId} onClose={() => setDetailId(null)} onChanged={onLeadChanged} onUnauthorized={unauthorized} /> : null}
  </section>;
}
