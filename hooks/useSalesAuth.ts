"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { SalesProfile } from "@/client/salesClient";

const STORAGE_KEY = "sales_session";

// ─── Session storage helpers ───────────────────────────────────────────────

const readSession = (): SalesProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SalesProfile) : null;
  } catch {
    return null;
  }
};

const writeSession = (profile: SalesProfile) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// ─── Query Keys ────────────────────────────────────────────────────────────

export const salesKeys = {
  all: () => ["sales"] as const,
  profile: () => ["sales", "profile"] as const,
};

// ─── useSalesSession — fetch and monitor session profile ───────────────────

export const useSalesSession = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: salesKeys.profile(),
    queryFn: async () => readSession(),
    staleTime: Infinity, // Session data stays fresh unless explicitly changed
  });

  // Automatically redirect unauthorized users
  useEffect(() => {
    if (!isLoading && !profile) {
      router.replace("/sales/login");
    }
  }, [profile, isLoading, router]);

  const logout = useCallback(() => {
    clearSession();
    queryClient.setQueryData(salesKeys.profile(), null);
    router.replace("/sales/login");
    toast.success("Logged out successfully.");
  }, [router, queryClient]);

  return { profile: profile || null, isLoading, logout };
};

// ─── useSetSalesSession — login / establish session ─────────────────────────

export const useSetSalesSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: SalesProfile) => {
      writeSession(profile);
      return profile;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(salesKeys.profile(), data);
      toast.success("Welcome back!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to establish session.");
    },
  });
};
