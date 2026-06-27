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
  Plus,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Hash,
  TrendingUp,
  IndianRupee,
  Copy,
  Check,
  Users,
  BarChart3,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminSalesPeople,
  useAdminCreateSalesPerson,
  useAdminToggleSalesPerson,
  useAdminDeleteSalesPerson,
  useAdminReferralStats,
} from "@/hooks/useSales";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SalesProfile } from "@/client/salesClient";
import Link from "next/link";

const PAGE_SIZE = 20;

// ─── Create modal ─────────────────────────────────────────────────────────

function CreateSalesPersonModal({ onClose }: { onClose: () => void }) {
  const { mutate: create, isPending } = useAdminCreateSalesPerson();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    referral_code: "",
  });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Auto-generate code from name
  const autoCode = () => {
    const slug = form.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    const year = new Date().getFullYear().toString().slice(-2);
    setForm((f) => ({ ...f, referral_code: `${slug}${year}` }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.referral_code)
      return;
    create(
      {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        referral_code: form.referral_code,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <p className="text-sm font-bold text-white">Add sales person</p>
            <p className="text-xs text-gray-500 mt-0.5">
              They&apos;ll use email + password to log in
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Full name <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Rohit Sharma"
              required
              className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="rohit@company.com"
              required
              className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Password <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Min 8 characters"
                required
                minLength={8}
                className="w-full h-10 pl-3 pr-10 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+91 98765 43210"
              className="w-full h-10 px-3 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
            />
          </div>

          {/* Referral code */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Referral code <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2">
              <input
                value={form.referral_code}
                onChange={set("referral_code")}
                placeholder="e.g. ROHIT25"
                required
                maxLength={20}
                className="flex-1 h-10 px-3 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all uppercase"
              />
              <button
                type="button"
                onClick={autoCode}
                disabled={!form.name}
                className="h-10 px-3 text-xs font-semibold rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-violet-400 hover:border-violet-500/40 disabled:opacity-40 transition-all whitespace-nowrap"
              >
                Auto-generate
              </button>
            </div>
            <p className="text-xs text-gray-600">
              Customers enter this code at checkout. Letters and numbers only.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-10 rounded-xl border border-gray-700 text-sm text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-[2] h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Plus size={13} />
              )}
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────

function DeleteConfirmModal({
  person,
  onConfirm,
  onCancel,
  isPending,
}: {
  person: SalesProfile;
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
            <p className="text-sm font-bold text-white">Delete sales person?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              This deletes their account and all referral history.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-5 px-1">
          <span className="text-white font-medium">{person.name}</span> will
          lose access and all their referral records will be permanently
          removed.
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

// ─── Referral code copy pill ──────────────────────────────────────────────

function CodePill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 hover:border-violet-500/40 text-violet-400 font-mono text-xs px-2.5 py-1 rounded-lg transition-all group"
    >
      <Hash size={10} />
      {code}
      {copied ? (
        <Check size={10} className="text-green-400" />
      ) : (
        <Copy
          size={10}
          className="text-gray-600 group-hover:text-violet-400 transition-colors"
        />
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AdminSalesPeoplePage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalesProfile | null>(null);
  const [, startTransition] = useTransition();

  const { data, isLoading, isFetching } = useAdminSalesPeople(
    page,
    PAGE_SIZE,
    debouncedSearch || undefined,
  );
  const { data: stats } = useAdminReferralStats();
  const { mutate: toggleActive, isPending: isToggling } =
    useAdminToggleSalesPerson();
  const { mutate: deletePerson, isPending: isDeleting } =
    useAdminDeleteSalesPerson();

  const people = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearch = (v: string) => {
    setSearch(v);
    startTransition(() => {
      setDebouncedSearch(v);
      setPage(1);
    });
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">Sales People</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading ? "Loading…" : `${total.toLocaleString()} accounts`}
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
                placeholder="Search name, email or code…"
                className="h-9 pl-8 pr-8 w-56 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
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
              href="/admin/referrals"
              className="h-9 px-3 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5"
            >
              <BarChart3 size={13} /> Referrals
            </Link>
            <button
              onClick={() => setShowCreate(true)}
              className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} /> Add sales person
            </button>
          </div>
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="bg-gray-900/50 border-b border-gray-800/60 px-6 py-3 flex items-center gap-6 flex-shrink-0">
            {[
              {
                icon: Users,
                label: "Total",
                value: stats.total_sales_people,
                color: "text-gray-400",
              },
              {
                icon: CircleDot,
                label: "Active",
                value: stats.active_sales_people,
                color: "text-green-400",
              },
              {
                icon: TrendingUp,
                label: "Total referrals",
                value: stats.total_referrals,
                color: "text-violet-400",
              },
              {
                icon: TrendingUp,
                label: "This month",
                value: stats.this_month_referrals,
                color: "text-amber-400",
              },
              {
                icon: IndianRupee,
                label: "Total revenue",
                value: `₹${stats.total_revenue.toLocaleString("en-IN")}`,
                color: "text-emerald-400",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon size={13} className={color} />
                <span className="text-xs text-gray-500">{label}</span>
                <span className={cn("text-xs font-bold", color)}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={20} className="text-violet-500 animate-spin" />
            </div>
          ) : people.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Users size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">No sales people yet</p>
              <button
                onClick={() => setShowCreate(true)}
                className="h-9 px-5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Add the first one
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "Name",
                    "Contact",
                    "Referral code",
                    "Referrals",
                    "Revenue",
                    "Status",
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
                {people.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-900/40 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-violet-400">
                          {p.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <p className="text-xs font-semibold text-gray-200">
                          {p.name}
                        </p>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={10} className="text-gray-600" /> {p.email}
                        </p>
                        {p.phone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone size={10} className="text-gray-600" />{" "}
                            {p.phone}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Referral code */}
                    <td className="px-4 py-3">
                      <CodePill code={p.referral_code} />
                    </td>

                    {/* Referrals */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-violet-400">
                        {p.referral_count ?? 0}
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-emerald-400">
                        ₹{(p.total_revenue ?? 0).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          toggleActive({ id: p.id, is_active: !p.is_active })
                        }
                        disabled={isToggling}
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all disabled:opacity-50",
                          p.is_active
                            ? "bg-green-400/10 text-green-400 border-green-400/20 hover:bg-red-400/10 hover:text-red-400 hover:border-red-400/20"
                            : "bg-gray-700/50 text-gray-500 border-gray-700 hover:bg-green-400/10 hover:text-green-400 hover:border-green-400/20",
                        )}
                      >
                        {p.is_active ? (
                          <>
                            <UserCheck size={11} /> Active
                          </>
                        ) : (
                          <>
                            <UserX size={11} /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">
                        {new Date(p.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* <Link
                          href={`/admin/referrals?person=${p.id}`}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-violet-400 hover:bg-violet-400/10 transition-all"
                          title="View referrals"
                        >
                          <TrendingUp size={13} />
                        </Link> */}
                        <button
                          onClick={() => setDeleteTarget(p)}
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
              Page {page} of {totalPages} · {total.toLocaleString()} people
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
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-medium transition-all",
                      pg === page
                        ? "bg-violet-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                    )}
                  >
                    {pg}
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

      {showCreate && (
        <CreateSalesPersonModal onClose={() => setShowCreate(false)} />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          person={deleteTarget}
          onConfirm={() =>
            deletePerson(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            })
          }
          onCancel={() => setDeleteTarget(null)}
          isPending={isDeleting}
        />
      )}
    </div>
  );
}
