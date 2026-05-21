/**
 * Chakula Poa TypeScript Types
 * 
 * Types for the meal subscription platform serving all populated areas in Tanzania.
 * Supports: Universities, Markets, Offices, Hospitals, Industrial areas, Restaurants
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

// User Roles - 'user' is the default role (formerly 'student')
export type UserRole = 'user' | 'staff' | 'admin' | 'super_admin' | 'developer';

// Location Types - All supported location categories
export type LocationType = 'restaurant' | 'university' | 'market' | 'office' | 'hospital' | 'industrial';

// Subscription Duration Types
export type DurationType = 'day' | 'week' | 'month' | 'semester';

// Meal Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'tea' | 'evening';

// Status Types
export type SubscriptionStatus = 'pending' | 'active' | 'expired' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'served' | 'cancelled';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'mpesa' | 'airtel_money' | 'tigopesa' | 'selcom' | 'bank';

// Tanzania Regions - with value/label pairs matching backend
export const TANZANIA_REGIONS = [
  { value: 'arusha', label: 'Arusha' },
  { value: 'dar_es_salaam', label: 'Dar es Salaam' },
  { value: 'dodoma', label: 'Dodoma' },
  { value: 'geita', label: 'Geita' },
  { value: 'iringa', label: 'Iringa' },
  { value: 'kagera', label: 'Kagera' },
  { value: 'katavi', label: 'Katavi' },
  { value: 'kigoma', label: 'Kigoma' },
  { value: 'kilimanjaro', label: 'Kilimanjaro' },
  { value: 'lindi', label: 'Lindi' },
  { value: 'manyara', label: 'Manyara' },
  { value: 'mara', label: 'Mara' },
  { value: 'mbeya', label: 'Mbeya' },
  { value: 'morogoro', label: 'Morogoro' },
  { value: 'mtwara', label: 'Mtwara' },
  { value: 'mwanza', label: 'Mwanza' },
  { value: 'njombe', label: 'Njombe' },
  { value: 'pemba_north', label: 'Pemba North' },
  { value: 'pemba_south', label: 'Pemba South' },
  { value: 'pwani', label: 'Pwani' },
  { value: 'rukwa', label: 'Rukwa' },
  { value: 'ruvuma', label: 'Ruvuma' },
  { value: 'shinyanga', label: 'Shinyanga' },
  { value: 'simiyu', label: 'Simiyu' },
  { value: 'singida', label: 'Singida' },
  { value: 'songwe', label: 'Songwe' },
  { value: 'tabora', label: 'Tabora' },
  { value: 'tanga', label: 'Tanga' },
  { value: 'zanzibar_north', label: 'Zanzibar North' },
  { value: 'zanzibar_south', label: 'Zanzibar South' },
  { value: 'zanzibar_west', label: 'Zanzibar West' },
] as const;

export type TanzaniaRegion = typeof TANZANIA_REGIONS[number]['value'];

// Helper function to get region label from value
export function getRegionLabel(value: string): string {
  const region = TANZANIA_REGIONS.find(r => r.value === value);
  return region?.label || value;
}

// Location Type Labels for display
export const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  restaurant: 'Restaurant',
  university: 'University',
  market: 'Market',
  office: 'Office',
  hospital: 'Hospital',
  industrial: 'Industrial',
};

// =============================================================================
// BASE INTERFACES
// =============================================================================

interface BaseEntity {
  id: string;
  created_at: string;
}

// =============================================================================
// RESTAURANT (Location) - Primary entity for all location types
// =============================================================================

export interface Restaurant extends BaseEntity {
  name: string;
  code: string;              // e.g., "UDSM", "KARIAKOO-MKT"
  location_type: LocationType;
  region: string;
  area?: string;             // e.g., "Mlimani City"
  address?: string;
  city?: string;
  contact_email?: string;
  contact_phone?: string;
  capacity?: number;
  is_active: boolean;
  // Payout fields
  payout_method?: string;
  payout_account_number?: string;
  payout_account_name?: string;
  payout_bank_name?: string;
  // Display fields from serializer
  location_type_display?: string;
  region_display?: string;
  user_count?: number;
}

// Legacy alias for backwards compatibility
export interface University extends BaseEntity {
  name: string;
  code: string;
  address?: string;
  city?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
}

// =============================================================================
// USER
// =============================================================================

export interface User extends BaseEntity {
  cps_number: string;         // CPS#XXXX - Unique user identifier
  full_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number: string;
  registration_number?: string; // For university students
  restaurant?: Restaurant;      // Primary location
  restaurant_id?: string;
  restaurant_name?: string;
  location_type?: LocationType;
  region?: string;
  role: UserRole;
  is_active: boolean;
  daily_code?: string;         // Daily rotating code (CPS#XXXX)
  qr_code_data?: string;       // Base64 QR code image
  current_code?: string;       // Current valid code
}

// =============================================================================
// SUBSCRIPTION
// =============================================================================

export interface SubscriptionPlan extends BaseEntity {
  restaurant_id?: string;
  university_id?: string;      // Legacy field
  name: string;                // "Weekly Plan", "Monthly Plan"
  description?: string;
  duration_type: DurationType;
  duration_days: number;
  price: number;               // Price in TZS
  meals_per_day: number;
  is_active: boolean;
}

export interface Subscription extends BaseEntity {
  user_id: string;
  plan_id: string;
  plan?: SubscriptionPlan;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  remaining_meals: number;
  payment_reference?: string;
}

// =============================================================================
// MEALS & ORDERS
// =============================================================================

export interface Meal extends BaseEntity {
  restaurant_id?: string;
  university_id?: string;      // Legacy field
  name: string;
  meal_type: MealType;
  description?: string;
  available_date: string;
  max_servings: number;
  current_orders: number;
  image_url?: string;
}

export interface MealOrder extends BaseEntity {
  user_id: string;
  meal_id: string;
  meal?: Meal;
  subscription_id: string;
  order_date: string;
  status: OrderStatus;
  served_at?: string;
  served_by?: string;
}

// =============================================================================
// TRANSACTIONS
// =============================================================================

export interface Transaction extends BaseEntity {
  user_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  external_reference?: string;
  status: TransactionStatus;
  metadata?: Record<string, unknown>;
  completed_at?: string;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface ApiResponse<T> {
  data?: T;
  status: number;
  error?: string;
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  cps_number?: string;
  daily_code?: string;
  user: User;
}

export interface LoginCredentials {
  identifier: string;         // Email or phone number
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name?: string;
  phone_number: string;
  email?: string;
  registration_number?: string;
  restaurant_id?: string;
  region?: string;
  password: string;
}

// =============================================================================
// DAILY CODES
// =============================================================================

export interface DailyCode {
  code: string;               // CPS#XXXX format
  qr_code_data: string;       // Base64 encoded QR image
  date: string;               // ISO date string
  expires_at: string;         // Midnight of the same day
}

// =============================================================================
// DASHBOARD STATS
// =============================================================================

export interface UserDashboardStats {
  daily_code: string;
  qr_code_data: string;
  subscription: Subscription | null;
  remaining_meals: number;
  upcoming_orders: MealOrder[];
  recent_orders: MealOrder[];
}

// Legacy alias
export type StudentDashboardStats = UserDashboardStats;

export interface AdminDashboardStats {
  total_users: number;
  active_subscriptions: number;
  total_revenue: number;
  todays_orders: number;
  revenue_this_month?: number;
}

export interface SystemStats {
  total_users: number;
  total_regular_users: number;
  total_staff: number;
  total_admins: number;
  total_restaurants: number;
  active_subscriptions: number;
  total_revenue: number;
}

// =============================================================================
// REPORTS
// =============================================================================

export interface DemandReport {
  meal_type: string;
  meal_name: string;
  total_orders: number;
  served: number;
  pending: number;
}

export interface MealDemandReport {
  meal_id: string;
  meal_name: string;
  meal_type: MealType;
  total_orders: number;
  date: string;
}

// =============================================================================
// VERIFICATION
// =============================================================================

export interface VerificationRequest {
  cps_number?: string;
  qr_code?: string;
  code?: string;
}

export interface VerificationResponse {
  valid: boolean;
  message?: string;
  user?: {
    id: string;
    full_name: string;
    cps_number: string;
    restaurant_name?: string;
  };
  subscription?: {
    plan_name: string;
    remaining_meals: number;
    expires_at: string;
  } | null;
}

// =============================================================================
// PAGINATION
// =============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
