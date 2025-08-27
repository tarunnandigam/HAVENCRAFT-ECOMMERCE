// Check authentication state and update header
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const accountLink = document.querySelector('.header-right-links a[href="account.html"]');
    
    if (accountLink) {
        if (currentUser) {
            // User is logged in - update the account link to go to profile
            accountLink.setAttribute('href', 'account.html');
            // Optionally change the icon to a person-fill when logged in
            const icon = accountLink.querySelector('i');
            if (icon) {
                icon.classList.remove('bi-person');
                icon.classList.add('bi-person-fill');
            }
        } else {
            // User is not logged in - ensure it goes to login page
            accountLink.setAttribute('href', 'account.html');
        }
    }
});
