let cart = localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart")) : [];

// Check authentication and cart status before proceeding to checkout
function validateCheckout() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const checkoutButton = document.querySelector('.checkout a.btn');
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    if (!checkoutButton) return;

    checkoutButton.addEventListener('click', function(e) {
        if (!currentUser) {
            e.preventDefault();
            alert('Please log in to proceed to checkout.');
            // Redirect to home page after login
            sessionStorage.setItem('redirectAfterLogin', 'index.html');
            window.location.href = 'account.html';
            return;
        }
        
        if (cartItems.length === 0) {
            e.preventDefault();
            alert('Your cart is empty. Please add items before checkout.');
            return;
        }
    });
}


function displayCartProduct() {
    let results = ""
    const cartProduct = document.getElementById("cart-product")
    cart.forEach((item) => {
        results += `
        <tr class="cart-item">
            <td></td>
            <td class="cart-image">
                <img src="${item.img.singleImage}" alt="" data-id=${item.id} class="cart-product-image">
                <i class="bi bi-x delete-cart" data-id=${item.id}></i>
            </td>
            <td>${item.name}</td>
            <td>$${item.price.newPrice.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>$${(item.price.newPrice * item.quantity).toFixed(2)}</td>
        </tr>
        `
    })
    cartProduct.innerHTML = results
    removeCartItem()
}

displayCartProduct()
validateCheckout();

function cartProductRoute() {
    const images = document.querySelectorAll(".cart-product-image")
    images.forEach((image) => {
        image.addEventListener("click", (e) => {
            const imageId = e.target.dataset.id
            localStorage.setItem("productId", Number(imageId))
            window.location.href = "single-product.html"
        })
    })
}

cartProductRoute()


function removeCartItem() {

    const btnDeleteCart = document.querySelectorAll(".delete-cart");
    let cartItem = document.querySelector(".header-cart-count")

    btnDeleteCart.forEach((button) => {
        button.addEventListener("click", (e) => {
            const id = e.target.dataset.id;
            cart = cart.filter((item) => item.id !== Number(id));
            displayCartProduct();
            localStorage.setItem("cart", JSON.stringify(cart));
            cartItem.innerHTML = cart.length;
            saveCardValues();
            validateCheckout();
        });
    });
}


function saveCardValues() {
    const cartTotal = document.getElementById("cart-total")
    const subTotal = document.getElementById("subtotal")
    const fastCargo = document.getElementById("fast-cargo")
    const fastCargoPrice = 15
    let itemsTotal = 0

    cart.length > 0 && cart.map((item) => itemsTotal += item.price.newPrice * item.quantity)
    subTotal.innerHTML = `$${itemsTotal.toFixed(2)}`
    cartTotal.innerHTML = `$${itemsTotal.toFixed(2)}`
    fastCargo.addEventListener("change", (e) => {
        if (e.target.checked) {
            cartTotal.innerHTML = `$${(itemsTotal + fastCargoPrice).toFixed(2)}`
        } else {
            cartTotal.innerHTML = `$${itemsTotal.toFixed(2)}`
        }
    })
}


saveCardValues()