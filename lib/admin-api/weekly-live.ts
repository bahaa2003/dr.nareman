import type {
  AdminWeeklyLiveInput,
  AdminWeeklyLiveListResponse,
  AdminWeeklyLiveQuestionFilters,
  AdminWeeklyLiveQuestionListResponse,
  AdminWeeklyLiveQuestionResponse,
  AdminWeeklyLiveQuestionUpdateInput,
  AdminWeeklyLiveResponse,
  AdminWeeklyLiveUpdateInput,
  WeeklyLiveQuestionStatus
} from "@/types/admin";

import { ApiError, apiRequest } from "./client";

const questionStatuses: readonly WeeklyLiveQuestionStatus[] = ["new", "selected", "answered", "archived"];

function appendPositiveInteger(query: URLSearchParams, name: "page" | "limit", value: number | undefined): void {
  const maximum = name === "limit" ? 100 : Number.MAX_SAFE_INTEGER;
  if (value !== undefined && Number.isSafeInteger(value) && value >= 1 && value <= maximum) {
    query.set(name, String(value));
  }
}

function appendTrimmed(query: URLSearchParams, name: "region" | "city" | "search", value: string | undefined, maximum: number): void {
  const normalized = value?.trim();
  if (normalized && normalized.length <= maximum) query.set(name, normalized);
}

function getRequired<T>(response: T | undefined, fallback: string): T {
  if (!response) throw new ApiError(500, fallback);
  return response;
}

export async function listWeeklyLives(page = 1, limit = 20, signal?: AbortSignal): Promise<AdminWeeklyLiveListResponse> {
  const query = new URLSearchParams();
  appendPositiveInteger(query, "page", page);
  appendPositiveInteger(query, "limit", limit);
  return getRequired(
    await apiRequest<AdminWeeklyLiveListResponse>(`/api/admin/weekly-live?${query.toString()}`, { method: "GET", signal }),
    "تعذر تحميل اللقاءات الآن. حاول مرة أخرى."
  );
}

export async function getWeeklyLive(id: string, signal?: AbortSignal): Promise<AdminWeeklyLiveResponse> {
  return getRequired(
    await apiRequest<AdminWeeklyLiveResponse>(`/api/admin/weekly-live/${encodeURIComponent(id)}`, { method: "GET", signal }),
    "تعذر تحميل اللقاء الآن. حاول مرة أخرى."
  );
}

export async function createWeeklyLive(input: AdminWeeklyLiveInput): Promise<AdminWeeklyLiveResponse> {
  return getRequired(
    await apiRequest<AdminWeeklyLiveResponse>("/api/admin/weekly-live", { method: "POST", body: input }),
    "تعذر إنشاء اللقاء الآن. حاول مرة أخرى."
  );
}

export async function updateWeeklyLive(id: string, input: AdminWeeklyLiveUpdateInput): Promise<AdminWeeklyLiveResponse> {
  return getRequired(
    await apiRequest<AdminWeeklyLiveResponse>(`/api/admin/weekly-live/${encodeURIComponent(id)}`, { method: "PATCH", body: input }),
    "تعذر حفظ اللقاء الآن. حاول مرة أخرى."
  );
}

export async function listWeeklyLiveQuestions(
  weeklyLiveId: string,
  params: AdminWeeklyLiveQuestionFilters,
  signal?: AbortSignal
): Promise<AdminWeeklyLiveQuestionListResponse> {
  const query = new URLSearchParams();
  appendPositiveInteger(query, "page", params.page);
  appendPositiveInteger(query, "limit", params.limit);
  if (params.status && questionStatuses.includes(params.status)) query.set("status", params.status);
  appendTrimmed(query, "region", params.region, 80);
  appendTrimmed(query, "city", params.city, 100);
  if (params.minAge !== undefined && Number.isInteger(params.minAge) && params.minAge >= 18 && params.minAge <= 100) query.set("minAge", String(params.minAge));
  if (params.maxAge !== undefined && Number.isInteger(params.maxAge) && params.maxAge >= 18 && params.maxAge <= 100) query.set("maxAge", String(params.maxAge));
  if (params.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params.dateTo) query.set("dateTo", params.dateTo);
  appendTrimmed(query, "search", params.search, 100);
  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  return getRequired(
    await apiRequest<AdminWeeklyLiveQuestionListResponse>(`/api/admin/weekly-live/${encodeURIComponent(weeklyLiveId)}/questions${suffix}`, { method: "GET", signal }),
    "تعذر تحميل الأسئلة الآن. حاول مرة أخرى."
  );
}

export async function getWeeklyLiveQuestion(id: string, signal?: AbortSignal): Promise<AdminWeeklyLiveQuestionResponse> {
  return getRequired(
    await apiRequest<AdminWeeklyLiveQuestionResponse>(`/api/admin/weekly-live/questions/${encodeURIComponent(id)}`, { method: "GET", signal }),
    "تعذر تحميل السؤال الآن. حاول مرة أخرى."
  );
}

export async function updateWeeklyLiveQuestion(id: string, input: AdminWeeklyLiveQuestionUpdateInput): Promise<AdminWeeklyLiveQuestionResponse> {
  return getRequired(
    await apiRequest<AdminWeeklyLiveQuestionResponse>(`/api/admin/weekly-live/questions/${encodeURIComponent(id)}`, { method: "PATCH", body: input }),
    "تعذر حفظ السؤال الآن. حاول مرة أخرى."
  );
}

export async function deleteWeeklyLiveQuestion(id: string): Promise<void> {
  await apiRequest(`/api/admin/weekly-live/questions/${encodeURIComponent(id)}`, { method: "DELETE" });
}
