const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const notifications = {};
const connectedUsers = {}; // Object to store connected users

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("send_notification", (data) => {
    const user_id = data.user_id;
    const message = data.message;

    console.log("Sending notification to " + user_id, message);

    if (!notifications[user_id]) {
      notifications[user_id] = [];
    }
    notifications[user_id].push({ message, read: false });

    io.to(user_id).emit("new_notification", { user_id, notification: message });
  });

  socket.on("join", (user_id) => {
    socket.join(user_id);
    console.log(user_id + " joined the room");

    connectedUsers[socket.id] = user_id; // Store connected user in the object

    const usersInRoom = Object.keys(connectedUsers).map((socketId) => ({
      id: connectedUsers[socketId],
    }));

    io.emit("users_in_room", usersInRoom); // Emit to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");

    if (connectedUsers[socket.id]) {
      delete connectedUsers[socket.id]; // Remove disconnected user from the object

      const usersInRoom = Object.keys(connectedUsers).map((socketId) => ({
        id: connectedUsers[socketId],
      }));

      io.emit("users_in_room", usersInRoom); // Emit updated user list to all clients
    }
  });
});

server.listen(4000, () => {
  console.log("Server listening on port 4000");
});
