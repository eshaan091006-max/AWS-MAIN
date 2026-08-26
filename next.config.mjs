/** @type {import('next').NextConfig} */

// Event posters come from wherever the committee hosts them, so images are not
// restricted to a fixed list. This is a deliberate trade: `img-src https:`
// still blocks http, data-exfiltrating schemes and any script execution — an
// image cannot run code — but it does mean an admin-supplied URL can see
// visitors' IP addresses. Acceptable when only signed-in officers can set it.

// Content Security Policy.
//
// 'unsafe-inline' on styles is required by Tailwind's runtime style injection,
// and Next.js injects inline bootstrap scripts, so scripts allow it too. That
// weakens XSS protection but the remaining directives still block the common
// wins: no plugins, no arbitrary form targets, and connections limited to this
// origin plus Supabase.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // Web Workers are instantiated from blob: URLs (bundled worker code is
  // inlined rather than served as a file). Without this directive the browser
  // falls back to script-src, which has no blob:, and blocks the worker.
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  // Supabase REST + realtime. Wildcarded because the project ref is part of
  // the hostname and comes from an env var at deploy time.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "upgrade-insecure-requests",
];

// Who may put this site in an iframe.
//
// Public pages allow any https parent. This is broader than an allowlist of
// Google domains, and it is deliberate: Google Sites renders an embed inside a
// sandboxed iframe, and a sandboxed frame has an opaque origin that matches no
// frame-ancestors source at all. Naming sites.google.com therefore does not
// work, and no longer list can fix it.
//
// The trade is acceptable *for these pages specifically*: they carry no
// authenticated state. The session cookie is SameSite=Strict so it is never
// sent cross-site, and /admin and /api are excluded below and stay
// frame-ancestors 'none'. What remains is that someone could frame the public
// pages — the worst case is tricking a visitor into submitting a registration,
// not taking over an account.
const PUBLIC_ANCESTORS = "https:";

const buildCsp = (frameAncestors) =>
  [...cspDirectives, `frame-ancestors ${frameAncestors}`].join("; ");

// Headers common to every response, with no framing directive of their own —
// framing is decided per-path below.
const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

// The admin area must never be framed by anyone. Framing it would allow a
// clickjacking overlay on destructive controls, and X-Frame-Options has no
// allowlist form, so it can only be used where the answer is a flat "no".
const adminHeaders = [
  { key: "Content-Security-Policy", value: buildCsp("'none'") },
  { key: "X-Frame-Options", value: "DENY" },
  ...baseSecurityHeaders,
];

// X-Frame-Options is deliberately omitted here. It has no allowlist form that
// any current browser honours, so sending DENY would override frame-ancestors
// and block the embed, and SAMEORIGIN would do the same. frame-ancestors is the
// directive that actually expresses this policy.
const publicHeaders = [
  { key: "Content-Security-Policy", value: buildCsp(`'self' ${PUBLIC_ANCESTORS}`) },
  ...baseSecurityHeaders,
];

const nextConfig = {
  reactStrictMode: true,
  // Do not leak the framework version to scanners.
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    // Matches the CSP above. With unoptimized:true these are plain <img> tags,
    // but keeping the two in step means enabling optimisation later will not
    // suddenly start rejecting images that already render.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    // Next applies every matching rule, so these sources must not overlap —
    // two rules both setting Content-Security-Policy would send the header
    // twice and browsers enforce the intersection, silently blocking the embed.
    return [
      {
        // Admin pages and every API route: never framable.
        source: "/admin/:path*",
        headers: adminHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          // Submitted data and admin reads must never sit in a shared cache.
          { key: "Cache-Control", value: "no-store, max-age=0" },
          ...adminHeaders,
        ],
      },
      {
        // Everything else: the public site, embeddable by any https parent.
        source: "/((?!admin|api).*)",
        headers: publicHeaders,
      },
    ];
  },
};

export default nextConfig;
