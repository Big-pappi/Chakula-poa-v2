-- Chakula Poa Database Schema
-- Food Subscription Management System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- RESTAURANTS TABLE (Food providers/locations)
-- =============================================
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  location_type VARCHAR(50) NOT NULL DEFAULT 'restaurant',
  region VARCHAR(100) NOT NULL,
  area VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  capacity INTEGER DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_location_type CHECK (location_type IN ('restaurant', 'university', 'market', 'office', 'hospital', 'industrial'))
);

-- =============================================
-- USERS TABLE (All user roles)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cps_number VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  full_name VARCHAR(255) GENERATED ALWAYS AS (first_name || ' ' || COALESCE(last_name, '')) STORED,
  email VARCHAR(255) UNIQUE,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  registration_number VARCHAR(100),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  region VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  daily_code VARCHAR(20),
  daily_code_date DATE,
  qr_code_data TEXT,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_role CHECK (role IN ('user', 'staff', 'admin', 'super_admin', 'developer'))
);

-- =============================================
-- SPECIAL DIETARY PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dietary_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  conditions TEXT[], -- Array of health conditions this plan addresses
  restrictions TEXT[], -- Foods to avoid
  recommendations TEXT[], -- Recommended foods
  price_modifier DECIMAL(5,2) DEFAULT 1.0, -- Price multiplier (1.0 = no change)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default dietary plans
INSERT INTO dietary_plans (name, description, conditions, restrictions, recommendations, price_modifier) VALUES
('Regular', 'Standard meal plan with no dietary restrictions', ARRAY['none'], ARRAY[]::TEXT[], ARRAY['balanced meals'], 1.0),
('Ulcer-Friendly', 'Meals suitable for people with stomach ulcers or gastritis', ARRAY['peptic ulcer', 'gastritis', 'GERD'], ARRAY['spicy foods', 'acidic foods', 'fried foods', 'coffee', 'alcohol'], ARRAY['bland foods', 'low-acid fruits', 'lean proteins', 'cooked vegetables'], 1.15),
('Diabetic-Friendly', 'Low glycemic meals for diabetes management', ARRAY['type 1 diabetes', 'type 2 diabetes', 'pre-diabetes'], ARRAY['high sugar foods', 'refined carbs', 'sweetened beverages'], ARRAY['whole grains', 'lean proteins', 'fiber-rich vegetables', 'legumes'], 1.10),
('Heart-Healthy', 'Low sodium, low fat meals for cardiovascular health', ARRAY['hypertension', 'heart disease', 'high cholesterol'], ARRAY['high sodium foods', 'saturated fats', 'processed meats'], ARRAY['lean proteins', 'whole grains', 'fresh vegetables', 'healthy fats'], 1.10),
('Vegetarian', 'Plant-based meals without meat', ARRAY['vegetarian diet'], ARRAY['meat', 'poultry', 'fish'], ARRAY['legumes', 'tofu', 'vegetables', 'grains', 'dairy'], 1.0),
('Halal', 'Meals prepared according to Islamic dietary laws', ARRAY['halal diet'], ARRAY['pork', 'alcohol', 'non-halal meat'], ARRAY['halal-certified meat', 'vegetables', 'grains'], 1.05)
ON CONFLICT DO NOTHING;

-- =============================================
-- USER DIETARY PREFERENCES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_dietary_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dietary_plan_id UUID NOT NULL REFERENCES dietary_plans(id) ON DELETE RESTRICT,
  notes TEXT, -- Additional notes or allergies
  medical_certificate_url TEXT, -- For special plans requiring verification
  is_verified BOOLEAN DEFAULT false, -- Admin verified for medical conditions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id) -- One dietary preference per user
);

-- =============================================
-- SUBSCRIPTION PLANS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_type VARCHAR(20) NOT NULL DEFAULT 'month',
  duration_days INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  meals_per_day INTEGER NOT NULL DEFAULT 3,
  includes_tea BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_duration_type CHECK (duration_type IN ('day', 'week', 'month', 'semester'))
);

-- =============================================
-- USER SUBSCRIPTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_meals INTEGER NOT NULL,
  remaining_meals INTEGER NOT NULL,
  dietary_plan_id UUID REFERENCES dietary_plans(id),
  payment_reference VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_subscription_status CHECK (status IN ('pending', 'active', 'expired', 'cancelled'))
);

-- =============================================
-- MEAL TIME SLOTS TABLE (For time-based scanning)
-- =============================================
CREATE TABLE IF NOT EXISTS meal_time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  meal_type VARCHAR(20) NOT NULL,
  name VARCHAR(50) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_meal_type CHECK (meal_type IN ('breakfast', 'tea_morning', 'lunch', 'tea_evening', 'dinner')),
  UNIQUE(restaurant_id, meal_type)
);

-- Insert default meal time slots (will be copied per restaurant)
-- These are system defaults; each restaurant can customize

-- =============================================
-- MEALS TABLE (Menu items)
-- =============================================
CREATE TABLE IF NOT EXISTS meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  description TEXT,
  dietary_plan_ids UUID[], -- Compatible dietary plans
  available_date DATE NOT NULL,
  max_servings INTEGER DEFAULT 500,
  current_orders INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_meal_type CHECK (meal_type IN ('breakfast', 'tea_morning', 'lunch', 'tea_evening', 'dinner'))
);

