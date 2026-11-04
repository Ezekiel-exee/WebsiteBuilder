# Blocksmith — Website Builder & Component Library

An interactive React + Vite + Tailwind CSS (v4) showcase of 48 copy-paste website sections and ten full-page templates, including AI-native, interactive, commerce, real estate, healthcare, music, smart-home, higher education, and developer experiences.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Features

- **Live, responsive previews.** Each preview renders inside an iframe, so Tailwind breakpoints respond to the Desktop / Tablet / Mobile toggle the same way they would on a real device.
- **On-demand loading.** Component previews are fetched as they approach the viewport; template modules load only when selected, and source text loads only when opened or copied.
- **Stable scrolling.** Component previews use consistent, scrollable viewports so lazy-loading does not resize cards; sidebar navigation scrolls smoothly and respects reduced-motion settings.
- **One-click copy.** Every component card has a **Copy Code** button that copies the rendered component with the selected studio settings, including any code edits. It shows a "Copied!" state and a toast.
- **Editable code view.** Component and full-page JSX/TSX are formatted with Prettier when opened; reformat anytime with the **Format** button or **Shift+Alt+F**. Select Tailwind utilities or JSX properties to see replacement choices, get context-aware completions with **Ctrl+Space**, parser diagnostics, undo/redo, wrapped long lines, and editor-style indentation.
- **Live component studio.** A sticky studio panel lets you select a component and customize it independently. Choose an element scope for targeted settings; unsupported controls are disabled. Theme swatches, light/dark mode, Photoshop-style color wheels and palettes with HEX/RGB entry, four-corner radii, adjustable line thickness, hover interactions, and text animations update the selected preview and its code export.
- **Consistent design system.** Component and template source use an 8-point spacing rhythm, a balanced type scale, clear heading/body line heights, consistent focus states, and reduced-motion support. The same utility refinements are included in copied source.
- **Full-page templates.** **Copy Full Page** merges a template and all of its sections into one self-contained file. Each section in a template can also be copied on its own.
- **Featured 3D Depth Carousel.** Shows five slides at once on an infinite loop. The center slide is in focus, and the slides on either side are scaled down, rotated, and dimmed to create depth. It supports autoplay with pause, arrow buttons, dots, drag and swipe, keyboard navigation, and clicking a side slide to focus it.
- **Creative interaction showcases.** Includes a damped, touch-draggable six-face photo cube, a pointer- and keyboard-adjustable crane hook, cursor-reactive bento cards, and an automotive dashboard with state-driven rotary navigation, tachometer, and spec controls.
- **Industry suites.** Real estate search, listings, mortgage, tour, and neighborhood tools; campus alerts, programs, events, faculty, and tuition; plus interactive developer portfolio sections.
- **AI-native UX.** A keyboard-first prompt palette, citation and confidence card, and natural-language search with extracted filters.
- **Interactive widgets.** Multi-step onboarding, before/after comparison, ROI calculator, and searchable FAQ matrix.
- **Hidden Code Arcade.** Launch from the gamepad button in the sidebar footer. Play Minesweeper, Bomberman, Pac-Man, Snake, and Byte Brawl with three difficulty settings, WASD and arrow-key controls, touch controls, and automatic level progression. Minesweeper supports WASD/arrow-key tile navigation plus Enter/Space to reveal and F to flag; its boards grow with each level. Bomberman has destructible blocks hiding blast-range, bomb-capacity, and speed upgrades, directional bomb blasts, chain reactions, enemy AI, score, and lives. Pac-Man uses fast, direct grid movement with precomputed ghost routes, four ghost behaviors, power pellets, bonus fruit, a wrapping tunnel, lives, and a line-art maze. Snake updates its state in one step and places respawned food instantly without leaving a trail. Byte Brawl is an original line-art, Gun Mayhem-style platform brawler with a pre-game menu: a 15-mission campaign (a new enemy type every 3 missions — Sprinters dash, Firewalls shield, Phantoms teleport, Titans take half knockback — each tier ending in a boss, with unlockable progress), versus matches on any of 7 stages against 1–3 bots, or an online mode for up to 3 players. Online, the host creates a 5-character room code and friends join with it (peer-to-peer over WebRTC via PeerJS; the host's browser runs the match). The host picks Allies (team up against bots) or Rivals (last player standing), plus the stage, bot count and enemy type. It features double jump, drop-through platforms, damage-scaled knockback, ring-out stocks, weapon crates (SMG, shotgun, sniper, launcher) plus dev-themed power-up drops (SUDO knockback boost, TURBO speed/fire rate, SANDBOX shield, GARBAGE COLLECT damage wipe, WHILE(TRUE) unlimited jumps, SEGFAULT shockwave, LATENCY slow-down for enemies, GIT COMMIT extra stock) that knocked-out bots often drop, and bot AI that scales by difficulty.
- **Commerce patterns.** A scroll-aware glass dock, keyboard-accessible product color customizer, and cart drawer with promo and shipping logic.
- **Developer tools.** A copyable multi-language API sandbox and interactive system health dashboard with uptime history and incident filters.
- **Dedicated timelines and industry suites.** Career timeline, construction project board, automotive dashboard, retail product/cart patterns, and the existing education, real-estate, SaaS, and portfolio components.
- **Industry page templates.** Product retail, healthcare/clinical, music/streaming, and smart-home appliance compositions are available alongside the existing SaaS, portfolio, startup, real-estate, campus, and developer pages.
- **Reusable booking flows.** Date/time appointment scheduling and a three-step inquiry form, available as standalone components and in templates.
- **Downloadable curriculum sample.** The academic-program section generates a one-page PDF in the browser; set the virtual-tour component's `embedUrl` prop to your tour provider's URL to use a real 360° viewer.
- **Optimized delivery.** Modern `esnext` output, a dedicated React vendor chunk, minified assets, and pre-compressed Brotli sidecars.
- **Security headers.** The Vite dev and preview servers send a restrictive CSP and standard hardening headers; copied snippets are displayed as escaped text and never evaluated.

## Structure

```
src/
  components/
    arcade/     # Local developer-style arcade and game logic
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

The industry templates include **Product & Retail**, **Healthcare & Clinical**, **Music & Streaming**, **Smart Home & Appliances**, **Real Estate & Property**, **Campus Experience**, and **Developer Portfolio**. Components are available individually under extensible industry and design categories.

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
