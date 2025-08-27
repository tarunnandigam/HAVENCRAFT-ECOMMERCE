// Get cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM Elements
const orderItemsEl = document.getElementById('order-items');
const orderSubtotalEl = document.getElementById('order-subtotal');
const orderShippingEl = document.getElementById('order-shipping');
const orderTotalEl = document.getElementById('order-total');
const placeOrderBtn = document.getElementById('place-order-btn');

// Shipping cost
const SHIPPING_COST = 5.99;
const FREE_SHIPPING_THRESHOLD = 50;

// Initialize the checkout page
document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    setupEventListeners();
    updateCartCount();
});

// Display order summary with cart items
function displayOrderSummary() {
    if (cart.length === 0) {
        orderItemsEl.innerHTML = '<p>Your cart is empty</p>';
        return;
    }

    let itemsHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price.newPrice * item.quantity;
        subtotal += itemTotal;

        itemsHTML += `
            <div class="order-item">
                <div class="order-item-image">
                    <img src="${item.img.singleImage}" alt="${item.name}">
                    <span class="quantity">${item.quantity}</span>
                </div>
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description || 'Handcrafted with love'}</p>
                </div>
                <div class="order-item-price">
                    $${itemTotal.toFixed(2)}
                </div>
            </div>
        `;
    });

    orderItemsEl.innerHTML = itemsHTML;
    updateOrderTotals(subtotal);
}

// Update order totals including shipping
function updateOrderTotals(subtotal) {
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    orderSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    orderShippingEl.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    orderTotalEl.textContent = `$${total.toFixed(2)}`;
}

// Setup event listeners
function setupEventListeners() {
    // Toggle payment method details
    const paymentMethods = document.querySelectorAll('.payment-method input[type="radio"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', (e) => {
            // Hide all payment details first
            document.querySelectorAll('.payment-details').forEach(detail => {
                detail.style.display = 'none';
            });
            
            // Show selected payment method details
            const detailsId = `${e.target.id}-details`;
            const detailsEl = document.getElementById(detailsId);
            if (detailsEl) {
                detailsEl.style.display = 'block';
            }
        });
    });

    // Place order button click handler
    placeOrderBtn.addEventListener('click', handlePlaceOrder);

    // Show credit card details by default
    const creditCardDetails = document.getElementById('credit-card-details');
    if (creditCardDetails) {
        creditCardDetails.style.display = 'block';
    }
}

// Handle place order button click
function handlePlaceOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.');
        window.location.href = 'shop.html';
        return;
    }

    // Basic form validation
    const form = document.getElementById('shipping-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Disable the place order button and show message
    const placeOrderBtn = document.getElementById('place-order-btn');
    const originalBtnText = placeOrderBtn.innerHTML;
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = 'Processing...';

    // Show processing message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'processing-message';
    messageDiv.textContent = 'Processing your order. Please wait...';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #4CAF50;
        color: white;
        padding: 15px 30px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: fadeInOut 5s ease-in-out;
    `;
    
    // Add styles if not already added
    if (!document.getElementById('processing-message-style')) {
        const style = document.createElement('style');
        style.id = 'processing-message-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -20px); }
                10% { opacity: 1; transform: translate(-50%, 0); }
                90% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(messageDiv);

    // Get form data
    const formData = new FormData(form);
    const subtotal = parseFloat(orderSubtotalEl.textContent.replace('$', ''));
    const shippingCost = orderShippingEl.textContent === 'FREE' ? 0 : parseFloat(orderShippingEl.textContent.replace('$', ''));
    const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax
    const total = subtotal + shippingCost + tax;
    
    const orderData = {
        orderId: `HC-${Math.floor(100000 + Math.random() * 900000)}`,
        customer: {
            name: `${formData.get('first-name') || ''} ${formData.get('last-name') || ''}`.trim() || 'Guest Customer',
            email: formData.get('email') || '',
            phone: formData.get('phone') || ''
        },
        shipping: {
            address: formData.get('address') || '',
            apartment: formData.get('apartment') || '',
            city: formData.get('city') || '',
            state: formData.get('state') || '',
            zip: formData.get('zip') || '',
            country: formData.get('country') || '',
            method: formData.get('shipping-method') || 'Standard Shipping'
        },
        payment: {
            method: formData.get('payment-method') || 'Credit Card',
            cardNumber: formData.get('card-number') || '',
            cardName: formData.get('card-name') || '',
            cardExpiry: formData.get('card-expiry') || '',
            cardCvv: formData.get('card-cvv') || '',
            upiId: formData.get('upi-id') || '',
            // Store only last 4 digits for security
            last4: formData.get('card-number') ? formData.get('card-number').slice(-4) : ''
        },
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price?.newPrice || item.price || 0,
            quantity: item.quantity || 1,
            image: item.img?.singleImage || item.image || 'img/placeholder.jpg',
            description: item.description || 'Handcrafted with love'
        })),
        subtotal: subtotal,
        shippingCost: shippingCost,
        tax: tax,
        total: total,
        orderDate: new Date().toISOString(),
        estimatedDelivery: getDeliveryEstimate()
    };
    
    // Debug: Log the order data being saved
    console.log('Saving order data:', orderData);

    // Simulate payment processing for 3 seconds
    setTimeout(() => {
        // Save order data to localStorage
        localStorage.setItem('orderData', JSON.stringify(orderData));
        
        // Clear the cart
        localStorage.removeItem('cart');
        
        // Remove message if still present
        if (messageDiv.parentNode) {
            document.body.removeChild(messageDiv);
        }

        // Reset button state (though we'll navigate away immediately after)
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = originalBtnText;
        
        // Redirect to order confirmation page
        window.location.href = 'order-confirmation.html';
    }, 3000);
}

// Generate estimated delivery date (5-7 business days from now)
function getDeliveryEstimate() {
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() + 5);
    end.setDate(end.getDate() + 10);
    
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
}

// Update cart count in header
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountEl = document.querySelector('.header-cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cartCount;
    }
}
