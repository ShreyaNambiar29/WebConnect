// main.js

document.addEventListener('DOMContentLoaded', () => {
    // Section switching function
    function showSection(section) {
        document.getElementById('auth-section').style.display = section === 'auth' ? 'block' : 'none';
        document.getElementById('room-selection').style.display = section === 'rooms' ? 'block' : 'none';
        document.getElementById('chat-room').style.display = section === 'chat' ? 'block' : 'none';
    }

    // On load: check login
    if (localStorage.getItem('username')) {
        showSection('rooms');
    } else {
        showSection('auth');
    }

    // GitHub login redirect handling
    const params = new URLSearchParams(window.location.search);
    const user = params.get('user');
    const error = params.get('error');
    
    if (error) {
        alert('OAuth Error: ' + decodeURIComponent(error));
        // Remove error from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (user) {
        localStorage.setItem('username', user);
        showSection('rooms');
        // Remove ?user=... from URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Login button logic
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.onclick = async function() {
            const username = document.getElementById('auth-username').value.trim();
            const password = document.getElementById('auth-password').value;
            const res = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('username', username);
                showSection('rooms');
            } else {
                alert(data.message);
            }
        };
    }

    // Sign up button logic
    const signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
        signupBtn.onclick = async function() {
            const username = document.getElementById('auth-username').value.trim();
            const password = document.getElementById('auth-password').value;
            const res = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.success) {
                alert('Signup successful! Please login.');
            } else {
                alert(data.message);
            }
        };
    }

    // Logout button logic
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            localStorage.removeItem('username');
            localStorage.removeItem('room');
            showSection('auth');
        };
    }

    // Dark mode toggle
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            darkToggle.textContent = '☀️';
        }
        darkToggle.onclick = function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            darkToggle.textContent = isDark ? '☀️' : '🌙';
        };
    }

    // Username dropdown logic
    const dropdownBtn = document.getElementById('user-dropdown-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');
    const currentUsernameSpan = document.getElementById('current-username');
    const changeUsernameBtn = document.getElementById('change-username-button');
    const changeUsernameInput = document.getElementById('change-username-input');

    if (currentUsernameSpan) {
        currentUsernameSpan.textContent = localStorage.getItem('username') || 'User';
    }

    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.onclick = function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        };
        document.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
        });
    }

    if (changeUsernameBtn && changeUsernameInput) {
        changeUsernameBtn.onclick = function() {
            const newUsername = changeUsernameInput.value.trim();
            if (!/^[a-zA-Z0-9_]{3,16}$/.test(newUsername)) {
                alert("Username must be 3-16 characters and only letters, numbers, or underscores!");
                return;
            }
            localStorage.setItem('username', newUsername);
            if (currentUsernameSpan) currentUsernameSpan.textContent = newUsername;
            alert("Username changed! Please rejoin a room to update your identity.");
            changeUsernameInput.value = '';
            dropdownMenu.style.display = 'none';
        };
    }
});