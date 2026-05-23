-- Chakula Poa Seed Data
-- Initial data for the food subscription management system

-- =============================================
-- SEED RESTAURANTS (Sample locations across Tanzania)
-- =============================================
INSERT INTO restaurants (id, name, code, location_type, region, area, city, contact_email, contact_phone, capacity, is_active) VALUES
-- Dar es Salaam
('11111111-1111-1111-1111-111111111111', 'University of Dar es Salaam Main Canteen', 'UDSM-MAIN', 'university', 'Dar es Salaam', 'Mlimani Campus', 'Dar es Salaam', 'canteen@udsm.ac.tz', '+255222410700', 800, true),
('22222222-2222-2222-2222-222222222222', 'Ardhi University Canteen', 'ARU-MAIN', 'university', 'Dar es Salaam', 'Ardhi Campus', 'Dar es Salaam', 'canteen@aru.ac.tz', '+255222775004', 500, true),
('33333333-3333-3333-3333-333333333333', 'Kariakoo Market Food Court', 'KRK-MARKET', 'market', 'Dar es Salaam', 'Kariakoo', 'Dar es Salaam', 'info@kariakoomarket.co.tz', '+255222180000', 300, true),
('44444444-4444-4444-4444-444444444444', 'PSPF Tower Office Canteen', 'PSPF-TOWER', 'office', 'Dar es Salaam', 'Samora Avenue', 'Dar es Salaam', 'canteen@pspf.go.tz', '+255222110000', 200, true),
-- Arusha
('55555555-5555-5555-5555-555555555555', 'Nelson Mandela African Institution Canteen', 'NMAIST', 'university', 'Arusha', 'Tengeru', 'Arusha', 'canteen@nm-aist.ac.tz', '+255272970000', 400, true),
('66666666-6666-6666-6666-666666666666', 'Arusha City Marketplace', 'ARS-MKT', 'market', 'Arusha', 'City Center', 'Arusha', 'info@arushamarket.co.tz', '+255272503000', 250, true),
-- Mwanza
('77777777-7777-7777-7777-777777777777', 'St. Augustine University Canteen', 'SAUT-MWZ', 'university', 'Mwanza', 'Nyegezi', 'Mwanza', 'canteen@saut.ac.tz', '+255282560000', 350, true),
-- Dodoma
('88888888-8888-8888-8888-888888888888', 'University of Dodoma Main Canteen', 'UDOM-MAIN', 'university', 'Dodoma', 'Dodoma Urban', 'Dodoma', 'canteen@udom.ac.tz', '+255262310000', 1000, true),
-- Morogoro
('99999999-9999-9999-9999-999999999999', 'Sokoine University Canteen', 'SUA-MAIN', 'university', 'Morogoro', 'SUA Campus', 'Morogoro', 'canteen@sua.ac.tz', '+255232604000', 600, true),
-- Mbeya
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Mbeya University of Science and Technology', 'MUST-MAIN', 'university', 'Mbeya', 'MUST Campus', 'Mbeya', 'canteen@must.ac.tz', '+255252500000', 450, true)
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- SEED MEAL TIME SLOTS (For each restaurant)
-- =============================================
INSERT INTO meal_time_slots (restaurant_id, meal_type, name, start_time, end_time, is_active) 
SELECT r.id, m.meal_type, m.name, m.start_time::TIME, m.end_time::TIME, true
FROM restaurants r
CROSS JOIN (VALUES 
  ('breakfast', 'Breakfast', '06:00', '09:00'),
  ('tea_morning', 'Morning Tea', '10:00', '11:00'),
  ('lunch', 'Lunch', '12:00', '14:30'),
  ('tea_evening', 'Evening Tea', '15:30', '17:00'),
  ('dinner', 'Dinner', '18:00', '21:00')
) AS m(meal_type, name, start_time, end_time)
WHERE NOT EXISTS (
  SELECT 1 FROM meal_time_slots mts 
  WHERE mts.restaurant_id = r.id AND mts.meal_type = m.meal_type
);

-- =============================================
-- SEED SUBSCRIPTION PLANS
-- =============================================

