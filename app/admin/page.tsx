"use client";

import { useAdminStats } from "@/hooks/useAdmin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
    Users,
    Building2,
    Briefcase,
    TrendingUp,
    Download,
    Loader2,
    Calendar,
    ArrowUpRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
    const { data: stats, isLoading } = useAdminStats();

    const handleDownload = () => {
        if (!stats) return;

        // 1. Stats Summary CSV
        const summaryHeaders = ["Metric", "Value"];
        const summaryRows = [
            ["Total Job Seekers", stats.TotalJobSeekers],
            ["Total Companies", stats.TotalCompanies],
            ["Total Jobs", stats.TotalJobs],
            ["Active Jobs", stats.ActiveJobs],
        ];
        const summaryCsv = [summaryHeaders, ...summaryRows]
            .map((row) => row.join(","))
            .join("\n");

        // 2. Weekly Trends CSV
        const weeklyHeaders = ["Day", "Signups", "Jobs"];
        const weeklyRows = stats.WeeklySignups.map((s, i) => [
            s.day,
            s.count,
            stats.WeeklyJobs[i]?.count ?? 0,
        ]);
        const weeklyCsv = [weeklyHeaders, ...weeklyRows]
            .map((row) => row.join(","))
            .join("\n");

        const combinedCsv = `--- SUMMARY ---\n${summaryCsv}\n\n--- WEEKLY TRENDS ---\n${weeklyCsv}`;

        const blob = new Blob([combinedCsv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `admin-dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen bg-gray-950 overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 size={32} className="text-teal-500 animate-spin" />
                </main>
            </div>
        );
    }

    const cards = [
        {
            title: "Job Seekers",
            value: stats?.TotalJobSeekers ?? 0,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-400/10",
        },
        {
            title: "Companies",
            value: stats?.TotalCompanies ?? 0,
            icon: Building2,
            color: "text-amber-400",
            bg: "bg-amber-400/10",
        },
        {
            title: "Total Jobs",
            value: stats?.TotalJobs ?? 0,
            icon: Briefcase,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10",
        },
        {
            title: "Active Jobs",
            value: stats?.ActiveJobs ?? 0,
            icon: TrendingUp,
            color: "text-teal-400",
            bg: "bg-teal-400/10",
        },
    ];

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden text-gray-200">
            <AdminSidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <div className="bg-gray-900 border-b border-gray-800 px-8 py-5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-white">Dashboard Overview</h1>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                            <Calendar size={12} />
                            Last updated: {new Date().toLocaleTimeString()}
                        </p>
                    </div>

                    <button
                        onClick={handleDownload}
                        className="h-10 px-5 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-teal-600/20 active:scale-95"
                    >
                        <Download size={16} />
                        Download Summary
                    </button>
                </div>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cards.map((card) => (
                            <div
                                key={card.title}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group relative overflow-hidden"
                            >
                                <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full blur-3xl opacity-20", card.bg)} />
                                <div className="flex items-start justify-between">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", card.bg)}>
                                        <card.icon size={22} className={card.color} />
                                    </div>
                                    <div className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg text-[10px] font-bold">
                                        <ArrowUpRight size={10} />
                                        Live
                                    </div>
                                </div>
                                <h3 className="text-sm font-medium text-gray-400">
                                    {card.title}
                                </h3>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {card.value.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Signups Chart */}
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Daily Signups</h2>
                                    <p className="text-xs text-gray-500 mt-1">Growth trends over the last 7 days</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Users size={18} />
                                </div>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.WeeklySignups}>
                                        <defs>
                                            <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "#111827",
                                                border: "1px solid #374151",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSignups)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Jobs Chart */}
                        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-lg font-bold text-white">Jobs Posted</h2>
                                    <p className="text-xs text-gray-500 mt-1">Job activity over the last 7 days</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                                    <Briefcase size={18} />
                                </div>
                            </div>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.WeeklyJobs}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#9ca3af", fontSize: 12 }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: "#1f2937" }}
                                            contentStyle={{
                                                backgroundColor: "#111827",
                                                border: "1px solid #374151",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            radius={[6, 6, 0, 0]}
                                        >
                                            {stats?.WeeklyJobs.map((_, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={index === (stats?.WeeklyJobs.length - 1) ? "#14b8a6" : "#2dd4bf"}
                                                    fillOpacity={0.8}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
      `}</style>
        </div>
    );
}
