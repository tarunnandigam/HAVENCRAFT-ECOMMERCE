// Get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// Get order data from localStorage
function getOrderData() {
    // Check for order ID in URL
    const orderId = getUrlParameter('orderId');
    
    if (orderId) {
        // Get all orders and find the one with matching ID
        const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
        const order = orders.find(o => o.orderId === orderId);
        if (order) return order;
    }
    
    // Fall back to the most recent order from localStorage
    const savedOrderData = JSON.parse(localStorage.getItem('orderData'));
    
    if (savedOrderData) {
        // Ensure we have all required fields with proper fallbacks
        const orderData = {
            orderId: savedOrderData.orderId || `HC-${Math.floor(100000 + Math.random() * 900000)}`,
            customer: {
                name: savedOrderData.customer?.name || 'Guest Customer',
                email: savedOrderData.customer?.email || '',
                phone: savedOrderData.customer?.phone || ''
            },
            shipping: {
                address: savedOrderData.shipping?.address || '',
                city: savedOrderData.shipping?.city || '',
                state: savedOrderData.shipping?.state || '',
                zip: savedOrderData.shipping?.zip || '',
                country: savedOrderData.shipping?.country || '',
                method: savedOrderData.shipping?.method || 'Standard Shipping'
            },
            payment: {
                method: savedOrderData.payment?.method || 'Credit Card',
                last4: savedOrderData.payment?.last4 || ''
            },
            items: [],
            subtotal: savedOrderData.subtotal || 0,
            shippingCost: savedOrderData.shippingCost || 0,
            tax: savedOrderData.tax || 0,
            total: savedOrderData.total || 0,
            orderDate: savedOrderData.orderDate || new Date().toISOString(),
            estimatedDelivery: savedOrderData.estimatedDelivery || getDeliveryEstimate()
        };

        // Process items
        if (savedOrderData.items && savedOrderData.items.length > 0) {
            orderData.items = savedOrderData.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price || (item.price?.newPrice || 0),
                quantity: item.quantity || 1,
                image: item.image || (item.img?.singleImage || 'img/placeholder.jpg'),
                description: item.description || 'Handcrafted with love'
            }));
        }
        
        return orderData;
    }
    
    // Fallback to sample data (shouldn't happen in normal flow)
    console.warn('No order data found in localStorage. Using sample data.');
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderData = {
        orderId: 'HC-' + Math.floor(100000 + Math.random() * 900000),
        customer: {
            name: 'Guest Customer',
            email: 'guest@example.com',
            phone: ''
        },
        shipping: {
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'United States',
            method: 'Standard Shipping'
        },
        payment: {
            method: 'Credit Card',
            last4: '1234'
        },
        items: [],
        subtotal: 0,
        shippingCost: 0,
        tax: 0,
        total: 0,
        orderDate: new Date().toISOString(),
        estimatedDelivery: getDeliveryEstimate()
    };
    
    // If we have cart items, use them
    if (cart.length > 0) {
        orderData.items = cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price?.newPrice || 0,
            quantity: item.quantity || 1,
            image: item.img?.singleImage || 'img/placeholder.jpg',
            description: item.description || 'Handcrafted with love'
        }));
        
        // Calculate order totals
        orderData.subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderData.shippingCost = orderData.subtotal >= 50 ? 0 : 5.99;
        orderData.tax = parseFloat((orderData.subtotal * 0.1).toFixed(2)); // 10% tax
        orderData.total = orderData.subtotal + orderData.shippingCost + orderData.tax;
    }

    return orderData;
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

