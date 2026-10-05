import type { AdminIdentity, AdminIdentityResponse, AdminLoginInput } from "@/types/admin";

import { ApiError, apiRequest } from "./client";

function getAdminFromResponse(response: AdminIdentityResponse | undefined): AdminIdentity {
  if (!response) {
    throw new ApiError(500, "تعذر إكمال طلب المصادقة. يرجى المحاولة مرة أخرى.");
  }

  return response.admin;
}

export async function loginAdmin(input: AdminLoginInput): Promise<AdminIdentity> {
  const response = await apiRequest<AdminIdentityResponse>("/api/admin/auth/login", {
    method: "POST",
    body: input
  });

  return getAdminFromResponse(response);
}

export async function getCurrentAdmin(): Promise<AdminIdentity> {
  const response = await apiRequest<AdminIdentityResponse>("/api/admin/auth/me");

  return getAdminFromResponse(response);
}

export async function logoutAdmin(): Promise<void> {
  await apiRequest<void>("/api/admin/auth/logout", { method: "POST" });
}
