// Pure helper functions for applying active discounts to menu items.
// Shared across the mobile customer flow and the kiosk flow so the
// discount logic only needs to be written once.

export function getItemDiscount(product, activeDiscounts) {
  if (!activeDiscounts || activeDiscounts.length === 0) return null;
  // ITEM-scoped discount on this exact product wins first
  const itemMatch = activeDiscounts.find(
    (d) => d.scope === "ITEM" && (d.productIds || []).includes(product.id)
  );
  if (itemMatch) return itemMatch;
  // Otherwise fall back to a CATEGORY-scoped discount on this item's category
  const categoryMatch = activeDiscounts.find(
    (d) => d.scope === "CATEGORY" && d.categoryId === product.catId
  );
  return categoryMatch || null;
}

export function computeDiscountedPrice(originalPrice, discount) {
  if (!discount) return originalPrice;
  if (discount.discountType === "PERCENTAGE") {
    return Math.max(0, originalPrice - (originalPrice * discount.discountValue) / 100);
  }
  if (discount.discountType === "FLAT_AMOUNT") {
    return Math.max(0, originalPrice - discount.discountValue);
  }
  return originalPrice;
}

export function getComboOffers(activeDiscounts) {
  return (activeDiscounts || []).filter((d) => d.scope === "COMBO");
}

export function getStorewideOffers(activeDiscounts) {
  return (activeDiscounts || []).filter((d) => d.scope === "STOREWIDE");
}

export function getFestivalOffers(activeDiscounts) {
  return (activeDiscounts || []).filter((d) => d.offerCategory === "FESTIVAL");
}
