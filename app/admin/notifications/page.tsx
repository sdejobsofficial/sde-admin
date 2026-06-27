"use client";

import { useState } from "react";
import {
  Bell,
  Plus,
  Trash2,
  Loader2,
  Send,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  useNotifications,
  useCreateNotification,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { Notification } from "@/client/notificationClient";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const PAGE_SIZE = 20;

// ─── Relative time helper ───────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ─── Delete confirm modal ────────────────────────────────────────────────────

function DeleteConfirmModal({
  notification,
  onConfirm,
  onCancel,
  isPending,
}: {
  notification: Notification;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Delete notification?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5 px-1">
          <span className="text-white font-medium">{notification.Title}</span>{" "}
          will be permanently removed and no longer visible to Premium Plus
          members.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 h-9 rounded-xl border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

  const { data, isLoading, isFetching } = useNotifications(page, PAGE_SIZE);
  const { mutate: createNotification, isPending: isCreating } =
    useCreateNotification();
  const { mutate: deleteNotification, isPending: isDeleting } =
    useDeleteNotification();

  const notifications = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createNotification(
      { Title: title.trim(), Description: description.trim() },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setPage(1);
        },
      },
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteNotification(deleteTarget.Id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">Notifications</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading
                ? "Loading…"
                : `${total.toLocaleString()} sent · visible to Premium Plus members only`}
              {isFetching && !isLoading && (
                <span className="ml-2 text-teal-400">Updating…</span>
              )}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-6">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* ── Create form ── */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-teal-600/15 flex items-center justify-center">
                  <Plus size={14} className="text-teal-400" />
                </div>
                <p className="text-sm font-bold text-white">New notification</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. New batch of premium jobs is live"
                    maxLength={120}
                    className="w-full h-10 px-3.5 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write the message your Premium Plus members will see…"
                    rows={3}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all resize-none"
                  />
                  <p className="text-[10px] text-gray-600 mt-1 text-right">
                    {description.length}/500
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || isCreating}
                  className="w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  Send notification
                </button>
              </form>
            </div>

            {/* ── List ── */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                Sent notifications
              </p>

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 size={18} className="text-teal-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2.5 bg-gray-900/50 border border-gray-800 rounded-2xl">
                  <Bell size={24} className="text-gray-700" />
                  <p className="text-sm text-gray-500">
                    No notifications sent yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map((n) => (
                    <div
                      key={n.Id}
                      className="group bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-teal-600/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bell size={13} className="text-teal-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-100">
                              {n.Title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                              {n.Description}
                            </p>
                            <p className="text-[11px] text-gray-600 mt-2 flex items-center gap-1">
                              <Clock size={10} />
                              {timeAgo(n.CreatedAt)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setDeleteTarget(n)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {total > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4 px-1">
                  <p className="text-xs text-gray-500">
                    Page {page} of {Math.ceil(total / PAGE_SIZE)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 px-3 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) =>
                          p < Math.ceil(total / PAGE_SIZE) ? p + 1 : p,
                        )
                      }
                      disabled={page >= Math.ceil(total / PAGE_SIZE)}
                      className="h-8 px-3 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          notification={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
}
