/**
 * Chakula Poa API Endpoints
 * Updated for ALL populated areas across Tanzania
 * 
 * Maps to Django URLs:
 * - /api/users/          - Authentication & user management
 * - /api/restaurants/    - Restaurant/location listing (formerly universities)
 * - /api/plans/          - Subscription plans
 * - /api/subscriptions/  - User subscriptions
 * - /api/meals/          - Meals & orders
 * - /api/codes/          - Daily QR/CPS codes
 * - /api/payments/       - Payment processing
 * - /api/staff/          - Staff verification & serving
 * - /api/admin/          - Admin dashboard & reports
 * - /api/regions/        - Tanzania regions
 */

import { api, tokenManager } from "./client";
import type {
  User,
  Restaurant,
  University,
  SubscriptionPlan,
  Subscription,
  Meal,
  MealOrder,
  Transaction,
  AuthResponse,
  UserDashboardStats,
  AdminDashboardStats,
  DemandReport,
  VerificationResponse,
  DailyCode,
  LocationType,
  SystemStats,
} from "@/lib/types";

/**
 * Auth endpoints - /api/users/
 */
export const auth = {
  register: async (data: {
    first_name: string;
    last_name?: string;
    phone_number: string;
    email?: string;
    registration_number?: string;
    restaurant_id?: string;  // Changed from university
    region?: string;
    password: string;
  }) => {
    const response = await api.post<AuthResponse>("/api/users/register/", data as Record<string, unknown>, {
      requiresAuth: false,
    });
    if (response.data) {
      tokenManager.setTokens(response.data.access, response.data.refresh);
    }
    return {
      ...response,
      data: response.data
        ? {
            token: response.data.access,
            cps_number: response.data.cps_number,
            user: response.data.user,
          }
        : undefined,
    };
  },

  login: async (data: { identifier: string; password: string }) => {
    const response = await api.post<AuthResponse>("/api/users/login/", data as Record<string, unknown>, {
      requiresAuth: false,
    });
    if (response.data) {
      tokenManager.setTokens(response.data.access, response.data.refresh);
    }
    return {
      ...response,
      data: response.data
        ? {
            token: response.data.access,
            user: response.data.user,
          }
        : undefined,
    };
  },

  logout: () => {
    tokenManager.clearTokens();
    return api.post("/api/users/logout/", {});
  },

  me: () => api.get<User>("/api/users/me/"),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>("/api/users/me/", data as Record<string, unknown>),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post("/api/users/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    }),

  refreshToken: (refresh: string) =>
    api.post<{ access: string }>("/api/users/token/refresh/", { refresh }),
};

/**
 * Restaurants endpoints - /api/restaurants/
 * Supports all location types: restaurants, universities, markets, offices, hospitals, industrial
 */
export const restaurants = {
  getAll: (params?: { 
    region?: string; 
    location_type?: LocationType;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.append("region", params.region);
    if (params?.location_type) queryParams.append("location_type", params.location_type);
    if (params?.search) queryParams.append("search", params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return api.get<Restaurant[]>(`/api/restaurants/${query}`, { requiresAuth: false });
  },
  getById: (id: string) =>
    api.get<Restaurant>(`/api/restaurants/${id}/`, { requiresAuth: false }),
  getByRegion: (region: string) =>
    api.get<Restaurant[]>(`/api/restaurants/?region=${encodeURIComponent(region)}`, { requiresAuth: false }),
  getByType: (locationType: LocationType) =>
    api.get<Restaurant[]>(`/api/restaurants/?location_type=${locationType}`, { requiresAuth: false }),
};

// Legacy alias for backwards compatibility
export const universities = {
  getAll: () => restaurants.getAll({ location_type: "university" }),
  getById: (id: string) => restaurants.getById(id),
};

/**
 * Regions endpoints - /api/regions/
 */
export const regions = {
  getAll: () => api.get<string[]>("/api/regions/", { requiresAuth: false }),
};

/**
 * Subscription Plans endpoints - /api/plans/
 */
export const plans = {
  getAll: (restaurantId?: string) => {
    const query = restaurantId ? `?restaurant_id=${restaurantId}` : "";
    return api.get<SubscriptionPlan[]>(`/api/plans/${query}`, {
      requiresAuth: false,
    });
  },
  getById: (id: string) =>
    api.get<SubscriptionPlan>(`/api/plans/${id}/`, { requiresAuth: false }),
};

/**
 * Subscriptions endpoints - /api/subscriptions/
 */
export const subscriptions = {
  getCurrent: () => api.get<Subscription>("/api/subscriptions/me/"),
  create: (planId: string) =>
    api.post<Subscription>("/api/subscriptions/", { plan_id: planId }),
  getHistory: () => api.get<Subscription[]>("/api/subscriptions/history/"),
  cancel: (id: string) => api.delete(`/api/subscriptions/${id}/`),
};

/**
 * Daily Codes endpoints - /api/codes/
 * QR codes and CPS codes rotate daily at midnight
 */
export const codes = {
  getToday: () => api.get<DailyCode>("/api/codes/today/"),
  verify: (cpsCode: string) => 
    api.post<VerificationResponse>("/api/codes/verify/", { cps_code: cpsCode }),
};

/**
 * Meals endpoints - /api/meals/
 */
export const meals = {
  getAvailable: (date?: string) => {
    const query = date ? `?date=${date}` : "";
    return api.get<Meal[]>(`/api/meals/${query}`);
  },
  getById: (id: string) => api.get<Meal>(`/api/meals/${id}/`),
  select: (mealId: string) =>
    api.post<MealOrder>("/api/meals/select/", { meal_id: mealId }),
  getOrders: (status?: string) => {
    const query = status ? `?status=${status}` : "";
    return api.get<MealOrder[]>(`/api/meals/orders/${query}`);
  },
  cancelOrder: (orderId: string) => api.delete(`/api/meals/orders/${orderId}/`),
  getStatus: (date?: string) => {
    const query = date ? `?date=${date}` : "";
    return api.get<{ tea: MealOrder | null; lunch: MealOrder | null; evening: MealOrder | null }>(`/api/meals/status/${query}`);
  },
};

/**
 * Payments endpoints - /api/payments/
 * Supports M-Pesa, Airtel Money, Halopesa, Tigo Pesa, Mix by Yas, Bank Transfer via Selcom
 */
export const payments = {
  initiate: (data: {
    plan_id: string;
    payment_method: "mpesa" | "airtel_money" | "halopesa" | "tigopesa" | "mix_by_yas" | "bank_transfer";
    phone_number: string;
    amount: number;
  }) =>
    api.post<{ 
      reference: string; 
      order_id: string; 
      checkout_url?: string; 
      message: string;
      payment_status: string;
    }>(
      "/api/payments/initiate/",
      data
    ),
  checkStatus: (paymentId: string) =>
    api.get<{ 
      status: "pending" | "processing" | "completed" | "failed"; 
      transaction_id?: string;
      reference?: string;
    }>(
      `/api/payments/${paymentId}/status/`
    ),
  getHistory: () => api.get<Transaction[]>("/api/payments/history/"),
  getById: (id: string) => api.get<Transaction>(`/api/payments/${id}/`),
  // Callback endpoint for Selcom webhooks (internal)
  callback: (data: Record<string, unknown>) =>
    api.post("/api/payments/callback/", data, { requiresAuth: false }),
};

/**
 * Staff endpoints - /api/staff/
 */
export const staff = {
  verifyUser: (cpsNumber?: string, qrCode?: string) =>
    api.post<VerificationResponse>("/api/staff/verify/", {
      cps_number: cpsNumber,
      qr_code: qrCode,
    }),
  // Legacy alias
  verifyStudent: (cpsNumber?: string, qrCode?: string) =>
    staff.verifyUser(cpsNumber, qrCode),
  serveMeal: (orderId: string) =>
    api.post<MealOrder>("/api/staff/serve/", { order_id: orderId }),
  getTodaysOrders: () => api.get<MealOrder[]>("/api/staff/orders/today/"),
  getStats: () =>
    api.get<{ served_today: number; pending_today: number }>(
      "/api/staff/stats/"
    ),
};

/**
 * Admin endpoints - /api/admin/
 */
export const admin = {
  getDashboardStats: () => api.get<AdminDashboardStats>("/api/admin/dashboard/"),

  // Meal management
  getMeals: (date?: string) => {
    const query = date ? `?date=${date}` : "";
    return api.get<Meal[]>(`/api/admin/meals/${query}`);
  },
  createMeal: (data: Partial<Meal>) =>
    api.post<Meal>("/api/admin/meals/", data as Record<string, unknown>),
  updateMeal: (id: string, data: Partial<Meal>) =>
    api.patch<Meal>(`/api/admin/meals/${id}/`, data as Record<string, unknown>),
  deleteMeal: (id: string) => api.delete(`/api/admin/meals/${id}/`),

  // Staff management
  getStaff: () => api.get<User[]>("/api/admin/staff/"),
  createStaff: (data: Partial<User> & { password: string }) =>
    api.post<User>("/api/admin/staff/", data as Record<string, unknown>),
  updateStaff: (id: string, data: Partial<User>) =>
    api.patch<User>(`/api/admin/staff/${id}/`, data as Record<string, unknown>),
  deleteStaff: (id: string) => api.delete(`/api/admin/staff/${id}/`),

  // Users (formerly students)
  getUsers: (params?: { search?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return api.get<User[]>(`/api/admin/users/${query}`);
  },
  // Legacy alias
  getStudents: (params?: { search?: string; status?: string }) =>
    admin.getUsers(params),

  // Reports
  getDemandReport: (date?: string) => {
    const query = date ? `?date=${date}` : "";
    return api.get<DemandReport[]>(`/api/admin/reports/demand/${query}`);
  },
  getRevenueReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    const query = params.toString() ? `?${params.toString()}` : "";
    return api.get<{ total: number; by_day: Record<string, number> }>(
      `/api/admin/reports/revenue/${query}`
    );
  },
};

/**
 * User Dashboard - /api/users/dashboard/
 */
export const userDashboard = {
  getStats: () => api.get<UserDashboardStats>("/api/users/dashboard/"),
};

// Legacy alias
export const studentDashboard = userDashboard;

/**
 * Super Admin endpoints - /api/admin/
 */
export const superAdmin = {
  getSystemStats: () => api.get<SystemStats>("/api/admin/system/stats/"),
  
  // Restaurant/Location management (formerly universities)
  getRestaurants: (params?: {
    region?: string;
    location_type?: LocationType;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.append("region", params.region);
    if (params?.location_type) queryParams.append("location_type", params.location_type);
    if (params?.search) queryParams.append("search", params.search);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return api.get<Restaurant[]>(`/api/admin/restaurants/${query}`);
  },
  createRestaurant: (data: Partial<Restaurant>) =>
    api.post<Restaurant>("/api/admin/restaurants/", data as Record<string, unknown>),
  updateRestaurant: (id: string, data: Partial<Restaurant>) =>
    api.patch<Restaurant>(`/api/admin/restaurants/${id}/`, data as Record<string, unknown>),
  deleteRestaurant: (id: string) =>
    api.delete(`/api/admin/restaurants/${id}/`),

  // Legacy aliases for backwards compatibility
  getUniversities: () => superAdmin.getRestaurants({ location_type: "university" }),
  createUniversity: (data: Partial<University>) =>
    superAdmin.createRestaurant({ ...data, location_type: "university" }),
  updateUniversity: (id: string, data: Partial<University>) =>
    superAdmin.updateRestaurant(id, data),

  // All users across the system - using /api/admin/all-users/
  getAllUsers: (params?: { 
    role?: string; 
    restaurant_id?: string;
    region?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append("role", params.role);
    if (params?.restaurant_id) queryParams.append("restaurant_id", params.restaurant_id);
    if (params?.region) queryParams.append("region", params.region);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return api.get<User[]>(`/api/admin/all-users/${query}`);
  },

  // Create admin for restaurant
  createAdmin: (data: { 
    full_name: string; 
    phone_number: string; 
    email?: string; 
    password: string; 
    restaurant_id: string;
  }) => api.post<User>("/api/admin/admins/", data as Record<string, unknown>),

  // Assign admin to restaurant
  assignAdminToRestaurant: (adminId: string, restaurantId: string) =>
    api.patch<User>(`/api/admin/users/${adminId}/`, { 
      restaurant_id: restaurantId,
      role: "admin" 
    } as Record<string, unknown>),

  // Reset user password
  resetUserPassword: (userId: string, newPassword: string) =>
    api.post(`/api/admin/users/${userId}/reset-password/`, { new_password: newPassword }),

  // Update user (super admin only)
  updateUser: (userId: string, data: Partial<User>) =>
    api.patch<User>(`/api/admin/users/${userId}/`, data as Record<string, unknown>),

  // All transactions
  getTransactions: (params?: {
    start_date?: string;
    end_date?: string;
    status?: string;
    restaurant_id?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.restaurant_id) queryParams.append("restaurant_id", params.restaurant_id);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return api.get<Transaction[]>(`/api/admin/transactions/${query}`);
  },
  // Legacy alias
  getAllTransactions: (params?: { start_date?: string; end_date?: string; status?: string }) =>
    superAdmin.getTransactions(params),

  // Subscription Plans management - using /api/plans/ endpoint
  getPlans: (params?: {
    tier?: string;
    billing_cycle?: string;
    is_active?: boolean;
    restaurant_id?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.tier) queryParams.append("tier", params.tier);
    if (params?.billing_cycle) queryParams.append("billing_cycle", params.billing_cycle);
    if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
    if (params?.restaurant_id) queryParams.append("restaurant_id", params.restaurant_id);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    return api.get<SubscriptionPlan[]>(`/api/plans/${query}`);
  },
  createPlan: (data: Partial<SubscriptionPlan>) =>
    api.post<SubscriptionPlan>("/api/plans/", data as Record<string, unknown>),
  updatePlan: (id: string, data: Partial<SubscriptionPlan>) =>
    api.patch<SubscriptionPlan>(`/api/plans/${id}/`, data as Record<string, unknown>),
  deletePlan: (id: string) =>
    api.delete(`/api/plans/${id}/`),

  // System settings
  getSystemSettings: () =>
    api.get<Record<string, unknown>>("/api/payments/system-settings/"),
  updateSystemSetting: (key: string, value: unknown) =>
    api.post(`/api/payments/system-settings/${key}/`, { value }),
  getMaintenanceStatus: () =>
    api.get<{ maintenance_mode: boolean }>("/api/payments/maintenance-status/", { requiresAuth: false }),
};
