const { createServer } = require("http");
const { Server } = require("socket.io");
const { setupWorker } = require("@socket.io/sticky");
const cryptoNode = require("crypto");

const { InMemorySessionStore } = require("./sessionStore");
const { InMemoryMessageStore } = require("./messageStore");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

const randomId = () => cryptoNode.randomBytes(8).toString("hex");

const sessionStore = new InMemorySessionStore();
const messageStore = new InMemoryMessageStore();

io.use(async (socket, next) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = await sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID;
      socket.userID = session.userID;
      socket.username = session.username;
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
});

io.on("connection", async (socket) => {
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  socket.join(socket.userID);

  const users = [];
  const [messages, sessions] = await Promise.all([
    messageStore.findMessagesForUser(socket.userID),
    sessionStore.findAllSessions(),
  ]);

  const messagesPerUser = new Map();
  messages.forEach((message) => {
    const { from, to } = message;
    const otherUser = socket.userID === from ? to : from;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser)?.push(message);
    } else {
      messagesPerUser.set(otherUser, [message]);
    }
  });

  sessions.forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || [],
    });
  });

  console.log("sessions", sessions);
  console.log("users", users);

  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    connected: true,
    messages: [],
  });

  socket.on("private message", ({ content, to }) => {
    const message = {
      content,
      from: socket.userID,
      to,
    };
    io.to(to).to(socket.userID).emit("private message", message);
    messageStore.saveMessage(message);
  });

  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      socket.broadcast.emit("user disconnected", socket.userID);
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
    }
  });
});

setupWorker(io);

// Define types for User and Message
// interface User {
//   userID: string;
//   username: string;
//   connected: boolean;
//   messages: Message[];
// }

// const Message {
//   content: string;
//   from: string;
//   to: string;
// }

// interface PrivateMessage {
//   content: string;
//   to: string;
// }
