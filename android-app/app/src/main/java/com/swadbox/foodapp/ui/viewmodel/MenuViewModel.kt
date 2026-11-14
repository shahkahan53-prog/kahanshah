package com.swadbox.foodapp.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.swadbox.foodapp.data.model.MenuItem
import com.swadbox.foodapp.data.repository.FoodRepository
import kotlinx.coroutines.launch

class MenuViewModel(private val repository: FoodRepository = FoodRepository()) : ViewModel() {

    private val _menuItems = MutableLiveData<List<MenuItem>>(emptyList())
    val menuItems: LiveData<List<MenuItem>> = _menuItems

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>(null)
    val error: LiveData<String?> = _error

    fun fetchMenu() {
        _loading.value = true
        _error.value = null
        viewModelScope.launch {
            val result = repository.getMenu()
            _loading.value = false
            result.onSuccess { items ->
                _menuItems.value = items
            }.onFailure { ex ->
                _error.value = ex.message ?: "Failed to load menu"
            }
        }
    }
}
