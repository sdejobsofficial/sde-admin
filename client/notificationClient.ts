"use server";

import { createClient } from "@supabase/supabase-js";

// ─── Models ─────────────────────────────────────────────────────────────────

export interface Notification {
  Id: string;
  Title: string;
  Description: string;
  CreatedAt: string;
}

export interface CreateNotificationDTO {
  Title: string;
  Description: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Mapping helper ─────────────────────────────────────────────────────────

const mapNotificationRow = (row: any): Notification => ({
  Id: row.id,
  Title: row.title,
  Description: row.description,
  CreatedAt: row.created_at,
});

const getAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

// ─── createNotification — admin only, service role bypasses RLS ────────────

export const createNotification = async (payload: CreateNotificationDTO) => {
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      title: payload.Title,
      description: payload.Description,
    })
    .select()
    .single();

  if (error) {
    console.error("createNotification error:", error);
    throw new Error(error.message);
  }

  return mapNotificationRow(data);
};

export const getNotifications = async (
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedNotifications> => {
  const supabase = getAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("getNotifications error:", error);
    return { data: [], total: 0, page, pageSize, hasMore: false };
  }

  const mapped = (data ?? []).map(mapNotificationRow);
  const total = count ?? 0;

  return {
    data: mapped,
    total,
    page,
    pageSize,
    hasMore: from + mapped.length < total,
  };
};

export const deleteNotification = async (id: string) => {
  const supabase = getAdminClient();
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) {
    console.error("deleteNotification error:", error);
    throw new Error(error.message);
  }
};
