const LOGO_CLOUD_BRANDS = [
  { name: "Acme", shape: "M4 20L12 4l8 16H4z" },
  { name: "Quantum", shape: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" },
  { name: "Vertex", shape: "M3 4h18l-9 16L3 4z" },
  { name: "Hexa", shape: "M12 2l9 5v10l-9 5-9-5V7l9-5z" },
  { name: "Orbit", shape: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM2 12c0-2 4.5-4 10-4s10 2 10 4-4.5 4-10 4S2 14 2 12z" },
  { name: "Prism", shape: "M12 2l10 18H2L12 2zm0 6l-5 9h10l-5-9z" },
  { name: "Nimbus", shape: "M6 18a4 4 0 0 1-.5-8A6 6 0 0 1 17 8a5 5 0 0 1 1 10H6z" },
  { name: "Bolt", shape: "M13 2L4 14h7l-1 8 9-12h-7l1-8z" },
];

export default function LogoCloud() {
  return (
    <section className="bg-zinc-950 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 leading-relaxed">
          Trusted by fast-growing companies
        </p>
        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
          {LOGO_CLOUD_BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="group flex h-28 items-center justify-center gap-2 bg-zinc-950 text-zinc-500 transition-colors duration-300 hover:bg-zinc-900 hover:text-white ease-out"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 fill-current transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 ease-out"
              >
                <path fillRule="evenodd" d={brand.shape} />
              </svg>
              <span className="text-xl font-semibold tracking-tight">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
