const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webconnect');

// Message schema
const messageSchema = new mongoose.Schema({
    room: String,
    username: String,
    message: String,
    time: String
});
const Message = mongoose.model('Message', messageSchema);

// Room schema
const roomSchema = new mongoose.Schema({
    name: String
});
const Room = mongoose.model('Room', roomSchema);

// User schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String // In production, always hash passwords!
});
const User = mongoose.model('User', userSchema);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// GitHub Strategy only
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "https://webconnect-gx2z.onrender.com/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, { id: profile.id, username: profile.username, provider: 'github' });
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Connect to MongoDB
// (Already connected and schemas/models declared above)

let usersInRooms = {}; // { roomName: [user1, user2, ...] }
const MESSAGE_FILE = path.join(__dirname, 'messages.json');

let messageHistory = {};
if (fs.existsSync(MESSAGE_FILE)) {
    messageHistory = JSON.parse(fs.readFileSync(MESSAGE_FILE, 'utf-8'));
}

function saveMessages() {
    fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messageHistory));
}

// Server start hone par default rooms ensure karein
Room.findOne({ name: 'General' }).then(r => {
    if (!r) new Room({ name: 'General' }).save();
});
Room.findOne({ name: 'Random' }).then(r =>
{
    if (!r) new Room({ name: 'Random' }).save();
});

io.on('connection', (socket) => {
  console.log('A user connected');

  // Room create
  socket.on('createRoom', async (roomName) => {
    if (!roomName) return;
    const exists = await Room.findOne({ name: roomName });
    if (exists) {
        socket.emit('errorMessage', 'Room already exists!');
        return;
    }
    await new Room({ name: roomName }).save();
    const rooms = (await Room.find()).map(r => r.name);
    io.emit('roomList', rooms);
});

  // Room list bhejna
  socket.on('getRooms', async () => {
    const rooms = (await Room.find()).map(r => r.name);
    socket.emit('roomList', rooms);
  });

  // Room join karna
  socket.on('joinRoom', async (room, username) => {
    socket.join(room);
    socket.room = room;
    socket.username = username;

    // User list update (as before)
    if (!usersInRooms[room]) usersInRooms[room] = [];
    if (!usersInRooms[room].includes(username)) usersInRooms[room].push(username);
    io.to(room).emit('userList', usersInRooms[room]);

    // Send message history from DB
    const messages = await Message.find({ room }).limit(50); // last 50 messages
    socket.emit('messageHistory', messages);
});

  // (Optional) Duplicate username check
  socket.on('setUsername', (username) => {
        const allUsers = Object.values(usersInRooms).flat();
        if (allUsers.includes(username)) {
            socket.emit('errorMessage', 'Username already taken!');
        } else {
            socket.username = username;
        }
    });

  socket.on('disconnect', () => {
    const { room, username } = socket;
    if (room && usersInRooms[room]) {
      usersInRooms[room] = usersInRooms[room].filter(u => u !== username);
      io.to(room).emit('userList', usersInRooms[room]);
      // Notify others
      socket.to(room).emit('notification', `${username} left the room.`);
    }
  });

  socket.on('leaveRoom', (room, username) => {
    socket.leave(room);
    if (usersInRooms[room]) {
      usersInRooms[room] = usersInRooms[room].filter(u => u !== username);
      io.to(room).emit('userList', usersInRooms[room]);
    }
    // Notify others
    socket.to(room).emit('notification', `${username} left the room.`);
  });

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(m) {
        return ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[m];
    });
}

  // Message receive & broadcast
  socket.on('chatMessage', async ({ room, username, message, time }) => {
    await new Message({ room, username, message, time }).save();
    io.to(room).emit('chatMessage', { username, message, time });
});

  socket.on('typing', ({ room, username }) => {
        socket.to(room).emit('typing', username);
    });
    socket.on('stopTyping', ({ room, username }) => {
        socket.to(room).emit('stopTyping', username);
    });

    socket.on('deleteRoom', async (room, username) => {
        if (username === 'admin') {
            await Room.deleteOne({ name: room });
            await Message.deleteMany({ room });
            const rooms = (await Room.find()).map(r => r.name);
            io.emit('roomList', rooms);
            io.to(room).emit('roomDeleted', room);
        }
    });
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: 'All fields required.' });
    const exists = await User.findOne({ username });
    if (exists) return res.json({ success: false, message: 'Username already exists.' });
    await new User({ username, password }).save();
    res.json({ success: true });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) return res.json({ success: false, message: 'Invalid credentials.' });
    res.json({ success: true });
});

// GitHub Auth routes only
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/?user=' + encodeURIComponent(req.user.username));
  }
);

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});