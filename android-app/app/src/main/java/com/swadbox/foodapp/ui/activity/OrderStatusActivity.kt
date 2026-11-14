package com.swadbox.foodapp.ui.activity

import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import com.swadbox.foodapp.R
import com.swadbox.foodapp.ui.viewmodel.OrderViewModel

class OrderStatusActivity : AppCompatActivity() {

    private val orderViewModel: OrderViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_order_status)

        val orderId = intent.getStringExtra("ORDER_ID") ?: "sbx_delivery_paid"

        val tvOrderId = findViewById<TextView>(R.id.tv_order_id)
        val tvStatus = findViewById<TextView>(R.id.tv_order_status)
        val tvEta = findViewById<TextView>(R.id.tv_order_eta)
        val tvPayment = findViewById<TextView>(R.id.tv_order_payment)
        val tvMode = findViewById<TextView>(R.id.tv_order_mode)
        val tvOtp = findViewById<TextView>(R.id.tv_pickup_otp)
        val layoutOtp = findViewById<View>(R.id.layout_pickup_otp_card)
        val btnRefresh = findViewById<Button>(R.id.btn_refresh_status)
        val btnBackHome = findViewById<Button>(R.id.btn_back_home)

        orderViewModel.orderStatus.observe(this) { status ->
            status?.let {
                tvOrderId.text = "Order #${it.orderId}"
                tvStatus.text = it.deliveryStatus.ifEmpty { it.status }
                tvPayment.text = "${it.paymentMethod} (${if (it.paymentStatus == "Paid") "✓ Paid" else "⏳ Pending"})"
                
                if (it.deliveryMode == "pickup") {
                    tvMode.text = "🏪 Store Pickup (Self Takeaway)"
                    tvEta.text = "Ready for pickup in ~15 mins"
                    layoutOtp.visibility = View.VISIBLE
                    tvOtp.text = "OTP: ${it.pickupOtp.ifEmpty { "8492" }}"
                } else {
                    tvMode.text = "🛵 Home Doorstep Delivery"
                    tvEta.text = "Arriving in ${it.estimatedMinutes} mins"
                    layoutOtp.visibility = View.GONE
                }
            }
        }

        btnRefresh.setOnClickListener {
            orderViewModel.fetchOrderStatus(orderId)
            Toast.makeText(this, "Refreshed live status!", Toast.LENGTH_SHORT).show()
        }

        btnBackHome.setOnClickListener {
            finish()
        }

        // Initial fetch
        orderViewModel.fetchOrderStatus(orderId)
    }
}
