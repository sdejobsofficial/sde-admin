"use server";

import { createClient } from "@supabase/supabase-js";
import { JobSeekerUser, UserRole, VerificationStatus } from "@/model/userModel";
import {
  JobStatus,
  Paginated,
  RawUserRow,
  RawJobRow,
  RawCompanyMeta,
  AdminJobSeeker,
  AdminCompany,
  AdminJob,
  AdminStats,
} from "@/model/adminModel";
import { mapJobSeekerRow, mapCompanyRow, mapJobRow } from "@/lib/adminMapper";
import { convertToPascalCase, convertToSnakeCase } from "@/lib/casing";

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

// ─── Auth ─────────────────────────────────────────────────────────────────

export const adminEmailLogin = async (email: string, password: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);

  const admin = getAdminClient();
  const { data: userData, error: userError } = await admin
    .from("users")
    .select("role")
    .eq("id", data.user.id)
    .single<{ role: number }>();

  if (userError || !userData) throw new Error("User not found");
  if (userData.role !== UserRole.Admin)
    throw new Error("Unauthorized: not an admin");

  return data;
};

export const adminLogout = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  await supabase.auth.signOut();
};

// ─── Job Seekers ──────────────────────────────────────────────────────────

export const getAdminJobSeekers = async (
  page = 1,
  pageSize = 20,
  search?: string,
): Promise<Paginated<AdminJobSeeker>> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("users")
    .select("id, name, email, phone, meta, created_at", { count: "exact" })
    .eq("role", UserRole.JobSeeker)
    .order("created_at", { ascending: false })
    .range(from, to);

  const isUuid = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  if (search) {
    const orParts = [`name.ilike.%${search}%`, `email.ilike.%${search}%`];
    if (isUuid(search)) orParts.push(`id.eq.${search}`);
    query = query.or(orParts.join(","));
  }

  const { data, error, count } = await query.returns<RawUserRow[]>();
  if (error || !data) {
    console.error(error);
    return { data: [], total: 0, hasMore: false };
  }

  const mapped = data.map(mapJobSeekerRow);
  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};

export const deleteAdminUser = async (userId: string): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message);
  await supabase.from("users").delete().eq("id", userId);
};

// ─── Companies ────────────────────────────────────────────────────────────

export const getAdminCompanies = async (
  page = 1,
  pageSize = 20,
  search?: string,
): Promise<Paginated<AdminCompany>> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("users")
    .select("id, name, email, phone, meta, created_at", { count: "exact" })
    .eq("role", UserRole.Company)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search)
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);

  const { data, error, count } = await query.returns<RawUserRow[]>();
  if (error || !data) {
    console.error(error);
    return { data: [], total: 0, hasMore: false };
  }

  const ids = data.map((r) => r.id);
  const { data: jobData } = await supabase
    .from("jobs")
    .select("company_id")
    .in("company_id", ids)
    .returns<{ company_id: string }[]>();

  const jobCountMap: Record<string, number> = {};
  for (const j of jobData ?? []) {
    jobCountMap[j.company_id] = (jobCountMap[j.company_id] ?? 0) + 1;
  }

  const mapped = data.map((row) =>
    mapCompanyRow(row, jobCountMap[row.id] ?? 0),
  );
  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};

export const updateCompanyVerification = async (
  companyId: string,
  status: VerificationStatus,
): Promise<void> => {
  const supabase = getAdminClient();
  const { data: row } = await supabase
    .from("users")
    .select("meta")
    .eq("id", companyId)
    .single<{ meta: RawCompanyMeta | null }>();

  const updatedMeta: RawCompanyMeta = {
    ...(row?.meta ?? {}),
    verification_status: status,
  };
  const { error } = await supabase
    .from("users")
    .update({ meta: updatedMeta })
    .eq("id", companyId);

  if (error) throw new Error(error.message);
};

export const deleteAdminCompany = async (companyId: string): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(companyId);
  if (error) throw new Error(error.message);
  await supabase.from("users").delete().eq("id", companyId);
};

// ─── Jobs ─────────────────────────────────────────────────────────────────

