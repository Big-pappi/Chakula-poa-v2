// Chakula Poa Type Definitions
// Based on Django backend models - Updated for all populated areas across Tanzania

// Location types supported by the platform
export type LocationType = 
  | "restaurant"   // General restaurant
  | "university"   // University canteen
  | "market"       // Market area eatery
  | "office"       // Office complex cafeteria
  | "hospital"     // Hospital canteen
  | "industrial";  // Factory/industrial canteen

// All 31 regions of Tanzania
export type TanzaniaRegion =
  | "Dar es Salaam"
  | "Dodoma"
  | "Arusha"
  | "Mwanza"
  | "Mbeya"
  | "Morogoro"
  | "Tanga"
  | "Kilimanjaro"
  | "Iringa"
  | "Tabora"
  | "Kigoma"
  | "Shinyanga"
  | "Kagera"
  | "Mara"
  | "Geita"
  | "Simiyu"
  | "Singida"
  | "Rukwa"
  | "Katavi"
  | "Ruvuma"
  | "Njombe"
  | "Lindi"
  | "Mtwara"
  | "Pwani"
  | "Zanzibar Urban/West"
  | "Zanzibar North"
  | "Zanzibar South"
  | "Pemba North"
  | "Pemba South"
  | "Songwe"
  | "Kigoma";

export interface User {
  id: string;
  cps_number: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number: string;
  registration_number?: string; // For university users (students)
  restaurant_id?: string;       // Which restaurant/location they belong to
  restaurant_name?: string;
  region?: string;              // User's region
  role: "user" | "staff" | "admin" | "super_admin" | "developer";
  is_active: boolean;
  qr_code_data?: string;
  created_at: string;
}

// Restaurant model - supports all location types across Tanzania
export interface Restaurant {
  id: string;
  name: string;                 // e.g., "Mama Lishe Kariakoo", "UDSM Main Canteen"
  code: string;                 // e.g., "KARIAKOO-001", "UDSM-MAIN"
  location_type: LocationType;  // Type of food service location
  area: string;                 // e.g., "Kariakoo", "Mlimani", "Ubungo"
  region: string;               // Backend value e.g., "dar_es_salaam", "dodoma"
  city?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  // Payout account info
  payout_method?: PaymentMethod;
  payout_account_number?: string;
  payout_account_name?: string;
  payout_bank_name?: string;
  is_active: boolean;
  total_users?: number;         // Users subscribed to this location
  total_staff?: number;
  total_admins?: number;
  created_at: string;
}

// Legacy alias for backwards compatibility
export type University = Restaurant;

export interface SubscriptionPlan {
  id: string;
  restaurant_id?: string;
  restaurant?: Restaurant;
  name: string;
  tier: PlanTier;
  billing_cycle: BillingCycle;
  is_student_only: boolean;
  features: string[];
  duration_type: "day" | "week" | "month" | "semester";
  duration_days: number;
  price: number;
  meals_per_day: number;
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  start_date: string;
  end_date: string;
  status: "pending" | "active" | "expired" | "cancelled";
  remaining_meals: number;
  payment_reference?: string;
  created_at: string;
}

// Meal types with time windows
export type MealType = "tea" | "lunch" | "evening";

// Meal time windows (configurable per restaurant)
export interface MealWindow {
  meal_type: MealType;
  start_time: string;  // HH:MM format
  end_time: string;    // HH:MM format
}

export const DEFAULT_MEAL_WINDOWS: MealWindow[] = [
  { meal_type: "tea", start_time: "06:00", end_time: "10:00" },
  { meal_type: "lunch", start_time: "11:30", end_time: "14:30" },
  { meal_type: "evening", start_time: "17:00", end_time: "20:00" },
];

export interface Meal {
  id: string;
  restaurant_id: string;
  name: string;
  meal_type: MealType;
  description?: string;
  available_date: string;
  max_servings: number;
  current_orders: number;
  created_at: string;
}

export interface MealOrder {
  id: string;
  user_id: string;
  meal_id: string;
  meal?: Meal;
  subscription_id: string;
  order_date: string;
  meal_type: MealType;
  status: "pending" | "confirmed" | "served" | "cancelled" | "expired";
  served_at?: string;
  served_by?: string;
  created_at: string;
}

// Daily QR/CPS Code (rotates at midnight)
export interface DailyCode {
  id: string;
  user_id: string;
  date: string;
  cps_code: string;       // e.g., "CPS#A7X9"
  qr_data: string;        // Encrypted QR payload
  qr_image_url?: string;  // Stored QR image URL
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  subscription_id?: string;
  restaurant_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payer_phone?: string;
  payment_reference?: string;
  external_reference?: string;
  // Payment split fields
  platform_fee_percentage: number;
  platform_fee_amount: number;
  restaurant_amount: number;
  restaurant_payout_status?: "pending" | "processing" | "completed" | "failed";
  restaurant_payout_reference?: string;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  created_at: string;
  completed_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth Types
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  cps_number?: string;
}

export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface RegisterData {
  full_name: string;
  phone_number: string;
  email?: string;
  registration_number?: string;  // Optional - for university users
  restaurant_id?: string;        // Which restaurant/location
  region?: string;               // User's region
  password: string;
}

// Dashboard Stats Types
export interface UserDashboardStats {
  subscription: Subscription | null;
  remaining_meals: number;
  upcoming_orders: MealOrder[];
  recent_orders: MealOrder[];
  daily_code?: DailyCode;
}

