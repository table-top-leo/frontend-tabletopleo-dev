// app/kiosk/lib/kioskBusinessImage.js
// Ported from app/customer/CustomerLandingPage.jsx getCoverImage() — same
// table, same priority order (admin-uploaded cover/logo first) — so the
// kiosk shows the identical, stable fallback image the landing page shows
// for the same business, not a separate/random implementation.

const COVER_BY_TYPE = {
  "Restaurant": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
  "Cafe": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  "Coffee": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  "Coffee Shop": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
  "Bakery": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80",
  "Fast Food": "https://images.unsplash.com/photo-1561758033-48d52648ae8b?w=800&q=80",
  "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
  "Biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80",
  "South Indian": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&q=80",
  "North Indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "Chinese": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80",
  "Continental": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Juice Bar": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=800&q=80",
  "Ice Cream Parlour": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80",
  "Ice Cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800&q=80",
  "Sweet Shop": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=80",
  "Dhaba": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
  "Food Truck": "https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800&q=80",
  "Bar": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
  "Pub": "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80",
  "Sushi": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  "Japanese": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
  "Mexican": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
  "Italian": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Thai": "https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&q=80",
  "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  "Sandwich": "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=800&q=80",
  "Dessert": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80",
  "Healthy": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Seafood": "https://images.unsplash.com/photo-1559742811-822873691df8?w=800&q=80",
  "BBQ": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
  "Steak": "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&q=80",
  "Vegan": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Breakfast": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
  "Brunch": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
  "Tea Shop": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
  "Bubble Tea": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
  "Noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
  "Pasta": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80",
  "Kebab": "https://images.unsplash.com/photo-1529543544282-ea669407fca3?w=800&q=80",
  "Street Food": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
};

export function getKioskBusinessLogo(business) {
  if (business?.logoUrl) return business.logoUrl;
  if (business?.logo) return business.logo;
  return getKioskFallbackImage(business);
}

export function getKioskFallbackImage(business) {
  if (business?.cover) return business.cover;
  const type = business?.businessType || business?.type || "";
  if (COVER_BY_TYPE[type]) return COVER_BY_TYPE[type];
  const key = Object.keys(COVER_BY_TYPE).find(
    (k) => type.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(type.toLowerCase())
  );
  return COVER_BY_TYPE[key] || COVER_BY_TYPE["default"];
}
