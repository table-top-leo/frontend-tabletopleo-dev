const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6163";

const platformMerchantService = {
  // Every tabletop_leo_users row, joined with business info,
  // subscription status, and 30-day order/revenue stats.
  getAllMerchants: async () => {
    const res = await fetch(`${API_BASE}/api/platform/merchants`);
    return res.json();
  },
};

export default platformMerchantService;
