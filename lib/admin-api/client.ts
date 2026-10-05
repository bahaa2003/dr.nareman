import type { ApiErrorResponse } from "@/types/admin";
import { getBackendUrl } from "@/lib/backend-origin";

export { getBackendOrigin, getBackendUrl, resolveBackendAssetUrl } from "@/lib/backend-origin";

type JsonRequestBody = object;

export interface ApiRequestOptions extends Omit<RequestInit, "body" | "cache" | "credentials"> {
  body?: JsonRequestBody | FormData;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T | undefined> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const { body, ...requestOptions } = options;
  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    requestBody = JSON.stringify(body);
  }

  const response = await fetch(getBackendUrl(path), {
    ...requestOptions,
    body: requestBody,
    headers,
    credentials: "include",
    cache: "no-store"
  });

  if (response.status === 204) {
    return undefined;
  }

  const payload = await parseJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(payload));
  }

  return payload as T;
}

async function parseJsonResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function getErrorMessage(payload: unknown): string {
  if (isApiErrorResponse(payload)) {
    return payload.error.message;
  }

  return "تعذر إكمال الطلب. يرجى المحاولة مرة أخرى.";
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === false &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error &&
    typeof value.error.message === "string"
  );
}
