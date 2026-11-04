const PATHS = {
  copy: "M8 8V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3M5 8h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z",
  check: "M5 12l5 5L20 7",
  desktop: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM8 21h8M12 17v4",
  tablet: "M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2",
  mobile: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
  layout: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 9h18M9 21V9",
  carousel: "M7 5h10v14H7zM3 7v10M21 7v10",
  nav: "M3 5h18v4H3zM3 13h8M3 17h5",
  hero: "M3 4h18v16H3zM7 10h10M9 14h6",
  grid: "M3 3h8v10H3zM13 3h8v6h-8zM13 11h8v10h-8zM3 15h8v6H3z",
  gallery: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 16l5-5 4 4 3-3 6 6M15.5 8.5h.01",
  quote: "M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6",
  pricing: "M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  faq: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  cta: "M5 12h14M13 6l6 6-6 6",
  footer: "M3 3h18v18H3zM3 15h18M7 18h3M14 18h3",
  sparkles: "M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z",
  external: "M14 3h7v7M10 14L21 3M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5",
  rotate: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5",
  gamepad: "M6.5 9h11a4.5 4.5 0 0 1 4.3 5.8l-1 3a2.5 2.5 0 0 1-3.8 1.3l-3.1-2h-3.8l-3.1 2a2.5 2.5 0 0 1-3.8-1.3l-1-3A4.5 4.5 0 0 1 6.5 9zM7 12v4M5 14h4M16 12h.01M19 15h.01",
};

export default function Icon({ name, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
