"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Users,
  Building2,
  Briefcase,
  LogOut,
  Loader2,
  LayoutDashboard,
  Bell,
  BadgeDollarSign,
  Crown,
  Gem,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLogout } from "@/hooks/useAdmin";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Job Seekers", href: "/admin/job-seekers", icon: Users },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Premium Jobs", href: "/admin/premium-jobs", icon: Gem },
  { label: "Premium Pro Users", href: "/admin/premium-pro", icon: Crown },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  {
    label: "Sales Team",
    href: "/admin/sales-management",
    icon: BadgeDollarSign,
  },
  { label: "Referrals", href: "/admin/referrals", icon: UserPlus },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { mutate: logout, isPending } = useAdminLogout();

  return (
    <aside className="w-56 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-800 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
          <Shield size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto font-nunito">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all environment-transition",
                active
                  ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                  : "text-gray-400 hover:text-white hover:bg-gray-800",
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={() => logout()}
          disabled={isPending}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <LogOut size={15} />
          )}
          Sign out
        </button>
      </div>
    </aside>
  );
}
