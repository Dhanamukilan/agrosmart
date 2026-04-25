// Session Management for AgroSmart
(function () {
    const isLoggedIn = localStorage.getItem('agroSmartLoggedIn') === 'true';
    const currentPage = window.location.pathname.split('/').pop();
    const authPages = ['login.html', 'signup.html'];

    // Check if on an auth page
    const isAuthPage = authPages.includes(currentPage) || (currentPage === '' && authPages.includes('login.html'));

    if (!isLoggedIn && !isAuthPage) {
        // Not logged in and trying to access a protected page
        window.location.href = 'login.html';
    }

    // Function to update navbar based on login status
    window.updateNavbar = function () {
        const navList = document.querySelector('.navbar-nav');
        if (!navList) return;

        const navLinks = document.querySelectorAll('.nav-link');
        const loginBtn = document.querySelector('a[href="login.html"]')?.parentElement;
        const signupBtn = document.querySelector('a[href="signup.html"]')?.parentElement;

        if (isLoggedIn) {
            // User is logged in: Show all normal links, remove login/signup, add logout
            if (loginBtn) loginBtn.remove();
            if (signupBtn) signupBtn.remove();

            if (!document.querySelector('.logout-btn')) {
                const logoutLi = document.createElement('li');
                logoutLi.className = 'nav-item';
                logoutLi.innerHTML = `<a class="nav-link btn-agro-outline-small px-3 ms-lg-3 logout-btn" href="#" onclick="handleLogout(event)">Logout</a>`;
                
                const dropdown = document.querySelector('.nav-item.dropdown');
                if (dropdown) {
                    navList.insertBefore(logoutLi, dropdown);
                } else {
                    navList.appendChild(logoutLi);
                }
            }
        } else {
            // User is NOT logged in: Hide all links except Login, Signup, and Language Dropdown
            navLinks.forEach(link => {
                const parent = link.parentElement;
                const href = link.getAttribute('href');
                const isAuthLink = href === 'login.html' || href === 'signup.html';
                const isDropdown = parent.classList.contains('dropdown');
                
                if (!isAuthLink && !isDropdown) {
                    parent.style.display = 'none';
                }
            });
        }
    };

    // Handle Logout
    window.handleLogout = function (e) {
        if (e) e.preventDefault();
        localStorage.removeItem('agroSmartLoggedIn');
        window.location.href = 'login.html';
    };

    // Run navbar update on DOM ready
    document.addEventListener('DOMContentLoaded', updateNavbar);
})();
