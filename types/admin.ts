export type ArticleStatus = "draft" | "published";

export interface AdminIdentity {
  id: string;
  email: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminIdentityResponse {
  success: true;
  admin: AdminIdentity;
}

export interface ArticleCoverImage {
  url: string;
  alt: string;
}

export interface ArticleVideo {
  id: string;
  url: string;
  originalName: string;
  mimeType: "video/mp4" | "video/webm";
  sizeBytes: number;
  createdAt: string;
}

export interface ArticleListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  status: ArticleStatus;
  publishedAt: string | null;
  readingTime: number;
  coverImage: ArticleCoverImage | null;
  videos: ArticleVideo[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminArticleListResponse {
  success: true;
  items: ArticleListItem[];
  pagination: Pagination;
}

export interface AdminArticleResponse {
  success: true;
  article: ArticleDetail;
}

export interface AdminArticleCreateInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  status?: ArticleStatus;
  seoTitle?: string;
  seoDescription?: string;
}

export type AdminArticleUpdateInput = Partial<AdminArticleCreateInput>;

export interface AdminArticleEditorInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type AdminArticleEditorUpdateInput = Partial<
  Omit<AdminArticleEditorInput, "seoTitle" | "seoDescription">
> & {
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export interface AdminArticlePublicationInput {
  status: ArticleStatus;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
  };
}

export interface TestimonialImage {
  url: string;
  alt: string;
}

export interface AdminTestimonial {
  id: string;
  image: TestimonialImage;
  isVisible: boolean;
  sortOrder: number;
  privacyConfirmedAt: string;
  publicationApprovedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTestimonialListResponse {
  success: true;
  items: AdminTestimonial[];
  pagination: Pagination;
}

export interface AdminTestimonialResponse {
  success: true;
  testimonial: AdminTestimonial;
}

export interface AdminTestimonialUpdateInput {
  alt?: string;
  isVisible?: boolean;
  sortOrder?: number;
}

export type WeeklyLiveQuestionStatus = "new" | "selected" | "answered" | "archived";

export interface WeeklyLive {
  id: string;
  title: string;
  scheduledAt: string;
  timezone: "Asia/Riyadh";
  meetingUrl: string;
  isVisible: boolean;
  acceptingQuestions: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminWeeklyLiveListResponse {
  success: true;
  items: WeeklyLive[];
  pagination: Pagination;
}

export interface AdminWeeklyLiveResponse {
  success: true;
  live: WeeklyLive;
}

export interface AdminWeeklyLiveInput {
  title: string;
  scheduledAt: string;
  meetingUrl: string;
  isVisible: boolean;
  acceptingQuestions: boolean;
}

export type AdminWeeklyLiveUpdateInput = Partial<AdminWeeklyLiveInput>;

export interface WeeklyLiveQuestion {
  id: string;
  weeklyLiveId: string;
  displayName: string;
  age: number;
  region: string;
  city: string;
  question: string;
  status: WeeklyLiveQuestionStatus;
  moderatedQuestion: string | null;
  consentAt: string;
  privacyNoticeVersion: "weekly-live-v1";
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyLiveQuestionDetail extends WeeklyLiveQuestion {
  weeklyLive: Pick<WeeklyLive, "id" | "title" | "scheduledAt" | "timezone">;
}

export interface AdminWeeklyLiveQuestionListResponse {
  success: true;
  items: WeeklyLiveQuestion[];
  pagination: Pagination;
}

export interface AdminWeeklyLiveQuestionResponse {
  success: true;
  question: WeeklyLiveQuestionDetail | WeeklyLiveQuestion;
}

export interface AdminWeeklyLiveQuestionUpdateInput {
  status?: WeeklyLiveQuestionStatus;
  moderatedQuestion?: string | null;
}

export type LeadSource = "ovulation_calculator" | "weekly_live";
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "not_interested" | "do_not_contact";

export interface AdminLead {
  id: string;
  contact: { name: string; phone: string; email: string | null };
  location: { region: string | null; city: string | null };
  source: LeadSource;
  attribution: {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
    landingPath: string | null;
    referrerHost: string | null;
    clickIds: { gclid: string | null; fbclid: string | null; ttclid: string | null; msclkid: string | null };
  };
  privacyNoticeAcceptedAt: string;
  marketingConsent: boolean;
  marketingConsentAt: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLeadListResponse {
  success: true;
  items: AdminLead[];
  pagination: Pagination;
}

export interface AdminLeadResponse {
  success: true;
  lead: AdminLead;
}

export interface AdminLeadStatusUpdateInput {
  status: LeadStatus;
}

export interface AdminLeadFilters {
  page?: number;
  limit?: number;
  source?: LeadSource;
  status?: LeadStatus;
  marketingConsent?: boolean;
  utmCampaign?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminWeeklyLiveQuestionFilters {
  page?: number;
  limit?: number;
  status?: WeeklyLiveQuestionStatus;
  region?: string;
  city?: string;
  minAge?: number;
  maxAge?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
