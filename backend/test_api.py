import time
import pytest
from fastapi.testclient import TestClient
from main import app
from redis_cache import cache
from auth_jwt import verify_access_token

client = TestClient(app)

def test_health_check():
    """Verify backend health and status."""
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_jwt_auth_signup_and_login():
    """Verify user signup and login with JWT tokens as specified in PDF Section 4."""
    # Test Signup with JWT
    unique_email = f"user_{int(time.time())}@example.com"
    signup_payload = {
        "full_name": "Test User",
        "email": unique_email,
        "password": "securepassword123"
    }
    r_signup = client.post("/auth/signup", json=signup_payload)
    assert r_signup.status_code == 200, r_signup.text
    signup_data = r_signup.json()
    assert signup_data["success"] is True
    assert "token" in signup_data
    # Verify JWT validity
    decoded = verify_access_token(signup_data["token"])
    assert decoded is not None
    assert decoded["sub"] == unique_email

    # Test Login with JWT
    login_payload = {
        "email": unique_email,
        "password": "securepassword123"
    }
    r_login = client.post("/auth/login", json=login_payload)
    assert r_login.status_code == 200, r_login.text
    login_data = r_login.json()
    assert login_data["success"] is True
    assert "token" in login_data
    decoded_login = verify_access_token(login_data["token"])
    assert decoded_login is not None
    assert decoded_login["sub"] == unique_email

def test_redis_caching_menu_endpoints():
    """
    Verify Redis caching plan (PDF Section 5 & 11):
    - First request: cache miss, reads database, saves in Redis (TTL 5 mins)
    - Second request: cache hit, served immediately from Redis (clearly faster)
    - GET /menu/{id} returns single item
    """
    # Flush cache to guarantee clean initial state
    cache.flush()

    # 1. First request -> Cache MISS
    t0 = time.time()
    r1 = client.get("/menu")
    t1 = time.time()
    assert r1.status_code == 200
    assert r1.headers.get("X-Cache") == "MISS"
    menu1 = r1.json()
    assert len(menu1) >= 15
    duration_miss = t1 - t0

    # 2. Second request -> Cache HIT (faster from Redis)
    t2 = time.time()
    r2 = client.get("/menu")
    t3 = time.time()
    assert r2.status_code == 200
    assert r2.headers.get("X-Cache") == "HIT"
    menu2 = r2.json()
    assert len(menu2) == len(menu1)
    duration_hit = t3 - t2
    print(f"\n[BENCHMARK] Cache MISS: {duration_miss*1000:.2f}ms vs Cache HIT: {duration_hit*1000:.2f}ms")

    # 3. GET /menu/{id}
    first_item_id = menu1[0]["id"]
    r_item = client.get(f"/menu/{first_item_id}")
    assert r_item.status_code == 200
    item = r_item.json()
    assert item["id"] == first_item_id
    assert "name" in item
    assert "price" in item

def test_admin_menu_cache_invalidation():
    """
    Verify cache invalidation (PDF Section 4 & 5):
    POST /admin/menu must delete the cached menu key 'menu:all'.
    Subsequent GET /menu returns fresh data with Cache MISS.
    """
    # Ensure cache is populated
    r_warm = client.get("/menu")
    assert r_warm.status_code == 200

    # Verify cache is warm
    r_hit = client.get("/menu")
    assert r_hit.headers.get("X-Cache") == "HIT"

    # Admin updates a menu item
    update_payload = {
        "id": 1,
        "name": "mathi khakhar (Freshly Baked)",
        "price": 105.0,
        "weight": "500 g",
        "category": "khakara",
        "stock": 25,
        "image_url": "/mathi_khakhar.jpg"
    }
    r_admin = client.post("/admin/menu", json=update_payload)
    assert r_admin.status_code == 200
    assert r_admin.json()["cache_invalidated"] is True

    # Next GET /menu MUST be a Cache MISS because cache was invalidated!
    r_after = client.get("/menu")
    assert r_after.status_code == 200
    assert r_after.headers.get("X-Cache") == "MISS"
    
    # Reset name back
    client.post("/admin/menu", json={
        "id": 1,
        "name": "mathi khakhar",
        "price": 100.0,
        "weight": "500 g",
        "category": "khakara",
        "stock": 25,
        "image_url": "/mathi_khakhar.jpg"
    })

    # Test explicit /admin/cache/clear endpoint
    r_clear = client.post("/admin/cache/clear")
    assert r_clear.status_code == 200
    assert r_clear.json()["cache_invalidated"] is True

    # Next call should be MISS again
    r_miss_again = client.get("/menu")
    assert r_miss_again.status_code == 200
    assert r_miss_again.headers.get("X-Cache") == "MISS"

