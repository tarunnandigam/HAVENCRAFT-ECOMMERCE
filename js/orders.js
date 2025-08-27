// Show success message function (duplicate of the one in auth.js if not already available)
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
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
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remove message after animation completes
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

// Add keyframes for fade in/out animation if not already present
if (!document.querySelector('style#success-message-styles')) {
    const style = document.createElement('style');
    style.id = 'success-message-styles';
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

// Cancel order function
function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const orderIndex = orders.findIndex(order => order.orderId === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'canceled';
        localStorage.setItem('userOrders', JSON.stringify(orders));
        
        // Refresh the display
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        const userOrders = orders.filter(order => order.userId === currentUser.email);
        displayOrders(userOrders);
        
        showSuccessMessage('Order has been canceled successfully');
    }
}

// Handle click events on order actions
document.addEventListener('click', function(e) {
    // Handle cancel order button click
    if (e.target.closest('.btn-cancel')) {
        const orderId = e.target.closest('.btn-cancel').dataset.orderId;
        cancelOrder(orderId);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'account.html';
        return;
    }

    // Generate sample data if none exists (for testing)
    generateSampleOrders();

    // Get orders from localStorage or initialize empty array
    let orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    
    // Filter orders for the current user
    const userOrders = orders.filter(order => order.userId === currentUser.email);
    
    // Display orders
    displayOrders(userOrders);

    // Update order count in header
    updateOrderCount(userOrders.length);
});

function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="bi bi-box-seam"></i>
                <p>You haven't placed any orders yet.</p>
                <a href="shop.html" class="btn btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // Generate HTML for each order
    const ordersHTML = orders.map(order => createOrderHTML(order)).join('');
    
    ordersList.innerHTML = ordersHTML;
}

function createOrderHTML(order) {
    const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Default status if not set
    order.status = order.status || 'confirmed';

    // Calculate order total
    const orderTotal = order.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);

    // Generate order items HTML
    const itemsHTML = order.items.map(item => `
        <div class="order-item">
            <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.name}" class="order-item-img">
            <div class="order-item-details">
                <h4 class="order-item-name">${item.name}</h4>
                <div class="order-item-meta">
                    <span>Qty: ${item.quantity}</span>
                    ${item.size ? `<span> | Size: ${item.size}</span>` : ''}
                    ${item.color ? `<span> | Color: ${item.color}</span>` : ''}
                </div>
                <div class="order-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        </div>
    `).join('');

    // Generate status class
    const statusClass = `status-${order.status || 'processing'}`;
    const statusText = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing';

    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <span class="order-number">Order #${order.orderId}</span>
                    <span class="order-date">Placed on ${orderDate}</span>
                </div>
                <span class="order-status ${statusClass}">${statusText}</span>
            </div>
            <div class="order-details">
                <div class="order-items">
                    ${itemsHTML}
                </div>
                <div class="order-summary">
                    <div class="summary-row">
                        <span class="summary-label">Subtotal</span>
                        <span class="summary-value">$${orderTotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Shipping</span>
                        <span class="summary-value">${order.shippingCost === 0 ? 'Free' : '$' + order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Tax</span>
                        <span class="summary-value">$${order.tax ? order.tax.toFixed(2) : '0.00'}</span>
                    </div>
                    <div class="summary-row summary-total">
                        <span>Total</span>
                        <span>$${(orderTotal + (order.shippingCost || 0) + (order.tax || 0)).toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-actions">
                    ${order.status !== 'canceled' ? `
                    <a href="order-confirmation.html?orderId=${order.orderId}" class="btn btn-outline">
                        <i class="bi bi-eye"></i> View Details
                    </a>` : ''}
                    ${order.status !== 'canceled' ? `
                    <button class="btn btn-outline btn-cancel" data-order-id="${order.orderId}">
                        <i class="bi bi-x-circle"></i> Cancel Order
                    </button>
                    ` : ''}
                    ${order.status === 'delivered' ? `
                    <button class="btn btn-outline" data-order-id="${order.orderId}">
                        <i class="bi bi-arrow-repeat"></i> Reorder
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function updateOrderCount(count) {
    const orderCountElement = document.querySelector('.header-orders-count');
    if (orderCountElement) {
        orderCountElement.textContent = count;
    }
}

// Function to generate sample orders for testing
function generateSampleOrders() {
    // Check if we already have sample data
    if (localStorage.getItem('sampleDataGenerated')) {
        return;
    }
    
    // Get current user
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Generate sample order data
    const sampleOrders = [
        {
            orderId: 'HC-' + Math.floor(100000 + Math.random() * 900000),
            userId: currentUser.email,
            status: 'delivered',
            orderDate: new Date('2023-07-15').toISOString(),
            shippingCost: 0,
            tax: 5.99,
            items: [
                {
                    id: 1,
                    name: 'Handmade Ceramic Mug',
                    price: 24.99,
                    quantity: 2,
                    image: 'img/products/mug.jpg',
                    color: 'Blue'
                },
                {
                    id: 3,
                    name: 'Handwoven Scarf',
                    price: 32.50,
                    quantity: 1,
                    image: 'img/products/scarf.jpg',
                    color: 'Red'
                }
            ]
        },
        {
            orderId: 'HC-' + Math.floor(100000 + Math.random() * 900000),
            userId: currentUser.email,
            status: 'shipped',
            orderDate: new Date('2023-08-10').toISOString(),
            shippingCost: 4.99,
            tax: 3.25,
            items: [
                {
                    id: 5,
                    name: 'Wooden Cutting Board',
                    price: 45.00,
                    quantity: 1,
                    image: 'img/products/cutting-board.jpg'
                }
            ]
        },
        {
            orderId: 'HC-' + Math.floor(100000 + Math.random() * 900000),
            userId: currentUser.email,
            status: 'processing',
            orderDate: new Date().toISOString(),
            shippingCost: 0,
            tax: 2.49,
            items: [
                {
                    id: 2,
                    name: 'Handmade Soap Set',
                    price: 18.99,
                    quantity: 1,
                    image: 'img/products/soap.jpg'
                },
                {
                    id: 4,
                    name: 'Leather Wallet',
                    price: 39.99,
                    quantity: 1,
                    image: 'img/products/wallet.jpg',
                    color: 'Brown'
                }
            ]
        }
    ];

    // Save sample orders to localStorage if none exist
    if (!localStorage.getItem('userOrders')) {
        localStorage.setItem('userOrders', JSON.stringify(sampleOrders));
        localStorage.setItem('sampleDataGenerated', 'true');
    }
}

// Uncomment the line below to generate sample orders for testing
// generateSampleOrders();
