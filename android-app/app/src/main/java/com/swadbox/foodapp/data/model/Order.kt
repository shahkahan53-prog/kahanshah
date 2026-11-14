package com.swadbox.foodapp.data.model

import com.google.gson.annotations.SerializedName

data class OrderItemInput(
    @SerializedName("product_id") val productId: Int,
    @SerializedName("name") val name: String,
    @SerializedName("price") val price: Double,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("weight") val weight: String
)

data class CreateOrderRequest(
    @SerializedName("customer_name") val customerName: String,
    @SerializedName("customer_email") val customerEmail: String,
    @SerializedName("phone") val phone: String,
    @SerializedName("delivery_address") val deliveryAddress: String,
    @SerializedName("preferred_time") val preferredTime: String,
    @SerializedName("items") val items: List<OrderItemInput>,
    @SerializedName("payment_method") val paymentMethod: String = "Google Pay (UPI)",
    @SerializedName("payment_status") val paymentStatus: String = "Paid",
    @SerializedName("transaction_id") val transactionId: String = "",
    @SerializedName("delivery_mode") val deliveryMode: String = "delivery",
    @SerializedName("pickup_otp") val pickupOtp: String = ""
)

data class CreateOrderResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("order_id") val orderId: String,
    @SerializedName("message") val message: String,
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("payment_status") val paymentStatus: String,
    @SerializedName("delivery_mode") val deliveryMode: String,
    @SerializedName("pickup_otp") val pickupOtp: String
)

data class OrderStatusResponse(
    @SerializedName("order_id") val orderId: String,
    @SerializedName("customer_name") val customerName: String,
    @SerializedName("customer_email") val customerEmail: String,
    @SerializedName("phone") val phone: String,
    @SerializedName("delivery_address") val deliveryAddress: String,
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("status") val status: String,
    @SerializedName("delivery_status") val deliveryStatus: String,
    @SerializedName("delivery_mode") val deliveryMode: String,
    @SerializedName("pickup_otp") val pickupOtp: String,
    @SerializedName("payment_method") val paymentMethod: String,
    @SerializedName("payment_status") val paymentStatus: String,
    @SerializedName("transaction_id") val transactionId: String,
    @SerializedName("estimated_minutes") val estimatedMinutes: Int,
    @SerializedName("created_at") val createdAt: String
)
