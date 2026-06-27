"use client";

import { useState, useTransition } from "react";
import {
  Users,
  Briefcase,
  Search,
  X,
  Download,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminJobSeekers,
  useBanUser,
  useDeleteAdminUser,
  useGetUserBanStatus,
  useUnbanUser,
} from "@/hooks/useAdmin";
import { AdminJobSeeker } from "@/model/adminModel";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const PAGE_SIZE = 20;

// ─── Ban confirm modal ────────────────────────────────────────────────────

function BanConfirmModal({
  user,
  isBanned,
  onConfirm,
  onCancel,
  isPending,
}: {
  user: AdminJobSeeker;
  isBanned: boolean;
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
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              isBanned ? "bg-green-500/10" : "bg-orange-500/10",
            )}
          >
            {isBanned ? (
              <ShieldCheck size={18} className="text-green-400" />
            ) : (
              <ShieldOff size={18} className="text-orange-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {isBanned ? "Unban user?" : "Ban user?"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {isBanned
                ? "They will regain access immediately."
                : "Their session will be invalidated immediately."}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5 px-1">
          <span className="text-white font-medium">
            {user.Name || user.Email}
          </span>{" "}
          {isBanned
            ? "will be able to log in and use the platform again."
            : "will be blocked from logging in or using any part of the platform."}
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
            className={cn(
              "flex-1 h-9 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2",
              isBanned
                ? "bg-green-600 hover:bg-green-500"
                : "bg-orange-600 hover:bg-orange-500",
            )}
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : isBanned ? (
              <ShieldCheck size={13} />
            ) : (
              <ShieldOff size={13} />
            )}
            {isBanned ? "Unban" : "Ban"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────

function DeleteConfirmModal({
  user,
  onConfirm,
  onCancel,
  isPending,
}: {
  user: AdminJobSeeker;
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
            <p className="text-sm font-bold text-white">Delete user?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5 px-1">
          <span className="text-white font-medium">
            {user.Name || user.Email}
          </span>{" "}
          will be permanently deleted along with all their data, applications
          and sessions.
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

// ─── Detail modal ─────────────────────────────────────────────────────────

function DetailModal({
  user,
  onClose,
  onDelete,
  onBan,
}: {
  user: AdminJobSeeker;
  onClose: () => void;
  onDelete: (u: AdminJobSeeker) => void;
  onBan: (u: AdminJobSeeker) => void;
}) {
  const SUB_PLAN = ["Free", "Premium"];
  const SUB_STATUS = [
    "Active",
    "Inactive",
    "Cancelled",
    "Past Due",
    "Trialing",
  ];
  const { data: banStatus } = useGetUserBanStatus(user.Id);
  const isBanned = banStatus?.isBanned ?? false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-teal-600/20 flex items-center justify-center text-teal-400 text-sm font-bold flex-shrink-0">
              {user.Name?.slice(0, 2).toUpperCase() || "??"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">
                  {user.Name || "—"}
                </p>
                {isBanned && (
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                    Banned
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{user.Email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Ban/Unban */}
            <button
              onClick={() => onBan(user)}
              className={cn(
                "h-8 px-3 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors",
                isBanned
                  ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                  : "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
              )}
            >
              {isBanned ? (
                <>
                  <ShieldCheck size={12} /> Unban
                </>
              ) : (
                <>
                  <ShieldOff size={12} /> Ban
                </>
              )}
            </button>
            <button
              onClick={() => onDelete(user)}
              className="h-8 px-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={12} /> Delete
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail, label: "Email", value: user.Email },
              { icon: Phone, label: "Phone", value: user.Phone },
              { icon: MapPin, label: "Location", value: user.Location },
              {
                icon: CheckCircle2,
                label: "Joined",
                value: new Date(user.CreatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
            ].map(({ icon: Icon, label, value }) =>
              value ? (
                <div
                  key={label}
                  className="flex items-start gap-2.5 p-3 bg-gray-800/60 rounded-xl"
                >
                  <Icon
                    size={13}
                    className="text-gray-500 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-xs font-medium text-gray-200 mt-0.5">
                      {value}
                    </p>
                  </div>
                </div>
              ) : null,
            )}
          </div>

          {/* Subscription */}
          <div className="p-3 bg-gray-800/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Subscription
            </p>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full font-semibold",
                  user.SubscriptionPlan === 1
                    ? "bg-amber-400/15 text-amber-400"
                    : "bg-gray-700 text-gray-400",
                )}
              >
                {SUB_PLAN[user.SubscriptionPlan ?? 0] ?? "Free"}
              </span>
              {user.SubscriptionStatus !== undefined && (
                <span
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium",
                    user.SubscriptionStatus === 0
                      ? "bg-green-400/10 text-green-400"
                      : "bg-gray-700 text-gray-400",
                  )}
                >
                  {SUB_STATUS[user.SubscriptionStatus] ?? "—"}
                </span>
              )}
              <span className="text-xs text-gray-500 ml-auto">
                {user.ApplicationsUsed ?? 0} /{" "}
                {user.ApplicationsLimit === -1
                  ? "∞"
                  : (user.ApplicationsLimit ?? 5)}{" "}
                applications
              </span>
            </div>
          </div>

          {/* Skills */}
          {(user.Skills ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user.Skills!.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(user.Education ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Education
              </p>
              <div className="space-y-2">
                {user.Education!.map((edu: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 bg-gray-800/60 rounded-xl"
                  >
                    <GraduationCap
                      size={13}
                      className="text-teal-400 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-200">
                        {edu.Course ?? edu.course}
                      </p>
                      <p className="text-xs text-gray-400">
                        {edu.College ?? edu.college}
                      </p>
                      {(edu.StartingYear ?? edu.starting_year) && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {edu.StartingYear ?? edu.starting_year} —{" "}
                          {edu.GraduationYear ??
                            edu.graduation_year ??
                            "Present"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {(user.PreviousExperience ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Experience
              </p>
              <div className="space-y-2">
                {user.PreviousExperience!.map((exp: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 bg-gray-800/60 rounded-xl"
                  >
                    <Briefcase
                      size={13}
                      className="text-blue-400 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-200">
                        {exp.Role ?? exp.role}
                      </p>
                      <p className="text-xs text-gray-400">
                        {exp.CompanyName ?? exp.company_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {exp.StartDate ?? exp.start_date} —{" "}
                        {(exp.CurrentlyWorking ?? exp.currently_working)
                          ? "Present"
                          : (exp.EndDate ?? exp.end_date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume */}
          {user.ResumeUrl && (
            <a
              href={user.ResumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 bg-gray-800/60 rounded-xl hover:bg-gray-800 transition-colors group"
            >
              <FileText size={13} className="text-teal-400 flex-shrink-0" />
              <p className="text-xs font-medium text-gray-200 flex-1">Resume</p>
              <ExternalLink
                size={11}
                className="text-gray-500 group-hover:text-teal-400 transition-colors"
              />
            </a>
          )}

          {/* Social links */}
          {user.SocialLinks &&
            Object.entries(user.SocialLinks).some(([, v]) => !!v) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Social links
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(user.SocialLinks).map(([key, val]) =>
                    val ? (
                      <a
                        key={key}
                        href={val as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-teal-400 hover:text-violet-300 border border-gray-700 hover:border-teal-500/40 transition-all flex items-center gap-1.5"
                      >
                        <ExternalLink size={10} />
                        {key}
                      </a>
                    ) : null,
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────

function exportToCSV(users: AdminJobSeeker[]) {
  const headers = [
    "ID",
    "Name",
    "Email",
    "Phone",
    "Location",
    "Joined",
    "Skills",
    "Resume URL",
    "Subscription Plan",
    "Applications Used",
  ];
  const rows = users.map((u) => [
    u.Id,
    u.Name,
    u.Email,
    u.Phone ?? "",
    u.Location ?? "",
    new Date(u.CreatedAt).toLocaleDateString("en-IN"),
    (u.Skills ?? []).join("; "),
    u.ResumeUrl ?? "",
    u.SubscriptionPlan === 1 ? "Premium" : "Free",
    String(u.ApplicationsUsed ?? 0),
  ]);
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `job-seekers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Row ban button (fetches its own ban status) ──────────────────────────

function BanButton({
  userId,
  onBanClick,
}: {
  userId: string;
  onBanClick: () => void;
}) {
  const { data: banStatus } = useGetUserBanStatus(userId);
  const isBanned = banStatus?.isBanned ?? false;

  return (
    <button
      onClick={onBanClick}
      className={cn(
        "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
        isBanned
          ? "text-green-400 hover:bg-green-400/10"
          : "text-gray-500 hover:text-orange-400 hover:bg-orange-400/10",
      )}
      title={isBanned ? "Unban user" : "Ban user"}
    >
      {isBanned ? <ShieldCheck size={13} /> : <ShieldOff size={13} />}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function AdminJobSeekersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminJobSeeker | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminJobSeeker | null>(null);
  const [banTarget, setBanTarget] = useState<AdminJobSeeker | null>(null);
  const [, startTransition] = useTransition();

  const { data, isLoading, isFetching } = useAdminJobSeekers(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
  );
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteAdminUser();
  const { mutate: banUser, isPending: isBanning } = useBanUser();
  const { mutate: unbanUser, isPending: isUnbanning } = useUnbanUser();
  const { data: banTargetStatus } = useGetUserBanStatus(banTarget?.Id ?? "");

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    startTransition(() => {
      setDebouncedSearch(v);
      setPage(1);
    });
  };

  const handleDelete = (user: AdminJobSeeker) => {
    setDeleteTarget(user);
    setSelectedUser(null);
  };

  const handleBan = (user: AdminJobSeeker) => {
    setBanTarget(user);
    setSelectedUser(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteUser(deleteTarget.Id, { onSuccess: () => setDeleteTarget(null) });
  };

  const confirmBan = () => {
    if (!banTarget) return;
    const isBanned = banTargetStatus?.isBanned ?? false;
    if (isBanned) {
      unbanUser(banTarget.Id, { onSuccess: () => setBanTarget(null) });
    } else {
      banUser(banTarget.Id, { onSuccess: () => setBanTarget(null) });
    }
  };

  const SUB_PLAN = ["Free", "Premium"];

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">Job Seekers</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading ? "Loading…" : `${total.toLocaleString()} total users`}
              {isFetching && !isLoading && (
                <span className="ml-2 text-teal-400">Updating…</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search name or email…"
                className="h-9 pl-8 pr-8 w-56 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-teal-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => handleSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              onClick={() => exportToCSV(users)}
              disabled={users.length === 0}
              className="h-9 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={20} className="text-teal-500 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Users size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">No job seekers found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "User",
                    "Location",
                    "Skills",
                    "Subscription",
                    "Joined",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {users.map((u) => (
                  <tr
                    key={u.Id}
                    className="hover:bg-gray-900/40 transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600/20 flex items-center justify-center text-teal-400 text-xs font-bold flex-shrink-0">
                          {u.Name?.slice(0, 2).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-200">
                            {u.Name || "—"}
                          </p>
                          <p className="text-xs text-gray-500">{u.Email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">
                        {u.Location || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[180px]">
                        {(u.Skills ?? []).slice(0, 3).map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700"
                          >
                            {s}
                          </span>
                        ))}
                        {(u.Skills ?? []).length > 3 && (
                          <span className="text-xs text-gray-600">
                            +{u.Skills!.length - 3}
                          </span>
                        )}
                        {(u.Skills ?? []).length === 0 && (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full font-medium",
                          u.SubscriptionPlan === 1
                            ? "bg-amber-400/15 text-amber-400"
                            : "bg-gray-800 text-gray-500",
                        )}
                      >
                        {SUB_PLAN[u.SubscriptionPlan ?? 0] ?? "Free"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {new Date(u.CreatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-teal-400 hover:bg-teal-400/10 transition-all"
                        >
                          <Eye size={13} />
                        </button>
                        <BanButton
                          userId={u.Id}
                          onBanClick={() => handleBan(u)}
                        />
                        <button
                          onClick={() => handleDelete(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-900 border-t border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} · {total.toLocaleString()} users
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-medium transition-all",
                      p === page
                        ? "bg-teal-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                    )}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Detail modal */}
      {selectedUser && (
        <DetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDelete={handleDelete}
          onBan={handleBan}
        />
      )}

      {/* Ban confirm */}
      {banTarget && (
        <BanConfirmModal
          user={banTarget}
          isBanned={banTargetStatus?.isBanned ?? false}
          onConfirm={confirmBan}
          onCancel={() => setBanTarget(null)}
          isPending={isBanning || isUnbanning}
        />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
}
