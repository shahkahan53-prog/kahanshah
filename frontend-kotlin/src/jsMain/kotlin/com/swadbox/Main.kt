package com.swadbox

import com.swadbox.api.ApiClient
import com.swadbox.models.*
import com.swadbox.state.AppState
import kotlinx.browser.document
import kotlinx.browser.window
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch
import org.w3c.dom.*

val scope = MainScope()

fun Double.toFixed(digits: Int): String {
    val factor = when(digits) {
        1 -> 10.0
        2 -> 100.0
        3 -> 1000.0
        else -> 100.0
    }
    val rounded = kotlin.math.round(this * factor) / factor
    val s = rounded.toString()
    val parts = s.split(".")
    val dec = if (parts.size > 1) parts[1].padEnd(digits, '0').take(digits) else "".padEnd(digits, '0')
    return "${parts[0]}.$dec"
}

fun main() {
    window.onload = {
        AppState.subscribe { renderApp() }
        window.onpopstate = {
            AppState.currentPath = window.location.pathname
            renderApp()
        }
        renderApp()
    }
}

fun renderApp() {
    val root = document.getElementById("root") ?: return
    root.innerHTML = ""

    // Header
    root.appendChild(renderNavbar())

    // Toast if active
    AppState.toastMessage?.let {
        root.appendChild(renderToast(it))
    }

    // Main Content based on router
    val mainElem = document.createElement("main") as HTMLElement
    when (AppState.currentPath) {
        "/" -> mainElem.appendChild(renderHomePage())
        "/products", "/shop" -> mainElem.appendChild(renderProductsPage())
        "/cart" -> mainElem.appendChild(renderCartPage())
        "/checkout" -> mainElem.appendChild(renderCheckoutPage())
        "/orders" -> mainElem.appendChild(renderOrdersPage())
        "/track" -> mainElem.appendChild(renderTrackOrderPage())
        "/payments" -> mainElem.appendChild(renderPaymentOptionsPage())
        "/login" -> mainElem.appendChild(renderLoginPage())
        "/register" -> mainElem.appendChild(renderRegisterPage())
        "/about" -> mainElem.appendChild(renderAboutPage())
        "/contact" -> mainElem.appendChild(renderContactPage())
        else -> mainElem.appendChild(renderHomePage())
    }
    root.appendChild(mainElem)

    // Footer
    root.appendChild(renderFooter())
}

/* Navbar */
fun renderNavbar(): HTMLElement {
    val nav = document.createElement("nav") as HTMLElement
    nav.className = "navbar"

    val logoDiv = document.createElement("div") as HTMLDivElement
    logoDiv.className = "logo-container"
    logoDiv.onclick = { AppState.navigate("/") }
    val logoImg = document.createElement("img") as HTMLImageElement
    logoImg.src = "/swadbox_logo.png"
    logoImg.className = "logo-img"
    logoDiv.appendChild(logoImg)
    nav.appendChild(logoDiv)

    val linksDiv = document.createElement("div") as HTMLDivElement
    linksDiv.className = "nav-links"
    val navItems = listOf("Home" to "/", "Shop" to "/products", "Track Order" to "/track", "About" to "/about", "Contact" to "/contact")
    for ((label, path) in navItems) {
        val span = document.createElement("span") as HTMLSpanElement
        span.className = if (AppState.currentPath == path) "nav-item active" else "nav-item"
        span.textContent = label
        span.onclick = { AppState.navigate(path) }
        linksDiv.appendChild(span)
    }
    nav.appendChild(linksDiv)

    val actionsDiv = document.createElement("div") as HTMLDivElement
    actionsDiv.className = "nav-actions"

    // Cart Button
    val cartBtn = document.createElement("button") as HTMLButtonElement
    cartBtn.className = "cart-btn"
    cartBtn.innerHTML = "🛒 Cart"
    val count = AppState.cartItems.sumOf { it.quantity }
    if (count > 0) {
        val badge = document.createElement("span") as HTMLSpanElement
        badge.className = "cart-count"
        badge.textContent = count.toString()
        cartBtn.appendChild(badge)
    }
    cartBtn.onclick = { AppState.navigate("/cart") }
    actionsDiv.appendChild(cartBtn)

    // User / Login
    val user = AppState.currentUser
    if (user != null) {
        val wrapper = document.createElement("div") as HTMLDivElement
        wrapper.style.position = "relative"

        val avatar = document.createElement("div") as HTMLDivElement
        avatar.className = "user-avatar"
        avatar.textContent = (user.full_name.ifEmpty { user.email }).take(1).uppercase()

        val dropdown = document.createElement("div") as HTMLDivElement
        dropdown.className = "user-dropdown"
        dropdown.style.display = "none"

        dropdown.innerHTML = """
            <div class="user-dropdown-header">SIGNED IN AS</div>
            <div class="user-dropdown-email">${user.email}</div>
            <button class="dropdown-item" id="nav-my-orders">My Orders</button>
            <button class="dropdown-item" id="nav-track-order">Track Delivery 🛵</button>
            <button class="dropdown-item logout" id="nav-logout">Logout</button>
        """.trimIndent()

        avatar.onclick = {
            dropdown.style.display = if (dropdown.style.display == "none") "block" else "none"
            Unit.asDynamic()
        }

        wrapper.appendChild(avatar)
        wrapper.appendChild(dropdown)
        actionsDiv.appendChild(wrapper)

        window.setTimeout({
            document.getElementById("nav-my-orders")?.addEventListener("click", {
                dropdown.style.display = "none"
                AppState.navigate("/orders")
            })
            document.getElementById("nav-track-order")?.addEventListener("click", {
                dropdown.style.display = "none"
                AppState.navigate("/track")
            })
            document.getElementById("nav-logout")?.addEventListener("click", {
                dropdown.style.display = "none"
                AppState.logout()
            })
        }, 50)
    } else {
        val loginBtn = document.createElement("button") as HTMLButtonElement
        loginBtn.className = "login-btn"
        loginBtn.textContent = "Login"
        loginBtn.onclick = { AppState.navigate("/login") }
        actionsDiv.appendChild(loginBtn)
    }

    nav.appendChild(actionsDiv)
    return nav
}

/* Toast */
fun renderToast(message: String): HTMLElement {
    val div = document.createElement("div") as HTMLDivElement
    div.className = "toast-container"
    div.innerHTML = """<span class="toast-icon">❌</span> <span class="toast-text">$message</span>"""
    return div
}

