# Chakula Poa

A meal subscription platform for ALL populated areas across Tanzania - universities, markets, offices, hospitals, industrial areas, and restaurants.

## Architecture

```
chakula-poa/
├── Frontend (Next.js 15)     → Deploy to Vercel
├── Backend (Django REST)     → Deploy to Render
└── Database (PostgreSQL)     → Render PostgreSQL
```

## Quick Start

### Prerequisites

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- PostgreSQL (optional for dev, required for production)

---

## Frontend Setup (Next.js)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` in the root directory:

```env
# API URL - Point to your backend
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend runs at: `http://localhost:3000`

---

## Backend Setup (Django)

### 1. Navigate to Backend

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings (optional for SQLite development)
```

**Database Options:**

| Option | .env Setting | Best For |
|--------|--------------|----------|
| SQLite | Leave `DATABASE_URL` empty | Quick local dev |
| PostgreSQL | `DATABASE_URL=postgres://user:pass@localhost:5432/chakula_poa` | Production parity |

### 5. Run Migrations

```bash
python manage.py migrate
```

### 6. Create Initial Data

```bash
python manage.py setup_initial_data
```

This creates:
- **Super Admin Account:**
  - Email: chedybreezy@gmail.com
  - Phone: 0712000001
  - Password: Amaruwebster093@
  
- **Sample Locations:**
  - Universities (UDSM, SUA, UDOM, etc.)
  - Markets (Kariakoo, Mwenge, etc.)
  - Offices (PSPF, NIC, TRA, etc.)
  - Hospitals (Muhimbili, Amana, etc.)
  - Industrial areas (Mikocheni, Ubungo, etc.)
  
- **Subscription Plans:** Daily, Weekly, Monthly, Semester

### 7. Run Development Server

```bash
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

---

## Production Deployment

### Frontend → Vercel

1. Push repo to GitHub
2. Connect to Vercel
3. Set environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://your-api.onrender.com
   ```
4. Deploy

### Backend → Render

#### Option A: Using render.yaml (Recommended)

1. Push repo to GitHub
2. Connect to Render
3. Render auto-detects `render.yaml` and configures:
   - Web service
   - PostgreSQL database
   - Environment variables
4. Update `CORS_ALLOWED_ORIGINS` with your Vercel URL

#### Option B: Manual Setup

1. **Create PostgreSQL Database:**
   - Go to Render Dashboard → New → PostgreSQL
   - Copy the Internal Database URL

2. **Create Web Service:**
   - Go to Render Dashboard → New → Web Service
   - Connect your GitHub repo
   - Settings:
     - **Name:** chakula-poa-api
     - **Root Directory:** backend
     - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
     - **Start Command:** `gunicorn chakula_poa.wsgi:application`

3. **Environment Variables:**
   ```
   ENVIRONMENT=production
   DEBUG=false
   SECRET_KEY=<generate-secure-key>
   DATABASE_URL=<from-step-1>
   ALLOWED_HOSTS=.onrender.com
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

4. **Run Initial Setup (one-time):**
   ```bash
   # In Render Shell
   python manage.py setup_initial_data
   ```

---

## API Documentation

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register/` | POST | Register new user |
| `/api/users/login/` | POST | Login (email or phone) |
| `/api/users/logout/` | POST | Logout |
| `/api/users/me/` | GET | Get current user |
| `/api/users/me/` | PATCH | Update profile |
| `/api/users/change-password/` | POST | Change password |
| `/api/users/token/refresh/` | POST | Refresh JWT token |

### Restaurants (Locations)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/restaurants/` | GET | List all locations |
| `/api/restaurants/?region=dar_es_salaam` | GET | Filter by region |
| `/api/restaurants/?location_type=university` | GET | Filter by type |
| `/api/restaurants/{id}/` | GET | Get location details |
| `/api/restaurants/types/` | GET | List location types |
| `/api/restaurants/regions/` | GET | List Tanzania regions |

### Subscription Plans

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/plans/` | GET | List subscription plans |
| `/api/plans/{id}/` | GET | Get plan details |

### Subscriptions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/subscriptions/me/` | GET | Get current subscription |
| `/api/subscriptions/` | POST | Create subscription |
| `/api/subscriptions/history/` | GET | Subscription history |

### Meals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/meals/` | GET | List available meals |
| `/api/meals/select/` | POST | Select a meal |
| `/api/meals/orders/` | GET | Get user's orders |
| `/api/meals/orders/{id}/` | DELETE | Cancel order |

### Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/initiate/` | POST | Initiate payment |
| `/api/payments/{id}/status/` | GET | Check payment status |
| `/api/payments/history/` | GET | Payment history |

### Staff

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/staff/verify/` | POST | Verify user code |
| `/api/staff/serve/` | POST | Mark meal as served |
| `/api/staff/orders/today/` | GET | Today's orders |

### Admin

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/dashboard/` | GET | Dashboard stats |
| `/api/admin/users/` | GET | List all users |
| `/api/admin/staff/` | GET/POST | Manage staff |
| `/api/admin/meals/` | GET/POST | Manage meals |
| `/api/admin/reports/demand/` | GET | Demand report |
| `/api/admin/reports/revenue/` | GET | Revenue report |

---

## Location Types

The platform supports multiple location types:

| Type | Code | Description |
|------|------|-------------|
| University | `university` | Higher education institutions |
| Market | `market` | Public markets and trading areas |
| Office | `office` | Government and corporate offices |
| Hospital | `hospital` | Healthcare facilities |
| Industrial | `industrial` | Industrial zones and factories |
| Restaurant | `restaurant` | Standalone restaurants |

---

## Tanzania Regions

All 31 regions are supported:
- Arusha, Dar es Salaam, Dodoma, Geita, Iringa, Kagera
- Katavi, Kigoma, Kilimanjaro, Lindi, Manyara, Mara
- Mbeya, Morogoro, Mtwara, Mwanza, Njombe
- Pemba North, Pemba South, Pwani, Rukwa, Ruvuma
- Shinyanga, Simiyu, Singida, Songwe, Tabora, Tanga
- Zanzibar North, Zanzibar South, Zanzibar West

---

## User Roles

| Role | Permissions |
|------|-------------|
| `user` | Browse meals, subscribe, order meals |
| `staff` | Verify users, serve meals at location |
| `admin` | Manage location, staff, meals, view reports |
| `super_admin` | Full system access, manage all locations |
| `developer` | Same as super_admin + debug access |

---

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL / SQLite
- JWT Authentication

### Deployment
- Frontend: Vercel
- Backend: Render.com
- Database: Render PostgreSQL

---

## Development

### Running Both Services

**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

### Testing API

```bash
# Register a new user
curl -X POST http://127.0.0.1:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Test","phone_number":"0712345678","password":"test123"}'

# Login
curl -X POST http://127.0.0.1:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"identifier":"0712345678","password":"test123"}'
```

---

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with details
3. Contact: chedybreezy@gmail.com

---

## License

MIT License - see LICENSE file for details.
