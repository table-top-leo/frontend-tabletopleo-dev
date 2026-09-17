const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.tabletopleo.com";

const platformMerchantService = {
 
  getAllMerchants: async () => {
    const res = await fetch(`${API_BASE}/api/platform/merchants`);
    return res.json();
  },


  getAllDeletionRequests: async () => {
    const res = await fetch(`${API_BASE}/api/platform/deletions`);
    return res.json();
  },
};

export default platformMerchantService;