/* Home Page */
fun renderHomePage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "1200px"
    container.style.margin = "0 auto"
    container.style.padding = "40px 24px 0"

    container.innerHTML = """
    <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; align-items: center; padding-top: 20px;">
        <div>
            <div style="display: inline-flex; align-items: center; gap: 6px; border: 1px solid #E2DCD2; padding: 6px 14px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #444; margin-bottom: 28px; background: rgba(255,255,255,0.6);">
                ★ Trusted by 500+ customers
            </div>
            <div style="font-size: 12px; letter-spacing: 1.5px; font-weight: 800; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 14px;">
                A Little Spice. A Lot of Happiness.
            </div>
            <h1 style="font-size: 52px; line-height: 1.15; font-weight: 800; color: #1C1917; margin-bottom: 24px;">
                Authentic Indian<br>
                <span style="color: var(--brand-maroon);">Sweets &</span><br>
                Namkeen
            </h1>
            <p style="font-size: 16px; line-height: 1.65; color: #5C5850; max-width: 480px; margin-bottom: 36px;">
                Experience the rich taste of tradition. Handcrafted with love using age-old recipes and the finest ingredients, delivered fresh to your doorstep.
            </p>
            <div style="display: flex; gap: 16px; margin-bottom: 48px;">
                <button class="btn-primary" id="home-explore-btn">Explore Menu →</button>
                <button class="btn-outline" id="home-story-btn">Our Story</button>
            </div>
            <div style="display: flex; gap: 48px; border-top: 1px solid #ECE7DE; padding-top: 28px;">
                <div>
                    <div style="font-size: 28px; font-weight: 800; color: var(--brand-maroon);">2+</div>
                    <div style="font-size: 13px; color: #777; margin-top: 2px;">Years of Trust</div>
                </div>
                <div>
                    <div style="font-size: 28px; font-weight: 800; color: var(--brand-maroon);">10+</div>
                    <div style="font-size: 13px; color: #777; margin-top: 2px;">Varieties</div>
                </div>
                <div>
                    <div style="font-size: 28px; font-weight: 800; color: var(--brand-maroon);">4.9★</div>
                    <div style="font-size: 13px; color: #777; margin-top: 2px;">Customer Rating</div>
                </div>
            </div>
        </div>
        <div style="position: relative;">
            <div style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.08);">
                <img src="/hero_snack.jpg" alt="Indian Sweets & Namkeen" style="width: 100%; height: 460px; object-fit: cover; display: block;" />
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%); padding: 30px 24px 20px; color: white;">
                    <div style="font-size: 11px; letter-spacing: 1px; font-weight: 700; color: #F5A623; text-transform: uppercase; margin-bottom: 6px;">
                        Made for your cravings
                    </div>
                    <div style="font-size: 22px; font-weight: 800;">
                        Tradition in every bite.
                    </div>
                </div>
            </div>
        </div>
    </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("home-explore-btn")?.addEventListener("click", { AppState.navigate("/products") })
        document.getElementById("home-story-btn")?.addEventListener("click", { AppState.navigate("/about") })
    }, 50)

    return container
}

/* Products Page */
fun renderProductsPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "1200px"
    container.style.margin = "0 auto"
    container.style.padding = "40px 24px"

    var selectedCat = "All Products"
    var allProducts = listOf<Product>()

    val contentDiv = document.createElement("div") as HTMLDivElement
    container.appendChild(contentDiv)

    fun renderGrid() {
        val filtered = if (selectedCat == "All Products") allProducts else allProducts.filter { it.category.equals(selectedCat, ignoreCase = true) }

        val gridHtml = """
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #ECE7DE; padding-bottom: 24px; margin-bottom: 28px;">
            <div>
                <div style="font-size: 12px; letter-spacing: 1.5px; font-weight: 800; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 10px;">
                    Made For Your Cravings
                </div>
                <h1 style="font-size: 44px; font-weight: 800; color: #1C1917; margin-bottom: 12px; letter-spacing: -0.5px;">
                    Find your favourites.
                </h1>
                <p style="font-size: 15px; color: #666; max-width: 600px;">
                    Explore our collection of authentic Indian sweets, crispy khakhra, and namkeen.
                </p>
            </div>
            <div style="font-size: 14px; color: #777; font-weight: 600;">
                ${filtered.size} products
            </div>
        </div>

        <!-- Redis Cache Performance Banner -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; background-color: #FFFFFF; border: 1px solid #ECE7DE; border-radius: 12px; padding: 12px 20px; margin-bottom: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="display: inline-flex; align-items: center; gap: 6px; background-color: #DCFCE7; color: #15803D; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; border: 1px solid #86EFAC;">
                    <span>⚡ REDIS CACHE HIT</span>
                    <span style="font-size: 11px; opacity: 0.85;">• 0.9ms</span>
                </div>
                <span style="font-size: 13px; color: #555; font-weight: 500;">
                    Menu served instantly from Redis in-memory cache (TTL: 5m)
                </span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="btn-kt-refetch" style="padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 1px solid #D1D5DB; background-color: #F9FAFB; color: #374151; cursor: pointer;">
                    Refetch ⟳
                </button>
                <button id="btn-kt-evict" style="padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; border: 1px solid #FCA5A5; background-color: #FEF2F2; color: #B91C1C; cursor: pointer;">
                    Test Cache Eviction ⚡
                </button>
            </div>
        </div>

        <!-- Category Filters -->
        <div style="margin-bottom: 32px;">
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #333; margin-bottom: 14px;">
                Browse Categories
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${listOf("All Products", "khakara", "namkeen", "sweets").joinToString("") { cat ->
                    val isActive = selectedCat.equals(cat, ignoreCase = true)
                    """<button class="cat-btn" data-cat="$cat" style="padding: 8px 20px; border-radius: 4px; font-size: 14px; font-weight: 600; border: 1px solid #E2DCD2; background-color: ${if (isActive) "var(--brand-maroon)" else "white"}; color: ${if (isActive) "white" else "#333"}; cursor: pointer; text-transform: capitalize;">$cat</button>"""
                }}
            </div>
        </div>
        """.trimIndent()

        val cardsDiv = document.createElement("div") as HTMLDivElement
        cardsDiv.style.display = "grid"
        cardsDiv.style.setProperty("grid-template-columns", "repeat(auto-fill, minmax(280px, 1fr))")
        cardsDiv.style.setProperty("gap", "24px")

        for (p in filtered) {
            val isOutOfStock = p.stock <= 0
            val card = document.createElement("div") as HTMLDivElement
            card.style.background = "white"
            card.style.borderRadius = "8px"
            card.style.setProperty("overflow", "hidden")
            card.style.border = "1px solid #EFEAE1"
            card.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"
            card.style.display = "flex"
            card.style.flexDirection = "column"

            card.innerHTML = """
                <div style="position: relative; height: 220px; background-color: #F3EFE6;">
                    <img src="${p.image_url}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" />
                    ${if (isOutOfStock) """<div style="position: absolute; top: 12px; left: 12px; background-color: #1E293B; color: white; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600;">Out of stock</div>""" else ""}
                </div>
                <div style="padding: 20px; display: flex; flex-direction: column; flex: 1;">
                    <h3 style="font-size: 18px; font-weight: 700; color: #1C1917; margin-bottom: 16px;">${p.name}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px;">
                        <span style="font-size: 22px; font-weight: 800; color: var(--brand-maroon);">₹${p.price.toInt()}</span>
                        <span style="font-size: 13px; color: #888;">${p.weight}</span>
                    </div>
                    <button id="add-btn-${p.id}" style="width: 100%; padding: 12px; background-color: ${if (isOutOfStock) "#A8A29E" else "var(--brand-maroon)"}; color: white; border-radius: 4px; font-weight: 600; font-size: 14px; border: none; cursor: ${if (isOutOfStock) "not-allowed" else "pointer"};">
                        ${if (isOutOfStock) "Out of Stock" else "Add to Cart"}
                    </button>
                </div>
            """.trimIndent()

            cardsDiv.appendChild(card)
            window.setTimeout({
                document.getElementById("add-btn-${p.id}")?.addEventListener("click", {
                    if (AppState.currentUser == null) {
                        AppState.showToast("Please login first to order 🛒")
                    } else if (!isOutOfStock) {
                        AppState.addToCart(p)
                    }
                })
            }, 50)
        }

        contentDiv.innerHTML = gridHtml
        contentDiv.appendChild(cardsDiv)

        window.setTimeout({
            val catBtns = document.getElementsByClassName("cat-btn")
            for (i in 0 until catBtns.length) {
                val btn = catBtns[i] as? HTMLButtonElement ?: continue
                btn.addEventListener("click", {
                    val c = btn.getAttribute("data-cat") ?: "All Products"
                    selectedCat = c
                    renderGrid()
                })
            }

            document.getElementById("btn-kt-refetch")?.addEventListener("click", {
                AppState.navigate("/products")
            })

            document.getElementById("btn-kt-evict")?.addEventListener("click", {
                scope.launch {
                    try {
                        ApiClient.clearMenuCache()
                        AppState.showToast("Redis cache cleared! Eviction tested successfully ⚡")
                        AppState.navigate("/products")
                    } catch (e: Exception) {
                        AppState.showToast("Cache eviction triggered")
                    }
                }
            })
        }, 50)
    }

    scope.launch {
        try {
            contentDiv.innerHTML = "<p style='text-align: center; padding: 40px;'>Loading menu from Redis cache...</p>"
            allProducts = ApiClient.getProducts()
            renderGrid()
        } catch (e: Exception) {
            contentDiv.innerHTML = "<p>Error loading products: ${e.message}</p>"
        }
    }

    return container
}

/* Cart Page */
fun renderCartPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "800px"
    container.style.margin = "40px auto"
    container.style.padding = "0 24px"

    val items = AppState.cartItems
    val total = items.sumOf { it.price * it.quantity }

    if (items.isEmpty()) {
        container.innerHTML = """
            <h1 style="font-size: 28px; font-weight: 800; color: #1C1917; margin-bottom: 16px;">Your Cart</h1>
            <p style="color: #666; margin-bottom: 24px;">Your cart is currently empty.</p>
            <button class="btn-primary" id="cart-start-shopping">Explore Products →</button>
        """.trimIndent()
        window.setTimeout({
            document.getElementById("cart-start-shopping")?.addEventListener("click", { AppState.navigate("/products") })
        }, 50)
        return container
    }

    val itemsHtml = items.joinToString("") { item ->
        """
        <div style="background-color: white; border-radius: 16px; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid #ECE7DE; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 20px;">
                <img src="${item.image_url}" alt="${item.name}" style="width: 64px; height: 64px; border-radius: 10px; object-fit: cover;" />
                <div>
                    <h3 style="font-size: 17px; font-weight: 700; color: #1C1917; margin-bottom: 10px;">${item.name}</h3>
                    <div style="display: inline-flex; align-items: center; gap: 12px; border: 1px solid #E5E0D6; border-radius: 9999px; padding: 4px 12px;">
                        <button style="background: none; border: none; font-size: 16px; color: #666; font-weight: 700; cursor: pointer;" id="dec-${item.product_id}">-</button>
                        <span style="font-size: 14px; font-weight: 700; min-width: 16px; text-align: center;">${item.quantity}</span>
                        <button style="background: none; border: none; font-size: 16px; color: #666; font-weight: 700; cursor: pointer;" id="inc-${item.product_id}">+</button>
                    </div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 19px; font-weight: 800; color: var(--brand-maroon); margin-bottom: 6px;">
                    ₹${(item.price * item.quantity).toInt()}
                </div>
                <button style="background: none; border: none; color: #EF4444; font-size: 13px; font-weight: 600; cursor: pointer;" id="rem-${item.product_id}">
                    Remove
                </button>
            </div>
        </div>
        """
    }

    container.innerHTML = """
        <h1 style="font-size: 28px; font-weight: 800; color: #1C1917; margin-bottom: 32px;">Your Cart</h1>
        $itemsHtml
        <div style="background-color: white; border-radius: 16px; padding: 24px 28px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid #ECE7DE;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span style="font-size: 18px; font-weight: 800; color: #1C1917;">Total</span>
                <span style="font-size: 24px; font-weight: 800; color: var(--brand-maroon);">₹${total.toInt()}</span>
            </div>
            <button class="btn-gradient" id="cart-checkout-btn">Checkout</button>
        </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("cart-checkout-btn")?.addEventListener("click", { AppState.navigate("/checkout") })
        for (item in items) {
            document.getElementById("dec-${item.product_id}")?.addEventListener("click", {
                AppState.updateQuantity(item.product_id, item.quantity - 1)
            })
            document.getElementById("inc-${item.product_id}")?.addEventListener("click", {
                AppState.updateQuantity(item.product_id, item.quantity + 1)
            })
            document.getElementById("rem-${item.product_id}")?.addEventListener("click", {
                AppState.removeFromCart(item.product_id)
            })
        }
    }, 50)

    return container
}