-- Plans for UDSM (Template for other universities)
INSERT INTO subscription_plans (restaurant_id, name, description, duration_type, duration_days, price, meals_per_day, includes_tea, is_active) VALUES
-- UDSM Plans
('11111111-1111-1111-1111-111111111111', 'Daily Plan', 'Perfect for trying out our service', 'day', 1, 8000, 3, true, true),
('11111111-1111-1111-1111-111111111111', 'Weekly Plan', 'Great value for a week of meals', 'week', 7, 45000, 3, true, true),
('11111111-1111-1111-1111-111111111111', 'Bi-Weekly Plan', 'Two weeks of hassle-free meals', 'week', 14, 85000, 3, true, true),
('11111111-1111-1111-1111-111111111111', 'Monthly Plan', 'Best value - full month coverage', 'month', 30, 160000, 3, true, true),
('11111111-1111-1111-1111-111111111111', 'Semester Plan', 'Complete semester meal solution', 'semester', 120, 580000, 3, true, true),

-- UDOM Plans
('88888888-8888-8888-8888-888888888888', 'Daily Plan', 'Perfect for trying out our service', 'day', 1, 7500, 3, true, true),
('88888888-8888-8888-8888-888888888888', 'Weekly Plan', 'Great value for a week of meals', 'week', 7, 42000, 3, true, true),
('88888888-8888-8888-8888-888888888888', 'Monthly Plan', 'Best value - full month coverage', 'month', 30, 150000, 3, true, true),

-- Kariakoo Market Plans (Lower prices for market setting)
('33333333-3333-3333-3333-333333333333', 'Daily Plan', 'Quick daily meal solution', 'day', 1, 6000, 2, false, true),
('33333333-3333-3333-3333-333333333333', 'Weekly Plan', 'Week of market fresh meals', 'week', 7, 35000, 2, false, true),
('33333333-3333-3333-3333-333333333333', 'Monthly Plan', 'Monthly market meal subscription', 'month', 30, 130000, 2, false, true),

-- Office (PSPF) Plans (Lunch focused)
('44444444-4444-4444-4444-444444444444', 'Lunch Weekly', 'Weekday lunches only', 'week', 5, 30000, 1, true, true),
('44444444-4444-4444-4444-444444444444', 'Lunch Monthly', 'Full month weekday lunches', 'month', 22, 110000, 1, true, true)
ON CONFLICT DO NOTHING;

-- Copy plans to other universities with adjusted pricing
INSERT INTO subscription_plans (restaurant_id, name, description, duration_type, duration_days, price, meals_per_day, includes_tea, is_active)
SELECT 
  r.id,
  sp.name,
  sp.description,
  sp.duration_type,
  sp.duration_days,
  sp.price * CASE r.region 
    WHEN 'Dar es Salaam' THEN 1.0
    WHEN 'Arusha' THEN 0.95
    WHEN 'Mwanza' THEN 0.90
    WHEN 'Dodoma' THEN 0.85
    WHEN 'Morogoro' THEN 0.88
    WHEN 'Mbeya' THEN 0.85
    ELSE 0.90
  END,
  sp.meals_per_day,
  sp.includes_tea,
  true
FROM restaurants r
CROSS JOIN (
  SELECT DISTINCT ON (name) * FROM subscription_plans WHERE restaurant_id = '11111111-1111-1111-1111-111111111111'
) sp
WHERE r.location_type = 'university' 
  AND r.id NOT IN ('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888')
  AND NOT EXISTS (
    SELECT 1 FROM subscription_plans p2 
    WHERE p2.restaurant_id = r.id AND p2.name = sp.name
  );

-- =============================================
-- SEED SUPER ADMIN USER (Password: admin123)
-- Password hash generated using bcrypt
-- =============================================
INSERT INTO users (
  id, 
  cps_number, 
  first_name, 
  last_name, 
  email, 
  phone_number, 
  password_hash, 
  role, 
  is_active, 
  is_verified
) VALUES (
  'deadbeef-dead-beef-dead-beefdeadbeef',
  'CPS#ADMIN1',
  'System',
  'Administrator',
  'admin@chakulapoa.co.tz',
  '+255700000001',
  '$2b$10$rIC/s4WxJCXKmBHSyB7Px.V5v2Q4K4LHM4dYqYQWKjrF.PZcKBvKe', -- admin123
  'super_admin',
  true,
  true
) ON CONFLICT (cps_number) DO NOTHING;

