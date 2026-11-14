import sqlite3
import hashlib
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "swadbox.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    salt = "swadbox_secret_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def init_db():
    conn = get_connection()
    c = conn.cursor()

    # Users table
    c.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Products table
    c.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        weight TEXT NOT NULL,
        category TEXT NOT NULL,
        stock INTEGER NOT NULL,
        image_url TEXT NOT NULL
    )
    ''')

    # Orders table
    c.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        phone TEXT NOT NULL,
        delivery_address TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'Placed',
        payment_method TEXT DEFAULT 'Cash on Delivery',
        payment_status TEXT DEFAULT 'Pending',
        transaction_id TEXT DEFAULT '',
        payment_details TEXT DEFAULT '',
        delivery_status TEXT DEFAULT 'Order Placed',
        delivery_partner_name TEXT DEFAULT 'Ramesh Patel',
        delivery_partner_phone TEXT DEFAULT '+91 98251 44321',
        delivery_partner_vehicle TEXT DEFAULT 'GJ-01-ET-4829 (Hero Splendor)',
        delivery_partner_rating REAL DEFAULT 4.9,
        estimated_minutes INTEGER DEFAULT 25,
        distance_km REAL DEFAULT 3.2,
        current_lat REAL DEFAULT 23.0365,
        current_lng REAL DEFAULT 72.5284,
        delivery_mode TEXT DEFAULT 'delivery',
        pickup_otp TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Migration check for existing orders table
    c.execute("PRAGMA table_info(orders)")
    existing_cols = [row[1] for row in c.fetchall()]
    new_cols = {
        "payment_method": "TEXT DEFAULT 'Cash on Delivery'",
        "payment_status": "TEXT DEFAULT 'Pending'",
        "transaction_id": "TEXT DEFAULT ''",
        "payment_details": "TEXT DEFAULT ''",
        "delivery_status": "TEXT DEFAULT 'Order Placed'",
        "delivery_partner_name": "TEXT DEFAULT 'Ramesh Patel'",
        "delivery_partner_phone": "TEXT DEFAULT '+91 98251 44321'",
        "delivery_partner_vehicle": "TEXT DEFAULT 'GJ-01-ET-4829 (Hero Splendor)'",
        "delivery_partner_rating": "REAL DEFAULT 4.9",
        "estimated_minutes": "INTEGER DEFAULT 25",
        "distance_km": "REAL DEFAULT 3.2",
        "current_lat": "REAL DEFAULT 23.0365",
        "current_lng": "REAL DEFAULT 72.5284",
        "delivery_mode": "TEXT DEFAULT 'delivery'",
        "pickup_otp": "TEXT DEFAULT ''"
    }
    for col_name, col_def in new_cols.items():
        if col_name not in existing_cols:
            c.execute(f"ALTER TABLE orders ADD COLUMN {col_name} {col_def}")

    # Order Items table
    c.execute('''
    CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        weight TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id)
    )
    ''')

    # Contact messages table
    c.execute('''
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    conn.commit()

    # Clean / Update default user to Kahan Shah
    c.execute("DELETE FROM users WHERE email IN ('vishalmotani008@gmail.com', 'vishalmotani0080@gmail.com')")
    c.execute("SELECT id FROM users WHERE email = ?", ("kahanshah5676@gmail.com",))
    if not c.fetchone():
        c.execute(
            "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
            ("Kahan Shah", "kahanshah5676@gmail.com", hash_password("kahan0934"))
        )
    else:
        c.execute(
            "UPDATE users SET password_hash = ? WHERE email = ?",
            (hash_password("kahan0934"), "kahanshah5676@gmail.com")
        )

    # 15 Total Products (all in stock, Masala khakhara in stock with 25 units)
    initial_products = [
        (1, "mathi khakhar", 100.0, "500 g", "khakara", 20, "/mathi_khakhar.jpg"),
        (2, "Masala khakhara", 100.0, "500 g", "khakara", 25, "/masala_khakhara.jpg"),
        (3, "Plain Khakhara", 90.0, "500 g", "khakara", 20, "/plain_khakhara.jpg"),
        (4, "Jeera Khakhara", 100.0, "500 g", "khakara", 20, "/jeera_khakhara.jpg"),
        (5, "Methi Masala Khakhara", 110.0, "500 g", "khakara", 15, "/methi_masala.jpg"),
        (6, "Bhavnagari Gathiya", 120.0, "500 g", "namkeen", 20, "/bhavnagari_gathiya.jpg"),
        (7, "Ratlami Sev", 110.0, "500 g", "namkeen", 30, "/ratlami_sev.jpg"),
        (8, "Chorafali", 130.0, "400 g", "namkeen", 18, "/chorafali.jpg"),
        (9, "Tikha Meetha Mix", 100.0, "500 g", "namkeen", 25, "/tikha_meetha_mix.jpg"),
        (10, "Crispy Banana Chips", 120.0, "400 g", "namkeen", 20, "/banana_chips.jpg"),
        (11, "Kaju Katli", 350.0, "400 g", "sweets", 15, "/kaju_katli.jpg"),
        (12, "Besan Ladoo", 180.0, "500 g", "sweets", 20, "/besan_ladoo.jpg"),
        (13, "Gulab Jamun", 160.0, "500 g", "sweets", 20, "/gulab_jamun.jpg"),
        (14, "Mohan Thal", 220.0, "500 g", "sweets", 15, "/mohan_thal.jpg"),
        (15, "Dry Fruit Halwa", 280.0, "400 g", "sweets", 15, "/dry_fruit_halwa.jpg")
    ]

    # Re-populate products table to ensure exactly 15 products are present and in stock
    c.execute("DELETE FROM products")
    c.executemany(
        "INSERT INTO products (id, name, price, weight, category, stock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
        initial_products
    )

    # Seed active demo orders covering all combinations:
    # 1. With Delivery + Payment Done (Paid)
    # 2. With Delivery + Payment Not Done (COD / Payment Pending)
    # 3. Without Delivery (Store Pickup / Self Takeaway) + Payment Done
    c.execute("DELETE FROM orders WHERE id IN ('sbx_delivery_paid', 'sbx_delivery_cod', 'sbx_pickup_ready', 'sbx7a91fc02e84128d9c104')")
    c.execute("DELETE FROM order_items WHERE order_id IN ('sbx_delivery_paid', 'sbx_delivery_cod', 'sbx_pickup_ready', 'sbx7a91fc02e84128d9c104')")

    # Order 1: With Delivery + Paid
    ord1_id = "sbx_delivery_paid"
    c.execute('''
    INSERT INTO orders (
        id, user_id, customer_name, customer_email, phone, delivery_address, preferred_time,
        total_amount, status, payment_method, payment_status, transaction_id, payment_details,
        delivery_status, delivery_partner_name, delivery_partner_phone, delivery_partner_vehicle,
        delivery_partner_rating, estimated_minutes, distance_km, current_lat, current_lng, delivery_mode, pickup_otp
    ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivery', '')
    ''', (
        ord1_id, "Kahan Shah", "kahanshah5676@gmail.com", "3458699738",
        "Flat 402, Shivalik Heights, Near IIM New Campus, Vastrapur, Ahmedabad",
        "Evening (4pm – 8pm)", 320.0, "Out for Delivery", "Google Pay (UPI)", "Paid",
        "TXN_SWAD_883921049", "UPI: kahanshah5676@okaxis", "Out for Delivery",
        "Ramesh Patel", "+91 98251 44321", "GJ-01-ET-4829 (Hero Splendor)", 4.9, 14, 2.3, 23.0335, 72.5312
    ))
    c.execute("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight) VALUES (?, 1, 'mathi khakhar', 100.0, 1, '500 g')", (ord1_id,))
    c.execute("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight) VALUES (?, 2, 'Masala khakhara', 100.0, 1, '500 g')", (ord1_id,))
    c.execute("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight) VALUES (?, 6, 'Bhavnagari Gathiya', 120.0, 1, '500 g')", (ord1_id,))

    # Order 2: With Delivery + Unpaid (COD / Payment Pending)
    ord2_id = "sbx_delivery_cod"
    c.execute('''
    INSERT INTO orders (
        id, user_id, customer_name, customer_email, phone, delivery_address, preferred_time,
        total_amount, status, payment_method, payment_status, transaction_id, payment_details,
        delivery_status, delivery_partner_name, delivery_partner_phone, delivery_partner_vehicle,
        delivery_partner_rating, estimated_minutes, distance_km, current_lat, current_lng, delivery_mode, pickup_otp
    ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivery', '')
    ''', (
        ord2_id, "Kahan Shah", "kahanshah5676@gmail.com", "3458699738",
        "B-12, Sunrise Park, Near Vastrapur Lake, Ahmedabad, Gujarat 380015",
        "Afternoon (12pm – 4pm)", 210.0, "Placed", "Cash on Delivery (Pay to Rider)", "Pending",
        "", "Pay ₹210.00 cash or UPI on doorstep", "Kitchen Preparing & Packing",
        "Ramesh Patel", "+91 98251 44321", "GJ-01-ET-4829 (Hero Splendor)", 4.9, 25, 3.5, 23.0365, 72.5284
    ))
    c.execute("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight) VALUES (?, 4, 'Jeera Khakhara', 100.0, 1, '500 g')", (ord2_id,))
    c.execute("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight) VALUES (?, 7, 'Ratlami Sev', 110.0, 1, '500 g')", (ord2_id,))

    # Order 3: Without Delivery (Store Pickup / Takeaway) + Paid
    ord3_id = "sbx_pickup_ready"
    c.execute('''
    INSERT INTO orders (
        id, user_id, customer_name, customer_email, phone, delivery_address, preferred_time,
        total_amount, status, payment_method, payment_status, transaction_id, payment_details,
        delivery_status, delivery_partner_name, delivery_partner_phone, delivery_partner_vehicle,
        delivery_partner_rating, estimated_minutes, distance_km, current_lat, current_lng, delivery_mode, pickup_otp
    ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pickup', '8492')
    ''', (
        ord3_id, "Kahan Shah", "kahanshah5676@gmail.com", "3458699738",
        "Store Pickup: Shop 12-14, Shivalik Plaza, Vastrapur, Ahmedabad",
        "Ready for Pickup (in 15 mins)", 350.0, "Placed", "Visa Card (•••• 4242)", "Paid",
        "TXN_SWAD_91048214", "Visa Card ending in 4242", "Ready at Counter for Pickup",
        "Store Manager (Vikram)", "+91 34586 99738", "Store Counter Pickup", 5.0, 5, 0.0, 23.0365, 72.5284
    ))
    c.execute("INSERT INTO order_items (order_id, product_id, product_name, price, quantity, weight) VALUES (?, 11, 'Kaju Katli', 350.0, 1, '400 g')", (ord3_id,))

    conn.commit()
    conn.close()
    print("Database initialized with 15 products and updated credentials successfully.")

if __name__ == "__main__":
    init_db()
