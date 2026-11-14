package com.swadbox.foodapp.data.repository

import com.swadbox.foodapp.data.api.FoodApiService
import com.swadbox.foodapp.data.api.RetrofitClient
import com.swadbox.foodapp.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class FoodRepository(private val api: FoodApiService = RetrofitClient.apiService) {

    suspend fun signup(fullName: String, email: String, pass: String): Result<AuthResponse> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.signup(SignupRequest(fullName, email, pass))
                if (res.isSuccessful && res.body() != null) {
                    val body = res.body()!!
                    RetrofitClient.setAuthToken(body.token)
                    Result.success(body)
                } else {
                    Result.failure(Exception(res.errorBody()?.string() ?: "Signup failed"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun login(email: String, pass: String): Result<AuthResponse> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.login(LoginRequest(email, pass))
                if (res.isSuccessful && res.body() != null) {
                    val body = res.body()!!
                    RetrofitClient.setAuthToken(body.token)
                    Result.success(body)
                } else {
                    Result.failure(Exception(res.errorBody()?.string() ?: "Login failed"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getMenu(): Result<List<MenuItem>> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getMenu()
                if (res.isSuccessful && res.body() != null) {
                    Result.success(res.body()!!)
                } else {
                    Result.failure(Exception(res.errorBody()?.string() ?: "Failed to fetch menu"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getMenuItem(id: Int): Result<MenuItem> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getMenuItem(id)
                if (res.isSuccessful && res.body() != null) {
                    Result.success(res.body()!!)
                } else {
                    Result.failure(Exception("Item not found"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun placeOrder(req: CreateOrderRequest): Result<CreateOrderResponse> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.placeOrder(req)
                if (res.isSuccessful && res.body() != null) {
                    Result.success(res.body()!!)
                } else {
                    Result.failure(Exception(res.errorBody()?.string() ?: "Order placement failed"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun getOrderStatus(orderId: String): Result<OrderStatusResponse> =
        withContext(Dispatchers.IO) {
            try {
                val res = api.getOrderStatus(orderId)
                if (res.isSuccessful && res.body() != null) {
                    Result.success(res.body()!!)
                } else {
                    Result.failure(Exception("Failed to fetch order status"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
}