-- =============================================
-- MEAL SCANS TABLE (QR code scans with time restriction)
-- =============================================
CREATE TABLE IF NOT EXISTS meal_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  meal_type VARCHAR(20) NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  cps_number_used VARCHAR(20) NOT NULL,
  qr_code_used BOOLEAN DEFAULT false,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'served',
  notes TEXT,
  
  -- Prevent multiple scans for same meal type on same day
  UNIQUE(user_id, meal_type, scan_date),
  
  CONSTRAINT valid_scan_meal_type CHECK (meal_type IN ('breakfast', 'tea_morning', 'lunch', 'tea_evening', 'dinner')),
  CONSTRAINT valid_scan_status CHECK (status IN ('served', 'cancelled', 'rejected'))
);

-- =============================================
-- TRANSACTIONS TABLE (Payments)
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'TZS',
  payment_method VARCHAR(50) NOT NULL,
  payment_reference VARCHAR(100),
  external_reference VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  metadata JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('mpesa', 'airtel_money', 'tigopesa', 'halopesa', 'selcom', 'bank', 'cash')),
  CONSTRAINT valid_transaction_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- =============================================
-- USER SESSIONS TABLE (For secure authentication)
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AUDIT LOG TABLE (For tracking important actions)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_cps_number ON users(cps_number);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_restaurant_id ON users(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_daily_code ON users(daily_code) WHERE daily_code IS NOT NULL;

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions(end_date);

-- Meal scans indexes
CREATE INDEX IF NOT EXISTS idx_meal_scans_user_id ON meal_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_scans_staff_id ON meal_scans(staff_id);
CREATE INDEX IF NOT EXISTS idx_meal_scans_scan_date ON meal_scans(scan_date);
CREATE INDEX IF NOT EXISTS idx_meal_scans_meal_type_date ON meal_scans(meal_type, scan_date);

-- Restaurants indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_region ON restaurants(region);
CREATE INDEX IF NOT EXISTS idx_restaurants_location_type ON restaurants(location_type);
CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate unique CPS number
CREATE OR REPLACE FUNCTION generate_cps_number() 
RETURNS VARCHAR(20) AS $$
DECLARE
  new_cps VARCHAR(20);
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  LOOP
    new_cps := 'CPS#';
    FOR i IN 1..6 LOOP
      new_cps := new_cps || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    -- Check if exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE cps_number = new_cps) THEN
      RETURN new_cps;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to generate daily code for a user
CREATE OR REPLACE FUNCTION generate_daily_code(user_uuid UUID) 
RETURNS VARCHAR(20) AS $$
DECLARE
  new_code VARCHAR(20);
  chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i INTEGER;
BEGIN
  new_code := '';
  FOR i IN 1..4 LOOP
    new_code := new_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  
  -- Update user's daily code
  UPDATE users 
  SET daily_code = new_code, 
      daily_code_date = CURRENT_DATE 
  WHERE id = user_uuid;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to check if scan is within allowed time range
CREATE OR REPLACE FUNCTION is_within_meal_time(
  p_restaurant_id UUID,
  p_meal_type VARCHAR(20)
) RETURNS BOOLEAN AS $$
DECLARE
  v_start_time TIME;
  v_end_time TIME;
  v_current_time TIME;
BEGIN
  v_current_time := CURRENT_TIME;
  
  SELECT start_time, end_time INTO v_start_time, v_end_time
  FROM meal_time_slots
  WHERE restaurant_id = p_restaurant_id 
    AND meal_type = p_meal_type 
    AND is_active = true;
    
  IF v_start_time IS NULL THEN
    -- No time slot defined, use defaults
    CASE p_meal_type
      WHEN 'breakfast' THEN v_start_time := '06:00'; v_end_time := '09:00';
      WHEN 'tea_morning' THEN v_start_time := '10:00'; v_end_time := '11:00';
      WHEN 'lunch' THEN v_start_time := '12:00'; v_end_time := '14:30';
      WHEN 'tea_evening' THEN v_start_time := '15:30'; v_end_time := '17:00';
      WHEN 'dinner' THEN v_start_time := '18:00'; v_end_time := '21:00';
      ELSE RETURN false;
    END CASE;
  END IF;
  
  RETURN v_current_time >= v_start_time AND v_current_time <= v_end_time;
END;
$$ LANGUAGE plpgsql;

-- Function to check subscription validity
CREATE OR REPLACE FUNCTION check_subscription_valid(p_user_id UUID) 
RETURNS TABLE(
  is_valid BOOLEAN,
  subscription_id UUID,
  days_remaining INTEGER,
  meals_remaining INTEGER,
  plan_name VARCHAR(100),
  status VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN s.status = 'active' AND s.end_date >= CURRENT_DATE AND s.remaining_meals > 0 
      THEN true 
      ELSE false 
    END as is_valid,
    s.id as subscription_id,
    (s.end_date - CURRENT_DATE)::INTEGER as days_remaining,
    s.remaining_meals,
    sp.name as plan_name,
    s.status
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'pending')
  ORDER BY s.end_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: Auto-expire subscriptions
-- =============================================
CREATE OR REPLACE FUNCTION expire_subscriptions() 
RETURNS void AS $$
BEGIN
  UPDATE subscriptions 
  SET status = 'expired', updated_at = CURRENT_TIMESTAMP
  WHERE status = 'active' 
    AND (end_date < CURRENT_DATE OR remaining_meals <= 0);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGER: Update timestamps
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_restaurants_timestamp
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscription_plans_timestamp
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
