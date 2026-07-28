import React from "react";

export default function Sidebar({ categories, activeCategory, onSelectCategory, onHome }) {
  return (
    <div className="flex flex-col h-full w-[86px] sm:w-[104px] bg-white border-r border-charcoal/8 shrink-0">
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 flex flex-col items-center gap-0.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="w-full flex flex-col items-center gap-1 py-2 px-1"
            >
              <span
                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-colors ${
                  isActive ? "border-ember" : "border-transparent"
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                />
              </span>
              <span
                className={`text-[9.5px] leading-tight text-center px-1 ${
                  isActive ? "text-ember-deep font-semibold" : "text-charcoal/55 font-medium"
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={onHome}
        className="flex flex-col items-center gap-1 py-3 border-t border-charcoal/8 text-charcoal/50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5L12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[9.5px] font-semibold">Home</span>
      </button>
    </div>
  );
}
