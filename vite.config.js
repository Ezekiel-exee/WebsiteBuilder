import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import compression from "vite-plugin-compression";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' ws: wss:",
  "frame-src 'self' https:",
  "form-action 'self'",
].join("; ");

const reactRefreshHash = "'sha256-Z2/iFzh9VMlVkEOar1f/oSHWwQk3ve1qk/C2WdsC4Xk='";
const developmentCsp = contentSecurityPolicy.replace("script-src 'self'", `script-src 'self' ${reactRefreshHash}`);
const securityHeaders = {
  "Content-Security-Policy": `${contentSecurityPolicy}; frame-ancestors 'none'`,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
const developmentHeaders = {
  ...securityHeaders,
  "Content-Security-Policy": `${developmentCsp}; frame-ancestors 'none'`,
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "blocksmith-production-csp",
      apply: "build",
      transformIndexHtml(html) {
        return html.replace(`script-src 'self' ${reactRefreshHash}`, "script-src 'self'");
      },
    },
    compression({ algorithm: "brotliCompress", ext: ".br", threshold: 10240, verbose: false }),
  ],
  server: { headers: developmentHeaders },
  preview: { headers: securityHeaders },
  build: {
    target: "esnext",
    minify: "oxc",
    cssMinify: "lightningcss",
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              minSize: 0,
              priority: 20,
            },
            {
              name: "motion-vendor",
              test: /node_modules[\\/](?:motion|framer-motion|lucide-react)[\\/]/,
              minSize: 0,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
