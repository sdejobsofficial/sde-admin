"use server";

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// ─── Types ────────────────────────────────────────────────────────────────

export interface SalesProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  referral_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SalesReferral {
  id: string;
  sales_profile_id: string;
  user_id: string;
  referral_code: string;
  order_amount?: number;
  created_at: string;
  // joined
  user_name?: string;
  user_email?: string;
}

export interface SalesDashboardStats {
  total_referrals: number;
  total_revenue: number;
  this_month_referrals: number;
  this_month_revenue: number;
}

export interface CreateSalesPersonPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  referral_code: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

// ─── Admin: create sales person ───────────────────────────────────────────

export const adminCreateSalesPerson = async (
  payload: CreateSalesPersonPayload,
): Promise<SalesProfile> => {
  const supabase = getAdminClient();

  // Hash password with bcrypt (cost 12)
  const password_hash = await bcrypt.hash(payload.password, 12);

  const { data, error } = await supabase
    .from("sales_profiles")
    .insert([
      {
        name: payload.name,
        email: payload.email.toLowerCase().trim(),
        password_hash,
        phone: payload.phone ?? null,
        referral_code: payload.referral_code.toUpperCase().trim(),
      },
    ])
    .select(
      "id, name, email, phone, referral_code, is_active, created_at, updated_at",
    )
    .single<SalesProfile>();

  if (error || !data)
    throw new Error(error?.message ?? "Failed to create sales person");
  return data;
};

// ─── Admin: list sales people ─────────────────────────────────────────────

export const adminGetSalesPeople = async (
  page = 1,
  pageSize = 20,
  search?: string,
): Promise<
  Paginated<SalesProfile & { referral_count: number; total_revenue: number }>
> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("sales_profiles")
    .select(
      "id, name, email, phone, referral_code, is_active, created_at, updated_at",
      {
        count: "exact",
      },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search)
    query = query.or(
      `name.ilike.%${search}%,email.ilike.%${search}%,referral_code.ilike.%${search}%`,
    );

  const { data, error, count } = await query.returns<SalesProfile[]>();
  if (error || !data) {
    console.error(error);
    return { data: [], total: 0, hasMore: false };
  }

  // Fetch referral counts + revenue per person in one query
  const ids = data.map((s) => s.id);
  const { data: refData } = await supabase
    .from("referrals")
    .select("sales_profile_id, order_amount")
    .in("sales_profile_id", ids);

  const statsMap: Record<string, { count: number; revenue: number }> = {};
  for (const r of refData ?? []) {
    if (!statsMap[r.sales_profile_id])
      statsMap[r.sales_profile_id] = { count: 0, revenue: 0 };
    statsMap[r.sales_profile_id].count += 1;
    statsMap[r.sales_profile_id].revenue += r.order_amount ?? 0;
  }

  const mapped = data.map((s) => ({
    ...s,
    referral_count: statsMap[s.id]?.count ?? 0,
    total_revenue: statsMap[s.id]?.revenue ?? 0,
  }));

  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};

// ─── Admin: toggle active status ─────────────────────────────────────────

export const adminToggleSalesPersonActive = async (
  id: string,
  is_active: boolean,
): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("sales_profiles")
    .update({ is_active })
    .eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Admin: delete sales person ───────────────────────────────────────────

export const adminDeleteSalesPerson = async (id: string): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("sales_profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
};

// ─── Admin: all referrals across all sales people ─────────────────────────

export const adminGetAllReferrals = async (
  page = 1,
  pageSize = 30,
  salesProfileId?: string,
): Promise<Paginated<SalesReferral>> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("referrals")
    .select(
      "id, sales_profile_id, user_id, referral_code, order_amount, created_at",
      {
        count: "exact",
      },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (salesProfileId) query = query.eq("sales_profile_id", salesProfileId);

  const { data, error, count } = await query.returns<SalesReferral[]>();
  if (error || !data) {
    console.error(error);
    return { data: [], total: 0, hasMore: false };
  }

  // Join user names/emails
  const userIds = [...new Set(data.map((r) => r.user_id))];
  const { data: usersData } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", userIds)
    .returns<{ id: string; name: string; email: string }[]>();

  const userMap: Record<string, { name: string; email: string }> = {};
  for (const u of usersData ?? [])
    userMap[u.id] = { name: u.name, email: u.email };

  const mapped = data.map((r) => ({
    ...r,
    user_name: userMap[r.user_id]?.name,
    user_email: userMap[r.user_id]?.email,
  }));

  const total = count ?? 0;
  return { data: mapped, total, hasMore: from + mapped.length < total };
};

