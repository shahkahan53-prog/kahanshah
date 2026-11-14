package com.swadbox.foodapp.data.api

import com.swadbox.foodapp.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface FoodApiService {

    // Auth endpoints (JWT)
    @POST("auth/signup")
    suspend fun signup(@Body req: SignupRequest): Response<AuthResponse>

    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): Response<AuthResponse>

    // Menu endpoints (Redis cached with 5-minute TTL)
    @GET("menu")
    suspend fun getMenu(): Response<List<MenuItem>>

    @GET("menu/{id}")
    suspend fun getMenuItem(@Path("id") id: Int): Response<MenuItem>

    // Admin menu update (invalidates Redis cache)
    @POST("admin/menu")
    suspend fun updateMenuItem(@Body item: MenuItem): Response<Map<String, Any>>

    // Order endpoints
    @POST("orders")
    suspend fun placeOrder(@Body req: CreateOrderRequest): Response<CreateOrderResponse>

    @GET("orders/{id}")
    suspend fun getOrderStatus(@Path("id") id: String): Response<OrderStatusResponse>
}
