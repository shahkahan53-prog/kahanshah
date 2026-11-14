package com.swadbox.models

import kotlinx.serialization.Serializable

@Serializable
data class Product(
    val id: Int,
    val name: String,
    val price: Double,
    val weight: String,
    val category: String,
    var stock: Int,
    val image_url: String
)

@Serializable
data class CartItem(
    val product_id: Int,
    val name: String,
    val price: Double,
    val weight: String,
    val image_url: String,
    var quantity: Int
)

@Serializable
data class User(
    val id: Int,
    val full_name: String,
    val email: String
)

@Serializable
data class OrderItem(
    val name: String,
    val price: Double,
    val quantity: Int,
    val weight: String = "500 g"
)

@Serializable
data class Order(
    val id: String,
    val user_id: Int? = null,
    val customer_name: String,
    val customer_email: String,
    val phone: String,
    val delivery_address: String,
    val preferred_time: String,
    val total_amount: Double,
    val status: String = "Placed",
    val delivery_mode: String = "delivery",
    val pickup_otp: String = "",
    val payment_method: String = "Google Pay (UPI)",
    val payment_status: String = "Paid",
    val transaction_id: String = "",
    val delivery_status: String = "Order Placed",
    val estimated_minutes: Int = 22,
    val distance_km: Double = 3.2,
    val created_at: String = "",
    val items: List<OrderItem> = emptyList()
)

@Serializable
data class CreateOrderPayload(
    val customer_name: String,
    val customer_email: String,
    val phone: String,
    val delivery_address: String,
    val preferred_time: String,
    val delivery_mode: String = "delivery",
    val pickup_otp: String = "",
    val payment_method: String = "Google Pay (UPI)",
    val payment_status: String = "Paid",
    val transaction_id: String = "",
    val payment_details: String = "",
    val items: List<CreateOrderItemPayload>
)

@Serializable
data class CreateOrderItemPayload(
    val product_id: Int,
    val name: String,
    val price: Double,
    val quantity: Int,
    val weight: String
)

@Serializable
data class Milestone(
    val step: Int,
    val title: String,
    val description: String,
    val status: String,
    val time: String
)

@Serializable
data class RiderInfo(
    val name: String = "Ramesh Patel",
    val phone: String = "+91 98251 44321",
    val vehicle: String = "GJ-01-ET-4829 (Hero Splendor)",
    val rating: Double = 4.9,
    val speed: String = "28 km/h"
)

@Serializable
data class TrackOrderResponse(
    val order_id: String,
    val customer_name: String,
    val customer_email: String,
    val phone: String,
    val delivery_address: String,
    val total_amount: Double,
    val delivery_mode: String = "delivery",
    val pickup_otp: String = "",
    val payment_method: String = "Google Pay (UPI)",
    val payment_status: String = "Paid",
    val transaction_id: String = "",
    val delivery_status: String = "Order Placed",
    val current_step: Int = 1,
    val total_steps: Int = 5,
    val estimated_minutes: Int = 22,
    val distance_km: Double = 3.2,
    val eta_display: String = "22 mins",
    val rider: RiderInfo = RiderInfo(),
    val milestones: List<Milestone> = emptyList(),
    val items: List<OrderItem> = emptyList()
)

@Serializable
data class PaymentProcessPayload(
    val order_amount: Double,
    val payment_method: String,
    val provider: String = "Google Pay",
    val upi_id: String? = null,
    val card_number: String? = null,
    val card_name: String? = null
)

@Serializable
data class PaymentProcessResponse(
    val success: Boolean,
    val transaction_id: String,
    val payment_status: String,
    val payment_method: String,
    val provider: String,
    val masked_detail: String
)

@Serializable
data class ContactMessage(
    val name: String,
    val email: String,
    val message: String
)

@Serializable
data class AuthResponse(
    val success: Boolean,
    val token: String,
    val user: User
)

@Serializable
data class ApiError(
    val detail: String
)

