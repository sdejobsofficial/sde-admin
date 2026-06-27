"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  Briefcase,
  Loader2,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSalesLogin } from "@/hooks/useSales";
import { useSetSalesSession } from "@/hooks/useSalesAuth";

export default function SalesLoginPage() {
  const router = useRouter();
  const { mutateAsync: login, isPending } = useSalesLogin();
  const { mutateAsync: setSession } = useSetSalesSession();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!form.email || !form.password) return;

    login(
      { email: form.email, password: form.password },
      {
        onSuccess: (profile) => {
          setSession(profile);
          router.push("/sales/dashboard");
        },
        onError: (err: Error) =>
          setErrorMsg(err.message || "Invalid email or password"),
      },
    );
  };

  return (
    <div className="min-h-screen w-full bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-600/30">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Sales Console
          </h1>
          <p className="text-sm text-gray-500 mt-1">Internal dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-lg font-bold text-white tracking-tight">
              Sales portal
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Sign in with the email and password your admin set up for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="sales-email"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={14}
                />
                <input
                  id="sales-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="you@company.com"
                  required
                  className="w-full h-10 pl-9 pr-3 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="sales-password"
                className="text-xs font-semibold text-gray-400 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={14}
                />
                <input
                  id="sales-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="Enter your password"
                  required
                  className="w-full h-10 pl-9 pr-9 text-sm bg-gray-800 border border-gray-700 rounded-xl text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {errorMsg && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don&apos;t have access yet? Ask your admin to create your account.
          </p>
        </div>
      </div>
    </div>
  );
}
