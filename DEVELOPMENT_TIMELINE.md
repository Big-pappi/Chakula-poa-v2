# Chakula Poa Development Timeline

A comprehensive development progress tracker for the Chakula Poa food service management system.

**Tech Stack:** Next.js 16 (Frontend) + Django REST Framework (Backend) + SQLite/PostgreSQL (Database)

---

## User Roles Overview

| Role | Description | Access Level |
|------|-------------|--------------|
| **Super Admin** | System administrator with full access | All features, system settings, all locations |
| **Admin** | Restaurant/Location administrator | Manage assigned location, staff, meals, reports |
| **Staff** | Canteen staff for meal verification | QR/CPS verification, meal serving |
| **User** | End customer/student | Subscribe, order meals, view history |

---

## Phase 1: Core Infrastructure (Foundation)

### Backend Setup
- [x] Django project initialization
- [x] User authentication system (JWT-based)
- [x] Custom user model with CPS number generation
- [x] Daily QR code generation system (changes daily, unique per subscription)
- [x] Restaurant/Location model with multi-type support
- [x] Region-based filtering (Tanzania regions)
- [x] Admin, Staff, and User role permissions

### Frontend Setup
- [x] Next.js 16 project with App Router
- [x] Tailwind CSS + shadcn/ui component library
- [x] Responsive layout system
- [x] Authentication context and token management
- [x] API client with error handling
- [x] System settings hook (useSystemSettings)
- [x] Maintenance mode detection and redirect

---

## Phase 2: User Management (All Roles)

### User (Customer) Features
- [x] User registration with phone number
- [x] Login with phone/email + password
- [x] Password reset functionality
- [x] Profile management
- [x] Dashboard with subscription status
- [x] Subscription purchase flow
- [x] Payment history
- [x] QR code & CPS number display (subscription-only)
- [x] Meal selection for tomorrow
- [x] Order history
- [x] Account settings

### Admin Features
- [x] Admin dashboard with stats
- [x] Location overview
- [x] Meal management (create, edit, delete)
- [x] Staff management (create, edit, delete)
- [x] User/student list view
- [x] Reports (demand, revenue)
- [x] Subscription management

### Staff Features
- [x] Staff dashboard
- [x] QR code/CPS code verification
- [x] Meal serving confirmation
- [x] Today's orders view
- [x] Serving statistics

### Super Admin Features
- [x] System-wide dashboard
- [x] All locations management (CRUD)
- [x] All users management (CRUD)
- [x] All payments/transactions view
- [x] System settings configuration
- [x] Maintenance mode toggle (redirects users to maintenance page)
- [x] Platform fee configuration
- [x] Payment methods toggle
- [x] Admin assignment to locations

---

## Phase 3: Subscription System

### Plans Management
- [x] Subscription plan model (tier, duration, price)
- [x] Multiple billing cycles (weekly, monthly, semester)
- [x] Tier system (student, normal, premium, special)
- [x] Dietary preference support
- [x] Restaurant-specific plans
- [x] Plan creation/editing for admins

### User Subscriptions
- [x] Subscription purchase flow
- [x] Subscription activation on payment
- [x] Remaining meals tracking
- [x] Subscription expiry handling
- [x] QR code & CPS only for active subscribers
- [x] Daily code regeneration (security feature)
- [ ] Renewal reminders (pending notification system)

---

## Phase 4: Payment System

### Payment Integration
- [x] Transaction model with payment tracking
- [x] Payment initiation API
- [x] Payment status checking
- [x] Payment history for users
- [x] Platform fee calculation (internal, not shown to users)
- [x] Restaurant payout tracking

### Payment Methods
- [x] M-Pesa with SVG icon
- [x] Airtel Money with SVG icon
- [x] Tigo Pesa with SVG icon
- [x] Halopesa with SVG icon
- [x] Mix by Yas with SVG icon
- [x] Bank Transfer with SVG icon
- [ ] Selcom gateway full integration (pending API keys)
- [ ] Payment webhook handlers (pending testing)

