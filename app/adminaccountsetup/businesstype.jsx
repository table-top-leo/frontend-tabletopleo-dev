"use client";
import { useState } from "react";
import "../designadminaccountsetup/businesstype.css";

import {
  FaUtensils,
  FaCoffee,
  FaStore,
  FaShoppingCart,
  FaBox,
  FaHamburger,
  FaCog,
} from "react-icons/fa"; 

import {
  MdBakeryDining,
  MdIcecream,
  MdLocalDrink,
} from "react-icons/md";

const BUSINESS_TYPES = [
  { id: "restaurant", label: "Restaurant", icon: FaUtensils },
  { id: "cafe", label: "Cafe", icon: FaCoffee },
  { id: "coffee-shop", label: "Coffee Shop", icon: FaCoffee },
  { id: "bakery", label: "Bakery", icon: MdBakeryDining },
  { id: "ice-cream-parlor", label: "Ice Cream Parlor", icon: MdIcecream },
  { id: "juice-shop", label: "Juice Shop", icon: MdLocalDrink },
  { id: "retail-store", label: "Retail Store", icon: FaStore },
  { id: "grocery-store", label: "Grocery Store", icon: FaShoppingCart },
  { id: "wholesale-store", label: "Wholesale Store", icon: FaBox },
  { id: "fast-food-shop", label: "Fast Food Shop", icon: FaHamburger },
  { id: "other", label: "Other", icon: FaCog },
];

export default function BusinessType({ onNext, onBack, initialData }) {
  const [selected, setSelected] = useState(initialData?.businessType || "");
  const [otherText, setOtherText] = useState(initialData?.customBusinessType || "");
  const [error, setError] = useState("");

  const handleSelect = (id) => {
    setSelected(id);
    setError("");
  };

  const handleNext = () => {
    if (!selected) {
      setError("Please select a business type to continue.");
      return;
    }

    if (selected === "other" && !otherText.trim()) {
      setError("Please describe your business type.");
      return;
    }

    onNext({
      businessType: selected,
      businessTypeLabel:
        selected === "other"
          ? otherText.trim()
          : BUSINESS_TYPES.find((b) => b.id === selected)?.label || selected,
      customBusinessType: selected === "other" ? otherText.trim() : "",
    });
  };

  return (
    <div className="business-type">
      <h2 className="step-title">Select Your Business Type</h2>

      <p className="step-subtitle">
        Choose the category that best describes your business.
      </p>

      <div className="business-grid">
        {BUSINESS_TYPES.map((biz) => {
          const Icon = biz.icon;

          return (
            <button
              key={biz.id}
              className={[
                "business-card",
                selected === biz.id ? "selected" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(biz.id)}
              aria-pressed={selected === biz.id}
              type="button"
            >
              {selected === biz.id && (
                <div className="card-check">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 6.5l2.5 2.5 4.5-5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}

              <div className="business-card-icon">
                <Icon size={30} />
              </div>

              <span className="business-card-label">
                {biz.label}
              </span>

              {biz.id === "other" && selected !== "other" && (
                <span className="card-arrow">→</span>
              )}
            </button>
          );
        })}
      </div>

      {selected === "other" && (
        <div className="other-input-wrap">
          <label className="other-input-label">
            Please specify your business type
          </label>

          <textarea
            className="other-input"
            placeholder="Enter your business type here..."
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              setError("");
            }}
          />
        </div>
      )}

      {error && (
        <div className="field-error">
          ⚠ {error}
        </div>
      )}

      <div className="step-nav">
        <button
          className="btn-back"
          onClick={onBack}
          type="button"
        >
          ← Back
        </button>

        <button
          className="btn-next"
          onClick={handleNext}
          type="button"
        >
          Next →
        </button>
      </div>
    </div>
  );
}