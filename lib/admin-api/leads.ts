import type {
  AdminLeadFilters,
  AdminLeadListResponse,
  AdminLeadResponse,
  AdminLeadStatusUpdateInput,
  LeadSource,
  LeadStatus
} from "@/types/admin";

import { getBackendUrl } from "@/lib/backend-origin";

import { ApiError, apiRequest } from "./client";

const leadSources: readonly LeadSource[] = ["ovulation_calculator", "weekly_live"];
const leadStatuses: readonly LeadStatus[] = ["new", "contacted", "qualified", "converted", "not_interested", "do_not_contact"];

function required<T>(response: T | undefined, fallback: string): T {
  if (!response) throw new ApiError(500, fallback);
  return response;
}

function appendPositiveInteger(query: URLSearchParams, name: "page" | "limit", value: number | undefined, maximum: number): void {
  if (value !== undefined && Number.isSafeInteger(value) && value >= 1 && value <= maximum) query.set(name, String(value));
}

function appendLeadFilters(query: URLSearchParams, filters: Omit<AdminLeadFilters, "page" | "limit">): void {
  if (filters.source && leadSources.includes(filters.source)) query.set("source", filters.source);
  if (filters.status && leadStatuses.includes(filters.status)) query.set("status", filters.status);
  if (filters.marketingConsent !== undefined) query.set("marketingConsent", String(filters.marketingConsent));
  const campaign = filters.utmCampaign?.trim();
  if (campaign && campaign.length <= 200) query.set("utmCampaign", campaign);
  const dateFrom = toFilterDate(filters.dateFrom, false);
  const dateTo = toFilterDate(filters.dateTo, true);
  if (dateFrom) query.set("dateFrom", dateFrom);
  if (dateTo) query.set("dateTo", dateTo);
}

function buildLeadQuery(filters: AdminLeadFilters, maximumLimit: number): string {
  const query = new URLSearchParams();
  appendPositiveInteger(query, "page", filters.page, Number.MAX_SAFE_INTEGER);
  appendPositiveInteger(query, "limit", filters.limit, maximumLimit);
  appendLeadFilters(query, filters);
  return query.size ? `?${query.toString()}` : "";
}

export async function getAdminLeads(filters: AdminLeadFilters, signal?: AbortSignal): Promise<AdminLeadListResponse> {
  return required(
    await apiRequest<AdminLeadListResponse>(`/api/admin/leads${buildLeadQuery(filters, 100)}`, { method: "GET", signal }),
    "تعذر تحميل العملاء المحتملين الآن. حاول مرة أخرى."
  );
}

export async function getAdminLead(id: string, signal?: AbortSignal): Promise<AdminLeadResponse> {
  return required(
    await apiRequest<AdminLeadResponse>(`/api/admin/leads/${encodeURIComponent(id)}`, { method: "GET", signal }),
    "تعذر تحميل بيانات العميل المحتمل الآن. حاول مرة أخرى."
  );
}

export async function updateAdminLeadStatus(id: string, input: AdminLeadStatusUpdateInput): Promise<AdminLeadResponse> {
  return required(
    await apiRequest<AdminLeadResponse>(`/api/admin/leads/${encodeURIComponent(id)}`, { method: "PATCH", body: input }),
    "تعذر تحديث حالة العميل المحتمل الآن. حاول مرة أخرى."
  );
}

export async function deleteAdminLead(id: string): Promise<void> {
  await apiRequest(`/api/admin/leads/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function exportAdminLeads(filters: Omit<AdminLeadFilters, "page" | "limit">): Promise<{ blob: Blob; filename: string }> {
  const response = await fetch(getBackendUrl(`/api/admin/leads/export.csv${buildLeadQuery({ ...filters, limit: 1_000 }, 1_000)}`), {
    method: "GET",
    headers: { Accept: "text/csv" },
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new ApiError(response.status, await exportErrorMessage(response));
  }

  if (!response.headers.get("content-type")?.includes("text/csv")) {
    throw new ApiError(500, "تعذر تجهيز ملف CSV الآن. حاول مرة أخرى.");
  }

  return { blob: await response.blob(), filename: safeFilename(response.headers.get("content-disposition")) };
}

async function exportErrorMessage(response: Response): Promise<string> {
  if (response.headers.get("content-type")?.includes("application/json")) {
    try {
      const payload = await response.json() as { error?: { message?: unknown } };
      if (typeof payload.error?.message === "string") return payload.error.message;
    } catch {
      // A controlled generic error is returned below.
    }
  }
  return "تعذر تصدير العملاء المحتملين الآن. حاول مرة أخرى.";
}

function safeFilename(contentDisposition: string | null): string {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/iu);
  const value = match?.[1];
  return value && /^[a-zA-Z0-9._-]+\.csv$/u.test(value) ? value : "leads-export.csv";
}

function toFilterDate(value: string | undefined, endOfDay: boolean): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) return undefined;
  return `${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`;
}