### Payment UI Updates
- [x] Payment method SVG icons created
- [x] Order summary simplified (no fee breakdown shown to users)
- [x] Mobile-friendly checkout flow

### Super Admin Payment Features
- [x] View all system transactions
- [x] Filter by status, date, location
- [x] Transaction detail view
- [x] Revenue statistics
- [x] Export report functionality (UI ready)

---

## Phase 5: Location Management

### Restaurant/Location System
- [x] Multi-type location support (Restaurant, University, Market, Office, Hospital, Industrial)
- [x] Region-based organization (all 31 Tanzania regions)
- [x] Location code generation
- [x] Contact information storage
- [x] Payout account configuration

### Super Admin Location Features
- [x] View all locations (including inactive)
- [x] Add new location
- [x] Edit location details
- [x] Configure location settings (payment methods, payout accounts)
- [x] Delete location (with confirmation)
- [x] Assign admin to location
- [x] View location details modal
- [x] Filter by type and region

---

## Phase 6: QR Code & Verification System

### QR Code System
- [x] Daily unique code generation
- [x] QR code contains same number as CPS display
- [x] Code changes at midnight each day
- [x] Subscription verification built-in
- [x] QR code only shown for active subscribers
- [x] Download QR code as PNG
- [x] Share functionality
- [x] Offline access via CPS number

### Staff Verification
- [x] Scan QR code to verify
- [x] Manual CPS number entry
- [x] Meal deduction on verification
- [x] Verification history

---

## Phase 7: System Configuration

### System Settings (Super Admin)
- [x] General settings (system name, email, currency, timezone)
- [x] Maintenance mode toggle (real-time redirect)
- [x] Platform fee configuration
- [x] Payment system master toggle
- [x] Individual payment method toggles
- [x] USSD configuration
- [x] Notification settings (email, SMS, push)
- [x] Security settings (2FA, session timeout, password policy)
- [x] API configuration (rate limiting, documentation access)
- [x] Unsaved changes detection
- [x] Settings stored in localStorage (temporary)
- [ ] Backend API endpoints for system settings (pending)

### Maintenance Mode
- [x] Toggle in super admin settings
- [x] Maintenance page with contact info
- [x] Automatic redirect for regular users
- [x] Admin/Super Admin bypass
- [x] Refresh button to check status

---

## Phase 8: Meals & Orders

### Meal Management
- [x] Meal model (type, name, description, price)
- [x] Meal availability by date
- [x] Dietary preferences support
- [x] Meal ordering system
- [x] Availability tracking (sold out detection)

### Order Processing
- [x] Order creation
- [x] Order confirmation
- [x] Order serving (staff)
- [x] Order history
- [x] Deadline-based ordering

---

## Phase 9: Reporting & Analytics

### Admin Reports
- [x] Demand report (by meal type)
- [x] Revenue report (by period)
- [x] User statistics

### Super Admin Reports
- [x] System-wide statistics
- [x] Transaction analytics
- [ ] Location performance dashboard (planned)

---

## Phase 10: Frontend Polish & UX

### Public Pages
- [x] Landing page with maintenance mode check
- [x] FAQ page
- [x] Contact page
- [x] Privacy policy
- [x] Terms of service
- [x] Refund policy
- [x] USSD guide
- [x] Help center
- [x] Maintenance page

### Responsive Design
- [x] Mobile-first approach
- [x] Tablet optimization
- [x] Desktop layouts
- [x] Dark mode support

---

## Current Sprint (In Progress)

### Payment Gateway Integration
- [ ] Selcom API integration
- [ ] M-Pesa USSD push
- [ ] Payment callback handling
- [ ] Transaction reconciliation

### Notification System
- [ ] SMS gateway integration
- [ ] Email template setup
- [ ] Push notification service
- [ ] Subscription reminders

### Admin Page UI Improvements
- [ ] Restaurant admin dashboard polish
- [ ] Admin menu management UI
- [ ] Staff management improvements
- [ ] Reports page enhancements

---

## Upcoming Features

