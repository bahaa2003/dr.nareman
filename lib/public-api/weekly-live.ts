import { getBackendUrl } from "@/lib/backend-origin";
import type {
  PublicWeeklyLiveCurrentResponse,
  PublicWeeklyLiveQuestionInput,
  PublicWeeklyLiveSubmissionResponse
} from "@/types/public-weekly-live";

export class PublicWeeklyLiveApiError extends Error {
  constructor(public readonly status: number) {
    super("Public weekly live request failed");
  }
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return await response.json() as T;
  } catch {
    throw new Error("Public weekly live response is invalid");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPublicLive(value: unknown) {
  if (value === null) return null;
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.title !== "string" || typeof value.scheduledAt !== "string" || value.timezone !== "Asia/Riyadh" || typeof value.acceptingQuestions !== "boolean") {
    throw new Error("Public weekly live response is invalid");
  }
  return { id: value.id, title: value.title, scheduledAt: value.scheduledAt, timezone: "Asia/Riyadh" as const, acceptingQuestions: value.acceptingQuestions };
}

function toSubmissionEvent(value: unknown) {
  if (!isRecord(value) || typeof value.title !== "string" || typeof value.scheduledAt !== "string" || value.timezone !== "Asia/Riyadh") {
    throw new Error("Public weekly live response is invalid");
  }
  return { title: value.title, scheduledAt: value.scheduledAt, timezone: "Asia/Riyadh" as const };
}

export async function getCurrentWeeklyLive(): Promise<PublicWeeklyLiveCurrentResponse> {
  const response = await fetch(getBackendUrl("/api/weekly-live/current"), {
    headers: { Accept: "application/json" }, credentials: "omit", cache: "no-store"
  });
  if (!response.ok) throw new PublicWeeklyLiveApiError(response.status);
  const payload = await readJson<unknown>(response);
  if (!isRecord(payload) || payload.success !== true || !("live" in payload)) throw new Error("Public weekly live response is invalid");
  return { success: true, live: toPublicLive(payload.live) };
}

export async function submitWeeklyLiveQuestion(
  liveId: string,
  input: PublicWeeklyLiveQuestionInput
): Promise<PublicWeeklyLiveSubmissionResponse> {
  const response = await fetch(getBackendUrl(`/api/weekly-live/${encodeURIComponent(liveId)}/questions`), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    credentials: "omit",
    cache: "no-store",
    body: JSON.stringify(input)
  });
  if (!response.ok) throw new PublicWeeklyLiveApiError(response.status);
  const payload = await readJson<unknown>(response);
  if (!isRecord(payload) || payload.success !== true || typeof payload.submissionId !== "string" || typeof payload.joinUrl !== "string" || !isRecord(payload.event)) throw new Error("Public weekly live response is invalid");
  return { success: true, submissionId: payload.submissionId, joinUrl: payload.joinUrl, event: toSubmissionEvent(payload.event) };
}
