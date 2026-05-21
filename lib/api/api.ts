// API Configuration and Utilities for Chakula Poa
// This file provides all API utilities for communicating with the Django backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/";

// Location types supported by the platform
export type LocationType = 
  | "restaurant"   // General restaurant
  | "university"   // University canteen
  | "market"       // Market area eatery
  | "office"       // Office complex cafeteria
  | "hospital"     // Hospital canteen
  | "industrial";  // Factory/industrial canteen

// Types for API responses
export interface User {
  id: string;
  cps_number: string;
  full_name: string;
  email: string;
  phone_number: string;
  registration_number?: string;
  restaurant_id?: string;       // Changed from university_id
  restaurant_name?: string;     // Changed from university_name
  region?: string;              // User's region
  role: "user" | "staff" | "admin" | "super_admin" | "developer";
  is_active: boolean;
  qr_code_data?: string;
  created_at: string;
}

// Restaurant model - supports all location types across Tanzania
export interface Restaurant {
  id: string;
  name: string;
  code: string;
  location_type: LocationType;
  location_type_display?: string;
  area?: string;
  region?: string;
  region_display?: string;
  city?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  capacity?: number;
  user_count?: number;
  is_active: boolean;
  created_at?: string;
}

// Legacy alias for backwards compatibility
export type University = Restaurant;

export interface SubscriptionPlan {
  id: string;
  restaurant_id: string;        // Changed from university_id
  name: string;
  duration_type: "day" | "week" | "month" | "semester";
  duration_days: number;
  price: number;
  meals_per_day: number;
  is_active: boolean;
}

// Dietary plan for special food requirements
export type DietaryType = 
  | "ulcer"
  | "diabetic"
  | "vegetarian"
  | "vegan"
  | "halal"
  | "gluten_free"
  | "low_sodium"
  | "renal"
  | "heart_healthy"
  | "pregnancy"
  | "other";

export interface DietaryPlan {
  id: string;
  name: string;
  dietary_type: DietaryType;
  dietary_type_display: string;
  description?: string;
  foods_to_avoid?: string;
  recommended_foods?: string;
  additional_price: number;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  dietary_plan?: DietaryPlan;
  start_date: string;
  end_date: string;
  status: "pending" | "active" | "expired" | "cancelled";
  remaining_meals: number;
  days_left: number;
  total_price: number;
  is_expired: boolean;
  payment_reference?: string;
}

export interface SubscriptionStatus {
  has_subscription: boolean;
  days_left?: number;
  remaining_meals?: number;
  end_date?: string;
  plan_name?: string;
  dietary_plan?: string;
  can_be_served: boolean;
  status?: string;
  message?: string;
}

export interface Meal {
  id: string;
  university_id: string;
  name: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  description?: string;
  available_date: string;
  max_servings: number;
  current_orders: number;
}

export interface MealOrder {
  id: string;
  user_id: string;
  meal_id: string;
  meal?: Meal;
  subscription_id: string;
  order_date: string;
  status: "pending" | "confirmed" | "served" | "cancelled";
  served_at?: string;
  served_by?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference?: string;
  external_reference?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
  completed_at?: string;
}

export interface DemandReport {
  meal_type: string;
  meal_name: string;
  total_orders: number;
  served: number;
  pending: number;
}

export interface RevenueReport {
  total_revenue: number;
  period: string;
  transactions_count: number;
  by_payment_method: { method: string; amount: number; count: number }[];
}

// API Error handling
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "APIError";
  }
}

// Token management
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
}

export function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

// Base fetch function with auth
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new APIError(
      response.status,
      data.detail || data.message || "An error occurred",
      data
    );
  }

  return response;
}

