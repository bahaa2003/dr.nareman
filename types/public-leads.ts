export interface PublicLeadAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPath: "/ovulation-calculator" | "/weekly-live";
  referrerHost?: string;
  clickIds?: {
    gclid?: string;
    fbclid?: string;
    ttclid?: string;
    msclkid?: string;
  };
}

export type CalculatorLeadAttribution = PublicLeadAttribution & { landingPath: "/ovulation-calculator" };
export type WeeklyLiveLeadAttribution = PublicLeadAttribution & { landingPath: "/weekly-live" };

export interface CalculatorLeadInput {
  name: string;
  phone: string;
  email?: string;
  source: "ovulation_calculator";
  privacyNoticeAccepted: true;
  marketingConsent: boolean;
  attribution: CalculatorLeadAttribution;
}

export interface PublicLeadCreateResponse {
  success: true;
  lead: {
    id: string;
  };
}
