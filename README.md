# Real-Time Chat Application

A modern real-time chat app built with Node.js, Express, and Socket.io.

---

## 🚀 Features

- User authentication (username)
- Create/join chat rooms
- Real-time messaging
- Online users list
- Message history (persistent)
- Notifications (user join/leave)
- Room leave/logout
- Modern responsive UI

---

## 🛠️ How to Run Locally

1. **Clone the repository:**
    ```bash
    git clone github.com/jainnirdesh/WebConnect
    cd Unified Mentor/WebConnect
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Start the server:**
    ```bash
    node server/server.js
    ```
    (Or use `nodemon` for auto-restart during development.)

4. **Open in browser:**
    ```
    http://localhost:3000
    ```
    (Or the port shown in your terminal.)

---

## 📁 Project Structure

```
/public
    /js
        main.js
        websocket.js
        chat.js
    /css
        styles.css
    index.html
/server
    server.js
    messages.json
```

---

## 📝 Notes

- All chat data is stored in `messages.json` (for demo; use a database for production).
- To reset chat history, delete `messages.json` and restart the server.
- For deployment, use services like [Render](https://render.com/), [Railway](https://railway.app/), [Heroku](https://heroku.com/), or your own VPS.

---

## 👤 Author

- Nirdesh Jain
- [GitHub Profile](https://github.com/jainnirdesh)

---

## 📦 License

MIT
