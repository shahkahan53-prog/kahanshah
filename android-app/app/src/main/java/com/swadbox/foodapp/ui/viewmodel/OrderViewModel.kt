package com.swadbox.foodapp.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.swadbox.foodapp.data.model.OrderStatusResponse
import com.swadbox.foodapp.data.repository.FoodRepository
import kotlinx.coroutines.launch

class OrderViewModel(private val repository: FoodRepository = FoodRepository()) : ViewModel() {

    private val _orderStatus = MutableLiveData<OrderStatusResponse?>()
    val orderStatus: LiveData<OrderStatusResponse?> = _orderStatus

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>(null)
    val error: LiveData<String?> = _error

    fun fetchOrderStatus(orderId: String) {
        _loading.value = true
        _error.value = null
        viewModelScope.launch {
            val result = repository.getOrderStatus(orderId)
            _loading.value = false
            result.onSuccess {
                _orderStatus.value = it
            }.onFailure {
                _error.value = it.message ?: "Could not fetch order status"
            }
        }
    }
}
