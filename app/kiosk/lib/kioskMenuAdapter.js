export function mapCategories(apiCategories = []) {
  return apiCategories.map((cat) => ({
    id: cat.categoryId,
    name: cat.categoryName,
    productCount: (cat.products || []).length,
  }));
}

export function mapItems(apiCategories = []) {
  return apiCategories.flatMap((cat) =>
    (cat.products || []).map((p) => ({
      id: p.productId,
      catId: cat.categoryId,
      catName: cat.categoryName,
      name: p.itemName,
      desc: p.itemDescription || "",
      price: Number(p.itemPrice),
      img: p.itemImageUrl || null,
      available: p.available !== false,
    }))
  );
}

// Groups the flat item list by category id, in category order — this is
// what the kiosk product-grid screen renders once a category is selected.
export function itemsForCategory(items, catId) {
  return items.filter((it) => it.catId === catId);
}

// Picks a kiosk grid layout ("hero" | "two" | "three") deterministically
// from how many products a category has, so a single-item combo category
// gets the big hero treatment and a long drinks list gets the compact
// 3-column layout — same spirit as tabesto's hand-picked `grid` field,
// but derived from real data instead of being hardcoded per category.
export function gridLayoutForCategory(items) {
  if (items.length <= 2) return "hero";
  if (items.length <= 6) return "two";
  return "three";
}
