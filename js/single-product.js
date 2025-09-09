import { product3 } from "./glide.js"
import { thumbsActiveFunc } from "./single-product/thumbsActive.js"
import zoomFunc from "./single-product/zoom.js"
import colorsFunc from "./single-product/colors.js"
import valuesFunc from "./single-product/values.js"
import tabsFunc from "./single-product/tabs.js"
import commentsfunc from "./single-product/comments.js"



const productId = localStorage.getItem("productId")
    ? JSON.parse(localStorage.getItem("productId"))
    : localStorage.setItem("productId", JSON.stringify(1))


const products = localStorage.getItem("products")
    ? JSON.parse(localStorage.getItem("products"))
    : localStorage.setItem("products", JSON.stringify([]))



const findProduct = products.find((item) => item.id === Number(productId))

/* product title */
const productTitle = document.querySelector(".product-title")
productTitle.innerHTML = findProduct.name


/* product price */
const productOldPrice = document.querySelector(".old-price")
productOldPrice.innerHTML = `$${findProduct.price.oldPrice.toFixed(2)}`

const productNewPrice = document.querySelector(".new-price")
productNewPrice.innerHTML = `$${findProduct.price.newPrice.toFixed(2)}`

/* product gallery */
const singleImage = document.getElementById("single-image")
singleImage.src = findProduct.img.singleImage

/* gallery thumbs */

const galleryThumbs = document.querySelector(".gallery-thumbs")
let result = ""

findProduct.img.thumbs.forEach((item) => {
    result += `
        <li class="glide__slide">
            <img src="${item}" class="img-fluid" alt="">
        </li>
    `
})

galleryThumbs.innerHTML = result

thumbsActiveFunc()
product3()

/* thumbs active */
const productThumbs = document.querySelectorAll(".product-thumb .glide__slide img")
productThumbs[0].classList.add("active")




//add to cart
let cart = localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart")) : []

const btnAddCart = document.getElementById("add-to-cart")
const quantity = document.getElementById("quantity")
const cartItem = document.querySelector(".header-cart-count")

// Function to update cart count in the header
const updateCartCount = () => {
    // Calculate total items in cart (sum of all quantities)
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
    cartItem.innerHTML = totalItems
}

// Add to cart click handler
const addToCart = () => {
    const existingItemIndex = cart.findIndex(item => item.id === findProduct.id)
    
    if (existingItemIndex !== -1) {
        // If item already exists in cart, update its quantity
        cart[existingItemIndex].quantity += Number(quantity.value)
    } else {
        // If item doesn't exist, add it to cart
        cart.push({ ...findProduct, quantity: Number(quantity.value) })
    }
    
    // Save to local storage and update UI
    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    
    // Show feedback to user
    const originalText = btnAddCart.textContent
    btnAddCart.textContent = 'Added to Cart!'
    setTimeout(() => {
        btnAddCart.textContent = originalText
    }, 1000)
}

// Initial setup
updateCartCount()

// Add click event listener
btnAddCart.addEventListener("click", addToCart)

// Listen for storage events to update when cart changes in other tabs/windows
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        cart = JSON.parse(e.newValue) || []
        updateCartCount()
    }
})
