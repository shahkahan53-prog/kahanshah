package com.swadbox.state

import com.swadbox.models.CartItem
import com.swadbox.models.Product
import com.swadbox.models.User
import kotlinx.browser.localStorage
import kotlinx.browser.window
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

object AppState {
    private val json = Json { ignoreUnknownKeys = true }

    var currentUser: User? = null
        private set

    var cartItems: MutableList<CartItem> = mutableListOf()
        private set

    var currentPath: String = window.location.pathname.ifEmpty { "/" }

    var toastMessage: String? = null

    private var listeners = mutableListOf<() -> Unit>()

    init {
        // Restore user
        val savedUser = localStorage.getItem("swadbox_user")
        if (!savedUser.isNullOrEmpty()) {
            try {
                currentUser = json.decodeFromString<User>(savedUser)
            } catch (e: Exception) {
                localStorage.removeItem("swadbox_user")
            }
        }

        // Restore cart
        val savedCart = localStorage.getItem("swadbox_cart")
        if (!savedCart.isNullOrEmpty()) {
            try {
                val list = json.decodeFromString<List<CartItem>>(savedCart)
                cartItems.addAll(list)
            } catch (e: Exception) {
                localStorage.removeItem("swadbox_cart")
            }
        }
    }

    fun subscribe(listener: () -> Unit) {
        listeners.add(listener)
    }

    private fun notify() {
        listeners.forEach { it() }
    }

    fun navigate(path: String) {
        if (window.location.pathname != path) {
            window.history.pushState(null, "", path)
        }
        currentPath = path
        window.scrollTo(0.0, 0.0)
        notify()
    }

    fun login(user: User) {
        currentUser = user
        localStorage.setItem("swadbox_user", json.encodeToString(user))
        notify()
    }

    fun logout() {
        currentUser = null
        localStorage.removeItem("swadbox_user")
        navigate("/")
    }

    fun addToCart(product: Product) {
        val existing = cartItems.find { it.product_id == product.id }
        if (existing != null) {
            existing.quantity += 1
        } else {
            cartItems.add(
                CartItem(
                    product_id = product.id,
                    name = product.name,
                    price = product.price,
                    weight = product.weight,
                    image_url = product.image_url,
                    quantity = 1
                )
            )
        }
        saveCart()
        notify()
    }

    fun updateQuantity(productId: Int, newQty: Int) {
        if (newQty <= 0) {
            cartItems.removeAll { it.product_id == productId }
        } else {
            cartItems.find { it.product_id == productId }?.quantity = newQty
        }
        saveCart()
        notify()
    }

    fun removeFromCart(productId: Int) {
        cartItems.removeAll { it.product_id == productId }
        saveCart()
        notify()
    }

    fun clearCart() {
        cartItems.clear()
        saveCart()
        notify()
    }

    private fun saveCart() {
        localStorage.setItem("swadbox_cart", json.encodeToString(cartItems.toList()))
    }

    fun showToast(message: String) {
        toastMessage = message
        notify()
        window.setTimeout({
            toastMessage = null
            notify()
        }, 3500)
    }
}

