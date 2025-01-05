const path = require("path");
const http = require("http");

const express = require("express");
const app = express();
const server = http.createServer(app);
const socketio = require("socket.io");
const formatMessage = require("./utils/message");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const botName = "chatCord Bot";
const io = socketio(server);
app.use(express.json());
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // welcome curret user
    socket.emit("message", formatMessage(botName, "welcome to chat board"));

    // broadcast when auser is connect
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(botName, `${user.username} is connect `));
    // get message chat
    socket.on("chat message", (message) => {
      console.log(socket.id);
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit("message", formatMessage(user, message));
    });

    // send room users
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // run when a user disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user[0].room).emit("roomUsers", {
        room: user[0].room,
        users: getRoomUsers(user[0].room),
      });
      io.to(user[0].room).emit(
        "message",
        formatMessage(botName, `${user[0].username} left the chat `)
      );
    }
  });
});
// set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
  console.log("is run");
});
