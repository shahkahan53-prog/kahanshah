import os
import uuid
import random
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Header, Depends, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr

from database import init_db, get_connection, hash_password
from redis_cache import cache
from auth_jwt import create_access_token, verify_access_token

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(title="Food Ordering App API", version="1.0.0", lifespan=lifespan)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# --- Pydantic Models ---
class MenuItemInput(BaseModel):
    id: Optional[int] = None
    name: str
    price: float
    weight: Optional[str] = "500 g"
    category: Optional[str] = "khakara"
    stock: Optional[int] = 20
    image_url: Optional[str] = "/mathi_khakhar.jpg"

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class OrderItemInput(BaseModel):
    product_id: int
    name: str
    price: float
    quantity: int
    weight: str

class PaymentProcessRequest(BaseModel):
    order_amount: float
    payment_method: str  # 'UPI', 'Credit/Debit Card', 'Net Banking', 'Wallet', 'Cash on Delivery'
    provider: Optional[str] = "Google Pay"
    upi_id: Optional[str] = None
    card_number: Optional[str] = None
    card_name: Optional[str] = None
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None
    bank_name: Optional[str] = None
    wallet_name: Optional[str] = None

class CreateOrderRequest(BaseModel):
    customer_name: str
    customer_email: str
    phone: str
    delivery_address: str
    preferred_time: str
    items: List[OrderItemInput]
    payment_method: Optional[str] = "Cash on Delivery"
    payment_status: Optional[str] = "Pending"
    transaction_id: Optional[str] = ""
    payment_details: Optional[str] = ""
    delivery_mode: Optional[str] = "delivery"  # 'delivery' (With Delivery) or 'pickup' (Without Delivery / Self Pickup)
    pickup_otp: Optional[str] = ""

class PayOnlineRequest(BaseModel):
    payment_method: str = "UPI"  # 'UPI', 'Credit/Debit Card', 'Net Banking'
    provider: Optional[str] = "Google Pay"
    upi_id: Optional[str] = None
    card_number: Optional[str] = None

class ContactRequest(BaseModel):
    name: str
    email: str
    message: str

