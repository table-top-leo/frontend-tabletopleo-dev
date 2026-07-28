import React from "react";

export default function HomeGrid({ categories, onSelectCategory }) {
  return (
    <div className="px-3.5 pt-4 pb-28">
      <div className="mb-4 px-0.5">
        <p className="text-[11px] uppercase tracking-[0.2em] text-ember-deep font-semibold">Browse the menu</p>
        <h2 className="font-display font-semibold text-charcoal text-xl mt-0.5">What are you craving?</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`rounded-2xl overflow-hidden bg-white shadow-soft active:scale-[0.98] transition-transform ${
              i === 0 ? "col-span-2" : ""
            }`}
          >
            <div className={`w-full overflow-hidden bg-sand ${i === 0 ? "aspect-[16/7]" : "aspect-[4/3]"}`}>
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                />
              ) : null}
            </div>
            <div className="py-2.5 text-center text-[13px] font-semibold text-charcoal">
              {cat.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