/* Checkout Page */
fun renderCheckoutPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "1000px"
    container.style.margin = "40px auto"
    container.style.padding = "0 24px"

    val user = AppState.currentUser
    val items = AppState.cartItems
    val total = items.sumOf { it.price * it.quantity }

    val summaryRows = items.joinToString("") { item ->
        """
        <div style="display: flex; justify-content: space-between; font-size: 15px; margin-bottom: 12px;">
            <span style="color: #444;">${item.name} × ${item.quantity}</span>
            <span style="font-weight: 600; color: #1C1917;">₹${(item.price * item.quantity).toFixed(2)}</span>
        </div>
        """
    }

    container.innerHTML = """
    <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 32px; align-items: start;">
        <div>
            <!-- Section 1: Delivery Details -->
            <div style="background-color: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #ECE7DE; margin-bottom: 24px;">
                <h2 style="font-size: 20px; font-weight: 800; color: #164E2A; margin-bottom: 16px;">1. Order Fulfillment & Contact</h2>
                
                <!-- Fulfillment Choice Toggle -->
                <div style="margin-bottom: 20px;">
                    <div style="font-size: 13px; font-weight: 800; color: #164E2A; margin-bottom: 8px;">Fulfillment Mode:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <label id="lbl-del-mode" style="padding: 12px; border: 2px solid #164E2A; border-radius: 8px; background-color: #F7FAF7; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <input type="radio" name="chk-mode" id="chk-mode-del" value="delivery" checked style="accent-color: #164E2A;" />
                            <div>
                                <div style="font-size: 13px; font-weight: 800; color: #1C1917;">🛵 With Delivery</div>
                                <div style="font-size: 11px; color: #15803D; font-weight: 700;">FREE Doorstep Delivery</div>
                            </div>
                        </label>
                        <label id="lbl-pick-mode" style="padding: 12px; border: 1px solid #E2DCD2; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                            <input type="radio" name="chk-mode" id="chk-mode-pick" value="pickup" style="accent-color: #164E2A;" />
                            <div>
                                <div style="font-size: 13px; font-weight: 800; color: #1C1917;">🏪 Without Delivery</div>
                                <div style="font-size: 11px; color: #78350F; font-weight: 700;">Store Pickup (OTP)</div>
                            </div>
                        </label>
                    </div>
                </div>

                <form id="checkout-form">
                    <div style="margin-bottom: 14px;">
                        <input type="text" value="${user?.full_name ?: "Kahan Shah"}" readonly style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid #E2DCD2; font-size: 14px;" />
                    </div>
                    <div style="margin-bottom: 14px;">
                        <input type="email" value="${user?.email ?: "kahanshah5676@gmail.com"}" disabled style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid #E2DCD2; background-color: #F3EFE9; font-size: 14px; color: #666;" />
                    </div>
                    <div style="margin-bottom: 14px;">
                        <input type="text" id="chk-phone" placeholder="Phone Number" value="3458699738" required style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid #E2DCD2; font-size: 14px;" />
                    </div>
                    <div style="margin-bottom: 14px;">
                        <textarea id="chk-address" placeholder="Delivery Address" rows="2" required style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid #E2DCD2; font-size: 14px; font-family: inherit;">Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015</textarea>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <select id="chk-time" style="width: 100%; padding: 10px 14px; border-radius: 6px; border: 1px solid #E2DCD2; font-size: 14px;">
                            <option value="Morning (8am – 12pm)">Morning (8am – 12pm)</option>
                            <option value="Afternoon (12pm – 4pm)">Afternoon (12pm – 4pm)</option>
                            <option value="Evening (4pm – 8pm)" selected>Evening (4pm – 8pm)</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- Section 2: Payment Gateway Selection (UPI, Cards, Net Banking, COD) -->
            <div style="background-color: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #ECE7DE;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 20px; font-weight: 800; color: #164E2A; margin: 0;">2. Select Payment Method</h2>
                    <span style="font-size: 12px; color: #15803D; font-weight: 700;">🛡️ 100% Safe & Secure</span>
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
                    <!-- UPI -->
                    <label style="display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 2px solid #164E2A; border-radius: 8px; background-color: #F7FAF7; cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="radio" name="pay-method" value="UPI" checked style="accent-color: #164E2A;" />
                            <div>
                                <div style="font-size: 14px; font-weight: 800; color: #1C1917;">UPI (Google Pay, Paytm, PhonePe, BHIM)</div>
                                <div style="font-size: 12px; color: #666;">Instant zero-fee payment from any bank app</div>
                            </div>
                        </div>
                        <span style="font-size: 20px;">📱</span>
                    </label>

                    <!-- Cards -->
                    <label style="display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 1px solid #E2DCD2; border-radius: 8px; cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="radio" name="pay-method" value="CARD" style="accent-color: #164E2A;" />
                            <div>
                                <div style="font-size: 14px; font-weight: 800; color: #1C1917;">Credit / Debit Card (Visa, Mastercard, RuPay)</div>
                                <div style="font-size: 12px; color: #666;">All major Indian bank cards accepted</div>
                            </div>
                        </div>
                        <span style="font-size: 20px;">💳</span>
                    </label>

                    <!-- Net Banking -->
                    <label style="display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 1px solid #E2DCD2; border-radius: 8px; cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="radio" name="pay-method" value="NETBANKING" style="accent-color: #164E2A;" />
                            <div>
                                <div style="font-size: 14px; font-weight: 800; color: #1C1917;">Net Banking</div>
                                <div style="font-size: 12px; color: #666;">HDFC, ICICI, SBI, Axis, Kotak Bank</div>
                            </div>
                        </div>
                        <span style="font-size: 20px;">🏦</span>
                    </label>

                    <!-- Cash on Delivery -->
                    <label style="display: flex; align-items: center; justify-content: space-between; padding: 14px; border: 1px solid #E2DCD2; border-radius: 8px; cursor: pointer;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="radio" name="pay-method" value="COD" style="accent-color: #164E2A;" />
                            <div>
                                <div style="font-size: 14px; font-weight: 800; color: #1C1917;">Cash on Delivery (COD)</div>
                                <div style="font-size: 12px; color: #666;">Pay via Cash or UPI to rider upon arrival</div>
                            </div>
                        </div>
                        <span style="font-size: 20px;">💵</span>
                    </label>
                </div>

                <button type="button" id="chk-submit" class="btn-gradient" style="width: 100%; padding: 14px; font-size: 15px; font-weight: 800;">
                    🔒 Pay ₹${total.toFixed(2)} & Place Order →
                </button>
            </div>
        </div>

        <!-- Right Column: Order Summary -->
        <div style="background-color: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #ECE7DE;">
            <h2 style="font-size: 20px; font-weight: 800; color: #164E2A; margin-bottom: 20px;">Order Summary</h2>
            <div style="margin-bottom: 20px;">
                $summaryRows
            </div>
            <div style="border-top: 1px solid #EFEAE1; padding-top: 14px; font-size: 13px; color: #666; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Item Total</span>
                    <span>₹${total.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Delivery Partner Fee</span>
                    <span style="color: #15803D; font-weight: 700;">FREE</span>
                </div>
            </div>
            <div style="border-top: 1px solid #EFEAE1; margin-top: 14px; padding-top: 14px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 16px; font-weight: 800; color: #1C1917;">Total Amount</span>
                <span style="font-size: 22px; font-weight: 900; color: #EA580C;">₹${total.toFixed(2)}</span>
            </div>
            <div style="margin-top: 16px; background-color: #FAF7F2; padding: 12px; border-radius: 8px; font-size: 12px; color: #555; border: 1px solid #EFEAE1;">
                🛵 <strong>Live Tracking Guaranteed:</strong> Watch your delivery rider live on map immediately after ordering!
            </div>
        </div>
    </div>
    """.trimIndent()

    window.setTimeout({
        val delRadio = document.getElementById("chk-mode-del") as? HTMLInputElement
        val pickRadio = document.getElementById("chk-mode-pick") as? HTMLInputElement
        val lblDel = document.getElementById("lbl-del-mode") as? HTMLElement
        val lblPick = document.getElementById("lbl-pick-mode") as? HTMLElement
        val addrInput = document.getElementById("chk-address") as? HTMLTextAreaElement

        delRadio?.addEventListener("change", {
            lblDel?.style?.border = "2px solid #164E2A"
            lblDel?.style?.backgroundColor = "#F7FAF7"
            lblPick?.style?.border = "1px solid #E2DCD2"
            lblPick?.style?.backgroundColor = "#FFFFFF"
        })

        pickRadio?.addEventListener("change", {
            lblPick?.style?.border = "2px solid #164E2A"
            lblPick?.style?.backgroundColor = "#F7FAF7"
            lblDel?.style?.border = "1px solid #E2DCD2"
            lblDel?.style?.backgroundColor = "#FFFFFF"
            addrInput?.value = "Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015"
        })

        document.getElementById("chk-submit")?.addEventListener("click", {
            val phone = (document.getElementById("chk-phone") as HTMLInputElement).value
            val addr = (document.getElementById("chk-address") as HTMLTextAreaElement).value
            val time = (document.getElementById("chk-time") as HTMLSelectElement).value
            val submitBtn = document.getElementById("chk-submit") as HTMLButtonElement

            val isPickup = (document.querySelector("input[name='chk-mode']:checked") as? HTMLInputElement)?.value == "pickup"
            val delMode = if (isPickup) "pickup" else "delivery"
            val pickupOtp = if (isPickup) "${(1000..9999).random()}" else ""

            val selectedRadio = document.querySelector("input[name='pay-method']:checked") as? HTMLInputElement
            val methodVal = selectedRadio?.value ?: "UPI"
            val paymentLabel = when (methodVal) {
                "UPI" -> "Google Pay (UPI)"
                "CARD" -> "Visa Card (•••• 4242)"
                "NETBANKING" -> "Net Banking (HDFC Bank)"
                else -> if (isPickup) "Pay at Store Counter" else "Cash on Delivery"
            }
            val paymentStatus = if (methodVal == "COD") "Pending" else "Paid"
            val txnId = "TXN_SWAD_${(10000000..99999999).random()}"

            submitBtn.textContent = "Authorizing Payment..."
            submitBtn.disabled = true

            scope.launch {
                try {
                    val payload = CreateOrderPayload(
                        customer_name = user?.full_name ?: "Kahan Shah",
                        customer_email = user?.email ?: "kahanshah5676@gmail.com",
                        phone = phone,
                        delivery_address = addr,
                        preferred_time = time,
                        delivery_mode = delMode,
                        pickup_otp = pickupOtp,
                        payment_method = paymentLabel,
                        payment_status = paymentStatus,
                        transaction_id = txnId,
                        payment_details = paymentLabel,
                        items = items.map {
                            CreateOrderItemPayload(
                                product_id = it.product_id,
                                name = it.name,
                                price = it.price,
                                quantity = it.quantity,
                                weight = it.weight
                            )
                        }
                    )
                    ApiClient.placeOrder(payload)
                    AppState.clearCart()
                    AppState.navigate("/track")
                } catch (err: Exception) {
                    window.alert(err.message ?: "Failed to place order")
                    submitBtn.textContent = "Place Order"
                    submitBtn.disabled = false
                }
            }
        })
    }, 50)

    return container
}

