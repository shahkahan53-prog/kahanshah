package com.swadbox.foodapp.data.model

import com.google.gson.annotations.SerializedName

data class MenuItem(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("price") val price: Double,
    @SerializedName("weight") val weight: String = "500 g",
    @SerializedName("category") val category: String = "khakara",
    @SerializedName("stock") val stock: Int = 20,
    @SerializedName("image_url") val imageUrl: String = ""
)

data class CartItem(
    val menuItem: MenuItem,
    var quantity: Int
) {
    val total: Double
        get() = menuItem.price * quantity
}
