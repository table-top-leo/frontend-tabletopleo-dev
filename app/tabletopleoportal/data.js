// ============================================================
// TableTop Leo Portal — dummy data
// There is no backend for a platform-level "merchant oversight"
// system yet (the existing backend only has per-business admin
// APIs). Everything below is realistic mock data so the portal
// UI can be reviewed end-to-end; swap each export for a real
// fetch once a super-admin API exists.
// ============================================================

const BUSINESS_NAMES = [
  "Copper Kettle Bistro", "Saffron & Vine", "The Hungry Fox", "Blue Anchor Grill",
  "Maple & Thyme", "Coastal Coffee Co.", "Nomad Noodle Bar", "The Rustic Oven",
  "Ember & Ash Steakhouse", "Lotus Leaf Kitchen", "Harbor Light Diner", "Golden Wheat Bakery",
  "Spice Route Kitchen", "The Green Fork", "Pearl Street Pizzeria", "Sunrise Juice Bar",
  "Ivy & Oak Cafe", "The Salty Pig", "Cloud Nine Creamery", "Basil & Bloom",
  "The Copper Spoon", "Riverside Ramen", "Velvet Bean Coffeehouse", "The Corner Deli",
  "Marigold Tandoor", "Blackbird Brewhouse", "Paper Crane Sushi", "The Wandering Waffle",
  "Ochre Kitchen & Bar", "Little Lemon Trattoria", "Northside Smokehouse", "The Daily Grind",
  "Amber Lantern Dim Sum", "Willow Creek Cafe", "The Butcher's Table", "Sage & Citrus",
  "Moonlit Taqueria", "The Tin Roof BBQ", "Cardamom Kitchen", "Fig & Olive Deli",
  "The Iron Griddle", "Crimson Chili House", "Pebble Beach Cafe", "Roost Rotisserie",
  "Honeycomb Patisserie", "The Salted Crust", "Driftwood Coffee Roasters", "Zest Kitchen",
];

const CITIES = [
  { city: "Hyderabad", country: "India", currency: "INR" },
  { city: "Bengaluru", country: "India", currency: "INR" },
  { city: "Mumbai", country: "India", currency: "INR" },
  { city: "Dubai", country: "UAE", currency: "AED" },
  { city: "Abu Dhabi", country: "UAE", currency: "AED" },
  { city: "London", country: "UK", currency: "GBP" },
  { city: "New York", country: "USA", currency: "USD" },
  { city: "Toronto", country: "Canada", currency: "CAD" },
  { city: "Singapore", country: "Singapore", currency: "SGD" },
  { city: "Copenhagen", country: "Denmark", currency: "DKK" },
];

const PLANS = ["Free", "Pro", "Enterprise"];
const BUSINESS_TYPES = ["Restaurant", "Cafe", "Bakery", "Fast Food", "Fine Dining", "Cloud Kitchen"];

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (rand() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const MERCHANTS = BUSINESS_NAMES.map((name, i) => {
  const loc = pick(CITIES);
  const status = rand() < 0.82 ? "ACTIVE" : rand() < 0.6 ? "INACTIVE" : "SUSPENDED";
  const plan = rand() < 0.45 ? "Free" : rand() < 0.8 ? "Pro" : "Enterprise";
  const joined = daysAgo(int(5, 640));
  return {
    businessId: `BUS${String(100001 + i)}`,
    adminId: uuid(),
    businessName: name,
    ownerName: pick(["A. Patel", "M. Khan", "S. Rossi", "J. Fernandez", "L. Chen", "R. Okafor", "T. Nilsson", "K. Suresh", "D. Rahman", "E. Torres"]),
    email: name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "") + "@business.com",
    phone: `+${int(1, 99)} ${int(700000000, 999999999)}`,
    city: loc.city,
    country: loc.country,
    currency: loc.currency,
    businessType: pick(BUSINESS_TYPES),
    status,
    plan,
    joinedAt: joined,
    ordersLast30: status === "ACTIVE" ? int(8, 940) : int(0, 20),
    revenueLast30: status === "ACTIVE" ? int(400, 42000) : int(0, 1200),
  };
});

export const DELETION_REQUESTS = Array.from({ length: 18 }, (_, i) => {
  const m = MERCHANTS[int(0, MERCHANTS.length - 1)];
  const requested = daysAgo(int(1, 60));
  const status = i < 5 ? "PENDING" : i < 12 ? "APPROVED" : "REJECTED";
  const reasons = [
    "Closing the physical location permanently",
    "Switching to a different ordering platform",
    "Business was sold to a new owner",
    "No longer taking online orders",
    "Duplicate account — merging with another listing",
    "Cost — moving back to phone-only orders",
  ];
  return {
    requestId: `DEL-${String(4000 + i)}`,
    businessId: m.businessId,
    adminId: m.adminId,
    businessName: m.businessName,
    requestedBy: m.ownerName,
    requestedAt: requested,
    reason: pick(reasons),
    status,
    scheduledFor: status === "APPROVED" ? daysAgo(int(-14, -1)) : null,
  };
});

export const SUBSCRIPTIONS = MERCHANTS.map((m) => {
  const priceMap = { Free: 0, Pro: 29, Enterprise: 149 };
  const subStatus =
    m.plan === "Free"
      ? "ACTIVE"
      : rand() < 0.08
        ? "PAST_DUE"
        : rand() < 0.05
          ? "CANCELLED"
          : rand() < 0.1
            ? "TRIAL"
            : "ACTIVE";
  return {
    businessId: m.businessId,
    adminId: m.adminId,
    businessName: m.businessName,
    plan: m.plan,
    status: subStatus,
    mrr: subStatus === "CANCELLED" ? 0 : priceMap[m.plan],
    startedAt: m.joinedAt,
    renewsAt: daysAgo(-int(1, 28)),
  };
});

export function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}