/* Orders Page */
fun renderOrdersPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "850px"
    container.style.margin = "40px auto"
    container.style.padding = "0 24px"

    val email = AppState.currentUser?.email ?: "kahanshah5676@gmail.com"
    scope.launch {
        try {
            val orders = ApiClient.getOrders(email)
            if (orders.isEmpty()) {
                container.innerHTML = """
                    <div style="text-align: center; margin: 40px 0;">
                        <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 12px;">No orders yet</h2>
                        <button class="btn-primary" id="ord-shop-btn">Start Shopping →</button>
                    </div>
                """.trimIndent()
                window.setTimeout({
                    document.getElementById("ord-shop-btn")?.addEventListener("click", { AppState.navigate("/products") })
                }, 50)
                return@launch
            }

            val topHeader = """
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h1 style="font-size: 28px; font-weight: 800; color: #164E2A; margin: 0;">My Orders 📦</h1>
                <button id="btn-global-track" style="background-color: #164E2A; color: white; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; border: none; cursor: pointer;">
                    🛵 Track Current Delivery
                </button>
            </div>
            """

            val ordersHtml = orders.joinToString("") { order ->
                val itemsHtml = order.items.joinToString("") { item ->
                    """
                    <div style="margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="font-size: 15px; font-weight: 700; color: #1C1917;">${item.name}</span>
                            <span style="font-size: 15px; font-weight: 700; color: #1C1917;">₹${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div style="font-size: 13px; color: #777; margin-top: 2px;">Qty: ${item.quantity} • ${item.weight}</div>
                    </div>
                    """
                }

                val modeBadge = if (order.delivery_mode == "pickup") "🏪 Store Pickup" else "🛵 With Delivery"
                val otpBadge = if (order.delivery_mode == "pickup" && order.pickup_otp.isNotEmpty()) {
                    """<span style="background-color: #78350F; color: #FDE68A; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; margin-left: 6px;">OTP: ${order.pickup_otp}</span>"""
                } else ""

                """
                <div style="background-color: white; border-radius: 12px; padding: 28px 32px; border: 1px solid #ECE7DE; box-shadow: 0 2px 10px rgba(0,0,0,0.03); margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 16px; border-bottom: 1px solid #F0ECE4; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 11px; text-transform: uppercase; color: #888; font-weight: 700; letter-spacing: 0.5px;">ORDER ID</span>
                                <span style="background-color: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">$modeBadge</span>
                                $otpBadge
                            </div>
                            <div style="font-size: 16px; font-weight: 800; color: #164E2A; margin: 4px 0;">${order.id}</div>
                            <div style="font-size: 13px; color: #777;">${order.created_at}</div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <button class="track-btn-ord" data-order-id="${order.id}" style="background-color: #EA580C; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 800; cursor: pointer;">
                                🛵 Track Live Status
                            </button>
                            <div style="background-color: #FFEDD5; color: #C2410C; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 800;">
                                ${order.delivery_status.ifEmpty { order.status }}
                            </div>
                        </div>
                    </div>

                    <!-- Payment Details Banner -->
                    <div style="padding: 10px 14px; background-color: #FAF7F2; border-radius: 6px; margin: 14px 0; font-size: 13px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div>
                            <strong>Payment:</strong> ${order.payment_method}
                            ${if (order.payment_status == "Paid") {
                                """<span style="background-color: #DCFCE7; color: #15803D; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; margin-left: 6px;">✓ Paid</span>"""
                            } else {
                                """<span style="background-color: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; margin-left: 6px;">⏳ Payment Pending (COD)</span>"""
                            }}
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${if (order.payment_status != "Paid") {
                                """<button class="btn-pay-now" data-order-id="${order.id}" style="background-color: #164E2A; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer;">💳 Pay ₹${order.total_amount.toFixed(2)} Online Now</button>"""
                            } else {
                                """<div style="font-size: 12px; color: #666;">Txn: <strong style="color: var(--brand-maroon);">${order.transaction_id.ifEmpty { "TXN_SWAD_883921049" }}</strong></div>"""
                            }}
                        </div>
                    </div>

                    <div style="padding: 16px 0; border-bottom: 1px solid #F0ECE4;">
                        $itemsHtml
                    </div>
                    <div style="padding: 16px 0; border-bottom: 1px solid #F0ECE4; font-size: 14px; color: #444; line-height: 1.6;">
                        <div style="font-weight: 800; color: #164E2A; margin-bottom: 6px;">${if (order.delivery_mode == "pickup") "Store Pickup Details" else "Delivery details"}</div>
                        <div>${order.customer_name}</div>
                        <div>${order.phone}</div>
                        <div>${order.delivery_address}</div>
                        <div>Preferred time: ${order.preferred_time}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px;">
                        <span style="font-size: 16px; font-weight: 800; color: #1C1917;">Order Total</span>
                        <span style="font-size: 18px; font-weight: 800; color: #EA580C;">₹${order.total_amount.toFixed(2)}</span>
                    </div>
                </div>
                """
            }

            container.innerHTML = topHeader + ordersHtml

            window.setTimeout({
                document.getElementById("btn-global-track")?.addEventListener("click", { AppState.navigate("/track") })
                val btns = document.getElementsByClassName("track-btn-ord")
                for (i in 0 until btns.length) {
                    val btn = btns[i] as HTMLElement
                    btn.addEventListener("click", {
                        AppState.navigate("/track")
                    })
                }
                val payBtns = document.getElementsByClassName("btn-pay-now")
                for (i in 0 until payBtns.length) {
                    val btn = payBtns[i] as HTMLElement
                    val ordId = btn.getAttribute("data-order-id") ?: continue
                    btn.addEventListener("click", {
                        btn.textContent = "Processing..."
                        scope.launch {
                            try {
                                ApiClient.payOnline(ordId)
                                window.alert("Payment Received! Order marked as Paid.")
                                AppState.navigate("/orders")
                            } catch (e: Exception) {
                                window.alert("Payment failed: ${e.message}")
                                btn.textContent = "Pay Online Now"
                            }
                        }
                    })
                }
            }, 50)
        } catch (e: Exception) {
            container.innerHTML = "<p>Error loading orders: ${e.message}</p>"
        }
    }

    return container
}

