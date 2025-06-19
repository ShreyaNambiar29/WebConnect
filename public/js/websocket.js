window.socket = io();

function fetchRooms() {
  window.socket.emit('getRooms');
}

window.joinRoom = function(room) {
  localStorage.setItem('room', room); // Yeh line zaroori hai
  document.getElementById('room-selection').style.display = 'none';
  document.getElementById('chat-room').style.display = 'block';
  document.getElementById('current-room').textContent = room;
  window.socket.emit('joinRoom', room, localStorage.getItem('username'));
};

document.addEventListener('DOMContentLoaded', () => {
  fetchRooms();

  const socket = window.socket;

  socket.on('roomList', (rooms) => {
    const roomList = document.getElementById('room-list');
    roomList.innerHTML = '';
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';

        const roomName = document.createElement('span');
        roomName.textContent = room;
        roomName.style.flex = '1';
        roomName.style.cursor = 'pointer';
        roomName.onclick = () => window.joinRoom(room);

        li.appendChild(roomName);

        // Show delete button only for admin
        if (localStorage.getItem('username') === 'admin' && room !== 'General' && room !== 'Random') {
            const delBtn = document.createElement('button');
            delBtn.textContent = '🗑️';
            delBtn.style.marginLeft = '8px';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Delete room "${room}"?`)) {
                    window.socket.emit('deleteRoom', room, localStorage.getItem('username'));
                }
            };
            li.appendChild(delBtn);
        }

        roomList.appendChild(li);
    });
  });

  document.getElementById('create-room-button').onclick = function() {
    const newRoom = document.getElementById('new-room').value.trim();
    if (newRoom) {
      window.socket.emit('createRoom', newRoom);
      document.getElementById('new-room').value = '';
    }
  };
});