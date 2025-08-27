// Authentication state
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// Show temporary success message
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

// Add keyframes for fade in/out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -20px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        90% { opacity: 1; transform: translate(-50%, 0); }
        100% { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);

// DOM Elements
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const profileSection = document.querySelector('.profile-section');
const loginSection = document.querySelector('.login-section');
const registerSection = document.querySelector('.register-section');
const accountLink = document.querySelector('.account-link');
const logoutBtn = document.querySelector('.logout-btn');

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showProfile();
    } else {
        showLogin();
    }
});

// Handle login
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        
        // In a real app, you would validate credentials with a server
        if (username && password) {
            currentUser = { username, email: username };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showSuccessMessage('Login successful! Redirecting...');
            
            setTimeout(() => {
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            }, 1500);
        }
    });
}

// Handle registration
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = registerForm.querySelector('input[type="text"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelector('input[type="password"]').value;
        
        // In a real app, you would send this data to a server
        if (username && email && password) {
            currentUser = { username, email };
            sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showSuccessMessage('Registration successful! Redirecting...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    });
}

// Handle logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        currentUser = null;
        
        showSuccessMessage('You have been logged out successfully');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// Toggle between login and register forms
function showRegister() {
    if (loginSection) loginSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'block';
}

function showLogin() {
    if (registerSection) registerSection.style.display = 'none';
    if (loginSection) loginSection.style.display = 'block';
    if (profileSection) profileSection.style.display = 'none';
}

function showProfile() {
    const profileUsername = document.querySelector('.profile-username');
    if (profileUsername && currentUser) {
        const username = currentUser.username || currentUser.email.split('@')[0];
        profileUsername.textContent = username;
        
        // Update recent orders
        updateRecentOrders();
    }
    if (loginSection) loginSection.style.display = 'none';
    if (registerSection) registerSection.style.display = 'none';
    if (profileSection) profileSection.style.display = 'block';
    
    // Update active state in navigation
    document.querySelectorAll('.account-nav a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.account-nav a[href="#profile"]')?.classList.add('active');
}

function updateRecentOrders() {
    if (!currentUser) return;
    
    // Get user's orders from localStorage
    const orders = JSON.parse(localStorage.getItem('userOrders') || '[]');
    const userOrders = orders.filter(order => order.userId === currentUser.email);
    
    // Sort by date (newest first)
    userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    // Get the 2 most recent orders
    const recentOrders = userOrders.slice(0, 2);
    const ordersList = document.getElementById('recent-orders-list');
    
    if (!ordersList) return;
    
    if (recentOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="no-orders">
                <i class="bi bi-box-seam"></i>
                <p>You haven't placed any orders yet.</p>
                <a href="shop.html" class="btn btn-sm">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    // Generate HTML for recent orders
    let ordersHTML = '';
    recentOrders.forEach(order => {
        const orderDate = new Date(order.orderDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const orderTotal = order.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0) + (order.shippingCost || 0) + (order.tax || 0);
        
        const statusClass = `status-${order.status || 'processing'}`;
        const statusText = order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Processing';
        
        ordersHTML += `
            <div class="order-item">
                <div class="order-info">
                    <h4>Order #${order.orderId}</h4>
                    <div class="order-meta">
                        <span>${orderDate}</span>
                        <span>•</span>
                        <span>${order.items.length} ${order.items.length === 1 ? 'item' : 'items'}</span>
                        <span>•</span>
                        <span>$${orderTotal.toFixed(2)}</span>
                    </div>
                </div>
                <div class="order-status ${statusClass}">${statusText}</div>
            </div>
        `;
    });
    
    ordersList.innerHTML = ordersHTML;
    
    // Update order statistics
    updateOrderStatistics(userOrders);
}

function updateOrderStatistics(orders) {
    if (!orders) return;
    
    document.getElementById('total-orders').textContent = orders.length;
    
    const statusCounts = {
        processing: 0,
        shipped: 0,
        delivered: 0
    };
    
    orders.forEach(order => {
        const status = order.status || 'processing';
        if (statusCounts.hasOwnProperty(status)) {
            statusCounts[status]++;
        }
    });
    
    document.getElementById('pending-orders').textContent = statusCounts.processing;
    document.getElementById('shipped-orders').textContent = statusCounts.shipped;
    document.getElementById('delivered-orders').textContent = statusCounts.delivered;
}

// Make functions available globally
window.showRegister = showRegister;
window.showLogin = showLogin;