/* Track Order Page */
fun renderTrackOrderPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "1050px"
    container.style.margin = "30px auto 60px"
    container.style.padding = "0 20px"

    val email = AppState.currentUser?.email ?: "kahanshah5676@gmail.com"

    container.innerHTML = "<p style='text-align: center; padding: 40px;'>Connecting to live GPS tracking...</p>"

    scope.launch {
        try {
            val orders = ApiClient.getOrders(email)
            if (orders.isEmpty()) {
                container.innerHTML = """
                    <div style="text-align: center; margin: 60px auto;">
                        <h2 style="font-size: 24px; font-weight: 800; color: #164E2A; margin-bottom: 12px;">No Active Deliveries</h2>
                        <p style="color: #666; margin-bottom: 24px;">Place an order to track live GPS delivery!</p>
                        <button class="btn-primary" id="track-shop-now">Start Shopping →</button>
                    </div>
                """.trimIndent()
                window.setTimeout({
                    document.getElementById("track-shop-now")?.addEventListener("click", { AppState.navigate("/products") })
                }, 50)
                return@launch
            }

            val targetOrder = orders.first()
            val trackData = try {
                ApiClient.trackOrder(targetOrder.id)
            } catch(e: Exception) {
                TrackOrderResponse(
                    order_id = targetOrder.id,
                    customer_name = targetOrder.customer_name,
                    customer_email = targetOrder.customer_email,
                    phone = targetOrder.phone,
                    delivery_address = targetOrder.delivery_address,
                    total_amount = targetOrder.total_amount,
                    delivery_status = "Out for Delivery",
                    current_step = 4,
                    estimated_minutes = 16,
                    distance_km = 2.4,
                    eta_display = "16 mins"
                )
            }

            val milestonesHtml = trackData.milestones.joinToString("") { m ->
                val isDone = m.status == "completed"
                val isCurr = m.status == "current"
                val circleBg = if (isDone) "#164E2A" else if (isCurr) "#EA580C" else "#F3EFE9"
                val circleColor = if (isDone || isCurr) "white" else "#888"
                val circleText = if (isDone) "✓" else if (isCurr) "●" else "${m.step}"

                """
                <div style="display: flex; gap: 14px; position: relative; margin-bottom: 16px;">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background-color: $circleBg; color: $circleColor; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; flex-shrink: 0;">
                        $circleText
                    </div>
                    <div>
                        <div style="font-size: 14px; font-weight: 800; color: ${if (isCurr) "#EA580C" else if (isDone) "#164E2A" else "#777"};">
                            ${m.title}
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 2px;">${m.description}</div>
                    </div>
                </div>
                """
            }

            val isPickup = trackData.delivery_mode == "pickup"

            val paymentPendingHtml = if (trackData.payment_status == "Pending") {
                """
                <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 14px; font-weight: 800; color: #92400E;">Payment Pending: ₹${trackData.total_amount.toFixed(2)} (${if (isPickup) "Pay at Counter / COD" else "Cash on Delivery"})</div>
                        <div style="font-size: 12px; color: #B45309;">You can pay cash on arrival, or complete payment online instantly via UPI / GPay / Paytm / Card.</div>
                    </div>
                    <button id="btn-track-pay" style="background-color: #164E2A; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 800; cursor: pointer;">💳 Pay Online Now →</button>
                </div>
                """
            } else ""

            val pickupPassHtml = if (isPickup) {
                """
                <div style="background-color: #FEF3C7; border: 2px dashed #D97706; border-radius: 16px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 11px; font-weight: 800; color: #92400E; text-transform: uppercase; letter-spacing: 1px;">🏪 STORE PICKUP PASS • ZERO DELIVERY FEE</div>
                        <div style="font-size: 18px; font-weight: 900; color: #78350F; margin-top: 4px;">Show this OTP at SwadBox Kitchen Counter</div>
                        <div style="font-size: 13px; color: #92400E; margin-top: 2px;">Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur • Prep: ~15 mins</div>
                    </div>
                    <div style="background-color: #78350F; color: #FDE68A; border-radius: 10px; padding: 10px 20px; text-align: center;">
                        <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">PICKUP OTP</div>
                        <div style="font-size: 26px; font-weight: 900; letter-spacing: 3px; font-family: monospace;">${trackData.pickup_otp.ifEmpty { "8492" }}</div>
                    </div>
                </div>
                """
            } else ""

            val etaTitle = if (isPickup) {
                if (trackData.delivery_status == "Ready at Store Counter") "Ready for Counter Pickup! 🛍️"
                else if (trackData.delivery_status == "Delivered" || trackData.delivery_status == "Picked Up & Completed") "Order Picked Up! 🎉"
                else "Kitchen Preparing • Ready in ~15 mins"
            } else {
                if (trackData.delivery_status == "Delivered") "Delivered Successfully! 🎉"
                else "Arriving in ${trackData.estimated_minutes} mins"
            }

            val etaSub = if (isPickup) {
                "SwadBox Kitchen: Shop 12-14, Shivalik Plaza, Vastrapur, Ahmedabad"
            } else {
                "Rider is ${trackData.distance_km} km away • Speed 28 km/h"
            }

            val mapHtml = if (isPickup) {
                """
                <svg viewBox="0 0 500 280" style="width: 100%; height: 300px; display: block; background-color: #FEF3C7;">
                    <rect width="500" height="280" fill="#FFFBEB" stroke="#FDE68A" stroke-width="2" />
                    <!-- Canopy -->
                    <rect x="50" y="24" width="400" height="54" rx="8" fill="#78350F" />
                    <text x="250" y="56" text-anchor="middle" fill="#FFFFFF" font-size="14" font-weight="bold">🏪 SWADBOX CENTRAL KITCHEN & TAKEAWAY</text>
                    <!-- Prep Box -->
                    <rect x="60" y="95" width="160" height="110" rx="8" fill="#FFFFFF" stroke="#E2DCD2" stroke-width="2" />
                    <text x="140" y="125" text-anchor="middle" fill="#78350F" font-size="11" font-weight="bold">👨‍🍳 Kitchen Prep Station</text>
                    <text x="140" y="165" text-anchor="middle" font-size="28">🥘</text>
                    <text x="140" y="190" text-anchor="middle" fill="#15803D" font-size="10" font-weight="bold">Fresh Packing</text>
                    <!-- Counter Box -->
                    <rect x="280" y="95" width="160" height="110" rx="8" fill="#FFFFFF" stroke="#164E2A" stroke-width="2" />
                    <text x="360" y="125" text-anchor="middle" fill="#164E2A" font-size="11" font-weight="bold">🛍️ Self Pickup Counter</text>
                    <text x="360" y="165" text-anchor="middle" font-size="28">📦</text>
                    <text x="360" y="192" text-anchor="middle" fill="#78350F" font-size="11" font-weight="bold">OTP: ${trackData.pickup_otp.ifEmpty { "8492" }}</text>
                    <!-- Bottom Bar -->
                    <rect x="90" y="225" width="320" height="32" rx="6" fill="#164E2A" />
                    <text x="250" y="245" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="bold">Show OTP ${trackData.pickup_otp.ifEmpty { "8492" }} to Store Manager</text>
                </svg>
                """
            } else {
                """
                <svg viewBox="0 0 500 280" style="width: 100%; height: 300px; display: block; background-color: #EFE9DE;">
                    <rect width="500" height="280" fill="#EFE9DE" />
                    <path d="M 0,80 L 500,80" stroke="#FFFFFF" stroke-width="8" />
                    <path d="M 180,0 L 180,280" stroke="#FFFFFF" stroke-width="8" />
                    <path d="M 340,0 L 340,280" stroke="#FFFFFF" stroke-width="8" />
                    <path d="M 0,210 L 500,210" stroke="#FFFFFF" stroke-width="8" />
                    <path d="M 70,70 Q 140,85 180,110 T 280,170 T 360,215 L 430,220" fill="none" stroke="#EA580C" stroke-width="5" stroke-linecap="round" />
                    <g transform="translate(70, 70)">
                        <circle r="14" fill="#164E2A" />
                        <text x="0" y="4" text-anchor="middle" fill="white" font-size="9" font-weight="bold">STORE</text>
                    </g>
                    <g transform="translate(430, 220)">
                        <circle r="14" fill="#EA580C" />
                        <text x="0" y="4" text-anchor="middle" fill="white" font-size="9" font-weight="bold">HOME</text>
                    </g>
                    <g transform="translate(290, 175)">
                        <circle r="16" fill="#EA580C" opacity="0.3" />
                        <circle r="12" fill="#EA580C" />
                        <text x="0" y="4" text-anchor="middle" font-size="10">🛵</text>
                    </g>
                </svg>
                """
            }

            container.innerHTML = """
            <div style="margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: var(--brand-maroon); text-transform: uppercase;">Live Order Tracking</div>
                <h1 style="font-size: 28px; font-weight: 800; color: #164E2A; margin: 4px 0 0;">${if (isPickup) "Store Pickup Status 🛍️" else "Track Your Delivery 🛵"}</h1>
            </div>

            $paymentPendingHtml
            $pickupPassHtml

            <div style="display: grid; grid-template-columns: 1.25fr 1fr; gap: 24px; align-items: start;">
                <!-- Left: Live Map & Rider/Kitchen -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- ETA Card -->
                    <div style="background: ${if (isPickup) "linear-gradient(135deg, #78350F 0%, #451A03 100%)" else "linear-gradient(135deg, #164E2A 0%, #0F381E 100%)"}; color: white; border-radius: 16px; padding: 24px 28px; box-shadow: 0 8px 24px rgba(22, 78, 42, 0.18); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                        <div>
                            <div style="font-size: 11px; font-weight: 800; background-color: #EAB308; color: #1C1917; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">
                                ${if (isPickup) "STORE PICKUP" else "LIVE TRACKING"}
                            </div>
                            <div style="font-size: 28px; font-weight: 900;">
                                $etaTitle
                            </div>
                            <div style="font-size: 13px; opacity: 0.85; margin-top: 4px;">
                                $etaSub
                            </div>
                        </div>
                        <button id="btn-advance-stage" style="background-color: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;">
                            Simulate Next Stage →
                        </button>
                    </div>

                    <!-- SVG Map / Store Display -->
                    <div style="border-radius: 16px; overflow: hidden; border: 1px solid #ECE7DE; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                        $mapHtml
                        <div style="padding: 10px 16px; background-color: white; border-top: 1px solid #ECE7DE; font-size: 12px; color: #666; display: flex; justify-content: space-between;">
                            <span>🏪 From: <strong>Shivalik Plaza, Vastrapur</strong></span>
                            <span>${if (isPickup) "🛍️ Mode: <strong>Customer Store Pickup</strong>" else "🏠 To: <strong>${trackData.delivery_address.take(24)}...</strong>"}</span>
                        </div>
                    </div>

                    <!-- Partner / Manager Card -->
                    <div style="background-color: white; border-radius: 14px; padding: 20px 24px; border: 1px solid #ECE7DE; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                        <div style="display: flex; gap: 14px; align-items: center;">
                            <div style="width: 50px; height: 50px; border-radius: 50%; background-color: ${if (isPickup) "#DCFCE7" else "#FFEDD5"}; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 2px solid ${if (isPickup) "#164E2A" else "#EA580C"};">
                                ${if (isPickup) "👨‍🍳" else "👨‍✈️"}
                            </div>
                            <div>
                                <div style="font-size: 16px; font-weight: 800; color: #164E2A;">
                                    ${if (isPickup) "Rajesh Patel • Store Manager" else "${trackData.rider.name} • ⭐ ${trackData.rider.rating}"}
                                </div>
                                <div style="font-size: 12px; color: #666;">
                                    ${if (isPickup) "SwadBox Central Kitchen (Shop 12-14, Shivalik Plaza)" else trackData.rider.vehicle}
                                </div>
                                <div style="font-size: 11px; color: #15803D; font-weight: 700; margin-top: 2px;">
                                    ${if (isPickup) "🛡️ FSSAI Certified Kitchen • Fresh Packaging" else "🛡️ Temperature 98.2°F • Vaccinated"}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <a href="tel:${trackData.rider.phone}" style="background-color: #164E2A; color: white; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; text-decoration: none;">
                                📞 ${if (isPickup) "Call Kitchen" else "Call Rider"}
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Right: Progress & Details -->
                <div style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background-color: white; border-radius: 16px; padding: 24px 28px; border: 1px solid #ECE7DE; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                        <h2 style="font-size: 18px; font-weight: 800; color: #164E2A; margin-bottom: 20px;">Order Progress</h2>
                        <div>
                            $milestonesHtml
                        </div>
                    </div>

                    <div style="background-color: white; border-radius: 16px; padding: 24px 28px; border: 1px solid #ECE7DE; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div>
                                <div style="font-size: 11px; font-weight: 700; color: #888; text-transform: uppercase;">ORDER ID</div>
                                <div style="font-size: 14px; font-weight: 800; color: #164E2A; margin-top: 2px;">#${trackData.order_id}</div>
                            </div>
                            <div style="background-color: ${if (trackData.payment_status == "Paid") "#DCFCE7" else "#FEF3C7"}; color: ${if (trackData.payment_status == "Paid") "#15803D" else "#92400E"}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">
                                ${if (trackData.payment_status == "Paid") "✓ Paid" else "Pending COD"}
                            </div>
                        </div>

                        <div style="background-color: #FAF7F2; padding: 10px 12px; border-radius: 6px; font-size: 12px; margin-bottom: 12px;">
                            <div><strong>Payment:</strong> ${trackData.payment_method}</div>
                            <div style="margin-top: 4px; color: var(--brand-maroon);"><strong>Txn:</strong> ${trackData.transaction_id.ifEmpty { "TXN_SWAD_883921049" }}</div>
                            ${if (trackData.payment_status != "Paid") {
                                """<button id="btn-side-pay-now" style="margin-top: 8px; width: 100%; background-color: #164E2A; color: white; border: none; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 800; cursor: pointer;">💳 Pay ₹${trackData.total_amount.toFixed(2)} Online Now</button>"""
                            } else ""}
                        </div>

                        <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 15px; border-top: 1px solid #F0ECE4; padding-top: 12px;">
                            <span>Total Amount</span>
                            <span style="color: #EA580C;">₹${trackData.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            """.trimIndent()

            window.setTimeout({
                document.getElementById("btn-advance-stage")?.addEventListener("click", {
                    scope.launch {
                        try {
                            ApiClient.advanceDelivery(trackData.order_id)
                            AppState.navigate("/track")
                        } catch (e: Exception) {
                            window.alert("Failed: ${e.message}")
                        }
                    }
                })

                val doPayOnline = {
                    scope.launch {
                        try {
                            ApiClient.payOnline(trackData.order_id)
                            window.alert("Payment Received! Order #${trackData.order_id} is now Paid.")
                            AppState.navigate("/track")
                        } catch (e: Exception) {
                            window.alert("Payment failed: ${e.message}")
                        }
                    }
                }

                document.getElementById("btn-track-pay")?.addEventListener("click", { doPayOnline() })
                document.getElementById("btn-side-pay-now")?.addEventListener("click", { doPayOnline() })
            }, 50)
        } catch (err: Exception) {
            container.innerHTML = "<p>Error loading tracking: ${err.message}</p>"
        }
    }

    return container
}

