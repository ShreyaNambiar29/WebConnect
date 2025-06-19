// main.js

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const joinButton = document.getElementById('join-button');
    const userAuthDiv = document.getElementById('user-authentication');
    const roomSelectionDiv = document.getElementById('room-selection');

    joinButton.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        // Username must be 3-16 chars, only letters/numbers/underscores
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(username)) {
            alert("Username must be 3-16 characters and only letters, numbers, or underscores!");
            return;
        }
        localStorage.setItem('username', username);
        userAuthDiv.style.display = 'none';
        roomSelectionDiv.style.display = 'block';
    });

    if (localStorage.getItem('username')) {
        userAuthDiv.style.display = 'none';
        roomSelectionDiv.style.display = 'block';
    } else {
        roomSelectionDiv.style.display = 'none';
    }

    // Logout button logic
    const logoutBtn = document.getElementById('logout-button');
    if (logoutBtn) {
        logoutBtn.onclick = function() {
            localStorage.removeItem('username');
            localStorage.removeItem('room');
            location.reload();
        };
    }

    // Dark mode toggle
    const darkToggle = document.getElementById('dark-mode-toggle');
    if (darkToggle) {
        // Restore mode from localStorage
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

    // Show current username
    if (currentUsernameSpan) {
        currentUsernameSpan.textContent = localStorage.getItem('username') || 'User';
    }

    // Toggle dropdown
    if (dropdownBtn && dropdownMenu) {
        dropdownBtn.onclick = function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
        };
        // Hide dropdown on outside click
        document.addEventListener('click', () => {
            dropdownMenu.style.display = 'none';
        });
    }

    // Change username logic
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