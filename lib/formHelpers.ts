import {
  JobType,
  WorkMode,
  ExperienceLevel,
  SalaryType,
  SalaryVisibility,
  CompanySize,
} from "@/model/userModel";
import { Briefcase, Star, DollarSign, Building2 } from "lucide-react";
import { z } from "zod";

export interface PillOption<T extends number | string> {
  label: string;
  value: T;
}

export const basicsSchema = z.object({
  title: z.string().min(3, "Job title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  location: z.string().min(2, "Location is required"),
  skills: z.array(z.string()).min(1, "Add at least one skill"),
  job_type: z.nativeEnum(JobType),
  work_mode: z.nativeEnum(WorkMode),
});

export const experienceSchema = z
  .object({
    experience_level: z.nativeEnum(ExperienceLevel),
    experience_min_years: z.coerce
      .number({ error: "Required" })
      .min(0, "Cannot be negative"),
    experience_max_years: z.coerce
      .number({ error: "Must be a number" })
      .min(0, "Cannot be negative")
      .optional(),
    total_openings: z.coerce
      .number({ error: "Required" })
      .min(1, "At least 1 opening required"),
  })
  .refine(
    (d) =>
      d.experience_max_years === undefined ||
      d.experience_max_years >= d.experience_min_years,
    {
      message: "Max years must be ≥ min years",
      path: ["experience_max_years"],
    },
  );

export const salarySchema = z
  .object({
    salary_type: z.nativeEnum(SalaryType),
    salary_currency: z.string().min(1),
    salary_min: z.coerce
      .number({ error: "Min salary is required" })
      .min(0, "Cannot be negative"),
    salary_max: z.coerce
      .number({ error: "Max salary is required" })
      .min(0, "Cannot be negative"),
    salary_visibility: z.nativeEnum(SalaryVisibility),
  })
  .refine((d) => d.salary_max >= d.salary_min, {
    message: "Max salary must be ≥ min salary",
    path: ["salary_max"],
  });

export const companySchema = z.object({
  name: z.string().min(2, "Company name is required"),
  size: z.nativeEnum(CompanySize),
  location: z.string().optional(),
  website: z
    .union([z.string().url("Enter a valid URL"), z.literal("")])
    .optional(),
  bio: z.string().optional(),
  industries: z.array(z.string()),
  social_links: z.object({
    linkedin: z.union([z.string().url("Enter a valid URL"), z.literal("")]),
    github: z.union([z.string().url("Enter a valid URL"), z.literal("")]),
    twitter: z.union([z.string().url("Enter a valid URL"), z.literal("")]),
    portfolio: z.union([z.string().url("Enter a valid URL"), z.literal("")]),
  }),
  external_apply_url: z.string().url("Enter a valid apply URL"),
  application_deadline: z.string().optional(),
});

export type BasicsValues = z.infer<typeof basicsSchema>;
export type ExperienceValues = z.infer<typeof experienceSchema>;
export type SalaryValues = z.infer<typeof salarySchema>;
export type CompanyValues = z.infer<typeof companySchema>;

export interface StepHandle {
  submit: () => Promise<boolean>;
}

export const STEPS = [
  { id: "basics" as const, label: "Basics", icon: Briefcase },
  { id: "experience" as const, label: "Experience", icon: Star },
  { id: "salary" as const, label: "Salary", icon: DollarSign },
  { id: "company" as const, label: "Company", icon: Building2 },
] as const;

export const JOB_TYPES: PillOption<JobType>[] = [
  { label: "Full-time", value: JobType.FullTime },
  { label: "Part-time", value: JobType.PartTime },
  { label: "Contract", value: JobType.Contract },
  { label: "Internship", value: JobType.Internship },
  { label: "Freelance", value: JobType.Freelance },
];
export const WORK_MODES: PillOption<WorkMode>[] = [
  { label: "Remote", value: WorkMode.Remote },
  { label: "Hybrid", value: WorkMode.Hybrid },
  { label: "On-site", value: WorkMode.OnSite },
];
export const EXP_LEVELS: PillOption<ExperienceLevel>[] = [
  { label: "Fresher", value: ExperienceLevel.Fresher },
  { label: "Junior", value: ExperienceLevel.Junior },
  { label: "Mid", value: ExperienceLevel.Mid },
  { label: "Senior", value: ExperienceLevel.Senior },
  { label: "Lead", value: ExperienceLevel.Lead },
  { label: "Principal", value: ExperienceLevel.Principal },
];
export const SALARY_TYPES: PillOption<SalaryType>[] = [
  { label: "Annual", value: SalaryType.Annual },
  { label: "Monthly", value: SalaryType.Monthly },
  { label: "Hourly", value: SalaryType.Hourly },
  { label: "Fixed", value: SalaryType.Fixed },
];
export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED"];

export const COMPANY_SIZES: PillOption<CompanySize>[] = [
  { label: "1–10", value: CompanySize.Micro },
  { label: "11–50", value: CompanySize.Small },
  { label: "51–200", value: CompanySize.Medium },
  { label: "201–500", value: CompanySize.Large },
  { label: "501–1K", value: CompanySize.XLarge },
  { label: "1K+", value: CompanySize.Enterprise },
];
export const INDUSTRIES = [
  "SaaS",
  "FinTech",
  "EdTech",
  "HealthTech",
  "E-Commerce",
  "AI/ML",
  "Cybersecurity",
  "Gaming",
  "Web3",
  "DevTools",
  "Media",
  "Logistics",
];
export const SALARY_VISIBILITY_OPTIONS: PillOption<SalaryVisibility>[] = [
  { label: "Show salary", value: SalaryVisibility.Show },
  { label: "Negotiable", value: SalaryVisibility.Negotiable },
  { label: "Hidden", value: SalaryVisibility.Hidden },
];
