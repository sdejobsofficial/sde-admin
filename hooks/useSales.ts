import {
  adminCreateSalesPerson,
  adminGetSalesPeople,
  adminToggleSalesPersonActive,
  adminDeleteSalesPerson,
  adminGetAllReferrals,
  adminGetReferralStats,
  salesGetMyStats,
  salesGetMyReferrals,
  validateReferralCode,
  CreateSalesPersonPayload,
  salesLogin,
} from "@/client/salesClient";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Keys ─────────────────────────────────────────────────────────────────

export const salesKeys = {
  people: (page: number, pageSize: number, search?: string) =>
    ["admin", "sales", "people", page, pageSize, search] as const,
  referrals: (page: number, salesProfileId?: string) =>
    ["admin", "sales", "referrals", page, salesProfileId] as const,
  stats: () => ["admin", "sales", "stats"] as const,
  myStats: (id: string) => ["sales", "myStats", id] as const,
  myReferrals: (id: string, page: number) =>
    ["sales", "myReferrals", id, page] as const,
};

// ─── Admin hooks ──────────────────────────────────────────────────────────

export const useAdminSalesPeople = (page = 1, pageSize = 20, search?: string) =>
  useQuery({
    queryKey: salesKeys.people(page, pageSize, search),
    queryFn: () => adminGetSalesPeople(page, pageSize, search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useAdminCreateSalesPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalesPersonPayload) =>
      adminCreateSalesPerson(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sales"] });
      toast.success("Sales person created!");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create sales person."),
  });
};

export const useAdminToggleSalesPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      adminToggleSalesPersonActive(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sales"] });
      toast.success("Status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });
};

export const useAdminDeleteSalesPerson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminDeleteSalesPerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "sales"] });
      toast.success("Sales person deleted.");
    },
    onError: () => toast.error("Failed to delete."),
  });
};

export const useAdminAllReferrals = (page = 1, salesProfileId?: string) =>
  useQuery({
    queryKey: salesKeys.referrals(page, salesProfileId),
    queryFn: () => adminGetAllReferrals(page, 30, salesProfileId),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useAdminReferralStats = () =>
  useQuery({
    queryKey: salesKeys.stats(),
    queryFn: adminGetReferralStats,
    staleTime: 60_000,
  });

// ─── Sales person hooks ───────────────────────────────────────────────────

export const useSalesMyStats = (salesProfileId: string) =>
  useQuery({
    queryKey: salesKeys.myStats(salesProfileId),
    queryFn: () => salesGetMyStats(salesProfileId),
    enabled: !!salesProfileId,
    staleTime: 30_000,
  });

export const useSalesMyReferrals = (salesProfileId: string, page = 1) =>
  useQuery({
    queryKey: salesKeys.myReferrals(salesProfileId, page),
    queryFn: () => salesGetMyReferrals(salesProfileId, page),
    enabled: !!salesProfileId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

// ─── Client checkout hook ─────────────────────────────────────────────────

export const useValidateReferralCode = () =>
  useMutation({
    mutationFn: (code: string) => validateReferralCode(code),
  });

export const useSalesLogin = () =>
  useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      salesLogin(email, password),
  });