-- =============================================
-- SEED SAMPLE ADMIN FOR UDSM (Password: admin123)
-- =============================================
INSERT INTO users (
  id,
  cps_number, 
  first_name, 
  last_name, 
  email, 
  phone_number, 
  password_hash,
  restaurant_id,
  region,
  role, 
  is_active, 
  is_verified
) VALUES (
  'cafebabe-cafe-babe-cafe-babecafebabe',
  'CPS#UDSADM',
  'John',
  'Mwalimu',
  'admin@udsm.canteen.co.tz',
  '+255700000002',
  '$2b$10$rIC/s4WxJCXKmBHSyB7Px.V5v2Q4K4LHM4dYqYQWKjrF.PZcKBvKe', -- admin123
  '11111111-1111-1111-1111-111111111111',
  'Dar es Salaam',
  'admin',
  true,
  true
) ON CONFLICT (cps_number) DO NOTHING;

-- =============================================
-- SEED SAMPLE STAFF FOR UDSM (Password: staff123)
-- =============================================
INSERT INTO users (
  id,
  cps_number, 
  first_name, 
  last_name, 
  email, 
  phone_number, 
  password_hash,
  restaurant_id,
  region,
  role, 
  is_active, 
  is_verified
) VALUES (
  'facefeed-face-feed-face-feedfacefeed',
  'CPS#STAFF1',
  'Mary',
  'Kessy',
  'staff@udsm.canteen.co.tz',
  '+255700000003',
  '$2b$10$X3.VdKf7VJv0xZI.HZG5GeT1Fq8N6Kv0pR5xU8mL.J7wQ9nY6zXeS', -- staff123
  '11111111-1111-1111-1111-111111111111',
  'Dar es Salaam',
  'staff',
  true,
  true
) ON CONFLICT (cps_number) DO NOTHING;

-- =============================================
-- SEED SAMPLE USER WITH ACTIVE SUBSCRIPTION (Password: user123)
-- =============================================
INSERT INTO users (
  id,
  cps_number, 
  first_name, 
  last_name, 
  email, 
  phone_number, 
  password_hash,
  registration_number,
  restaurant_id,
  region,
  role, 
  is_active, 
  is_verified
) VALUES (
  'beefcafe-beef-cafe-beef-cafebeefcafe',
  'CPS#USR001',
  'Peter',
  'Makundi',
  'peter.makundi@student.udsm.ac.tz',
  '+255700000004',
  '$2b$10$Y4.WdLg8WKw1yAJ.IAH6HfU2Gr9O7Lw1qS6yV9nM.K8xR0oZ7aYfT', -- user123
  '2024-04-00123',
  '11111111-1111-1111-1111-111111111111',
  'Dar es Salaam',
  'user',
  true,
  true
) ON CONFLICT (cps_number) DO NOTHING;

-- Add subscription for sample user
INSERT INTO subscriptions (
  user_id,
  plan_id,
  start_date,
  end_date,
  status,
  total_meals,
  remaining_meals
) 
SELECT 
  'beefcafe-beef-cafe-beef-cafebeefcafe',
  sp.id,
  CURRENT_DATE,
  CURRENT_DATE + 30,
  'active',
  90, -- 30 days * 3 meals
  85  -- Some meals already consumed
FROM subscription_plans sp
WHERE sp.restaurant_id = '11111111-1111-1111-1111-111111111111'
  AND sp.name = 'Monthly Plan'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.user_id = 'beefcafe-beef-cafe-beef-cafebeefcafe' AND s.status = 'active'
  )
LIMIT 1;

-- Set dietary preference for sample user
INSERT INTO user_dietary_preferences (user_id, dietary_plan_id, is_verified)
SELECT 
  'beefcafe-beef-cafe-beef-cafebeefcafe',
  dp.id,
  true
FROM dietary_plans dp
WHERE dp.name = 'Regular'
  AND NOT EXISTS (
    SELECT 1 FROM user_dietary_preferences udp 
    WHERE udp.user_id = 'beefcafe-beef-cafe-beef-cafebeefcafe'
  )
LIMIT 1;
