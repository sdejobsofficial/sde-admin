import {
  createNotification,
  getNotifications,
  deleteNotification,
  CreateNotificationDTO,
} from "@/client/notificationClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const notificationKeys = {
  all: () => ["notifications"] as const,
  list: (page: number, pageSize: number) =>
    ["notifications", "list", page, pageSize] as const,
};

// ─── useNotifications — fetch paginated list ────────────────────────────────

export const useNotifications = (page: number = 1, pageSize: number = 20) => {
  return useQuery({
    queryKey: notificationKeys.list(page, pageSize),
    queryFn: () => getNotifications(page, pageSize),
    staleTime: 30 * 1000,
  });
};

// ─── useCreateNotification — admin panel ────────────────────────────────────

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateNotificationDTO) => createNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      toast.success("Notification created!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create notification.");
    },
  });
};

// ─── useDeleteNotification — admin panel ────────────────────────────────────

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
      toast.success("Notification deleted.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete notification.");
    },
  });
};