// ─── Admin: global stats ──────────────────────────────────────────────────

export const adminGetReferralStats = async (): Promise<{
  total_sales_people: number;
  active_sales_people: number;
  total_referrals: number;
  total_revenue: number;
  this_month_referrals: number;
}> => {
  const supabase = getAdminClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: totalSales },
    { count: activeSales },
    { data: allRefs },
    { data: monthRefs },
  ] = await Promise.all([
    supabase
      .from("sales_profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("sales_profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("referrals").select("order_amount"),
    supabase
      .from("referrals")
      .select("id")
      .gte("created_at", startOfMonth.toISOString()),
  ]);

  const total_revenue = (allRefs ?? []).reduce(
    (sum: number, r) => sum + (r.order_amount ?? 0),
    0,
  );

  return {
    total_sales_people: totalSales ?? 0,
    active_sales_people: activeSales ?? 0,
    total_referrals: (allRefs ?? []).length,
    total_revenue,
    this_month_referrals: (monthRefs ?? []).length,
  };
};

// ─── Sales person: login ──────────────────────────────────────────────────

export const salesLogin = async (
  email: string,
  password: string,
): Promise<SalesProfile> => {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("sales_profiles")
    .select(
      "id, name, email, phone, referral_code, is_active, created_at, updated_at, password_hash",
    )
    .eq("email", email.toLowerCase().trim())
    .single<SalesProfile & { password_hash: string }>();

  if (error || !data) throw new Error("Invalid email or password");
  if (!data.is_active)
    throw new Error("Account is deactivated. Contact admin.");

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) throw new Error("Invalid email or password");

  // Return profile without password_hash
  const { password_hash: _, ...profile } = data;
  return profile;
};

// ─── Sales person: get own stats ─────────────────────────────────────────

export const salesGetMyStats = async (
  salesProfileId: string,
): Promise<SalesDashboardStats> => {
  const supabase = getAdminClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [{ data: allRefs }, { data: monthRefs }] = await Promise.all([
    supabase
      .from("referrals")
      .select("order_amount")
      .eq("sales_profile_id", salesProfileId),
    supabase
      .from("referrals")
      .select("order_amount")
      .eq("sales_profile_id", salesProfileId)
      .gte("created_at", startOfMonth.toISOString()),
  ]);

  const total_revenue = (allRefs ?? []).reduce(
    (sum: number, r) => sum + (r.order_amount ?? 0),
    0,
  );
  const this_month_revenue = (monthRefs ?? []).reduce(
    (sum: number, r) => sum + (r.order_amount ?? 0),
    0,
  );

  return {
    total_referrals: (allRefs ?? []).length,
    total_revenue,
    this_month_referrals: (monthRefs ?? []).length,
    this_month_revenue,
  };
};

// ─── Sales person: get own referrals ─────────────────────────────────────

export const salesGetMyReferrals = async (
  salesProfileId: string,
  page = 1,
  pageSize = 20,
): Promise<Paginated<SalesReferral>> => {
  return adminGetAllReferrals(page, pageSize, salesProfileId);
};

// ─── Client checkout: validate referral code ─────────────────────────────

export const validateReferralCode = async (
  code: string,
): Promise<{ id: string; name: string } | null> => {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .rpc("get_active_sales_profile_by_code", {
      p_code: code.toUpperCase().trim(),
    })
    .single<{ id: string; name: string }>();

  if (error || !data) return null;
  return data;
};

// ─── Client checkout: record referral after purchase ─────────────────────

export const recordReferral = async (payload: {
  sales_profile_id: string;
  user_id: string;
  referral_code: string;
  order_amount: number;
}): Promise<void> => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("referrals").insert([payload]);
  // Silently ignore duplicate (unique_user_per_sales_profile constraint)
  if (error && !error.message.includes("unique_user_per_sales_profile")) {
    throw new Error(error.message);
  }
};
