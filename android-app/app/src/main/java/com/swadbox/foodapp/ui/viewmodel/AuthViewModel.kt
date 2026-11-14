package com.swadbox.foodapp.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.swadbox.foodapp.data.model.AuthResponse
import com.swadbox.foodapp.data.repository.FoodRepository
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: FoodRepository = FoodRepository()) : ViewModel() {

    private val _authState = MutableLiveData<Result<AuthResponse>>()
    val authState: LiveData<Result<AuthResponse>> = _authState

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    fun login(email: String, pass: String) {
        _loading.value = true
        viewModelScope.launch {
            val result = repository.login(email, pass)
            _loading.value = false
            _authState.value = result
        }
    }

    fun signup(fullName: String, email: String, pass: String) {
        _loading.value = true
        viewModelScope.launch {
            val result = repository.signup(fullName, email, pass)
            _loading.value = false
            _authState.value = result
        }
    }
}
