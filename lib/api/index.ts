// Re-export all API modules for easy imports
export { api, tokenManager, apiRequest } from "./client";

export {
  auth,
  universities,
  plans,
  subscriptions,
  meals,
  payments,
  staff,
  admin,
  studentDashboard,
  superAdmin,
} from "./endpoints";
