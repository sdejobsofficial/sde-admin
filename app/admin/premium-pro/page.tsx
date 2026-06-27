"use client";

import { useState, useTransition } from "react";
import {
  Crown,
  Search,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminJobSeekers,
  useAdminPremiumPlusUsers,
  useHandleTooglePremiumPlus,
} from "@/hooks/useAdmin";
import { AdminJobSeeker } from "@/model/adminModel";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const PAGE_SIZE = 20;

// ─── Add Premium Pro Modal ────────────────────────────────────────────────

function AddPremiumProModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [, startTransition] = useTransition();
  const [confirmTarget, setConfirmTarget] = useState<AdminJobSeeker | null>(
    null,
  );

  const { data, isLoading } = useAdminJobSeekers(
    1,
    10,
    debouncedSearch || undefined,
  );
  const { mutate: togglePremiumPlus, isPending } = useHandleTooglePremiumPlus();

  const users = (data?.data ?? []).filter(
    (u) => u.SubscriptionPlan === 1 && !u.IsPremiumPlus, // only premium users not already Pro
  );

  const handleSearch = (v: string) => {
    setSearch(v);
    startTransition(() => setDebouncedSearch(v));
  };

  const handleConfirm = () => {
    if (!confirmTarget) return;
    togglePremiumPlus(confirmTarget.Id, {
      onSuccess: () => {
        setConfirmTarget(null);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <UserPlus size={15} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Add Premium Pro User
              </p>
              <p className="text-xs text-gray-500">
                Search premium users to upgrade
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-gray-800 flex-shrink-0">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search name, email, or user ID…"
              autoFocus
              className="h-9 pl-8 pr-8 w-full text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-amber-500/60 transition-all"
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
          <p className="text-[10px] text-gray-600 mt-1.5 px-0.5">
            Only users with an active Premium subscription can be upgraded to
            Premium Pro.
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={18} className="text-amber-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 px-6 text-center">
              <Crown size={24} className="text-gray-700" />
              <p className="text-xs text-gray-500">
                {debouncedSearch
                  ? "No eligible Premium users found. They may be on the Free plan, already Premium Pro, or the ID/email doesn't match anyone."
                  : "No premium users available."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/60">
              {users.map((u) => (
                <div
                  key={u.Id}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                    {u.Name?.slice(0, 2).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-200 truncate">
                      {u.Name || "—"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{u.Email}</p>
                  </div>
                  <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide flex-shrink-0">
                    Premium
                  </span>
                  <button
                    onClick={() => setConfirmTarget(u)}
                    className="h-7 px-3 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600/30 text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0"
                  >
                    <Sparkles size={11} />
                    Upgrade
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm sub-modal */}
        {confirmTarget && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm z-10">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    Upgrade to Premium Pro?
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    This grants Premium Pro access.
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4 px-0.5">
                <span className="text-white font-medium">
                  {confirmTarget.Name || confirmTarget.Email}
                </span>{" "}
                will receive Premium Pro benefits immediately.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmTarget(null)}
                  disabled={isPending}
                  className="flex-1 h-9 rounded-xl border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isPending}
                  className="flex-1 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Sparkles size={13} />
                  )}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Revoke confirm modal ─────────────────────────────────────────────────

function RevokeConfirmModal({
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
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Revoke Premium Pro?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              They will lose Pro access immediately.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5 px-1">
          <span className="text-white font-medium">
            {user.Name || user.Email}
          </span>{" "}
          will be downgraded from Premium Pro to standard Premium.
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
            className="flex-1 h-9 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <AlertTriangle size={13} />
            )}
            Revoke
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
  onRevoke,
}: {
  user: AdminJobSeeker;
  onClose: () => void;
  onRevoke: (u: AdminJobSeeker) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 text-sm font-bold flex-shrink-0">
              {user.Name?.slice(0, 2).toUpperCase() || "??"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">
                  {user.Name || "—"}
                </p>
                <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                  Pro
                </span>
              </div>
              <p className="text-xs text-gray-400">{user.Email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRevoke(user)}
              className="h-8 px-3 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle size={12} /> Revoke Pro
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
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-400/15 text-amber-400">
                Premium
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
                <Sparkles size={10} /> Pro
              </span>
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
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export default function AdminPremiumProUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminJobSeeker | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<AdminJobSeeker | null>(null);
  const [, startTransition] = useTransition();

  const { data, isLoading, isFetching } = useAdminPremiumPlusUsers(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
  );
  const { mutate: togglePremiumPlus, isPending: isToggling } =
    useHandleTooglePremiumPlus();

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

  const confirmRevoke = () => {
    if (!revokeTarget) return;
    togglePremiumPlus(revokeTarget.Id, {
      onSuccess: () => setRevokeTarget(null),
    });
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Crown size={15} className="text-violet-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">
                Premium Pro Users
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {isLoading
                  ? "Loading…"
                  : `${total.toLocaleString()} pro user${total !== 1 ? "s" : ""} on this page`}
                {isFetching && !isLoading && (
                  <span className="ml-2 text-violet-400">Updating…</span>
                )}
              </p>
            </div>
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
                className="h-9 pl-8 pr-8 w-56 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition-all"
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
              onClick={() => setShowAddModal(true)}
              className="h-9 px-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <UserPlus size={14} />
              Add Pro User
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="bg-gray-900/50 border-b border-gray-800/60 px-6 py-3 flex items-center gap-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={12} className="text-violet-400" />
            <span className="text-xs text-gray-400">
              Showing Premium Pro users from current page
            </span>
          </div>
          <div className="h-3 w-px bg-gray-800" />
          <span className="text-xs text-gray-500">
            Premium Pro users have access to all premium features plus exclusive
            Pro benefits
          </span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={20} className="text-violet-500 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                <Crown size={22} className="text-violet-700" />
              </div>
              <p className="text-sm text-gray-500">
                No Premium Pro users found
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="h-8 px-4 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <UserPlus size={12} />
                Add the first Pro user
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "User",
                    "Location",
                    "Skills",
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
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                            {u.Name?.slice(0, 2).toUpperCase() || "?"}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gray-950 rounded-full flex items-center justify-center">
                            <Sparkles size={8} className="text-violet-400" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-gray-200">
                              {u.Name || "—"}
                            </p>
                            <span className="text-[9px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">
                              Pro
                            </span>
                          </div>
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
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                          title="View details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => setRevokeTarget(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-orange-400 hover:bg-orange-400/10 transition-all"
                          title="Revoke Premium Pro"
                        >
                          <AlertTriangle size={13} />
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
              Page {page} of {totalPages}
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
                        ? "bg-violet-600 text-white"
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

      {/* Add Pro User Modal */}
      {showAddModal && (
        <AddPremiumProModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Detail modal */}
      {selectedUser && (
        <DetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onRevoke={(u) => {
            setRevokeTarget(u);
            setSelectedUser(null);
          }}
        />
      )}

      {/* Revoke confirm */}
      {revokeTarget && (
        <RevokeConfirmModal
          user={revokeTarget}
          onConfirm={confirmRevoke}
          onCancel={() => setRevokeTarget(null)}
          isPending={isToggling}
        />
      )}
    </div>
  );
}