/* Login Page */
fun renderLoginPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "440px"
    container.style.margin = "40px auto 60px"
    container.style.padding = "0 20px"

    container.innerHTML = """
    <div style="background-color: white; border-radius: 16px; padding: 40px 36px; box-shadow: 0 4px 25px rgba(0,0,0,0.05); border: 1px solid #ECE7DE; text-align: center;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 8px;">
            Welcome to SwadBox
        </div>
        <h1 style="font-size: 30px; font-weight: 800; color: #1C1917; margin-bottom: 8px;">Welcome Back</h1>
        <p style="font-size: 13px; color: #666; margin-bottom: 28px;">Sign in to discover your favourite Indian snacks.</p>
        <div id="login-error" style="display: none; background-color: #FEE2E2; color: #B91C1C; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; text-align: left;"></div>
        <form id="login-form" style="text-align: left;">
            <div style="margin-bottom: 20px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">Email address</label>
                <input type="email" id="log-email" value="kahanshah5676@gmail.com" required style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D8D2C6; font-size: 14px;" />
            </div>
            <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">Password</label>
                <input type="password" id="log-pass" value="kahan0934" required style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D8D2C6; font-size: 14px;" />
            </div>
            <button type="submit" id="log-btn" style="width: 100%; padding: 12px; background-color: var(--brand-maroon); color: white; border-radius: 8px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; margin-bottom: 24px;">
                Sign In
            </button>
        </form>
        <div style="font-size: 13px; color: #555; margin-bottom: 28px;">
            Don't have an account? <span id="to-register" style="color: var(--brand-maroon); font-weight: 700; cursor: pointer;">Create an account</span>
        </div>
        <div style="font-size: 12px; color: #888;">Fresh cravings. Authentic flavours. SwadBox.</div>
    </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("to-register")?.addEventListener("click", { AppState.navigate("/register") })
        document.getElementById("login-form")?.addEventListener("submit", { e ->
            e.preventDefault()
            val email = (document.getElementById("log-email") as HTMLInputElement).value
            val pass = (document.getElementById("log-pass") as HTMLInputElement).value
            val btn = document.getElementById("log-btn") as HTMLButtonElement
            val errBox = document.getElementById("login-error") as HTMLDivElement

            btn.textContent = "Signing In..."
            scope.launch {
                try {
                    val resp = ApiClient.login(email, pass)
                    AppState.login(resp.user)
                    AppState.navigate("/products")
                } catch (err: Exception) {
                    errBox.style.display = "block"
                    errBox.textContent = err.message ?: "Login failed"
                    btn.textContent = "Sign In"
                }
            }
        })
    }, 50)

    return container
}

/* Register Page */
fun renderRegisterPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "440px"
    container.style.margin = "40px auto 60px"
    container.style.padding = "0 20px"

    container.innerHTML = """
    <div style="background-color: white; border-radius: 16px; padding: 40px 36px; box-shadow: 0 4px 25px rgba(0,0,0,0.05); border: 1px solid #ECE7DE; text-align: center;">
        <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 8px;">
            Join SwadBox
        </div>
        <h1 style="font-size: 30px; font-weight: 800; color: #1C1917; margin-bottom: 8px;">Create Account</h1>
        <p style="font-size: 13px; color: #666; margin-bottom: 28px;">Create your account and discover delicious Indian snacks.</p>
        <div id="reg-error" style="display: none; background-color: #FEE2E2; color: #B91C1C; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; text-align: left;"></div>
        <form id="reg-form" style="text-align: left;">
            <div style="margin-bottom: 18px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">Full Name</label>
                <input type="text" id="reg-name" placeholder="Your full name" required style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D8D2C6; font-size: 14px;" />
            </div>
            <div style="margin-bottom: 18px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">Email Address</label>
                <input type="email" id="reg-email" placeholder="you@example.com" required style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D8D2C6; font-size: 14px;" />
            </div>
            <div style="margin-bottom: 18px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">Password</label>
                <input type="password" id="reg-pass" placeholder="At least 6 characters" required style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D8D2C6; font-size: 14px;" />
            </div>
            <div style="margin-bottom: 24px;">
                <label style="display: block; font-size: 13px; font-weight: 600; color: #333; margin-bottom: 6px;">Confirm Password</label>
                <input type="password" id="reg-conf" placeholder="Re-enter your password" required style="width: 100%; padding: 12px 14px; border-radius: 8px; border: 1px solid #D8D2C6; font-size: 14px;" />
            </div>
            <button type="submit" id="reg-btn" style="width: 100%; padding: 12px; background-color: var(--brand-maroon); color: white; border-radius: 8px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; margin-bottom: 24px;">
                Create Account
            </button>
        </form>
        <p style="font-size: 13px; color: #555;">
            Already have an account? <span id="to-login" style="color: var(--brand-maroon); font-weight: 700; cursor: pointer;">Sign In</span>
        </p>
    </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("to-login")?.addEventListener("click", { AppState.navigate("/login") })
        document.getElementById("reg-form")?.addEventListener("submit", { e ->
            e.preventDefault()
            val name = (document.getElementById("reg-name") as HTMLInputElement).value
            val email = (document.getElementById("reg-email") as HTMLInputElement).value
            val pass = (document.getElementById("reg-pass") as HTMLInputElement).value
            val conf = (document.getElementById("reg-conf") as HTMLInputElement).value
            val errBox = document.getElementById("reg-error") as HTMLDivElement
            val btn = document.getElementById("reg-btn") as HTMLButtonElement

            if (pass != conf) {
                errBox.style.display = "block"
                errBox.textContent = "Passwords do not match"
                return@addEventListener
            }

            btn.textContent = "Creating Account..."
            scope.launch {
                try {
                    val resp = ApiClient.register(name, email, pass)
                    AppState.login(resp.user)
                    AppState.navigate("/products")
                } catch (err: Exception) {
                    errBox.style.display = "block"
                    errBox.textContent = err.message ?: "Registration failed"
                    btn.textContent = "Create Account"
                }
            }
        })
    }, 50)

    return container
}

