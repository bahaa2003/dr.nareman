import type { CalculatorLeadAttribution, PublicLeadAttribution, WeeklyLiveLeadAttribution } from "@/types/public-leads";

const parameterNames = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
  "ttclid",
  "msclkid"
] as const;

type AttributionParameterName = (typeof parameterNames)[number];
type SearchParameterInput = URLSearchParams | Record<string, string | string[] | undefined>;

const utmMapping = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm"
} as const;

const clickIdMapping = {
  gclid: "gclid",
  fbclid: "fbclid",
  ttclid: "ttclid",
  msclkid: "msclkid"
} as const;

function getParameter(input: SearchParameterInput, name: AttributionParameterName): string | undefined {
  const value = input instanceof URLSearchParams ? input.get(name) : input[name];
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate?.trim();
  const maximum = name.startsWith("utm_") ? 200 : 512;

  return normalized && normalized.length <= maximum ? normalized : undefined;
}

function allowedParameters(input: SearchParameterInput): Array<[AttributionParameterName, string]> {
  return parameterNames.flatMap((name) => {
    const value = getParameter(input, name);
    return value ? [[name, value]] : [];
  });
}

function referrerHost(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) return undefined;

  try {
    const host = new URL(document.referrer).hostname.toLowerCase();
    return host && host.length <= 253 ? host : undefined;
  } catch {
    return undefined;
  }
}

export function getMarketingAttribution<T extends PublicLeadAttribution["landingPath"]>(
  search: URLSearchParams,
  landingPath: T
): PublicLeadAttribution & { landingPath: T } {
  const attribution: PublicLeadAttribution & { landingPath: T } = { landingPath };
  const clickIds: NonNullable<PublicLeadAttribution["clickIds"]> = {};

  for (const [parameter, value] of allowedParameters(search)) {
    if (parameter in utmMapping) {
      attribution[utmMapping[parameter as keyof typeof utmMapping]] = value;
    } else {
      clickIds[clickIdMapping[parameter as keyof typeof clickIdMapping]] = value;
    }
  }

  if (Object.keys(clickIds).length > 0) attribution.clickIds = clickIds;
  const host = referrerHost();
  if (host) attribution.referrerHost = host;
  return attribution;
}

export function getCalculatorAttributionFromLocation(): CalculatorLeadAttribution {
  return getMarketingAttribution(new URLSearchParams(typeof window === "undefined" ? "" : window.location.search), "/ovulation-calculator");
}

export function getWeeklyLiveAttributionFromLocation(): WeeklyLiveLeadAttribution {
  return getMarketingAttribution(new URLSearchParams(typeof window === "undefined" ? "" : window.location.search), "/weekly-live");
}

export function hasMarketingAttribution(attribution: PublicLeadAttribution): boolean {
  return Boolean(
    attribution.utmSource
    || attribution.utmMedium
    || attribution.utmCampaign
    || attribution.utmContent
    || attribution.utmTerm
    || attribution.referrerHost
    || Object.keys(attribution.clickIds ?? {}).length
  );
}

export function buildCalculatorAttributionSearch(input: SearchParameterInput): string {
  const query = new URLSearchParams();

  for (const [parameter, value] of allowedParameters(input)) {
    query.set(parameter, value);
  }

  const encoded = query.toString();
  return encoded ? "?" + encoded : "";
}
