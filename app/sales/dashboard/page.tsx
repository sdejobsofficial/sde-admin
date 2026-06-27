"use client";

import { useState } from "react";
import {
  Loader2,
  TrendingUp,
  IndianRupee,
  Hash,
  Copy,
  Check,
  LogOut,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  CalendarDays,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesSession } from "@/hooks/useSalesAuth";
import { useSalesMyStats, useSalesMyReferrals } from "@/hooks/useSales";

function CodeShareCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Built on the client so it always matches whatever domain this is hosted on
  const shareLink =
    typeof window !== "undefined"
      ? `https://sde-jobs.vercel.app/premium?ref=${code}`
      : "";

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 1500);
  };

  return (
    <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-5 shadow-lg shadow-violet-600/20">
      <p className="text-xs text-violet-200 font-medium uppercase tracking-wide mb-2">
        Your referral code
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-2xl font-bold text-white font-mono tracking-wide flex items-center gap-2">
          <Hash size={20} className="text-violet-300" />
          {code}
        </span>
        <button
          onClick={copyCode}
          className="h-9 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-sm"
        >
          {copied ? (
            <>
              <Check size={13} /> Copied
            </>
          ) : (
            <>
              <Copy size={13} /> Copy
            </>
          )}
        </button>
      </div>

      {/* Shareable link */}
      <div className="mt-4 pt-4 border-t border-white/15">
        <p className="text-xs text-violet-200 font-medium uppercase tracking-wide mb-2">
          Shareable link
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-9 px-3 rounded-xl bg-white/10 flex items-center gap-2 overflow-hidden">
            <Link2 size={12} className="text-violet-300 flex-shrink-0" />
            <span className="text-xs text-violet-100 truncate font-mono">
              {shareLink}
            </span>
          </div>
          <button
            onClick={copyLink}
            className="h-9 px-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all backdrop-blur-sm flex-shrink-0"
          >
            {linkCopied ? (
              <>
                <Check size={13} /> Copied
              </>
            ) : (
              <>
                <Copy size={13} /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs text-violet-200/80 mt-3 leading-relaxed">
        Share the code or link — when a customer opens the link, their code is
        filled in automatically on the Premium page.
      </p>
    </div>
  );
}

export default function SalesDashboardPage() {
  const { profile, isLoading: sessionLoading, logout } = useSalesSession();
  const [page, setPage] = useState(1);

  const { data: stats, isLoading: statsLoading } = useSalesMyStats(
    profile?.id ?? "",
  );
  const { data: referralsData, isLoading: referralsLoading } =
    useSalesMyReferrals(profile?.id ?? "", page);

  if (sessionLoading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <Loader2 size={20} className="text-violet-500 animate-spin" />
      </div>
    );
  }

  const referrals = referralsData?.data ?? [];
  const total = referralsData?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shadow-sm shadow-violet-600/40">
            <Briefcase className="text-white" size={15} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{profile.name}</p>
            <p className="text-xs text-gray-500">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="h-9 px-3.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut size={13} /> Sign out
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Top row: code card + stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <CodeShareCard code={profile.referral_code} />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {statsLoading ? (
              <div className="col-span-2 flex items-center justify-center h-full bg-gray-900 border border-gray-800 rounded-2xl">
                <Loader2 size={18} className="text-violet-500 animate-spin" />
              </div>
            ) : (
              <>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <TrendingUp size={14} className="text-violet-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.total_referrals ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">Total referrals</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <IndianRupee size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₹{(stats?.total_revenue ?? 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500">Total revenue</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <CalendarDays size={14} className="text-amber-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.this_month_referrals ?? 0}
                  </p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                    <IndianRupee size={14} className="text-sky-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ₹{(stats?.this_month_revenue ?? 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-gray-500">Revenue this month</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Referrals table */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-bold text-white">Your referrals</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Everyone who used your code at checkout
            </p>
          </div>

          {referralsLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 size={18} className="text-violet-500 animate-spin" />
            </div>
          ) : referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2.5">
              <Hash size={28} className="text-gray-700" />
              <p className="text-sm text-gray-500">No referrals yet</p>
              <p className="text-xs text-gray-600">
                Share your code above to start earning credit
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-900/60 border-b border-gray-800">
                <tr>
                  {["Customer", "Order amount", "Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {referrals.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-gray-900/40 transition-colors"
                  >
                    <td className="px-5 py-3">
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
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold text-emerald-400">
                        {r.order_amount != null
                          ? `₹${r.order_amount.toLocaleString("en-IN")}`
                          : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
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
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-800 px-5 py-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
