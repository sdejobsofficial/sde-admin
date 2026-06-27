"use client";

import { useState, useTransition } from "react";
import {
  Search,
  X,
  Eye,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Briefcase,
  MapPin,
  Users,
  DollarSign,
  ExternalLink,
  Zap,
  Star,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminJobs,
  useDeleteAdminJob,
  useUpdateAdminJobStatus,
} from "@/hooks/useAdmin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import Image from "next/image";
import { AdminJob } from "@/model/adminModel";

const PAGE_SIZE = 20;

const WORK_MODE: Record<number, string> = {
  0: "Remote",
  1: "On-site",
  2: "Hybrid",
};
const JOB_TYPE: Record<number, string> = {
  0: "Full-time",
  1: "Part-time",
  2: "Internship",
  3: "Contract",
  4: "Freelance",
};
const JOB_STATUS: Record<number, { label: string; color: string }> = {
  0: { label: "Draft", color: "bg-gray-700 text-gray-400" },
  1: { label: "Active", color: "bg-green-400/15 text-green-400" },
  2: { label: "Closed", color: "bg-red-400/15 text-red-400" },
  3: { label: "Paused", color: "bg-amber-400/15 text-amber-400" },
};

// ─── Delete confirm ───────────────────────────────────────────────────────

function DeleteConfirmModal({
  job,
  onConfirm,
  onCancel,
  isPending,
}: {
  job: AdminJob;
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
          <span className="text-white font-medium">{job.Title}</span> at{" "}
          <span className="text-white font-medium">{job.CompanyName}</span> and
          all associated applications will be permanently deleted.
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
  job: AdminJob;
  onClose: () => void;
  onDelete: (j: AdminJob) => void;
  onStatusChange: (status: number) => void;
  isUpdating: boolean;
}) {
  const status = JOB_STATUS[job.Status] ?? JOB_STATUS[0];

  const formatSalary = () => {
    if (!job.SalaryMin && !job.SalaryMax) return null;
    const fmt = (n: number) =>
      n >= 100000 ? `${(n / 100000).toFixed(1)}L` : `${(n / 1000).toFixed(0)}K`;
    return `${job.SalaryCurrency ?? "INR"} ${fmt(job.SalaryMin ?? 0)} – ${fmt(job.SalaryMax ?? 0)}`;
  };

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
            <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {job.CompanyLogoUrl ? (
                <Image
                  src={job.CompanyLogoUrl}
                  alt=""
                  className="w-full h-full object-contain"
                  width={40}
                  height={40}
                />
              ) : (
                <Building2 size={18} className="text-gray-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-bold text-white">{job.Title}</p>
                {job.IsFeatured && (
                  <span className="text-xs bg-amber-400/15 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                    ⭐ Featured
                  </span>
                )}
                {job.IsUrgent && (
                  <span className="text-xs bg-red-400/15 text-red-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <Zap size={9} /> Urgent
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{job.CompanyName}</p>
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
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: MapPin, label: "Location", value: job.Location },
              {
                icon: Briefcase,
                label: "Job type",
                value: JOB_TYPE[job.JobType ?? -1],
              },
              {
                icon: Building2,
                label: "Work mode",
                value: WORK_MODE[job.WorkMode ?? -1],
              },
              {
                icon: Users,
                label: "Applicants",
                value: `${job.TotalApplicants} / ${job.TotalOpenings} openings`,
              },
              ...(formatSalary()
                ? [
                    {
                      icon: DollarSign,
                      label: "Salary",
                      value: formatSalary()!,
                    },
                  ]
                : []),
              ...(job.ApplicationDeadline
                ? [
                    {
                      icon: AlertTriangle,
                      label: "Deadline",
                      value: new Date(
                        job.ApplicationDeadline,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }),
                    },
                  ]
                : []),
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

          {/* Skills */}
          {(job.Skills ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.Skills!.map((s) => (
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

          {/* External apply link */}
          {job.ExternalApplyUrl && (
            <a
              href={job.ExternalApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 bg-gray-800/60 rounded-xl hover:bg-gray-800 transition-colors group"
            >
              <ExternalLink
                size={13}
                className="text-teal-400 flex-shrink-0"
              />
              <p className="text-xs font-medium text-gray-200 flex-1 truncate">
                External apply link
              </p>
              <ExternalLink
                size={11}
                className="text-gray-500 group-hover:text-teal-400 transition-colors"
              />
            </a>
          )}

          {/* Referral bonus */}
          {job.ReferralBonus && (
            <div className="p-3 bg-green-400/5 border border-green-400/15 rounded-xl">
              <p className="text-xs font-semibold text-green-400 mb-1">
                Referral bonus
              </p>
              <p className="text-xs text-gray-300">{job.ReferralBonus}</p>
            </div>
          )}

          {/* Status control */}
          <div className="p-4 bg-gray-800/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Job status
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(JOB_STATUS).map(([val, { label, color }]) => (
                <button
                  key={val}
                  onClick={() => onStatusChange(Number(val))}
                  disabled={isUpdating || job.Status === Number(val)}
                  className={cn(
                    "h-8 px-4 rounded-xl text-xs font-semibold border transition-all disabled:cursor-not-allowed",
                    job.Status === Number(val)
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-transparent border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white disabled:opacity-40",
                  )}
                >
                  {isUpdating && job.Status !== Number(val) ? (
                    <Loader2 size={11} className="animate-spin inline" />
                  ) : (
                    label
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>
              Created:{" "}
              {new Date(job.CreatedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {job.PublishedAt && (
              <span>
                Published:{" "}
                {new Date(job.PublishedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AdminJobsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminJob | null>(null);
  const [, startTransition] = useTransition();

  const { data, isLoading, isFetching } = useAdminJobs(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
  );
  const { mutate: deleteJob, isPending: isDeleting } = useDeleteAdminJob();
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateAdminJobStatus();

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

  const handleDelete = (job: AdminJob) => {
    setDeleteTarget(job);
    setSelectedJob(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteJob(deleteTarget.Id, { onSuccess: () => setDeleteTarget(null) });
  };

  const handleStatusChange = (job: AdminJob, status: number) => {
    updateStatus(
      { jobId: job.Id, status },
      {
        onSuccess: () => {
          // Optimistically update selected job in modal
          if (selectedJob?.Id === job.Id)
            setSelectedJob({ ...selectedJob, Status: status });
        },
      },
    );
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">Jobs</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading ? "Loading…" : `${total.toLocaleString()} total jobs`}
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
                placeholder="Search job title…"
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
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={20} className="text-teal-500 animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Briefcase size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">No jobs found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "Job",
                    "Company",
                    "Type",
                    "Applicants",
                    "Status",
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
                  const st = JOB_STATUS[j.Status] ?? JOB_STATUS[0];
                  return (
                    <tr
                      key={j.Id}
                      className="hover:bg-gray-900/40 transition-colors group"
                    >
                      {/* Job */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-semibold text-gray-200">
                            {j.Title}
                          </p>
                          {j.IsFeatured && (
                            <Star
                              size={11}
                              className="text-amber-400 flex-shrink-0"
                            />
                          )}
                          {j.IsUrgent && (
                            <Zap
                              size={11}
                              className="text-red-400 flex-shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <MapPin size={10} />
                          {j.Location}
                        </p>
                      </td>
                      {/* Company */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {j.CompanyLogoUrl ? (
                              <Image
                                src={j.CompanyLogoUrl}
                                alt=""
                                className="w-full h-full object-contain"
                                width={24}
                                height={24}
                              />
                            ) : (
                              <Building2 size={11} className="text-gray-600" />
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {j.CompanyName}
                          </span>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {JOB_TYPE[j.JobType ?? -1] ?? "—"}
                        </span>
                      </td>
                      {/* Applicants */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {j.TotalApplicants} / {j.TotalOpenings}
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
                      {/* Posted */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {j.PublishedAt
                            ? new Date(j.PublishedAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedJob(j)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-teal-400 hover:bg-teal-400/10 transition-all"
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

      {selectedJob && (
        <DetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onDelete={handleDelete}
          onStatusChange={(status) => handleStatusChange(selectedJob, status)}
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
