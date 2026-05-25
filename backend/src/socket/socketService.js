const socketIO = require("socket.io");

let io;

const init = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Client registers their shop name to enter their specific room partition
    socket.on("join_shop", (shopName) => {
      if (shopName) {
        socket.join(shopName);
        console.log(`🔌 [Socket.io] Client ${socket.id} joined room: ${shopName}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

module.exports = { init, getIO };