// Legacy alias
export type StudentDashboardStats = UserDashboardStats;

export interface AdminDashboardStats {
  total_users: number;
  active_subscriptions: number;
  todays_orders: number;
  revenue_this_month: number;
  meal_demand_report: {
    meal_id: string;
    meal_name: string;
    orders: number;
  }[];
  recent_transactions: Transaction[];
}

export interface VerificationRequest {
  cps_number?: string;
  qr_code?: string;
}

export interface VerificationResponse {
  valid: boolean;
  user?: User;
  order?: MealOrder;
  message: string;
}

// Report Types
export interface DemandReport {
  meal_type: MealType;
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

// System Stats (Super Admin)
export interface SystemStats {
  total_restaurants: number;
  total_users: number;
  total_transactions: number;
  total_revenue: number;
  active_subscriptions: number;
  monthly_revenue: number;
  restaurants_by_region: { region: string; count: number }[];
  restaurants_by_type: { type: LocationType; count: number }[];
}

// Location type display names
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  restaurant: "Restaurant",
  university: "University Canteen",
  market: "Market Eatery",
  office: "Office Cafeteria",
  hospital: "Hospital Canteen",
  industrial: "Industrial Canteen",
};

// Tanzania regions list - matching backend values (underscored) with display labels
export const TANZANIA_REGIONS = [
  { value: "arusha", label: "Arusha" },
  { value: "dar_es_salaam", label: "Dar es Salaam" },
  { value: "dodoma", label: "Dodoma" },
  { value: "geita", label: "Geita" },
  { value: "iringa", label: "Iringa" },
  { value: "kagera", label: "Kagera" },
  { value: "katavi", label: "Katavi" },
  { value: "kigoma", label: "Kigoma" },
  { value: "kilimanjaro", label: "Kilimanjaro" },
  { value: "lindi", label: "Lindi" },
  { value: "manyara", label: "Manyara" },
  { value: "mara", label: "Mara" },
  { value: "mbeya", label: "Mbeya" },
  { value: "morogoro", label: "Morogoro" },
  { value: "mtwara", label: "Mtwara" },
  { value: "mwanza", label: "Mwanza" },
  { value: "njombe", label: "Njombe" },
  { value: "pemba_north", label: "Pemba North" },
  { value: "pemba_south", label: "Pemba South" },
  { value: "pwani", label: "Pwani" },
  { value: "rukwa", label: "Rukwa" },
  { value: "ruvuma", label: "Ruvuma" },
  { value: "shinyanga", label: "Shinyanga" },
  { value: "simiyu", label: "Simiyu" },
  { value: "singida", label: "Singida" },
  { value: "songwe", label: "Songwe" },
  { value: "tabora", label: "Tabora" },
  { value: "tanga", label: "Tanga" },
  { value: "zanzibar_north", label: "Zanzibar North" },
  { value: "zanzibar_south", label: "Zanzibar South" },
  { value: "zanzibar_west", label: "Zanzibar West" },
] as const;

// Helper to get region label from value
export const getRegionLabel = (value: string): string => {
  const region = TANZANIA_REGIONS.find(r => r.value === value);
  return region?.label || value;
};

// Helper to get region value from label (for backwards compatibility)
export const getRegionValue = (label: string): string => {
  const region = TANZANIA_REGIONS.find(r => r.label === label);
  return region?.value || label.toLowerCase().replace(/ /g, '_');
};

// Payment method types
export type PaymentMethod = 
  | "mpesa" 
  | "airtel_money" 
  | "halopesa" 
  | "mix_by_yas" 
  | "tigopesa" 
  | "bank_transfer";

// Payment method display info
export const PAYMENT_METHODS: Record<PaymentMethod, { label: string; color: string; bgColor: string }> = {
  mpesa: { label: "M-Pesa", color: "#E4002B", bgColor: "bg-red-500" },
  airtel_money: { label: "Airtel Money", color: "#ED1C24", bgColor: "bg-red-600" },
  halopesa: { label: "Halopesa", color: "#0066B3", bgColor: "bg-blue-600" },
  mix_by_yas: { label: "Mix by Yas", color: "#FFB800", bgColor: "bg-yellow-500" },
  tigopesa: { label: "Tigo Pesa", color: "#0066B3", bgColor: "bg-blue-500" },
  bank_transfer: { label: "Bank Transfer", color: "#22C55E", bgColor: "bg-green-500" },
};

// Subscription plan tier types
export type PlanTier = "student" | "normal" | "premium" | "special";

// Plan tier display info
export const PLAN_TIERS: Record<PlanTier, { label: string; description: string; color: string }> = {
  student: { label: "Student Plan", description: "Discounted rates for verified students", color: "bg-blue-500" },
  normal: { label: "Normal Plan", description: "Standard meal subscription", color: "bg-gray-500" },
  premium: { label: "Premium Plan", description: "Priority service and premium meals", color: "bg-purple-500" },
  special: { label: "Special Plan", description: "Custom plans for special dietary needs", color: "bg-amber-500" },
};

// Billing cycle types
export type BillingCycle = "weekly" | "monthly" | "semester";

export const BILLING_CYCLES: Record<BillingCycle, { label: string; days: number }> = {
  weekly: { label: "Weekly", days: 7 },
  monthly: { label: "Monthly", days: 30 },
  semester: { label: "Per Semester", days: 120 },
};
