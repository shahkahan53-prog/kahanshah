package com.swadbox.api

import com.swadbox.models.*
import kotlinx.browser.window
import kotlinx.coroutines.await
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.w3c.fetch.RequestInit
import org.w3c.fetch.Response
import kotlin.js.json

object ApiClient {
    private val jsonConfig = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private const val BASE_URL = "/api"

    suspend fun getProducts(): List<Product> {
        val response = window.fetch("$BASE_URL/products").await()
        if (!response.ok) throw Exception("Failed to load products: ${response.statusText}")
        val text = response.text().await()
        return jsonConfig.decodeFromString(text)
    }

    suspend fun login(email: String, pass: String): AuthResponse {
        val payload = json("email" to email, "password" to pass)
        val opts = RequestInit(
            method = "POST",
            headers = json("Content-Type" to "application/json"),
            body = JSON.stringify(payload)
        )
        val response = window.fetch("$BASE_URL/auth/login", opts).await()
        val text = response.text().await()
        if (!response.ok) {
            val err = try { jsonConfig.decodeFromString<ApiError>(text).detail } catch(e: Exception) { "Login failed" }
            throw Exception(err)
        }
        return jsonConfig.decodeFromString(text)
    }

    suspend fun register(fullName: String, email: String, pass: String): AuthResponse {
        val payload = json("full_name" to fullName, "email" to email, "password" to pass)
        val opts = RequestInit(
            method = "POST",
            headers = json("Content-Type" to "application/json"),
            body = JSON.stringify(payload)
        )
        val response = window.fetch("$BASE_URL/auth/register", opts).await()
        val text = response.text().await()
        if (!response.ok) {
            val err = try { jsonConfig.decodeFromString<ApiError>(text).detail } catch(e: Exception) { "Registration failed" }
            throw Exception(err)
        }
        return jsonConfig.decodeFromString(text)
    }

    suspend fun placeOrder(order: CreateOrderPayload): String {
        val bodyStr = jsonConfig.encodeToString(order)
        val opts = RequestInit(
            method = "POST",
            headers = json("Content-Type" to "application/json"),
            body = bodyStr
        )
        val response = window.fetch("$BASE_URL/orders", opts).await()
        val text = response.text().await()
        if (!response.ok) {
            val err = try { jsonConfig.decodeFromString<ApiError>(text).detail } catch(e: Exception) { "Failed to place order" }
            throw Exception(err)
        }
        return text
    }

    suspend fun getOrders(email: String): List<Order> {
        val url = "$BASE_URL/orders?email=${encodeURIComponent(email)}"
        val response = window.fetch(url).await()
        val text = response.text().await()
        if (!response.ok) return emptyList()
        return jsonConfig.decodeFromString(text)
    }

    suspend fun processPayment(payload: PaymentProcessPayload): PaymentProcessResponse {
        val bodyStr = jsonConfig.encodeToString(payload)
        val opts = RequestInit(
            method = "POST",
            headers = json("Content-Type" to "application/json"),
            body = bodyStr
        )
        val response = window.fetch("$BASE_URL/payment/process", opts).await()
        val text = response.text().await()
        if (!response.ok) throw Exception("Payment failed")
        return jsonConfig.decodeFromString(text)
    }

    suspend fun trackOrder(orderId: String): TrackOrderResponse {
        val response = window.fetch("$BASE_URL/orders/$orderId/track").await()
        val text = response.text().await()
        if (!response.ok) throw Exception("Failed to track order: ${response.statusText}")
        return jsonConfig.decodeFromString(text)
    }

    suspend fun advanceDelivery(orderId: String): String {
        val opts = RequestInit(method = "POST")
        val response = window.fetch("$BASE_URL/orders/$orderId/advance-delivery", opts).await()
        return response.text().await()
    }

    suspend fun payOnline(orderId: String, method: String = "Google Pay (UPI)", provider: String = "Google Pay"): String {
        val payload = json("payment_method" to method, "provider" to provider)
        val opts = RequestInit(
            method = "POST",
            headers = json("Content-Type" to "application/json"),
            body = JSON.stringify(payload)
        )
        val response = window.fetch("$BASE_URL/orders/$orderId/pay-online", opts).await()
        return response.text().await()
    }

    suspend fun clearMenuCache(): Boolean {
        val opts = RequestInit(method = "POST")
        val response = window.fetch("/admin/cache/clear", opts).await()
        return response.ok
    }

    suspend fun sendContact(name: String, email: String, message: String): Boolean {
        val payload = json("name" to name, "email" to email, "message" to message)
        val opts = RequestInit(
            method = "POST",
            headers = json("Content-Type" to "application/json"),
            body = JSON.stringify(payload)
        )
        val response = window.fetch("$BASE_URL/contact", opts).await()
        return response.ok
    }
}

external fun encodeURIComponent(uri: String): String

