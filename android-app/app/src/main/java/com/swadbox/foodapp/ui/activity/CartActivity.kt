package com.swadbox.foodapp.ui.activity

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.swadbox.foodapp.R
import com.swadbox.foodapp.data.model.CartItem
import com.swadbox.foodapp.ui.viewmodel.CartViewModel

class CartActivity : AppCompatActivity() {

    private val cartViewModel: CartViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_cart)

        val rvCart = findViewById<RecyclerView>(R.id.rv_cart_items)
        val tvTotal = findViewById<TextView>(R.id.tv_total_price)
        val rgDeliveryMode = findViewById<RadioGroup>(R.id.rg_delivery_mode)
        val etAddress = findViewById<EditText>(R.id.et_delivery_address)
        val etPhone = findViewById<EditText>(R.id.et_phone)
        val spPayment = findViewById<Spinner>(R.id.sp_payment_method)
        val btnPlaceOrder = findViewById<Button>(R.id.btn_place_order)

        rvCart.layoutManager = LinearLayoutManager(this)

        // Pre-fill defaults
        etAddress.setText("Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015")
        etPhone.setText("3458699738")

        // Payment options adapter
        val paymentOptions = arrayOf("Google Pay (UPI)", "Paytm (Wallet & UPI)", "Credit / Debit Card", "Cash on Delivery (COD)")
        spPayment.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, paymentOptions)

        // Delivery Mode toggle handler
        rgDeliveryMode.setOnCheckedChangeListener { _, checkedId ->
            if (checkedId == R.id.rb_pickup) {
                etAddress.setText("Store Pickup: Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad")
                Toast.makeText(this, "Store Pickup selected (₹0 delivery fee, 15 min prep)", Toast.LENGTH_SHORT).show()
            } else {
                etAddress.setText("Shop 12-14, Shivalik Plaza, Near IIM Ahmedabad, Vastrapur, Ahmedabad, Gujarat 380015")
            }
        }

        CartViewModel.cartItems.observe(this) { items ->
            rvCart.adapter = CartAdapter(items)
            val total = items.sumOf { it.total }
            tvTotal.text = "₹${total.toInt()}"
            btnPlaceOrder.isEnabled = items.isNotEmpty()
        }

        cartViewModel.orderResult.observe(this) { res ->
            res?.onSuccess { response ->
                Toast.makeText(this, "Order Placed Successfully! ID: ${response.orderId}", Toast.LENGTH_LONG).show()
                val intent = Intent(this, OrderStatusActivity::class.java).apply {
                    putExtra("ORDER_ID", response.orderId)
                }
                startActivity(intent)
                finish()
            }?.onFailure { ex ->
                Toast.makeText(this, ex.message ?: "Failed to place order", Toast.LENGTH_LONG).show()
            }
        }

        btnPlaceOrder.setOnClickListener {
            val isPickup = rgDeliveryMode.checkedRadioButtonId == R.id.rb_pickup
            val deliveryMode = if (isPickup) "pickup" else "delivery"
            val address = etAddress.text.toString().trim()
            val phone = etPhone.text.toString().trim()
            val paymentMethod = spPayment.selectedItem.toString()

            cartViewModel.placeOrder(
                customerName = "Kahan Shah",
                customerEmail = "kahanshah5676@gmail.com",
                phone = phone,
                address = address,
                preferredTime = if (isPickup) "Ready in 15 mins" else "Evening (4pm – 8pm)",
                deliveryMode = deliveryMode,
                paymentMethod = paymentMethod
            )
        }
    }
}

class CartAdapter(
    private val items: List<CartItem>
) : RecyclerView.Adapter<CartAdapter.CartViewHolder>() {

    class CartViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val tvName: TextView = view.findViewById(R.id.tv_cart_item_name)
        val tvDetails: TextView = view.findViewById(R.id.tv_cart_item_details)
        val tvQty: TextView = view.findViewById(R.id.tv_cart_item_qty)
        val tvTotal: TextView = view.findViewById(R.id.tv_cart_item_total)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_cart_card, parent, false)
        return CartViewHolder(view)
    }

    override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
        val item = items[position]
        holder.tvName.text = item.menuItem.name
        holder.tvDetails.text = "${item.menuItem.weight} • ₹${item.menuItem.price.toInt()} each"
        holder.tvQty.text = "Qty: ${item.quantity}"
        holder.tvTotal.text = "₹${item.total.toInt()}"
    }

    override fun getItemCount() = items.size
}
