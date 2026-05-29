// Re-export all API modules for easy imports
export { api, tokenManager, apiRequest } from "./client";

export {
  auth,
  universities,
  restaurants,
  plans,
  subscriptions,
  meals,
  payments,
  staff,
  admin,
  studentDashboard,
  superAdmin,
} from "./endpoints";

// Export the API functions from api.ts for backward compatibility
export { 
  adminAPI, 
  superAdminAPI, 
  plansAPI, 
  restaurantsAPI,
  authAPI 
} from "./api";