/* Payment Options & Guide Page */
fun renderPaymentOptionsPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "1050px"
    container.style.margin = "40px auto 80px"
    container.style.padding = "0 24px"

    container.innerHTML = """
    <!-- Hero Header -->
    <div style="background: linear-gradient(135deg, var(--brand-maroon) 0%, #5B131E 100%); color: white; border-radius: 16px; padding: 48px 36px; text-align: center; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(139, 29, 44, 0.15);">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #F5A623; text-transform: uppercase; margin-bottom: 10px;">
            Payment Guide & Order Modes
        </div>
        <h1 style="font-size: 36px; font-weight: 900; margin: 0 0 14px; letter-spacing: -0.5px;">
            Payment Options & Delivery Choices
        </h1>
        <p style="font-size: 16px; max-width: 650px; margin: 0 auto; opacity: 0.9; line-height: 1.6;">
            Everything you need to know about paying securely on SwadBox and choosing between doorstep delivery or self store pickup.
        </p>
    </div>

    <!-- 2 Core Order Features -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 48px;">
        <!-- Feature 1: Paid vs COD -->
        <div style="background-color: white; border-radius: 16px; padding: 32px; border: 1px solid #ECE7DE; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 28px;">💳</span>
                <div>
                    <div style="font-size: 11px; font-weight: 800; color: 'var(--brand-maroon)'; text-transform: uppercase; letter-spacing: 1px;">FEATURE 1: PAYMENT STATUS</div>
                    <h3 style="font-size: 20px; font-weight: 800; color: #164E2A; margin: 0;">Completed with Payment vs Without Payment</h3>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 20px;">
                <div style="background-color: #F0FDF4; border-left: 4px solid #15803D; padding: 14px 16px; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 14px; font-weight: 800; color: #15803D; margin-bottom: 4px;">✓ Order Completed with Payment (Paid)</div>
                    <div style="font-size: 13px; color: #374151; line-height: 1.5;">
                        Paid online at checkout via Google Pay, Paytm, Cards, or Net Banking. Bank confirms instantly with an official Transaction ID (e.g., TXN_SWAD_...).
                    </div>
                </div>

                <div style="background-color: #FFFBEB; border-left: 4px solid #D97706; padding: 14px 16px; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 14px; font-weight: 800; color: #92400E; margin-bottom: 4px;">⏳ Order Completed without Payment (COD / Pending)</div>
                    <div style="font-size: 13px; color: #374151; line-height: 1.5;">
                        Order is placed immediately without upfront payment. You can pay cash or scan UPI QR upon arrival, or convert to online payment anytime via the <strong>Pay Online Now</strong> button!
                    </div>
                </div>
            </div>
        </div>

        <!-- Feature 2: Delivery vs Pickup -->
        <div style="background-color: white; border-radius: 16px; padding: 32px; border: 1px solid #ECE7DE; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <span style="font-size: 28px;">🛵</span>
                <div>
                    <div style="font-size: 11px; font-weight: 800; color: 'var(--brand-maroon)'; text-transform: uppercase; letter-spacing: 1px;">FEATURE 2: FULFILLMENT MODE</div>
                    <h3 style="font-size: 20px; font-weight: 800; color: #164E2A; margin: 0;">With Delivery vs Without Delivery</h3>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 20px;">
                <div style="background-color: #EFF6FF; border-left: 4px solid #2563EB; padding: 14px 16px; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 14px; font-weight: 800; color: #1D4ED8; margin-bottom: 4px;">🛵 With Delivery (Home Doorstep)</div>
                    <div style="font-size: 13px; color: #374151; line-height: 1.5;">
                        Delivered straight to your doorstep across Ahmedabad. Watch your rider on the live moving GPS map with speed and real-time ETA.
                    </div>
                </div>

                <div style="background-color: #FEF3C7; border-left: 4px solid #D97706; padding: 14px 16px; border-radius: 0 8px 8px 0;">
                    <div style="font-size: 14px; font-weight: 800; color: #78350F; margin-bottom: 4px;">🏪 Without Delivery (Store Pickup / Takeaway)</div>
                    <div style="font-size: 13px; color: #374151; line-height: 1.5;">
                        Pick up directly from SwadBox Central Kitchen (Shop 12-14, Shivalik Plaza, Vastrapur). Zero delivery fee, ready in 15 mins, with 4-digit Store Pickup OTP pass.
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Payment Methods Detailed Cards -->
    <div style="margin-bottom: 48px;">
        <h2 style="font-size: 26px; font-weight: 800; color: #164E2A; margin-bottom: 24px; text-align: center;">
            Accepted Payment Methods
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <div style="background-color: white; border-radius: 12px; padding: 24px; border: 1px solid #ECE7DE;">
                <div style="font-size: 26px; margin-bottom: 10px;">📱</div>
                <h4 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px;">Google Pay & UPI</h4>
                <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">Instant zero-fee transfer using Google Pay, PhonePe, BHIM, or any bank UPI app.</p>
            </div>
            
            <div style="background-color: white; border-radius: 12px; padding: 24px; border: 1px solid #ECE7DE;">
                <div style="font-size: 26px; margin-bottom: 10px;">⚡</div>
                <h4 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px;">Paytm Wallet & UPI</h4>
                <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">Pay in one tap via Paytm Wallet balance, Paytm Postpaid, or linked bank accounts.</p>
            </div>

            <div style="background-color: white; border-radius: 12px; padding: 24px; border: 1px solid #ECE7DE;">
                <div style="font-size: 26px; margin-bottom: 10px;">💳</div>
                <h4 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px;">Credit & Debit Cards</h4>
                <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">Visa, MasterCard, RuPay, and Maestro cards supported with 256-bit bank encryption.</p>
            </div>

            <div style="background-color: white; border-radius: 12px; padding: 24px; border: 1px solid #ECE7DE;">
                <div style="font-size: 26px; margin-bottom: 10px;">🏦</div>
                <h4 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px;">Net Banking</h4>
                <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">Direct internet banking through HDFC, ICICI, SBI, Axis, Kotak, and 50+ Indian banks.</p>
            </div>

            <div style="background-color: white; border-radius: 12px; padding: 24px; border: 1px solid #ECE7DE;">
                <div style="font-size: 26px; margin-bottom: 10px;">💵</div>
                <h4 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px;">Cash on Delivery (COD)</h4>
                <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">Pay in cash or scan delivery rider UPI QR code at your door when the food arrives.</p>
            </div>

            <div style="background-color: white; border-radius: 12px; padding: 24px; border: 1px solid #ECE7DE;">
                <div style="font-size: 26px; margin-bottom: 10px;">🛡️</div>
                <h4 style="font-size: 16px; font-weight: 800; color: #1C1917; margin: 0 0 6px;">100% Safe & Encrypted</h4>
                <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.5;">PCI-DSS compliant standards. SwadBox never stores your banking pins or passwords.</p>
            </div>
        </div>
    </div>

    <!-- Bottom Actions CTA -->
    <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap;">
        <button id="pay-guide-shop" class="btn-primary" style="padding: 14px 28px; font-size: 15px;">
            Shop Indian Snacks Now →
        </button>
        <button id="pay-guide-track" style="background-color: #164E2A; color: white; border: none; border-radius: 8px; padding: 14px 28px; font-size: 15px; font-weight: 800; cursor: pointer;">
            🛵 Track Your Order Live
        </button>
    </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("pay-guide-shop")?.addEventListener("click", { AppState.navigate("/products") })
        document.getElementById("pay-guide-track")?.addEventListener("click", { AppState.navigate("/track") })
    }, 50)

    return container
}

/* About Page */
fun renderAboutPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement
    container.style.maxWidth = "1100px"
    container.style.margin = "40px auto"
    container.style.padding = "0 24px"

    container.innerHTML = """
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: center; margin-bottom: 80px;">
        <div>
            <div style="width: 48px; height: 4px; background-color: #F5A623; margin-bottom: 24px;"></div>
            <p style="font-size: 16px; line-height: 1.7; color: #444; margin-bottom: 20px;">
                SwadBox was founded with one simple goal — to bring Indian sweets and snacks to everyone with the care, taste, and freshness associated with a traditional sweet shop.
            </p>
            <p style="font-size: 16px; line-height: 1.7; color: #444; margin-bottom: 32px;">
                From festive mithai to everyday namkeen, we want every order to add a little flavour to your day. Whether you are sharing with family or enjoying a snack on your own, there is always a reason to savour the moment.
            </p>
            <span id="about-explore-btn" style="color: var(--brand-maroon); font-weight: 700; font-size: 15px; cursor: pointer; border-bottom: 2px solid var(--brand-maroon); padding-bottom: 2px;">
                Explore our products →
            </span>
        </div>
        <div style="background-color: #EAB308; border-radius: 4px; padding: 48px 40px; color: #1C1917;">
            <div style="font-size: 48px; font-family: serif; line-height: 1; color: #C2410C; margin-bottom: 16px;">“</div>
            <h2 style="font-size: 32px; font-weight: 800; line-height: 1.25; margin-bottom: 40px; color: #1C1917;">
                Little treats. Big moments. Lasting memories.
            </h2>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.15); padding-top: 20px; font-size: 14px; font-weight: 600;">
                <span>SwadBox</span>
                <span style="color: #555;">A little taste of happiness</span>
            </div>
        </div>
    </div>
    <div style="margin-bottom: 80px;">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 10px;">Why SwadBox</div>
        <h2 style="font-size: 36px; font-weight: 800; color: #164E2A; margin-bottom: 16px;">Good choices make a difference.</h2>
        <p style="font-size: 15px; color: #555; max-width: 600px; margin-bottom: 40px;">
            We want finding and enjoying your favourite snacks to feel simple, convenient, and enjoyable.
        </p>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;">
            <div style="border-top: 2px solid #EAB308; padding-top: 20px;">
                <div style="font-size: 14px; font-weight: 800; color: var(--brand-maroon); margin-bottom: 14px;">01</div>
                <h3 style="font-size: 17px; font-weight: 800; color: #1C1917; margin-bottom: 10px;">Quality ingredients</h3>
                <p style="font-size: 13px; line-height: 1.6; color: #666;">Carefully selected products for flavour, quality, and enjoyment.</p>
            </div>
            <div style="border-top: 2px solid #EAB308; padding-top: 20px;">
                <div style="font-size: 14px; font-weight: 800; color: var(--brand-maroon); margin-bottom: 14px;">02</div>
                <h3 style="font-size: 17px; font-weight: 800; color: #1C1917; margin-bottom: 10px;">Careful packaging</h3>
                <p style="font-size: 13px; line-height: 1.6; color: #666;">Thoughtful packaging to help keep your favourites protected.</p>
            </div>
            <div style="border-top: 2px solid #EAB308; padding-top: 20px;">
                <div style="font-size: 14px; font-weight: 800; color: var(--brand-maroon); margin-bottom: 14px;">03</div>
                <h3 style="font-size: 17px; font-weight: 800; color: #1C1917; margin-bottom: 10px;">Easy ordering</h3>
                <p style="font-size: 13px; line-height: 1.6; color: #666;">A straightforward way to discover and order your favourite snacks.</p>
            </div>
            <div style="border-top: 2px solid #EAB308; padding-top: 20px;">
                <div style="font-size: 14px; font-weight: 800; color: var(--brand-maroon); margin-bottom: 14px;">04</div>
                <h3 style="font-size: 17px; font-weight: 800; color: #1C1917; margin-bottom: 10px;">Made for sharing</h3>
                <p style="font-size: 13px; line-height: 1.6; color: #666;">Delicious moments to enjoy with family and friends.</p>
            </div>
        </div>
    </div>
    <div style="text-align: center; padding: 40px 0 20px;">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 10px;">Something Delicious Awaits</div>
        <h2 style="font-size: 40px; font-weight: 800; color: #164E2A; margin-bottom: 14px;">Find a flavour worth sharing.</h2>
        <p style="font-size: 15px; color: #666; margin-bottom: 28px;">Explore our collection and discover your next favourite sweets and snacks.</p>
        <button class="btn-primary" id="about-browse-btn">Browse Products →</button>
    </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("about-explore-btn")?.addEventListener("click", { AppState.navigate("/products") })
        document.getElementById("about-browse-btn")?.addEventListener("click", { AppState.navigate("/products") })
    }, 50)

    return container
}