export const getAdminJobs = async (
  page = 1,
  pageSize = 20,
  search?: string,
): Promise<Paginated<AdminJob>> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("jobs")
    .select(
      `id, title, company_id, location, work_mode, job_type, status,
       is_featured, is_urgent, total_applicants, total_openings,
       salary_min, salary_max, salary_currency, skills,
       published_at, created_at, application_deadline,
       description, experience_level, experience_min_years, experience_max_years,
       form_type, external_apply_url, referral_status, referral_bonus,
       users!company_id(name, meta)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error, count } = await query.returns<RawJobRow[]>();
  if (error || !data) {
    console.error(error);
    return { data: [], total: 0, hasMore: false };
  }

  const mapped = data.map(mapJobRow);
  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};

export const deleteAdminJob = async (jobId: string): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw new Error(error.message);
};

export const updateAdminJobStatus = async (
  jobId: string,
  status: JobStatus,
): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", jobId);
  if (error) throw new Error(error.message);
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const supabase = getAdminClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const isoSevenDaysAgo = sevenDaysAgo.toISOString();

  // 1. Total Job Seekers
  const { count: jobSeekerCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", UserRole.JobSeeker);

  // 2. Total Companies
  const { count: companyCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", UserRole.Company);

  // 3. Total Jobs
  const { count: jobCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true });

  // 4. Active Jobs
  const { count: activeJobCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", JobStatus.Active);

  // 5. Weekly Signups (last 7 days)
  const { data: recentUsers } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", isoSevenDaysAgo);

  // 6. Weekly Jobs (last 7 days)
  const { data: recentJobs } = await supabase
    .from("jobs")
    .select("created_at")
    .gte("created_at", isoSevenDaysAgo);

  // Process data for charts
  const weeklySignups = processWeeklyData(recentUsers || []);
  const weeklyJobs = processWeeklyData(recentJobs || []);

  return {
    TotalJobSeekers: jobSeekerCount || 0,
    TotalCompanies: companyCount || 0,
    TotalJobs: jobCount || 0,
    ActiveJobs: activeJobCount || 0,
    WeeklySignups: weeklySignups,
    WeeklyJobs: weeklyJobs,
  };
};

function processWeeklyData(items: { created_at: string }[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const last7Days: { day: string; date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push({
      day: days[d.getDay()],
      date: d.toISOString().split("T")[0],
      count: 0,
    });
  }

  items.forEach((item) => {
    const itemDate = item.created_at.split("T")[0];
    const dayObj = last7Days.find((d) => d.date === itemDate);
    if (dayObj) dayObj.count++;
  });

  return last7Days.map(({ day, count }) => ({ day, count }));
}

export interface PremiumJobCompanyMeta {
  name: string;
  logo_url?: string;
  size?: number;
  industry?: string[];
  location?: string;
  website?: string;
  bio?: string;
  social_links?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
}

export interface CreatePremiumJobPayload {
  title: string;
  location: string;
  work_mode: number;
  job_type: number;
  experience_level: number;
  experience_min_years: number;
  experience_max_years?: number;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  salary_type: number;
  salary_visibility: number;
  skills: string[];
  total_openings: number;
  description: object;
  form_type: number;
  external_apply_url?: string;
  referral_status: number;
  referral_bonus?: string;
  is_urgent: boolean;
  application_deadline?: string;
  status: number;
  is_featured: boolean;
  company_meta: PremiumJobCompanyMeta;
  company_id?: string;
}

export interface AdminPremiumJob {
  id: string;
  title: string;
  location: string;
  work_mode: number;
  job_type: number;
  experience_level: number;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  skills: string[];
  total_openings: number;
  total_applicants: number;
  status: number;
  is_featured: boolean;
  is_urgent: boolean;
  published_at?: string;
  created_at: string;
  application_deadline?: string;
  external_apply_url?: string;
  company_meta: PremiumJobCompanyMeta;
}

export interface PaginatedPremiumJobs {
  data: AdminPremiumJob[];
  total: number;
  hasMore: boolean;
}

export const createAdminPremiumJob = async (
  payload: CreatePremiumJobPayload,
): Promise<AdminPremiumJob> => {
  const supabase = getAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log(user?.id, "userid");

  const { data, error } = await supabase
    .from("jobs")
    .insert([
      {
        ...payload,
        published_at: new Date().toISOString(),
        company_id: "11b08302-3147-4c7c-8514-13d30ca256a2",
        posted_by: "11b08302-3147-4c7c-8514-13d30ca256a2",
        status: JobStatus.Active,
      },
    ])
    .select()
    .single<AdminPremiumJob>();

  if (error || !data) throw new Error(error?.message ?? "Failed to create job");
  return data;
};

export const getAdminPremiumJobs = async (
  page = 1,
  pageSize = 20,
  search?: string,
): Promise<PaginatedPremiumJobs> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("jobs")
    .select(
      `id, title, location, work_mode, job_type, experience_level,
       salary_min, salary_max, salary_currency, skills,
       total_openings, total_applicants, status, is_featured, is_urgent,
       published_at, created_at, application_deadline, external_apply_url,
       company_meta`,
      { count: "exact" },
    )
    .not("company_meta", "is", null) // only premium jobs
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error, count } = await query.returns<AdminPremiumJob[]>();

  if (error || !data) {
    console.error(error);
    return { data: [], total: 0, hasMore: false };
  }

  const total = count ?? 0;
  return { data, total, hasMore: from + data.length < total };
};

export const deleteAdminPremiumJob = async (jobId: string): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("jobs").delete().eq("id", jobId);
  if (error) throw new Error(error.message);
};

export const updateAdminPremiumJobStatus = async (
  jobId: string,
  status: number,
): Promise<void> => {
  const supabase = getAdminClient();
  const updates: Record<string, unknown> = { status };
  if (status === JobStatus.Active)
    updates.published_at = new Date().toISOString();

  const { error } = await supabase.from("jobs").update(updates).eq("id", jobId);
  if (error) throw new Error(error.message);
};

export const imageUpload = async (file: File, userId: string) => {
  const supabase = getAdminClient();
  if (!userId) throw new Error("User ID is required for image upload");

  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false });

  if (uploadError)
    throw new Error(`Failed to upload image: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(fileName);
  return publicUrl;
};

