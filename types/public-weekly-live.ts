export interface PublicWeeklyLive {
  id: string;
  title: string;
  scheduledAt: string;
  timezone: "Asia/Riyadh";
  acceptingQuestions: boolean;
}

export interface PublicWeeklyLiveCurrentResponse {
  success: true;
  live: PublicWeeklyLive | null;
}

export interface PublicWeeklyLiveQuestionInput {
  contactName: string;
  phone: string;
  email?: string;
  displayName: string;
  age: number;
  region: string;
  city: string;
  question: string;
  consent: true;
  privacyNoticeAccepted: true;
  marketingConsent: boolean;
  attribution?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
    utmTerm?: string;
    landingPath: "/weekly-live";
    referrerHost?: string;
    clickIds?: {
      gclid?: string;
      fbclid?: string;
      ttclid?: string;
      msclkid?: string;
    };
  };
}

export interface PublicWeeklyLiveSubmissionResponse {
  success: true;
  submissionId: string;
  joinUrl: string;
  event: Pick<PublicWeeklyLive, "title" | "scheduledAt" | "timezone">;
}
