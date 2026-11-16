# SwadBox - Full-Stack Food Ordering Platform
### Python FastAPI • Redis Caching • Kotlin Android App • Docker & CI/CD

[![CI/CD Pipeline](https://github.com/shahkahan53-prog/kahanshah/actions/workflows/ci.yml/badge.svg)](https://github.com/shahkahan53-prog/kahanshah/actions)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=flat&logo=redis&logoColor=white)
![Kotlin](https://img.shields.io/badge/kotlin-%237F52FF.svg?style=flat&logo=kotlin&logoColor=white)
![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E8.svg?style=flat&logo=githubactions&logoColor=white)

A production-grade, full-stack food ordering and delivery system based on the **SwadBox** project specifications. Featuring an asynchronous **Python FastAPI backend with Redis caching**, a native **Kotlin Android mobile application (MVVM)**, multi-container **Docker Compose** orchestration, and automated **GitHub Actions CI/CD pipeline**.

---

## 🌟 Key Architecture & Highlights

```
+-------------------------------------------------------------+
|              Kotlin Android Mobile App (MVVM)               |
|      Retrofit2 • Coroutines • ViewModel • Coil ImageLoader  |
+-------------------------------------------------------------+
                              | HTTP / JSON (JWT Auth)
                              v
+-------------------------------------------------------------+
|                     FastAPI Python Backend                  |
|     REST API • JWT Auth (HS256) • Order Manager • Logging   |
+-------------------------------------------------------------+
           |                                     |
           | Cache Check                         | Relational Data
           v                                     v
+------------------------+           +------------------------+
|   Redis 7 In-Memory    |           |   SQLite Database      |
|   Key: "menu:all"      |           |   Users, Products,     |
|   TTL: 5 Minutes (300s)|           |   Orders, Payments     |
+------------------------+           +------------------------+
```

1. **High-Performance Redis Caching**:
   - `GET /menu` checks Redis key `menu:all` with a **5-minute (300s) TTL**.
   - **Cache HIT**: Response delivered in sub-milliseconds with HTTP header `X-Cache: HIT`.
   - **Cache MISS**: Data read from SQLite, stored in Redis, and returned with `X-Cache: MISS`.
   - **Prominent Console Logging**: Explicit logs `[REDIS CACHE HIT] Key: 'menu:all'` and `[REDIS CACHE MISS] Key: 'menu:all'` verify instant speedup.
   - **Smart Invalidation**: Calling `POST /admin/menu` automatically invalidates and evicts `menu:all` and single-item keys, guaranteeing zero stale data.
   - **Zero-Friction Fallback**: Connects to `REDIS_URL` (e.g. `redis://localhost:6379/0`), with an automatic in-memory TTL cache fallback if standalone Redis is offline.

2. **Native Kotlin Android App (`android-app/`)**:
   - Modern MVVM architecture with `ViewModel`, `LiveData`, and Kotlin Coroutines.
   - Network layer powered by `Retrofit 2` + `GsonConverterFactory`.
   - Asynchronous image loading with `Coil`.
   - Complete screen suite:
     - **Login & Signup (`LoginActivity`, `SignupActivity`)**: JWT token authentication with validation.
     - **Menu List Screen (`MainActivity`)**: Fast 2-column food grid with live Redis caching, prices, weights, and instant add-to-cart.
     - **Cart & Order Screen (`CartActivity`)**: Real-time item listing, quantity management, Home Delivery vs. Store Pickup toggle, address inputs, and payment selection (UPI, Paytm, GPay, Card, COD).
     - **Order Tracking & Pickup Screen (`OrderStatusActivity`)**: Live order status, estimated delivery time, and dynamic 4-digit Store Pickup OTP verification card.

3. **Multi-Platform Web Frontends**:
   - **Kotlin Multiplatform / Kotlin Web Frontend (`frontend-kotlin/`)**: Pure Kotlin/JS application with DOM rendering and API fetch client.
   - **Modern React + Vite Frontend (`frontend-web/`)**: Interactive web client running on `http://localhost:5173` with real-time GPS delivery tracking, animated rider, milestone progress stepper, and interactive UPI QR/Card checkout simulation.

4. **Containerization & CI/CD**:
   - `backend/Dockerfile`: Lightweight Python 3.11-slim container.
   - `docker-compose.yml`: Multi-service stack running Redis 7 Alpine and FastAPI backend with health checks.
   - `.github/workflows/ci.yml`: GitHub Actions automated workflow testing backend endpoints with pytest against a live Redis service container, building Docker images, and deploying to cloud.

---

## 🛠️ Complete Project Structure

```
d:\project for friend idea make it\
├── backend/
│   ├── main.py                   # FastAPI REST API (Auth, Menu, Orders, Admin)
│   ├── redis_cache.py            # Redis cache manager (TTL 300s, invalidation, HIT/MISS logging)
│   ├── auth_jwt.py               # Signed JWT tokens (HS256, 24-hr expiration)
│   ├── database.py               # SQLite database schemas and initial product seed
│   ├── requirements.txt          # Python dependencies (fastapi, redis, pyjwt, pytest)
│   ├── Dockerfile                # Production Docker container definition
│   ├── test_api.py               # Full pytest suite (7 passing integration tests)
│   └── uploads/                  # Product and site images
│       ├── swadbox_logo.png
│       ├── mathi_khakhar.jpg
│       ├── masala_khakhara.jpg
│       └── hero_snack.jpg
│
├── android-app/                  # Native Kotlin Android Application
│   ├── build.gradle.kts          # Top-level Gradle configuration
│   ├── settings.gradle.kts       # Gradle project settings
│   └── app/
│       ├── build.gradle.kts      # Android dependencies (Retrofit, Coroutines, Coil, ViewModel)
│       └── src/main/
│           ├── AndroidManifest.xml
│           ├── java/com/swadbox/foodapp/
│           │   ├── data/
│           │   │   ├── api/FoodApiService.kt       # Retrofit REST interface
│           │   │   ├── api/RetrofitClient.kt       # Retrofit singleton client
│           │   │   ├── model/Auth.kt               # Auth request/response DTOs
│           │   │   ├── model/MenuItem.kt           # Menu & food models
│           │   │   ├── model/Order.kt              # Order input & status models
│           │   │   └── repository/FoodRepository.kt
│           │   └── ui/
│           │       ├── activity/LoginActivity.kt
│           │       ├── activity/SignupActivity.kt
│           │       ├── activity/MainActivity.kt
│           │       ├── activity/CartActivity.kt
│           │       ├── activity/OrderStatusActivity.kt
│           │       └── viewmodel/
│           │           ├── AuthViewModel.kt
│           │           ├── MenuViewModel.kt
│           │           ├── CartViewModel.kt
│           │           └── OrderViewModel.kt
│           └── res/
│               ├── layout/
│               │   ├── activity_login.xml
│               │   ├── activity_signup.xml
│               │   ├── activity_main.xml
│               │   ├── activity_cart.xml
│               │   ├── activity_order_status.xml
│               │   ├── item_menu_card.xml
│               │   └── item_cart_card.xml
│               └── values/
│                   ├── colors.xml
│                   ├── strings.xml
│                   └── themes.xml
│
├── frontend-kotlin/              # Kotlin Multiplatform / Kotlin Web Frontend
│   ├── build.gradle.kts
│   └── src/jsMain/kotlin/com/swadbox/
│       ├── Main.kt               # Entrypoint & DOM renderer
│       ├── api/ApiClient.kt      # Fetch client connecting to Python API
│       ├── models/Models.kt      # Serialized data models
│       └── state/AppState.kt     # State & Cart manager
│
├── frontend-web/                 # Live Web Frontend (Vite server on port 5173)
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx               # Router & state manager
│   │   ├── index.css             # Matching typography & palette
│   │   ├── components/           # Navbar, Footer, Toast
│   │   └── pages/                # Home, Products, Cart, Checkout, Orders, Login, Register, About, Contact
│   └── public/
│
├── .github/workflows/
│   └── ci.yml                    # CI/CD GitHub Actions pipeline
├── docker-compose.yml            # Multi-container orchestration (Redis + FastAPI)
├── run_all.bat                   # 🚀 1-Click Starter for Backend & Frontend
├── run_backend.bat               # Starts Python backend on localhost:8000
├── run_frontend.bat              # Starts Frontend on localhost:5173
├── run_kotlin_frontend.bat       # Runs Kotlin/JS Gradle dev server
└── README.md
```

---

## ⚡ Redis Caching Architecture

### Strategy & TTL
- **Target Key**: `menu:all`
- **Cache Duration**: 300 seconds (5 minutes)
- **Serialization**: JSON-encoded payload
- **Cache Headers**: `X-Cache: HIT` or `X-Cache: MISS`

### Cache Invalidation Flow
When an administrator modifies or adds a food item via `POST /admin/menu`:
1. The new/updated item is committed to SQLite.
2. `redis_cache.invalidate_menu_cache()` executes:
   - Deletes key `menu:all`
   - Deletes item key `menu:{id}`
3. The next user request to `GET /menu` automatically fetches fresh data, repopulates Redis, and logs:
   ```
   [REDIS CACHE MISS] Key: 'menu:all' -> Loaded fresh from SQLite
   ```
4. Subsequent requests immediately hit cache:
   ```
   [REDIS CACHE HIT] Key: 'menu:all' -> 0.4ms response time
   ```

---

## 📡 API Endpoints Reference

### 🔐 Authentication (Signed JWT Tokens)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Registers a new user and returns a signed JWT access token |
| `POST` | `/auth/login` | Authenticates email & password, returns JWT token + user profile |

### 🍱 Menu & Admin (Redis Cached)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/menu` | Retrieves all 15 menu items cached in Redis (`menu:all`, TTL 5m) |
| `GET` | `/menu/{id}` | Retrieves a single food item by ID |
| `POST` | `/admin/menu` | Adds or updates menu items, **invalidates Redis cache** |

### 🛒 Orders & Tracking
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Places a new order (Home Delivery or Store Pickup) |
| `GET` | `/orders/{order_id}` | Returns live order status, ETA, and Store Pickup OTP |
| `GET` | `/api/orders/{id}/track` | Real-time GPS coordinates, milestone stage, and delivery partner |
| `POST` | `/api/orders/{id}/pay-online` | Converts Cash-on-Delivery (COD) to paid online order |

---

## 🚀 How to Run the Project

### 1. Quick Launch (Recommended)
Double-click:
```bat
run_all.bat
```
Starts backend on `http://localhost:8000` and web app on `http://localhost:5173`.

---

### 2. Run with Docker Compose (FastAPI + Redis)
To launch the full containerized stack:
```bash
docker-compose up --build -d
```
- FastAPI Backend: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Redis Service: `localhost:6379`
- View live Redis HIT/MISS logs:
  ```bash
  docker-compose logs -f backend
  ```

---

### 3. Run Automated Pytest Suite
Run the 7 automated integration tests verifying Redis caching, invalidation, JWT auth, and order flow:
```bash
python -m pytest backend/test_api.py -v
```
Output:
```
backend/test_api.py::test_health_check PASSED                            [ 14%]
backend/test_api.py::test_jwt_auth_signup_and_login PASSED               [ 28%]
backend/test_api.py::test_redis_caching_menu_endpoints PASSED            [ 42%]
backend/test_api.py::test_admin_menu_cache_invalidation PASSED           [ 57%]
backend/test_api.py::test_orders_creation_and_status PASSED              [ 71%]
backend/test_api.py::test_store_pickup_with_otp PASSED                   [ 85%]
backend/test_api.py::test_cod_order_and_online_payment_conversion PASSED [100%]

======================== 7 passed in 4.13s ========================
```

---

### 4. Running the Kotlin Android Mobile App
1. Open **Android Studio**.
2. Select **Open** and choose the `android-app/` directory.
3. Gradle will sync dependencies automatically (Retrofit, Coroutines, ViewModel, Coil).
4. Run on an Android Emulator or physical device:
   - When running on standard Android Emulator, `10.0.2.2:8000` routes directly to your host machine's FastAPI backend.
   - For physical devices on the same Wi-Fi, change `BASE_URL` in `RetrofitClient.kt` to your PC's LAN IP (e.g. `http://192.168.1.X:8000/`).

---

## 🔑 Pre-Configured Demo Account

- **Email**: `kahanshah5676@gmail.com`
- **Password**: `kahan0934`
- **Name**: `Kahan Shah`
- **Contact Phone**: `3458699738`
- **Store Location**: `Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015, India`

---

## 🍽️ 15 In-Stock Explore Menu Items

1. **mathi khakhar** (500 g) - ₹100
2. **Masala khakhara** (500 g) - ₹100
3. **Plain Khakhara** (500 g) - ₹90
4. **Jeera Khakhara** (500 g) - ₹100
5. **Methi Masala Khakhara** (500 g) - ₹110
6. **Bhavnagari Gathiya** (500 g) - ₹120
7. **Ratlami Sev** (500 g) - ₹110
8. **Chorafali** (400 g) - ₹130
9. **Tikha Meetha Mix** (500 g) - ₹100
10. **Crispy Banana Chips** (400 g) - ₹120
11. **Kaju Katli** (400 g) - ₹350
12. **Besan Ladoo** (500 g) - ₹180
13. **Gulab Jamun** (500 g) - ₹160
14. **Mohan Thal** (500 g) - ₹220
15. **Dry Fruit Halwa** (400 g) - ₹280

---

## 🔄 Continuous Integration & Deployment (CI/CD)

The GitHub Actions workflow defined in `.github/workflows/ci.yml` triggers on every push and pull request to `main`:
1. **Lint & Static Analysis**: Verifies formatting and imports.
2. **Pytest Integration Suite**: Starts a live Redis service container in GitHub Actions and runs all 7 test cases.
3. **Docker Build**: Builds and validates the production Docker image.
4. **Deploy**: Automatically deploys the container to cloud hosting (e.g. Render, Railway, or AWS) when tests pass.
