import { useState } from "react";

const MASONRY_GALLERY_ITEMS = [
  { id: 1, src: "https://picsum.photos/seed/arch-1/600/800", title: "Concrete Lines", category: "Architecture" },
  { id: 2, src: "https://picsum.photos/seed/nature-1/600/400", title: "Valley Morning", category: "Nature" },
  { id: 3, src: "https://picsum.photos/seed/people-1/600/700", title: "Street Portrait", category: "People" },
  { id: 4, src: "https://picsum.photos/seed/arch-2/600/450", title: "Glass Tower", category: "Architecture" },
  { id: 5, src: "https://picsum.photos/seed/nature-2/600/900", title: "Waterfall", category: "Nature" },
  { id: 6, src: "https://picsum.photos/seed/people-2/600/500", title: "Market Day", category: "People" },
  { id: 7, src: "https://picsum.photos/seed/nature-3/600/650", title: "Coastline", category: "Nature" },
  { id: 8, src: "https://picsum.photos/seed/arch-3/600/750", title: "Spiral Stairs", category: "Architecture" },
  { id: 9, src: "https://picsum.photos/seed/people-3/600/420", title: "Golden Hour", category: "People" },
];

const MASONRY_GALLERY_FILTERS = ["All", "Architecture", "Nature", "People"];

export default function MasonryGallery() {
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState(null);

  const items = filter === "All" ? MASONRY_GALLERY_ITEMS : MASONRY_GALLERY_ITEMS.filter((i) => i.category === filter);
  const lightboxIndex = items.findIndex((i) => i.id === lightbox);

  const step = (dir) => {
    const nextIndex = (lightboxIndex + dir + items.length) % items.length;
    setLightbox(items[nextIndex].id);
  };

  return (
    <section className="relative bg-neutral-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl leading-tight">Selected work</h2>
            <p className="mt-4 text-neutral-500 leading-relaxed">A curated collection of recent shoots. Click any photo to expand.</p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-full bg-white p-2 shadow-sm ring-1 ring-neutral-200">
            {MASONRY_GALLERY_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  filter === f ? "bg-neutral-900 text-white shadow" : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLightbox(item.id)}
              className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl text-left"
            >
              <img
                src={item.src}
                alt={item.title}
                loading="lazy"
                className="w-full transition duration-700 group-hover:scale-110 ease-out"
              />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-transparent p-6 opacity-0 transition duration-500 group-hover:opacity-100 ease-out">
                <span className="text-xs font-medium uppercase tracking-wider text-white/70">{item.category}</span>
                <span className="translate-y-2 text-lg font-semibold text-white transition duration-500 group-hover:translate-y-0 ease-out">
                  {item.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== -1 && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          ref={(el) => el && el.focus()}
          onKeyDown={(e) => {
            if (e.key === "Escape") setLightbox(null);
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
          }}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 outline-none backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            aria-label="Previous image"
            className="absolute left-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          >
            â€¹
          </button>
          <figure onClick={(e) => e.stopPropagation()} className="max-h-full max-w-3xl">
            <img
              src={items[lightboxIndex].src}
              alt={items[lightboxIndex].title}
              className="max-h-[75vh] w-auto rounded-xl object-contain shadow-xl"
            />
            <figcaption className="mt-4 text-center text-white">
              {items[lightboxIndex].title}
              <span className="ml-2 text-white/50">
                {lightboxIndex + 1} / {items.length}
              </span>
            </figcaption>
          </figure>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            aria-label="Next image"
            className="absolute right-4 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
          >
            â€º
          </button>
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            âœ•
          </button>
        </div>
      )}
    </section>
  );
}
