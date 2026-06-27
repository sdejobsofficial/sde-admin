"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  IndianRupee,
  TrendingUp,
  Users,
  CircleDot,
  Hash,
  User,
  Calendar,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAdminAllReferrals,
  useAdminReferralStats,
  useAdminSalesPeople,
} from "@/hooks/useSales";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

function ReferralsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const personFilter = searchParams.get("person") ?? undefined;

  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useAdminAllReferrals(
    page,
    personFilter,
  );
  const { data: stats } = useAdminReferralStats();
  // Pull a large page of sales people just to populate the filter dropdown + name lookup
  const { data: peopleData } = useAdminSalesPeople(1, 200);

  const referrals = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 30);

  const filteredPerson = peopleData?.data.find((p) => p.id === personFilter);

  const setPersonFilter = (id?: string) => {
    setPage(1);
    if (id) router.push(`/admin/referrals?person=${id}`);
    else router.push("/admin/referrals");
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">Referrals</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading ? "Loading…" : `${total.toLocaleString()} redemptions`}
              {isFetching && !isLoading && (
                <span className="ml-2 text-violet-400">Updating…</span>
              )}
            </p>
          </div>

          {/* <div className="flex items-center gap-2 ml-auto">
            <select
              value={personFilter ?? ""}
              onChange={(e) => setPersonFilter(e.target.value || undefined)}
              className="h-9 px-3 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:border-violet-500 transition-all max-w-[200px]"
            >
              <option value="">All sales people</option>
              {peopleData?.data.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.referral_code})
                </option>
              ))}
            </select>

            {personFilter && (
              <button
                onClick={() => setPersonFilter(undefined)}
                className="h-9 px-3 rounded-xl border border-gray-700 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors flex items-center gap-1.5"
              >
                <X size={13} /> Clear
              </button>
            )}
          </div> */}
        </div>

        {/* Filtered person banner */}
        {filteredPerson && (
          <div className="bg-violet-500/5 border-b border-violet-500/20 px-6 py-2.5 flex items-center gap-2 flex-shrink-0">
            <User size={13} className="text-violet-400" />
            <span className="text-xs text-gray-300">
              Showing referrals for{" "}
              <span className="font-semibold text-violet-400">
                {filteredPerson.name}
              </span>
            </span>
            <span className="text-xs text-gray-600 font-mono">
              {filteredPerson.referral_code}
            </span>
          </div>
        )}

        {/* Stats strip */}
        {stats && !personFilter && (
          <div className="bg-gray-900/50 border-b border-gray-800/60 px-6 py-3 flex items-center gap-6 flex-shrink-0">
            {[
              {
                icon: Users,
                label: "Active sellers",
                value: stats.active_sales_people,
                color: "text-gray-400",
              },
              {
                icon: TrendingUp,
                label: "Total referrals",
                value: stats.total_referrals,
                color: "text-violet-400",
              },
              {
                icon: CircleDot,
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
          ) : referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <TrendingUp size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">
                {personFilter
                  ? "This sales person has no referrals yet"
                  : "No referrals yet"}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "Customer",
                    "Referral code",
                    !personFilter && "Sales person",
                    "Order amount",
                    "Date",
                  ]
                    .filter(Boolean)
                    .map((h) => (
                      <th
                        key={h as string}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {referrals.map((r) => {
                  const seller = peopleData?.data.find(
                    (p) => p.id === r.sales_profile_id,
                  );
                  return (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-900/40 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-gray-200">
                            {r.user_name ?? "Unknown user"}
                          </p>
                          {r.user_email && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail size={10} className="text-gray-600" />{" "}
                              {r.user_email}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 text-violet-400 font-mono text-xs px-2.5 py-1 rounded-lg w-fit">
                          <Hash size={10} />
                          {r.referral_code}
                        </span>
                      </td>

                      {/* Sales person (only when not filtered) */}
                      {!personFilter && (
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-400">
                            {seller?.name ?? "—"}
                          </span>
                        </td>
                      )}

                      {/* Amount */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-emerald-400">
                          {r.order_amount != null
                            ? `₹${r.order_amount.toLocaleString("en-IN")}`
                            : "—"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <Calendar size={11} className="text-gray-600" />
                          {new Date(r.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
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
              Page {page} of {totalPages} · {total.toLocaleString()} referrals
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
    </div>
  );
}

export default function AdminReferralsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-950">
          <Loader2 size={20} className="text-violet-500 animate-spin" />
        </div>
      }
    >
      <ReferralsContent />
    </Suspense>
  );
}