// Auth API - with /api/ prefix
export const authAPI = {
  login: async (phone_number: string, password: string) => {
    const response = await fetchWithAuth("/api/users/login/", {
      method: "POST",
      body: JSON.stringify({ phone_number, password }),
    });
    return response.json();
  },

  register: async (data: {
    full_name: string;
    phone_number: string;
    email?: string;
    registration_number?: string;
    university_id?: string;
    password: string;
  }) => {
    const response = await fetchWithAuth("/api/users/register/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getMe: async (): Promise<User> => {
    const response = await fetchWithAuth("/api/users/me/");
    return response.json();
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await fetchWithAuth("/api/users/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  changePassword: async (old_password: string, new_password: string) => {
    const response = await fetchWithAuth("/api/users/change-password/", {
      method: "POST",
      body: JSON.stringify({ old_password, new_password }),
    });
    return response.json();
  },

  forgotPassword: async (phone_number: string) => {
    const response = await fetchWithAuth("/api/users/forgot-password/", {
      method: "POST",
      body: JSON.stringify({ phone_number }),
    });
    return response.json();
  },
};

// Restaurants API - supports all location types, with /api/ prefix
export const restaurantsAPI = {
  list: async (params?: { region?: string; location_type?: LocationType }): Promise<Restaurant[]> => {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.append("region", params.region);
    if (params?.location_type) queryParams.append("location_type", params.location_type);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/restaurants/${query}`);
    return response.json();
  },

  get: async (id: string): Promise<Restaurant> => {
    const response = await fetchWithAuth(`/api/restaurants/${id}/`);
    return response.json();
  },

  create: async (data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await fetchWithAuth("/api/restaurants/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await fetchWithAuth(`/api/restaurants/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/api/restaurants/${id}/`, { method: "DELETE" });
  },
};

// Legacy alias for backwards compatibility
export const universitiesAPI = {
  list: async (): Promise<University[]> => restaurantsAPI.list({ location_type: "university" }),
  get: async (id: string): Promise<University> => restaurantsAPI.get(id),
  create: async (data: Partial<University>): Promise<University> => restaurantsAPI.create(data),
  update: async (id: string, data: Partial<University>): Promise<University> => restaurantsAPI.update(id, data),
  delete: async (id: string): Promise<void> => restaurantsAPI.delete(id),
};

// Plans API - with /api/ prefix
export const plansAPI = {
  list: async (restaurant_id?: string): Promise<SubscriptionPlan[]> => {
    const params = restaurant_id ? `?restaurant_id=${restaurant_id}` : "";
    const response = await fetchWithAuth(`/api/plans/${params}`);
    return response.json();
  },

  get: async (id: string): Promise<SubscriptionPlan> => {
    const response = await fetchWithAuth(`/api/plans/${id}/`);
    return response.json();
  },

  create: async (data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const response = await fetchWithAuth("/api/plans/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
    const response = await fetchWithAuth(`/api/plans/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/api/plans/${id}/`, { method: "DELETE" });
  },
};

// Dietary Plans API - with /api/ prefix
export const dietaryPlansAPI = {
  list: async (): Promise<DietaryPlan[]> => {
    const response = await fetchWithAuth("/api/subscriptions/dietary-plans/");
    return response.json();
  },

  get: async (id: string): Promise<DietaryPlan> => {
    const response = await fetchWithAuth(`/api/subscriptions/dietary-plans/${id}/`);
    return response.json();
  },
};

// Subscriptions API - with /api/ prefix
export const subscriptionsAPI = {
  getMySubscription: async (): Promise<Subscription | null> => {
    const response = await fetchWithAuth("/api/subscriptions/me/");
    return response.json();
  },

  getStatus: async (): Promise<SubscriptionStatus> => {
    const response = await fetchWithAuth("/api/subscriptions/status/");
    return response.json();
  },

  create: async (plan_id: string, dietary_plan_id?: string): Promise<Subscription> => {
    const response = await fetchWithAuth("/api/subscriptions/", {
      method: "POST",
      body: JSON.stringify({ plan_id, dietary_plan_id }),
    });
    return response.json();
  },

  list: async (): Promise<Subscription[]> => {
    const response = await fetchWithAuth("/api/subscriptions/");
    return response.json();
  },

  history: async (): Promise<Subscription[]> => {
    const response = await fetchWithAuth("/api/subscriptions/history/");
    return response.json();
  },
};

// Meals API - with /api/ prefix
export const mealsAPI = {
  list: async (date?: string): Promise<Meal[]> => {
    const params = date ? `?date=${date}` : "";
    const response = await fetchWithAuth(`/api/meals/${params}`);
    return response.json();
  },

  get: async (id: string): Promise<Meal> => {
    const response = await fetchWithAuth(`/api/meals/${id}/`);
    return response.json();
  },

  create: async (data: Partial<Meal>): Promise<Meal> => {
    const response = await fetchWithAuth("/api/meals/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  update: async (id: string, data: Partial<Meal>): Promise<Meal> => {
    const response = await fetchWithAuth(`/api/meals/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/api/meals/${id}/`, { method: "DELETE" });
  },

  select: async (meal_id: string): Promise<MealOrder> => {
    const response = await fetchWithAuth("/api/meals/select/", {
      method: "POST",
      body: JSON.stringify({ meal_id }),
    });
    return response.json();
  },
};

// Orders API - with /api/ prefix
export const ordersAPI = {
  list: async (params?: { date?: string; status?: string }): Promise<MealOrder[]> => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append("date", params.date);
    if (params?.status) queryParams.append("status", params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/meals/orders/${query}`);
    return response.json();
  },

  getMyOrders: async (): Promise<MealOrder[]> => {
    const response = await fetchWithAuth("/api/meals/orders/me/");
    return response.json();
  },
};

// Staff API - with /api/ prefix
export const staffAPI = {
  verify: async (cps_number: string): Promise<{ 
    valid: boolean; 
    user?: User; 
    subscription?: Subscription;
    current_meal_type?: string;
    meal_window?: string;
    message?: string;
  }> => {
    const response = await fetchWithAuth("/api/staff/verify/", {
      method: "POST",
      body: JSON.stringify({ cps_number }),
    });
    return response.json();
  },

  serve: async (data: { order_id?: string; cps_code?: string }): Promise<MealOrder> => {
    const response = await fetchWithAuth("/api/staff/serve/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getTodayOrders: async (): Promise<MealOrder[]> => {
    const response = await fetchWithAuth("/api/staff/orders/today/");
    return response.json();
  },

  getStats: async (): Promise<{ served_today: number; pending_today: number; my_served_today: number }> => {
    const response = await fetchWithAuth("/api/staff/stats/");
    return response.json();
  },

  getServiceHistory: async (params?: { date?: string; start_date?: string; end_date?: string }): Promise<{
    results: MealOrder[];
    users_served_count: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append("date", params.date);
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/staff/history/${query}`);
    return response.json();
  },

  getUserSubscription: async (userId: string): Promise<{
    user_id: string;
    user_name: string;
    has_subscription: boolean;
    can_serve: boolean;
    days_left?: number;
    remaining_meals?: number;
    end_date?: string;
    plan_name?: string;
    dietary_plan?: { name: string; type: string; foods_to_avoid?: string };
    message: string;
  }> => {
    const response = await fetchWithAuth(`/api/staff/user/${userId}/subscription/`);
    return response.json();
  },
};

// Admin API - with /api/ prefix
export const adminAPI = {
  getUsers: async (params?: { search?: string; status?: string }): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/admin/users/${query}`);
    return response.json();
  },

  // Legacy alias
  getStudents: async (params?: { search?: string; status?: string }): Promise<User[]> => 
    adminAPI.getUsers(params),

  getStaff: async (): Promise<User[]> => {
    const response = await fetchWithAuth("/api/admin/staff/");
    return response.json();
  },

  createStaff: async (data: Partial<User>): Promise<User> => {
    const response = await fetchWithAuth("/api/admin/staff/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateStaff: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await fetchWithAuth(`/api/admin/staff/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getDemandReport: async (date?: string): Promise<DemandReport[]> => {
    const params = date ? `?date=${date}` : "";
    const response = await fetchWithAuth(`/api/admin/reports/demand/${params}`);
    return response.json();
  },

  getRevenueReport: async (params?: { start_date?: string; end_date?: string }): Promise<RevenueReport> => {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append("start_date", params.start_date);
    if (params?.end_date) queryParams.append("end_date", params.end_date);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/admin/reports/revenue/${query}`);
    return response.json();
  },

  getDashboardStats: async () => {
    const response = await fetchWithAuth("/api/admin/dashboard/");
    return response.json();
  },
};

// Super Admin API - using correct Django endpoints
export const superAdminAPI = {
  getSystemStats: async () => {
    const response = await fetchWithAuth("/api/admin/system/stats/");
    return response.json();
  },

  getAllUsers: async (params?: { role?: string; restaurant_id?: string; region?: string }): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append("role", params.role);
    if (params?.restaurant_id) queryParams.append("restaurant_id", params.restaurant_id);
    if (params?.region) queryParams.append("region", params.region);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/admin/all-users/${query}`);
    return response.json();
  },

  // Restaurant/Location management - using correct /api/ prefix
  getRestaurants: async (params?: { region?: string; location_type?: LocationType }): Promise<Restaurant[]> => {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.append("region", params.region);
    if (params?.location_type) queryParams.append("location_type", params.location_type);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/admin/restaurants/${query}`);
    return response.json();
  },

  createRestaurant: async (data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await fetchWithAuth("/api/admin/restaurants/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateRestaurant: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await fetchWithAuth(`/api/admin/restaurants/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteRestaurant: async (id: string): Promise<void> => {
    await fetchWithAuth(`/api/admin/restaurants/${id}/`, { method: "DELETE" });
  },

  createAdmin: async (data: Partial<User> & { restaurant_id: string }): Promise<User> => {
    const response = await fetchWithAuth("/api/admin/admins/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Assign admin to a restaurant
  assignAdminToRestaurant: async (adminId: string, restaurantId: string): Promise<User> => {
    const response = await fetchWithAuth(`/api/admin/users/${adminId}/`, {
      method: "PATCH",
      body: JSON.stringify({ restaurant_id: restaurantId, role: "admin" }),
    });
    return response.json();
  },

  // User management - with /api/ prefix
  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await fetchWithAuth(`/api/admin/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deactivateUser: async (id: string): Promise<void> => {
    await fetchWithAuth(`/api/admin/users/${id}/`, { method: "DELETE" });
  },

  resetUserPassword: async (id: string, new_password: string): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`/api/admin/users/${id}/reset-password/`, {
      method: "POST",
      body: JSON.stringify({ new_password }),
    });
    return response.json();
  },

  getTransactions: async (params?: { restaurant_id?: string; status?: string }): Promise<Transaction[]> => {
    const queryParams = new URLSearchParams();
    if (params?.restaurant_id) queryParams.append("restaurant_id", params.restaurant_id);
    if (params?.status) queryParams.append("status", params.status);
    const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetchWithAuth(`/api/admin/transactions/${query}`);
    const data = await response.json();
    // Handle paginated response
    return data.results || data || [];
  },

  getSystemConfig: async () => {
    const response = await fetchWithAuth("/api/admin/system/settings/");
    return response.json();
  },

  updateSystemConfig: async (data: Record<string, unknown>) => {
    const response = await fetchWithAuth("/api/admin/system/settings/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return response.json();
  },
};

// Payments API - with /api/ prefix
export const paymentsAPI = {
  initiate: async (data: { subscription_id: string; payment_method: string; phone_number: string }) => {
    const response = await fetchWithAuth("/api/payments/initiate/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.json();
  },

  checkStatus: async (reference: string) => {
    const response = await fetchWithAuth(`/api/payments/status/${reference}/`);
    return response.json();
  },

  getHistory: async (): Promise<Transaction[]> => {
    const response = await fetchWithAuth("/api/payments/history/");
    return response.json();
  },
};
