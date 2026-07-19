"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ChevronLeft, ChevronRight, CircleDot } from "lucide-react";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";
import { useAdminReferralStats } from "@/hooks/useSales";


const PAGE_SIZE = 20;

function CreditPointsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const personFilter = searchParams.get("person") ?? undefined;
  const [page, setPage] = useState(1);

  // Credit system ledger is not implemented in this admin app yet.
  // For now, we show referral conversion/redemption stats available from `referrals`.
  const { data: stats, isLoading: statsLoading, isFetching: statsFetching } =
    useAdminReferralStats();

  const credits: Array<{
    user_id: string;
    user_name?: string;
    user_email?: string;
    current_credits: number;
    total_conversions: number;
    total_redemptions: number;
  }> = useMemo(() => {
    // Placeholder empty list; backend/ledger endpoints are required.
    return [];
  }, []);

  const total = 0;
  const totalPages = 0;

  const isLoading = statsLoading;
  const isFetching = statsFetching;


  const headerTitle = personFilter ? "User Credits" : "Credit Points";

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-white">{headerTitle}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {isLoading ? "Loading…" : `${total.toLocaleString()} users`}
              {isFetching && !isLoading && (
                <span className="ml-2 text-violet-400">Updating…</span>
              )}
            </p>
          </div>

          {stats && !personFilter && (
            <div className="ml-auto flex items-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <CircleDot size={12} className="text-violet-400" />
                <span className="text-gray-500">Total conversions (referrals/orders):</span>
                <span className="text-violet-400 font-bold">{stats.total_referrals}</span>
              </div>
              <div className="flex items-center gap-2">
                <CircleDot size={12} className="text-emerald-400" />
                <span className="text-gray-500">This month:</span>
                <span className="text-emerald-400 font-bold">{stats.this_month_referrals}</span>
              </div>
            </div>
          )}

        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={20} className="text-violet-500 animate-spin" />
            </div>
          ) : credits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <CircleDot size={32} className="text-gray-700" />
              <p className="text-sm text-gray-500">No credit data found.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/80 border-b border-gray-800 sticky top-0">
                <tr>
                  {[
                    "User",
                    "Email",
                    "Current credits",
                    "Conversions",
                    "Redemptions",
                    "Eligible (>=10)",
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
                {credits.map((u) => (
                  <tr
                    key={u.user_id}
                    className="hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-gray-200">{u.user_name ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{u.user_email ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-xs font-bold",
                          u.current_credits >= 10
                            ? "text-emerald-400"
                            : "text-violet-400",
                        )}
                      >
                        {u.current_credits}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{u.total_conversions}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{u.total_redemptions}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "text-[11px] px-2.5 py-1 rounded-full font-semibold border",
                          u.current_credits >= 10
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-gray-800/60 text-gray-400 border-gray-700",
                        )}
                      >
                        {u.current_credits >= 10 ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>


      </main>

      {/* Note: If you later want a filter dropdown, we can reuse sales_profiles lookup like referrals page does. */}
    </div>
  );
}

export default function CreditPointsAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-950">
          <Loader2 size={20} className="text-violet-500 animate-spin" />
        </div>
      }
    >
      <CreditPointsContent />
    </Suspense>
  );
}

