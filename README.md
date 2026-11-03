# Blocksmith — Website Builder & Component Library

An interactive React + Vite + Tailwind CSS (v4) showcase of 42 copy-paste website sections and six full-page templates, including AI-native, interactive, commerce, real estate, higher education, and developer experiences.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features

- **Live, responsive previews.** Each preview renders inside an iframe, so Tailwind breakpoints respond to the Desktop / Tablet / Mobile toggle the same way they would on a real device.
- **On-demand loading.** Component previews are fetched as they approach the viewport; template modules load only when selected, and source text loads only when opened or copied.
- **Stable scrolling.** Component previews use consistent, scrollable viewports so lazy-loading does not resize cards; sidebar navigation scrolls smoothly and respects reduced-motion settings.
- **One-click copy.** Every component card has a **Copy Code** button that copies the exact source file being rendered. It shows a "Copied!" state and a toast.
- **Full-page templates.** **Copy Full Page** merges a template and all of its sections into one self-contained file. Each section in a template can also be copied on its own.
- **Featured 3D Depth Carousel.** Shows five slides at once on an infinite loop. The center slide is in focus, and the slides on either side are scaled down, rotated, and dimmed to create depth. It supports autoplay with pause, arrow buttons, dots, drag and swipe, keyboard navigation, and clicking a side slide to focus it.
- **Industry suites.** Real estate search, listings, mortgage, tour, and neighborhood tools; campus alerts, programs, events, faculty, and tuition; plus interactive developer portfolio sections.
- **AI-native UX.** A keyboard-first prompt palette, citation and confidence card, and natural-language search with extracted filters.
- **Interactive widgets.** Multi-step onboarding, before/after comparison, ROI calculator, and searchable FAQ matrix.
- **Commerce patterns.** A scroll-aware glass dock, keyboard-accessible product color customizer, and cart drawer with promo and shipping logic.
- **Developer tools.** A copyable multi-language API sandbox and interactive system health dashboard with uptime history and incident filters.
- **Reusable booking flows.** Date/time appointment scheduling and a three-step inquiry form, available as standalone components and in templates.
- **Downloadable curriculum sample.** The academic-program section generates a one-page PDF in the browser; set the virtual-tour component's `embedUrl` prop to your tour provider's URL to use a real 360° viewer.
- **Optimized delivery.** Modern `esnext` output, a dedicated React vendor chunk, minified assets, and pre-compressed Brotli sidecars.
- **Security headers.** The Vite dev and preview servers send a restrictive CSP and standard hardening headers; copied snippets are displayed as escaped text and never evaluated.

## Structure

```
src/
  components/
    sections/   # Self-contained sections (only depend on React + Tailwind) — these are what users copy
    builder/    # Builder UI: sidebar, preview iframe, code viewer, copy button, toasts
  data/
    registry.js   # Component metadata + lazy component/source loaders, grouped into extensible categories
    templates.js  # Lazy template loaders and ordered section metadata
  templates/    # Full-page compositions of sections
  utils/        # Clipboard helper and single-file template bundler
```

### Adding a component or category

1. Create `src/components/sections/MySection.jsx` with a default export. Import only from `react`. Put any custom keyframes in an inline `<style>` tag so the file works without other files.
2. Prefix top-level constants and helper components with the component name (for example, `MY_SECTION_ITEMS`). This avoids name clashes when templates are bundled into one file.
3. Add its metadata to `src/data/registry.js` and add its id to an existing or new entry in the `CATEGORIES` array. The registry's `import.meta.glob` loaders provide lazy component and `?raw` source imports.
4. To include it in a page, import it into a file under `src/templates/` and render it as a self-closing component. Register its ordered export names in `src/data/templates.js`; template modules and their copyable source are loaded on demand.

The current industry templates are **Real Estate & Property**, **Campus Experience**, and **Developer Portfolio**. Components are available individually under extensible **SaaS & AI Platforms**, **Real Estate & PropTech**, **Higher Education & EdTech**, **Developer & Creative Portfolios**, and **E-Commerce & Retail** categories.

## Content Security Policy

`index.html` includes a meta CSP for script, style, image, frame, and form sources. Meta CSP cannot enforce `frame-ancestors`, so deployments must also set it as an HTTP response header. The Vite dev and preview servers apply these recommended headers:

```text
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' ws: wss:; frame-src 'self' https:; form-action 'self'; frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

The broad HTTPS image/frame sources support the sample imagery and configurable virtual-tour embeds. Production deployments should replace them with the exact hosts they use. Inline styles are allowed because the component library uses Tailwind plus dynamic style attributes; inline scripts remain blocked.
The development server additionally allows the fixed SHA-256 hash of Vite React Fast Refresh's inline preamble; the production build removes that hash from the meta policy and uses the strict `script-src 'self'` policy shown above.
Configure the production host/CDN to serve the generated `.br` files with `Content-Encoding: br` and `Vary: Accept-Encoding`; keep the original assets available as a fallback.
