package com.swadbox.foodapp.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.swadbox.foodapp.data.model.*
import com.swadbox.foodapp.data.repository.FoodRepository
import kotlinx.coroutines.launch

class CartViewModel(private val repository: FoodRepository = FoodRepository()) : ViewModel() {

    companion object {
        // Shared in-memory cart state across screens
        val cartItems = MutableLiveData<List<CartItem>>(emptyList())
    }

    private val _orderResult = MutableLiveData<Result<CreateOrderResponse>?>()
    val orderResult: LiveData<Result<CreateOrderResponse>?> = _orderResult

    private val _isOrdering = MutableLiveData(false)
    val isOrdering: LiveData<Boolean> = _isOrdering

    fun addToCart(item: MenuItem) {
        val current = cartItems.value.orEmpty().toMutableList()
        val index = current.indexOfFirst { it.menuItem.id == item.id }
        if (index >= 0) {
            val existing = current[index]
            current[index] = existing.copy(quantity = existing.quantity + 1)
        } else {
            current.add(CartItem(menuItem = item, quantity = 1))
        }
        cartItems.value = current
    }

    fun updateQuantity(productId: Int, newQty: Int) {
        val current = cartItems.value.orEmpty().toMutableList()
        if (newQty <= 0) {
            current.removeAll { it.menuItem.id == productId }
        } else {
            val index = current.indexOfFirst { it.menuItem.id == productId }
            if (index >= 0) {
                current[index] = current[index].copy(quantity = newQty)
            }
        }
        cartItems.value = current
    }

    fun getTotalAmount(): Double {
        return cartItems.value.orEmpty().sumOf { it.total }
    }

    fun clearCart() {
        cartItems.value = emptyList()
    }

    fun placeOrder(
        customerName: String,
        customerEmail: String,
        phone: String,
        address: String,
        preferredTime: String,
        deliveryMode: String = "delivery",
        paymentMethod: String = "Google Pay (UPI)"
    ) {
        val items = cartItems.value.orEmpty().map {
            OrderItemInput(
                productId = it.menuItem.id,
                name = it.menuItem.name,
                price = it.menuItem.price,
                quantity = it.quantity,
                weight = it.menuItem.weight
            )
        }

        if (items.isEmpty()) return

        val isCOD = paymentMethod.contains("Cash", ignoreCase = true)
        val paymentStatus = if (isCOD) "Pending" else "Paid"
        val txnId = if (isCOD) "" else "TXN_SWAD_${(10000000..99999999).random()}"

        val req = CreateOrderRequest(
            customerName = customerName,
            customerEmail = customerEmail,
            phone = phone,
            deliveryAddress = address,
            preferredTime = preferredTime,
            items = items,
            paymentMethod = paymentMethod,
            paymentStatus = paymentStatus,
            transactionId = txnId,
            deliveryMode = deliveryMode
        )

        _isOrdering.value = true
        viewModelScope.launch {
            val res = repository.placeOrder(req)
            _isOrdering.value = false
            _orderResult.value = res
            if (res.isSuccess) {
                clearCart()
            }
        }
    }
}
