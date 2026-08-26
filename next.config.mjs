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
// A published Google Site serves its page from sites.google.com and renders
// embedded URLs inside a googleusercontent iframe, so both are needed. This is
// an allowlist, not a free-for-all: any other site framing the page is still
// refused, which is what keeps clickjacking off the table.
const EMBED_ANCESTORS = "https://sites.google.com https://*.google.com https://*.googleusercontent.com";

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

// Public pages are embeddable by Google Sites only. X-Frame-Options is
// deliberately omitted here: its ALLOW-FROM variant is dead in every current
// browser, so sending DENY would override frame-ancestors and block the embed,
// while sending SAMEORIGIN would be equally wrong. frame-ancestors is the
// directive modern browsers honour.
const publicHeaders = [
  { key: "Content-Security-Policy", value: buildCsp(`'self' ${EMBED_ANCESTORS}`) },
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
        // Everything else: the public site, embeddable by Google Sites.
        source: "/((?!admin|api).*)",
        headers: publicHeaders,
      },
    ];
  },
};

export default nextConfig;