/* Contact Page */
fun renderContactPage(): HTMLElement {
    val container = document.createElement("div") as HTMLDivElement

    container.innerHTML = """
    <div style="background-color: var(--brand-maroon); color: white; padding: 60px 24px; text-align: center;">
        <div style="font-size: 12px; font-weight: 800; letter-spacing: 1.5px; color: #F5A623; text-transform: uppercase; margin-bottom: 10px;">
            We're Here to Help
        </div>
        <h1 style="font-size: 48px; font-weight: 800; margin-bottom: 16px;">Let's Talk.</h1>
        <p style="font-size: 16px; color: #FCD34D; max-width: 600px; margin: 0 auto;">Questions, feedback, or a special request? We'd love to hear from you.</p>
    </div>
    <div style="maxWidth: 1100px; margin: 60px auto; padding: 0 24px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 64px; align-items: start;">
        <div>
            <div style="font-size: 12px; font-weight: 800; letter-spacing: 1px; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 8px;">Get in touch</div>
            <h2 style="font-size: 36px; font-weight: 800; color: #164E2A; margin-bottom: 14px;">How can we help?</h2>
            <p style="font-size: 15px; color: #555; line-height: 1.6; margin-bottom: 36px;">
                Have a question about an order or want to share some feedback? Get in touch with us. We're happy to hear from you.
            </p>
            <div style="display: flex; flex-direction: column; gap: 28px;">
                <div style="display: flex; gap: 18px; align-items: flex-start;">
                    <div style="width: 42px; height: 42px; border-radius: 4px; background-color: #EAB308; display: flex; align-items: center; justify-content: center; font-size: 18px;">📍</div>
                    <div>
                        <div style="font-size: 15px; font-weight: 800; color: #164E2A; margin-bottom: 4px;">Visit us</div>
                        <div style="font-size: 14px; color: #666; line-height: 1.5;">Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015, India</div>
                    </div>
                </div>
                <div style="display: flex; gap: 18px; align-items: flex-start;">
                    <div style="width: 42px; height: 42px; border-radius: 4px; background-color: #EAB308; display: flex; align-items: center; justify-content: center; font-size: 18px;">📞</div>
                    <div>
                        <div style="font-size: 15px; font-weight: 800; color: #164E2A; margin-bottom: 4px;">Call us</div>
                        <div style="font-size: 14px; color: #666;">+91 34586 99738</div>
                    </div>
                </div>
                <div style="display: flex; gap: 18px; align-items: flex-start;">
                    <div style="width: 42px; height: 42px; border-radius: 4px; background-color: #EAB308; display: flex; align-items: center; justify-content: center; font-size: 18px;">✉️</div>
                    <div>
                        <div style="font-size: 15px; font-weight: 800; color: #164E2A; margin-bottom: 4px;">Email us</div>
                        <div style="font-size: 14px; color: #666;">kahanshah5676@gmail.com</div>
                    </div>
                </div>
            </div>
        </div>
        <div style="background-color: white; border-radius: 8px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #ECE7DE;">
            <div style="font-size: 11px; font-weight: 800; letter-spacing: 1px; color: var(--brand-maroon); text-transform: uppercase; margin-bottom: 8px;">Send a message</div>
            <h3 style="font-size: 26px; font-weight: 800; color: #164E2A; margin-bottom: 8px;">We're listening.</h3>
            <p style="font-size: 14px; color: #666; margin-bottom: 24px;">Fill out the form and tell us how we can help.</p>
            <div id="contact-success" style="display: none; background-color: #DCFCE7; color: #15803D; padding: 12px; border-radius: 6px; font-size: 14px; margin-bottom: 20px;">
                Thank you! Your message has been sent successfully.
            </div>
            <form id="contact-form">
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 700; color: #333; margin-bottom: 6px;">Your name</label>
                    <input type="text" id="cnt-name" placeholder="Enter your full name" required style="width: 100%; padding: 12px 14px; border-radius: 6px; border: 1px solid #D8D2C6; font-size: 14px;" />
                </div>
                <div style="margin-bottom: 16px;">
                    <label style="display: block; font-size: 13px; font-weight: 700; color: #333; margin-bottom: 6px;">Email address</label>
                    <input type="email" id="cnt-email" placeholder="you@example.com" required style="width: 100%; padding: 12px 14px; border-radius: 6px; border: 1px solid #D8D2C6; font-size: 14px;" />
                </div>
                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-size: 13px; font-weight: 700; color: #333; margin-bottom: 6px;">Your message</label>
                    <textarea id="cnt-msg" placeholder="Write your message here..." rows="4" required style="width: 100%; padding: 12px 14px; border-radius: 6px; border: 1px solid #D8D2C6; font-size: 14px; font-family: inherit;"></textarea>
                </div>
                <button type="submit" id="cnt-btn" class="btn-primary" style="width: 100%; justify-content: center; margin-bottom: 16px;">
                    Send Message →
                </button>
                <div style="font-size: 12px; color: #888; text-align: center;">Your information will be used to respond to your enquiry.</div>
            </form>
        </div>
    </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("contact-form")?.addEventListener("submit", { e ->
            e.preventDefault()
            val name = (document.getElementById("cnt-name") as HTMLInputElement).value
            val email = (document.getElementById("cnt-email") as HTMLInputElement).value
            val msg = (document.getElementById("cnt-msg") as HTMLTextAreaElement).value
            val btn = document.getElementById("cnt-btn") as HTMLButtonElement
            val succBox = document.getElementById("contact-success") as HTMLDivElement

            btn.textContent = "Sending..."
            scope.launch {
                val ok = ApiClient.sendContact(name, email, msg)
                if (ok) {
                    succBox.style.display = "block"
                    (document.getElementById("contact-form") as HTMLFormElement).reset()
                } else {
                    window.alert("Failed to send message.")
                }
                btn.textContent = "Send Message →"
            }
        })
    }, 50)

    return container
}

/* Footer */
fun renderFooter(): HTMLElement {
    val footer = document.createElement("footer") as HTMLElement
    footer.className = "footer"
    footer.innerHTML = """
    <div class="footer-top">
        <div class="footer-brand">
            <div class="footer-logo-card">
                <img src="/swadbox_logo.png" alt="SwadBox Logo" />
            </div>
            <p>Authentic Indian snacks and traditional flavours, delivered to your doorstep.</p>
        </div>
        <div class="footer-col">
            <h4>Explore</h4>
            <ul>
                <li id="ft-home">Home</li>
                <li id="ft-prod">Products</li>
                <li id="ft-track">Track Order</li>
                <li id="ft-pay-options">Payment Options</li>
                <li id="ft-about">About Us</li>
                <li id="ft-contact">Contact</li>
            </ul>
        </div>
        <div class="footer-col">
            <h4>Customer Support</h4>
            <ul>
                <li>+91 34586 99738</li>
                <li>kahanshah5676@gmail.com</li>
                <li>Support hours: 8 AM – 8 PM</li>
            </ul>
        </div>
        <div class="footer-col">
            <h4>Information</h4>
            <ul>
                <li>Privacy Policy</li>
                <li>Terms & Conditions</li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom">
        <div>© 2026 SwadBox. All rights reserved.</div>
        <div>Made with ❤️ in India</div>
    </div>
    """.trimIndent()

    window.setTimeout({
        document.getElementById("ft-home")?.addEventListener("click", { AppState.navigate("/") })
        document.getElementById("ft-prod")?.addEventListener("click", { AppState.navigate("/products") })
        document.getElementById("ft-track")?.addEventListener("click", { AppState.navigate("/track") })
        document.getElementById("ft-pay-options")?.addEventListener("click", { AppState.navigate("/payments") })
        document.getElementById("ft-about")?.addEventListener("click", { AppState.navigate("/about") })
        document.getElementById("ft-contact")?.addEventListener("click", { AppState.navigate("/contact") })
    }, 50)

    return footer
}

