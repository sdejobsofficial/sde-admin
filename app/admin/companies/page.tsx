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
  BadgeCheck,
  Globe,
  Users,
  MapPin,
  Briefcase,
  ExternalLink,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminCompanies,
  useDeleteAdminCompany,
  useUpdateCompanyVerification,
} from "@/hooks/useAdmin";
import { VerificationStatus } from "@/model/userModel";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminCompany } from "@/model/adminModel";
import Image from "next/image";

const PAGE_SIZE = 20;

const VERIFICATION_LABELS: Record<number, { label: string; color: string }> = {
  [VerificationStatus.Unverified]: {
    label: "Unverified",
    color: "bg-gray-700 text-gray-400",
  },
  [VerificationStatus.Pending]: {
    label: "Pending",
    color: "bg-amber-400/15 text-amber-400",
  },
  [VerificationStatus.Verified]: {
    label: "Verified",
    color: "bg-green-400/15 text-green-400",
  },
};

const COMPANY_SIZE_LABEL: Record<number, string> = {
  0: "1–10",
  1: "11–50",
  2: "51–200",
  3: "201–500",
  4: "501–1,000",
  5: "1,000+",
};

// ─── Delete confirm ───────────────────────────────────────────────────────

function DeleteConfirmModal({
  company,
  onConfirm,
  onCancel,
  isPending,
}: {
  company: AdminCompany;
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
            <p className="text-sm font-bold text-white">Delete company?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This cannot be undone.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5 px-1">
          <span className="text-white font-medium">{company.Name}</span> and all
          associated jobs, applications and data will be permanently deleted.
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
  company,
  onClose,
  onDelete,
  onVerify,
  isUpdating,
}: {
  company: AdminCompany;
  onClose: () => void;
  onDelete: (c: AdminCompany) => void;
  onVerify: (status: VerificationStatus) => void;
  isUpdating: boolean;
}) {
  const vs = VERIFICATION_LABELS[company.VerificationStatus];

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
              {company.AvatarUrl ? (
                <Image
                  src={company.AvatarUrl}
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
              <p className="text-sm font-bold text-white">
                {company.Name || "—"}
              </p>
              <p className="text-xs text-gray-400">{company.Email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(company)}
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
              { icon: MapPin, label: "Location", value: company.Location },
              {
                icon: Users,
                label: "Size",
                value:
                  company.Size !== undefined
                    ? `${COMPANY_SIZE_LABEL[company.Size]} employees`
                    : undefined,
              },
              {
                icon: Briefcase,
                label: "Active jobs",
                value: String(company.ActiveJobs),
              },
              {
                icon: BadgeCheck,
                label: "Joined",
                value: new Date(company.CreatedAt).toLocaleDateString("en-IN", {
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

          {/* About */}
          {company.Bio && (
            <div className="p-3 bg-gray-800/60 rounded-xl">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                About
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                {company.Bio}
              </p>
            </div>
          )}

          {/* Industry */}
          {(company.Industry ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Industries
              </p>
              <div className="flex flex-wrap gap-1.5">
                {company.Industry!.map((i) => (
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

          {/* Website */}
          {company.Website && (
            <a
              href={company.Website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 p-3 bg-gray-800/60 rounded-xl hover:bg-gray-800 transition-colors group"
            >
              <Globe size={13} className="text-teal-400 flex-shrink-0" />
              <p className="text-xs font-medium text-gray-200 flex-1 truncate">
                {company.Website.replace(/^https?:\/\//, "")}
              </p>
              <ExternalLink
                size={11}
                className="text-gray-500 group-hover:text-teal-400 transition-colors"
              />
            </a>
          )}

          {/* Social links */}
          {company.SocialLinks &&
            Object.entries(company.SocialLinks).some(([, v]) => !!v) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Social links
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(company.SocialLinks).map(([key, val]) =>
                    val ? (
                      <a
                        key={key}
                        href={val as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-full bg-gray-800 text-teal-400 border border-gray-700 hover:border-teal-500/40 transition-all flex items-center gap-1.5"
                      >
                        <ExternalLink size={10} />
                        {key}
                      </a>
                    ) : null,
                  )}
                </div>
              </div>
            )}

          {/* Verification */}
          <div className="p-4 bg-gray-800/60 rounded-xl">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Verification status
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {(
                [
                  {
                    label: "Unverified",
                    value: VerificationStatus.Unverified,
                    color:
                      "border-gray-700 text-gray-400 hover:border-gray-500",
                  },
                  {
                    label: "Pending",
                    value: VerificationStatus.Pending,
                    color:
                      "border-amber-500/30 text-amber-400 hover:border-amber-400",
                  },
                  {
                    label: "Verified",
                    value: VerificationStatus.Verified,
                    color:
                      "border-green-500/30 text-green-400 hover:border-green-400",
                  },
                ] as const
              ).map(({ label, value, color }) => (
                <button
                  key={value}
                  onClick={() => onVerify(value)}
                  disabled={isUpdating || company.VerificationStatus === value}
                  className={cn(
                    "h-8 px-4 rounded-xl text-xs font-semibold border transition-all disabled:cursor-not-allowed",
                    company.VerificationStatus === value
                      ? "bg-gray-700 border-gray-600 text-white"
                      : `bg-transparent ${color} disabled:opacity-40`,
                  )}
                >
                  {isUpdating && company.VerificationStatus !== value ? (
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

export default function AdminCompaniesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<AdminCompany | null>(null);
  const [, startTransition] = useTransition();

  const { data, isLoading, isFetching } = useAdminCompanies(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
  );
  const { mutate: deleteCompany, isPending: isDeleting } =
    useDeleteAdminCompany();
  const { mutate: updateVerification, isPending: isUpdating } =
    useUpdateCompanyVerification();

  const companies = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    startTransition(() => {
      setDebouncedSearch(v);
      setPage(1);
    });
  };

  const handleDelete = (company: AdminCompany) => {
    setDeleteTarget(company);
    setSelectedCompany(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCompany(deleteTarget.Id, { onSuccess: () => setDeleteTarget(null) });
  };

  const handleVerify = (company: AdminCompany, status: VerificationStatus) => {
    updateVerification({ companyId: company.Id, status });
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">Companies</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading
                ? "Loading…"
                : `${total.toLocaleString()} total companies`}
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
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={20} className="text-teal-500 animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Building2 size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">No companies found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "Company",
                    "Location",
                    "Industry",
                    "Size",
                    "Jobs",
                    "Verification",
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
                {companies.map((c) => {
                  const vs = VERIFICATION_LABELS[c.VerificationStatus];
                  return (
                    <tr
                      key={c.Id}
                      className="hover:bg-gray-900/40 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {c.AvatarUrl ? (
                              <Image
                                src={c.AvatarUrl}
                                alt=""
                                className="w-full h-full object-contain"
                                width={32}
                                height={32}
                              />
                            ) : (
                              <Building2 size={14} className="text-gray-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-200">
                              {c.Name || "—"}
                            </p>
                            <p className="text-xs text-gray-500">{c.Email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {c.Location || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[140px]">
                          {(c.Industry ?? []).slice(0, 2).map((i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700"
                            >
                              {i}
                            </span>
                          ))}
                          {(c.Industry ?? []).length > 2 && (
                            <span className="text-xs text-gray-600">
                              +{c.Industry!.length - 2}
                            </span>
                          )}
                          {(c.Industry ?? []).length === 0 && (
                            <span className="text-xs text-gray-600">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {c.Size !== undefined
                            ? COMPANY_SIZE_LABEL[c.Size]
                            : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {c.ActiveJobs}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium",
                            vs.color,
                          )}
                        >
                          {vs.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {new Date(c.CreatedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedCompany(c)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-teal-400 hover:bg-teal-400/10 transition-all"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
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
              Page {page} of {totalPages} · {total.toLocaleString()} companies
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

      {selectedCompany && (
        <DetailModal
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onDelete={handleDelete}
          onVerify={(status) => handleVerify(selectedCompany, status)}
          isUpdating={isUpdating}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          company={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
}
