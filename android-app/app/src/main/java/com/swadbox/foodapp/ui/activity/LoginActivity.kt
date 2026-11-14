package com.swadbox.foodapp.ui.activity

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.swadbox.foodapp.R
import com.swadbox.foodapp.ui.viewmodel.AuthViewModel

class LoginActivity : AppCompatActivity() {

    private val authViewModel: AuthViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val emailInput = findViewById<EditText>(R.id.et_email)
        val passwordInput = findViewById<EditText>(R.id.et_password)
        val btnLogin = findViewById<Button>(R.id.btn_login)
        val tvSignup = findViewById<TextView>(R.id.tv_go_signup)

        // Pre-fill default account
        emailInput.setText("kahanshah5676@gmail.com")
        passwordInput.setText("kahan0934")

        authViewModel.authState.observe(this) { result ->
            result.onSuccess {
                Toast.makeText(this, "Welcome, ${it.user.fullName}!", Toast.LENGTH_SHORT).show()
                startActivity(Intent(this, MainActivity::class.java))
                finish()
            }.onFailure {
                Toast.makeText(this, it.message ?: "Login failed", Toast.LENGTH_LONG).show()
            }
        }

        btnLogin.setOnClickListener {
            val email = emailInput.text.toString().trim()
            val pass = passwordInput.text.toString().trim()
            if (email.isNotEmpty() && pass.isNotEmpty()) {
                authViewModel.login(email, pass)
            } else {
                Toast.makeText(this, "Please enter email and password", Toast.LENGTH_SHORT).show()
            }
        }

        tvSignup.setOnClickListener {
            startActivity(Intent(this, SignupActivity::class.java))
        }
    }
}
