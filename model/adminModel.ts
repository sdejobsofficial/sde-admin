import {
  EducationDetails,
  PreviousExperience,
  ProjectDetails,
  SocialLinks,
} from "@/model/userModel";

// ─── Shared ───────────────────────────────────────────────────────────────

export enum JobStatus {
  Draft = 0,
  PendingApproval = 1,
  Active = 2,
  Paused = 3,
  Closed = 4,
  Rejected = 5,
}

export interface Paginated<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

// ─────────────────────────────────────────────────────────────────────────
// RAW DB ROW TYPES (snake_case — what Supabase returns)
// ─────────────────────────────────────────────────────────────────────────

export interface RawSocialLinks {
  linked_in?: string;
  git_hub?: string;
  portfolio?: string;
  twitter?: string;
  website?: string;
}

export interface RawEducation {
  college?: string;
  course?: string;
  specialization?: string;
  field_of_study?: string;
  starting_year?: number;
  graduation_year?: number;
  grading_system?: number;
  gpa?: number;
  course_type?: string;
  highest_qualificaiton?: string;
}

export interface RawExperience {
  company_name?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  currently_working?: boolean;
  description?: string;
}

export interface RawProject {
  title?: string;
  description?: string;
  link?: string;
}

export interface RawSubscription {
  plan?: number;
  status?: number;
  current_period_start?: string;
  current_period_end?: string;
  cancelled_at?: string;
  is_premium_plus?: boolean;
}

export interface RawUsage {
  applications_used?: number;
  applications_limit?: number;
  referrals_used?: number;
  referrals_limit?: number;
  reset_at?: string;
}

export interface RawJobSeekerMeta {
  avatar_url?: string;
  location?: string;
  bio?: string;
  skills?: string[];
  resume_url?: string;
  education?: RawEducation[];
  previous_experience?: RawExperience[];
  projects?: RawProject[];
  social_links?: RawSocialLinks;
  subscription?: RawSubscription;
  usage?: RawUsage;
}

export interface RawCompanyMeta {
  avatar_url?: string;
  location?: string;
  bio?: string;
  website?: string;
  industry?: string[];
  size?: number;
  verification_status?: number;
  is_profile_complete?: boolean;
  social_links?: RawSocialLinks;
}

export interface RawUserRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  meta: RawJobSeekerMeta | RawCompanyMeta | null;
}

export interface RawJobRow {
  id: string;
  title: string;
  company_id: string;
  location: string;
  work_mode: number | null;
  job_type: number | null;
  status: number;
  is_featured: boolean;
  is_urgent: boolean;
  total_applicants: number | null;
  total_openings: number | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  skills: string[] | null;
  published_at: string | null;
  created_at: string;
  application_deadline: string | null;
  description: unknown | null;
  experience_level: number | null;
  experience_min_years: number | null;
  experience_max_years: number | null;
  form_type: number | null;
  external_apply_url: string | null;
  referral_status: number | null;
  referral_bonus: string | null;
  users: {
    name: string | null;
    meta: Pick<RawCompanyMeta, "avatar_url"> | null;
  } | null;
}

// ─────────────────────────────────────────────────────────────────────────
// PUBLIC-FACING TYPES (PascalCase — used in hooks and UI)
// ─────────────────────────────────────────────────────────────────────────

export interface AdminJobSeeker {
  Id: string;
  Name: string;
  Email: string;
  Phone?: string;
  CreatedAt: string;
  Location?: string;
  Skills: string[];
  ResumeUrl?: string;
  Education: Partial<EducationDetails>[];
  PreviousExperience: Partial<PreviousExperience>[];
  Projects: Partial<ProjectDetails>[];
  SocialLinks?: Partial<SocialLinks>;
  SubscriptionPlan?: number;
  SubscriptionStatus?: number;
  ApplicationsUsed?: number;
  ApplicationsLimit?: number;
  IsPremiumPlus?: boolean; // ← add this
}

export interface AdminCompany {
  Id: string;
  Name: string;
  Email: string;
  Phone?: string;
  CreatedAt: string;
  Location?: string;
  Bio?: string;
  Website?: string;
  Industry: string[];
  Size?: number;
  AvatarUrl?: string;
  VerificationStatus: number;
  IsProfileComplete: boolean;
  SocialLinks?: Partial<SocialLinks>;
  ActiveJobs: number;
}

export interface AdminJob {
  Id: string;
  Title: string;
  CompanyId: string;
  CompanyName: string;
  CompanyLogoUrl?: string;
  Location: string;
  WorkMode?: number;
  JobType?: number;
  Status: JobStatus;
  IsFeatured: boolean;
  IsUrgent: boolean;
  TotalApplicants: number;
  TotalOpenings: number;
  SalaryMin?: number;
  SalaryMax?: number;
  SalaryCurrency?: string;
  Skills: string[];
  PublishedAt?: string;
  CreatedAt: string;
  ApplicationDeadline?: string;
  Description?: unknown;
  ExperienceLevel?: number;
  ExperienceMinYears?: number;
  ExperienceMaxYears?: number;
  FormType?: number;
  ExternalApplyUrl?: string;
  ReferralStatus?: number;
  ReferralBonus?: string;
}

export interface AdminStats {
  TotalJobSeekers: number;
  TotalCompanies: number;
  TotalJobs: number;
  ActiveJobs: number;
  WeeklySignups: { day: string; count: number }[];
  WeeklyJobs: { day: string; count: number }[];
}