// Display order details on the page
function displayOrderConfirmation(orderData) {
    const order = orderData || getOrderData();
    
    // Debug: Log the order data to console
    console.log('Order Data:', order);
    
    // Update order number
    document.getElementById('order-number').textContent = order.orderId || 'N/A';
    
    // Get logged in user details
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    // Update customer details with logged in user info
    if (currentUser) {
        document.getElementById('customer-name').textContent = currentUser.username || 'Customer';
        document.getElementById('customer-email').textContent = currentUser.email || '';
    }
    
    // Update shipping address from order details if available
    if (orderData.customer) {
        const { phone, address, city, country } = orderData.customer;
        if (phone) document.getElementById('customer-phone').textContent = phone;
        if (address) document.getElementById('shipping-address').textContent = address;
        if (city) document.getElementById('shipping-city').textContent = city;
        if (country) document.getElementById('shipping-country').textContent = country;
    }
    
    // Update shipping details
    const shipping = orderData.shipping || {};
    const addressParts = [
        shipping.address,
        shipping.apartment,
        [shipping.city, shipping.state, shipping.zip].filter(Boolean).join(', '),
        shipping.country
    ].filter(Boolean).join('\n');
    
    document.getElementById('shipping-address').innerHTML = addressParts || 'No shipping address provided';
    document.getElementById('shipping-method').textContent = shipping.method || 'Standard Shipping';
    
    // Update payment method
    const payment = orderData.payment || {};
    let paymentText = payment.method || 'Credit Card';
    if (payment.last4) {
        paymentText += ` ending in ${payment.last4}`;
    }
    document.getElementById('payment-method').textContent = paymentText;
    
    // Update delivery date if available
    if (orderData.estimatedDelivery) {
        document.getElementById('delivery-date').textContent = orderData.estimatedDelivery;
    }
    
    // Update delivery date
    document.getElementById('delivery-date').textContent = orderData.estimatedDelivery;
    
    // Store current scroll position
    const orderItemsEl = document.getElementById('order-items');
    const scrollPosition = orderItemsEl.scrollTop;
    
    if (orderData.items && orderData.items.length > 0) {
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        orderData.items.forEach(item => {
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            const imagePath = item.image || (item.img?.singleImage || 'img/placeholder.jpg');
            const description = item.description || 'Handcrafted with love';
            
            // Create elements
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            
            // Set inner HTML for the item
            orderItem.innerHTML = `
                <div class="order-item-image">
                    <img src="${imagePath}" alt="${item.name || 'Product'}" 
                         onerror="this.onerror=null; this.src='img/placeholder.jpg'">
                    <span class="quantity">${quantity}</span>
                </div>
                <div class="order-item-details">
                    <h4>${item.name || 'Product'}</h4>
                    <p>${description}</p>
                    <p class="price">${formatPrice(price)} × ${quantity}</p>
                </div>
                <div class="order-item-price">
                    ${formatPrice(price * quantity)}
                </div>
            `;
            
            fragment.appendChild(orderItem);
        });
        
        // Clear and append new content
        orderItemsEl.innerHTML = '';
        orderItemsEl.appendChild(fragment);
        
        // Restore scroll position after a short delay
        setTimeout(() => {
            orderItemsEl.scrollTop = scrollPosition;
        }, 0);
    } else {
        orderItemsEl.innerHTML = '<p>No items in this order.</p>';
    }
    
    // Update order totals
    document.getElementById('order-subtotal').textContent = formatPrice(orderData.subtotal);
    document.getElementById('order-shipping').textContent = orderData.shippingCost === 0 ? 'FREE' : formatPrice(orderData.shippingCost);
    document.getElementById('order-tax').textContent = formatPrice(orderData.tax);
    document.getElementById('order-total').textContent = formatPrice(orderData.total);
    
    // Update cart count in header
    updateCartCount(0);
}

// Format price with currency symbol
function formatPrice(amount) {
    return `$${amount.toFixed(2)}`;
}

// Update cart count in header
function updateCartCount(count) {
    const cartCountEl = document.querySelector('.header-cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

// Save order to user's order history
function saveOrderToHistory(orderData) {
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Get existing orders or initialize empty array
    const userOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    
    // Add the new order with user ID and status
    const orderWithUser = {
        ...orderData,
        userId: currentUser.email,
        status: 'processing', // Default status
        orderDate: new Date().toISOString()
    };
    
    // Add to beginning of array (most recent first)
    userOrders.unshift(orderWithUser);
    
    // Save back to localStorage
    localStorage.setItem('userOrders', JSON.stringify(userOrders));
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const orderData = getOrderData();
    
    if (!orderData) {
        // No order data found
        document.querySelector('.confirmation-wrapper').innerHTML = `
            <div class="no-orders">
                <i class="bi bi-exclamation-circle"></i>
                <h2>Order Not Found</h2>
                <p>We couldn't find the order you're looking for.</p>
                <a href="account.html" class="btn btn-primary">View My Orders</a>
            </div>
        `;
        return;
    }
    
    displayOrderConfirmation(orderData);
    
    // Only save to history if this is a new order (no orderId in URL)
    if (!getUrlParameter('orderId')) {
        // Save order to history if user is logged in
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser) {
            saveOrderToHistory(orderData);
        }
        
        // Clear the cart and order data after a new order is placed
        localStorage.removeItem('cart');
        localStorage.removeItem('orderData');
        updateCartCount(0);
    }
});
