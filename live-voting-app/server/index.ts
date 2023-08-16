const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);

import { Server } from "socket.io";

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let candidates = [
  { id: 0, name: "Donald Trump", votes: 0 },
  { id: 1, name: "Joe Biden", votes: 0 },
  { id: 2, name: "Barack Obama", votes: 0 },
];

io.on("connection", (socket) => {
  console.log("a user connected");

  // Broadcast candidates to the new connection
  io.emit("candidates", candidates);

  socket.on("vote", (id) => {
    // Find the candidate by id and increment votes
    candidates = candidates.map((candidate) =>
      candidate.id === id
        ? { ...candidate, votes: candidate.votes + 1 }
        : candidate
    );

    // Broadcast updated candidates to all clients
    io.emit("candidates", candidates);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3001, () => {
  console.log("listening on *:3001");
});