export const banUser = async (userId: string) => {
  const supabase = getAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: "87600h",
  });
  if (error) throw new Error(error.message);
};

export const unbanUser = async (userId: string) => {
  const supabase = getAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (error) throw new Error(error.message);
};

export const getUserBanStatus = async (userId: string) => {
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error) throw new Error(error.message);
  return {
    isBanned: !!data.user.banned_until,
    bannedUntil: data.user.banned_until,
  };
};

export const togglePremiumPlus = async (userId: string): Promise<boolean> => {
  const supabase = getAdminClient();

  const { data: user, error: fetchError } = await supabase
    .from("users")
    .select("meta")
    .eq("id", userId)
    .single();

  if (fetchError || !user) throw new Error("User not found");

  const jobSeekerUser = convertToPascalCase(user) as JobSeekerUser;
  const currentSubscription = jobSeekerUser.Meta?.Subscription;
  const newIsPremiumPlus = !currentSubscription?.IsPremiumPlus;

  const { error } = await supabase
    .from("users")
    .update({
      meta: {
        ...user.meta,
        subscription: convertToSnakeCase({
          ...currentSubscription,
          IsPremiumPlus: newIsPremiumPlus,
        }),
      },
    })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  return newIsPremiumPlus;
};

export const getAdminPremiumPlusUsers = async (
  page = 1,
  pageSize = 20,
  search?: string,
): Promise<Paginated<AdminJobSeeker>> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("users")
    .select("id, name, email, phone, meta, created_at", { count: "exact" })
    .eq("role", UserRole.JobSeeker)
    .eq("meta->subscription->>is_premium_plus", "true")
    .order("created_at", { ascending: false })
    .range(from, to);

  const isUuid = (v: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  if (search) {
    const orParts = [`name.ilike.%${search}%`, `email.ilike.%${search}%`];
    if (isUuid(search)) orParts.push(`id.eq.${search}`);
    query = query.or(orParts.join(","));
  }

  const { data, error, count } = await query.returns<RawUserRow[]>();
  if (error || !data) {
    console.error(error);
    return { data: [], total: 0, hasMore: false };
  }

  const mapped = data.map(mapJobSeekerRow);
  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};
