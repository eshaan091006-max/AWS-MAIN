"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, User, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Sign in failed.");

      router.replace("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Sign in failed.");
      // Clear only the password: retyping the username on every typo is
      // needless friction.
      setForm((f) => ({ ...f, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-28 pb-20">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-3xl bg-navy-900/80 border border-aws-orange/30 backdrop-blur-2xl shadow-2xl space-y-5"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-aws-orange/15 border border-aws-orange/30 flex items-center justify-center text-aws-orange">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-bold text-white">Admin Access</h1>
          <p className="text-[11px] text-slate-400 font-mono">
            SXC AWS Club committee only
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono"
          >
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="username" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <User className="w-3 h-3 text-aws-orange" />
            <span>Username</span>
          </label>
          <input
            id="username"
            required
            autoFocus
            autoComplete="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="e.g. aws_lead"
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs font-mono"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-aws-orange" />
            <span>Password</span>
          </label>
          <input
            id="password"
            required
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl bg-navy-950 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-aws-orange text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-aws-orange to-amber-600 hover:from-amber-500 hover:to-aws-orange text-black font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          <span>{loading ? "Checking..." : "Sign In"}</span>
        </button>
      </form>
    </div>
  );
}
