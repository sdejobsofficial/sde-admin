"use client";

import { useState, useTransition } from "react";
import {
  Search,
  X,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Briefcase,
  Plus,
  MapPin,
  Star,
  Zap,
  Globe,
  ToggleLeft,
  ToggleRight,
  Eye,
  Building2,
  DollarSign,
  Users,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Image from "next/image";
import Link from "next/link";
import { AdminPremiumJob } from "@/client/adminClient";
import { useAdminPremiumJobs, useDeleteAdminPremiumJob, useUpdateAdminPremiumJobStatus } from "@/hooks/useAdmin";

const PAGE_SIZE = 20;

const JOB_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "bg-gray-700 text-gray-400" },
  1: {label: "Pending Approval", color: "bg-green-400/15 text-green-400" },
  2: { label: "Active", color: "bg-green-400/15 text-green-400" },
  3: { label: "Paused", color: "bg-amber-400/15 text-amber-400" },
  4: { label: "Closed", color: "bg-red-400/15 text-red-400" },
  5 : { label: "Rejected", color: "bg-red-400/15 text-red-400" },
};

const WORK_MODE: Record<number, string> = {
  0: "Remote",
  1: "Hybrid",
  2: "On-site",
};

const formatSalary = (min: number, max: number, currency: string) => {
  const fmt = (n: number) =>
    n >= 100000
      ? `${(n / 100000).toFixed(1)}L`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)}K`
        : String(n);
  return `${currency} ${fmt(min)}–${fmt(max)}`;
};

// ─── Delete confirm ───────────────────────────────────────────────────────

function DeleteConfirmModal({
  job,
  onConfirm,
  onCancel,
  isPending,
}: {
  job: AdminPremiumJob;
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
            <p className="text-sm font-bold text-white">Delete job?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5 px-1">
          <span className="text-white font-medium">{job.title}</span> and all
          associated applications will be permanently deleted.
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
  job,
  onClose,
  onDelete,
  onStatusChange,
  isUpdating,
}: {
  job: AdminPremiumJob;
  onClose: () => void;
  onDelete: (j: AdminPremiumJob) => void;
  onStatusChange: (status: number) => void;
  isUpdating: boolean;
}) {
  const status = JOB_STATUS[job.status] ?? JOB_STATUS[0];

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
            {job.company_meta?.logo_url ? (
              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0">
                <Image
                  src={job.company_meta.logo_url}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <Star size={16} className="text-violet-400" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{job.title}</p>
                {job.is_featured && (
                  <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-medium">
                    Featured
                  </span>
                )}
                {job.is_urgent && (
                  <span className="text-xs bg-red-400/10 text-red-400 border border-red-400/20 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Zap size={9} /> Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{job.company_meta?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(job)}
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
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Location", value: job.location },
              {
                icon: Globe,
                label: "Work mode",
                value: WORK_MODE[job.work_mode],
              },
              {
                icon: DollarSign,
                label: "Salary",
                value: formatSalary(
                  job.salary_min,
                  job.salary_max,
                  job.salary_currency,
                ),
              },
              {
                icon: Users,
                label: "Openings",
                value: `${job.total_openings} openings · ${job.total_applicants} applicants`,
              },
              {
                icon: Building2,
                label: "Company size",
                value:
                  job.company_meta?.size !== undefined
                    ? ["1–10", "11–50", "51–200", "201–500", "501–1K", "1K+"][
                        job.company_meta.size
                      ] + " employees"
                    : undefined,
              },
              {
                icon: Briefcase,
                label: "Posted",
                value: new Date(job.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
            ]
              .filter(Boolean)
              .map(({ icon: Icon, label, value }) =>
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

          {/* Company bio */}
          {job.company_meta?.bio && (
            <div className="p-3 bg-gray-800/60 rounded-xl">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Company bio
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                {job.company_meta.bio}
              </p>
            </div>
          )}

          {/* Industries */}
          {(job.company_meta?.industry ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Industries
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.company_meta.industry!.map((i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {job.skills?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-violet-500/10 text-violet-400 px-2.5 py-1 rounded-full border border-violet-500/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External URL */}
          {job.external_apply_url && (
            <a
              href={job.external_apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 bg-gray-800/60 rounded-xl hover:bg-gray-800 transition-colors group"
            >
              <ExternalLink
                size={13}
                className="text-violet-400 flex-shrink-0"
              />
              <p className="text-xs font-medium text-gray-200 flex-1 truncate">
                {job.external_apply_url.replace(/^https?:\/\//, "")}
              </p>
              <ExternalLink
                size={11}
                className="text-gray-500 group-hover:text-violet-400 transition-colors"
              />
            </a>
          )}

          {/* Status control */}
          <div className="p-4 bg-gray-800/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Job status
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  {
                    label: "Draft",
                    value: 0,
                    color:
                      "border-gray-700 text-gray-400 hover:border-gray-500",
                  },
                  {
                    label: "Active",
                    value: 1,
                    color:
                      "border-green-500/30 text-green-400 hover:border-green-400",
                  },
                  {
                    label: "Paused",
                    value: 2,
                    color:
                      "border-amber-500/30 text-amber-400 hover:border-amber-400",
                  },
                  {
                    label: "Closed",
                    value: 3,
                    color:
                      "border-red-500/30 text-red-400 hover:border-red-400",
                  },
                ] as const
              ).map(({ label, value, color }) => (
                <button
                  key={value}
                  onClick={() => onStatusChange(value)}
                  disabled={isUpdating || job.status === value}
                  className={cn(
                    "h-8 px-4 rounded-xl text-xs font-semibold border transition-all disabled:cursor-not-allowed",
                    job.status === value
                      ? "bg-gray-700 border-gray-600 text-white"
                      : `bg-transparent ${color} disabled:opacity-40`,
                  )}
                >
                  {isUpdating && job.status !== value ? (
                    <Loader2 size={11} className="animate-spin inline" />
                  ) : (
                    label
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AdminPremiumJobsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<AdminPremiumJob | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPremiumJob | null>(
    null,
  );
  const [, startTransition] = useTransition();

  const { data, isLoading, isFetching } = useAdminPremiumJobs(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
  );
  const { mutate: deleteJob, isPending: isDeleting } =
    useDeleteAdminPremiumJob();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateAdminPremiumJobStatus();

  const jobs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    startTransition(() => {
      setDebouncedSearch(v);
      setPage(1);
    });
  };

  const handleDelete = (job: AdminPremiumJob) => {
    setDeleteTarget(job);
    setSelectedJob(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteJob(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Premium Jobs</h1>
              <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/25 px-2 py-0.5 rounded-full font-medium">
                Admin only
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading
                ? "Loading…"
                : `${total.toLocaleString()} premium jobs`}
              {isFetching && !isLoading && (
                <span className="ml-2 text-violet-400">Updating…</span>
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
                placeholder="Search jobs…"
                className="h-9 pl-8 pr-8 w-52 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
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
            <Link
              href="/admin/premium-jobs/new"
              className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Post premium job
            </Link>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={20} className="text-violet-500 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Star size={24} className="text-violet-400" />
              </div>
              <p className="text-sm text-gray-500">No premium jobs yet</p>
              <Link
                href="/admin/premium-jobs/new"
                className="h-9 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Post the first one
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "Job",
                    "Company",
                    "Location",
                    "Salary",
                    "Status",
                    "Openings",
                    "Posted",
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
                {jobs.map((j) => {
                  const st = JOB_STATUS[j.status] ?? JOB_STATUS[0];
                  return (
                    <tr
                      key={j.id}
                      className="hover:bg-gray-900/40 transition-colors group"
                    >
                      {/* Job */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-gray-200">
                                {j.title}
                              </p>
                              {j.is_featured && (
                                <Star
                                  size={10}
                                  className="text-amber-400 fill-amber-400"
                                />
                              )}
                              {j.is_urgent && (
                                <Zap
                                  size={10}
                                  className="text-red-400 fill-red-400"
                                />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {WORK_MODE[j.work_mode] ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {j.company_meta?.logo_url ? (
                            <div className="w-6 h-6 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                              <Image
                                src={j.company_meta.logo_url}
                                alt=""
                                width={24}
                                height={24}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                              <Building2
                                size={11}
                                className="text-violet-400"
                              />
                            </div>
                          )}
                          <span className="text-xs text-gray-300 font-medium">
                            {j.company_meta?.name ?? "—"}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {j.location || "—"}
                        </span>
                      </td>

                      {/* Salary */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {j.salary_min && j.salary_max
                            ? formatSalary(
                                j.salary_min,
                                j.salary_max,
                                j.salary_currency,
                              )
                            : "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium",
                            st.color,
                          )}
                        >
                          {st.label}
                        </span>
                      </td>

                      {/* Openings */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {j.total_applicants}/{j.total_openings}
                        </span>
                      </td>

                      {/* Posted */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(j.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedJob(j)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(j)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-900 border-t border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages} · {total.toLocaleString()} jobs
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

      {selectedJob && (
        <DetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDelete={handleDelete}
          onStatusChange={(status) =>
            updateStatus({ jobId: selectedJob.id, status })
          }
          isUpdating={isUpdating}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          job={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
}
