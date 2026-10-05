import type {
  AdminTestimonial,
  AdminTestimonialListResponse,
  AdminTestimonialResponse,
  AdminTestimonialUpdateInput
} from "@/types/admin";

import { ApiError, apiRequest } from "./client";

export interface AdminTestimonialListParams {
  page?: number;
  limit?: number;
  isVisible?: boolean;
}

function required<T>(response: T | undefined, fallback: string): T {
  if (!response) {
    throw new ApiError(500, fallback);
  }

  return response;
}

export async function getAdminTestimonials(
  params: AdminTestimonialListParams = {},
  signal?: AbortSignal
): Promise<AdminTestimonialListResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined && Number.isSafeInteger(params.page) && params.page >= 1) query.set("page", String(params.page));
  if (params.limit !== undefined && Number.isSafeInteger(params.limit) && params.limit >= 1 && params.limit <= 100) query.set("limit", String(params.limit));
  if (params.isVisible !== undefined) query.set("isVisible", String(params.isVisible));
  const suffix = query.size ? `?${query.toString()}` : "";
  return required(
    await apiRequest<AdminTestimonialListResponse>(`/api/admin/testimonials${suffix}`, { method: "GET", signal }),
    "تعذر تحميل لقطات الآراء الآن. حاول مرة أخرى."
  );
}

export async function createAdminTestimonial(file: File, alt: string): Promise<AdminTestimonial> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("alt", alt);
  formData.append("privacyConfirmed", "true");
  formData.append("publicationApproved", "true");
  const response = await apiRequest<AdminTestimonialResponse>("/api/admin/testimonials", { method: "POST", body: formData });
  return required(response, "تعذر إضافة لقطة الرأي الآن. حاول مرة أخرى.").testimonial;
}

export async function updateAdminTestimonial(id: string, input: AdminTestimonialUpdateInput): Promise<AdminTestimonial> {
  const response = await apiRequest<AdminTestimonialResponse>(`/api/admin/testimonials/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: input
  });
  return required(response, "تعذر حفظ التغييرات الآن. حاول مرة أخرى.").testimonial;
}

export async function replaceAdminTestimonialImage(id: string, file: File, alt: string): Promise<AdminTestimonial> {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("alt", alt);
  formData.append("privacyConfirmed", "true");
  formData.append("publicationApproved", "true");
  const response = await apiRequest<AdminTestimonialResponse>(
    `/api/admin/testimonials/${encodeURIComponent(id)}/image`,
    { method: "PUT", body: formData }
  );
  return required(response, "تعذر استبدال لقطة الرأي الآن. حاول مرة أخرى.").testimonial;
}

export async function deleteAdminTestimonial(id: string): Promise<void> {
  await apiRequest(`/api/admin/testimonials/${encodeURIComponent(id)}`, { method: "DELETE" });
}
