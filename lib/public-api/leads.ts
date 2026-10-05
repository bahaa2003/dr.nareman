import { getBackendUrl } from "@/lib/backend-origin";
import type { CalculatorLeadInput, PublicLeadCreateResponse } from "@/types/public-leads";

export class PublicLeadApiError extends Error {
  constructor(public readonly status: number) {
    super("Public Lead request failed");
  }
}

function isLeadResponse(value: unknown): value is PublicLeadCreateResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    value.success === true &&
    "lead" in value &&
    typeof value.lead === "object" &&
    value.lead !== null &&
    "id" in value.lead &&
    typeof value.lead.id === "string"
  );
}

export async function createCalculatorLead(input: CalculatorLeadInput): Promise<PublicLeadCreateResponse> {
  const response = await fetch(getBackendUrl("/api/leads"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    credentials: "omit",
    cache: "no-store",
    body: JSON.stringify(input)
  });

  if (!response.ok) throw new PublicLeadApiError(response.status);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Public Lead response is invalid");
  }

  if (!isLeadResponse(payload)) throw new Error("Public Lead response is invalid");
  return payload;
}
