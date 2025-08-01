const socket = window.socket;

// Elements
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');
const messageDisplay = document.getElementById('message-display');
const roomList = document.getElementById('room-list');
const userList = document.getElementById('user-list');
const typingIndicator = document.getElementById('typing-indicator');
const leaveRoomBtn = document.getElementById('leave-room-button');

// Send message on button click
sendButton.onclick = function() {
    const message = messageInput.value.trim();
    const currentRoom = localStorage.getItem('room');
    const username = localStorage.getItem('username');
    
    if (message && currentRoom && username) {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        const time = new Date().toLocaleTimeString();
        console.log('Sending message:', { room: currentRoom, username, message, time });
        socket.emit('chatMessage', { room: currentRoom, username, message, time });
        messageInput.value = '';
    } else {
        console.error('Missing required data:', { message: !!message, currentRoom, username });
    }
};

// Send message on Enter key
messageInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendButton.onclick();
    }
});

// Escape HTML function
function escapeHTML(html) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(html));
    return div.innerHTML;
}

// Gravatar URL function
function getGravatarUrl(username) {
    function md5(str) {
        return CryptoJS.MD5(str.trim().toLowerCase()).toString();
    }
    return `https://www.gravatar.com/avatar/${md5(username)}?d=identicon`;
}

// Play notification sound
function playNotificationSound() {
    const audio = new Audio('/notification.mp3');
    audio.play();
}

// Receive and display messages
socket.on('chatMessage', ({ username: sender, message, time }) => {
    console.log('Received message:', { sender, message, time });
    
    const msgDiv = document.createElement('div');
    msgDiv.style.display = 'flex';
    msgDiv.style.alignItems = 'center';
    msgDiv.style.marginBottom = '12px';

    const avatar = document.createElement('img');
    avatar.src = getGravatarUrl(sender);
    avatar.alt = sender;
    avatar.style.width = '32px';
    avatar.style.height = '32px';
    avatar.style.borderRadius = '50%';
    avatar.style.marginRight = '10px';

    const content = document.createElement('div');
    content.innerHTML = `<strong>${sender}</strong> <span style="font-size:0.8em;color:#888;">[${time}]</span><br>${escapeHTML(message)}`;

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(content);
    messageDisplay.appendChild(msgDiv);
    messageDisplay.scrollTop = messageDisplay.scrollHeight;

    const currentUsername = localStorage.getItem('username');
    if (document.hidden && sender !== currentUsername && Notification.permission === "granted") {
        new Notification(`New message from ${sender}`, { body: message });
        playNotificationSound();
    }
});

// Room list update
socket.on('roomList', (rooms) => {
    roomList.innerHTML = '';
    rooms.forEach(room => {
        const roomItem = document.createElement('li');
        roomItem.textContent = room;
        roomItem.onclick = () => {
            const username = localStorage.getItem('username');
            localStorage.setItem('room', room);
            socket.emit('joinRoom', room, username);
            document.getElementById('room-selection').style.display = 'none';
            document.getElementById('chat-room').style.display = 'block';
            document.getElementById('current-room').textContent = room;
        };
        roomList.appendChild(roomItem);
    });
});

// User list update
socket.on('userList', (users) => {
    if (userList) {
        userList.innerHTML = '';
        users.forEach(user => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.alignItems = 'center';

            const avatar = document.createElement('img');
            avatar.src = getGravatarUrl(user);
            avatar.alt = user;
            avatar.style.width = '24px';
            avatar.style.height = '24px';
            avatar.style.borderRadius = '50%';
            avatar.style.marginRight = '8px';

            li.appendChild(avatar);
            li.appendChild(document.createTextNode(user));
            userList.appendChild(li);
        });
    }
});

// Leave room button functionality
if (leaveRoomBtn) {
    leaveRoomBtn.onclick = function() {
        const currentRoom = localStorage.getItem('room');
        const username = localStorage.getItem('username');
        socket.emit('leaveRoom', currentRoom, username);
        localStorage.removeItem('room');
        document.getElementById('chat-room').style.display = 'none';
        document.getElementById('room-selection').style.display = 'block';
    };
}

// Load message history
socket.on('messageHistory', (messages) => {
    console.log('Received message history:', messages);
    messageDisplay.innerHTML = '';
    messages.forEach(({ username, message, time }) => {
        const msgDiv = document.createElement('div');
        msgDiv.style.display = 'flex';
        msgDiv.style.alignItems = 'center';
        msgDiv.style.marginBottom = '12px';

        const avatar = document.createElement('img');
        avatar.src = getGravatarUrl(username);
        avatar.alt = username;
        avatar.style.width = '32px';
        avatar.style.height = '32px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '10px';

        const content = document.createElement('div');
        content.innerHTML = `<strong>${username}</strong> <span style="font-size:0.8em;color:#888;">[${time}]</span><br>${escapeHTML(message)}`;

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(content);
        messageDisplay.appendChild(msgDiv);
    });
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
});

// Notification handling
socket.on('notification', (msg) => {
    const notifDiv = document.createElement('div');
    notifDiv.style.textAlign = 'center';
    notifDiv.style.color = '#888';
    notifDiv.style.fontStyle = 'italic';
    notifDiv.innerText = msg;
    messageDisplay.appendChild(notifDiv);
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
});

// Error handling
socket.on('errorMessage', (msg) => {
    alert(msg);
});

// Typing indicator
let typingTimeout;
let typingUsers = new Set();

messageInput.addEventListener('input', function() {
    const currentRoom = localStorage.getItem('room');
    const username = localStorage.getItem('username');
    socket.emit('typing', { room: currentRoom, username: username });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping', { room: currentRoom, username: username });
    }, 1200);
});

socket.on('typing', (user) => {
    const username = localStorage.getItem('username');
    if (user !== username) {
        typingUsers.add(user);
        typingIndicator.textContent = `${Array.from(typingUsers).join(', ')} is typing...`;
    }
});
socket.on('stopTyping', (user) => {
    typingUsers.delete(user);
    typingIndicator.textContent = typingUsers.size
        ? `${Array.from(typingUsers).join(', ')} is typing...`
        : '';
});

// Room deletion handling
socket.on('roomDeleted', (room) => {
    if (localStorage.getItem('room') === room) {
        alert(`Room "${room}" has been deleted by admin.`);
        localStorage.removeItem('room');
        document.getElementById('chat-room').style.display = 'none';
        document.getElementById('room-selection').style.display = 'block';
    }
});