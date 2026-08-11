"use client";
import React from "react";
import { formatCurrency } from "../../utils/currencyHelper";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";

function AddButton({ onClick, className }) {
  return (
    <button onClick={onClick} className={`ttlKioskPepperAddBtn ${className}`} style={{ background: "var(--kiosk-ember)" }} aria-label="Add to cart">
      +
    </button>
  );
}

function HeroCard({ product, currencyCode, onAdd }) {
  const unavailable = product.available === false;
  return (
    <div className="ttlKioskPepperCardHero">
      <div className="ttlKioskPepperImgWrap">
        <img src={product.img || FALLBACK_IMG} alt={product.name} style={{ opacity: unavailable ? 0.6 : 1 }} draggable={false} />
        {unavailable && <div className="ttlKioskPepperUnavailable"><span>Unavailable Today</span></div>}
      </div>
      <div className="ttlKioskPepperHeroBody">
        <h3 className="ttlKioskPepperName">{product.name}</h3>
        {product.desc && <p className="ttlKioskPepperDesc">{product.desc}</p>}
        <div className="ttlKioskPepperHeroFoot">
          <span className="ttlKioskPepperPrice">{formatCurrency(product.price, currencyCode)}</span>
          {!unavailable && <AddButton onClick={() => onAdd(product)} className="" />}
        </div>
      </div>
    </div>
  );
}

function TwoColCard({ product, currencyCode, onAdd }) {
  const unavailable = product.available === false;
  return (
    <div className="ttlKioskPepperCardTwo">
      <div className="ttlKioskPepperImgWrap">
        <img src={product.img || FALLBACK_IMG} alt={product.name} style={{ opacity: unavailable ? 0.6 : 1 }} draggable={false} />
        {unavailable && <div className="ttlKioskPepperUnavailable"><span>Unavailable Today</span></div>}
        {!unavailable && <AddButton onClick={() => onAdd(product)} className="ttlKioskPepperAddFloat" />}
      </div>
      <div className="ttlKioskPepperTwoBody">
        <h3 className="ttlKioskPepperName">{product.name}</h3>
        {product.desc && <p className="ttlKioskPepperDesc">{product.desc}</p>}
        <span className="ttlKioskPepperPrice">{formatCurrency(product.price, currencyCode)}</span>
      </div>
    </div>
  );
}

function ThreeColCard({ product, currencyCode, onAdd }) {
  const unavailable = product.available === false;
  return (
    <div className="ttlKioskPepperCardThree">
      <div className="ttlKioskPepperImgWrap">
        <img src={product.img || FALLBACK_IMG} alt={product.name} style={{ opacity: unavailable ? 0.6 : 1 }} draggable={false} />
        {unavailable && <div className="ttlKioskPepperUnavailable"><span>Unavailable</span></div>}
        {!unavailable && <AddButton onClick={() => onAdd(product)} className="ttlKioskPepperAddSmall" />}
      </div>
      <div className="ttlKioskPepperThreeBody">
        <h3 className="ttlKioskPepperName">{product.name}</h3>
        {product.desc && <p className="ttlKioskPepperDesc">{product.desc}</p>}
        <span className="ttlKioskPepperPrice">{formatCurrency(product.price, currencyCode)}</span>
      </div>
    </div>
  );
}

const GRID = {
  hero: { wrap: "ttlKioskPepperWrapHero", Card: HeroCard },
  two: { wrap: "ttlKioskPepperWrapTwo", Card: TwoColCard },
  three: { wrap: "ttlKioskPepperWrapThree", Card: ThreeColCard },
};

export default function KioskProductGrid({ categoryName, layout, products, currencyCode, onAdd }) {
  const { wrap, Card } = GRID[layout] || GRID.three;
  return (
    <div className="ttlKioskPepperGrid">
      <div className="ttlKioskPepperHead">
        <h2 className="ttlKioskPepperCatName">{categoryName}</h2>
        <span className="ttlKioskPepperCount">{products.length} items</span>
      </div>
      <div className={wrap}>
        {products.map((p) => (
          <Card key={p.id} product={p} currencyCode={currencyCode} onAdd={onAdd} />
        ))}
      </div>
      {products.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--kiosk-muted)", fontSize: 13, padding: "40px 0" }}>No items in this category yet.</p>
      )}
    </div>
  );
}
