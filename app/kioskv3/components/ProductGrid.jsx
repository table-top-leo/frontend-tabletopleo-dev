import React from "react";
import { formatCurrency } from "../../utils/currencyHelper";

function AddButton({ onClick, tone }) {
  return (
    <button
      onClick={onClick}
      className="w-7 h-7 rounded-full flex items-center justify-center text-cream text-base font-bold shadow-md active:scale-90 transition-transform"
      style={{ backgroundColor: tone || "#e0973f" }}
      aria-label="Add to cart"
    >
      +
    </button>
  );
}

function KcalBadge({ kcal }) {
  if (kcal === null || kcal === undefined) return null;
  return (
    <span className="absolute top-1.5 left-1.5 bg-cream/95 text-charcoal text-[9px] font-semibold px-1.5 py-0.5 rounded-md shadow-sm">
      {kcal} kcal
    </span>
  );
}

function UnavailableOverlay() {
  return (
    <div className="absolute inset-0 bg-ink/55 flex items-center justify-center">
      <span className="text-cream text-[11px] font-semibold tracking-wide bg-ink/40 px-2.5 py-1 rounded-full border border-cream/20">
        Unavailable Today
      </span>
    </div>
  );
}

/* ---------- Hero card: one wide feature card per row (Bundles) ---------- */
function HeroCard({ product, onAdd, currencyCode }) {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-soft flex">
      <div className="relative w-28 shrink-0 bg-sand">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover ${product.unavailable ? "opacity-60" : ""}`}
            draggable={false}
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
        )}
        {product.unavailable && <UnavailableOverlay />}
      </div>
      <div className="flex-1 px-3.5 py-3 flex flex-col justify-center min-w-0">
        <h3 className="text-[13px] font-semibold text-charcoal leading-snug">{product.name}</h3>
        <p className="text-[11px] text-muted mt-1 leading-snug line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[13px] font-bold text-ember-deep">{formatCurrency(product.price, currencyCode)}</span>
          {!product.unavailable && <AddButton onClick={() => onAdd(product)} tone="#e0973f" />}
        </div>
      </div>
    </div>
  );
}

/* ---------- Two-column card: larger photo (Breakfast, Sandwiches...) ---------- */
function TwoColCard({ product, onAdd, currencyCode }) {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-soft flex flex-col">
      <div className="relative bg-sand">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-28 object-cover ${product.unavailable ? "opacity-60" : ""}`}
            draggable={false}
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
        ) : (
          <div className="w-full h-28" />
        )}
        <KcalBadge kcal={product.kcal} />
        {product.unavailable && <UnavailableOverlay />}
        {!product.unavailable && (
          <div className="absolute -bottom-3 right-2.5">
            <AddButton onClick={() => onAdd(product)} tone={product.cup} />
          </div>
        )}
      </div>
      <div className="px-3 pt-3.5 pb-3 flex-1 flex flex-col">
        <h3 className="text-[12.5px] font-semibold text-charcoal leading-snug">{product.name}</h3>
        <p className="text-[10.5px] text-muted mt-1 leading-snug flex-1 line-clamp-2">{product.description}</p>
        <span className="text-[12px] font-bold text-ember-deep mt-2">{formatCurrency(product.price, currencyCode)}</span>
      </div>
    </div>
  );
}

/* ---------- Three-column compact card (Juices, Smoothies, Shots...) ---------- */
function ThreeColCard({ product, onAdd, currencyCode }) {
  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-soft flex flex-col">
      <div className="relative bg-sand">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-[72px] object-cover ${product.unavailable ? "opacity-60" : ""}`}
            draggable={false}
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
        ) : (
          <div className="w-full h-[72px]" />
        )}
        <KcalBadge kcal={product.kcal} />
        {product.unavailable && <UnavailableOverlay />}
        {!product.unavailable && (
          <button
            onClick={() => onAdd(product)}
            className="absolute -bottom-2.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-cream text-xs font-bold shadow-md active:scale-90 transition-transform"
            style={{ backgroundColor: product.cup || "#e0973f" }}
            aria-label="Add to cart"
          >
            +
          </button>
        )}
      </div>
      <div className="px-2 pt-3 pb-2 flex-1 flex flex-col">
        <h3 className="text-[11px] font-semibold text-charcoal leading-tight">{product.name}</h3>
        <p className="text-[9px] text-muted mt-0.5 leading-tight flex-1 line-clamp-2">{product.description}</p>
        <span className="text-[10.5px] font-bold text-ember-deep mt-1.5">{formatCurrency(product.price, currencyCode)}</span>
      </div>
    </div>
  );
}

const GRID_CONFIG = {
  hero: { wrap: "flex flex-col gap-2.5", Card: HeroCard },
  two: { wrap: "grid grid-cols-2 gap-2.5", Card: TwoColCard },
  three: { wrap: "grid grid-cols-3 gap-2", Card: ThreeColCard },
};

export default function ProductGrid({ categoryName, layout, products, onAdd, currencyCode }) {
  const { wrap, Card } = GRID_CONFIG[layout] || GRID_CONFIG.two;

  return (
    <div className="px-3.5 pt-4 pb-28">
      <div className="flex items-baseline justify-between mb-3 px-0.5">
        <h2 className="font-display font-semibold text-charcoal text-lg">{categoryName}</h2>
        <span className="text-[11px] text-muted">{products.length} items</span>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">No items in this category yet.</p>
      ) : (
        <div className={wrap}>
          {products.map((p) => (
            <Card key={p.id} product={p} onAdd={onAdd} currencyCode={currencyCode} />
          ))}
        </div>
      )}
    </div>
  );
}