def test_orders_creation_and_status():
    """
    Verify order placement (POST /orders) and order status (GET /orders/{id}).
    """
    order_payload = {
        "customer_name": "Kahan Shah",
        "customer_email": "kahanshah5676@gmail.com",
        "phone": "3458699738",
        "delivery_address": "Shop 12-14, Shivalik Plaza, Vastrapur, Ahmedabad",
        "preferred_time": "Evening (4pm – 8pm)",
        "payment_method": "Google Pay (UPI)",
        "payment_status": "Paid",
        "transaction_id": "TXN_SWAD_TEST_101",
        "delivery_mode": "delivery",
        "items": [
            {"product_id": 2, "name": "Masala khakhara", "price": 100.0, "quantity": 2, "weight": "500 g"}
        ]
    }

    # POST /orders
    r_order = client.post("/orders", json=order_payload)
    assert r_order.status_code == 200, r_order.text
    order_data = r_order.json()
    assert order_data["success"] is True
    order_id = order_data["order_id"]

    # GET /orders/{id} shows order status
    r_status = client.get(f"/orders/{order_id}")
    assert r_status.status_code == 200, r_status.text
    status_data = r_status.json()
    assert status_data["order_id"] == order_id
    assert status_data["status"] == "Placed"
    assert status_data["delivery_mode"] == "delivery"
    assert status_data["payment_status"] == "Paid"
    assert len(status_data["items"]) == 1

def test_store_pickup_with_otp():
    """Verify order without delivery (store pickup) generates 4-digit OTP pass."""
    pickup_payload = {
        "customer_name": "Kahan Shah",
        "customer_email": "kahanshah5676@gmail.com",
        "phone": "3458699738",
        "delivery_address": "Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur",
        "preferred_time": "Ready in 15 mins",
        "payment_method": "Paytm (UPI)",
        "payment_status": "Paid",
        "delivery_mode": "pickup",
        "items": [
            {"product_id": 1, "name": "mathi khakhar", "price": 100.0, "quantity": 1, "weight": "500 g"}
        ]
    }
    r = client.post("/orders", json=pickup_payload)
    assert r.status_code == 200
    res = r.json()
    assert res["delivery_mode"] == "pickup"
    assert len(res["pickup_otp"]) == 4

def test_cod_order_and_online_payment_conversion():
    """Verify COD pending order and conversion to Paid via /pay-online."""
    cod_payload = {
        "customer_name": "Kahan Shah",
        "customer_email": "kahanshah5676@gmail.com",
        "phone": "3458699738",
        "delivery_address": "Shop 12-14, Shivalik Plaza, Vastrapur, Ahmedabad",
        "preferred_time": "Evening (4pm – 8pm)",
        "payment_method": "Cash on Delivery",
        "payment_status": "Pending",
        "delivery_mode": "delivery",
        "items": [
            {"product_id": 1, "name": "mathi khakhar", "price": 100.0, "quantity": 1, "weight": "500 g"}
        ]
    }
    r_cod = client.post("/orders", json=cod_payload)
    assert r_cod.status_code == 200
    cod_order_id = r_cod.json()["order_id"]

    # Convert to Paid online
    pay_payload = {
        "payment_method": "UPI",
        "provider": "Google Pay",
        "upi_id": "kahanshah@okhdfcbank"
    }
    r_pay = client.post(f"/api/orders/{cod_order_id}/pay-online", json=pay_payload)
    assert r_pay.status_code == 200
    pay_res = r_pay.json()
    assert pay_res["payment_status"] == "Paid"
    assert "TXN_SWAD_" in pay_res["transaction_id"]

if __name__ == "__main__":
    pytest.main(["-v", __file__])
