import {
  adminEmailLogin,
  adminLogout,
  getAdminJobSeekers,
  deleteAdminUser,
  getAdminCompanies,
  updateCompanyVerification,
  deleteAdminCompany,
  getAdminJobs,
  deleteAdminJob,
  updateAdminJobStatus,
  getAdminStats,
  createAdminPremiumJob,
  CreatePremiumJobPayload,
  deleteAdminPremiumJob,
  getAdminPremiumJobs,
  updateAdminPremiumJobStatus,
  imageUpload,
  banUser,
  getUserBanStatus,
  unbanUser,
  togglePremiumPlus,
  getAdminPremiumPlusUsers,
} from "@/client/adminClient";
import { VerificationStatus } from "@/model/userModel";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// ─── Keys ─────────────────────────────────────────────────────────────────

export const adminKeys = {
  jobSeekers: (page: number, pageSize: number, search?: string) =>
    ["admin", "jobSeekers", page, pageSize, search] as const,
  premiumPlusUsers: (page: number, pageSize: number, search?: string) =>
    ["admin", "premiumPlusUsers", page, pageSize, search] as const,
  companies: (page: number, pageSize: number, search?: string) =>
    ["admin", "companies", page, pageSize, search] as const,
  jobs: (page: number, pageSize: number, search?: string) =>
    ["admin", "jobs", page, pageSize, search] as const,
  stats: () => ["admin", "stats"] as const,
};

// ─── Auth ─────────────────────────────────────────────────────────────────

export const useAdminLogin = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminEmailLogin(email, password),
    onSuccess: () => {
      router.push("/admin/job-seekers");
      toast.success("Welcome back!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed.");
    },
  });
};

export const useAdminLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      queryClient.clear();
      router.push("/");
    },
  });
};

// ─── Stats ────────────────────────────────────────────────────────────────

export const useAdminStats = () =>
  useQuery({
    queryKey: adminKeys.stats(),
    queryFn: getAdminStats,
    staleTime: 60_000,
  });

// ─── Job Seekers ──────────────────────────────────────────────────────────

export const useAdminJobSeekers = (page = 1, pageSize = 20, search?: string) =>
  useQuery({
    queryKey: adminKeys.jobSeekers(page, pageSize, search),
    queryFn: () => getAdminJobSeekers(page, pageSize, search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobSeekers"] });
      toast.success("User deleted.");
    },
    onError: () => toast.error("Failed to delete user."),
  });
};

// ─── Companies ────────────────────────────────────────────────────────────

export const useAdminCompanies = (page = 1, pageSize = 20, search?: string) =>
  useQuery({
    queryKey: adminKeys.companies(page, pageSize, search),
    queryFn: () => getAdminCompanies(page, pageSize, search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useUpdateCompanyVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      companyId,
      status,
    }: {
      companyId: string;
      status: VerificationStatus;
    }) => updateCompanyVerification(companyId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
      toast.success("Verification status updated.");
    },
    onError: () => toast.error("Failed to update verification."),
  });
};

export const useDeleteAdminCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (companyId: string) => deleteAdminCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "companies"] });
      toast.success("Company deleted.");
    },
    onError: () => toast.error("Failed to delete company."),
  });
};

// ─── Jobs ─────────────────────────────────────────────────────────────────

export const useAdminJobs = (page = 1, pageSize = 20, search?: string) =>
  useQuery({
    queryKey: adminKeys.jobs(page, pageSize, search),
    queryFn: () => getAdminJobs(page, pageSize, search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useDeleteAdminJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteAdminJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Job deleted.");
    },
    onError: () => toast.error("Failed to delete job."),
  });
};

export const useUpdateAdminJobStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: number }) =>
      updateAdminJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "jobs"] });
      toast.success("Job status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });
};

export const premiumJobAdminKeys = {
  list: (page: number, pageSize: number, search?: string) =>
    ["admin", "premiumJobs", page, pageSize, search] as const,
};

export const useAdminPremiumJobs = (page = 1, pageSize = 20, search?: string) =>
  useQuery({
    queryKey: premiumJobAdminKeys.list(page, pageSize, search),
    queryFn: () => getAdminPremiumJobs(page, pageSize, search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useCreateAdminPremiumJob = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePremiumJobPayload) =>
      createAdminPremiumJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "premiumJobs"] });
      toast.success("Premium job published!");
      router.push("/admin/premium-jobs");
    },
    onError: (err: Error) =>
      toast.error(err.message || "Failed to create job."),
  });
};

export const useDeleteAdminPremiumJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: string) => deleteAdminPremiumJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "premiumJobs"] });
      toast.success("Job deleted.");
    },
    onError: () => toast.error("Failed to delete job."),
  });
};

export const useUpdateAdminPremiumJobStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, status }: { jobId: string; status: number }) =>
      updateAdminPremiumJobStatus(jobId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "premiumJobs"] });
      toast.success("Job status updated.");
    },
    onError: () => toast.error("Failed to update status."),
  });
};

export const useImageUpload = () => {
  return useMutation({
    mutationFn: ({ file, userId }: { file: File; userId: string }) =>
      imageUpload(file, userId),
    onError: (error) => {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["jobSeekers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["banStatus"],
      });
      toast.success("User banned successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to ban user.");
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin"],
      });
      queryClient.invalidateQueries({
        queryKey: ["jobSeekers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["banStatus"],
      });
      toast.success("User unbanned successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unban user.");
    },
  });
};

export const useGetUserBanStatus = (userId: string) => {
  return useQuery({
    queryKey: ["banStatus", userId],
    queryFn: () => getUserBanStatus(userId),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
};

export const useHandleTooglePremiumPlus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => togglePremiumPlus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "jobSeekers"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "premiumPlusUsers"] }); // ← add
      toast.success("Subscription upgraded successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upgrade subscription.");
    },
  });
};

export const useAdminPremiumPlusUsers = (
  page = 1,
  pageSize = 20,
  search?: string,
) =>
  useQuery({
    queryKey: adminKeys.premiumPlusUsers(page, pageSize, search),
    queryFn: () => getAdminPremiumPlusUsers(page, pageSize, search),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
