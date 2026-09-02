"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Cloud } from "lucide-react";

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
      // Only the password clears: retyping a username on every typo is
      // needless friction, and the username is not the secret.
      setForm((f) => ({ ...f, password: "" }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: identity. Hidden on small screens, where the form is the
          entire job and decoration would only push it below the fold. */}
      <aside
        className="hidden lg:flex flex-col justify-between p-12"
        style={{ borderRight: "1px solid var(--adm-line)" }}
      >
        <div className="flex items-center gap-3">
          <span className="adm-brand-mark">
            <Cloud className="w-4 h-4" strokeWidth={2.4} />
          </span>
          <span className="adm-mono text-xs tracking-[0.18em] uppercase" style={{ color: "var(--adm-dim)" }}>
            SXC AWS
          </span>
        </div>

        <div className="space-y-6 max-w-md">
          <div
            className="adm-mono text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--adm-accent)" }}
          >
            Operator Console
          </div>
          <h1
            className="font-display font-black leading-[0.95] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2.75rem, 5vw, 4.25rem)" }}
          >
            EVENTS.
            <br />
            REGISTRATIONS.
            <br />
            <span style={{ color: "var(--adm-accent)" }}>ATTENDANCE.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--adm-faint)" }}>
            Restricted to committee members. Every action taken here is recorded
            against the account that performed it.
          </p>
        </div>

        {/* A quiet ruled strip, echoing the stat rail inside the console. */}
        <div className="grid grid-cols-3" style={{ borderTop: "1px solid var(--adm-line)" }}>
          {["Events", "Check-in", "Walk-ins"].map((label, i) => (
            <div
              key={label}
              className="py-4 adm-mono text-[10px] tracking-[0.14em] uppercase"
              style={{
                color: "var(--adm-ghost)",
                borderRight: i < 2 ? "1px solid var(--adm-line)" : undefined,
                paddingLeft: i === 0 ? 0 : 16,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </aside>

      {/* Right: the form */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <span className="adm-brand-mark">
              <Cloud className="w-4 h-4" strokeWidth={2.4} />
            </span>
            <span className="adm-mono text-xs tracking-[0.18em] uppercase" style={{ color: "var(--adm-dim)" }}>
              SXC AWS
            </span>
          </div>

          <div className="adm-eyebrow">Restricted</div>
          <h2 className="adm-title mt-2 mb-8" style={{ fontSize: 26 }}>
            Sign in
          </h2>

          {error && (
            <div role="alert" className="adm-alert mb-5">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="adm-label">
                Username
              </label>
              <input
                id="username"
                required
                autoFocus
                autoComplete="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="aws-texx"
                className="adm-input adm-mono"
              />
            </div>

            <div>
              <label htmlFor="password" className="adm-label">
                Password
              </label>
              <input
                id="password"
                required
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••••"
                className="adm-input"
              />
            </div>

            <button type="submit" disabled={loading} className="adm-btn adm-btn-primary w-full">
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>CHECKING</span>
                </>
              ) : (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <p className="adm-hint mt-8">
            Lost access? Another committee member can reset your password with
            the admin:create script.
          </p>
        </form>
      </main>
    </div>
  );
}
