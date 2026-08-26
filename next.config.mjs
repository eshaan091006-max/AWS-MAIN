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
// wins: no plugins, no framing, no arbitrary form targets, and connections
// limited to this origin plus Supabase.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
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
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt-and-braces with frame-ancestors, for older browsers.
  { key: "X-Frame-Options", value: "DENY" },
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
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Submitted data and admin reads must never sit in a shared cache.
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          ...securityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
