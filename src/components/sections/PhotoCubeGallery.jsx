import { useEffect, useRef, useState } from "react";

const PHOTO_CUBE_FACES = [
  { title: "Alpine light", place: "Dolomites", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700&q=85" },
  { title: "Coastal quiet", place: "Amalfi", image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=700&q=85" },
  { title: "Forest canopy", place: "Olympic", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&q=85" },
  { title: "Desert lines", place: "Namib", image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=700&q=85" },
  { title: "Blue hour", place: "Lofoten", image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=700&q=85" },
  { title: "City stories", place: "Kyoto", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&q=85" },
];

export default function PhotoCubeGallery() {
  const [rotation, setRotation] = useState({ x: -18, y: -28 });
  const rotationRef = useRef(rotation);
  const drag = useRef(null);
  const velocity = useRef({ x: 0, y: 0 });
  const animationFrame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(animationFrame.current), []);

  const updateRotation = (nextRotation) => {
    rotationRef.current = nextRotation;
    setRotation(nextRotation);
  };

  const handlePointerDown = (event) => {
    cancelAnimationFrame(animationFrame.current);
    velocity.current = { x: 0, y: 0 };
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      rotation: rotationRef.current,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event) => {
    if (!drag.current) return;
    const now = performance.now();
    const elapsed = Math.max(8, now - drag.current.lastTime);
    velocity.current = {
      x: -(event.clientY - drag.current.lastY) * 0.6 * 16 / elapsed,
      y: (event.clientX - drag.current.lastX) * 0.6 * 16 / elapsed,
    };
    drag.current.lastX = event.clientX;
    drag.current.lastY = event.clientY;
    drag.current.lastTime = now;
    updateRotation({
      x: drag.current.rotation.x - (event.clientY - drag.current.y) * 0.6,
      y: drag.current.rotation.y + (event.clientX - drag.current.x) * 0.6,
    });
  };
  const handlePointerUp = (event) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    let previousTime = performance.now();
    const coast = (time) => {
      const frameScale = Math.min(2, (time - previousTime) / 16);
      previousTime = time;
      const nextVelocity = {
        x: velocity.current.x * 0.92 ** frameScale,
        y: velocity.current.y * 0.92 ** frameScale,
      };
      if (Math.abs(nextVelocity.x) < 0.02 && Math.abs(nextVelocity.y) < 0.02) {
        velocity.current = { x: 0, y: 0 };
        return;
      }
      velocity.current = nextVelocity;
      updateRotation({
        x: rotationRef.current.x + nextVelocity.x * frameScale,
        y: rotationRef.current.y + nextVelocity.y * frameScale,
      });
      animationFrame.current = requestAnimationFrame(coast);
    };
    animationFrame.current = requestAnimationFrame(coast);
  };

  return (
    <section className="overflow-hidden bg-slate-950 px-6 py-20 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300 leading-relaxed">A gallery with depth</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl leading-tight">Six views.<br />One little world.</h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">Drag the cube in any direction to turn through a collection of places worth getting lost in.</p>
          <div className="mt-8 flex items-center gap-4 text-xs text-slate-400">
            <span className="grid h-8 w-8 place-items-center rounded-full border border-white/15">↔</span>
            Drag or swipe to rotate
          </div>
        </div>
        <div
          className="grid min-h-[360px] touch-none cursor-grab place-items-center overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-950 active:cursor-grabbing [perspective:1000px]"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="img"
          aria-label="Draggable rotating six-sided photo cube"
        >
          <div
            className="relative h-60 w-60 select-none [transform-style:preserve-3d]"
            style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
          >
            {PHOTO_CUBE_FACES.map((face, index) => {
              const transforms = [
                "rotateY(0deg) translateZ(120px)",
                "rotateY(90deg) translateZ(120px)",
                "rotateY(180deg) translateZ(120px)",
                "rotateY(-90deg) translateZ(120px)",
                "rotateX(90deg) translateZ(120px)",
                "rotateX(-90deg) translateZ(120px)",
              ];
              return (
                <figure
                  key={face.title}
                  className="absolute inset-0 overflow-hidden rounded-xl border border-white/20 bg-slate-800 shadow-xl"
                  style={{ transform: transforms[index], backfaceVisibility: "hidden" }}
                >
                  <img src={face.image} alt={face.title} draggable="false" className="h-full w-full object-cover" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-4 pt-12">
                    <span className="text-xs uppercase tracking-[0.2em] text-cyan-200">{face.place}</span>
                    <span className="mt-2 block text-sm font-semibold text-white">{face.title}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
