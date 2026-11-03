import { useEffect, useMemo, useRef, useState } from "react";

const CART_DRAWER_ITEMS = [
  { id: "sneaker", name: "Everyday Runner", variant: "Midnight · Size 9", price: 128, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=240&q=80" },
  { id: "tote", name: "Utility Carryall", variant: "Natural canvas", price: 32, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=240&q=80" },
];
const CART_DRAWER_FREE_SHIPPING = 150;

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [quantities, setQuantities] = useState({ sneaker: 1, tote: 1 });
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [notice, setNotice] = useState("");
  const [checkedOut, setCheckedOut] = useState(false);
  const closeRef = useRef(null);
  const subtotal = useMemo(() => CART_DRAWER_ITEMS.reduce((sum, item) => sum + item.price * quantities[item.id], 0), [quantities]);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal >= CART_DRAWER_FREE_SHIPPING ? 0 : 8;
  const total = subtotal - discount + shipping;
  const itemCount = Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  const remainingForShipping = Math.max(0, CART_DRAWER_FREE_SHIPPING - subtotal);

  useEffect(() => {
    if (!open) return undefined;
    const frameWindow = closeRef.current?.ownerDocument.defaultView;
    if (!frameWindow) return undefined;
    closeRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    frameWindow.addEventListener("keydown", handleKeyDown);
    return () => frameWindow.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const updateQuantity = (id, amount) => {
    setQuantities((current) => ({ ...current, [id]: Math.max(1, current[id] + amount) }));
    setCheckedOut(false);
  };

  const applyPromo = (event) => {
    event.preventDefault();
    if (promo.trim().toUpperCase() === "SAVE10") {
      setPromoApplied(true);
      setNotice("SAVE10 applied · 10% off your items.");
    } else {
      setPromoApplied(false);
      setNotice("That code didn’t work. Try SAVE10.");
    }
  };

  return (
    <section className="bg-gradient-to-br from-stone-50 to-orange-50 px-5 py-20 text-slate-900">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[.2em] text-orange-700">A better bag experience</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Your cart, without the detour</h2>
        <p className="mt-3 text-slate-600">A clear, focused checkout that keeps the next step close.</p>
        <button type="button" onClick={() => { setOpen(true); setNotice(""); }} aria-haspopup="dialog" className="mt-7 rounded-xl bg-slate-950 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
          Open cart <span className="ml-2 rounded-full bg-white/15 px-2 py-0.5 text-xs">{itemCount}</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <aside role="dialog" aria-modal="true" aria-labelledby="cart-title" className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <div><h3 id="cart-title" className="text-lg font-bold">Your bag <span className="text-sm font-normal text-slate-500">({itemCount})</span></h3><p className="mt-1 text-xs text-slate-500">Free shipping over $150</p></div>
              <button ref={closeRef} type="button" aria-label="Close cart" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full text-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-600">×</button>
            </header>

            <div className="border-b border-slate-100 px-5 py-4">
              {remainingForShipping ? <p className="text-sm text-slate-600">You&apos;re <strong>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(remainingForShipping)}</strong> away from free shipping.</p> : <p className="text-sm font-semibold text-emerald-700">You unlocked free shipping!</p>}
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Free shipping progress" aria-valuemin="0" aria-valuemax={CART_DRAWER_FREE_SHIPPING} aria-valuenow={Math.min(subtotal, CART_DRAWER_FREE_SHIPPING)}>
                <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-emerald-400 transition-all duration-500" style={{ width: `${Math.min(100, subtotal / CART_DRAWER_FREE_SHIPPING * 100)}%` }} />
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {CART_DRAWER_ITEMS.map((item) => (
                <article key={item.id} className="flex gap-4">
                  <img src={item.image} alt="" className="h-24 w-24 rounded-xl bg-slate-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2"><h4 className="font-semibold">{item.name}</h4><span className="text-sm font-semibold">${item.price}</span></div>
                    <p className="mt-1 text-xs text-slate-500">{item.variant}</p>
                    <div className="mt-3 inline-flex items-center rounded-lg border border-slate-200">
                      <button type="button" aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50">−</button>
                      <span aria-live="polite" className="min-w-8 text-center text-sm">{quantities[item.id]}</span>
                      <button type="button" aria-label={`Increase ${item.name} quantity`} onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-50">+</button>
                    </div>
                  </div>
                </article>
              ))}
              <form onSubmit={applyPromo} className="flex gap-2 border-t border-slate-100 pt-5">
                <label htmlFor="cart-promo-code" className="sr-only">Promo code</label>
                <input id="cart-promo-code" value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Promo code" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100" />
                <button type="submit" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">Apply</button>
              </form>
              {notice && <p role="status" className={`text-xs ${promoApplied ? "text-emerald-700" : "text-rose-700"}`}>{notice}</p>}
            </div>

            <footer className="border-t border-slate-200 p-5">
              <div className="space-y-2 text-sm">
                <p className="flex justify-between text-slate-600"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></p>
                {discount > 0 && <p className="flex justify-between text-emerald-700"><span>Discount</span><span>−${discount.toFixed(2)}</span></p>}
                <p className="flex justify-between text-slate-600"><span>Shipping</span><span>{shipping ? `$${shipping.toFixed(2)}` : "Free"}</span></p>
                <p className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900"><span>Total</span><span>${total.toFixed(2)}</span></p>
              </div>
              <button type="button" onClick={() => setCheckedOut(true)} className="mt-4 w-full rounded-xl bg-slate-950 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">
                {checkedOut ? "Checkout demo complete ✓" : "Continue to checkout"}
              </button>
              {checkedOut && <p role="status" className="mt-2 text-center text-xs text-emerald-700">Your demo order is ready. No payment was collected.</p>}
            </footer>
          </aside>
        </div>
      )}
    </section>
  );
}
