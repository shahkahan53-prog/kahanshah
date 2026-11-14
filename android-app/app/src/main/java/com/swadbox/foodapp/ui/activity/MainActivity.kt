package com.swadbox.foodapp.ui.activity

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import coil.load
import com.swadbox.foodapp.R
import com.swadbox.foodapp.data.model.MenuItem
import com.swadbox.foodapp.ui.viewmodel.CartViewModel
import com.swadbox.foodapp.ui.viewmodel.MenuViewModel

class MainActivity : AppCompatActivity() {

    private val menuViewModel: MenuViewModel by viewModels()
    private val cartViewModel: CartViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val rvMenu = findViewById<RecyclerView>(R.id.rv_menu)
        val btnViewCart = findViewById<Button>(R.id.btn_view_cart)
        val tvCartCount = findViewById<TextView>(R.id.tv_cart_count)

        rvMenu.layoutManager = GridLayoutManager(this, 2)

        menuViewModel.menuItems.observe(this) { items ->
            rvMenu.adapter = MenuAdapter(items) { item ->
                cartViewModel.addToCart(item)
                Toast.makeText(this, "Added ${item.name} to cart!", Toast.LENGTH_SHORT).show()
            }
        }

        CartViewModel.cartItems.observe(this) { cart ->
            val totalCount = cart.sumOf { it.quantity }
            tvCartCount.text = "$totalCount items"
            btnViewCart.isEnabled = totalCount > 0
        }

        btnViewCart.setOnClickListener {
            startActivity(Intent(this, CartActivity::class.java))
        }

        // Fetch menu (Served from Redis cache with 5-minute TTL)
        menuViewModel.fetchMenu()
    }
}

class MenuAdapter(
    private val items: List<MenuItem>,
    private val onAddToCart: (MenuItem) -> Unit
) : RecyclerView.Adapter<MenuAdapter.MenuViewHolder>() {

    class MenuViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val imgFood: ImageView = view.findViewById(R.id.img_food)
        val tvName: TextView = view.findViewById(R.id.tv_item_name)
        val tvPrice: TextView = view.findViewById(R.id.tv_item_price)
        val tvWeight: TextView = view.findViewById(R.id.tv_item_weight)
        val btnAdd: Button = view.findViewById(R.id.btn_add_to_cart)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MenuViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_menu_card, parent, false)
        return MenuViewHolder(view)
    }

    override fun onBindViewHolder(holder: MenuViewHolder, position: Int) {
        val item = items[position]
        holder.tvName.text = item.name
        holder.tvPrice.text = "₹${item.price.toInt()}"
        holder.tvWeight.text = item.weight

        if (item.imageUrl.isNotEmpty()) {
            val fullUrl = if (item.imageUrl.startsWith("http")) item.imageUrl else "http://10.0.2.2:8000${item.imageUrl}"
            holder.imgFood.load(fullUrl) {
                crossfade(true)
                placeholder(R.drawable.ic_snack_placeholder)
                error(R.drawable.ic_snack_placeholder)
            }
        }

        holder.btnAdd.setOnClickListener {
            onAddToCart(item)
        }
    }

    override fun getItemCount() = items.size
}
