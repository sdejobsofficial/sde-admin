import {
  EducationDetails,
  PreviousExperience,
  ProjectDetails,
  SocialLinks,
  VerificationStatus,
} from "@/model/userModel";
import {
  RawEducation,
  RawExperience,
  RawJobRow,
  RawJobSeekerMeta,
  RawCompanyMeta,
  RawProject,
  RawSocialLinks,
  RawUserRow,
  AdminJobSeeker,
  AdminCompany,
  AdminJob,
} from "@/model/adminModel";

export function mapSocialLinks(
  raw: RawSocialLinks | undefined,
): Partial<SocialLinks> | undefined {
  if (!raw) return undefined;
  return {
    LinkedIn: raw.linked_in,
    GitHub: raw.git_hub,
    Portfolio: raw.portfolio,
    Twitter: raw.twitter,
    Website: raw.website,
  };
}

export function mapEducation(raw: RawEducation[]): Partial<EducationDetails>[] {
  return raw.map((e) => ({
    College: e.college,
    Course: e.course,
    Specialization: e.specialization,
    FieldOfStudy: e.field_of_study,
    StartingYear: e.starting_year,
    GraduationYear: e.graduation_year,
    GradingSystem: e.grading_system,
    GPA: e.gpa,
    CourseType: e.course_type ?? "",
    HighestQualificaiton: e.highest_qualificaiton ?? "",
  }));
}

export function mapExperience(
  raw: RawExperience[],
): Partial<PreviousExperience>[] {
  return raw.map((e) => ({
    CompanyName: e.company_name,
    Role: e.role,
    StartDate: e.start_date,
    EndDate: e.end_date,
    CurrentlyWorking: e.currently_working,
    Description: e.description,
  }));
}

export function mapProjects(raw: RawProject[]): Partial<ProjectDetails>[] {
  return raw.map((p) => ({
    Title: p.title ?? "",
    Description: p.description ?? "",
    Link: p.link,
  }));
}

export function mapJobSeekerRow(row: RawUserRow): AdminJobSeeker {
  const m = row.meta as RawJobSeekerMeta | null;
  return {
    Id: row.id,
    Name: row.name ?? "",
    Email: row.email ?? "",
    Phone: row.phone ?? undefined,
    CreatedAt: row.created_at,
    Location: m?.location ?? undefined,
    Skills: m?.skills ?? [],
    ResumeUrl: m?.resume_url ?? undefined,
    Education: mapEducation(m?.education ?? []),
    PreviousExperience: mapExperience(m?.previous_experience ?? []),
    Projects: mapProjects(m?.projects ?? []),
    SocialLinks: mapSocialLinks(m?.social_links),
    SubscriptionPlan: m?.subscription?.plan,
    SubscriptionStatus: m?.subscription?.status,
    ApplicationsUsed: m?.usage?.applications_used,
    ApplicationsLimit: m?.usage?.applications_limit,
    IsPremiumPlus: m?.subscription?.is_premium_plus === true,
  };
}

export function mapCompanyRow(
  row: RawUserRow,
  activeJobs: number,
): AdminCompany {
  const m = row.meta as RawCompanyMeta | null;
  return {
    Id: row.id,
    Name: row.name ?? "",
    Email: row.email ?? "",
    Phone: row.phone ?? undefined,
    CreatedAt: row.created_at,
    Location: m?.location ?? undefined,
    Bio: m?.bio ?? undefined,
    Website: m?.website ?? undefined,
    Industry: m?.industry ?? [],
    Size: m?.size ?? undefined,
    AvatarUrl: m?.avatar_url ?? undefined,
    VerificationStatus: m?.verification_status ?? VerificationStatus.Unverified,
    IsProfileComplete: m?.is_profile_complete ?? false,
    SocialLinks: mapSocialLinks(m?.social_links),
    ActiveJobs: activeJobs,
  };
}

export function mapJobRow(row: RawJobRow): AdminJob {
  return {
    Id: row.id,
    Title: row.title,
    CompanyId: row.company_id,
    CompanyName: row.users?.name ?? "Unknown",
    CompanyLogoUrl: row.users?.meta?.avatar_url ?? undefined,
    Location: row.location,
    WorkMode: row.work_mode ?? undefined,
    JobType: row.job_type ?? undefined,
    Status: row.status,
    IsFeatured: row.is_featured,
    IsUrgent: row.is_urgent,
    TotalApplicants: row.total_applicants ?? 0,
    TotalOpenings: row.total_openings ?? 0,
    SalaryMin: row.salary_min ?? undefined,
    SalaryMax: row.salary_max ?? undefined,
    SalaryCurrency: row.salary_currency ?? "INR",
    Skills: row.skills ?? [],
    PublishedAt: row.published_at ?? undefined,
    CreatedAt: row.created_at,
    ApplicationDeadline: row.application_deadline ?? undefined,
    Description: row.description ?? undefined,
    ExperienceLevel: row.experience_level ?? undefined,
    ExperienceMinYears: row.experience_min_years ?? undefined,
    ExperienceMaxYears: row.experience_max_years ?? undefined,
    FormType: row.form_type ?? undefined,
    ExternalApplyUrl: row.external_apply_url ?? undefined,
    ReferralStatus: row.referral_status ?? undefined,
    ReferralBonus: row.referral_bonus ?? undefined,
  };
}