### Phase 11: Mobile Apps
- [ ] React Native mobile app
- [ ] Push notifications
- [ ] Offline QR code support
- [ ] Biometric authentication

### Phase 12: Analytics Dashboard
- [ ] Advanced reporting
- [ ] Data visualization
- [ ] Export capabilities
- [ ] Scheduled reports

### Phase 13: Additional Features
- [ ] Multi-language support (Swahili)
- [ ] Loyalty program
- [ ] Referral system
- [ ] Bulk user import
- [ ] API documentation portal

---

## Recent Updates

### May 2026 (Latest Session)
- [x] Created maintenance mode page and system hook
- [x] Landing page checks maintenance mode and redirects
- [x] Fixed QR code and CPS number to be identical
- [x] QR code now only available for active subscribers
- [x] Daily code regeneration implemented (security)
- [x] Created SVG icons for all payment methods (M-Pesa, Airtel, Tigo, Halopesa, Mix by Yas, Bank)
- [x] Checkout page now uses proper payment icons
- [x] Removed payment fee breakdown from user-facing checkout (shows total only)
- [x] Updated user dashboard with subscription-required features
- [x] Quick actions locked for non-subscribers (QR Code, Select Meals, History)
- [x] Added account section (Profile, Settings)
- [x] Stats only shown to active subscribers
- [x] Installed qrcode package for proper QR generation
- [x] Fixed subscriptions page to filter plans by user's restaurant/location
- [x] Fixed sidebar to show full username (not just "U")
- [x] Fixed dashboard welcome message to show proper username
- [x] CPS number format improved (CPS-XXXXXX readable format)
- [x] Maintenance mode now saves to Django PostgreSQL database
- [x] Added system settings Django views and API endpoints
- [x] Super admin can turn maintenance mode on/off from database

### May 2026 (Previous Session)
- [x] Fixed Super Admin dashboard button (changed from "Add University" to "Manage Locations")
- [x] Implemented working Edit, View Details, Configure actions for Locations
- [x] Implemented working Edit, View Profile, Deactivate/Activate actions for Users
- [x] Enhanced Payments page with customer details and transaction view
- [x] Updated System Settings to use localStorage (temporary until backend API ready)
- [x] Added unsaved changes detection and save all functionality
- [x] Improved mobile responsiveness across all super admin pages
- [x] Fixed TANZANIA_REGIONS type mismatch (changed from strings to value/label objects)
- [x] Added payout fields to Restaurant interface

---

## File Structure (Key Files)

```
app/
├── page.tsx                      # Landing page (maintenance check)
├── maintenance/page.tsx          # Maintenance mode page
├── dashboard/                    # User dashboard
│   ├── page.tsx                  # Dashboard home (subscription-aware)
│   ├── qr-code/page.tsx         # QR & CPS display (subscription-only)
│   ├── checkout/page.tsx        # Payment checkout
│   ├── subscriptions/page.tsx   # Plan selection
│   └── ...
├── admin/                        # Restaurant admin pages
├── staff/                        # Staff portal
└── super-admin/                  # Super admin pages
    ├── page.tsx                  # Dashboard
    ├── locations/page.tsx        # Location management
    ├── users/page.tsx            # User management
    ├── payments/page.tsx         # All payments
    └── system/page.tsx           # System settings

components/
├── icons/payment-icons.tsx       # Payment method SVG icons
├── maintenance-guard.tsx         # Maintenance mode wrapper

lib/
├── hooks/use-system-settings.ts  # System settings hook
└── types/index.ts                # TypeScript types
```

---

## Notes

- Backend is built with Django REST Framework with JWT authentication
- Frontend uses Next.js 16 with App Router and server components where applicable
- Database currently using SQLite for development, PostgreSQL for production
- Payment integration is prepared for Selcom gateway (Tanzania)
- All API endpoints follow RESTful conventions
- Role-based access control implemented across the system
- QR code and CPS number are now identical for security
- System settings stored in localStorage until backend API is ready

---

*Last Updated: May 18, 2026*
