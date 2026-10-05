import { getBackendUrl } from "@/lib/backend-origin";
import type { PublicTestimonial, PublicTestimonialListResponse } from "@/types/public-testimonials";

const MAXIMUM_LIMIT = 30;

export interface PublicTestimonialListParams {
  limit?: number;
}

export class PublicTestimonialApiError extends Error {
  constructor(public readonly status: number) {
    super("Public testimonial request failed");
    this.name = "PublicTestimonialApiError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toPublicTestimonial(value: unknown): PublicTestimonial {
  if (!isRecord(value) || typeof value.id !== "string" || !isRecord(value.image)) {
    throw new Error("Public testimonial response is invalid");
  }

  if (typeof value.image.url !== "string" || !value.image.url || typeof value.image.alt !== "string") {
    throw new Error("Public testimonial response is invalid");
  }

  return {
    id: value.id,
    image: {
      url: value.image.url,
      alt: value.image.alt
    }
  };
}

export async function getPublicTestimonials(
  params: PublicTestimonialListParams = {}
): Promise<PublicTestimonialListResponse> {
  const query = new URLSearchParams();
  const { limit } = params;

  if (limit !== undefined && Number.isSafeInteger(limit) && limit >= 1 && limit <= MAXIMUM_LIMIT) {
    query.set("limit", String(limit));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const response = await fetch(getBackendUrl(`/api/testimonials${suffix}`), {
    headers: { Accept: "application/json" },
    credentials: "omit",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new PublicTestimonialApiError(response.status);
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    throw new Error("Public testimonial response is invalid");
  }

  if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.items)) {
    throw new Error("Public testimonial response is invalid");
  }

  return {
    success: true,
    items: payload.items.map(toPublicTestimonial)
  };
}
