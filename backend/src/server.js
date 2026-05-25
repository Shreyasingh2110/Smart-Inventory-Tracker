require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const socketService = require("./socket/socketService");

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

// Initialize Socket.io real-time engine
socketService.init(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});