export enum UserRole {
  JobSeeker = 0,
  Company = 1,
  Admin = 2,
}

export enum SubscriptionPlan {
  Free = 0,
  Premium = 1,
}

export enum SubscriptionStatus {
  Active = 0,
  Inactive = 1,
  Cancelled = 2,
  PastDue = 3,
  Trialing = 4,
}

export enum CompanySize {
  Micro = 0, // 1–10
  Small = 1, // 11–50
  Medium = 2, // 51–200
  Large = 3, // 201–500
  XLarge = 4, // 501–1000
  Enterprise = 5, // 1000+
}

export enum VerificationStatus {
  Unverified = 0,
  Pending = 1,
  Verified = 2,
}

export enum GradingSystemEnum {
  Percentage = 0,
  GPA4 = 1,
  GPA10 = 2,
  Pass = 3,
}

export enum MaritalStatusEnum {
  Single = 0,
  Married = 1,
  Divorced = 2,
  Widowed = 3,
  Separated = 4,
  Other = 5,
}

export enum CategoryEnum {
  General = 0,
  ScheduleCaste = 1,
  ScheduleTribe = 2,
  OtherBackwardClass = 3,
  Other = 4,
}

export enum Languages {
  English = 0,
  Hindi = 1,
  Tamil = 2,
  Telugu = 3,
  Bengali = 4,
  Marathi = 5,
}

export enum Proficiency {
  Beginner = 0,
  Proficient = 1,
  Expert = 2,
}

export enum CourseTypeEnum {
  FullTime = 0,
  PartTime = 1,
  Online = 2,
  DistanceLearning = 3,
}

export enum HighestQualificaitonEnum {
  Matriculation = 0,
  PostGraduation = 1,
  Graduation = 2,
  Intermediate = 3,
  PhD = 4,
}

export interface SocialLinks {
  LinkedIn?: string;
  GitHub?: string;
  Portfolio?: string;
  Twitter?: string;
  Website?: string;
}

export interface ProjectDetails {
  Title: string;
  Description: string;
  Link?: string;
}

export interface EducationDetails {
  College?: string;
  Course?: string;
  Specialization?: string;
  FieldOfStudy?: string;
  StartingYear?: number;
  GraduationYear?: number;
  GradingSystem?: GradingSystemEnum;
  GPA?: number;
  CourseType: string;
  HighestQualificaiton: string;
}

export interface PreviousExperience {
  CompanyName: string;
  Role: string;
  StartDate: string;
  EndDate?: string;
  CurrentlyWorking?: boolean;
  Description?: string;
}

export enum JobType {
  FullTime = 0,
  PartTime = 1,
  Contract = 2,
  Internship = 3,
  Freelance = 4,
}
export enum WorkMode {
  Remote = 0,
  Hybrid = 1,
  OnSite = 2,
}
export enum ExperienceLevel {
  Fresher = 0,
  Junior = 1,
  Mid = 2,
  Senior = 3,
  Lead = 4,
  Principal = 5,
}
export enum SalaryType {
  Annual = 0,
  Monthly = 1,
  Hourly = 2,
  Fixed = 3,
}
export enum SalaryVisibility {
  Show = 0,
  Negotiable = 1,
  Hidden = 2,
}

export enum JobStatus {
  Active = 1,
}

export interface JobSeekerMeta {
  AvatarUrl?: string;
  Location?: string;
  Bio?: string;
  Education?: EducationDetails[];
  Skills?: string[];
  ResumeUrl?: string;
  SocialLinks?: SocialLinks;
  Projects?: ProjectDetails[];
  Subscription: SubscriptionDetails; // only job seekers have subscription
  Usage: UsageLimits;
  PersonalDetails: PersonalDetails;
  LanguageProficiency?: LanguageProficiency[];
  PreviousExperience?: PreviousExperience[];
}

export interface CompanyMeta {
  AvatarUrl?: string;
  Location?: string;
  Bio?: string;
  Website?: string;
  Industry?: string[];
  Size?: CompanySize;
  SocialLinks?: SocialLinks;
  VerificationStatus: VerificationStatus;
  IsProfileComplete: boolean;
}

export interface User {
  Id: string; // UUID — matches Supabase auth.users.id
  Email: string;
  Name?: string; // Optional: company fills during onboarding
  Role: UserRole;
  Phone?: string;
  PhoneVerified: boolean;
  Meta: JobSeekerMeta | CompanyMeta | null; // null until onboarding
  CreatedAt: string;
  UpdatedAt: string;
}

export interface SubscriptionDetails {
  Plan: SubscriptionPlan;
  Status: SubscriptionStatus;
  CurrentPeriodStart?: string;
  CurrentPeriodEnd?: string;
  CancelledAt?: string;
  IsPremiumPlus?: boolean;
}

export interface UsageLimits {
  ApplicationsUsed: number;
  ApplicationsLimit: number; // 5 = free | -1 = unlimited
  ReferralsUsed: number;
  ReferralsLimit: number; // 2 = free | -1 = unlimited
  ResetAt?: string;
}

export interface LanguageProficiency {
  language: Languages;
  proficiency: Proficiency;
}

export interface PersonalDetails {
  DateOfBirth?: string;
  MaritalStatus?: MaritalStatusEnum;
  Category?: CategoryEnum;
  PermanentAddress?: string;
  CurrentAddress?: string;
}

export interface JobSeekerUser extends User {
  Role: UserRole.JobSeeker;
  Meta: JobSeekerMeta | null;
}