# Helper to verify token (Simple Bearer token: email or token)
def get_current_user_email(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    token = authorization.replace("Bearer ", "").strip()
    return token if token else None

# --- Routes ---

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SwadBox Backend API", "time": datetime.now().isoformat()}

# Auth: Signup / Register with JWT tokens
@app.post("/auth/signup")
@app.post("/api/auth/register")
def register(req: RegisterRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if c.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    hashed = hash_password(req.password)
    c.execute(
        "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
        (req.full_name, req.email, hashed)
    )
    user_id = c.lastrowid
    conn.commit()
    conn.close()

    jwt_token = create_access_token({"sub": req.email, "id": user_id, "name": req.full_name})

    return {
        "success": True,
        "token": jwt_token,
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": req.full_name,
            "email": req.email
        }
    }

# Auth: Login with JWT tokens
@app.post("/auth/login")
@app.post("/api/auth/login")
def login(req: LoginRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, full_name, email, password_hash FROM users WHERE email = ?", (req.email,))
    row = c.fetchone()
    conn.close()

    if not row or row["password_hash"] != hash_password(req.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    jwt_token = create_access_token({"sub": row["email"], "id": row["id"], "name": row["full_name"]})

    return {
        "success": True,
        "token": jwt_token,
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": row["id"],
            "full_name": row["full_name"],
            "email": row["email"]
        }
    }

# Menu: List all food items (Cached in Redis key 'menu:all' with 5-minute TTL)
@app.get("/menu")
@app.get("/api/products")
def get_menu(response: Response = None):
    # Step 1: Check Redis cache first
    cached_menu = cache.get("menu:all")
    if cached_menu is not None:
        if response:
            response.headers["X-Cache"] = "HIT"
            response.headers["Cache-Control"] = "public, max-age=300"
        return cached_menu

    # Step 2: Cache Miss - read from SQLite/Postgres database
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, name, price, weight, category, stock, image_url FROM products ORDER BY id ASC")
    rows = c.fetchall()
    conn.close()

    menu = [dict(r) for r in rows]

    # Step 3: Save result in Redis with 5-minute TTL (300 seconds)
    cache.set("menu:all", menu, ttl=300)
    if response:
        response.headers["X-Cache"] = "MISS"
        response.headers["Cache-Control"] = "public, max-age=300"
    return menu

# Menu: Get one item by ID
@app.get("/menu/{item_id}")
@app.get("/api/products/{item_id}")
def get_menu_item(item_id: int):
    cache_key = f"menu:{item_id}"
    cached_item = cache.get(cache_key)
    if cached_item is not None:
        return cached_item

    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT id, name, price, weight, category, stock, image_url FROM products WHERE id = ?", (item_id,))
    row = c.fetchone()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="Item not found")

    item = dict(row)
    cache.set(cache_key, item, ttl=300)
    return item

# Admin: Add or update a menu item (Invalidates Redis cache key 'menu:all')
@app.post("/admin/menu")
def add_or_update_menu_item(item: MenuItemInput):
    conn = get_connection()
    c = conn.cursor()

    if item.id:
        c.execute("SELECT id FROM products WHERE id = ?", (item.id,))
        exists = c.fetchone()
        if exists:
            c.execute('''
            UPDATE products
            SET name = ?, price = ?, weight = ?, category = ?, stock = ?, image_url = ?
            WHERE id = ?
            ''', (item.name, item.price, item.weight, item.category, item.stock, item.image_url, item.id))
            item_id = item.id
        else:
            c.execute('''
            INSERT INTO products (id, name, price, weight, category, stock, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (item.id, item.name, item.price, item.weight, item.category, item.stock, item.image_url))
            item_id = item.id
    else:
        c.execute('''
        INSERT INTO products (name, price, weight, category, stock, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (item.name, item.price, item.weight, item.category, item.stock, item.image_url))
        item_id = c.lastrowid

    conn.commit()
    conn.close()

    # Redis Cache Invalidation: Delete cached menu key
    cache.delete("menu:all")
    cache.delete(f"menu:{item_id}")

    return {
        "success": True,
        "message": f"Menu item #{item_id} '{item.name}' saved and Redis cache invalidated",
        "item_id": item_id,
        "cache_invalidated": True
    }

@app.post("/api/admin/menu")
def add_or_update_menu_item_alias(item: MenuItemInput):
    return add_or_update_menu_item(item)

# Admin: Explicit Cache Invalidation endpoint
@app.post("/admin/cache/clear")
def clear_menu_cache():
    cache.delete("menu:all")
    return {
        "success": True,
        "message": "Redis cache key 'menu:all' cleared successfully",
        "cache_invalidated": True
    }

@app.post("/api/admin/cache/clear")
def clear_menu_cache_alias():
    return clear_menu_cache()

# Payment: Process Payment Gateway
@app.post("/api/payment/process")
def process_payment(req: PaymentProcessRequest):
    txn_id = f"TXN_SWAD_{random.randint(10000000, 99999999)}"
    
    provider_name = req.provider or req.payment_method
    if req.payment_method == "UPI":
        masked_detail = f"UPI ({provider_name} • {req.upi_id or 'verified@upi'})"
    elif req.payment_method in ("Credit/Debit Card", "Card"):
        last4 = req.card_number[-4:] if req.card_number and len(req.card_number) >= 4 else "4242"
        card_type = "Visa" if req.card_number and req.card_number.startswith("4") else "Mastercard" if req.card_number and req.card_number.startswith("5") else "RuPay"
        masked_detail = f"{card_type} Card ending in {last4}"
    elif req.payment_method == "Net Banking":
        masked_detail = f"Net Banking ({req.bank_name or 'HDFC Bank'})"
    elif req.payment_method == "Wallet":
        masked_detail = f"Wallet ({req.wallet_name or 'Paytm Wallet'})"
    else:
        masked_detail = "Cash on Delivery"

    return {
        "success": True,
        "transaction_id": txn_id,
        "payment_status": "Paid" if req.payment_method != "Cash on Delivery" else "Pending",
        "payment_method": req.payment_method,
        "provider": provider_name,
        "masked_detail": masked_detail,
        "amount": req.order_amount,
        "timestamp": datetime.now().isoformat(),
        "message": f"Payment of ₹{req.order_amount:.2f} authorized successfully!"
    }

# Orders: Place order (Both /orders and /api/orders)
@app.post("/orders")
@app.post("/api/orders")
def place_order(req: CreateOrderRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="Cannot place an empty order.")

    conn = get_connection()
    c = conn.cursor()

    # Step 1: Check inventory / stock for each item
    for item in req.items:
        c.execute("SELECT id, name, stock FROM products WHERE id = ?", (item.product_id,))
        prod = c.fetchone()
        if not prod:
            # Check by name fallback
            c.execute("SELECT id, name, stock FROM products WHERE name = ?", (item.name,))
            prod = c.fetchone()
            
        if not prod:
            conn.close()
            raise HTTPException(status_code=404, detail=f"Product {item.name} not found.")

        if item.quantity > prod["stock"]:
            conn.close()
            # Exact message match as seen in the video alert: Not enough stock for "Masala khakhara"
            raise HTTPException(
                status_code=400,
                detail=f'Not enough stock for "{prod["name"]}"'
            )

    # Step 2: Calculate total and create order
    order_id = uuid.uuid4().hex[:24]
    total_amount = sum(item.price * item.quantity for item in req.items)

    # Find or use user
    c.execute("SELECT id FROM users WHERE email = ?", (req.customer_email,))
    user_row = c.fetchone()
    user_id = user_row["id"] if user_row else 1

    delivery_mode = req.delivery_mode or "delivery"
    pickup_otp = f"{random.randint(1000, 9999)}" if delivery_mode == "pickup" else ""

    payment_method = req.payment_method or "Cash on Delivery"
    payment_status = req.payment_status or ("Paid" if "Cash" not in payment_method and "COD" not in payment_method and "Counter" not in payment_method else "Pending")
    transaction_id = req.transaction_id or (f"TXN_SWAD_{random.randint(10000000, 99999999)}" if payment_status == "Paid" else "")
    payment_details = req.payment_details or payment_method

    partner_name = "Store Manager (Vikram)" if delivery_mode == "pickup" else "Ramesh Patel"
    partner_phone = "+91 34586 99738" if delivery_mode == "pickup" else "+91 98251 44321"
    partner_vehicle = "Store Counter Pickup" if delivery_mode == "pickup" else "GJ-01-ET-4829 (Hero Splendor)"
    est_mins = 15 if delivery_mode == "pickup" else 22
    dist_km = 0.0 if delivery_mode == "pickup" else 3.2
    deliv_status = "Kitchen Preparing & Packing" if delivery_mode == "pickup" else "Order Placed"

    c.execute('''
    INSERT INTO orders (
        id, user_id, customer_name, customer_email, phone, delivery_address, preferred_time,
        total_amount, status, payment_method, payment_status, transaction_id, payment_details,
        delivery_status, delivery_partner_name, delivery_partner_phone, delivery_partner_vehicle,
        delivery_partner_rating, estimated_minutes, distance_km, current_lat, current_lng,
        delivery_mode, pickup_otp
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Placed', ?, ?, ?, ?, ?, ?, ?, ?, 4.9, ?, ?, 23.0365, 72.5284, ?, ?)
    ''', (
        order_id, user_id, req.customer_name, req.customer_email, req.phone, req.delivery_address, req.preferred_time,
        total_amount, payment_method, payment_status, transaction_id, payment_details,
        deliv_status, partner_name, partner_phone, partner_vehicle,
        est_mins, dist_km, delivery_mode, pickup_otp
    ))

    # Step 3: Insert order items and decrement product stock
    for item in req.items:
        c.execute('''
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', (order_id, item.product_id, item.name, item.price, item.quantity, item.weight))

        c.execute('''
        UPDATE products SET stock = stock - ? WHERE id = ?
        ''', (item.quantity, item.product_id))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": order_id,
        "message": "Order placed successfully!",
        "total_amount": total_amount,
        "payment_method": payment_method,
        "payment_status": payment_status,
        "transaction_id": transaction_id,
        "delivery_mode": delivery_mode,
        "pickup_otp": pickup_otp
    }

# Orders: Get list for user
@app.get("/api/orders")
def get_orders(email: Optional[str] = None):
    conn = get_connection()
    c = conn.cursor()

    if email:
        c.execute("SELECT * FROM orders WHERE customer_email = ? ORDER BY created_at DESC", (email,))
    else:
        c.execute("SELECT * FROM orders ORDER BY created_at DESC")
    orders_rows = c.fetchall()

    orders_list = []
    for o in orders_rows:
        order_dict = dict(o)
        c.execute("SELECT product_name as name, price, quantity, weight FROM order_items WHERE order_id = ?", (order_dict["id"],))
        items_rows = c.fetchall()
        order_dict["items"] = [dict(i) for i in items_rows]
        orders_list.append(order_dict)

    conn.close()
    return orders_list

# Orders: Get single order status by ID (Shows order status as specified in PDF)
@app.get("/orders/{order_id}")
@app.get("/api/orders/{order_id}")
def get_order_status(order_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    order_dict = dict(row)
    c.execute("SELECT product_name as name, price, quantity, weight FROM order_items WHERE order_id = ?", (order_id,))
    items_rows = c.fetchall()
    order_dict["items"] = [dict(i) for i in items_rows]
    conn.close()

    return {
        "order_id": order_dict["id"],
        "customer_name": order_dict["customer_name"],
        "customer_email": order_dict["customer_email"],
        "phone": order_dict["phone"],
        "delivery_address": order_dict["delivery_address"],
        "total_amount": order_dict["total_amount"],
        "status": order_dict["status"],
        "delivery_status": order_dict["delivery_status"],
        "delivery_mode": order_dict.get("delivery_mode", "delivery"),
        "pickup_otp": order_dict.get("pickup_otp", ""),
        "payment_method": order_dict["payment_method"],
        "payment_status": order_dict["payment_status"],
        "transaction_id": order_dict.get("transaction_id", ""),
        "estimated_minutes": order_dict.get("estimated_minutes", 15),
        "items": order_dict["items"],
        "created_at": order_dict["created_at"]
    }

# Orders: Pay Online for an existing unpaid / COD order
@app.post("/api/orders/{order_id}/pay-online")
def pay_order_online(order_id: str, req: PayOnlineRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    txn_id = f"TXN_SWAD_{random.randint(10000000, 99999999)}"
    provider_name = req.provider or req.payment_method
    if req.payment_method == "UPI":
        masked_detail = f"{provider_name} (UPI • {req.upi_id or 'verified@okaxis'})"
    elif req.payment_method in ("Credit/Debit Card", "CARD", "Card"):
        last4 = req.card_number[-4:] if req.card_number and len(req.card_number) >= 4 else "4242"
        masked_detail = f"Card ending in {last4}"
    else:
        masked_detail = f"Online Payment ({provider_name})"

    c.execute('''
    UPDATE orders
    SET payment_status = 'Paid',
        payment_method = ?,
        transaction_id = ?,
        payment_details = ?
    WHERE id = ?
    ''', (masked_detail, txn_id, masked_detail, order_id))

    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": order_id,
        "payment_status": "Paid",
        "payment_method": masked_detail,
        "transaction_id": txn_id,
        "message": "Payment completed online successfully!"
    }

# Orders: Live Delivery / Pickup Tracking
@app.get("/api/orders/{order_id}/track")
def track_order(order_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    order_dict = dict(row)
    c.execute("SELECT product_name as name, price, quantity, weight FROM order_items WHERE order_id = ?", (order_id,))
    items_rows = c.fetchall()
    order_dict["items"] = [dict(i) for i in items_rows]
    conn.close()

    delivery_mode = order_dict.get("delivery_mode") or "delivery"
    delivery_status = order_dict.get("delivery_status") or "Order Placed"
    pickup_otp = order_dict.get("pickup_otp") or "8492"

    if delivery_mode == "pickup":
        # Store Pickup (Without Delivery)
        milestones_def = [
            ("Order Placed", "We received your order and sent it to our kitchen.", "1-2 mins ago"),
            ("Kitchen Preparing & Packing", "Traditional snacks are being freshly prepared and packed.", "10 mins ago"),
            ("Ready at Counter for Pickup", f"Your snack box is ready at the store counter! Show OTP {pickup_otp}.", "Live now"),
            ("Picked Up & Completed", "Handed over to customer with fresh smile. Enjoy!", "Upcoming")
        ]
        status_keys = [m[0] for m in milestones_def]
        current_idx = 0
        if delivery_status in status_keys:
            current_idx = status_keys.index(delivery_status)
        elif order_dict.get("status") == "Delivered":
            current_idx = 3
        else:
            current_idx = 2  # default ready at counter for demo

        total_steps = 4
        remaining_mins = max(0, int(15 * (1.0 - (current_idx / 3.0))))
        remaining_km = 0.0
        eta_display = "Ready at counter now!" if current_idx >= 2 else f"Ready in {remaining_mins} mins"

        store_lat = 23.0365
        store_lng = 72.5284
        rider_lat = store_lat
        rider_lng = store_lng
        partner_name = "Store Manager (Vikram)"
        partner_phone = "+91 34586 99738"
        partner_vehicle = "Store Counter Pickup"
    else:
        # Home Delivery (With Delivery)
        milestones_def = [
            ("Order Placed", "We received your order and sent it to our kitchen.", "1-2 mins ago"),
            ("Kitchen Preparing & Packing", "Traditional snacks are being freshly sealed and packed.", "10 mins ago"),
            ("Delivery Partner Assigned", "Delivery partner Ramesh Patel reached SwadBox kitchen.", "5 mins ago"),
            ("Out for Delivery", "Ramesh is on his way to your delivery location.", "Live now"),
            ("Delivered", "Snack box delivered at your doorstep with smile.", "Upcoming")
        ]
        status_keys = [m[0] for m in milestones_def]
        current_idx = 0
        if delivery_status in status_keys:
            current_idx = status_keys.index(delivery_status)
        elif order_dict.get("status") == "Delivered":
            current_idx = 4
        elif order_dict.get("status") == "Placed":
            current_idx = 3

        total_steps = 5
        progress_ratio = min(1.0, max(0.0, current_idx / 4.0))
        store_lat = 23.0365
        store_lng = 72.5284
        dest_lat = 23.0298
        dest_lng = 72.5342
        rider_lat = store_lat + (dest_lat - store_lat) * progress_ratio
        rider_lng = store_lng + (dest_lng - store_lng) * progress_ratio
        remaining_mins = max(0, int(22 * (1.0 - progress_ratio)))
        remaining_km = round(max(0.0, 3.2 * (1.0 - progress_ratio)), 1)
        eta_display = "Arriving now!" if remaining_mins == 0 else f"{remaining_mins} mins"
        partner_name = order_dict.get("delivery_partner_name") or "Ramesh Patel"
        partner_phone = order_dict.get("delivery_partner_phone") or "+91 98251 44321"
        partner_vehicle = order_dict.get("delivery_partner_vehicle") or "GJ-01-ET-4829 (Hero Splendor)"

    milestones = []
    for idx, (title, desc, default_time) in enumerate(milestones_def):
        if idx < current_idx:
            state = "completed"
        elif idx == current_idx:
            state = "current"
        else:
            state = "upcoming"
        milestones.append({
            "step": idx + 1,
            "title": title,
            "description": desc,
            "status": state,
            "time": default_time
        })

    return {
        "order_id": order_dict["id"],
        "customer_name": order_dict["customer_name"],
        "customer_email": order_dict["customer_email"],
        "phone": order_dict["phone"],
        "delivery_address": order_dict["delivery_address"],
        "preferred_time": order_dict["preferred_time"],
        "total_amount": order_dict["total_amount"],
        "delivery_mode": delivery_mode,
        "pickup_otp": pickup_otp,
        "payment_method": order_dict.get("payment_method", "Google Pay (UPI)"),
        "payment_status": order_dict.get("payment_status", "Paid"),
        "transaction_id": order_dict.get("transaction_id", ""),
        "delivery_status": delivery_status,
        "current_step": current_idx + 1,
        "total_steps": total_steps,
        "estimated_minutes": remaining_mins,
        "distance_km": remaining_km,
        "eta_display": eta_display,
        "store": {
            "name": "SwadBox Central Kitchen",
            "address": "Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur",
            "lat": 23.0365,
            "lng": 72.5284
        },
        "destination": {
            "name": order_dict["customer_name"],
            "address": order_dict["delivery_address"],
            "lat": 23.0298 if delivery_mode == "delivery" else 23.0365,
            "lng": 72.5342 if delivery_mode == "delivery" else 72.5284
        },
        "rider": {
            "name": partner_name,
            "phone": partner_phone,
            "vehicle": partner_vehicle,
            "rating": order_dict.get("delivery_partner_rating") or 4.9,
            "deliveries": 1420,
            "lat": rider_lat,
            "lng": rider_lng,
            "speed": "28 km/h" if delivery_mode == "delivery" else "0 km/h"
        },
        "milestones": milestones,
        "items": order_dict.get("items", [])
    }

# Orders: Advance delivery stage simulation
@app.post("/api/orders/{order_id}/advance-delivery")
def advance_delivery(order_id: str):
    conn = get_connection()
    c = conn.cursor()
    c.execute("SELECT delivery_status, status, delivery_mode FROM orders WHERE id = ?", (order_id,))
    row = c.fetchone()
    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Order not found")

    deliv_mode = row["delivery_mode"] or "delivery"
    if deliv_mode == "pickup":
        stages = [
            "Order Placed",
            "Kitchen Preparing & Packing",
            "Ready at Counter for Pickup",
            "Picked Up & Completed"
        ]
    else:
        stages = [
            "Order Placed",
            "Kitchen Preparing & Packing",
            "Delivery Partner Assigned",
            "Out for Delivery",
            "Delivered"
        ]

    curr = row["delivery_status"] or "Order Placed"
    curr_idx = stages.index(curr) if curr in stages else 0
    next_idx = min(len(stages) - 1, curr_idx + 1)
    next_stage = stages[next_idx]
    order_main_status = "Delivered" if next_idx == len(stages) - 1 else "Placed"

    c.execute(
        "UPDATE orders SET delivery_status = ?, status = ? WHERE id = ?",
        (next_stage, order_main_status, order_id)
    )
    conn.commit()
    conn.close()

    return {
        "success": True,
        "order_id": order_id,
        "delivery_mode": deliv_mode,
        "previous_stage": curr,
        "new_stage": next_stage
    }

# Contact: Submit message
@app.post("/api/contact")
def submit_contact(req: ContactRequest):
    conn = get_connection()
    c = conn.cursor()
    c.execute(
        "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
        (req.name, req.email, req.message)
    )
    conn.commit()
    conn.close()
    return {"success": True, "message": "Thank you for reaching out! We will contact you shortly."}

# Reset demo stock (helpful for testing)
@app.post("/api/demo/reset-stock")
def reset_stock():
    conn = get_connection()
    c = conn.cursor()
    c.execute("UPDATE products SET stock = 10 WHERE name = 'mathi khakhar'")
    c.execute("UPDATE products SET stock = 1 WHERE name = 'Masala khakhara'")
    conn.commit()
    conn.close()
    return {"success": True, "message": "Stock reset: mathi=10, Masala=1"}

